<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Batas permintaan Tutor Nalar per alamat IP.
        RateLimiter::for('tutor', function (Request $request) {
            return Limit::perMinute(max(1, (int) config('detektif.batas_menit')))
                ->by($request->ip())
                ->response(fn () => response()->json(['galat' => 'Terlalu banyak permintaan. Tunggu sebentar, ya.'], 429));
        });
    }
}
