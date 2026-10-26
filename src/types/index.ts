export type UserRole = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  nama_lengkap: string;
  role: UserRole;
  kelas?: string;
  aktif: boolean;
  email: string;
  avatar?: string;
}

export interface AgendaHumas {
  id: string;
  judul: string;
  tanggal: string; // YYYY-MM-DD
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  penanggung_jawab: string;
  catatan?: string;
  status: 'direncanakan' | 'berlangsung' | 'selesai' | 'dibatalkan';
  dibuat_oleh: string;
  created_at: string;
}

export interface AgendaFoto {
  id: string;
  nama_lomba: string;
  tingkat: 'sekolah' | 'kota' | 'provinsi' | 'nasional';
  tanggal_foto: string;
  jam_foto: string;
  lokasi: string;
  fotografer: string;
  status: 'dijadwalkan' | 'sudah_difoto' | 'ditunda' | 'dibatalkan';
  catatan?: string;
  tautan_hasil?: string;
  siswa: { nama: string; kelas: string }[];
  dibuat_oleh: string;
}

export interface BungaTabur {
  id: string;
  tanggal: string;
  jenis: 'masuk' | 'keluar';
  nominal: number;
  keterangan: string;
  dicatat_oleh: string;
  created_at: string;
}

export interface Kurasi {
  id: string;
  siswa_id: string;
  nama_siswa: string;
  kelas: string;
  judul: string;
  deskripsi: string;
  tanggal_kegiatan: string;
  lampiran_url?: string;
  status: 'menunggu' | 'disetujui' | 'revisi' | 'ditolak';
  komentar_reviewer?: string;
  direview_oleh?: string;
  created_at: string;
}

export type ActivePage =
  | 'dashboard'
  | 'agenda-humas'
  | 'agenda-foto'
  | 'bunga-tabur'
  | 'kurasi'
  | 'pengguna'
  | 'profil';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
