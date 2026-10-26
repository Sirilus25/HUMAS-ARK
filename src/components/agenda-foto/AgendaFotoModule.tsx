import React, { useState, useMemo } from 'react';
import {
  Plus,
  Camera,
  MapPin,
  Clock,
  User,
  Users,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AgendaFoto } from '../../types';

const tingkatBadge: Record<AgendaFoto['tingkat'], { label: string; cls: string }> = {
  sekolah: { label: 'Sekolah', cls: 'bg-slate-100 text-slate-600' },
  kota: { label: 'Kota', cls: 'bg-blue-100 text-blue-700' },
  provinsi: { label: 'Provinsi', cls: 'bg-violet-100 text-violet-700' },
  nasional: { label: 'Nasional', cls: 'bg-amber-100 text-amber-700' },
};

const statusBadge: Record<AgendaFoto['status'], { label: string; cls: string }> = {
  dijadwalkan: { label: 'Dijadwalkan', cls: 'bg-blue-100 text-blue-700' },
  sudah_difoto: { label: 'Sudah Difoto', cls: 'bg-emerald-100 text-emerald-700' },
  ditunda: { label: 'Ditunda', cls: 'bg-amber-100 text-amber-700' },
  dibatalkan: { label: 'Dibatalkan', cls: 'bg-slate-100 text-slate-500' },
};

interface FotoFormData {
  nama_lomba: string;
  tingkat: AgendaFoto['tingkat'];
  tanggal_foto: string;
  jam_foto: string;
  lokasi: string;
  fotografer: string;
  status: AgendaFoto['status'];
  catatan: string;
  tautan_hasil: string;
  siswa: { nama: string; kelas: string }[];
}

const emptyForm: FotoFormData = {
  nama_lomba: '',
  tingkat: 'sekolah',
  tanggal_foto: '',
  jam_foto: '',
  lokasi: '',
  fotografer: '',
  status: 'dijadwalkan',
  catatan: '',
  tautan_hasil: '',
  siswa: [],
};

