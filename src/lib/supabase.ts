import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nama_lengkap: string;
          role: 'admin' | 'guru' | 'siswa';
          kelas: string | null;
          aktif: boolean;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          nama_lengkap: string;
          role: 'admin' | 'guru' | 'siswa';
          kelas?: string | null;
          aktif?: boolean;
          email: string;
        };
        Update: {
          nama_lengkap?: string;
          role?: 'admin' | 'guru' | 'siswa';
          kelas?: string | null;
          aktif?: boolean;
        };
      };
      agenda_humas: {
        Row: {
          id: string;
          judul: string;
          tanggal: string;
          jam_mulai: string;
          jam_selesai: string;
          lokasi: string;
          penanggung_jawab: string;
          catatan: string | null;
          status: 'direncanakan' | 'berlangsung' | 'selesai' | 'dibatalkan';
          dibuat_oleh: string;
          created_at: string;
          updated_at: string;
        };
      };
      agenda_foto: {
        Row: {
          id: string;
          nama_lomba: string;
          tingkat: 'sekolah' | 'kota' | 'provinsi' | 'nasional';
          tanggal_foto: string;
          jam_foto: string;
          lokasi: string;
          fotografer: string;
          status: 'dijadwalkan' | 'sudah_difoto' | 'ditunda' | 'dibatalkan';
          catatan: string | null;
          tautan_hasil: string | null;
          dibuat_oleh: string;
          created_at: string;
          updated_at: string;
        };
      };
      agenda_foto_siswa: {
        Row: {
          id: string;
          agenda_foto_id: string;
          nama_siswa: string;
          kelas: string;
        };
      };
      bunga_tabur: {
        Row: {
          id: string;
          tanggal: string;
          jenis: 'masuk' | 'keluar';
          nominal: number;
          keterangan: string;
          dicatat_oleh: string;
          created_at: string;
          updated_at: string;
        };
      };
      kurasi: {
        Row: {
          id: string;
          siswa_id: string;
          judul: string;
          deskripsi: string;
          tanggal_kegiatan: string;
          lampiran_url: string | null;
          status: 'menunggu' | 'disetujui' | 'revisi' | 'ditolak';
          komentar_reviewer: string | null;
          direview_oleh: string | null;
          created_at: string;
          updated_at: string;
          profiles?: {
            nama_lengkap: string;
            kelas: string | null;
          };
        };
      };
    };
  };
};
