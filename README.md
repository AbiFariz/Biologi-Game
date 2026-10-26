# Detektif Sains — Media IPA Berbasis LLM-CoT

Media pembelajaran web untuk penelitian skripsi **"Pengaruh Media IPA Berbasis LLM-CoT dalam Meningkatkan Critical Thinking Siswa SMP pada Materi Pertumbuhan dan Perkembangan Makhluk Hidup"**.

- Sasaran: SMP kelas IX
- Indikator berpikir kritis: Ennis (2011)
- Situs: https://detektifsains.speakverse.id/

## Status modul

| Modul | Halaman | Status |
|---|---|---|
| 1. Beranda | `index.html` | ✅ selesai |
| 2. Materi + Tutor Nalar (LLM-CoT) | `materi.html` + `api/tutor.php` | ⏳ berikutnya |
| 3. Refleksi & indikator Ennis | `refleksi.html` | ⏳ |

## Langkah tutor ↔ indikator Ennis (2011)

| Langkah | Indikator |
|---|---|
| 1 · Jelaskan | Memberikan penjelasan sederhana |
| 2 · Cek bukti | Membangun keterampilan dasar |
| 3 · Simpulkan | Menyimpulkan |
| 4 · Perjelas | Memberikan penjelasan lebih lanjut |
| 5 · Rancang strategi | Mengatur strategi dan taktik |

## Struktur

```
index.html            Modul 1 – Beranda
assets/css/style.css  gaya bersama semua modul
assets/js/data.js     data submateri & langkah berpikir
assets/js/app.js      logika Beranda
assets/img/           logo
.github/workflows/    deploy otomatis ke cPanel
```

Situs ini statis (HTML/CSS/JS). Mulai Modul 2 ditambah satu file PHP sebagai perantara ke API LLM, supaya API key tidak pernah sampai ke browser siswa.

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
| `FTP_SERVER_DIR` | opsional, folder tujuan diakhiri `/`; kosongkan bila akun FTP sudah langsung ke folder subdomain |

Setelah diisi, jalankan ulang lewat tab **Actions → Deploy ke cPanel → Run workflow**. Jika koneksi FTPS ditolak server, ubah `protocol: ftps` menjadi `ftp` di `.github/workflows/deploy.yml`.

Data profil siswa (nama, absen, sekolah) dan progres hanya disimpan di `localStorage` perangkat siswa.
