# Detektif Sains — Media IPA Berbasis LLM-CoT

Media pembelajaran web untuk penelitian skripsi **"Pengaruh Media IPA Berbasis LLM-CoT dalam Meningkatkan Critical Thinking Siswa SMP pada Materi Pertumbuhan dan Perkembangan Makhluk Hidup"**.

- Sasaran: SMP kelas IX
- Indikator berpikir kritis: Ennis (2011)
- Situs: https://detektifsains.speakverse.id/

## Status modul

| Modul | Halaman | Status |
|---|---|---|
| 1. Beranda | `index.html` | ✅ selesai |
| 2. Materi + Tutor Nalar (LLM-CoT) | `materi.html` + `api/tutor.php` | ✅ selesai (submateri Pertumbuhan Tumbuhan, 4 aktivitas) |
| 3. Refleksi & indikator Ennis | `refleksi.html` | ⏳ |

## Langkah tutor ↔ indikator Ennis (2011)

| Langkah | Indikator |
|---|---|
| 1 · Jelaskan | Memberikan penjelasan sederhana |
| 2 · Cek bukti | Membangun keterampilan dasar |
| 3 · Simpulkan | Menyimpulkan |
| 4 · Perjelas | Memberikan penjelasan lebih lanjut |
| 5 · Rancang strategi | Mengatur strategi dan taktik |

## Tutor Nalar (LLM-CoT)

- Konten aktivitas: `assets/data/aktivitas.json` (fenomena, konsep kunci, pertanyaan + petunjuk tiap langkah Ennis).
- `api/tutor.php` meneruskan percakapan ke LLM. Model diminta menulis penalaran langkah demi langkah (`analisis`, *Chain-of-Thought*) sebelum membalas siswa; penalaran ini **tidak** ditampilkan ke siswa, tetapi dicatat untuk peneliti.
- Penyedia: Claude (`anthropic`), `openai` (atau API kompatibel OpenAI), atau `gemini`.
- **Konfigurasi**: salin `docs/detektifsains-config.example.php` ke folder home cPanel (di luar folder website) dengan nama `detektifsains-config.php`, lalu isi `provider` dan `api_key`. Izin file 600.
- Tanpa file konfigurasi, tutor berjalan dalam **mode terpandu** (pertanyaan Sokratik tertulis per langkah).
- **Log penelitian**: `<folder home>/detektifsains-logs/tutor-YYYY-MM.jsonl` — satu baris per interaksi: siswa, aktivitas, langkah, jawaban, analisis CoT, level (Mulai/Berkembang/Mahir), balasan tutor, dan kesimpulan.

## Struktur

```
index.html            Modul 1 – Beranda
materi.html           Modul 2 – Materi + Tutor Nalar
api/tutor.php         perantara LLM + log penelitian
assets/data/          konten aktivitas (JSON)
docs/                 contoh konfigurasi (tidak ikut di-deploy)
assets/css/style.css  gaya bersama semua modul
assets/js/data.js     data submateri & langkah berpikir
assets/js/app.js      logika Beranda
assets/img/           logo
.github/workflows/    deploy otomatis ke cPanel
```

Tampilan berupa HTML/CSS/JS; satu file PHP menjadi perantara ke API LLM supaya API key tidak pernah sampai ke browser siswa.

## Alur rilis

1. Setiap modul selesai → commit & push ke `main` di GitHub.
2. GitHub Actions (`Deploy ke cPanel`) otomatis mengunggah file ke folder subdomain.

### Sekali saja: isi Secrets di GitHub

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Nama | Isi |
|---|---|
| `FTP_SERVER` | host FTP dari cPanel → FTP Accounts → *Configure FTP Client* |
| `FTP_USERNAME` | akun FTP khusus (disarankan dibatasi ke folder subdomain) |
| `FTP_PASSWORD` | kata sandi akun FTP tersebut |
| `FTP_SERVER_DIR` | **wajib**: folder subdomain, mis. `/detektifsains.speakverse.id`. Deploy menolak folder akar/home demi keamanan |

Setelah diisi, jalankan ulang lewat tab **Actions → Deploy ke cPanel → Run workflow**.

Data profil siswa (nama, absen, sekolah) dan progres hanya disimpan di `localStorage` perangkat siswa.
