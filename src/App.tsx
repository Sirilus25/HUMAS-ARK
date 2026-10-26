import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import Modal from './components/Modal';
import DashboardView from './components/dashboard/DashboardView';
import AgendaHumasModule from './components/agenda/AgendaHumasModule';
import AgendaFotoModule from './components/agenda-foto/AgendaFotoModule';
import BungaTaburModule from './components/bunga-tabur/BungaTaburModule';
import KurasiModule from './components/kurasi/KurasiModule';
import PenggunaModule from './components/pengguna/PenggunaModule';
import ProfilModule from './components/profil/ProfilModule';
import { Shield } from 'lucide-react';

const pageComponents: Record<string, React.ReactNode> = {
  'dashboard': <DashboardView />,
  'agenda-humas': <AgendaHumasModule />,
  'agenda-foto': <AgendaFotoModule />,
  'bunga-tabur': <BungaTaburModule />,
  'kurasi': <KurasiModule />,
  'pengguna': <PenggunaModule />,
  'profil': <ProfilModule />,
};

const AppContent: React.FC = () => {
  const { currentUser, authLoading, activePage } = useApp();

  // Tampilkan loading spinner saat cek session Supabase
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-2xl shadow-amber-500/30 mb-6">
          <Shield className="w-10 h-10 text-white" strokeWidth={1.5} />
        </div>
        <div className="w-10 h-10 border-4 border-white/20 border-t-amber-400 rounded-full animate-spin mb-4" />
        <p className="text-blue-200 font-medium">Memuat Humas ARK…</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  const PageComponent = pageComponents[activePage] ?? <DashboardView />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
          {PageComponent}
        </main>
      </div>

      {/* Overlays */}
      <Modal />
      <Toast />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
