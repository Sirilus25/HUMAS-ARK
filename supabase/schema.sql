-- ============================================================
-- WEB HUMAS ARK — SQL SCHEMA LENGKAP
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- -------------------------------------------------------
-- 1. TABEL PROFILES (extend auth.users)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  nama_lengkap text NOT NULL,
  role        text NOT NULL CHECK (role IN ('admin', 'guru', 'siswa')) DEFAULT 'siswa',
  kelas       text,
  aktif       boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama_lengkap, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'siswa')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -------------------------------------------------------
-- 2. TABEL AGENDA HUMAS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agenda_humas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul            text NOT NULL,
  tanggal          date NOT NULL,
  jam_mulai        time NOT NULL,
  jam_selesai      time NOT NULL,
  lokasi           text NOT NULL,
  penanggung_jawab text NOT NULL,
  catatan          text,
  status           text NOT NULL CHECK (status IN ('direncanakan', 'berlangsung', 'selesai', 'dibatalkan')) DEFAULT 'direncanakan',
  dibuat_oleh      uuid REFERENCES public.profiles(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 3. TABEL AGENDA FOTO
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agenda_foto (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_lomba   text NOT NULL,
  tingkat      text NOT NULL CHECK (tingkat IN ('sekolah', 'kota', 'provinsi', 'nasional')),
  tanggal_foto date NOT NULL,
  jam_foto     time NOT NULL,
  lokasi       text NOT NULL,
  fotografer   text NOT NULL,
  status       text NOT NULL CHECK (status IN ('dijadwalkan', 'sudah_difoto', 'ditunda', 'dibatalkan')) DEFAULT 'dijadwalkan',
  catatan      text,
  tautan_hasil text,
  dibuat_oleh  uuid REFERENCES public.profiles(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Tabel relasi siswa per jadwal foto
CREATE TABLE IF NOT EXISTS public.agenda_foto_siswa (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_foto_id uuid NOT NULL REFERENCES public.agenda_foto(id) ON DELETE CASCADE,
  nama_siswa     text NOT NULL,
  kelas          text NOT NULL
);

-- -------------------------------------------------------
-- 4. TABEL BUNGA TABUR (Keuangan)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bunga_tabur (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal     date NOT NULL,
  jenis       text NOT NULL CHECK (jenis IN ('masuk', 'keluar')),
  nominal     numeric(14,2) NOT NULL CHECK (nominal > 0),
  keterangan  text NOT NULL,
  dicatat_oleh uuid REFERENCES public.profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 5. TABEL KURASI
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kurasi (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id          uuid NOT NULL REFERENCES public.profiles(id),
  judul             text NOT NULL,
  deskripsi         text NOT NULL,
  tanggal_kegiatan  date NOT NULL,
  lampiran_url      text,
  status            text NOT NULL CHECK (status IN ('menunggu', 'disetujui', 'revisi', 'ditolak')) DEFAULT 'menunggu',
  komentar_reviewer text,
  direview_oleh     uuid REFERENCES public.profiles(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 6. UPDATED_AT TRIGGER (untuk semua tabel)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['agenda_humas','agenda_foto','bunga_tabur','kurasi']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON public.%I;
       CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- -------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS)
-- -------------------------------------------------------

-- Helper function untuk mengambil role user aktif
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND aktif = true LIMIT 1;
$$;

-- Enable RLS semua tabel
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_humas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_foto   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_foto_siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bunga_tabur   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kurasi        ENABLE ROW LEVEL SECURITY;

-- === PROFILES ===
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR get_my_role() IN ('admin', 'guru'));

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT
  WITH CHECK (get_my_role() = 'admin' OR id = auth.uid());

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR get_my_role() = 'admin')
  WITH CHECK (
    get_my_role() = 'admin' OR
    (id = auth.uid() AND (role IS NULL OR role = (SELECT role FROM public.profiles WHERE id = auth.uid())))
  );

DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE
  USING (get_my_role() = 'admin');

-- === AGENDA HUMAS ===
DROP POLICY IF EXISTS "agenda_humas_select" ON public.agenda_humas;
CREATE POLICY "agenda_humas_select" ON public.agenda_humas FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "agenda_humas_insert" ON public.agenda_humas;
CREATE POLICY "agenda_humas_insert" ON public.agenda_humas FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'guru'));

DROP POLICY IF EXISTS "agenda_humas_update" ON public.agenda_humas;
CREATE POLICY "agenda_humas_update" ON public.agenda_humas FOR UPDATE
  USING (get_my_role() = 'admin' OR (get_my_role() = 'guru' AND dibuat_oleh = auth.uid()));

DROP POLICY IF EXISTS "agenda_humas_delete" ON public.agenda_humas;
CREATE POLICY "agenda_humas_delete" ON public.agenda_humas FOR DELETE
  USING (get_my_role() = 'admin');

-- === AGENDA FOTO ===
DROP POLICY IF EXISTS "agenda_foto_select" ON public.agenda_foto;
CREATE POLICY "agenda_foto_select" ON public.agenda_foto FOR SELECT
  USING (
    get_my_role() IN ('admin', 'guru') OR
    EXISTS (
      SELECT 1 FROM public.agenda_foto_siswa afs
      JOIN public.profiles p ON lower(afs.nama_siswa) = lower(p.nama_lengkap)
      WHERE afs.agenda_foto_id = agenda_foto.id AND p.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "agenda_foto_insert" ON public.agenda_foto;
CREATE POLICY "agenda_foto_insert" ON public.agenda_foto FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'guru'));

DROP POLICY IF EXISTS "agenda_foto_update" ON public.agenda_foto;
CREATE POLICY "agenda_foto_update" ON public.agenda_foto FOR UPDATE
  USING (get_my_role() = 'admin' OR (get_my_role() = 'guru' AND dibuat_oleh = auth.uid()));

DROP POLICY IF EXISTS "agenda_foto_delete" ON public.agenda_foto;
CREATE POLICY "agenda_foto_delete" ON public.agenda_foto FOR DELETE
  USING (get_my_role() = 'admin');

-- === AGENDA FOTO SISWA ===
DROP POLICY IF EXISTS "afs_select" ON public.agenda_foto_siswa;
CREATE POLICY "afs_select" ON public.agenda_foto_siswa FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "afs_insert" ON public.agenda_foto_siswa;
CREATE POLICY "afs_insert" ON public.agenda_foto_siswa FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'guru'));

