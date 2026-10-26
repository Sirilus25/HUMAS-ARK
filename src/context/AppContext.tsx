import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import {
  User,
  AgendaHumas,
  AgendaFoto,
  BungaTabur,
  Kurasi,
  ActivePage,
  ToastItem,
} from '../types';

interface AppContextType {
  // Auth
  currentUser: User | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Navigation
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;

  // Users
  users: User[];
  loadingUsers: boolean;
  fetchUsers: () => Promise<void>;
  addUser: (user: { email: string; password: string; nama_lengkap: string; role: User['role']; kelas?: string }) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Agenda Humas
  agendaHumas: AgendaHumas[];
  loadingAgenda: boolean;
  fetchAgendaHumas: () => Promise<void>;
  addAgendaHumas: (agenda: Omit<AgendaHumas, 'id' | 'dibuat_oleh' | 'created_at'>) => Promise<void>;
  updateAgendaHumas: (id: string, updates: Partial<AgendaHumas>) => Promise<void>;
  deleteAgendaHumas: (id: string) => Promise<void>;

  // Agenda Foto
  agendaFoto: AgendaFoto[];
  loadingFoto: boolean;
  fetchAgendaFoto: () => Promise<void>;
  addAgendaFoto: (agenda: Omit<AgendaFoto, 'id' | 'dibuat_oleh'>) => Promise<void>;
  updateAgendaFoto: (id: string, updates: Partial<AgendaFoto>, siswa?: { nama: string; kelas: string }[]) => Promise<void>;
  deleteAgendaFoto: (id: string) => Promise<void>;

  // Bunga Tabur
  bungaTabur: BungaTabur[];
  loadingBunga: boolean;
  fetchBungaTabur: () => Promise<void>;
  addBungaTabur: (transaksi: Omit<BungaTabur, 'id' | 'dicatat_oleh' | 'created_at'>) => Promise<void>;
  updateBungaTabur: (id: string, updates: Partial<BungaTabur>) => Promise<void>;
  deleteBungaTabur: (id: string) => Promise<void>;

  // Kurasi
  kurasi: Kurasi[];
  loadingKurasi: boolean;
  fetchKurasi: () => Promise<void>;
  addKurasi: (k: Omit<Kurasi, 'id' | 'siswa_id' | 'nama_siswa' | 'kelas' | 'status' | 'created_at'>) => Promise<void>;
  updateKurasi: (id: string, updates: Partial<Kurasi>) => Promise<void>;
  deleteKurasi: (id: string) => Promise<void>;

  // Toast
  toasts: ToastItem[];
  showToast: (type: ToastItem['type'], message: string) => void;
  removeToast: (id: string) => void;

