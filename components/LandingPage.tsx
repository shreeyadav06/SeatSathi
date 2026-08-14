import React from 'react';
import { ThemeMode } from '../types';
import { RankPredictor } from './RankPredictor';
import { motion } from 'framer-motion';
import { ShinyText } from './common/ShinyText';
interface LandingPageProps {
  onStart: () => void;
  user: any;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
}

// Minimal mock for NoteModal until we extract it too
// If NoteModal is not extracted, we should pass it or extract it.
// Actually, NoteModal is in App.tsx. I should pass onNoteClick.
export const LandingPage: React.FC<LandingPageProps & { onNoteClick?: () => void, onGuestLogin?: () => void }> = ({ 
  onStart, user, onLoginClick, onSignupClick, onLogout, theme, toggleTheme, onNoteClick, onGuestLogin
}) => {
  return (
    <div className={`min-h-screen max-h-screen flex flex-col font-sans selection:bg-blue-500/30 overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-black text-[#F2F2F7]' : 'bg-[#F2F2F7] text-[#1C1C1E]'}`}>
      {/* Navbar - Glassmorphism */}
      <nav className={`flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto w-full sticky top-0 z-50 transition-colors duration-300 ${theme === 'light' ? 'bg-[#F2F2F7]/70 backdrop-blur-xl border-b border-[#E5E5EA]' : 'bg-black/70 backdrop-blur-xl border-b border-[#2C2C2E]'}`}>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#007AFF] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm">S</div>
          <span className={`text-lg sm:text-xl font-semibold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#1C1C1E]'}`}>Seat<span className="text-[#007AFF]">Sathi</span></span>
        </div>
        
        {/* Theme Toggle & Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            onClick={toggleTheme}
            className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ${theme === 'dark' ? 'bg-[#2C2C2E] text-[#0A84FF] hover:bg-[#3A3A3C]' : 'bg-[#E5E5EA] text-[#007AFF] hover:bg-[#D1D1D6]'}`}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </motion.button>
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0" />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] font-medium text-xs sm:text-sm shrink-0">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-slate-300 hidden sm:inline">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                onClick={onLogout}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap ${theme === 'dark' ? 'text-[#8E8E93] hover:text-white bg-[#1C1C1E] hover:bg-[#2C2C2E]' : 'text-[#8E8E93] hover:text-[#1C1C1E] bg-[#E5E5EA] hover:bg-[#D1D1D6]'}`}
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                onClick={onLoginClick}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${theme === 'dark' ? 'text-white bg-[#2C2C2E] hover:bg-[#3A3A3C]' : 'text-[#1C1C1E] bg-[#E5E5EA] hover:bg-[#D1D1D6]'}`}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Login
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                onClick={onSignupClick}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full flex items-center gap-1.5 sm:gap-2 bg-[#007AFF] text-white hover:bg-[#007AFF]/90 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3-0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Sign Up
              </motion.button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Scrollable */}
      <main className="flex-1 flex flex-col items-center justify-start text-center px-4 py-12 md:py-20 relative overflow-y-auto custom-scrollbar z-10 w-full">

        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-[#2C2C2E] text-[#0A84FF]' : 'bg-[#E5E5EA] text-[#007AFF]'} mb-8`}>
          <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse"></span>
          AI Admission Counselor
        </div>

        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 max-w-4xl leading-[1.1] px-2 ${theme === 'dark' ? 'text-white' : 'text-[#1C1C1E]'}`}>
          Seat<span className="text-[#007AFF]">Sathi</span><br />
          KCET Counselling. <br />
          <span className="text-[#007AFF]">Simplified.</span>
        </h1>

        <p className={`text-base sm:text-lg md:text-xl max-w-2xl mb-8 md:mb-12 leading-relaxed px-4 ${theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#3A3A3C]'}`}>
          Navigate your engineering admissions with confidence. Instant cutoff analysis and college predictions tailored for Karnataka students.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
          {user ? (
            <motion.button 
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={onStart}
              className="group relative w-full inline-flex items-center justify-center gap-2 bg-[#007AFF] text-white text-base md:text-lg font-semibold px-6 md:px-8 py-3.5 md:py-4 rounded-2xl transition-colors hover:bg-[#007AFF]/90"
            >
              Start Chatting
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </motion.button>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <motion.button 
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                onClick={onLoginClick}
                className="group w-full relative inline-flex items-center justify-center gap-2 bg-[#007AFF] text-white text-base md:text-lg font-semibold px-6 md:px-8 py-3.5 md:py-4 rounded-2xl transition-colors hover:bg-[#007AFF]/90"
              >
                Login to Start Chatting
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </motion.button>
              
              <motion.button 
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                onClick={onGuestLogin}
                className={`group w-full relative inline-flex items-center justify-center gap-2 text-base md:text-lg font-semibold px-6 md:px-8 py-3.5 md:py-4 rounded-2xl transition-colors border ${theme === 'dark' ? 'border-[#3A3A3C] text-white hover:bg-[#2C2C2E]' : 'border-[#E5E5EA] text-[#1C1C1E] hover:bg-[#E5E5EA]'}`}
              >
                Continue as Guest
                
                {/* Info Tooltip Button */}
                <div 
                  className="group/tooltip relative flex items-center justify-center w-5 h-5 rounded-full border border-current opacity-60 hover:opacity-100 cursor-help transition-opacity ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] font-bold leading-none">i</span>
                  {/* Tooltip text */}
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 sm:w-64 p-3 rounded-xl text-xs sm:text-sm font-normal text-center shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-[100] pointer-events-none ${theme === 'dark' ? 'bg-[#2C2C2E] text-white border border-[#3A3A3C]' : 'bg-white text-[#1C1C1E] border border-[#E5E5EA]'}`}>
                    Guest mode is restricted to a maximum 2-minute session. Auto-logout will occur, and your next guest session will be available after 24 hours.
                    {/* Triangle pointer */}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent ${theme === 'dark' ? 'border-t-[#2C2C2E]' : 'border-t-white'}`}></div>
                  </div>
                </div>
              </motion.button>

              <p className={`text-sm ${theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#8E8E93]'}`}>
                Don't have an account? <button onClick={onSignupClick} className="text-[#007AFF] hover:text-[#007AFF]/80 font-medium">Sign up</button>
              </p>
            </div>
          )}
          
          {/* NOTE Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            onClick={onNoteClick}
            className={`inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium rounded-full transition-colors ${theme === 'dark' ? 'text-[#8E8E93] bg-[#2C2C2E] hover:bg-[#3A3A3C]' : 'text-[#3A3A3C] bg-[#E5E5EA] hover:bg-[#D1D1D6]'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Important Notes & Info
          </motion.button>
        </div>

        {/* --- ADD RANK PREDICTOR HERE --- */}
        <div className="mt-12 w-full max-w-lg mx-auto">
           <RankPredictor theme={theme} />
        </div>

        <div className={`mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 text-left max-w-5xl text-sm px-4 w-full ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
             {/* Flashcard 1: Real KCET Data */}
             <div className="flip-card group cursor-pointer w-full">
               <div className="flip-card-inner">
                 {/* Front */}
                 <div className={`flip-card-front p-6 rounded-3xl border transition-all duration-300 shadow-xl flex flex-col items-center justify-center backdrop-blur-xl ${theme === 'dark' ? 'bg-[#1C1C1E]/60 border-[#2C2C2E] hover:border-[#3A3A3C]' : 'bg-white/60 border-slate-200/50 hover:border-slate-300'}`}>
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${theme === 'dark' ? 'bg-[#0A84FF]/20 text-[#0A84FF]' : 'bg-[#007AFF]/10 text-[#007AFF]'}`}>
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                   </div>
                   <h3 className={`font-bold text-lg text-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Real KCET Data</h3>
                   <p className={`text-xs mt-2 text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Hover to learn more</p>
                 </div>
                 {/* Back */}
                 <div className={`flip-card-back p-6 rounded-3xl border flex flex-col justify-center backdrop-blur-xl ${theme === 'dark' ? 'bg-[#1C1C1E]/60 border-[#2C2C2E]' : 'bg-white/60 border-slate-200/50'}`}>
                   <h3 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}`}>Real KCET Data</h3>
                   <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>•</span> 2024 & 2025 verified cutoffs</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>•</span> 250+ colleges covered</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>•</span> All rounds (R1, R2, R3)</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>•</span> All categories supported</li>
                   </ul>
                 </div>
               </div>
             </div>
             
             {/* Flashcard 2: Voice Interface */}
             <div className="flip-card group cursor-pointer w-full">
               <div className="flip-card-inner">
                 {/* Front */}
                 <div className={`flip-card-front p-6 rounded-3xl border transition-all duration-300 shadow-xl flex flex-col items-center justify-center backdrop-blur-xl ${theme === 'dark' ? 'bg-[#1C1C1E]/60 border-[#2C2C2E] hover:border-[#3A3A3C]' : 'bg-white/60 border-slate-200/50 hover:border-slate-300'}`}>
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${theme === 'dark' ? 'bg-[#0A84FF]/20 text-[#0A84FF]' : 'bg-[#007AFF]/10 text-[#007AFF]'}`}>
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                   </div>
                   <h3 className={`font-bold text-lg text-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Voice Interface</h3>
                   <p className={`text-xs mt-2 text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Hover to learn more</p>
                 </div>
                 {/* Back */}
                 <div className={`flip-card-back p-6 rounded-3xl border flex flex-col justify-center backdrop-blur-xl ${theme === 'dark' ? 'bg-[#1C1C1E]/60 border-[#2C2C2E]' : 'bg-white/60 border-slate-200/50'}`}>
                   <h3 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}`}>Voice Interface</h3>
                   <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>•</span> Natural conversation</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>•</span> English, Hinglish & Kannada</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>•</span> Instant responses</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>•</span> Powered by Gemini AI</li>
                   </ul>
                 </div>
               </div>
             </div>
             
             {/* Flashcard 3: College Lists */}
             <div className="flip-card group cursor-pointer w-full sm:col-span-2 lg:col-span-1">
               <div className="flip-card-inner">
                 {/* Front */}
                 <div className={`flip-card-front p-6 rounded-3xl border transition-all duration-300 shadow-xl flex flex-col items-center justify-center backdrop-blur-xl ${theme === 'dark' ? 'bg-[#1C1C1E]/60 border-[#2C2C2E] hover:border-[#3A3A3C]' : 'bg-white/60 border-slate-200/50 hover:border-slate-300'}`}>
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${theme === 'dark' ? 'bg-[#0A84FF]/20 text-[#0A84FF]' : 'bg-[#007AFF]/10 text-[#007AFF]'}`}>
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                   </div>
                   <h3 className={`font-bold text-lg text-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>College Lists</h3>
                   <p className={`text-xs mt-2 text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Hover to learn more</p>
                 </div>
                 {/* Back */}
                 <div className={`flip-card-back p-6 rounded-3xl border flex flex-col justify-center backdrop-blur-xl ${theme === 'dark' ? 'bg-[#1C1C1E]/60 border-[#2C2C2E]' : 'bg-white/60 border-slate-200/50'}`}>
                   <h3 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}`}>College Lists</h3>
                   <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>•</span> Create custom lists</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>•</span> Drag & drop to reorder</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>•</span> Sort by admission chances</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}>•</span> Export to PDF</li>
                   </ul>
                 </div>
               </div>
             </div>
        </div>
        
        <div className={`mt-10 md:mt-16 mb-8 text-xs text-center max-w-lg mx-auto px-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
            SeatSathi AI is currently under development. Responses are generated by AI and may vary; please verify important details from official sources.
        </div>
      </main>
    </div>
  );
};
