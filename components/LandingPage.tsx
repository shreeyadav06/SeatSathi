import React, { useState } from 'react';
import { ThemeMode } from '../types';
import { RankPredictor } from './RankPredictor';
import { AuroraBackground } from './common/AuroraBackground';
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
export const LandingPage: React.FC<LandingPageProps & { onNoteClick?: () => void }> = ({ 
  onStart, user, onLoginClick, onSignupClick, onLogout, theme, toggleTheme, onNoteClick 
}) => {
  return (
    <AuroraBackground colors={theme === 'dark' ? ['#eab308', '#0a0f1a', '#1e3a5f', '#eab308'] : ['#fef08a', '#ffffff', '#e2e8f0', '#fef08a']} className={`min-h-screen max-h-screen flex flex-col font-sans selection:bg-yellow-500/30 overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Navbar - Glassmorphism */}
      <nav className={`flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full sticky top-0 z-50 ${theme === 'light' ? 'bg-white/40 backdrop-blur-xl border-b border-white/20' : 'bg-[#0a0f1a]/40 backdrop-blur-xl border-b border-white/5'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-slate-900 font-bold">S</div>
          <span className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Seat<span className="text-yellow-500">Sathi</span></span>
        </div>
        
        {/* Theme Toggle & Auth Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-[#0d1829] text-yellow-400 hover:bg-[#152238]' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-medium text-sm">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-slate-300 hidden sm:inline">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLoginClick}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${theme === 'dark' ? 'text-white bg-[#0d1829] hover:bg-[#152238] border border-[#1e3a5f]' : 'text-slate-700 bg-slate-200 hover:bg-slate-300 border border-slate-300'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Login
              </button>
              <button
                onClick={onSignupClick}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3-0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Scrollable */}
      <main className="flex-1 flex flex-col items-center text-center px-4 py-10 relative overflow-y-auto custom-scrollbar z-10 w-full">

        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium text-yellow-500 mb-8 backdrop-blur-md ${theme === 'dark' ? 'bg-[#0d1829]/50 border-[#1e3a5f]/50' : 'bg-white/50 border-yellow-200/50'}`}>
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
          AI Admission Counselor
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 max-w-5xl leading-[1.1] px-2">
          <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Seat</span><span className="text-yellow-500">Sathi</span><br />
          KCET Counselling. <br />
          <ShinyText text="Simplified." speed={3} className="text-yellow-400" />
        </h1>

        <p className={`text-base sm:text-lg md:text-xl max-w-2xl mb-6 md:mb-10 leading-relaxed px-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          Navigate your engineering admissions with confidence. Instant cutoff analysis and college predictions tailored for Karnataka students.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4">
          {user ? (
            <button 
              onClick={onStart}
              className="group relative inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-base md:text-lg font-bold px-6 md:px-8 py-3 md:py-4 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(234,179,8,0.5)]"
            >
              Start Chatting
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button 
                onClick={onLoginClick}
                className="group relative inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-base md:text-lg font-bold px-6 md:px-8 py-3 md:py-4 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(234,179,8,0.5)]"
              >
                Login to Start Chatting
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                Don't have an account? <button onClick={onSignupClick} className="text-yellow-500 hover:text-yellow-400 font-medium">Sign up</button>
              </p>
            </div>
          )}
          
          {/* NOTE Button */}
          <button
            onClick={onNoteClick}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-yellow-500 rounded-full transition-colors backdrop-blur-md ${theme === 'dark' ? 'text-slate-300 bg-[#0d1829]/40 border border-white/10 hover:border-yellow-500/50' : 'text-slate-700 bg-white/40 border border-slate-300/50 hover:border-yellow-500'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Important Notes & Info
          </button>
        </div>

        {/* --- ADD RANK PREDICTOR HERE --- */}
        <div className="mt-12 w-full max-w-lg mx-auto">
           <RankPredictor />
        </div>

        <div className={`mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 text-left max-w-5xl text-sm px-4 w-full ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
             {/* Flashcard 1: Real KCET Data */}
             <div className="flip-card group cursor-pointer w-full">
               <div className="flip-card-inner">
                 {/* Front */}
                 <div className={`flip-card-front p-6 rounded-2xl border transition-all duration-300 shadow-lg flex flex-col items-center justify-center backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0a0f1a]/40 border-white/10 hover:border-white/20' : 'bg-white/40 border-slate-200/50 hover:border-slate-300'}`}>
                   <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4 text-yellow-500 group-hover:scale-110 transition-transform duration-300">
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                   </div>
                   <h3 className={`font-bold text-lg text-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Real KCET Data</h3>
                   <p className={`text-xs mt-2 text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Hover to learn more</p>
                 </div>
                 {/* Back */}
                 <div className={`flip-card-back p-6 rounded-2xl border flex flex-col justify-center backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0a0f1a]/40 border-white/10' : 'bg-white/40 border-slate-200/50'}`}>
                   <h3 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>Real KCET Data</h3>
                   <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span> 2024 & 2025 verified cutoffs</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span> 250+ colleges covered</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span> All rounds (R1, R2, R3)</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span> All categories supported</li>
                   </ul>
                 </div>
               </div>
             </div>
             
             {/* Flashcard 2: Voice Interface */}
             <div className="flip-card group cursor-pointer w-full">
               <div className="flip-card-inner">
                 {/* Front */}
                 <div className={`flip-card-front p-6 rounded-2xl border transition-all duration-300 shadow-lg flex flex-col items-center justify-center backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0a0f1a]/40 border-white/10 hover:border-white/20' : 'bg-white/40 border-slate-200/50 hover:border-slate-300'}`}>
                   <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4 text-yellow-500 group-hover:scale-110 transition-transform duration-300">
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                   </div>
                   <h3 className={`font-bold text-lg text-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Voice Interface</h3>
                   <p className={`text-xs mt-2 text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Hover to learn more</p>
                 </div>
                 {/* Back */}
                 <div className={`flip-card-back p-6 rounded-2xl border flex flex-col justify-center backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0a0f1a]/40 border-white/10' : 'bg-white/40 border-slate-200/50'}`}>
                   <h3 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>Voice Interface</h3>
                   <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span> Natural conversation</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span> English, Hinglish & Kannada</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span> Instant responses</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span> Powered by Gemini AI</li>
                   </ul>
                 </div>
               </div>
             </div>
             
             {/* Flashcard 3: College Lists */}
             <div className="flip-card group cursor-pointer w-full sm:col-span-2 lg:col-span-1">
               <div className="flip-card-inner">
                 {/* Front */}
                 <div className={`flip-card-front p-6 rounded-2xl border transition-all duration-300 shadow-lg flex flex-col items-center justify-center backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0a0f1a]/40 border-white/10 hover:border-white/20' : 'bg-white/40 border-slate-200/50 hover:border-slate-300'}`}>
                   <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4 text-yellow-500 group-hover:scale-110 transition-transform duration-300">
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                   </div>
                   <h3 className={`font-bold text-lg text-center ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>College Lists</h3>
                   <p className={`text-xs mt-2 text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Hover to learn more</p>
                 </div>
                 {/* Back */}
                 <div className={`flip-card-back p-6 rounded-2xl border flex flex-col justify-center backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0a0f1a]/40 border-white/10' : 'bg-white/40 border-slate-200/50'}`}>
                   <h3 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>College Lists</h3>
                   <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span> Create custom lists</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span> Drag & drop to reorder</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span> Sort by admission chances</li>
                     <li className="flex items-start gap-2"><span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span> Export to PDF</li>
                   </ul>
                 </div>
               </div>
             </div>
        </div>
        
        <div className="mt-10 md:mt-16 mb-8 text-slate-600 text-xs text-center max-w-lg mx-auto px-4">
            SeatSathi AI is currently under development. Responses are generated by AI and may vary; please verify important details from official sources.
        </div>
      </main>
    </AuroraBackground>
  );
};