DROP POLICY IF EXISTS "afs_delete" ON public.agenda_foto_siswa;
CREATE POLICY "afs_delete" ON public.agenda_foto_siswa FOR DELETE
  USING (get_my_role() IN ('admin', 'guru'));

-- === BUNGA TABUR ===
DROP POLICY IF EXISTS "bunga_tabur_select" ON public.bunga_tabur;
CREATE POLICY "bunga_tabur_select" ON public.bunga_tabur FOR SELECT
  USING (get_my_role() IN ('admin', 'guru'));

DROP POLICY IF EXISTS "bunga_tabur_insert" ON public.bunga_tabur;
CREATE POLICY "bunga_tabur_insert" ON public.bunga_tabur FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

DROP POLICY IF EXISTS "bunga_tabur_update" ON public.bunga_tabur;
CREATE POLICY "bunga_tabur_update" ON public.bunga_tabur FOR UPDATE
  USING (get_my_role() = 'admin');

DROP POLICY IF EXISTS "bunga_tabur_delete" ON public.bunga_tabur;
CREATE POLICY "bunga_tabur_delete" ON public.bunga_tabur FOR DELETE
  USING (get_my_role() = 'admin');

-- === KURASI ===
DROP POLICY IF EXISTS "kurasi_select" ON public.kurasi;
CREATE POLICY "kurasi_select" ON public.kurasi FOR SELECT
  USING (
    get_my_role() IN ('admin', 'guru') OR
    siswa_id = auth.uid()
  );

DROP POLICY IF EXISTS "kurasi_insert" ON public.kurasi;
CREATE POLICY "kurasi_insert" ON public.kurasi FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'siswa') AND siswa_id = auth.uid());

DROP POLICY IF EXISTS "kurasi_update" ON public.kurasi;
CREATE POLICY "kurasi_update" ON public.kurasi FOR UPDATE
  USING (
    get_my_role() = 'admin' OR
    get_my_role() = 'guru' OR
    (siswa_id = auth.uid() AND status IN ('menunggu', 'revisi'))
  );

DROP POLICY IF EXISTS "kurasi_delete" ON public.kurasi;
CREATE POLICY "kurasi_delete" ON public.kurasi FOR DELETE
  USING (
    get_my_role() = 'admin' OR
    (siswa_id = auth.uid() AND status IN ('menunggu', 'revisi'))
  );

-- -------------------------------------------------------
-- 8. AKUN ADMIN PERTAMA
-- -------------------------------------------------------
-- Jalankan SETELAH membuat akun Admin via Supabase Auth > Users > Add User
-- Ganti 'UID-DARI-AUTH-USER' dengan UUID yang muncul setelah membuat user
--
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'UID-DARI-AUTH-USER';
--
-- Atau langsung insert jika trigger belum jalan:
-- INSERT INTO public.profiles (id, email, nama_lengkap, role)
-- VALUES ('UID-DARI-AUTH-USER', 'admin@ark.sch.id', 'Admin ARK', 'admin');
