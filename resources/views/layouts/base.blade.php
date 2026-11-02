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
    /* fetch dengan pengulangan: server hosting sesekali membalas 421 (Misdirected Request)
      . Diulang sampai 3 kali dengan jeda singkat. */
    window.dsFetch = function (url, opsi, sisa) {
      sisa = sisa === undefined ? 3 : sisa;
      return fetch(url, opsi).then(function (r) {
        if (sisa > 0 && r.status === 421) {
          return new Promise(function (ok) { setTimeout(ok, 500 + Math.random() * 700); })
            .then(function () { return window.dsFetch(url, opsi, sisa - 1); });
        }
        return r;
      }, function (e) {
        if (sisa > 0) {
          return new Promise(function (ok) { setTimeout(ok, 800); })
            .then(function () { return window.dsFetch(url, opsi, sisa - 1); });
        }
        throw e;
      });
    };
  </script>
</head>
<body class="@yield('kelas_body')">
@yield('isi')

<script src="{{ \App\Support\Aset::url('assets/js/data.js') }}"></script>
@stack('skrip')
</body>
</html>
