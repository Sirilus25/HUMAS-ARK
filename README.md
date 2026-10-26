# 🏫 Command Center Pribadi Terintegrasi — Pak Edo | SMP Negeri 1 Sragen

Sebuah aplikasi **Pusat Kendali (Command Center) Pribadi** yang dirancang secara khusus untuk menyederhanakan, mengorganisir, dan mengintegrasikan seluruh aktivitas profesional **Pak Edo** di **SMP Negeri 1 Sragen** maupun urusan finansial dan agenda personal.

---

## 🌟 Fitur Utama

### 1. 📊 Dashboard Visual Utama
- **Sapaan Kontekstual Dinamis**: Pagi / Siang / Sore / Malam Pak Edo disertai jam digital real-time WIB dan penanggalan Indonesia.
- **Kartu Metrik Eksekutif**:
  - Jam mengajar aktif hari ini & total sesi pekanan.
  - Ringkasan catatan binaan siswa Wali Kelas VIII-D & kasus yang memerlukan perhatian khusus.
  - Saldo kas bersih akumulatif, total pemasukan, dan total pengeluaran bulan ini.
  - Jumlah agenda tugas mendesak yang belum diselesaikan.
- **Jadwal Mengajar Hari Ini**: Daftar sesi kelas yang dilengkapi penyesuaian status interaktif (*Belum*, *Sedang Berlangsung*, *Selesai*, *Kosong*).
- **Aksi Cepat (Quick Actions)**: Tombol instan untuk menambah Jadwal Ajar, Catatan Siswa, Transaksi Keuangan, dan Agenda Baru.
- **Widget Ekskul Broadcasting & Catatan Utama**: Pratinjau liputan terdekat, ketersediaan inventaris kamera studio, serta memo tersemat (*pinned notes*).

---

### 2. 🎓 Manajemen Pendidikan & Pengajaran (Modul Guru)
Terbagi menjadi 3 pilar utama:

#### A. 📅 Jadwal Mengajar
- Penjadwalan fleksibel dari hari **Senin s/d Sabtu**.
- Pencatatan informasi lengkap: Jam pertemuan, Nama Kelas (misal VIII-D, VII-A), Mata Pelajaran (Informatika / TIK), Ruangan (Lab Komputer 1 / Studio), Materi / Capaian Pembelajaran, dan Catatan Tambahan.
- Filter berdasarkan hari dan kotak pencarian materi/kelas.
- **CRUD Penuh**: Tambah jadwal baru, Edit jadwal yang ada, Hapus jadwal, dan update status.

#### B. 📋 Log & Rekam Jejak Wali Kelas (Kelas VIII-D Spensa)
- Khusus memfasilitasi peran Pak Edo sebagai **Wali Kelas VIII-D SMPN 1 Sragen**.
- Kategori kasus/catatan:
  - *Prestasi & Bakat*
  - *Kedisiplinan & Tata Tertib*
  - *Bimbingan Akademik*
  - *Konseling Pribadi*
  - *Kehadiran / Absensi*
  - *Komunikasi Orang Tua*
- Fitur pelacakan kontak orang tua / wali murid (WhatsApp/Panggilan rumah).
- Status penanganan: *Selesai*, *Dalam Pemantauan*, atau *Perlu Tindak Lanjut Segera*.
- **CRUD Penuh**: Tambah catatan siswa, Edit data, Hapus catatan, filter kategori & cari nama siswa/NISN.

#### C. 🎙️ Manajemen Ekskul Broadcasting & Multimedia Spensa
- **Agenda Produksi & Siaran**: Mengelola jadwal *Podcast Spensa Voice*, liputan upacara bendera, dokumenter sekolah, dan konten media sosial (YouTube, Instagram Live, TikTok Spensa).
- **Daftar Kru & Anggota**: Registrasi siswa anggota ekskul berdasarkan peran (*Host/Penyiar*, *Kameramen & DOP*, *Video Editor*, *Sound Engineer*, *Scriptwriter*) lengkap dengan nomor kontak dan angkatan.
- **Inventaris Alat Studio**: Pencatatan aset perangkat multimedia (*Sony A6400*, *Mic Wireless Hollyland*, *Mixer Audio Yamaha*, *Lighting Godox*, *Tripod*) beserta kode alat, kondisi fisik, dan status peminjaman.
- **CRUD Penuh** untuk kegiatan siaran, anggota tim, maupun inventaris alat.

---

