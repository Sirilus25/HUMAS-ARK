import React, { useState, useMemo } from 'react';
import { Plus, Users, Search, Pencil, Trash2, Shield, GraduationCap, User, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User as UserType, UserRole } from '../../types';

const roleLabel: Record<UserRole, string> = {
  admin: 'Administrator',
  guru: 'Guru',
  siswa: 'Siswa',
};

const roleBadge: Record<UserRole, string> = {
  admin: 'bg-rose-100 text-rose-700',
  guru: 'bg-blue-100 text-blue-700',
  siswa: 'bg-emerald-100 text-emerald-700',
};

const roleIcon: Record<UserRole, React.ReactNode> = {
  admin: <Shield size={14} />,
  guru: <GraduationCap size={14} />,
  siswa: <User size={14} />,
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

interface UserFormData {
  nama_lengkap: string;
  email: string;
  password: string;
  role: UserRole;
  kelas: string;
  aktif: boolean;
}

const UserForm: React.FC<{
  initial?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  submitLabel: string;
  isEdit?: boolean;
}> = ({ initial, onSubmit, onCancel, submitLabel, isEdit }) => {
  const [form, setForm] = useState<UserFormData>(
    { nama_lengkap: '', email: '', password: '', role: 'siswa', kelas: '', aktif: true, ...initial }
  );
  const set = (k: keyof UserFormData, v: string | boolean | UserRole) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_lengkap || !form.email) return;
    if (!isEdit && !form.password) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap *</label>
        <input className="ark-input" value={form.nama_lengkap} onChange={(e) => set('nama_lengkap', e.target.value)} placeholder="Nama lengkap pengguna" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
        <input type="email" className="ark-input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@ark.sch.id" required disabled={isEdit} />
      </div>
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
          <input type="password" className="ark-input" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min. 6 karakter" required minLength={6} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <select className="ark-input" value={form.role} onChange={(e) => set('role', e.target.value as UserRole)}>
            <option value="admin">Administrator</option>
            <option value="guru">Guru</option>
            <option value="siswa">Siswa</option>
          </select>
        </div>
        {form.role === 'siswa' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
            <input className="ark-input" value={form.kelas} onChange={(e) => set('kelas', e.target.value)} placeholder="Contoh: XII-A" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl">
        <span className="text-sm font-medium text-slate-700 flex-1">Status Aktif</span>
        <button
          type="button"
          onClick={() => set('aktif', !form.aktif)}
          className={`transition-colors ${form.aktif ? 'text-emerald-600' : 'text-slate-300'}`}
        >
          {form.aktif ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
        </button>
        <span className={`text-xs font-semibold ${form.aktif ? 'text-emerald-600' : 'text-slate-400'}`}>
          {form.aktif ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 ark-btn-secondary">Batal</button>
        <button type="submit" className="flex-1 ark-btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
};

const PenggunaModule: React.FC = () => {
  const { currentUser, users, addUser, updateUser, deleteUser, openModal, closeModal, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('semua');

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Users size={48} className="mb-4 opacity-30" />
        <p className="font-semibold text-lg">Akses Terbatas</p>
        <p className="text-sm mt-1">Halaman ini hanya untuk Administrator.</p>
      </div>
    );
  }

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.kelas ?? '').toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === 'semua' || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole]);

  const openAddModal = () => {
    openModal(
      'Tambah Pengguna',
      <UserForm
        onSubmit={async (data) => {
          try {
            await addUser({ email: data.email, password: data.password, nama_lengkap: data.nama_lengkap, role: data.role, kelas: data.kelas || undefined });
            closeModal();
            showToast('success', 'Pengguna berhasil ditambahkan!');
          } catch (e) {
            showToast('error', (e as Error).message);
          }
        }}
        onCancel={closeModal}
        submitLabel="Tambah"
      />
    );
  };

  const openEditModal = (u: UserType) => {
    openModal(
      'Edit Pengguna',
      <UserForm
        initial={{ nama_lengkap: u.nama_lengkap, email: u.email, password: '', role: u.role, kelas: u.kelas ?? '', aktif: u.aktif }}
        isEdit
        onSubmit={async (data) => {
          try {
            await updateUser(u.id, { nama_lengkap: data.nama_lengkap, role: data.role, kelas: data.kelas || undefined, aktif: data.aktif });
            closeModal();
            showToast('success', 'Data pengguna diperbarui!');
          } catch (e) {
            showToast('error', (e as Error).message);
          }
        }}
        onCancel={closeModal}
        submitLabel="Simpan"
      />
    );
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
      showToast('error', 'Tidak bisa menghapus akun sendiri!');
      return;
    }
    if (window.confirm('Yakin ingin menghapus pengguna ini?')) {
      deleteUser(id);
      showToast('info', 'Pengguna dihapus.');
    }
  };

  const toggleAktif = (u: UserType) => {
    if (u.id === currentUser.id) {
      showToast('error', 'Tidak bisa menonaktifkan akun sendiri!');
      return;
    }
    updateUser(u.id, { aktif: !u.aktif });
    showToast('success', `Pengguna ${u.aktif ? 'dinonaktifkan' : 'diaktifkan'}.`);
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(['admin', 'guru', 'siswa'] as UserRole[]).map((role) => {
          const count = users.filter((u) => u.role === role).length;
          return (
            <div key={role} className={`rounded-2xl p-4 border ${roleBadge[role].replace('text-', 'border-').replace('-700', '-200').replace('-100', '-50')} bg-white shadow-sm`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={roleBadge[role] + ' p-1.5 rounded-lg'}>{roleIcon[role]}</span>
                <span className="text-xs font-medium text-slate-500">{roleLabel[role]}</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="ark-input pl-9 w-full" placeholder="Cari nama, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="ark-input w-full sm:w-40" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="semua">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="guru">Guru</option>
          <option value="siswa">Siswa</option>
        </select>
        <button onClick={openAddModal} className="ark-btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} />
          Tambah
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengguna</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Kelas</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl ${getAvatarColor(u.nama_lengkap)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {getInitials(u.nama_lengkap)}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{u.nama_lengkap}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 hidden sm:table-cell">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold ${roleBadge[u.role]}`}>
                        {roleIcon[u.role]}
                        {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 hidden md:table-cell">{u.kelas ?? '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <button onClick={() => toggleAktif(u)} className="inline-flex items-center gap-1.5 group/toggle">
                        {u.aktif ? (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-semibold hover:bg-emerald-200 transition-colors">
                            Aktif
                          </span>
                        ) : (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
                            Nonaktif
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
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

export default PenggunaModule;
