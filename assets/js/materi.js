/* Detektif Sains — Modul 2: Materi + Tutor Nalar (LLM-CoT)
 * - Memuat aktivitas dari assets/data/aktivitas.json
 * - Tutor membimbing 5 langkah berpikir kritis Ennis (2011)
 * - Mode LLM bila api/tutor.php sudah dikonfigurasi; selain itu mode terpandu
 */
(function () {
  'use strict';

  var LANGKAH = window.NT_DATA.langkah;
  var API = 'api/tutor.php';
  var params = new URLSearchParams(location.search);
  var subId = params.get('sub') || 'tumbuhan';

  var dataSub = null;      // isi submateri dari JSON
  var akt = null;          // aktivitas aktif
  var st = null;           // state aktivitas aktif
  var modeLLM = false;
  var sibuk = false;

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- penyimpanan ---------- */
  function baca(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function simpan(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function kunciAkt(id) { return 'nt_aktivitas_' + id; }
  function idSesi() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function stateAwal() {
    return { langkah: 1, tahap5Selesai: false, selesai: false, pesan: [], level: {}, kesimpulan: '', sesi: idSesi() };
  }
  function simpanState() { simpan(kunciAkt(akt.id), st); }

  function hitungProgres() {
    var n = 0;
    dataSub.aktivitas.forEach(function (a) { var s = baca(kunciAkt(a.id), null); if (s && s.selesai) n++; });
    var p = baca('nt_progres', {}); p[subId] = n; simpan('nt_progres', p);
    return n;
  }

  /* ---------- ilustrasi ---------- */
  var POT = '<path d="M45 100 H105 L98 126 H52 Z" fill="#B5643A"/>';
  var CAWAN = '<ellipse cx="75" cy="96" rx="62" ry="16" fill="#D9E3EA"/><ellipse cx="75" cy="92" rx="56" ry="12" fill="#F4F7F9"/>';
  function kecambah(x, y, tinggi) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="4.5" ry="3.2" fill="#8DAA3F"/>' +
      '<path d="M' + x + ' ' + (y - 2) + ' q 2 -' + tinggi / 2 + ' -2 -' + tinggi + '" stroke="#5E9B4F" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + (x - 2) + ' ' + (y - tinggi - 2) + ' c -5 -3 -7 0 -6 2 c 3 1 5 0 6 -2 z M' + (x - 2) + ' ' + (y - tinggi - 2) + ' c 5 -3 7 0 6 2 c -3 1 -5 0 -6 -2 z" fill="#5E9B4F"/>';
  }
  function biji(x, y, pecah) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="4.5" ry="3.2" fill="#7C9A36"/>' +
      (pecah ? '<path d="M' + (x + 1) + ' ' + (y - 3) + ' l 1.5 -3" stroke="#F4F1DE" stroke-width="1.6" stroke-linecap="round"/>' : '');
  }
  var POS = [[38, 92], [52, 88], [66, 94], [80, 89], [94, 93], [108, 88], [46, 99], [62, 101], [88, 100], [104, 99]];

  var GAMBAR = {
    terang: function () {
      return '<circle cx="128" cy="20" r="12" fill="#F2C14E"/><path d="M75 100 V62" stroke="#3C8A5A" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M75 66 C60 52 44 56 42 64 C56 72 68 70 75 66 Z" fill="#3C8A5A"/><path d="M75 66 C90 52 106 56 108 64 C94 72 82 70 75 66 Z" fill="#3C8A5A"/>' + POT;
    },
    gelap: function () {
      return '<path d="M75 100 C73 70 79 40 74 14" stroke="#D9CF8A" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M74 16 C68 10 62 12 62 16 C67 19 71 18 74 16 Z" fill="#CFC47A"/><path d="M74 16 C80 10 86 12 86 16 C81 19 77 18 74 16 Z" fill="#CFC47A"/>' + POT;
    },
    'kapas-basah': function () {
      var s = CAWAN + '<path d="M28 90 q 47 -10 94 0" stroke="#9CC3E0" stroke-width="3" fill="none" opacity=".7"/>';
      POS.forEach(function (p, i) { s += i === 6 ? biji(p[0], p[1]) : kecambah(p[0], p[1], 14 + (i % 3) * 5); });
      return s + '<path d="M128 30 q -5 8 0 12 q 5 -4 0 -12z" fill="#6FA8D6"/>';
    },
    'kapas-kering': function () {
      var s = CAWAN;
      POS.forEach(function (p) { s += biji(p[0], p[1]); });
      return s;
    },
    hangat: function () {
      var s = CAWAN;
      POS.forEach(function (p, i) { s += i === 3 ? biji(p[0], p[1]) : kecambah(p[0], p[1], 14 + (i % 3) * 5); });
      return s + '<rect x="122" y="14" width="8" height="30" rx="4" fill="#fff" stroke="#B5643A" stroke-width="1.5"/><circle cx="126" cy="46" r="6" fill="#D9573B"/><rect x="124.5" y="24" width="3" height="20" fill="#D9573B"/>';
    },
    dingin: function () {
      var s = CAWAN;
      POS.forEach(function (p, i) { s += biji(p[0], p[1], i === 2); });
      return s + '<g stroke="#5B8FB9" stroke-width="2" stroke-linecap="round"><path d="M126 14 v28 M114 28 h24 M117 19 l18 18 M135 19 l-18 18"/></g>';
    },
    jendela: function () {
      return '<rect x="4" y="8" width="34" height="52" rx="2" fill="#DCEFFB" stroke="#7B8E99" stroke-width="2"/><path d="M21 8 v52 M4 34 h34" stroke="#7B8E99" stroke-width="2"/>' +
        '<g stroke="#F2C14E" stroke-width="2.5" stroke-linecap="round"><path d="M42 26 h16 M42 38 h18 M42 50 h14"/></g>' +
        '<path d="M80 100 C80 80 82 62 72 50 C66 43 58 40 52 40" stroke="#3C8A5A" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M53 40 C46 32 40 34 39 39 C45 43 50 42 53 40 Z" fill="#3C8A5A"/><path d="M78 74 C88 66 98 68 99 73 C91 79 84 78 78 74 Z" fill="#3C8A5A"/>' +
        '<path d="M50 100 H110 L103 126 H57 Z" fill="#B5643A"/>';
    },
    halaman: function () {
      return '<circle cx="75" cy="14" r="11" fill="#F2C14E"/><g stroke="#F2C14E" stroke-width="2.5" stroke-linecap="round"><path d="M75 30 v8 M60 28 l4 7 M90 28 l-4 7"/></g>' +
        '<path d="M75 100 V48" stroke="#3C8A5A" stroke-width="4.5" stroke-linecap="round"/>' +
        '<path d="M75 52 C62 40 48 44 46 51 C58 58 68 56 75 52 Z" fill="#3C8A5A"/><path d="M75 52 C88 40 102 44 104 51 C92 58 82 56 75 52 Z" fill="#3C8A5A"/>' +
        '<path d="M75 76 C85 68 95 70 96 75 C88 81 81 80 75 76 Z" fill="#3C8A5A"/>' + POT;
    }
  };
  var HANGAT = { terang: 1, 'kapas-basah': 1, hangat: 1, halaman: 1, jendela: 1 };

  function renderGambar() {
    var w = $('gambar'); w.textContent = '';
    akt.gambar.forEach(function (g) {
      var fig = document.createElement('figure');
      fig.className = 'm-fig ' + (HANGAT[g.jenis] ? 'warm' : 'cool');
      var svg = '<svg viewBox="0 0 150 130" role="img" aria-label="' + g.alt.replace(/"/g, '&quot;') + '">' + (GAMBAR[g.jenis] ? GAMBAR[g.jenis]() : '') + '</svg>';
      fig.innerHTML = svg; // gambar statis milik sendiri
      var cap = document.createElement('figcaption');
      var b = document.createElement('strong'); b.textContent = g.label;
      cap.appendChild(b); cap.appendChild(document.createElement('br')); cap.appendChild(document.createTextNode(g.keterangan));
      fig.appendChild(cap); w.appendChild(fig);
    });
  }

  /* ---------- tampilan ---------- */
  function renderTabs() {
    var nav = $('tab-aktivitas'); nav.textContent = '';
    dataSub.aktivitas.forEach(function (a) {
      var t = document.createElement('a');
      t.className = 'm-tab';
      t.href = 'materi.html?sub=' + encodeURIComponent(subId) + '&a=' + encodeURIComponent(a.id);
      t.textContent = a.no + '. ' + a.judul;
      var s = baca(kunciAkt(a.id), null);
      if (s && s.selesai) { var ok = document.createElement('span'); ok.className = 'ok'; ok.textContent = '✓'; ok.setAttribute('aria-label', 'selesai'); t.appendChild(ok); }
      if (a.id === akt.id) t.setAttribute('aria-current', 'page');
      nav.appendChild(t);
    });
  }

  function renderHeader() {
    var n = dataSub.aktivitas.length;
    $('crumb-sub').textContent = dataSub.judul;
    $('crumb-akt').textContent = 'Aktivitas ' + akt.no + ': ' + akt.judul;
    $('progres-teks').textContent = 'Aktivitas ' + akt.no + ' dari ' + n;
    $('progres-bar').style.width = Math.round((hitungProgres() / n) * 100) + '%';
    document.title = akt.judul + ' · Detektif Sains';
  }

  function renderChips() {
    var ol = $('langkah-chip'); ol.textContent = '';
    LANGKAH.forEach(function (l) {
      var li = document.createElement('li');
      var selesai = l.no < st.langkah || (l.no === 5 && st.tahap5Selesai);
      li.className = selesai ? 'done' : (l.no === st.langkah ? 'now' : '');
      li.textContent = (selesai ? '✓ ' : '') + l.no + ' ' + l.nama;
      li.title = l.ennis;
      if (l.no === st.langkah && !st.tahap5Selesai) li.setAttribute('aria-current', 'step');
      ol.appendChild(li);
    });
  }

  function bubble(m) {
    var d = document.createElement('div');
    if (m.peran === 'siswa') { d.className = 'msg siswa-msg'; d.textContent = m.teks; return d; }
    if (m.jenis === 'petunjuk') {
      d.className = 'msg hint-msg';
      var b = document.createElement('strong'); b.textContent = 'Petunjuk: ';
      d.appendChild(b); d.appendChild(document.createTextNode(m.teks)); return d;
    }
    d.className = 'msg tutor-msg';
    if (m.teks) d.appendChild(document.createTextNode(m.teks));
    if (m.alur) {
      var l = LANGKAH[m.alur.langkah - 1];
      var box = document.createElement('div'); box.className = 'alur';
      var h = document.createElement('div'); h.className = 'alur-h';
      h.textContent = 'ALUR NALAR · LANGKAH ' + l.no + ' · ' + l.ennis.toUpperCase();
      var q = document.createElement('div'); q.textContent = m.alur.tanya;
      box.appendChild(h); box.appendChild(q); d.appendChild(box);
      if (!m.teks) d.classList.add('only-alur');
    }
    return d;
  }

  function renderLog() {
    var log = $('log'); log.textContent = '';
    st.pesan.forEach(function (m) { log.appendChild(bubble(m)); });
    log.scrollTop = log.scrollHeight;
  }

  function tambah(m) {
    m.waktu = new Date().toISOString();
    st.pesan.push(m); simpanState();
    var log = $('log'); log.appendChild(bubble(m)); log.scrollTop = log.scrollHeight;
  }

  function renderKesimpulan() {
    var ta = $('kesimpulan'), btn = $('kirim-kesimpulan');
    ta.disabled = !st.tahap5Selesai; btn.disabled = !st.tahap5Selesai;
    ta.value = st.kesimpulan || '';
    $('kesimpulan-bantu').textContent = st.tahap5Selesai
      ? 'Bagus! Sekarang tulis kesimpulanmu dengan kalimatmu sendiri, lengkap dengan alasan dan buktinya.'
      : 'Kolom ini terbuka setelah kamu menyelesaikan 5 langkah bersama Tutor Nalar.';
    $('tersimpan').hidden = !st.selesai;
    btn.textContent = nextAkt() ? 'Simpan kesimpulan & lanjut' : 'Simpan kesimpulan & kembali ke Beranda';
  }

  function setSibuk(v) {
    sibuk = v;
    document.querySelectorAll('.chip-btn, .send-btn').forEach(function (b) { b.disabled = v || st.tahap5Selesai; });
    $('pesan').disabled = v || st.tahap5Selesai;
    var log = $('log'), t = document.getElementById('mengetik');
    if (v && !t) {
      t = document.createElement('div'); t.className = 'typing'; t.id = 'mengetik';
      t.setAttribute('aria-label', 'Kak Nala sedang mengetik');
      t.innerHTML = '<span></span><span></span><span></span>';
      log.appendChild(t); log.scrollTop = log.scrollHeight;
    } else if (!v && t) { t.remove(); }
  }

  function nextAkt() {
    var i = dataSub.aktivitas.indexOf(akt);
    return dataSub.aktivitas[i + 1] || null;
  }

  /* ---------- logika tutor: mode terpandu ---------- */
  var KATA_ALASAN = /\b(karena|sebab|sehingga|jadi|maka|akibat|oleh karena|buktinya|terbukti|berarti)\b/i;

  function terpandu(aksi, teksSiswa) {
    var L = akt.langkah[st.langkah - 1];
    if (aksi === 'petunjuk') return { jenis: 'petunjuk', teks: L.petunjuk };
    if (aksi === 'belum_paham') {
      return { teks: 'Tidak apa-apa, kita pelan-pelan saja. Mulai dari yang paling sederhana: ' + L.petunjuk.charAt(0).toLowerCase() + L.petunjuk.slice(1) + '\nSetelah itu, coba jawab lagi pertanyaannya dengan kalimatmu sendiri.' };
    }
    if (aksi === 'cek_alasan') {
      var akhir = lastSiswa();
      if (!akhir) return { teks: 'Kamu belum menulis jawaban di langkah ini. Tulis dulu jawabanmu, lalu tekan "Cek alasanku" lagi.' };
      if (!KATA_ALASAN.test(akhir)) return { teks: 'Jawabanmu sudah ada, tapi alasannya belum terlihat. Coba tambahkan "karena…" lalu sebutkan satu bukti dari fenomena.' };
      return { teks: 'Alasanmu sudah terlihat. Sekarang periksa: apakah kamu sudah memakai bukti dari percobaan, misalnya angka atau ciri yang terlihat di gambar? Kalau belum, tambahkan satu bukti.' };
    }
    // aksi === 'jawab'
    var t = (teksSiswa || '').trim();
    if (t.length < 15) {
      return { teks: 'Coba jelaskan lebih lengkap, ya. Apa yang kamu pikirkan, dan mengapa kamu berpikir begitu?', level: 'Mulai', naik: false };
    }
    var level = (KATA_ALASAN.test(t) && t.length >= 60) ? 'Mahir' : 'Berkembang';
    var puji = level === 'Mahir' ? 'Jawabanmu sudah disertai alasan. Mantap!' : 'Terima kasih, jawabanmu sudah tercatat. Lain kali coba sertakan alasan dengan kata "karena".';
    return { teks: puji, level: level, naik: true };
  }

  function lastSiswa() {
    for (var i = st.pesan.length - 1; i >= 0; i--) {
      var m = st.pesan[i];
      if (m.peran === 'siswa' && m.langkah === st.langkah) return m.teks;
      if (m.peran === 'tutor' && m.alur && m.alur.langkah !== st.langkah) break;
    }
    return '';
  }

  /* ---------- logika tutor: mode LLM ---------- */
  function profil() { var p = baca('nt_profil', {}) || {}; return { nama: p.nama || '', absen: p.absen || '', sekolah: p.sekolah || '' }; }

  function riwayatUntukAPI() {
    return st.pesan.slice(-24).map(function (m) {
      var teks = m.teks || '';
      if (m.alur) teks = (teks ? teks + '\n' : '') + '[Langkah ' + m.alur.langkah + '] ' + m.alur.tanya;
      if (m.jenis === 'petunjuk') teks = 'Petunjuk: ' + teks;
      return { peran: m.peran, teks: teks.slice(0, 800) };
    });
  }

  function panggilLLM(aksi) {
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aksi: aksi, aktivitas: akt.id, langkah: st.langkah, pesan: riwayatUntukAPI(), siswa: profil(), sesi: st.sesi })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.pesan) throw new Error(j.galat || ('HTTP ' + r.status)); return j; });
    });
  }

  function catat(aksi, teksSiswa, hasil) {
    // Mode terpandu: kirim catatan ke server untuk data penelitian (diabaikan bila gagal)
    try {
      fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
        body: JSON.stringify({ aksi: 'catat', aktivitas: akt.id, langkah: st.langkah, siswa: profil(), sesi: st.sesi,
          catatan: { mode: modeLLM ? 'llm' : 'terpandu', aksi_siswa: aksi, teks_siswa: (teksSiswa || '').slice(0, 800), balasan: (hasil.teks || '').slice(0, 800), level: hasil.level || null, naik: !!hasil.naik } })
      }).catch(function () {});
    } catch (e) {}
  }

  /* ---------- alur percakapan ---------- */
  function terapkan(hasil, aksi) {
    var lama = st.langkah;
    if (hasil.level && aksi === 'jawab') st.level[lama] = hasil.level;
    if (hasil.naik && aksi === 'jawab') {
      if (lama < 5) {
        st.langkah = lama + 1;
        tambah({ peran: 'tutor', teks: hasil.teks, alur: { langkah: st.langkah, tanya: akt.langkah[st.langkah - 1].tanya }, langkahPesan: lama });
      } else {
        st.tahap5Selesai = true;
        tambah({ peran: 'tutor', teks: hasil.teks + '\n\nKamu sudah menyelesaikan kelima langkah berpikir. Sekarang tulis kesimpulanmu di kolom "Kesimpulanku", ya!' });
      }
    } else {
      tambah({ peran: 'tutor', teks: hasil.teks, jenis: hasil.jenis });
    }
    simpanState(); renderChips(); renderKesimpulan();
  }

  function kirim(aksi, teksSiswa) {
    if (sibuk || st.tahap5Selesai) return;
    if (aksi === 'jawab') {
      teksSiswa = (teksSiswa || '').trim();
      if (!teksSiswa) return;
      tambah({ peran: 'siswa', teks: teksSiswa, langkah: st.langkah });
    } else {
      var label = { petunjuk: 'Minta petunjuk', belum_paham: 'Aku belum paham', cek_alasan: 'Cek alasanku' }[aksi];
      tambah({ peran: 'siswa', teks: label, langkah: st.langkah, tombol: aksi });
    }
    setSibuk(true);

    var jalan = modeLLM
      ? panggilLLM(aksi).then(function (j) {
          return { teks: j.pesan, level: j.level, naik: !!j.naik, jenis: aksi === 'petunjuk' ? 'petunjuk' : undefined };
        }).catch(function () {
          // gagal menghubungi LLM: lanjutkan dengan mode terpandu agar siswa tidak terhenti
          var h = terpandu(aksi, teksSiswa); catat(aksi, teksSiswa, h); return h;
        })
      : new Promise(function (ok) {
          setTimeout(function () { var h = terpandu(aksi, teksSiswa); catat(aksi, teksSiswa, h); ok(h); }, 650);
        });

    jalan.then(function (h) { setSibuk(false); terapkan(h, aksi); if (!st.tahap5Selesai) $('pesan').focus(); });
  }

  /* ---------- muat aktivitas ---------- */
  function mulaiAktivitas() {
    st = baca(kunciAkt(akt.id), null) || stateAwal();
    renderHeader(); renderTabs();
    $('judul-fenomena').textContent = akt.judul;
    $('teks-fenomena').textContent = akt.fenomena;
    $('teks-pemantik').textContent = akt.pemantik;
    renderGambar();
    if (!st.pesan.length) {
      var nama = profil().nama;
      tambah({ peran: 'tutor', teks: 'Halo' + (nama ? ', ' + nama : '') + '! Aku Kak Nala. Aku tidak akan memberi jawaban langsung, tapi akan menemanimu berpikir langkah demi langkah. Amati dulu fenomena dan gambarnya, ya.', alur: { langkah: 1, tanya: akt.langkah[0].tanya } });
    }
    renderLog(); renderChips(); renderKesimpulan(); setSibuk(false);
  }

  function gagalMuat(pesan) {
    $('judul-fenomena').textContent = 'Aktivitas belum tersedia';
    $('teks-fenomena').textContent = pesan;
    document.querySelector('.tutor').hidden = true;
  }

  /* ---------- event ---------- */
  $('form-pesan').addEventListener('submit', function (e) {
    e.preventDefault();
    var ta = $('pesan'); var v = ta.value; if (!v.trim()) return;
    ta.value = ''; kirim('jawab', v);
  });
  $('pesan').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('form-pesan').requestSubmit(); }
  });
  document.querySelectorAll('.chip-btn').forEach(function (b) {
    b.addEventListener('click', function () { kirim(b.getAttribute('data-aksi')); });
  });
  $('kesimpulan').addEventListener('input', function (e) { st.kesimpulan = e.target.value; simpanState(); });
  $('kirim-kesimpulan').addEventListener('click', function () {
    var v = $('kesimpulan').value.trim();
    if (v.length < 20) { $('kesimpulan-bantu').textContent = 'Kesimpulanmu masih terlalu singkat. Tulis minimal satu kalimat lengkap beserta alasannya.'; $('kesimpulan').focus(); return; }
    st.kesimpulan = v; st.selesai = true; st.waktuSelesai = new Date().toISOString(); simpanState();
    catat('kesimpulan', v, { teks: '', level: null, naik: false });
    var n = nextAkt();
    location.href = n ? 'materi.html?sub=' + encodeURIComponent(subId) + '&a=' + encodeURIComponent(n.id) : 'index.html';
  });

  /* ---------- mulai ---------- */
  fetch('assets/data/aktivitas.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function (data) {
      dataSub = data.submateri[subId];
      if (!dataSub) return gagalMuat('Submateri ini sedang disiapkan. Silakan kembali ke Beranda dan pilih Pertumbuhan Tumbuhan.');
      var aId = params.get('a');
      akt = dataSub.aktivitas.filter(function (a) { return a.id === aId; })[0];
      if (!akt) {
        // aktivitas pertama yang belum selesai
        akt = dataSub.aktivitas.filter(function (a) { var s = baca(kunciAkt(a.id), null); return !(s && s.selesai); })[0] || dataSub.aktivitas[0];
      }
      mulaiAktivitas();
      return fetch(API + '?status=1', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : { llm: false }; })
        .catch(function () { return { llm: false }; })
        .then(function (s) {
          modeLLM = !!s.llm;
          $('mode-tutor').textContent = modeLLM ? 'Tutor AI · membimbing dengan pertanyaan, bukan jawaban' : 'Mode terpandu · membimbing dengan pertanyaan';
        });
    })
    .catch(function () { gagalMuat('Materi gagal dimuat. Periksa koneksi internetmu, lalu muat ulang halaman.'); });
})();
