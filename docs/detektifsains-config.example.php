<?php
/**
 * CONTOH konfigurasi Tutor Nalar (Detektif Sains).
 *
 * 1. Salin file ini ke FOLDER HOME akun cPanel (satu tingkat DI ATAS folder
 *    detektifsains.speakverse.id), dengan nama persis:
 *        detektifsains-config.php
 *    Contoh lokasi: /home/NAMAAKUN/detektifsains-config.php
 *    JANGAN letakkan di dalam folder website, agar API key tidak bisa diakses dari internet.
 * 2. Isi provider, api_key, dan model di bawah.
 * 3. Atur izin file ke 600 (File Manager → Permissions).
 *
 * Selama file ini belum ada, tutor berjalan dalam "mode terpandu" (pertanyaan
 * Sokratik yang sudah ditulis per langkah Ennis), dan aplikasi tetap bisa dipakai.
 */
return [
    // Pilih salah satu: 'anthropic' (Claude), 'openai', atau 'gemini'
    'provider' => 'anthropic',

    // API key dari penyedia yang dipilih
    'api_key'  => 'ISI_API_KEY_DI_SINI',

    // Nama model. Kosongkan untuk memakai bawaan:
    //   anthropic → claude-haiku-5-5 | openai → gpt-4o-mini | gemini → gemini-2.5-flash
    // Pastikan nama model masih tersedia di dokumentasi penyedia.
    'model'    => '',

    // Opsional, khusus provider 'openai': URL API lain yang kompatibel dengan OpenAI
    // (misalnya OpenRouter: https://openrouter.ai/api/v1/chat/completions).
    // 'endpoint' => '',

    // Folder log percakapan (data penelitian, format JSONL per bulan). Default: folder home.
    // 'log_dir' => '/home/NAMAAKUN/detektifsains-logs',

    // Batas permintaan per menit per alamat IP (satu kelas di Wi-Fi sekolah biasanya
    // memakai IP yang sama, jadi naikkan bila diperlukan, misalnya 300).
    'batas_menit' => 300,
];
