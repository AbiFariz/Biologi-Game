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

  function batang(nilai, label, maks, warna, akhiran) {
    var n = nilai.length, lebar = 120 / n, s = '<path d="M14 100 H140" stroke="#7B8E99" stroke-width="1.5"/>';
    nilai.forEach(function (v, i) {
      var h = Math.round(v / maks * 80), x = 16 + i * lebar + lebar * 0.15, w = lebar * 0.7;
      s += '<rect x="' + x.toFixed(1) + '" y="' + (100 - h) + '" width="' + w.toFixed(1) + '" height="' + h + '" rx="2" fill="' + warna + '"/>' +
        '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (96 - h) + '" font-size="9" font-weight="700" text-anchor="middle" fill="#16281F">' + String(v).replace('.', ',') + '</text>' +
        '<text x="' + (x + w / 2).toFixed(1) + '" y="113" font-size="9" text-anchor="middle" fill="#34443B">' + label[i] + '</text>';
    });
    if (akhiran) s += '<text x="140" y="125" font-size="8" text-anchor="end" fill="#4F5F56">usia (' + akhiran + ')</text>';
    return s;
  }
  function balita(tinggi, stunting) {
    var h = Math.round(tinggi * 0.95);
    var s = '<path d="M30 112 H120" stroke="#7B8E99" stroke-width="1.5"/>' +
      '<rect x="36" y="' + (112 - h) + '" width="10" height="' + h + '" rx="2" fill="#E8A33D"/>' +
      '<text x="41" y="' + (106 - h) + '" font-size="10" font-weight="700" text-anchor="middle" fill="#16281F">' + tinggi + ' cm</text>' +
      '<g fill="#5B8FB9"><circle cx="70" cy="' + (112 - h + 8) + '" r="8"/><path d="M60 ' + (112 - h + 18) + ' h20 l-2 ' + (h - 40) + ' h-4 l-1 22 h-6 l-1 -22 h-4 z"/></g>';
    var sudut = stunting / 100 * 2 * Math.PI, cx = 112, cy = 58, r = 16;
    var x = cx + r * Math.sin(sudut), y = cy - r * Math.cos(sudut);
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#DCE3DE"/>' +
      '<path d="M' + cx + ' ' + cy + ' L' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 ' + (stunting > 50 ? 1 : 0) + ' 1 ' + x.toFixed(1) + ' ' + y.toFixed(1) + ' Z" fill="#D9573B"/>' +
      '<text x="' + cx + '" y="' + (cy + 30) + '" font-size="9" text-anchor="middle" fill="#16281F">stunting ' + stunting + '%</text>';
    return s;
  }

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
    ,
    /* ---------- Metamorfosis Hewan ---------- */
    ulat: function () {
      var s = '<path d="M10 104 C40 92 70 96 140 86" stroke="#7A5A3A" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<path d="M96 88 C104 60 130 52 142 62 C134 78 116 88 96 88 Z" fill="#5FA052"/><path d="M98 87 C112 74 126 66 140 63" stroke="#3C7A3A" stroke-width="1.5" fill="none"/>';
      for (var i = 0; i < 7; i++) s += '<circle cx="' + (26 + i * 10) + '" cy="' + (88 - Math.sin(i / 2) * 6) + '" r="7" fill="#8CC152" stroke="#5E9B4F" stroke-width="1.2"/>';
      return s + '<circle cx="96" cy="80" r="7.5" fill="#6FA845"/><circle cx="99" cy="78" r="1.6" fill="#16281F"/>' +
        '<path d="M95 73 l-3 -7 M99 73 l2 -7" stroke="#16281F" stroke-width="1.4" stroke-linecap="round"/>';
    },
    kupukupu: function () {
      return '<path d="M118 120 V82" stroke="#3C8A5A" stroke-width="3"/><circle cx="118" cy="76" r="9" fill="#E86A92"/><circle cx="118" cy="76" r="3.5" fill="#F2C14E"/>' +
        '<path d="M60 58 C34 20 14 34 22 56 C28 68 48 66 60 58 Z" fill="#E8A33D"/><path d="M60 58 C86 20 106 34 98 56 C92 68 72 66 60 58 Z" fill="#E8A33D"/>' +
        '<path d="M60 62 C40 70 34 90 46 92 C56 92 60 76 60 62 Z" fill="#D9573B"/><path d="M60 62 C80 70 86 90 74 92 C64 92 60 76 60 62 Z" fill="#D9573B"/>' +
        '<circle cx="34" cy="46" r="4" fill="#16281F"/><circle cx="86" cy="46" r="4" fill="#16281F"/>' +
        '<rect x="57.5" y="44" width="5" height="40" rx="2.5" fill="#3A2A1A"/><path d="M59 44 q-6 -12 -12 -14 M61 44 q6 -12 12 -14" stroke="#3A2A1A" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
    },
    berudu: function () {
      return '<rect x="6" y="20" width="138" height="100" rx="8" fill="#CFE6F2"/><path d="M6 34 q17 -6 34 0 t34 0 t34 0 t36 0" stroke="#9CC3E0" stroke-width="2" fill="none"/>' +
        '<ellipse cx="62" cy="74" rx="18" ry="13" fill="#4A5A3A"/><circle cx="54" cy="70" r="2.4" fill="#fff"/><circle cx="54" cy="70" r="1.2" fill="#16281F"/>' +
        '<path d="M78 74 C96 64 108 84 128 70 C112 90 96 82 79 79 Z" fill="#6B7A55"/>' +
        '<g fill="#BFDDEB"><circle cx="40" cy="56" r="2.5"/><circle cx="36" cy="46" r="1.8"/></g>';
    },
    katak: function () {
      return '<rect x="6" y="88" width="138" height="34" rx="6" fill="#CFE6F2"/><path d="M30 96 C40 70 110 70 120 96 Z" fill="#9AA3A8"/>' +
        '<ellipse cx="75" cy="66" rx="24" ry="15" fill="#5E9B4F"/><circle cx="62" cy="52" r="7" fill="#5E9B4F"/><circle cx="88" cy="52" r="7" fill="#5E9B4F"/>' +
        '<circle cx="62" cy="51" r="3.2" fill="#fff"/><circle cx="62" cy="51" r="1.6" fill="#16281F"/><circle cx="88" cy="51" r="3.2" fill="#fff"/><circle cx="88" cy="51" r="1.6" fill="#16281F"/>' +
        '<path d="M66 72 q9 5 18 0" stroke="#2F5E2A" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M52 74 q-10 10 -4 16 h10 M98 74 q10 10 4 16 h-10 M64 80 l-4 10 M86 80 l4 10" stroke="#3C7A3A" stroke-width="4" fill="none" stroke-linecap="round"/>';
    },
    nimfa: function () {
      return '<path d="M8 104 C50 90 100 94 142 100" stroke="#5E9B4F" stroke-width="10" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="72" cy="80" rx="20" ry="7" fill="#9BBF4A"/><ellipse cx="50" cy="76" rx="8" ry="7" fill="#9BBF4A"/><circle cx="47" cy="74" r="1.8" fill="#16281F"/>' +
        '<path d="M46 70 q-8 -16 -18 -18 M50 69 q-4 -16 -10 -22" stroke="#6B8A2A" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
        '<path d="M80 78 L98 62 L104 88 M70 84 l-4 10 M60 84 l-6 9" stroke="#6B8A2A" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M64 74 q8 -4 14 0" stroke="#7AA03A" stroke-width="3" fill="none" stroke-linecap="round"/>';
    },
    belalang: function () {
      return '<path d="M8 110 C50 96 100 100 142 106" stroke="#5E9B4F" stroke-width="10" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="78" cy="74" rx="38" ry="11" fill="#7FA83A"/><ellipse cx="38" cy="70" rx="12" ry="11" fill="#7FA83A"/><circle cx="34" cy="67" r="2.6" fill="#16281F"/>' +
        '<path d="M50 68 C78 46 112 50 122 66 C100 70 74 72 50 68 Z" fill="#A9C46A" stroke="#6B8A2A" stroke-width="1.2"/>' +
        '<path d="M32 60 q-10 -22 -24 -26 M37 59 q-4 -24 -14 -32" stroke="#6B8A2A" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M92 80 L118 52 L128 100 M66 84 l-6 18 M52 82 l-10 16" stroke="#5E7A2A" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    },
    'ember-terbuka': function () {
      var s = '<path d="M34 44 L42 122 H108 L116 44 Z" fill="#5B8FB9"/><ellipse cx="75" cy="44" rx="41" ry="8" fill="#3E6E93"/><ellipse cx="75" cy="47" rx="36" ry="5.5" fill="#9CC3E0"/>' +
        '<path d="M48 64 L102 64 L98 116 H52 Z" fill="#9CC3E0" opacity=".55"/>';
      [[56, 74], [70, 86], [88, 72], [62, 100], [92, 96], [78, 108]].forEach(function (p) {
        s += '<path d="M' + p[0] + ' ' + p[1] + ' q3 4 0 8 q-3 4 0 8" stroke="#3A3A2A" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
      });
      s += '<path d="M80 84 a4 4 0 1 1 6 4 q-2 2 -1 5" stroke="#3A3A2A" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      return s + '<g stroke="#3A3A2A" stroke-width="1.2" stroke-linecap="round"><path d="M104 22 l12 -4"/><path d="M110 21 l-6 -8 M110 21 l8 -10"/><path d="M106 22 l-4 6 M110 22 l0 7 M114 21 l4 6"/></g>';
    },
    'ember-tertutup': function () {
      return '<path d="M34 44 L42 122 H108 L116 44 Z" fill="#5B8FB9"/><rect x="28" y="34" width="94" height="12" rx="5" fill="#2F5674"/><rect x="66" y="26" width="18" height="9" rx="3" fill="#2F5674"/>' +
        '<path d="M48 64 L102 64 L98 116 H52 Z" fill="#9CC3E0" opacity=".55"/>';
    },
    /* ---------- Pertumbuhan Manusia ---------- */
    'grafik-tinggi': function () {
      return batang([75, 95, 115, 132, 148, 162], ['1', '3', '6', '9', '12', '14'], 170, '#2E7D5B', 'th');
    },
    'grafik-laju': function () {
      return batang([10, 6.7, 5.7, 5.3, 7], ['1–3', '3–6', '6–9', '9–12', '12–14'], 11, '#E8A33D', '');
    },
    'desa-a': function () { return balita(86, 12); },
    'desa-b': function () { return balita(82, 27); },
    'pubertas-fisik': function () {
      return '<g fill="#5B8FB9"><circle cx="50" cy="38" r="9"/><path d="M38 52 h24 l-3 36 h-4 l-2 28 h-6 l-2 -28 h-4 z"/></g>' +
        '<g fill="#E86A92"><circle cx="98" cy="44" r="8.5"/><path d="M86 57 h24 l6 32 h-8 l-1 26 h-6 l-1 -26 h-1 l-1 26 h-6 l-1 -26 h-8 z"/></g>' +
        '<path d="M130 116 V24 M124 32 l6 -8 l6 8" stroke="#2E7D5B" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<g stroke="#2E7D5B" stroke-width="1.5"><path d="M126 56 h8 M126 76 h8 M126 96 h8"/></g>';
    },
    'pubertas-emosi': function () {
      return '<path d="M18 22 h70 a10 10 0 0 1 10 10 v26 a10 10 0 0 1 -10 10 h-46 l-14 12 v-12 h-10 a10 10 0 0 1 -10 -10 v-26 a10 10 0 0 1 10 -10 z" fill="#fff" stroke="#5B8FB9" stroke-width="2"/>' +
        '<g stroke="#5B8FB9" stroke-width="3" stroke-linecap="round"><path d="M28 38 h48 M28 50 h32"/></g>' +
        '<path d="M106 88 c-10 -14 -30 -4 -18 12 l18 18 l18 -18 c12 -16 -8 -26 -18 -12 z" fill="#E86A92"/>' +
        '<path d="M120 26 l4 8 l8 1 l-6 6 l2 8 l-8 -4 l-8 4 l2 -8 l-6 -6 l8 -1 z" fill="#F2C14E"/>';
    },
    'berat-bayi': function () {
      return batang([3.2, 9.5], ['Lahir', '13 bl'], 11, '#2E7D5B', '');
    },
    'gerak-bayi': function () {
      var titik = [[22, '4'], [56, '7'], [90, '9'], [124, '13']];
      var s = '<path d="M14 92 H134" stroke="#7B8E99" stroke-width="2"/>';
      titik.forEach(function (t) {
        s += '<circle cx="' + t[0] + '" cy="92" r="4" fill="#2E7D5B"/><text x="' + t[0] + '" y="110" font-size="10" text-anchor="middle" fill="#34443B">' + t[1] + ' bl</text>';
      });
      s += '<g fill="#B5643A">' +
        '<ellipse cx="22" cy="76" rx="12" ry="4.5"/><circle cx="12" cy="68" r="5"/>' +
        '<circle cx="56" cy="52" r="5"/><path d="M50 60 h12 l2 18 h-16 z"/><ellipse cx="56" cy="80" rx="12" ry="3"/>' +
        '<circle cx="80" cy="62" r="5"/><path d="M84 66 h14 l4 12 h-4 l-2 -6 h-8 l-2 6 h-4 z"/>' +
        '<circle cx="124" cy="40" r="5"/><path d="M119 48 h10 l1 16 h-3 l-1 16 h-2 l-1 -16 h-1 l-1 16 h-2 l-1 -16 h-3 z"/></g>';
      return s;
    }
  };
  var HANGAT = { terang: 1, 'kapas-basah': 1, hangat: 1, halaman: 1, jendela: 1, ulat: 1, kupukupu: 1, nimfa: 1, belalang: 1, 'ember-terbuka': 1, 'grafik-tinggi': 1, 'desa-a': 1, 'pubertas-fisik': 1, 'berat-bayi': 1 };

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
  function renderSubmateri() {
    var nav = $('tab-submateri'); nav.textContent = '';
    window.NT_DATA.submateri.forEach(function (s) {
      var a = document.createElement('a');
      a.className = 'm-sub';
      a.href = 'materi.html?sub=' + encodeURIComponent(s.id);
      a.textContent = s.judul;
      if (s.id === subId) a.setAttribute('aria-current', 'page');
      nav.appendChild(a);
    });
  }

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
    btn.textContent = 'Simpan kesimpulan & lanjut ke refleksi';
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
    st.mode = modeLLM ? 'llm' : 'terpandu';
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
    renderHeader(); renderSubmateri(); renderTabs();
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
    location.href = 'refleksi.html?a=' + encodeURIComponent(akt.id);
  });

  /* ---------- mulai ---------- */
  fetch('assets/data/aktivitas.json?v=__VER__', { cache: 'no-cache' })
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
