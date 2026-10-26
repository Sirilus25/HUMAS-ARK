import React, { useState, useMemo } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Pencil, Trash2, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BungaTabur } from '../../types';

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) => {
  try {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(d));
  } catch {
    return d;
  }
};

interface TransaksiFormData {
  tanggal: string;
  jenis: 'masuk' | 'keluar';
  nominal: string;
  keterangan: string;
}

const TransaksiForm: React.FC<{
  initial?: TransaksiFormData;
  onSubmit: (data: Omit<BungaTabur, 'id' | 'dicatat_oleh' | 'created_at'>) => void;
  onCancel: () => void;
  submitLabel: string;
}> = ({ initial, onSubmit, onCancel, submitLabel }) => {
  const [form, setForm] = useState<TransaksiFormData>(
    initial ?? { tanggal: new Date().toISOString().split('T')[0], jenis: 'masuk', nominal: '', keterangan: '' }
  );

  const set = (k: keyof TransaksiFormData, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nominalNum = Number(form.nominal.replace(/\D/g, ''));
    if (!form.tanggal || !form.keterangan || !nominalNum) return;
    onSubmit({ tanggal: form.tanggal, jenis: form.jenis, nominal: nominalNum, keterangan: form.keterangan });
  };

  const displayNominal = (v: string) => {
    const num = v.replace(/\D/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('id-ID');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal *</label>
        <input type="date" className="ark-input" value={form.tanggal} onChange={(e) => set('tanggal', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Transaksi *</label>
        <div className="grid grid-cols-2 gap-3">
          {(['masuk', 'keluar'] as const).map((j) => (
            <label
              key={j}
              className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                form.jenis === j
                  ? j === 'masuk'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-rose-500 bg-rose-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input type="radio" name="jenis" value={j} checked={form.jenis === j} onChange={() => set('jenis', j)} className="sr-only" />
              {j === 'masuk' ? (
                <ArrowUpCircle size={18} className={form.jenis === 'masuk' ? 'text-emerald-600' : 'text-slate-400'} />
              ) : (
                <ArrowDownCircle size={18} className={form.jenis === 'keluar' ? 'text-rose-600' : 'text-slate-400'} />
              )}
              <span className={`text-sm font-semibold ${form.jenis === j ? (j === 'masuk' ? 'text-emerald-700' : 'text-rose-700') : 'text-slate-500'}`}>
                {j === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nominal *</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">Rp</span>
          <input
            className="ark-input pl-10"
            value={displayNominal(form.nominal)}
            onChange={(e) => set('nominal', e.target.value.replace(/\D/g, ''))}
            placeholder="0"
            required
          />
        </div>
        {form.nominal && (
          <p className="text-xs text-slate-400 mt-1">{formatIDR(Number(form.nominal.replace(/\D/g, '')))}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan *</label>
        <textarea
          className="ark-input resize-none h-20"
          value={form.keterangan}
          onChange={(e) => set('keterangan', e.target.value)}
          placeholder="Deskripsi transaksi"
          required
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 ark-btn-secondary">Batal</button>
        <button type="submit" className="flex-1 ark-btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
};

const BungaTaburModule: React.FC = () => {
  const { currentUser, bungaTabur, addBungaTabur, updateBungaTabur, deleteBungaTabur, openModal, closeModal, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('semua');

  if (currentUser?.role === 'siswa') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Wallet size={48} className="mb-4 opacity-30" />
        <p className="font-semibold text-lg">Akses Terbatas</p>
        <p className="text-sm mt-1">Modul Bunga Tabur hanya tersedia untuk Admin dan Guru.</p>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  const { totalMasuk, totalKeluar, saldo } = useMemo(() => {
    const totalMasuk = bungaTabur.filter((t) => t.jenis === 'masuk').reduce((s, t) => s + t.nominal, 0);
    const totalKeluar = bungaTabur.filter((t) => t.jenis === 'keluar').reduce((s, t) => s + t.nominal, 0);
    return { totalMasuk, totalKeluar, saldo: totalMasuk - totalKeluar };
  }, [bungaTabur]);

  const filtered = useMemo(() => {
    return bungaTabur
      .filter((t) => {
        const matchSearch = t.keterangan.toLowerCase().includes(search.toLowerCase()) || t.dicatat_oleh.toLowerCase().includes(search.toLowerCase());
        const matchJenis = filterJenis === 'semua' || t.jenis === filterJenis;
        return matchSearch && matchJenis;
      })
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [bungaTabur, search, filterJenis]);

  const openAddModal = () => {
    openModal(
      'Tambah Transaksi',
      <TransaksiForm
        onSubmit={(data) => {
          addBungaTabur(data);
          closeModal();
          showToast('success', 'Transaksi berhasil ditambahkan!');
        }}
        onCancel={closeModal}
        submitLabel="Tambah"
      />
    );
  };

  const openEditModal = (t: BungaTabur) => {
    openModal(
      'Edit Transaksi',
      <TransaksiForm
        initial={{ tanggal: t.tanggal, jenis: t.jenis, nominal: t.nominal.toString(), keterangan: t.keterangan }}
        onSubmit={(data) => {
          updateBungaTabur(t.id, data);
          closeModal();
          showToast('success', 'Transaksi diperbarui!');
        }}
        onCancel={closeModal}
        submitLabel="Simpan"
      />
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      deleteBungaTabur(id);
      showToast('info', 'Transaksi dihapus.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-700">Total Pemasukan</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{formatIDR(totalMasuk)}</p>
        </div>
        <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
              <TrendingDown size={18} className="text-rose-600" />
            </div>
            <span className="text-sm font-medium text-rose-700">Total Pengeluaran</span>
          </div>
          <p className="text-2xl font-bold text-rose-700">{formatIDR(totalKeluar)}</p>
        </div>
        <div className={`rounded-2xl p-5 border ${saldo >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${saldo >= 0 ? 'bg-blue-100' : 'bg-amber-100'}`}>
              <Wallet size={18} className={saldo >= 0 ? 'text-blue-600' : 'text-amber-600'} />
            </div>
            <span className={`text-sm font-medium ${saldo >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>Saldo Akhir</span>
          </div>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>{formatIDR(saldo)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="ark-input pl-9 w-full" placeholder="Cari keterangan..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="ark-input w-full sm:w-44" value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
          <option value="semua">Semua</option>
          <option value="masuk">Pemasukan</option>
          <option value="keluar">Pengeluaran</option>
        </select>
        {isAdmin && (
          <button onClick={openAddModal} className="ark-btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} />
            Tambah
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Wallet size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Tidak ada transaksi ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Jenis</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Keterangan</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nominal</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Pencatat</th>
                  {isAdmin && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{formatDate(t.tanggal)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold ${
                          t.jenis === 'masuk' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {t.jenis === 'masuk' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                        {t.jenis === 'masuk' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700 max-w-xs truncate">{t.keterangan}</td>
                    <td className={`px-5 py-3.5 text-sm font-bold text-right whitespace-nowrap ${t.jenis === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.jenis === 'masuk' ? '+' : '-'}{formatIDR(t.nominal)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-400 hidden sm:table-cell whitespace-nowrap">{t.dicatat_oleh}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(t)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BungaTaburModule;
