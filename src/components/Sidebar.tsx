import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Camera,
  Wallet,
  ClipboardCheck,
  Users,
  UserCircle,
  LogOut,
  Shield,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivePage, UserRole } from '../types';

interface NavItem {
  id: ActivePage;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'guru', 'siswa'] },
  { id: 'agenda-humas', label: 'Agenda Humas', icon: <CalendarDays size={20} />, roles: ['admin', 'guru', 'siswa'] },
  { id: 'agenda-foto', label: 'Agenda Foto', icon: <Camera size={20} />, roles: ['admin', 'guru', 'siswa'] },
  { id: 'bunga-tabur', label: 'Bunga Tabur', icon: <Wallet size={20} />, roles: ['admin', 'guru'] },
  { id: 'kurasi', label: 'Kurasi', icon: <ClipboardCheck size={20} />, roles: ['admin', 'guru', 'siswa'] },
  { id: 'pengguna', label: 'Pengguna', icon: <Users size={20} />, roles: ['admin'] },
  { id: 'profil', label: 'Profil', icon: <UserCircle size={20} />, roles: ['admin', 'guru', 'siswa'] },
];

const roleBadge: Record<UserRole, string> = {
  admin: 'bg-rose-100 text-rose-600',
  guru: 'bg-blue-100 text-blue-600',
  siswa: 'bg-emerald-100 text-emerald-600',
};

const roleLabel: Record<UserRole, string> = {
  admin: 'Administrator',
  guru: 'Guru',
  siswa: 'Siswa',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const avatarColors = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
];

function getAvatarColor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return avatarColors[sum % avatarColors.length];
}

const Sidebar: React.FC = () => {
  const { currentUser, activePage, setActivePage, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;

  const visible = navItems.filter((n) => n.roles.includes(currentUser.role));
  const mobileVisible = visible.slice(0, 5);

  const NavLink = ({ item, onClick }: { item: NavItem; onClick?: () => void }) => {
    const isActive = activePage === item.id;
    return (
      <button
        onClick={() => {
          setActivePage(item.id);
          onClick?.();
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}>
          {item.icon}
        </span>
        <span className="font-medium text-sm flex-1">{item.label}</span>
        {isActive && <ChevronRight size={16} className="text-blue-200" />}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-full w-64 bg-white border-r border-slate-100 shadow-sm">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/30">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-blue-900 text-lg leading-none">ARK</p>
              <p className="text-xs text-slate-400 leading-none mt-0.5">Humas Management</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Menu Utama</p>
          {visible.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
        </nav>

        {/* User info */}
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50">
            <div
              className={`w-9 h-9 rounded-xl ${getAvatarColor(currentUser.nama_lengkap)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
            >
              {getInitials(currentUser.nama_lengkap)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{currentUser.nama_lengkap}</p>
              <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded-md ${roleBadge[currentUser.role]}`}>
                {roleLabel[currentUser.role]}
              </span>
            </div>
            <button
              onClick={logout}
              title="Keluar"
              className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-2xl shadow-slate-300/50">
        <div className="flex items-center">
          {mobileVisible.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-all ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
          {/* Hamburger for remaining */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex-1 flex flex-col items-center py-2.5 gap-1 text-slate-400"
          >
            <Menu size={20} />
            <span className="text-[10px] font-medium leading-none">Lainnya</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto w-72 bg-white h-full flex flex-col shadow-2xl slide-in-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Shield size={16} className="text-white" />
                </div>
                <span className="font-bold text-blue-900">ARK Humas</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {visible.map((item) => (
                <NavLink key={item.id} item={item} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-slate-100">
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 mb-2">
                <div
                  className={`w-9 h-9 rounded-xl ${getAvatarColor(currentUser.nama_lengkap)} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {getInitials(currentUser.nama_lengkap)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{currentUser.nama_lengkap}</p>
                  <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded-md ${roleBadge[currentUser.role]}`}>
                    {roleLabel[currentUser.role]}
                  </span>
                </div>
              </div>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-all text-sm font-medium"
              >
                <LogOut size={17} />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
