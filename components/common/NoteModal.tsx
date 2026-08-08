import React from 'react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a0f1a] border border-[#1e3a5f] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-xl custom-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Important Notes
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 text-slate-300">
          <section>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">How to Use SeatSathi</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Login or Sign up to start chatting</li>
              <li>Click "Start Chatting" and allow microphone access</li>
              <li>Tell SeatSathi your KCET rank, category (GM/2A/3B/SC/ST), preferred branch, and city</li>
              <li>Matching colleges will appear automatically sorted by admission chances</li>
              <li>You can export your college list to PDF for future reference</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">KCET Exam Details</h3>
            <div className="bg-[#0d1829] rounded-xl p-4 text-sm space-y-2">
              <p><strong>Exam Period:</strong> April-May (dates announced by KEA)</p>
              <p><strong>Total Marks:</strong> 180 (Physics 60 + Chemistry 60 + Mathematics 60)</p>
              <p><strong>Eligibility:</strong> 12th pass with PCM, minimum 45% aggregate (40% for reserved)</p>
              <p><strong>Ranking:</strong> 50% KCET score + 50% 12th board marks</p>
              <p><strong>Total Seats:</strong> ~50,000 engineering seats across 200+ colleges</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Other Exam Resources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <a href="https://jeemain.nta.nic.in" target="_blank" rel="noopener noreferrer" 
                className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-colors text-center">
                <div className="font-semibold text-blue-400">JEE Main</div>
                <div className="text-xs text-slate-400 mt-1">jeemain.nta.nic.in</div>
              </a>
              <a href="https://neet.nta.nic.in" target="_blank" rel="noopener noreferrer"
                className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors text-center">
                <div className="font-semibold text-green-400">NEET</div>
                <div className="text-xs text-slate-400 mt-1">neet.nta.nic.in</div>
              </a>
              <a href="https://www.comedk.org" target="_blank" rel="noopener noreferrer"
                className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-colors text-center">
                <div className="font-semibold text-purple-400">COMEDK</div>
                <div className="text-xs text-slate-400 mt-1">comedk.org</div>
              </a>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Available Branches</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {['Computer Science (CS)', 'Information Science (IS)', 'Electronics & Communication (EC)', 
                'Electrical Engineering (EE)', 'Mechanical (ME)', 'Civil (CE)',
                'AI & Machine Learning', 'Data Science', 'Robotics',
                'Aerospace', 'Chemical', 'Biotechnology'].map((branch, i) => (
                <div key={i} className="px-3 py-2 bg-[#0d1829] rounded-lg text-slate-300">{branch}</div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Disclaimer</h3>
            <p className="text-xs text-slate-500">
              SeatSathi AI provides suggestions based on historical cutoff data. Actual admissions depend on many factors 
              including seat availability, counseling dynamics, and official KEA decisions. Always verify information 
              from official sources before making decisions.
            </p>
          </section>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
