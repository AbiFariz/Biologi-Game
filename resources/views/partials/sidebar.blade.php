{{-- Menu samping bersama: Beranda & Refleksi --}}
<nav class="sidebar" aria-label="Menu utama">
    <a class="brand" href="{{ route('beranda') }}">
      <img src="{{ asset('assets/img/logo-white.svg') }}" alt="" width="34" height="34">
      <span>Detektif Sains</span>
    </a>
    <ul class="nav">
      <li><a href="{{ route('beranda') }}" @if($aktif === 'beranda') aria-current="page" @endif>Beranda</a></li>
      <li><a href="{{ route('materi') }}" @if($aktif === 'materi') aria-current="page" @endif>Materi &amp; Tutor Nalar</a></li>
      <li><a href="{{ route('refleksi') }}" @if($aktif === 'refleksi') aria-current="page" @endif>Refleksi Saya</a></li>
    </ul>
    <div class="class-card">
      <strong>Kelas IX · IPA</strong>
      <span id="sekolah-label">Sekolah belum diisi</span>
      @if($aktif === 'beranda')
      <button type="button" class="link-btn" id="ubah-profil">Ubah profil</button>
      @endif
    </div>
  </nav>
