<?php

namespace App\Support;

/**
 * URL aset statis dengan penanda versi (waktu ubah berkas) agar browser
 * siswa selalu mengambil versi terbaru setelah update.
 */
class Aset
{
    public static function url(string $path): string
    {
        $berkas = public_path($path);
        $versi = is_file($berkas) ? filemtime($berkas) : '0';

        return asset($path) . '?v=' . $versi;
    }
}
