<?php

/*
|--------------------------------------------------------------------------
| Membuat / memperbarui .env secara otomatis di server
|--------------------------------------------------------------------------
| Hosting hanya menerima unggahan berkas (tanpa terminal), dan rahasia
| (password database, API key) tidak boleh ada di GitHub. Karena itu .env
| disusun di server dari detektifsains-config.php, yang dicari di folder
| aplikasi (di atas public/) lalu folder home akun.
|
| - .env belum ada                     → dibuat, dengan APP_KEY acak baru.
| - detektifsains-config.php lebih baru → .env disusun ulang, APP_KEY lama dipertahankan.
| - tidak ada detektifsains-config.php  → .env dasar (mode terpandu, tanpa database).
|
| Jadi cukup ubah detektifsains-config.php; .env ikut diperbarui otomatis.
*/

(function () {
    $basis = dirname(__DIR__);
    $env = $basis . '/.env';

    $berkasCfg = null;
    foreach ([$basis, dirname($basis)] as $dir) {
        if (is_file($dir . '/detektifsains-config.php')) {
            $berkasCfg = $dir . '/detektifsains-config.php';
            break;
        }
    }

    if (is_file($env) && (! $berkasCfg || filemtime($berkasCfg) <= filemtime($env))) {
        return;
    }

    $cfg = [];
    if ($berkasCfg) {
        $isi = include $berkasCfg;
        if (is_array($isi)) {
            $cfg = $isi;
        }
    }

    // Pertahankan APP_KEY lama bila .env sudah ada.
    $kunci = '';
    if (is_file($env) && preg_match('/^APP_KEY=(.*)$/m', (string) file_get_contents($env), $m)) {
        $kunci = trim($m[1], " '\"");
    }
    if ($kunci === '') {
        $kunci = 'base64:' . base64_encode(random_bytes(32));
    }

    $kutip = fn ($v) => "'" . str_replace(['\\', "'"], ['\\\\', "\\'"], (string) $v) . "'";
    $host = $_SERVER['HTTP_HOST'] ?? 'detektifsains.speakverse.id';

    $baris = [
        'APP_NAME' => 'Detektif Sains',
        'APP_ENV' => 'production',
        'APP_KEY' => $kunci,
        'APP_DEBUG' => 'false',
        'APP_URL' => 'https://' . preg_replace('/[^a-z0-9.\-:]/i', '', $host),
        'APP_TIMEZONE' => 'Asia/Jakarta',
        'APP_LOCALE' => 'id',
        'LOG_CHANNEL' => 'daily',
        'LOG_LEVEL' => 'error',
        'SESSION_DRIVER' => 'array',
        'CACHE_STORE' => 'file',
        'QUEUE_CONNECTION' => 'sync',
        'DB_CONNECTION' => 'mysql',
        'DB_HOST' => $cfg['db_host'] ?? 'localhost',
        'DB_PORT' => $cfg['db_port'] ?? '3306',
        'DB_DATABASE' => $cfg['db_name'] ?? '',
        'DB_USERNAME' => $cfg['db_user'] ?? '',
        'DB_PASSWORD' => $cfg['db_pass'] ?? '',
        'LLM_PROVIDER' => $cfg['provider'] ?? '',
        'LLM_API_KEY' => $cfg['api_key'] ?? '',
        'LLM_MODEL' => $cfg['model'] ?? '',
        'LLM_ENDPOINT' => $cfg['endpoint'] ?? '',
        'LLM_TIMEOUT' => $cfg['timeout'] ?? 30,
        'TUTOR_BATAS_MENIT' => $cfg['batas_menit'] ?? 300,
    ];
    if (! empty($cfg['log_dir'])) {
        $baris['TUTOR_LOG_DIR'] = $cfg['log_dir'];
    }

    $teks = "# Dibuat otomatis dari detektifsains-config.php — ubah berkas itu, bukan berkas ini.\n";
    foreach ($baris as $k => $v) {
        $teks .= $k . '=' . (in_array($k, ['APP_DEBUG'], true) ? $v : $kutip($v)) . "\n";
    }

    if (@file_put_contents($env, $teks, LOCK_EX) !== false) {
        @chmod($env, 0600);
        @touch($env); // lebih baru dari berkas konfigurasi
    }
})();
