<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
| Halaman siswa Detektif Sains.
| Konten aktivitas dibaca oleh skrip halaman dari public/assets/data/aktivitas.json.
*/
Route::view('/', 'beranda')->name('beranda');
Route::view('/materi', 'materi')->name('materi');
Route::view('/refleksi', 'refleksi')->name('refleksi');

/* Alamat lama (versi HTML) tetap berfungsi: dialihkan ke halaman Laravel. */
$alihkan = fn (string $rute) => fn (Request $r) => redirect()->to(
    route($rute) . ($r->getQueryString() ? '?' . $r->getQueryString() : ''),
    301
);
Route::get('/index.html', $alihkan('beranda'));
Route::get('/materi.html', $alihkan('materi'));
Route::get('/refleksi.html', $alihkan('refleksi'));
