import React from 'react';
import { motion } from 'framer-motion';
import { CollegeRecommendation } from '../types';

type ThemeMode = 'dark' | 'light';

interface CollegeCardProps {
  data: CollegeRecommendation;
  index: number;
  totalCount?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  onAddToList?: () => void;
  showControls?: boolean;
  theme?: ThemeMode;
}

const CollegeCard: React.FC<CollegeCardProps> = ({ 
  data, 
  index, 
  totalCount = 0,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddToList,
  showControls = false,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  
  const getChanceColor = (chance: string) => {
    switch (chance) {
      case 'Safe': return isDark ? 'border-green-500/50 bg-green-900/20' : 'border-green-400 bg-green-50';
      case 'Moderate': return isDark ? 'border-[#FF9F0A]/50 bg-[#FF9F0A]/20' : 'border-[#FF9500] bg-[#FF9500]/10';
      case 'Reach': return isDark ? 'border-red-500/50 bg-red-900/20' : 'border-red-400 bg-red-50';
      default: return isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-100';
    }
  };

  const getChanceText = (chance: string) => {
     switch(chance) {
         case 'Safe': return isDark ? 'text-green-400' : 'text-green-600';
         case 'Moderate': return isDark ? 'text-orange-400' : 'text-orange-600';
         case 'Reach': return isDark ? 'text-red-400' : 'text-red-600';
         default: return isDark ? 'text-[#8E8E93]' : 'text-[#8E8E93]';
     }
  }

  const getChanceBadgeBg = (chance: string) => {
    switch(chance) {
      case 'Safe': return isDark ? 'bg-green-500/20' : 'bg-green-100';
      case 'Moderate': return isDark ? 'bg-[#FF9F0A]/20' : 'bg-[#FF9500]/10';
      case 'Reach': return isDark ? 'bg-red-500/20' : 'bg-red-100';
      default: return isDark ? 'bg-slate-500/20' : 'bg-slate-100';
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      className={`p-4 rounded-3xl border backdrop-blur-xl ${isDark ? 'bg-[#1C1C1E]/80 border-[#2C2C2E]' : 'bg-white/80 border-[#E5E5EA] shadow-sm'}`}
    >
      <div className="flex justify-between items-start gap-3">
        {/* Left side - College info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base md:text-lg leading-tight ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>
            {index + 1}. {data.collegeName} {data.collegeCode && <span className="text-xs text-[#007AFF] font-mono ml-1 px-1.5 py-0.5 rounded-md bg-[#007AFF]/10 border border-[#007AFF]/20">[{data.collegeCode}]</span>}
          </h3>
          {/* Course and Location boxes */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {data.searchCategory && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${isDark ? 'text-[#BF5AF2] bg-[#BF5AF2]/10 border-[#BF5AF2]/20' : 'text-[#AF52DE] bg-[#AF52DE]/10 border-[#AF52DE]/20'}`}>
                {data.searchCategory}
              </span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${isDark ? 'text-[#0A84FF] bg-[#0A84FF]/10 border-[#0A84FF]/20' : 'text-[#007AFF] bg-[#007AFF]/10 border-[#007AFF]/20'}`}>
              {data.branch}
            </span>
            {data.location && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${isDark ? 'text-[#8E8E93] bg-[#2C2C2E] border-[#3A3A3C]' : 'text-[#8E8E93] bg-[#E5E5EA] border-[#D1D1D6]'}`}>
                {data.location}
              </span>
            )}
          </div>
        </div>
        
        {/* Right side - Chance badge and controls */}
        <div className="flex flex-col items-end gap-2">
          <div className={`font-bold text-sm px-2 py-1 rounded ${getChanceBadgeBg(data.chance)} ${getChanceText(data.chance)}`}>
            {data.chance}
          </div>
          
          {/* Edit Controls - Always visible row */}
          <div className="flex items-center gap-1">
            {/* Add to list button - always visible */}
            {onAddToList && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToList(); }}
                className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-green-500/20 text-green-400 hover:text-green-300' : 'hover:bg-green-100 text-green-600 hover:text-green-700'}`}
                title="Add to saved list"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>
            )}
            
            {/* Move and Remove controls - only in edit mode */}
            {showControls && (
              <>
                {/* Move Up */}
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
                  disabled={index === 0}
                  className={`p-1.5 rounded-lg transition-all ${
                    index === 0 
                      ? 'opacity-30 cursor-not-allowed' 
                      : isDark 
                        ? 'hover:bg-blue-500/20 text-blue-400 hover:text-blue-300' 
                        : 'hover:bg-blue-100 text-blue-600 hover:text-blue-700'
                  }`}
                  title="Move up"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                </button>
                
                {/* Move Down */}
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
                  disabled={index === totalCount - 1}
                  className={`p-1.5 rounded-lg transition-all ${
                    index === totalCount - 1 
                      ? 'opacity-30 cursor-not-allowed' 
                      : isDark 
                        ? 'hover:bg-blue-500/20 text-blue-400 hover:text-blue-300' 
                        : 'hover:bg-blue-100 text-blue-600 hover:text-blue-700'
                  }`}
                  title="Move down"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                
                {/* Remove */}
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                  className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' : 'hover:bg-red-100 text-red-600 hover:text-red-700'}`}
                  title="Remove from list"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Cutoff Data */}
      <div className={`mt-3 grid grid-cols-2 gap-2 text-xs border-t pt-2 ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
         <div className={`p-2 rounded ${isDark ? 'bg-slate-900/40' : 'bg-white/60'}`}>
            <span className={`block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>2025 Range</span>
            <span className={`font-mono text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {data.cutoff2025 && data.cutoff2025 !== 'N/A' ? data.cutoff2025 : 'N/A'}
            </span>
         </div>
         <div className={`p-2 rounded ${isDark ? 'bg-slate-900/40' : 'bg-white/60'}`}>
            <span className={`block mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>2024 Range</span>
            <span className={`font-mono text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {data.cutoff2024 && data.cutoff2024 !== 'N/A' ? data.cutoff2024 : 'N/A'}
            </span>
         </div>
      </div>
    </motion.div>
  );
};

export default CollegeCard;
