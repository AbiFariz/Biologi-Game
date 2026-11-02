<?php

use App\Services\LogPenelitian;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

/*
| Tabel log penelitian Detektif Sains.
| Di hosting (tanpa akses `php artisan migrate`), tabel yang sama dibuat otomatis
| oleh App\Services\LogPenelitian::pastikanTabel() pada permintaan pertama.
*/
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable(LogPenelitian::TABEL)) {
            Schema::create(LogPenelitian::TABEL, fn ($t) => LogPenelitian::struktur($t));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists(LogPenelitian::TABEL);
    }
};
