import React from 'react';
import { ThemeMode } from '../../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, theme = 'dark' }) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 rounded-3xl shadow-2xl custom-scrollbar transition-all transform duration-300 ${isDark ? 'bg-[#1C1C1E]/90 border border-[#2C2C2E] shadow-black/50' : 'bg-white/90 border border-white shadow-slate-200/50'}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-transparent z-10 backdrop-blur-xl -mx-6 md:-mx-8 px-6 md:px-8 py-2 -mt-6">
          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>
            Important Notes & Info
          </h2>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full transition-colors ${isDark ? 'text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E]' : 'text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#E5E5EA]'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`space-y-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-[#0A84FF]' : 'text-[#007AFF]'}`}>How to Use SeatSathi</h3>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base leading-relaxed">
              <li>Login or Sign up to start chatting</li>
              <li>Click "Start Chatting" and allow microphone access</li>
              <li>Tell SeatSathi your KCET rank, category (GM/2A/3B/SC/ST), preferred branch, and city</li>
              <li>Matching colleges will appear automatically sorted by admission chances</li>
              <li>You can export your college list to PDF for future reference</li>
            </ul>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-[#0A84FF]' : 'text-[#007AFF]'}`}>KCET Exam Details</h3>
            <div className={`rounded-2xl p-5 text-sm space-y-3 ${isDark ? 'bg-[#2C2C2E]/50 border border-[#3A3A3C]' : 'bg-[#F2F2F7] border border-[#E5E5EA]'}`}>
              <p><strong className={isDark ? 'text-white' : 'text-slate-900'}>Exam Period:</strong> April-May (dates announced by KEA)</p>
              <p><strong className={isDark ? 'text-white' : 'text-slate-900'}>Total Marks:</strong> 180 (Physics 60 + Chemistry 60 + Mathematics 60)</p>
              <p><strong className={isDark ? 'text-white' : 'text-slate-900'}>Eligibility:</strong> 12th pass with PCM, minimum 45% aggregate (40% for reserved)</p>
              <p><strong className={isDark ? 'text-white' : 'text-slate-900'}>Ranking:</strong> 50% KCET score + 50% 12th board marks</p>
              <p><strong className={isDark ? 'text-white' : 'text-slate-900'}>Total Seats:</strong> ~50,000 engineering seats across 200+ colleges</p>
            </div>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-[#0A84FF]' : 'text-[#007AFF]'}`}>Other Exam Resources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <a href="https://jeemain.nta.nic.in" target="_blank" rel="noopener noreferrer" 
                className={`p-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 group ${isDark ? 'bg-[#2C2C2E]/50 border border-[#3A3A3C] hover:bg-[#3A3A3C]' : 'bg-[#F2F2F7] border border-[#E5E5EA] hover:bg-[#E5E5EA]'}`}>
                <div className={`font-semibold ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-700'}`}>JEE Main</div>
                <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>jeemain.nta.nic.in</div>
              </a>
              <a href="https://neet.nta.nic.in" target="_blank" rel="noopener noreferrer"
                className={`p-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 group ${isDark ? 'bg-[#2C2C2E]/50 border border-[#3A3A3C] hover:bg-[#3A3A3C]' : 'bg-[#F2F2F7] border border-[#E5E5EA] hover:bg-[#E5E5EA]'}`}>
                <div className={`font-semibold ${isDark ? 'text-green-400 group-hover:text-green-300' : 'text-green-600 group-hover:text-green-700'}`}>NEET</div>
                <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>neet.nta.nic.in</div>
              </a>
              <a href="https://www.comedk.org" target="_blank" rel="noopener noreferrer"
                className={`p-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 group ${isDark ? 'bg-[#2C2C2E]/50 border border-[#3A3A3C] hover:bg-[#3A3A3C]' : 'bg-[#F2F2F7] border border-[#E5E5EA] hover:bg-[#E5E5EA]'}`}>
                <div className={`font-semibold ${isDark ? 'text-purple-400 group-hover:text-purple-300' : 'text-purple-600 group-hover:text-purple-700'}`}>COMEDK</div>
                <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>comedk.org</div>
              </a>
            </div>
          </section>

          <section>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-[#0A84FF]' : 'text-[#007AFF]'}`}>Available Branches</h3>
            <div className="flex flex-wrap gap-2 text-xs md:text-sm">
              {['Computer Science (CS)', 'Information Science (IS)', 'Electronics & Communication (EC)', 
                'Electrical Engineering (EE)', 'Mechanical (ME)', 'Civil (CE)',
                'AI & Machine Learning', 'Data Science', 'Robotics',
                'Aerospace', 'Chemical', 'Biotechnology'].map((branch, i) => (
                <div key={i} className={`px-4 py-2 rounded-full font-medium ${isDark ? 'bg-[#2C2C2E] text-slate-300' : 'bg-[#E5E5EA] text-slate-700'}`}>
                  {branch}
                </div>
              ))}
            </div>
          </section>

          <section className="pb-4">
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-[#0A84FF]' : 'text-[#007AFF]'}`}>Disclaimer</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#8E8E93]' : 'text-slate-500'}`}>
              SeatSathi AI provides suggestions based on historical cutoff data. Actual admissions depend on many factors 
              including seat availability, counseling dynamics, and official KEA decisions. Always verify information 
              from official sources before making decisions.
            </p>
          </section>
        </div>

        <button
          onClick={onClose}
          className={`w-full mt-2 py-4 font-bold rounded-2xl transition-transform active:scale-[0.98] ${isDark ? 'bg-[#007AFF] text-white hover:bg-[#007AFF]/90' : 'bg-[#007AFF] text-white hover:bg-[#007AFF]/90'}`}
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
