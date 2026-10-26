import React, { useMemo } from 'react';
import {
  CalendarDays,
  Camera,
  Wallet,
  Inbox,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AgendaHumas } from '../../types';

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) => {
  try {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(d));
  } catch {
    return d;
  }
};

const statusChip: Record<AgendaHumas['status'], { label: string; cls: string }> = {
  direncanakan: { label: 'Direncanakan', cls: 'bg-blue-100 text-blue-700' },
  berlangsung: { label: 'Berlangsung', cls: 'bg-amber-100 text-amber-700' },
  selesai: { label: 'Selesai', cls: 'bg-emerald-100 text-emerald-700' },
  dibatalkan: { label: 'Dibatalkan', cls: 'bg-slate-100 text-slate-500' },
};

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const DashboardView: React.FC = () => {
  const { currentUser, agendaHumas, agendaFoto, bungaTabur, kurasi } = useApp();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Greeting
  const hour = now.getHours();
  const greeting =
    hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';

  // Stats
  const agendaBulanIni = useMemo(
    () =>
      agendaHumas.filter((a) => {
        const d = new Date(a.tanggal);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length,
    [agendaHumas, currentMonth, currentYear]
  );

  const jadwalFotoMendatang = useMemo(
    () =>
      agendaFoto.filter((a) => a.tanggal_foto >= todayStr && a.status === 'dijadwalkan').length,
    [agendaFoto, todayStr]
  );

  const { totalMasuk, totalKeluar, saldo } = useMemo(() => {
    const totalMasuk = bungaTabur.filter((t) => t.jenis === 'masuk').reduce((s, t) => s + t.nominal, 0);
    const totalKeluar = bungaTabur.filter((t) => t.jenis === 'keluar').reduce((s, t) => s + t.nominal, 0);
    return { totalMasuk, totalKeluar, saldo: totalMasuk - totalKeluar };
  }, [bungaTabur]);

  const kurasiMenunggu = useMemo(() => kurasi.filter((k) => k.status === 'menunggu').length, [kurasi]);

  // Upcoming agenda (next 5)
  const upcomingAgenda = useMemo(
    () =>
      agendaHumas
        .filter((a) => a.tanggal >= todayStr && a.status !== 'dibatalkan')
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
        .slice(0, 5),
    [agendaHumas, todayStr]
  );

  // Mini calendar
  const calendarDaysWithAgenda = useMemo(() => {
    const set = new Set<number>();
    agendaHumas.forEach((a) => {
      const d = new Date(a.tanggal);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [agendaHumas, currentMonth, currentYear]);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Finance bar chart – last 6 months
  const financeData = useMemo(() => {
    const result: { month: string; masuk: number; keluar: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const masuk = bungaTabur
        .filter((t) => {
          const td = new Date(t.tanggal);
          return t.jenis === 'masuk' && td.getMonth() === m && td.getFullYear() === y;
        })
        .reduce((s, t) => s + t.nominal, 0);
      const keluar = bungaTabur
        .filter((t) => {
          const td = new Date(t.tanggal);
          return t.jenis === 'keluar' && td.getMonth() === m && td.getFullYear() === y;
        })
        .reduce((s, t) => s + t.nominal, 0);
      result.push({ month: MONTHS_ID[m], masuk, keluar });
    }
    return result;
  }, [bungaTabur, currentMonth, currentYear]);

  const maxFinance = useMemo(
    () => Math.max(...financeData.map((d) => Math.max(d.masuk, d.keluar)), 1),
    [financeData]
  );

  const statCards = [
    {
      label: 'Agenda Bulan Ini',
      value: agendaBulanIni.toString(),
      icon: <CalendarDays size={22} />,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      ringColor: 'bg-blue-600',
      valueColor: 'text-blue-700',
    },
    {
      label: 'Jadwal Foto Mendatang',
      value: jadwalFotoMendatang.toString(),
      icon: <Camera size={22} />,
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      ringColor: 'bg-violet-600',
      valueColor: 'text-violet-700',
    },
    {
      label: 'Saldo Bunga Tabur',
      value: formatIDR(saldo),
      icon: <Wallet size={22} />,
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      ringColor: 'bg-emerald-600',
      valueColor: saldo >= 0 ? 'text-emerald-700' : 'text-rose-600',
      hidden: currentUser?.role === 'siswa',
    },
    {
      label: 'Kurasi Menunggu',
      value: kurasiMenunggu.toString(),
      icon: <Inbox size={22} />,
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      ringColor: 'bg-amber-600',
      valueColor: 'text-amber-700',
    },
  ].filter((c) => !c.hidden);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
        <p className="text-blue-200 text-sm font-medium mb-1">
          {new Intl.DateTimeFormat('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(now)}
        </p>
        <h2 className="text-2xl font-bold">
          {greeting}, {currentUser?.nama_lengkap.split(' ')[0]}! 👋
        </h2>
        <p className="text-blue-200 text-sm mt-1">
          Selamat datang di Sistem Manajemen Humas ARK
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center ${card.iconColor} shadow-sm`}>
                {card.icon}
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.valueColor} leading-none mb-1`}>{card.value}</p>
            <p className="text-slate-500 text-xs font-medium leading-snug">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming agenda */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarDays size={18} className="text-blue-600" />
            Agenda Mendatang
          </h3>
          {upcomingAgenda.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CalendarDays size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Tidak ada agenda mendatang</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAgenda.map((agenda) => {
                const d = new Date(agenda.tanggal);
                const chip = statusChip[agenda.status];
                return (
                  <div
                    key={agenda.id}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex-shrink-0 w-12 text-center bg-blue-50 rounded-xl px-2 py-2">
                      <p className="text-xs text-blue-500 font-semibold">{MONTHS_ID[d.getMonth()]}</p>
                      <p className="text-xl font-bold text-blue-700 leading-none">{d.getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                        {agenda.judul}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={11} />
                          {agenda.lokasi}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={11} />
                          {agenda.jam_mulai}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0 ${chip.cls}`}>
                      {chip.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mini Calendar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4">
            {MONTHS_ID[currentMonth]} {currentYear}
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {DAYS_ID.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400 pb-1">
                {d}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasAgenda = calendarDaysWithAgenda.has(day);
              const isToday = day === now.getDate();
              return (
                <div
                  key={day}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium relative ${
                    isToday
                      ? 'bg-blue-600 text-white'
                      : hasAgenda
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {day}
                  {hasAgenda && !isToday && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blue-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Finance chart — admin/guru only */}
      {currentUser?.role !== 'siswa' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Wallet size={18} className="text-emerald-600" />
            Ringkasan Keuangan – 6 Bulan Terakhir
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs text-slate-500">Pemasukan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="text-xs text-slate-500">Pengeluaran</span>
            </div>
            <div className="ml-auto text-xs text-slate-500 flex items-center gap-1">
              {saldo >= 0 ? (
                <TrendingUp size={14} className="text-emerald-500" />
              ) : (
                <TrendingDown size={14} className="text-rose-500" />
              )}
              Saldo: <span className={`font-bold ml-1 ${saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatIDR(saldo)}</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-36">
            {financeData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5 h-28 w-full">
                  <div
                    className="flex-1 bg-emerald-400 rounded-t-md transition-all hover:bg-emerald-500"
                    style={{ height: `${maxFinance > 0 ? (d.masuk / maxFinance) * 100 : 0}%` }}
                    title={`Masuk: ${formatIDR(d.masuk)}`}
                  />
                  <div
                    className="flex-1 bg-rose-300 rounded-t-md transition-all hover:bg-rose-400"
                    style={{ height: `${maxFinance > 0 ? (d.keluar / maxFinance) * 100 : 0}%` }}
                    title={`Keluar: ${formatIDR(d.keluar)}`}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-400">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
