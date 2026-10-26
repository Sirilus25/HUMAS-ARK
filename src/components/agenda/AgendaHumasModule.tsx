import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  CalendarDays,
  MapPin,
  Clock,
  User,
  Pencil,
  Trash2,
  LayoutList,
  CalendarRange,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AgendaHumas } from '../../types';

const statusChip: Record<AgendaHumas['status'], { label: string; cls: string }> = {
  direncanakan: { label: 'Direncanakan', cls: 'bg-blue-100 text-blue-700' },
  berlangsung: { label: 'Berlangsung', cls: 'bg-amber-100 text-amber-700' },
  selesai: { label: 'Selesai', cls: 'bg-emerald-100 text-emerald-700' },
  dibatalkan: { label: 'Dibatalkan', cls: 'bg-slate-100 text-slate-500' },
};

const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

interface AgendaFormData {
  judul: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  penanggung_jawab: string;
  catatan: string;
  status: AgendaHumas['status'];
}

const emptyForm: AgendaFormData = {
  judul: '',
  tanggal: '',
  jam_mulai: '',
  jam_selesai: '',
  lokasi: '',
  penanggung_jawab: '',
  catatan: '',
  status: 'direncanakan',
};

const AgendaForm: React.FC<{
  initial?: AgendaFormData;
  onSubmit: (data: AgendaFormData) => void;
  onCancel: () => void;
  submitLabel: string;
}> = ({ initial = emptyForm, onSubmit, onCancel, submitLabel }) => {
  const [form, setForm] = useState<AgendaFormData>(initial);

  const set = (k: keyof AgendaFormData, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul || !form.tanggal || !form.jam_mulai || !form.jam_selesai || !form.lokasi || !form.penanggung_jawab) {
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Judul Kegiatan *</label>
        <input
          className="ark-input"
          value={form.judul}
          onChange={(e) => set('judul', e.target.value)}
          placeholder="Contoh: Rapat Koordinasi Humas"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal *</label>
          <input type="date" className="ark-input" value={form.tanggal} onChange={(e) => set('tanggal', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select className="ark-input" value={form.status} onChange={(e) => set('status', e.target.value as AgendaHumas['status'])}>
            <option value="direncanakan">Direncanakan</option>
            <option value="berlangsung">Berlangsung</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Jam Mulai *</label>
          <input type="time" className="ark-input" value={form.jam_mulai} onChange={(e) => set('jam_mulai', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Jam Selesai *</label>
          <input type="time" className="ark-input" value={form.jam_selesai} onChange={(e) => set('jam_selesai', e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi *</label>
        <input
          className="ark-input"
          value={form.lokasi}
          onChange={(e) => set('lokasi', e.target.value)}
          placeholder="Contoh: Aula Sekolah"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Penanggung Jawab *</label>
        <input
          className="ark-input"
          value={form.penanggung_jawab}
          onChange={(e) => set('penanggung_jawab', e.target.value)}
          placeholder="Nama penanggung jawab"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
        <textarea
          className="ark-input resize-none h-20"
          value={form.catatan}
          onChange={(e) => set('catatan', e.target.value)}
          placeholder="Catatan tambahan (opsional)"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 ark-btn-secondary">
          Batal
        </button>
        <button type="submit" className="flex-1 ark-btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

const AgendaHumasModule: React.FC = () => {
  const { currentUser, agendaHumas, addAgendaHumas, updateAgendaHumas, deleteAgendaHumas, openModal, closeModal, showToast } = useApp();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [calendarDate, setCalendarDate] = useState(new Date());

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'guru';

  const filtered = useMemo(() => {
    return agendaHumas
      .filter((a) => {
        const matchSearch =
          a.judul.toLowerCase().includes(search.toLowerCase()) ||
          a.lokasi.toLowerCase().includes(search.toLowerCase()) ||
          a.penanggung_jawab.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'semua' || a.status === filterStatus;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [agendaHumas, search, filterStatus]);

  const openAddModal = () => {
    openModal(
      'Tambah Agenda Humas',
      <AgendaForm
        onSubmit={(data) => {
          addAgendaHumas(data);
          closeModal();
          showToast('success', 'Agenda berhasil ditambahkan!');
        }}
        onCancel={closeModal}
        submitLabel="Tambah"
      />
    );
  };

  const openEditModal = (agenda: AgendaHumas) => {
    openModal(
      'Edit Agenda Humas',
      <AgendaForm
        initial={{
          judul: agenda.judul,
          tanggal: agenda.tanggal,
          jam_mulai: agenda.jam_mulai,
          jam_selesai: agenda.jam_selesai,
          lokasi: agenda.lokasi,
          penanggung_jawab: agenda.penanggung_jawab,
          catatan: agenda.catatan ?? '',
          status: agenda.status,
        }}
        onSubmit={(data) => {
          updateAgendaHumas(agenda.id, data);
          closeModal();
          showToast('success', 'Agenda berhasil diperbarui!');
        }}
        onCancel={closeModal}
        submitLabel="Simpan"
      />
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus agenda ini?')) {
      deleteAgendaHumas(id);
      showToast('info', 'Agenda dihapus.');
    }
  };

  // Calendar view
  const calMonth = calendarDate.getMonth();
  const calYear = calendarDate.getFullYear();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const agendaByDay = useMemo(() => {
    const map: Record<number, AgendaHumas[]> = {};
    agendaHumas.forEach((a) => {
      const d = new Date(a.tanggal);
      if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(a);
      }
    });
    return map;
  }, [agendaHumas, calMonth, calYear]);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="ark-input pl-9 w-full"
            placeholder="Cari judul, lokasi, PJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="ark-input w-full sm:w-40"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="semua">Semua Status</option>
          <option value="direncanakan">Direncanakan</option>
          <option value="berlangsung">Berlangsung</option>
          <option value="selesai">Selesai</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded-lg transition-all ${view === 'calendar' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}
            >
              <CalendarRange size={16} />
            </button>
          </div>
          {canEdit && (
            <button onClick={openAddModal} className="ark-btn-primary flex items-center gap-2 whitespace-nowrap">
              <Plus size={16} />
              Tambah
            </button>
          )}
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Tidak ada agenda ditemukan</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((agenda) => {
                const d = new Date(agenda.tanggal);
                const chip = statusChip[agenda.status];
                return (
                  <div key={agenda.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-all group">
                    <div className="flex-shrink-0 w-12 text-center bg-blue-50 rounded-xl px-1 py-2">
                      <p className="text-[10px] text-blue-400 font-bold uppercase">{MONTHS_SHORT[d.getMonth()]}</p>
                      <p className="text-xl font-bold text-blue-700 leading-none">{d.getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors leading-snug">
                          {agenda.judul}
                        </p>
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium flex-shrink-0 ${chip.cls}`}>
                          {chip.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={11} /> {agenda.lokasi}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={11} /> {agenda.jam_mulai} – {agenda.jam_selesai}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <User size={11} /> {agenda.penanggung_jawab}
                        </span>
                      </div>
                      {agenda.catatan && (
                        <p className="text-xs text-slate-400 mt-1 italic truncate">"{agenda.catatan}"</p>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(agenda)}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(agenda.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCalendarDate(new Date(calYear, calMonth - 1, 1))}
              className="ark-btn-secondary px-3 py-1.5 text-sm"
            >
              ‹ Prev
            </button>
            <h3 className="text-base font-bold text-slate-800">
              {MONTHS_ID[calMonth]} {calYear}
            </h3>
            <button
              onClick={() => setCalendarDate(new Date(calYear, calMonth + 1, 1))}
              className="ark-btn-secondary px-3 py-1.5 text-sm"
            >
              Next ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_ID.map((d) => (
              <div key={d} className="text-center text-xs font-bold text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAgendas = agendaByDay[day] ?? [];
              const isToday =
                day === new Date().getDate() &&
                calMonth === new Date().getMonth() &&
                calYear === new Date().getFullYear();
              return (
                <div
                  key={day}
                  className={`min-h-[70px] p-1.5 rounded-xl border transition-all ${
                    isToday ? 'border-blue-400 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <p className={`text-xs font-bold mb-1 ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                    {day}
                  </p>
                  <div className="space-y-0.5">
                    {dayAgendas.slice(0, 2).map((a) => {
                      const c = statusChip[a.status];
                      return (
                        <div
                          key={a.id}
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium truncate ${c.cls}`}
                          title={a.judul}
                        >
                          {a.judul}
                        </div>
                      );
                    })}
                    {dayAgendas.length > 2 && (
                      <p className="text-[9px] text-slate-400 px-1">+{dayAgendas.length - 2} lagi</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaHumasModule;
