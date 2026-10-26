import React, { useState } from 'react';
import { User, Mail, Shield, GraduationCap, Pencil, Check, X, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

const roleLabel: Record<UserRole, string> = {
  admin: 'Administrator',
  guru: 'Guru',
  siswa: 'Siswa',
};

const roleBadge: Record<UserRole, string> = {
  admin: 'bg-rose-100 text-rose-700 border-rose-200',
  guru: 'bg-blue-100 text-blue-700 border-blue-200',
  siswa: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const roleIcon: Record<UserRole, React.ReactNode> = {
  admin: <Shield size={16} />,
  guru: <GraduationCap size={16} />,
  siswa: <User size={16} />,
};

const avatarColors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
function getAvatarColor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return avatarColors[sum % avatarColors.length];
}
function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const ProfilModule: React.FC = () => {
  const { currentUser, updateUser, showToast } = useApp();
  const [editingName, setEditingName] = useState(false);
  const [editingKelas, setEditingKelas] = useState(false);
  const [newName, setNewName] = useState(currentUser?.nama_lengkap ?? '');
  const [newKelas, setNewKelas] = useState(currentUser?.kelas ?? '');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ lama: '', baru: '', konfirmasi: '' });

  if (!currentUser) return null;

  const handleSaveName = () => {
    if (!newName.trim()) return;
    updateUser(currentUser.id, { nama_lengkap: newName.trim() });
    setEditingName(false);
    showToast('success', 'Nama berhasil diperbarui!');
  };

  const handleSaveKelas = () => {
    updateUser(currentUser.id, { kelas: newKelas.trim() });
    setEditingKelas(false);
    showToast('success', 'Kelas berhasil diperbarui!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.lama) {
      showToast('error', 'Masukkan password lama!');
      return;
    }
    if (passwords.baru.length < 6) {
      showToast('error', 'Password baru minimal 6 karakter!');
      return;
    }
    if (passwords.baru !== passwords.konfirmasi) {
      showToast('error', 'Konfirmasi password tidak cocok!');
      return;
    }
    setChangingPassword(false);
    setPasswords({ lama: '', baru: '', konfirmasi: '' });
    showToast('success', 'Password berhasil diubah! (Simulasi)');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header banner */}
        <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-500" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 mb-4">
            <div
              className={`w-20 h-20 rounded-2xl ${getAvatarColor(currentUser.nama_lengkap)} flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white shadow-lg flex-shrink-0`}
            >
              {getInitials(currentUser.nama_lengkap)}
            </div>
            <div className="mb-1">
              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl font-semibold border ${roleBadge[currentUser.role]}`}>
                {roleIcon[currentUser.role]}
                {roleLabel[currentUser.role]}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Nama */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-slate-100 rounded-xl text-slate-500">
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium mb-0.5">Nama Lengkap</p>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="ark-input flex-1 py-1.5 text-sm"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleSaveName} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
                      <Check size={16} />
                    </button>
                    <button onClick={() => { setEditingName(false); setNewName(currentUser.nama_lengkap); }} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{currentUser.nama_lengkap}</p>
                    <button onClick={() => { setEditingName(true); setNewName(currentUser.nama_lengkap); }} className="p-1 rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all">
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-slate-100 rounded-xl text-slate-500">
                <Mail size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium mb-0.5">Email</p>
                <p className="text-sm font-semibold text-slate-800">{currentUser.email}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-slate-100 rounded-xl text-slate-500">
                {roleIcon[currentUser.role]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium mb-0.5">Role / Jabatan</p>
                <p className="text-sm font-semibold text-slate-800">{roleLabel[currentUser.role]}</p>
              </div>
            </div>

            {/* Kelas (siswa only) */}
            {currentUser.role === 'siswa' && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-slate-100 rounded-xl text-slate-500">
                  <GraduationCap size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Kelas</p>
                  {editingKelas ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="ark-input w-28 py-1.5 text-sm"
                        value={newKelas}
                        onChange={(e) => setNewKelas(e.target.value)}
                        placeholder="XII-A"
                        autoFocus
                      />
                      <button onClick={handleSaveKelas} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
                        <Check size={16} />
                      </button>
                      <button onClick={() => { setEditingKelas(false); setNewKelas(currentUser.kelas ?? ''); }} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{currentUser.kelas ?? '—'}</p>
                      <button onClick={() => { setEditingKelas(true); setNewKelas(currentUser.kelas ?? ''); }} className="p-1 rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all">
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-slate-100 rounded-xl text-slate-500">
                <Check size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-0.5">Status Akun</p>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-semibold">
                  {currentUser.aktif ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-slate-100 rounded-xl text-slate-500">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Ganti Password</p>
              <p className="text-xs text-slate-400">Perbarui kata sandi akun Anda</p>
            </div>
          </div>
          {!changingPassword && (
            <button onClick={() => setChangingPassword(true)} className="ark-btn-secondary text-sm px-4 py-2">
              Ubah
            </button>
          )}
        </div>
        {changingPassword && (
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password Lama</label>
              <input
                type="password"
                className="ark-input"
                value={passwords.lama}
                onChange={(e) => setPasswords((p) => ({ ...p, lama: e.target.value }))}
                placeholder="Password lama"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
              <input
                type="password"
                className="ark-input"
                value={passwords.baru}
                onChange={(e) => setPasswords((p) => ({ ...p, baru: e.target.value }))}
                placeholder="Min. 6 karakter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                className="ark-input"
                value={passwords.konfirmasi}
                onChange={(e) => setPasswords((p) => ({ ...p, konfirmasi: e.target.value }))}
                placeholder="Ulangi password baru"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setChangingPassword(false); setPasswords({ lama: '', baru: '', konfirmasi: '' }); }} className="flex-1 ark-btn-secondary">
                Batal
              </button>
              <button type="submit" className="flex-1 ark-btn-primary">Simpan</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilModule;
