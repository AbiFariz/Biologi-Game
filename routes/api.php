<?php

use App\Http\Controllers\TutorController;
use Illuminate\Support\Facades\Route;

/*
| API Tutor Nalar (prefiks /api, tanpa CSRF).
|   GET  /api/tutor  → status {"llm","db"}
|   POST /api/tutor  → aksi: jawab | petunjuk | belum_paham | cek_alasan | catat
| /api/tutor.php dipertahankan untuk browser yang masih memakai skrip lama.
*/
Route::middleware('throttle:tutor')->group(function () {
    Route::get('/tutor', [TutorController::class, 'status']);
    Route::post('/tutor', [TutorController::class, 'tangani']);
    Route::get('/tutor.php', [TutorController::class, 'status']);
    Route::post('/tutor.php', [TutorController::class, 'tangani']);
});
