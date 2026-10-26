import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Modal: React.FC = () => {
  const { modalOpen, modalTitle, modalContent, closeModal } = useApp();
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalOpen, closeModal]);

  if (!modalOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === backdropRef.current) closeModal();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg modal-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{modalTitle}</h2>
          <button
            onClick={closeModal}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
          {modalContent}
        </div>
      </div>
    </div>
  );
};

export default Modal;
