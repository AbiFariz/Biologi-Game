/* Detektif Sains — Modul 3: Refleksi & indikator Ennis (2011)
 * Membaca hasil aktivitas dari localStorage (ditulis oleh materi.js):
 *   nt_aktivitas_<id> = { langkah, level:{1..5}, pesan:[...], kesimpulan, selesai, refleksi }
 */
(function () {
  'use strict';

  var LANGKAH = window.NT_DATA.langkah;
  var SKOR = { Mulai: 1, Berkembang: 2, Mahir: 3 };
  var NAMA_LEVEL = ['', 'Mulai', 'Berkembang', 'Mahir'];
  var params = new URLSearchParams(location.search);
  var $ = function (id) { return document.getElementById(id); };

  function baca(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function simpan(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function kunci(id) { return 'nt_aktivitas_' + id; }
  function el(tag, kelas, teks) { var n = document.createElement(tag); if (kelas) n.className = kelas; if (teks != null) n.textContent = teks; return n; }

  var semua = [];    // [{sub, subJudul, akt, st}] untuk aktivitas yang selesai
  var urutan = [];   // semua aktivitas (untuk mencari aktivitas berikutnya)
  var aktif = null;  // item terpilih, null = ringkasan

  var profil = baca('nt_profil', {}) || {};
  $('sekolah-label').textContent = profil.sekolah || 'Sekolah belum diisi';

  /* ---------- bantu ---------- */
  function buktiLangkah(st, no) {
    var jawab = '';
    (st.pesan || []).forEach(function (m) {
      if (m.peran === 'siswa' && m.langkah === no && !m.tombol) jawab = m.teks;
    });
    return jawab;
  }

  function levelDots(skor) {
    var w = el('div', 'r-level');
    var label = skor ? NAMA_LEVEL[skor] : 'Belum ada';
    w.setAttribute('role', 'img');
    w.setAttribute('aria-label', 'Level: ' + label);
    for (var i = 1; i <= 3; i++) w.appendChild(el('span', 'r-dot' + (skor && i <= skor ? ' on' : '')));
    w.appendChild(el('span', 'r-label', label));
    return w;
  }

  function baris(l, bukti, skor, kosong) {
    var li = el('li', 'r-item');
    var info = el('div', 'r-info');
    info.appendChild(el('div', 'r-nama', l.no + '. ' + l.ennis));
    info.appendChild(el('div', 'r-arti', l.arti));
    var b = el('p', 'r-bukti' + (kosong ? ' kosong' : ''), bukti);
    info.appendChild(b);
    li.appendChild(info);
    li.appendChild(levelDots(skor));
    return li;
  }

  /* ---------- tampilan ---------- */
  function renderTabs() {
    var nav = $('tab-aktivitas'); nav.textContent = '';
    if (semua.length > 1) {
      var r = el('a', 'r-tab', 'Ringkasan semua aktivitas');
      r.href = 'refleksi.html';
      if (!aktif) r.setAttribute('aria-current', 'page');
      nav.appendChild(r);
    }
    semua.forEach(function (it) {
      var t = el('a', 'r-tab', it.akt.no + '. ' + it.akt.judul);
      t.href = 'refleksi.html?a=' + encodeURIComponent(it.akt.id);
      if (aktif === it) t.setAttribute('aria-current', 'page');
      nav.appendChild(t);
    });
  }

  function renderSatu(it) {
    $('eyebrow').textContent = it.subJudul + ' · Aktivitas ' + it.akt.no + ': ' + it.akt.judul + ' · selesai';
    $('judul').textContent = 'Bagaimana caramu berpikir hari ini?';
    var ol = $('jejak'); ol.textContent = '';
    LANGKAH.forEach(function (l) {
      var j = buktiLangkah(it.st, l.no);
      var skor = SKOR[(it.st.level || {})[l.no]] || 0;
      ol.appendChild(baris(l, j ? '“' + j + '”' : 'Belum ada jawaban yang tercatat untuk langkah ini.', skor, !j));
    });
    $('catatan-mode').textContent = it.st.mode === 'llm'
      ? 'Level dinilai oleh Tutor AI berdasarkan jawabanmu di setiap langkah.'
      : 'Level diperkirakan dari kelengkapan alasan dalam jawabanmu (mode terpandu).';

    var dk = $('daftar-kesimpulan'); dk.textContent = '';
    dk.appendChild(el('p', 'r-kes-item', it.st.kesimpulan ? '“' + it.st.kesimpulan + '”' : 'Kesimpulan belum ditulis.'));

    $('kotak-jurnal').hidden = false;
    var r = it.st.refleksi || {};
    ['r1', 'r2', 'r3'].forEach(function (k) { $(k).value = r[k] || ''; });
    $('pesan-jurnal').textContent = r.waktu ? 'Refleksi tersimpan ✓' : '';
    $('pesan-jurnal').className = 'r-msg';
    aturLanjut(!!r.waktu);
  }

  function renderRingkasan() {
    $('eyebrow').textContent = 'Ringkasan · ' + semua.length + ' aktivitas selesai';
    $('judul').textContent = 'Perkembangan berpikir kritismu';
    var ol = $('jejak'); ol.textContent = '';
    LANGKAH.forEach(function (l) {
      var hitung = { 1: 0, 2: 0, 3: 0 }, total = 0, n = 0;
      semua.forEach(function (it) {
        var s = SKOR[(it.st.level || {})[l.no]];
        if (s) { hitung[s]++; total += s; n++; }
      });
      var bagian = [];
      if (hitung[3]) bagian.push('Mahir di ' + hitung[3]);
      if (hitung[2]) bagian.push('Berkembang di ' + hitung[2]);
      if (hitung[1]) bagian.push('Mulai di ' + hitung[1]);
      var teks = n ? bagian.join(', ') + ' dari ' + semua.length + ' aktivitas.' : 'Belum ada penilaian untuk indikator ini.';
      ol.appendChild(baris(l, teks, n ? Math.round(total / n - 0.01) : 0, !n));
    });
    $('catatan-mode').textContent = 'Level ringkasan adalah rata-rata level dari semua aktivitas yang sudah selesai (nilai tengah dibulatkan ke bawah).';

    var dk = $('daftar-kesimpulan'); dk.textContent = '';
    semua.forEach(function (it) {
      var p = el('p', 'r-kes-item');
      p.appendChild(el('small', null, 'Aktivitas ' + it.akt.no + ': ' + it.akt.judul));
      p.appendChild(document.createTextNode(it.st.kesimpulan ? '“' + it.st.kesimpulan + '”' : 'Kesimpulan belum ditulis.'));
      dk.appendChild(p);
    });
    $('kotak-jurnal').hidden = true;
  }

  function aturLanjut(tampil) {
    var a = $('lanjut');
    var berikut = null;
    for (var i = 0; i < urutan.length; i++) {
      var s = baca(kunci(urutan[i].akt.id), null);
      if (!(s && s.selesai)) { berikut = urutan[i]; break; }
    }
    if (berikut) {
      a.href = 'materi.html?sub=' + encodeURIComponent(berikut.sub) + '&a=' + encodeURIComponent(berikut.akt.id);
      a.textContent = 'Lanjut ke Aktivitas ' + berikut.akt.no + ': ' + berikut.akt.judul + ' →';
    } else {
      a.href = 'refleksi.html';
      a.textContent = 'Semua aktivitas selesai · Lihat ringkasan →';
    }
    a.hidden = !tampil;
  }

  /* ---------- jurnal ---------- */
  $('form-jurnal').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!aktif) return;
    var r = { r1: $('r1').value.trim(), r2: $('r2').value.trim(), r3: $('r3').value.trim() };
    var msg = $('pesan-jurnal');
    if (!r.r1 || !r.r2 || !r.r3) {
      msg.textContent = 'Isi ketiga pertanyaan dulu, ya. Satu kalimat jujur sudah cukup.';
      msg.className = 'r-msg warn';
      return;
    }
    r.waktu = new Date().toISOString();
    aktif.st.refleksi = r;
    simpan(kunci(aktif.akt.id), aktif.st);
    msg.textContent = 'Refleksi tersimpan ✓';
    msg.className = 'r-msg';
    aturLanjut(true);
    try {
      fetch('api/tutor.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
        body: JSON.stringify({
          aksi: 'catat', aktivitas: aktif.akt.id, langkah: 5, sesi: aktif.st.sesi || '',
          siswa: { nama: profil.nama || '', absen: profil.absen || '', sekolah: profil.sekolah || '' },
          catatan: { mode: aktif.st.mode || 'terpandu', aksi_siswa: 'refleksi',
            teks_siswa: ('1) ' + r.r1 + ' | 2) ' + r.r2 + ' | 3) ' + r.r3).slice(0, 800), balasan: '', naik: false }
        })
      }).catch(function () {});
    } catch (err) {}
  });

  /* ---------- mulai ---------- */
  fetch('assets/data/aktivitas.json?v=__VER__', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function (data) {
      Object.keys(data.submateri).forEach(function (sub) {
        var s = data.submateri[sub];
        s.aktivitas.forEach(function (a) {
          var item = { sub: sub, subJudul: s.judul, akt: a, st: baca(kunci(a.id), null) };
          urutan.push(item);
          if (item.st && item.st.selesai) semua.push(item);
        });
      });
      if (!semua.length) { $('kosong').hidden = false; $('tab-aktivitas').hidden = true; return; }
      var pilih = params.get('a');
      aktif = semua.filter(function (it) { return it.akt.id === pilih; })[0] || null;
      if (!aktif && semua.length === 1) aktif = semua[0];
      $('isi').hidden = false;
      renderTabs();
      if (aktif) renderSatu(aktif); else renderRingkasan();
    })
    .catch(function () {
      $('kosong').hidden = false;
      $('kosong').querySelector('p').textContent = 'Data materi gagal dimuat. Periksa koneksi internetmu, lalu muat ulang halaman.';
    });
})();
