<?php

/*
| Konfigurasi Tutor Nalar (Detektif Sains). Nilai dibaca dari .env di server.
| .env dibuat otomatis pada permintaan pertama dari detektifsains-config.php
| (lihat bootstrap/siapkan-env.php), lalu boleh diubah langsung.
*/
return [
    // anthropic | openai | gemini — kosong = mode terpandu
    'provider' => env('LLM_PROVIDER', ''),
    'api_key' => env('LLM_API_KEY', ''),
    'model' => env('LLM_MODEL', ''),
    // Opsional (khusus openai): URL API lain yang kompatibel OpenAI, mis. OpenRouter
    'endpoint' => env('LLM_ENDPOINT', ''),
    'timeout' => (int) env('LLM_TIMEOUT', 30),

    // Batas permintaan per menit per IP (satu kelas sering berbagi IP Wi-Fi)
    'batas_menit' => (int) env('TUTOR_BATAS_MENIT', 300),

    // Berkas log cadangan (JSONL per bulan), di luar folder public
    'log_dir' => env('TUTOR_LOG_DIR', base_path('detektifsains-logs')),
];
