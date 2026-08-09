import React from 'react';
import { ThemeMode } from '../../types';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'danger' | 'warning' | 'default';
  theme?: ThemeMode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  confirmStyle = 'default',
  theme = 'dark'
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const confirmButtonClass = {
    danger: 'bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white shadow-lg shadow-[#FF3B30]/20',
    warning: 'bg-[#007AFF] hover:bg-[#007AFF]/90 text-white shadow-lg shadow-[#007AFF]/20',
    default: 'bg-[#007AFF] hover:bg-[#007AFF]/90 text-white shadow-lg shadow-[#007AFF]/20'
  }[confirmStyle];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`w-full max-w-sm p-6 md:p-8 rounded-3xl shadow-2xl transition-all transform duration-300 ${isDark ? 'bg-[#1C1C1E]/90 border border-[#2C2C2E] shadow-black/50' : 'bg-white/90 border border-white shadow-slate-200/50'}`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>{title}</h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors -mr-2 ${isDark ? 'text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E]' : 'text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#E5E5EA]'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className={`mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3.5 font-medium rounded-2xl transition-all active:scale-[0.98] ${isDark ? 'bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white' : 'bg-[#E5E5EA] hover:bg-[#D1D1D6] text-[#1C1C1E]'}`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 font-bold rounded-2xl transition-all active:scale-[0.98] ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
