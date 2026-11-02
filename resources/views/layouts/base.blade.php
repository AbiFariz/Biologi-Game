<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>@yield('judul') · Detektif Sains</title>
  <meta name="description" content="Media pembelajaran IPA berbasis LLM-CoT untuk siswa SMP kelas IX: Pertumbuhan dan Perkembangan Makhluk Hidup.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">
  <link rel="stylesheet" href="{{ \App\Support\Aset::url('assets/css/style.css') }}">
  @stack('gaya')
  <link rel="icon" href="{{ asset('assets/img/logo.svg') }}" type="image/svg+xml">
  <script>
    /* Alamat yang dipakai skrip halaman (dibuat oleh Laravel). */
    window.DS = {
      api: @json(url('/api/tutor')),
      data: @json(\App\Support\Aset::url('assets/data/aktivitas.json')),
      beranda: @json(route('beranda')),
      materi: @json(route('materi')),
      refleksi: @json(route('refleksi'))
    };
  </script>
</head>
<body class="@yield('kelas_body')">
@yield('isi')

<script src="{{ \App\Support\Aset::url('assets/js/data.js') }}"></script>
@stack('skrip')
</body>
</html>
