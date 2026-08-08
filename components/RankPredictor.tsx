import React, { useState } from 'react';

// The reference data from 2025
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

export const RankPredictor: React.FC = () => {
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
    <div className="w-full max-w-xl mx-auto p-8 bg-[#0a0f1a] border border-[#1e3a5f] rounded-2xl shadow-xl font-sans text-slate-200">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight font-display">Rank Predictor</h2>
        <p className="text-slate-400 mt-2">Estimate your KCET rank based on board and CET performance.</p>
      </div>
      
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl mb-8 flex gap-3 items-start">
        <svg className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <strong className="text-amber-500 font-medium block mb-1">Approximate Statistical Model</strong>
          <p className="text-sm text-amber-500/80 leading-relaxed">
            This predictor uses historical 50:50 normalization and applies a candidate-pool drift factor. Board marks are normalized by KEA. Actual ranks will vary.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="pcm">
            PUC PCM Total (out of 300)
          </label>
          <input 
            id="pcm"
            type="number" 
            value={pcmTotal}
            onChange={(e) => setPcmTotal(e.target.value)}
            className="w-full px-4 py-3 bg-[#0d1829] border border-[#1e3a5f] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500 transition-colors"
            placeholder="e.g. 285"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="kcet">
            KCET Score (out of 180)
          </label>
          <input 
            id="kcet"
            type="number" 
            value={kcetTotal}
            onChange={(e) => setKcetTotal(e.target.value)}
            className="w-full px-4 py-3 bg-[#0d1829] border border-[#1e3a5f] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500 transition-colors"
            placeholder="e.g. 135"
          />
        </div>

        <button 
          onClick={calculateRank}
          className="w-full py-4 mt-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl transition-all active:scale-[0.98]"
        >
          Predict Approximate Rank
        </button>

        {predictedRank && (
          <div className="mt-8 p-8 bg-[#0d1829] border border-[#1e3a5f] rounded-xl text-center transition-all animate-in fade-in zoom-in-95 duration-300">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-3">Expected Range</p>
            <h3 className="text-4xl md:text-5xl font-bold text-yellow-500 tracking-tight">
              {predictedRank.min.toLocaleString()} <span className="text-slate-600 font-normal mx-2">–</span> {predictedRank.max.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-4">Includes ±500 board normalization margin</p>
          </div>
        )}
      </div>
    </div>
  );
};
