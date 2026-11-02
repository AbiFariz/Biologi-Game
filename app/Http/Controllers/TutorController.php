<?php

namespace App\Http\Controllers;

use App\Services\LogPenelitian;
use App\Services\TutorLlm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class TutorController extends Controller
{
    private const MAKS_PESAN = 24;
    private const MAKS_TEKS = 800;
    private const AKSI_VALID = ['jawab', 'petunjuk', 'belum_paham', 'cek_alasan', 'catat'];

    public function __construct(private TutorLlm $llm, private LogPenelitian $log)
    {
    }

    /** GET /api/tutor — apakah tutor AI dan database siap. */
    public function status(): JsonResponse
    {
        return $this->json(['llm' => $this->llm->aktif(), 'db' => $this->log->dbSiap()]);
    }

    /** POST /api/tutor — jawab siswa (mode AI) atau catat interaksi (mode terpandu). */
    public function tangani(Request $request): JsonResponse
    {
        $in = $request->json()->all();
        if (! is_array($in) || $in === []) {
            return $this->json(['galat' => 'Format permintaan tidak valid'], 400);
        }

        $aksi = (string) ($in['aksi'] ?? '');
        if (! in_array($aksi, self::AKSI_VALID, true)) {
            return $this->json(['galat' => 'Aksi tidak dikenal'], 400);
        }

        [$akt, $namaSub] = $this->cariAktivitas((string) ($in['aktivitas'] ?? ''));
        if (! $akt) {
            return $this->json(['galat' => 'Aktivitas tidak ditemukan'], 400);
        }

        $langkah = (int) ($in['langkah'] ?? 0);
        if ($langkah < 1 || $langkah > 5) {
            return $this->json(['galat' => 'Langkah tidak valid'], 400);
        }

        $siswa = [
            'nama' => $this->teks($in['siswa']['nama'] ?? '', 40),
            'absen' => $this->teks($in['siswa']['absen'] ?? '', 3),
            'sekolah' => $this->teks($in['siswa']['sekolah'] ?? '', 60),
        ];
        $sesi = preg_replace('/[^a-z0-9]/i', '', $this->teks($in['sesi'] ?? '', 40));

        /* Mode terpandu (atau kesimpulan/refleksi): hanya dicatat. */
        if ($aksi === 'catat') {
            $c = is_array($in['catatan'] ?? null) ? $in['catatan'] : [];
            $this->log->catat([
                'mode' => ($c['mode'] ?? '') === 'llm' ? 'llm' : 'terpandu',
                'sesi' => $sesi, 'siswa' => $siswa, 'aktivitas' => $akt['id'], 'langkah' => $langkah,
                'aksi' => $this->teks($c['aksi_siswa'] ?? '', 20),
                'teks_siswa' => $this->teks($c['teks_siswa'] ?? ''),
                'balasan' => $this->teks($c['balasan'] ?? ''),
                'level' => $this->teks($c['level'] ?? '', 12) ?: null,
                'naik' => (bool) ($c['naik'] ?? false),
            ]);

            return $this->json(['ok' => true]);
        }

        if (! $this->llm->aktif()) {
            return $this->json(['galat' => 'Tutor AI belum dikonfigurasi'], 503);
        }

        $riwayat = $this->riwayat(is_array($in['pesan'] ?? null) ? $in['pesan'] : []);
        $teksSiswa = end($riwayat)['content'];

        try {
            $hasil = $this->llm->tanya($this->llm->promptSistem($akt, $namaSub, $langkah, $aksi), $riwayat);
        } catch (Throwable $e) {
            $this->log->catat([
                'mode' => 'llm-galat', 'sesi' => $sesi, 'siswa' => $siswa, 'aktivitas' => $akt['id'],
                'langkah' => $langkah, 'aksi' => $aksi, 'galat' => mb_substr($e->getMessage(), 0, 300),
            ]);

            return $this->json(['galat' => 'Tutor AI sedang tidak tersedia'], 502);
        }

        $level = in_array($hasil['level'] ?? null, ['Mulai', 'Berkembang', 'Mahir'], true) ? $hasil['level'] : null;
        $naik = $aksi === 'jawab' && ($hasil['naik'] ?? false) === true;
        if ($aksi !== 'jawab') {
            $level = null;
        }
        $pesan = mb_substr(trim((string) $hasil['pesan']), 0, 1200);

        $this->log->catat([
            'mode' => 'llm', 'provider' => $this->llm->provider(), 'model' => $this->llm->model(),
            'sesi' => $sesi, 'siswa' => $siswa, 'aktivitas' => $akt['id'], 'langkah' => $langkah, 'aksi' => $aksi,
            'teks_siswa' => $teksSiswa, 'analisis_cot' => mb_substr((string) ($hasil['analisis'] ?? ''), 0, 2000),
            'level' => $level, 'naik' => $naik, 'balasan' => $pesan,
        ]);

        return $this->json(['pesan' => $pesan, 'level' => $level, 'naik' => $naik]);
    }

    /** @return array{0: ?array, 1: string} */
    private function cariAktivitas(string $id): array
    {
        $data = json_decode((string) @file_get_contents(public_path('assets/data/aktivitas.json')), true);
        foreach (($data['submateri'] ?? []) as $sub) {
            foreach ($sub['aktivitas'] as $a) {
                if ($a['id'] === $id) {
                    return [$a, $sub['judul']];
                }
            }
        }

        return [null, ''];
    }

    /** Riwayat percakapan untuk LLM: peran bergantian, diawali dan diakhiri pesan siswa. */
    private function riwayat(array $pesan): array
    {
        $r = [];
        foreach (array_slice($pesan, -self::MAKS_PESAN) as $m) {
            $peran = ($m['peran'] ?? '') === 'siswa' ? 'user' : 'assistant';
            $t = $this->teks($m['teks'] ?? '');
            if ($t === '') {
                continue;
            }
            if ($r && end($r)['role'] === $peran) {
                $r[count($r) - 1]['content'] .= "\n" . $t;
            } else {
                $r[] = ['role' => $peran, 'content' => $t];
            }
        }
        if (! $r || $r[0]['role'] !== 'user') {
            array_unshift($r, ['role' => 'user', 'content' => '(Siswa membuka aktivitas.)']);
        }
        if (end($r)['role'] !== 'user') {
            $r[] = ['role' => 'user', 'content' => '(Siswa menekan tombol.)'];
        }

        return $r;
    }

    private function teks(mixed $v, int $maks = self::MAKS_TEKS): string
    {
        $s = is_string($v) ? $v : '';
        $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';

        return mb_substr(trim($s), 0, $maks);
    }

    private function json(array $data, int $kode = 200): JsonResponse
    {
        return response()->json($data, $kode, ['Cache-Control' => 'no-store'], JSON_UNESCAPED_UNICODE);
    }
}
