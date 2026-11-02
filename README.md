# Detektif Sains — Media IPA Berbasis LLM-CoT

Media pembelajaran web untuk penelitian skripsi **"Pengaruh Media IPA Berbasis LLM-CoT dalam Meningkatkan Critical Thinking Siswa SMP pada Materi Pertumbuhan dan Perkembangan Makhluk Hidup"**.

- Sasaran: SMP kelas IX
- Indikator berpikir kritis: Ennis (2011)
- Situs: https://detektifsains.speakverse.id/
- Framework: **Laravel 12** (PHP 8.4), MySQL

## Fitur

| Modul | Rute | Isi |
|---|---|---|
| 1. Beranda | `/` | Profil siswa, kartu *Lanjutkan Belajar*, 3 submateri dengan progres |
| 2. Materi + Tutor Nalar (LLM-CoT) | `/materi?sub=…&a=…` | 3 submateri × 4 aktivitas (a–d): fenomena, ilustrasi, pemantik, tutor 5 langkah Ennis, kesimpulan |
| 3. Refleksi | `/refleksi` | Jejak 5 indikator Ennis + bukti jawaban, kesimpulan, jurnal refleksi, ringkasan |
| API tutor | `GET/POST /api/tutor` | Status, balasan tutor AI, pencatatan data penelitian |

Alamat lama (`index.html`, `materi.html`, `refleksi.html`, `api/tutor.php`) tetap berfungsi dan dialihkan.

## Langkah tutor ↔ indikator Ennis (2011)

| Langkah | Indikator |
|---|---|
| 1 · Jelaskan | Memberikan penjelasan sederhana |
| 2 · Cek bukti | Membangun keterampilan dasar |
| 3 · Simpulkan | Menyimpulkan |
| 4 · Perjelas | Memberikan penjelasan lebih lanjut |
| 5 · Rancang strategi | Mengatur strategi dan taktik |

## Struktur (bagian yang dibuat khusus)

```
routes/web.php                      halaman Beranda, Materi, Refleksi (+ pengalihan URL lama)
routes/api.php                      /api/tutor (dibatasi laju per IP)
app/Http/Controllers/TutorController.php   validasi, mode AI / terpandu, pencatatan
app/Services/TutorLlm.php           prompt Chain-of-Thought + Claude/OpenAI/Gemini
app/Services/LogPenelitian.php      log ke tabel ds_log (MySQL) + cadangan JSONL
database/migrations/…_create_ds_log_table.php
resources/views/                    layouts/base, partials/sidebar, beranda, materi, refleksi
public/assets/                      CSS, JS halaman, ilustrasi, data aktivitas (JSON)
config/detektif.php                 konfigurasi tutor (dari .env)
bootstrap/siapkan-env.php           menyusun .env di server dari detektifsains-config.php
docs/detektifsains-config.example.php
```

## Tutor Nalar (LLM-CoT)

- Konten aktivitas: `public/assets/data/aktivitas.json` (fenomena, konsep kunci, pertanyaan + petunjuk tiap langkah Ennis).
- Model diminta menulis penalaran langkah demi langkah (`analisis`, *Chain-of-Thought*) sebelum membalas siswa; penalaran ini **tidak** ditampilkan ke siswa, tetapi dicatat untuk peneliti.
- Tanpa API key, tutor berjalan dalam **mode terpandu** (pertanyaan Sokratik tertulis per langkah).

## Konfigurasi di server

Rahasia tidak pernah disimpan di GitHub. Di server, buat
`/home/speakver/detektifsains.speakverse.id/detektifsains-config.php` (satu tingkat di atas `public/`, izin 600) berdasarkan `docs/detektifsains-config.example.php`, berisi `provider`, `api_key`, `model`, dan `db_*`.

Pada permintaan pertama (dan setiap kali berkas itu diubah) aplikasi menyusun `.env` Laravel darinya, termasuk `APP_KEY` acak yang dibuat sekali. Jadi untuk mengganti API key atau password database cukup ubah `detektifsains-config.php`.

## Data penelitian

Tabel MySQL **`ds_log`** (dibuat otomatis; definisinya juga ada di migration) dan cadangan berkas `detektifsains-logs/tutor-YYYY-MM.jsonl` di folder aplikasi. Satu baris per interaksi: waktu, siswa, aktivitas, langkah, aksi, jawaban, analisis CoT, level (Mulai/Berkembang/Mahir), balasan tutor, kesimpulan, dan refleksi.

Ekspor ke Excel/SPSS: phpMyAdmin → `ds_log` → Export → CSV. Sebelum pengambilan data, kosongkan data uji coba: `ds_log` → Operations → *Empty the table (TRUNCATE)*.

## Alur rilis

1. Setiap perubahan → commit & push ke `main` di GitHub.
2. GitHub Actions (`Deploy ke cPanel`): `composer install --no-dev`, unggah via FTP ke folder aplikasi (`vendor` lalu aplikasi, `public` terakhir), hapus berkas HTML versi lama, lalu memverifikasi halaman utama menjawab 200.

Secrets GitHub: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR` (= `/detektifsains.speakverse.id`; akhiran `/public` dibuang otomatis). Deploy menolak folder selain folder subdomain detektifsains.

### Catatan server

- Document Root subdomain: `/detektifsains.speakverse.id/public`.
- `public/.htaccess` berisi aturan Laravel; baris `RewriteEngine On` di dalamnya juga memutus aturan rewrite yang diwariskan dari `.htaccess` folder home akun (penyebab error 500 sebelumnya). Blok bawaan cPanel tetap disertakan.
- `.user.ini` dan `php.ini` di server tidak ditimpa.

## Pengembangan lokal

```
composer install
cp .env.example .env && php artisan key:generate   # isi DB_* dan LLM_* bila perlu
php artisan migrate
php artisan serve
```

Data profil siswa dan progres per aktivitas disimpan di `localStorage` perangkat siswa; interaksi untuk penelitian dikirim ke server.