### 3. 💰 Asisten Keuangan Pribadi
- **Ringkasan Finansial**: Saldo kas bersih, total pemasukan, total pengeluaran, dan persentase rasio tabungan keluarga.
- **Pencatatan Pemasukan**: Gaji pokok ASN guru, Tunjangan Sertifikasi Guru (TPG Triwulan), honor pembinaan ekskul broadcasting, insentif kegiatan sekolah, proyek sampingan.
- **Pencatatan Pengeluaran**: Belanja kebutuhan dapur & keluarga di Luwes/pasar, BBM motor & mobil operasional, tagihan listrik PLN/WiFi, sedekah/infak, pembelian gadget/peralatan, tabungan/investasi reksa dana.
- **Metode Pembayaran**: Rekening Bank Jateng, Rekening BCA, Uang Tunai (Cash), Dompet Digital (GoPay/OVO).
- **Visualisasi & Analisis**: Indikator alokasi pengeluaran terbesar dalam bentuk progress bar persentase.
- **CRUD Penuh**: Tambah transaksi baru (+ Pemasukan / - Pengeluaran), Edit rincian transaksi, Hapus transaksi, serta filter tipe/kategori/pencarian.

---

### 4. 📝 Agenda & Catatan Pribadi

#### A. ✅ To-Do List & Agenda Kegiatan
- Pengelompokan prioritas bertingkat: **Tinggi (Urgent)**, **Sedang**, dan **Rendah**.
- Kategori kegiatan: *Kedinasan / SMPN 1*, *Broadcasting*, *Wali Kelas*, *Pribadi*, *Keluarga*.
- Tanggal tenggat (*due date*) & jam target.
- Centang interaktif untuk menyelesaikan tugas agenda.
- **CRUD Penuh**: Tambah tugas, Edit tugas, Hapus tugas, serta filter status selesai/tertunda.

#### B. 📌 Catatan & Memo Pribadi
- Kartu memo warna-warni (*color-coded cards*): Ungu (Ide Kreatif), Biru (Dinas/Sekolah), Hijau (Pembelajaran), Amber (Keuangan/Belanja), Rose (Penting), Slate (Netral).
- Fitur **Sematkan ke Atas (Pin to Top)** untuk catatan krusial seperti catatan rapat dewan guru dan format podcast sekolah.
- **CRUD Penuh**: Tambah memo baru, Edit memo, Hapus memo, dan cari berdasarkan judul/isi/kategori.

---

### 5. 📊 Integrasi Google Sheets (Sinkronisasi Cloud Dua Arah)
- **Koneksi Otomatis / Manual**: Menghubungkan Command Center dengan Google Spreadsheet milik Pak Edo di Google Drive melalui jembatan *Google Apps Script (Web App)* tanpa biaya dan tanpa kuota terbatas.
- **Kirim Data ke Google Sheets (Push)**: Otomatis membuat dan memformat tab lembar kerja terpisah di Google Sheets:
  - `JADWAL_MENGAJAR` (Hari, Jam, Kelas, Mapel, Ruangan, Topik, Status, Catatan)
  - `LOG_WALI_KELAS` (Tanggal, Siswa, Kelas, NISN, Kategori, Observasi, Tindak Lanjut, Status, Kontak Ortu)
  - `EKSKUL_BROADCASTING` (Agenda Liputan/Podcast, Daftar Kru/Anggota Siswa, Inventaris Peralatan Studio)
  - `KEUANGAN_PRIBADI` (Tanggal, Tipe, Nominal, Kategori, Keterangan, Metode Pembayaran)
  - `AGENDA_DAN_CATATAN` (To-Do List & Catatan Memo Pribadi)
- **Tarik Pembaruan dari Google Sheets (Pull)**: Mengambil data baris yang telah disunting langsung di spreadsheet ke dalam Command Center lokal.
- **Panduan 5 Langkah & 1-Click Code Copier**: Dilengkapi tutorial langkah demi langkah di dalam aplikasi dan tombol satu klik untuk menyalin kode skrip Google Apps Script.

---

### 6. ⚙️ Pengaturan, Cadangan & Pemulihan (Backup & Restore)
- **Profil Pendidik**: Mengubah nama lengkap & gelar, NIP, nama sekolah, kelas binaan wali kelas, dan ekskul yang diampu.
- **Ekspor Cadangan (JSON)**: Mengunduh seluruh basis data aplikasi ke format `.json` hanya dengan 1 klik sehingga data tidak akan pernah hilang.
- **Impor Cadangan (JSON)**: Memulihkan kembali seluruh jadwal, catatan wali kelas, keuangan, dan agenda dari file backup sebelumnya.
- **Reset Data**: Kemampuan mengembalikan basis data ke contoh data awal SMPN 1 Sragen kapan saja dibutuhkan.
- **Penyimpanan Otomatis (Offline-First)**: Menggunakan teknologi `localStorage` modern di browser pengguna, cepat, aman, dan tanpa ketergantungan koneksi internet.

---

## 🚀 Cara Menjalankan Aplikasi

Pastikan Node.js (versi 18+) telah terpasang di komputer Anda.

```bash
# 1. Masuk ke direktori proyek
cd d:/PROJEK/ANTIGRAFITY

# 2. Pasang dependensi (jika belum dilakukan)
npm install

# 3. Jalankan server pengembangan lokal (Vite)
npm run dev

# 4. Akses melalui browser pada alamat:
# http://localhost:5173
```

Untuk membangun versi produksi (*production build*):
```bash
npm run build
```
Hasil build siap diunggah atau dijalankan melalui `npm run preview`.
