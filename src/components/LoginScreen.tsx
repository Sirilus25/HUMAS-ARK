import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const demoAccounts = [
  {
    label: 'Admin',
    email: 'ahmad.fauzi@ark.sch.id',
    password: 'admin123',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  {
    label: 'Guru',
    email: 'sari.indrawati@ark.sch.id',
    password: 'guru123',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    label: 'Siswa',
    email: 'dito.pratama@siswa.ark.sch.id',
    password: 'siswa123',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
];

const LoginScreen: React.FC = () => {
  const { login, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 800));
    const ok = await login(email, password);
    setLoading(false);
    if (!ok) {
      setError('Email atau password salah, atau akun tidak aktif.');
      showToast('error', 'Login gagal. Periksa kembali kredensial Anda.');
    } else {
      showToast('success', 'Selamat datang di Humas ARK!');
    }
  };

  const fillDemo = (acc: (typeof demoAccounts)[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-700/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-2xl shadow-amber-500/30 mb-4">
            <Shield className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">ARK</h1>
          <p className="text-blue-200 mt-1 font-medium">Sistem Manajemen Humas ARK</p>
          <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mx-auto mt-3" />
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Masuk ke Akun Anda</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-blue-100 text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-blue-300 pointer-events-none" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@ark.sch.id"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-blue-100 text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" size={18} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-rose-500/20 border border-rose-400/30 rounded-xl px-4 py-3 text-rose-200 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <User size={18} />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-blue-200 text-xs font-medium text-center mb-3">
              Akun Demo — Klik untuk mengisi otomatis
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="py-2 px-3 rounded-xl border bg-white/10 border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-all text-center"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-blue-300/60 text-xs mt-6">
          &copy; {new Date().getFullYear()} Humas ARK &mdash; Semua hak dilindungi
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
