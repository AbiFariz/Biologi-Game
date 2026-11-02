@extends('layouts.base')

@section('judul', 'Refleksi Saya')

@push('gaya')
  <link rel="stylesheet" href="{{ \App\Support\Aset::url('assets/css/refleksi.css') }}">
@endpush

@section('isi')
<div class="layout">

  @include('partials.sidebar', ['aktif' => 'refleksi'])

  <main class="main" id="konten">
    <header>
      <p class="eyebrow" id="eyebrow">Refleksi</p>
      <h1 id="judul">Bagaimana caramu berpikir hari ini?</h1>
    </header>

    <nav class="r-tabs" id="tab-aktivitas" aria-label="Pilih aktivitas"></nav>

    <section class="panel r-empty" id="kosong" hidden>
      <h2 class="section-title-sm">Belum ada aktivitas yang selesai</h2>
      <p>Selesaikan satu aktivitas bersama Tutor Nalar sampai kamu menulis kesimpulan. Setelah itu, jejak berpikirmu akan muncul di sini.</p>
      <a class="btn btn-primary" href="{{ route('materi', ['sub' => 'tumbuhan']) }}">Mulai aktivitas</a>
    </section>

    <div class="r-grid" id="isi" hidden>
      <section class="panel" aria-labelledby="judul-jejak">
        <div class="r-head">
          <h2 id="judul-jejak" class="section-title-sm">Jejak berpikir kritismu</h2>
          <span class="r-legend">Indikator Ennis (2011) · Mulai · Berkembang · Mahir</span>
        </div>
        <ol class="r-list" id="jejak"></ol>
        <p class="r-note" id="catatan-mode"></p>
      </section>

      <div class="r-side">
        <section class="r-kesimpulan" aria-labelledby="judul-kesimpulan" id="kotak-kesimpulan">
          <span class="pill pill-accent" id="judul-kesimpulan">KESIMPULANMU</span>
          <div id="daftar-kesimpulan"></div>
        </section>

        <section class="panel" aria-labelledby="judul-jurnal" id="kotak-jurnal">
          <h2 id="judul-jurnal" class="section-title-sm">Jurnal refleksi</h2>
          <form id="form-jurnal" class="r-form">
            <label for="r1">Bagian mana yang paling membuatmu berpikir keras?</label>
            <textarea id="r1" name="r1" rows="2" maxlength="400"></textarea>
            <label for="r2">Apakah dugaan awalmu berubah setelah berdiskusi? Mengapa?</label>
            <textarea id="r2" name="r2" rows="2" maxlength="400"></textarea>
            <label for="r3">Apa yang akan kamu lakukan berbeda di aktivitas berikutnya?</label>
            <textarea id="r3" name="r3" rows="2" maxlength="400"></textarea>
            <p class="r-msg" id="pesan-jurnal" role="status"></p>
            <button type="submit" class="btn btn-primary">Simpan refleksi</button>
          </form>
          <a class="btn btn-accent r-next" id="lanjut" href="{{ route('beranda') }}" hidden>Lanjut</a>
        </section>
      </div>
    </div>

    <footer class="foot">Media penelitian skripsi · Pengaruh Media IPA Berbasis LLM-CoT dalam Meningkatkan Critical Thinking Siswa SMP</footer>
  </main>
</div>
@endsection

@push('skrip')
<script src="{{ \App\Support\Aset::url('assets/js/refleksi.js') }}"></script>
@endpush
