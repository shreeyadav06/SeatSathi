import React, { useState } from 'react';
import { ThemeMode } from '../types';// The reference data from 2025
const combinedToRankMap = [
  { minPct: 97, maxPct: 100, minRank: 1, maxRank: 120 },
  { minPct: 94, maxPct: 97, minRank: 120, maxRank: 500 },
  { minPct: 91, maxPct: 94, minRank: 500, maxRank: 1100 },
  { minPct: 88, maxPct: 91, minRank: 1100, maxRank: 2000 },
  { minPct: 85, maxPct: 88, minRank: 2000, maxRank: 3200 },
  { minPct: 80, maxPct: 85, minRank: 3200, maxRank: 5000 },
  { minPct: 75, maxPct: 80, minRank: 5000, maxRank: 10000 },
  { minPct: 70, maxPct: 75, minRank: 10000, maxRank: 15000 },
  { minPct: 60, maxPct: 70, minRank: 15000, maxRank: 50000 },
  { minPct: 0, maxPct: 60, minRank: 50000, maxRank: 150000 },
];

interface RankPredictorProps {
  theme?: ThemeMode;
}

export const RankPredictor: React.FC<RankPredictorProps> = ({ theme = 'dark' }) => {
  const [pcmTotal, setPcmTotal] = useState<string>('');
  const [kcetTotal, setKcetTotal] = useState<string>('');
  const [predictedRank, setPredictedRank] = useState<{ min: number; max: number } | null>(null);

  const calculateRank = () => {
    const pcm = parseFloat(pcmTotal);
    const kcet = parseFloat(kcetTotal);
    
    if (isNaN(pcm) || isNaN(kcet) || pcm < 0 || pcm > 300 || kcet < 0 || kcet > 180) {
      alert("Please enter valid marks. PCM out of 300, KCET out of 180.");
      return;
    }

    const pucPct = (pcm / 300) * 100;
    const kcetPct = (kcet / 180) * 100;
    const meritScore = (pucPct + kcetPct) / 2;

    let baseMinRank = 150000;
    let baseMaxRank = 200000;

    for (const band of combinedToRankMap) {
      if (meritScore > band.minPct && meritScore <= band.maxPct) {
        const pctRange = band.maxPct - band.minPct;
        const rankRange = band.maxRank - band.minRank;
        
        const rankRatio = (band.maxPct - meritScore) / pctRange;
        const exactBaseRank = band.minRank + Math.floor(rankRatio * rankRange);
        
        const driftMultiplier = 1.15; 
        const driftedRank = Math.floor(exactBaseRank * driftMultiplier);
        
        baseMinRank = Math.max(1, driftedRank - 500);
        baseMaxRank = driftedRank + 500;
        break;
      }
    }
    
    setPredictedRank({ min: baseMinRank, max: baseMaxRank });
  };

  return (
    <div className={`w-full max-w-xl mx-auto p-6 md:p-8 rounded-3xl shadow-2xl transition-all font-sans backdrop-blur-xl border ${theme === 'dark' ? 'bg-[#1C1C1E]/90 border-[#2C2C2E] shadow-black/50 text-white' : 'bg-white/90 border-slate-200/50 shadow-slate-200/50 text-[#1C1C1E]'}`}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight font-display">Rank Predictor</h2>
        <p className={`mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Estimate your KCET rank based on board and CET performance.</p>
      </div>
      
      <div className={`p-4 md:p-5 rounded-2xl mb-8 flex gap-3 items-start border ${theme === 'dark' ? 'bg-[#FF9500]/10 border-[#FF9500]/20' : 'bg-[#FF9500]/10 border-[#FF9500]/20'}`}>
        <svg className="w-6 h-6 text-[#FF9500] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <strong className="text-[#FF9500] font-medium block mb-1">Approximate Statistical Model</strong>
          <p className="text-sm text-[#FF9500]/80 leading-relaxed">
            This predictor uses historical 50:50 normalization and applies a candidate-pool drift factor. Board marks are normalized by KEA. Actual ranks will vary.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} htmlFor="pcm">
            PUC PCM Total (out of 300)
          </label>
          <input 
            id="pcm"
            type="number" 
            value={pcmTotal}
            onChange={(e) => setPcmTotal(e.target.value)}
            className={`w-full px-4 py-3.5 border rounded-2xl focus:outline-none transition-colors ${theme === 'dark' ? 'bg-[#2C2C2E]/50 border-[#3A3A3C] text-white placeholder-slate-500 focus:border-[#0A84FF]' : 'bg-[#F2F2F7] border-[#E5E5EA] text-[#1C1C1E] placeholder-slate-400 focus:border-[#007AFF]'}`}
            placeholder="e.g. 285"
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} htmlFor="kcet">
            KCET Score (out of 180)
          </label>
          <input 
            id="kcet"
            type="number" 
            value={kcetTotal}
            onChange={(e) => setKcetTotal(e.target.value)}
            className={`w-full px-4 py-3.5 border rounded-2xl focus:outline-none transition-colors ${theme === 'dark' ? 'bg-[#2C2C2E]/50 border-[#3A3A3C] text-white placeholder-slate-500 focus:border-[#0A84FF]' : 'bg-[#F2F2F7] border-[#E5E5EA] text-[#1C1C1E] placeholder-slate-400 focus:border-[#007AFF]'}`}
            placeholder="e.g. 135"
          />
        </div>

        <button 
          onClick={calculateRank}
          className={`w-full py-4 mt-2 font-bold rounded-2xl transition-all active:scale-[0.98] ${theme === 'dark' ? 'bg-[#007AFF] text-white hover:bg-[#007AFF]/90 shadow-lg shadow-[#007AFF]/20' : 'bg-[#007AFF] text-white hover:bg-[#007AFF]/90 shadow-lg shadow-[#007AFF]/20'}`}
        >
          Predict Approximate Rank
        </button>

        {predictedRank && (
          <div className={`mt-8 p-8 border rounded-3xl text-center transition-all animate-in fade-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-[#2C2C2E]/50 border-[#3A3A3C]' : 'bg-[#F2F2F7]/50 border-[#E5E5EA]'}`}>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-3">Expected Range</p>
            <h3 className={`text-4xl md:text-5xl font-bold tracking-tight ${theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]'}`}>
              {predictedRank.min.toLocaleString()} <span className={`font-normal mx-2 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>–</span> {predictedRank.max.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-4">Includes ±500 board normalization margin</p>
          </div>
        )}
      </div>
    </div>
  );
};