  // Modal
  modalOpen: boolean;
  modalTitle: string;
  modalContent: ReactNode;
  openModal: (title: string, content: ReactNode) => void;
  closeModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [agendaHumas, setAgendaHumas] = useState<AgendaHumas[]>([]);
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [agendaFoto, setAgendaFoto] = useState<AgendaFoto[]>([]);
  const [loadingFoto, setLoadingFoto] = useState(false);
  const [bungaTabur, setBungaTabur] = useState<BungaTabur[]>([]);
  const [loadingBunga, setLoadingBunga] = useState(false);
  const [kurasi, setKurasi] = useState<Kurasi[]>([]);
  const [loadingKurasi, setLoadingKurasi] = useState(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState<ReactNode>(null);

  // ── Toast ──────────────────────────────────────────────
  const showToast = useCallback((type: ToastItem['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Modal ──────────────────────────────────────────────
  const openModal = useCallback((title: string, content: ReactNode) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalTitle('');
    setModalContent(null);
  }, []);

  // ── Helper: fetch profile by uid ───────────────────────
  const fetchProfile = async (uid: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      nama_lengkap: data.nama_lengkap,
      role: data.role as User['role'],
      kelas: data.kelas ?? undefined,
      aktif: data.aktif,
      email: data.email,
    };
  };

  // ── Auth Init ──────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) setCurrentUser(profile);
      }
      if (mounted) setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) setCurrentUser(profile);
      } else {
        if (mounted) setCurrentUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Auth ───────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;
    const profile = await fetchProfile(data.user.id);
    if (!profile || !profile.aktif) {
      await supabase.auth.signOut();
      return false;
    }
    setCurrentUser(profile);
    setActivePage('dashboard');
    return true;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActivePage('dashboard');
  }, []);

  // ── Users ──────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase.from('profiles').select('*').order('nama_lengkap');
    if (!error && data) {
      setUsers(data.map((d) => ({
        id: d.id,
        nama_lengkap: d.nama_lengkap,
        role: d.role as User['role'],
        kelas: d.kelas ?? undefined,
        aktif: d.aktif,
        email: d.email,
      })));
    }
    setLoadingUsers(false);
  }, []);

  const addUser = useCallback(async (user: { email: string; password: string; nama_lengkap: string; role: User['role']; kelas?: string }) => {
    // Create auth user via Supabase Admin (we use anon key — only admin can create via profile insert)
    // For now: admin invites via email or we do a sign-up
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: { nama_lengkap: user.nama_lengkap, role: user.role },
      },
    });
    if (error) throw new Error(error.message);
    if (data.user) {
      // Update profile with correct role & kelas (trigger creates it, we update)
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        kelas: user.kelas ?? null,
        aktif: true,
      });
    }
    await fetchUsers();
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    const { error } = await supabase.from('profiles').update({
      nama_lengkap: updates.nama_lengkap,
      role: updates.role,
      kelas: updates.kelas ?? null,
      aktif: updates.aktif,
    }).eq('id', id);
    if (error) throw new Error(error.message);
    if (currentUser?.id === id) {
      setCurrentUser((prev) => prev ? { ...prev, ...updates } : prev);
    }
    await fetchUsers();
  }, [currentUser, fetchUsers]);

  const deleteUser = useCallback(async (id: string) => {
    // Soft delete: set aktif = false
    await supabase.from('profiles').update({ aktif: false }).eq('id', id);
    await fetchUsers();
  }, [fetchUsers]);

  // ── Agenda Humas ───────────────────────────────────────
  const fetchAgendaHumas = useCallback(async () => {
    setLoadingAgenda(true);
    const { data, error } = await supabase
      .from('agenda_humas')
      .select('*')
      .order('tanggal', { ascending: false });
    if (!error && data) {
      setAgendaHumas(data.map((d) => ({
        id: d.id,
        judul: d.judul,
        tanggal: d.tanggal,
        jam_mulai: d.jam_mulai,
        jam_selesai: d.jam_selesai,
        lokasi: d.lokasi,
        penanggung_jawab: d.penanggung_jawab,
        catatan: d.catatan ?? undefined,
        status: d.status as AgendaHumas['status'],
        dibuat_oleh: d.dibuat_oleh,
        created_at: d.created_at,
      })));
    }
    setLoadingAgenda(false);
  }, []);

  const addAgendaHumas = useCallback(async (agenda: Omit<AgendaHumas, 'id' | 'dibuat_oleh' | 'created_at'>) => {
    const { error } = await supabase.from('agenda_humas').insert({
      ...agenda,
      dibuat_oleh: currentUser?.id,
    });
    if (error) throw new Error(error.message);
    await fetchAgendaHumas();
  }, [currentUser, fetchAgendaHumas]);

  const updateAgendaHumas = useCallback(async (id: string, updates: Partial<AgendaHumas>) => {
    const { error } = await supabase.from('agenda_humas').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
    await fetchAgendaHumas();
  }, [fetchAgendaHumas]);

  const deleteAgendaHumas = useCallback(async (id: string) => {
    const { error } = await supabase.from('agenda_humas').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await fetchAgendaHumas();
  }, [fetchAgendaHumas]);

  // ── Agenda Foto ────────────────────────────────────────
  const fetchAgendaFoto = useCallback(async () => {
    setLoadingFoto(true);
    const { data, error } = await supabase
      .from('agenda_foto')
      .select('*, agenda_foto_siswa(nama_siswa, kelas)')
      .order('tanggal_foto', { ascending: false });
    if (!error && data) {
      setAgendaFoto(data.map((d) => ({
        id: d.id,
        nama_lomba: d.nama_lomba,
        tingkat: d.tingkat as AgendaFoto['tingkat'],
        tanggal_foto: d.tanggal_foto,
        jam_foto: d.jam_foto,
        lokasi: d.lokasi,
        fotografer: d.fotografer,
        status: d.status as AgendaFoto['status'],
        catatan: d.catatan ?? undefined,
        tautan_hasil: d.tautan_hasil ?? undefined,
        siswa: (d.agenda_foto_siswa ?? []).map((s: { nama_siswa: string; kelas: string }) => ({
          nama: s.nama_siswa,
          kelas: s.kelas,
        })),
        dibuat_oleh: d.dibuat_oleh,
      })));
    }
    setLoadingFoto(false);
  }, []);

  const addAgendaFoto = useCallback(async (agenda: Omit<AgendaFoto, 'id' | 'dibuat_oleh'>) => {
    const { siswa, ...rest } = agenda;
    const { data, error } = await supabase.from('agenda_foto').insert({
      ...rest,
      dibuat_oleh: currentUser?.id,
    }).select().single();
    if (error || !data) throw new Error(error?.message ?? 'Gagal menyimpan');
    // Insert siswa
    if (siswa.length > 0) {
      await supabase.from('agenda_foto_siswa').insert(
        siswa.map((s) => ({ agenda_foto_id: data.id, nama_siswa: s.nama, kelas: s.kelas }))
      );
    }
    await fetchAgendaFoto();
  }, [currentUser, fetchAgendaFoto]);

  const updateAgendaFoto = useCallback(async (id: string, updates: Partial<AgendaFoto>, siswa?: { nama: string; kelas: string }[]) => {
    const { siswa: _s, ...rest } = updates;
    const { error } = await supabase.from('agenda_foto').update(rest).eq('id', id);
    if (error) throw new Error(error.message);
    if (siswa !== undefined) {
      await supabase.from('agenda_foto_siswa').delete().eq('agenda_foto_id', id);
      if (siswa.length > 0) {
        await supabase.from('agenda_foto_siswa').insert(
          siswa.map((s) => ({ agenda_foto_id: id, nama_siswa: s.nama, kelas: s.kelas }))
        );
      }
    }
    await fetchAgendaFoto();
  }, [fetchAgendaFoto]);

  const deleteAgendaFoto = useCallback(async (id: string) => {
    const { error } = await supabase.from('agenda_foto').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await fetchAgendaFoto();
  }, [fetchAgendaFoto]);

  // ── Bunga Tabur ────────────────────────────────────────
  const fetchBungaTabur = useCallback(async () => {
    setLoadingBunga(true);
    const { data, error } = await supabase
      .from('bunga_tabur')
      .select('*, profiles(nama_lengkap)')
      .order('tanggal', { ascending: false });
    if (!error && data) {
      setBungaTabur(data.map((d) => ({
        id: d.id,
        tanggal: d.tanggal,
        jenis: d.jenis as BungaTabur['jenis'],
        nominal: Number(d.nominal),
        keterangan: d.keterangan,
        dicatat_oleh: (d.profiles as { nama_lengkap: string } | null)?.nama_lengkap ?? 'Admin',
        created_at: d.created_at,
      })));
    }
    setLoadingBunga(false);
  }, []);

  const addBungaTabur = useCallback(async (transaksi: Omit<BungaTabur, 'id' | 'dicatat_oleh' | 'created_at'>) => {
    const { error } = await supabase.from('bunga_tabur').insert({
      ...transaksi,
      dicatat_oleh: currentUser?.id,
    });
    if (error) throw new Error(error.message);
    await fetchBungaTabur();
  }, [currentUser, fetchBungaTabur]);

  const updateBungaTabur = useCallback(async (id: string, updates: Partial<BungaTabur>) => {
    const { error } = await supabase.from('bunga_tabur').update({
      tanggal: updates.tanggal,
      jenis: updates.jenis,
      nominal: updates.nominal,
      keterangan: updates.keterangan,
    }).eq('id', id);
    if (error) throw new Error(error.message);
    await fetchBungaTabur();
  }, [fetchBungaTabur]);

  const deleteBungaTabur = useCallback(async (id: string) => {
    const { error } = await supabase.from('bunga_tabur').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await fetchBungaTabur();
  }, [fetchBungaTabur]);

  // ── Kurasi ─────────────────────────────────────────────
  const fetchKurasi = useCallback(async () => {
    setLoadingKurasi(true);
    const { data, error } = await supabase
      .from('kurasi')
      .select('*, profiles(nama_lengkap, kelas)')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setKurasi(data.map((d) => ({
        id: d.id,
        siswa_id: d.siswa_id,
        nama_siswa: (d.profiles as { nama_lengkap: string } | null)?.nama_lengkap ?? '?',
        kelas: (d.profiles as { kelas: string | null } | null)?.kelas ?? '-',
        judul: d.judul,
        deskripsi: d.deskripsi,
        tanggal_kegiatan: d.tanggal_kegiatan,
        lampiran_url: d.lampiran_url ?? undefined,
        status: d.status as Kurasi['status'],
        komentar_reviewer: d.komentar_reviewer ?? undefined,
        direview_oleh: d.direview_oleh ?? undefined,
        created_at: d.created_at,
      })));
    }
    setLoadingKurasi(false);
  }, []);

  const addKurasi = useCallback(async (k: Omit<Kurasi, 'id' | 'siswa_id' | 'nama_siswa' | 'kelas' | 'status' | 'created_at'>) => {
    const { error } = await supabase.from('kurasi').insert({
      ...k,
      siswa_id: currentUser?.id,
      status: 'menunggu',
    });
    if (error) throw new Error(error.message);
    await fetchKurasi();
  }, [currentUser, fetchKurasi]);

  const updateKurasi = useCallback(async (id: string, updates: Partial<Kurasi>) => {
    const { error } = await supabase.from('kurasi').update({
      judul: updates.judul,
      deskripsi: updates.deskripsi,
      tanggal_kegiatan: updates.tanggal_kegiatan,
      lampiran_url: updates.lampiran_url ?? null,
      status: updates.status,
      komentar_reviewer: updates.komentar_reviewer ?? null,
      direview_oleh: updates.direview_oleh ?? null,
    }).eq('id', id);
    if (error) throw new Error(error.message);
    await fetchKurasi();
  }, [fetchKurasi]);

  const deleteKurasi = useCallback(async (id: string) => {
    const { error } = await supabase.from('kurasi').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await fetchKurasi();
  }, [fetchKurasi]);

  // ── Fetch data saat user login ─────────────────────────
  useEffect(() => {
    if (currentUser) {
      fetchAgendaHumas();
      fetchAgendaFoto();
      fetchKurasi();
      if (currentUser.role !== 'siswa') {
        fetchBungaTabur();
        fetchUsers();
      }
    }
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppContext.Provider
      value={{
        currentUser,
        authLoading,
        login,
        logout,
        activePage,
        setActivePage,
        users,
        loadingUsers,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
        agendaHumas,
        loadingAgenda,
        fetchAgendaHumas,
        addAgendaHumas,
        updateAgendaHumas,
        deleteAgendaHumas,
        agendaFoto,
        loadingFoto,
        fetchAgendaFoto,
        addAgendaFoto,
        updateAgendaFoto,
        deleteAgendaFoto,
        bungaTabur,
        loadingBunga,
        fetchBungaTabur,
        addBungaTabur,
        updateBungaTabur,
        deleteBungaTabur,
        kurasi,
        loadingKurasi,
        fetchKurasi,
        addKurasi,
        updateKurasi,
        deleteKurasi,
        toasts,
        showToast,
        removeToast,
        modalOpen,
        modalTitle,
        modalContent,
        openModal,
        closeModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