const FotoForm: React.FC<{
  initial?: FotoFormData;
  onSubmit: (data: FotoFormData) => void;
  onCancel: () => void;
  submitLabel: string;
}> = ({ initial = emptyForm, onSubmit, onCancel, submitLabel }) => {
  const [form, setForm] = useState<FotoFormData>(initial);
  const [newSiswa, setNewSiswa] = useState({ nama: '', kelas: '' });

  const set = (k: keyof FotoFormData, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const addSiswa = () => {
    if (!newSiswa.nama || !newSiswa.kelas) return;
    setForm((p) => ({ ...p, siswa: [...p.siswa, { ...newSiswa }] }));
    setNewSiswa({ nama: '', kelas: '' });
  };

  const removeSiswa = (i: number) =>
    setForm((p) => ({ ...p, siswa: p.siswa.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_lomba || !form.tanggal_foto || !form.jam_foto || !form.lokasi || !form.fotografer) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lomba/Kegiatan *</label>
        <input className="ark-input" value={form.nama_lomba} onChange={(e) => set('nama_lomba', e.target.value)} placeholder="Nama kompetisi" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat</label>
          <select className="ark-input" value={form.tingkat} onChange={(e) => set('tingkat', e.target.value as AgendaFoto['tingkat'])}>
            <option value="sekolah">Sekolah</option>
            <option value="kota">Kota</option>
            <option value="provinsi">Provinsi</option>
            <option value="nasional">Nasional</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select className="ark-input" value={form.status} onChange={(e) => set('status', e.target.value as AgendaFoto['status'])}>
            <option value="dijadwalkan">Dijadwalkan</option>
            <option value="sudah_difoto">Sudah Difoto</option>
            <option value="ditunda">Ditunda</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Foto *</label>
          <input type="date" className="ark-input" value={form.tanggal_foto} onChange={(e) => set('tanggal_foto', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Jam Foto *</label>
          <input type="time" className="ark-input" value={form.jam_foto} onChange={(e) => set('jam_foto', e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi *</label>
        <input className="ark-input" value={form.lokasi} onChange={(e) => set('lokasi', e.target.value)} placeholder="Lokasi pemotretan" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Fotografer *</label>
        <input className="ark-input" value={form.fotografer} onChange={(e) => set('fotografer', e.target.value)} placeholder="Nama fotografer" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tautan Hasil (Opsional)</label>
        <input className="ark-input" value={form.tautan_hasil} onChange={(e) => set('tautan_hasil', e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
        <textarea className="ark-input resize-none h-16" value={form.catatan} onChange={(e) => set('catatan', e.target.value)} placeholder="Catatan opsional" />
      </div>
      {/* Siswa section */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Daftar Siswa</label>
        <div className="space-y-2 mb-2">
          {form.siswa.map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-sm">
              <span className="flex-1 font-medium text-slate-700">{s.nama}</span>
              <span className="text-slate-400 text-xs">{s.kelas}</span>
              <button type="button" onClick={() => removeSiswa(i)} className="text-rose-400 hover:text-rose-600">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="ark-input flex-1"
            placeholder="Nama siswa"
            value={newSiswa.nama}
            onChange={(e) => setNewSiswa((p) => ({ ...p, nama: e.target.value }))}
          />
          <input
            className="ark-input w-24"
            placeholder="Kelas"
            value={newSiswa.kelas}
            onChange={(e) => setNewSiswa((p) => ({ ...p, kelas: e.target.value }))}
          />
          <button type="button" onClick={addSiswa} className="ark-btn-secondary px-3">
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 ark-btn-secondary">Batal</button>
        <button type="submit" className="flex-1 ark-btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
};

const AgendaFotoModule: React.FC = () => {
  const { currentUser, agendaFoto, addAgendaFoto, updateAgendaFoto, deleteAgendaFoto, openModal, closeModal, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'guru';

  const filtered = useMemo(() => {
    return agendaFoto
      .filter((a) => {
        if (currentUser?.role === 'siswa') {
          const nama = currentUser.nama_lengkap;
          if (!a.siswa.some((s) => s.nama.toLowerCase().includes(nama.toLowerCase()))) return false;
        }
        const matchSearch =
          a.nama_lomba.toLowerCase().includes(search.toLowerCase()) ||
          a.lokasi.toLowerCase().includes(search.toLowerCase()) ||
          a.fotografer.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'semua' || a.status === filterStatus;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => b.tanggal_foto.localeCompare(a.tanggal_foto));
  }, [agendaFoto, search, filterStatus, currentUser]);

  const openAddModal = () => {
    openModal(
      'Tambah Agenda Foto',
      <FotoForm
        onSubmit={(data) => {
          addAgendaFoto(data);
          closeModal();
          showToast('success', 'Agenda foto berhasil ditambahkan!');
        }}
        onCancel={closeModal}
        submitLabel="Tambah"
      />
    );
  };

  const openEditModal = (a: AgendaFoto) => {
    openModal(
      'Edit Agenda Foto',
      <FotoForm
        initial={{
          nama_lomba: a.nama_lomba,
          tingkat: a.tingkat,
          tanggal_foto: a.tanggal_foto,
          jam_foto: a.jam_foto,
          lokasi: a.lokasi,
          fotografer: a.fotografer,
          status: a.status,
          catatan: a.catatan ?? '',
          tautan_hasil: a.tautan_hasil ?? '',
          siswa: a.siswa,
        }}
        onSubmit={(data) => {
          updateAgendaFoto(a.id, data);
          closeModal();
          showToast('success', 'Agenda foto berhasil diperbarui!');
        }}
        onCancel={closeModal}
        submitLabel="Simpan"
      />
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus agenda foto ini?')) {
      deleteAgendaFoto(id);
      showToast('info', 'Agenda foto dihapus.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="ark-input pl-9 w-full"
            placeholder="Cari nama lomba, lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="ark-input w-full sm:w-44" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="semua">Semua Status</option>
          <option value="dijadwalkan">Dijadwalkan</option>
          <option value="sudah_difoto">Sudah Difoto</option>
          <option value="ditunda">Ditunda</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>
        {canEdit && (
          <button onClick={openAddModal} className="ark-btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} />
            Tambah
          </button>
        )}
      </div>

      {currentUser?.role === 'siswa' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700 text-sm">
          Menampilkan agenda foto yang melibatkan Anda.
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Camera size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Tidak ada agenda foto ditemukan</p>
          </div>
        ) : (
          filtered.map((af) => {
            const tingkat = tingkatBadge[af.tingkat];
            const status = statusBadge[af.status];
            return (
              <div key={af.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all group flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${tingkat.cls}`}>{tingkat.label}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${status.cls}`}>{status.label}</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-3 leading-snug group-hover:text-blue-700 transition-colors">
                  {af.nama_lomba}
                </h3>
                <div className="space-y-1.5 text-xs text-slate-500 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-400 flex-shrink-0" />
                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(af.tanggal_foto))} &bull; {af.jam_foto}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                    {af.lokasi}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-slate-400 flex-shrink-0" />
                    Fotografer: {af.fotografer}
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Users size={12} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {af.siswa.map((s, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-medium">
                          {s.nama} ({s.kelas})
                        </span>
                      ))}
                      {af.siswa.length === 0 && <span className="text-slate-300">Belum ada siswa</span>}
                    </div>
                  </div>
                </div>
                {af.catatan && (
                  <p className="mt-2 text-xs text-slate-400 italic border-t border-slate-50 pt-2">"{af.catatan}"</p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  {af.tautan_hasil ? (
                    <a
                      href={af.tautan_hasil}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink size={12} />
                      Lihat Hasil
                    </a>
                  ) : (
                    <span />
                  )}
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(af)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(af.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AgendaFotoModule;
