/* Data konten bersama untuk semua modul Detektif Sains. */
window.NT_DATA = {
  submateri: [
    {
      id: 'tumbuhan',
      judul: '1. Pertumbuhan Tumbuhan',
      ringkas: 'Perkecambahan, faktor internal (hormon) dan eksternal (cahaya, air, suhu).',
      ikon: 'tumbuhan',
      tone: 'tone-green',
      jumlahAktivitas: 4,
      tautan: null // diisi saat Modul 2 selesai, mis. 'materi.html?sub=tumbuhan'
    },
    {
      id: 'hewan',
      judul: '2. Metamorfosis Hewan',
      ringkas: 'Metamorfosis sempurna dan tidak sempurna pada kupu-kupu, katak, belalang.',
      ikon: 'hewan',
      tone: 'tone-amber',
      jumlahAktivitas: 4,
      tautan: null
    },
    {
      id: 'manusia',
      judul: '3. Pertumbuhan Manusia',
      ringkas: 'Tahapan sejak bayi hingga dewasa, masa pubertas, dan ciri-cirinya.',
      ikon: 'manusia',
      tone: 'tone-blue',
      jumlahAktivitas: 4,
      tautan: null
    }
  ],

  /* Langkah berpikir Tutor Nalar, dipetakan ke indikator Ennis (2011). */
  langkah: [
    { no: 1, nama: 'Jelaskan', tanya: 'Apa pertanyaan intinya dan apa yang kamu amati?', ennis: 'Memberikan penjelasan sederhana' },
    { no: 2, nama: 'Cek bukti', tanya: 'Apakah datanya bisa dipercaya?', ennis: 'Membangun keterampilan dasar' },
    { no: 3, nama: 'Simpulkan', tanya: 'Apa kesimpulanmu dan mengapa?', ennis: 'Menyimpulkan' },
    { no: 4, nama: 'Perjelas', tanya: 'Apa arti istilahnya, apa asumsimu?', ennis: 'Memberikan penjelasan lebih lanjut' },
    { no: 5, nama: 'Rancang strategi', tanya: 'Bagaimana cara mengujinya lagi?', ennis: 'Mengatur strategi dan taktik' }
  ]
};
