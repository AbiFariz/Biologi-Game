{{-- Header bersama: Beranda & Refleksi (nama kelas .sidebar dipertahankan untuk CSS lama) --}}
<header class="sidebar">
    <a class="brand" href="{{ route('beranda') }}">
      <img src="{{ asset('assets/img/logo-white.svg') }}" alt="" width="30" height="30">
      <span>Detektif Sains</span>
    </a>
    <nav aria-label="Menu utama">
      <ul class="nav">
        <li><a href="{{ route('beranda') }}" @if($aktif === 'beranda') aria-current="page" @endif>Beranda</a></li>
        <li><a href="{{ route('materi') }}" @if($aktif === 'materi') aria-current="page" @endif>Materi &amp; Tutor Nalar</a></li>
        <li><a href="{{ route('refleksi') }}" @if($aktif === 'refleksi') aria-current="page" @endif>Refleksi Saya</a></li>
      </ul>
    </nav>
    <div class="class-card">
      <strong>Kelas IX · IPA</strong>
      <span id="sekolah-label">Sekolah belum diisi</span>
      @if($aktif === 'beranda')
      <button type="button" class="link-btn" id="ubah-profil">Ubah profil</button>
      @endif
    </div>
  </header>
