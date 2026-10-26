import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivePage } from '../types';

const pageTitles: Record<ActivePage, string> = {
  dashboard: 'Dashboard',
  'agenda-humas': 'Agenda Humas',
  'agenda-foto': 'Agenda Foto',
  'bunga-tabur': 'Bunga Tabur',
  kurasi: 'Kurasi Prestasi',
  pengguna: 'Manajemen Pengguna',
  profil: 'Profil Saya',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const avatarColors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];

function getAvatarColor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return avatarColors[sum % avatarColors.length];
}

const Header: React.FC = () => {
  const { currentUser, activePage, setActivePage } = useApp();
  if (!currentUser) return null;

  const pageTitle = pageTitles[activePage];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4">
        {/* Left: title + breadcrumb */}
        <div className="min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-0.5">
            <button
              onClick={() => setActivePage('dashboard')}
              className="hover:text-blue-600 transition-colors font-medium"
            >
              ARK Humas
            </button>
            {activePage !== 'dashboard' && (
              <>
                <ChevronRight size={12} />
                <span className="text-slate-600 font-medium truncate">{pageTitle}</span>
              </>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-800 truncate">{pageTitle}</h1>
        </div>

        {/* Right: greeting, bell, avatar */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Greeting (hidden on small mobile) */}
          <div className="hidden sm:block text-right">
            <p className="text-xs text-slate-400">{getGreeting()},</p>
            <p className="text-sm font-semibold text-slate-700 truncate max-w-[140px]">
              {currentUser.nama_lengkap.split(' ')[0]}! 👋
            </p>
          </div>

          {/* Notification bell */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-all">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Avatar */}
          <button
            onClick={() => setActivePage('profil')}
            className={`w-9 h-9 rounded-xl ${getAvatarColor(currentUser.nama_lengkap)} flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-all shadow-sm`}
            title="Profil saya"
          >
            {getInitials(currentUser.nama_lengkap)}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
