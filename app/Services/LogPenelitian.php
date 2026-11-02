<?php

namespace App\Services;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

/**
 * Pencatat data penelitian: setiap interaksi siswa disimpan ke tabel MySQL ds_log
 * (bila database dikonfigurasi) dan selalu juga ke berkas JSONL cadangan.
 */
class LogPenelitian
{
    public const TABEL = 'ds_log';

    /** Apakah database siap dipakai (koneksi berhasil + tabel ada). */
    public function dbSiap(): bool
    {
        if (config('database.connections.mysql.database') === '' || config('database.connections.mysql.username') === '') {
            return false;
        }
        try {
            DB::connection()->getPdo();
            $this->pastikanTabel();

            return true;
        } catch (Throwable $e) {
            $this->keBerkas(['mode' => 'db-galat', 'galat' => mb_substr($e->getMessage(), 0, 300)]);

            return false;
        }
    }

    /**
     * Membuat tabel ds_log bila belum ada. Server hanya menerima unggahan berkas
     * (tanpa `php artisan migrate`), jadi tabel dibuat dari sini; definisinya sama
     * dengan migration database/migrations/*_create_ds_log_table.php.
     */
    public function pastikanTabel(): void
    {
        if (Cache::get('ds_log_siap')) {
            return;
        }
        if (! Schema::hasTable(self::TABEL)) {
            Schema::create(self::TABEL, fn (Blueprint $t) => self::struktur($t));
        }
        Cache::forever('ds_log_siap', true);
    }

    public static function struktur(Blueprint $t): void
    {
        $t->bigIncrements('id');
        $t->dateTime('waktu');
        $t->string('mode', 12);
        $t->string('sesi', 40)->default('');
        $t->string('nama', 40)->default('');
        $t->string('absen', 3)->default('');
        $t->string('sekolah', 60)->default('');
        $t->string('aktivitas', 8);
        $t->unsignedTinyInteger('langkah');
        $t->string('aksi', 20)->default('');
        $t->text('teks_siswa')->nullable();
        $t->text('analisis_cot')->nullable();
        $t->string('level', 12)->nullable();
        $t->boolean('naik')->default(false);
        $t->text('balasan')->nullable();
        $t->string('provider', 20)->nullable();
        $t->string('model', 60)->nullable();
        $t->string('galat', 300)->nullable();
        $t->index(['nama', 'absen'], 'idx_siswa');
        $t->index(['aktivitas', 'langkah'], 'idx_aktivitas');
        $t->index('waktu', 'idx_waktu');
    }

    /** Catat satu interaksi. Kegagalan database tidak pernah mengganggu siswa. */
    public function catat(array $baris): void
    {
        $this->keBerkas($baris);
        if (! $this->dbSiap()) {
            return;
        }
        try {
            $s = $baris['siswa'] ?? [];
            DB::table(self::TABEL)->insert([
                'waktu' => now(),
                'mode' => (string) ($baris['mode'] ?? ''),
                'sesi' => (string) ($baris['sesi'] ?? ''),
                'nama' => (string) ($s['nama'] ?? ''),
                'absen' => (string) ($s['absen'] ?? ''),
                'sekolah' => (string) ($s['sekolah'] ?? ''),
                'aktivitas' => (string) ($baris['aktivitas'] ?? ''),
                'langkah' => (int) ($baris['langkah'] ?? 0),
                'aksi' => (string) ($baris['aksi'] ?? ''),
                'teks_siswa' => $baris['teks_siswa'] ?? null,
                'analisis_cot' => $baris['analisis_cot'] ?? null,
                'level' => $baris['level'] ?? null,
                'naik' => ! empty($baris['naik']),
                'balasan' => $baris['balasan'] ?? null,
                'provider' => $baris['provider'] ?? null,
                'model' => $baris['model'] ?? null,
                'galat' => $baris['galat'] ?? null,
            ]);
        } catch (Throwable $e) {
            Cache::forget('ds_log_siap');
            $this->keBerkas(['mode' => 'db-galat', 'galat' => mb_substr($e->getMessage(), 0, 300)]);
        }
    }

    private function keBerkas(array $baris): void
    {
        $dir = config('detektif.log_dir');
        if (! is_dir($dir) && ! @mkdir($dir, 0750, true)) {
            return;
        }
        $baris = ['waktu' => now()->toIso8601String()] + $baris;
        @file_put_contents(
            $dir . '/tutor-' . now()->format('Y-m') . '.jsonl',
            json_encode($baris, JSON_UNESCAPED_UNICODE) . "\n",
            FILE_APPEND | LOCK_EX
        );
    }
}
