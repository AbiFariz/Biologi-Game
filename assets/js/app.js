/* NalarTumbuh — Modul 1: Beranda */
(function () {
  'use strict';

  var data = window.NT_DATA;
  var KUNCI_PROFIL = 'nt_profil';
  var KUNCI_PROGRES = 'nt_progres';

  /* ---------- penyimpanan lokal (aman bila diblokir) ---------- */
  function baca(kunci, cadangan) {
    try {
      var v = localStorage.getItem(kunci);
      return v ? JSON.parse(v) : cadangan;
    } catch (e) { return cadangan; }
  }
  function simpan(kunci, nilai) {
    try { localStorage.setItem(kunci, JSON.stringify(nilai)); } catch (e) { /* abaikan */ }
  }

  /* ---------- ikon ---------- */
  var IKON = {
    tumbuhan: '<path d="M12 21v-9"/><path d="M12 12c0-4 3-6 7-6 0 4-3 6-7 6z"/><path d="M12 15c0-3-2.5-5-6-5 0 3 2.5 5 6 5z"/><path d="M6 21h12"/>',
    hewan: '<path d="M12 6v14"/><path d="M12 9c-2-4-7-4-8-1s2 6 8 5"/><path d="M12 9c2-4 7-4 8-1s-2 6-8 5"/><path d="M10 4l2 2 2-2"/>',
    manusia: '<circle cx="8" cy="6" r="2.5"/><path d="M8 9v6M5 21l3-6 3 6"/><circle cx="17" cy="8" r="2"/><path d="M17 10v5M15 21l2-6 2 6"/>'
  };
  function svgIkon(nama) {
    return '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IKON[nama] + '</svg>';
  }

  function el(tag, kelas, teks) {
    var n = document.createElement(tag);
    if (kelas) n.className = kelas;
    if (teks != null) n.textContent = teks;
    return n;
  }

  /* ---------- tanggal ---------- */
  function tampilTanggal() {
    var t = new Date();
    var teks;
    try {
      teks = t.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch (e) { teks = t.toDateString(); }
    document.getElementById('tanggal').textContent = teks.charAt(0).toUpperCase() + teks.slice(1);
  }

  /* ---------- kartu submateri ---------- */
  function renderSubmateri(filter) {
    var wadah = document.getElementById('daftar-submateri');
    var progres = baca(KUNCI_PROGRES, {});
    var q = (filter || '').trim().toLowerCase();
    wadah.textContent = '';
    var tampil = 0;

    data.submateri.forEach(function (s) {
      if (q && (s.judul + ' ' + s.ringkas).toLowerCase().indexOf(q) === -1) return;
      tampil++;

      var selesai = Math.min(progres[s.id] || 0, s.jumlahAktivitas);
      var persen = Math.round((selesai / s.jumlahAktivitas) * 100);
      var status = selesai === 0 ? 'Belum dimulai' : (selesai >= s.jumlahAktivitas ? 'Selesai' : 'Sedang dipelajari');

      var kartu = s.tautan ? el('a', 'card') : el('article', 'card');
      if (s.tautan) kartu.href = s.tautan;

      var ikon = el('div', 'card-icon ' + s.tone);
      ikon.innerHTML = svgIkon(s.ikon); // ikon statis milik sendiri, bukan input pengguna
      kartu.appendChild(ikon);
      kartu.appendChild(el('h3', null, s.judul));
      kartu.appendChild(el('p', null, s.ringkas));

      var pr = el('div', 'progress');
      var meta = el('div', 'progress-meta');
      meta.appendChild(el('span', null, s.tautan ? status : 'Segera hadir'));
      meta.appendChild(el('span', null, selesai + ' / ' + s.jumlahAktivitas + ' aktivitas'));
      var bar = el('div', 'bar');
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
      bar.setAttribute('aria-valuenow', String(persen));
      bar.setAttribute('aria-label', 'Progres ' + s.judul);
      var isi = el('span');
      isi.style.width = persen + '%';
      bar.appendChild(isi);
      pr.appendChild(meta);
      pr.appendChild(bar);
      kartu.appendChild(pr);

      wadah.appendChild(kartu);
    });

    document.getElementById('kosong').hidden = tampil !== 0;
  }

  /* ---------- langkah berpikir (Ennis, 2011) ---------- */
  function renderLangkah() {
    var ol = document.getElementById('langkah');
    data.langkah.forEach(function (l) {
      var li = el('li');
      li.appendChild(el('strong', null, l.no + ' · ' + l.nama));
      li.appendChild(document.createTextNode(l.tanya));
      li.appendChild(el('span', 'ennis', l.ennis));
      ol.appendChild(li);
    });
  }

  /* ---------- profil siswa ---------- */
  function terapkanProfil(p) {
    document.getElementById('nama-siswa').textContent = (p && p.nama) || 'Siswa';
    document.getElementById('sekolah-label').textContent = (p && p.sekolah) || 'Sekolah belum diisi';
  }

  function siapkanProfil() {
    var dialog = document.getElementById('profil-dialog');
    var form = document.getElementById('profil-form');
    var profil = baca(KUNCI_PROFIL, null);
    terapkanProfil(profil);

    function buka() {
      var p = baca(KUNCI_PROFIL, {}) || {};
      form.nama.value = p.nama || '';
      form.absen.value = p.absen || '';
      form.sekolah.value = p.sekolah || '';
      if (typeof dialog.showModal === 'function') dialog.showModal();
    }

    form.addEventListener('submit', function () {
      var p = {
        nama: form.nama.value.trim(),
        absen: form.absen.value.trim(),
        sekolah: form.sekolah.value.trim()
      };
      simpan(KUNCI_PROFIL, p);
      terapkanProfil(p);
    });

    document.getElementById('ubah-profil').addEventListener('click', buka);
    if (!profil || !profil.nama) buka();
  }

  /* ---------- mulai ---------- */
  tampilTanggal();
  renderSubmateri('');
  renderLangkah();
  siapkanProfil();
  document.getElementById('cari').addEventListener('input', function (e) {
    renderSubmateri(e.target.value);
  });
})();
