import React, { useState, useMemo } from 'react';
import { Plus, ClipboardCheck, Search, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Kurasi } from '../../types';

const formatDate = (d: string) => {
  try {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(d));
  } catch {
    return d;
  }
};

const statusChip: Record<Kurasi['status'], { label: string; cls: string }> = {
  menunggu: { label: 'Menunggu', cls: 'bg-amber-100 text-amber-700' },
  disetujui: { label: 'Disetujui', cls: 'bg-emerald-100 text-emerald-700' },
  revisi: { label: 'Revisi', cls: 'bg-orange-100 text-orange-700' },
  ditolak: { label: 'Ditolak', cls: 'bg-rose-100 text-rose-700' },
};

interface KurasiFormData {
  judul: string;
  deskripsi: string;
  tanggal_kegiatan: string;
  lampiran_url: string;
}

const KurasiForm: React.FC<{
  initial?: KurasiFormData;
  onSubmit: (data: KurasiFormData) => void;
  onCancel: () => void;
  submitLabel: string;
}> = ({ initial, onSubmit, onCancel, submitLabel }) => {
  const [form, setForm] = useState<KurasiFormData>(
    initial ?? { judul: '', deskripsi: '', tanggal_kegiatan: '', lampiran_url: '' }
  );
  const set = (k: keyof KurasiFormData, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul || !form.deskripsi || !form.tanggal_kegiatan) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Judul Prestasi/Kegiatan *</label>
        <input className="ark-input" value={form.judul} onChange={(e) => set('judul', e.target.value)} placeholder="Judul prestasi atau kegiatan" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi *</label>
        <textarea
          className="ark-input resize-none h-28"
          value={form.deskripsi}
          onChange={(e) => set('deskripsi', e.target.value)}
          placeholder="Ceritakan detail prestasi/kegiatan Anda..."
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Kegiatan *</label>
        <input type="date" className="ark-input" value={form.tanggal_kegiatan} onChange={(e) => set('tanggal_kegiatan', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Lampiran/Tautan Bukti</label>
        <input className="ark-input" value={form.lampiran_url} onChange={(e) => set('lampiran_url', e.target.value)} placeholder="https://drive.google.com/..." />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 ark-btn-secondary">Batal</button>
        <button type="submit" className="flex-1 ark-btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
};

interface ReviewFormData {
  status: Kurasi['status'];
  komentar: string;
}

const ReviewForm: React.FC<{
  kurasi: Kurasi;
  onSubmit: (data: ReviewFormData) => void;
  onCancel: () => void;
}> = ({ kurasi, onSubmit, onCancel }) => {
  const { currentUser } = useApp();
  const [form, setForm] = useState<ReviewFormData>({
    status: kurasi.status,
    komentar: kurasi.komentar_reviewer ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-xs text-slate-400 mb-1">Siswa</p>
        <p className="text-sm font-semibold text-slate-800">{kurasi.nama_siswa} — {kurasi.kelas}</p>
        <p className="text-xs text-slate-400 mt-2 mb-1">Prestasi</p>
        <p className="text-sm font-bold text-slate-800">{kurasi.judul}</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{kurasi.deskripsi}</p>
        {kurasi.lampiran_url && (
          <a href={kurasi.lampiran_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 block">
            Lihat Lampiran →
          </a>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Keputusan Review</label>
          <div className="grid grid-cols-2 gap-2">
            {(['disetujui', 'revisi', 'ditolak', 'menunggu'] as Kurasi['status'][]).map((s) => {
              const chip = statusChip[s];
              return (
                <label
                  key={s}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.status === s ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => setForm((p) => ({ ...p, status: s }))} className="sr-only" />
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${chip.cls}`}>{chip.label}</span>
                </label>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Komentar Reviewer</label>
          <textarea
            className="ark-input resize-none h-20"
            value={form.komentar}
            onChange={(e) => setForm((p) => ({ ...p, komentar: e.target.value }))}
            placeholder="Tulis komentar atau feedback untuk siswa..."
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 ark-btn-secondary">Batal</button>
          <button type="submit" className="flex-1 ark-btn-primary">Simpan Review</button>
        </div>
      </form>
    </div>
  );
};

const KurasiModule: React.FC = () => {
  const { currentUser, kurasi, addKurasi, updateKurasi, deleteKurasi, openModal, closeModal, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterKelas, setFilterKelas] = useState<string>('semua');

  const isSiswa = currentUser?.role === 'siswa';
  const canReview = currentUser?.role === 'admin' || currentUser?.role === 'guru';

  const myKurasi = useMemo(
    () => kurasi.filter((k) => k.siswa_id === currentUser?.id).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [kurasi, currentUser]
  );

  const filtered = useMemo(() => {
    return kurasi
      .filter((k) => {
        const matchSearch =
          k.nama_siswa.toLowerCase().includes(search.toLowerCase()) ||
          k.judul.toLowerCase().includes(search.toLowerCase()) ||
          k.kelas.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'semua' || k.status === filterStatus;
        const matchKelas = filterKelas === 'semua' || k.kelas === filterKelas;
        return matchSearch && matchStatus && matchKelas;
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [kurasi, search, filterStatus, filterKelas]);

  const kelasList = useMemo(() => {
    const set = new Set(kurasi.map((k) => k.kelas));
    return Array.from(set).sort();
  }, [kurasi]);

  const openAddModal = () => {
    openModal(
      'Isi Kurasi Baru',
      <KurasiForm
        onSubmit={(data) => {
          addKurasi(data);
          closeModal();
          showToast('success', 'Kurasi berhasil diajukan! Menunggu review.');
        }}
        onCancel={closeModal}
        submitLabel="Kirim"
      />
    );
  };

  const openReviewModal = (k: Kurasi) => {
    openModal(
      'Review Kurasi',
      <ReviewForm
        kurasi={k}
        onSubmit={(data) => {
          updateKurasi(k.id, {
            status: data.status,
            komentar_reviewer: data.komentar,
            direview_oleh: currentUser?.nama_lengkap,
          });
          closeModal();
          showToast('success', 'Review berhasil disimpan!');
        }}
        onCancel={closeModal}
      />
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus kurasi ini?')) {
      deleteKurasi(id);
      showToast('info', 'Kurasi dihapus.');
    }
  };

  // Siswa view
  if (isSiswa) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Kurasi Saya</h3>
            <p className="text-sm text-slate-400 mt-0.5">Prestasi dan kegiatan yang Anda ajukan</p>
          </div>
          <button onClick={openAddModal} className="ark-btn-primary flex items-center gap-2">
            <Plus size={16} />
            Isi Kurasi Baru
          </button>
        </div>
        {myKurasi.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-16 text-center text-slate-400">
            <ClipboardCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada kurasi yang diajukan</p>
            <p className="text-sm mt-1">Klik "Isi Kurasi Baru" untuk mengajukan prestasi Anda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myKurasi.map((k) => {
              const chip = statusChip[k.status];
              return (
                <div key={k.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-bold text-slate-800 flex-1">{k.judul}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 ${chip.cls}`}>{chip.label}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-2">{k.deskripsi}</p>
                  <p className="text-xs text-slate-400">{formatDate(k.tanggal_kegiatan)}</p>
                  {k.komentar_reviewer && (
                    <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2.5 border border-blue-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MessageSquare size={12} className="text-blue-500" />
                        <p className="text-xs font-semibold text-blue-700">Komentar dari {k.direview_oleh}</p>
                      </div>
                      <p className="text-xs text-blue-600">{k.komentar_reviewer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Admin/Guru view
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="ark-input pl-9 w-full" placeholder="Cari nama, judul, kelas..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="ark-input w-full sm:w-40" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="semua">Semua Status</option>
          <option value="menunggu">Menunggu</option>
          <option value="disetujui">Disetujui</option>
          <option value="revisi">Revisi</option>
          <option value="ditolak">Ditolak</option>
        </select>
        <select className="ark-input w-full sm:w-36" value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}>
          <option value="semua">Semua Kelas</option>
          {kelasList.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ClipboardCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Tidak ada kurasi ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((k) => {
              const chip = statusChip[k.status];
              return (
                <div key={k.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-all group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">{k.judul}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-medium text-slate-500">{k.nama_siswa}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">{k.kelas}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">{formatDate(k.tanggal_kegiatan)}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 ${chip.cls}`}>{chip.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{k.deskripsi}</p>
                    {k.komentar_reviewer && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <MessageSquare size={11} />
                        <span className="italic truncate">{k.komentar_reviewer}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canReview && (
                      <button onClick={() => openReviewModal(k)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Review">
                        <ClipboardCheck size={15} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(k.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" title="Hapus">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default KurasiModule;
