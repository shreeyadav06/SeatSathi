import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeMode } from '../types';
import { 
  predictKcetRank, 
  predictComedkRank, 
  RankPredictionResult
} from '../services/rankPredictionEngine';

interface RankPredictorPageProps {
  theme?: ThemeMode;
  onNavigateHome: () => void;
  onStartCounseling: (predictedRank?: number, category?: string) => void;
}

// Apple Design Spring Presets
const appleSpring = { type: 'spring' as const, bounce: 0, duration: 0.4 };
const appleSpringWithBounce = { type: 'spring' as const, bounce: 0.15, duration: 0.4 };

export const RankPredictorPage: React.FC<RankPredictorPageProps> = ({
  theme = 'dark',
  onNavigateHome,
  onStartCounseling
}) => {
  const pcmId = useId();
  const kcetId = useId();
  const comedkId = useId();
  const catId = useId();

  const [examType, setExamType] = useState<'KCET' | 'COMEDK'>('KCET');
  
  // KCET form inputs
  const [pcmMarks, setPcmMarks] = useState<string>('275');
  const [kcetMarks, setKcetMarks] = useState<string>('128');
  const [category, setCategory] = useState<string>('GM');

  // COMEDK form inputs
  const [comedkScore, setComedkScore] = useState<string>('118');
  const [boardPcm, setBoardPcm] = useState<string>('260');

  // Prediction state
  const [result, setResult] = useState<RankPredictionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'Safe' | 'Moderate' | 'Reach'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{ score: number; rank: number } | null>(null);

  const isDark = theme === 'dark';

  const handlePredict = () => {
    if (examType === 'KCET') {
      const pcm = parseFloat(pcmMarks);
      const kcet = parseFloat(kcetMarks);
      if (isNaN(pcm) || isNaN(kcet) || pcm < 0 || pcm > 300 || kcet < 0 || kcet > 180) {
        alert("Please enter valid marks: PUC PCM out of 300 and KCET out of 180.");
        return;
      }
      const pred = predictKcetRank({
        examType: 'KCET',
        pcmTotal: pcm,
        kcetScore: kcet,
        category
      });
      setResult(pred);
    } else {
      const score = parseFloat(comedkScore);
      const pcm = boardPcm ? parseFloat(boardPcm) : undefined;
      if (isNaN(score) || score < 0 || score > 180) {
        alert("Please enter a valid COMEDK UGET score out of 180.");
        return;
      }
      const pred = predictComedkRank({
        examType: 'COMEDK',
        comedkScore: score,
        pcmTotal: pcm
      });
      setResult(pred);
    }
  };

  const filteredColleges = result?.eligibleColleges.filter(col => {
    if (activeTab === 'all') return true;
    return col.chance === activeTab;
  }) || [];

  return (
    <div 
      className={`h-screen max-h-screen flex flex-col apple-scrollbar ${isDark ? 'bg-black text-[#F5F5F7]' : 'bg-[#F5F5F7] apple-scrollbar-light text-[#1D1D1F]'} selection:bg-[#0071E3]/25 font-sans`}
    >
      {/* Apple Frosted Glass Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-2xl transition-colors duration-200 border-b shrink-0 ${isDark ? 'bg-black/70 border-white/[0.08]' : 'bg-white/70 border-black/[0.06]'}`}>
        <div className="max-w-6xl mx-auto px-2.5 sm:px-8 h-13 sm:h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <motion.button 
              whileTap={{ scale: 0.96 }}
              transition={appleSpring}
              onClick={onNavigateHome}
              className={`p-1.5 rounded-full transition-colors flex items-center gap-1 text-xs font-medium tracking-tight ${isDark ? 'hover:bg-white/10 text-[#86868B] hover:text-white' : 'hover:bg-black/5 text-[#86868B] hover:text-black'}`}
              title="Return to home"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </motion.button>
            <div className={`h-3.5 w-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-semibold tracking-tight">SeatSathi</span>
              <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium tracking-tight whitespace-nowrap ${isDark ? 'bg-[#0071E3]/20 text-[#2997FF]' : 'bg-[#0071E3]/10 text-[#0071E3]'}`}>
                <span className="hidden min-[380px]:inline">Rank </span>Predictor
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={appleSpring}
              onClick={() => onStartCounseling(result?.estimatedRank, category)}
              className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white transition-all shadow-sm active:scale-95 flex items-center gap-1 whitespace-nowrap"
            >
              <span>AI Counseling</span>
              <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Scrollable Canvas */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-8 py-6 sm:py-16">
        
        {/* Apple Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-5xl font-bold tracking-[-0.03em] leading-tight mb-2 sm:mb-3">
            Rank Predictor
          </h1>
          <p className={`text-xs sm:text-lg font-normal tracking-tight leading-relaxed max-w-xl mx-auto ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
            Statistical admission model trained on 2024–2026 official round cutoffs, 50:50 board normalizations, and candidate pool drift.
          </p>

          {/* Apple Segmented Picker */}
          <div 
            className={`inline-flex p-1 mt-6 sm:mt-8 rounded-full border backdrop-blur-xl shadow-sm relative max-w-full overflow-hidden ${isDark ? 'bg-[#1C1C1E]/80 border-white/[0.08]' : 'bg-[#E5E5EA]/80 border-black/[0.06]'}`}
          >
            {(['KCET', 'COMEDK'] as const).map(tab => {
              const isSelected = examType === tab;
              return (
                <button
                  key={tab}
                  onClick={() => { setExamType(tab); setResult(null); }}
                  className={`relative px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs font-semibold tracking-tight transition-colors z-10 whitespace-nowrap ${isSelected ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-[#86868B] hover:text-white' : 'text-[#6E6E73] hover:text-black')}`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="apple-segmented-indicator"
                      transition={appleSpringWithBounce}
                      className={`absolute inset-0 rounded-full shadow-md ${isDark ? 'bg-[#2C2C2E]' : 'bg-white'}`}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1 sm:gap-1.5">
                    {tab === 'KCET' ? 'KCET 2026' : 'COMEDK 2026'}
                    <span className={`hidden min-[420px]:inline text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-500/20 text-[#2997FF]' : 'opacity-60'}`}>
                      {tab === 'KCET' ? 'Board + CET' : '180 Marks'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Card — Apple Translucent Material */}
        <div 
          className={`max-w-xl mx-auto p-4 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-xl backdrop-blur-2xl mb-8 sm:mb-12 transition-all ${isDark ? 'bg-[#1C1C1E]/70 border-white/[0.08]' : 'bg-white/80 border-black/[0.06]'}`}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight">Academic Credentials</h2>
              <p className={`text-xs ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
                {examType === 'KCET' ? 'Enter 10+2 PCM & KCET marks' : 'Enter COMEDK test score'}
              </p>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
              {examType}
            </span>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            {examType === 'KCET' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label htmlFor={pcmId} className={`block text-[11px] font-medium tracking-wide uppercase mb-1 ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
                      12th Board PCM (out of 300)
                    </label>
                    <input
                      id={pcmId}
                      type="number"
                      min={0}
                      max={300}
                      value={pcmMarks}
                      onChange={e => setPcmMarks(e.target.value)}
                      placeholder="e.g. 275"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all ${isDark ? 'bg-[#2C2C2E]/60 border-white/[0.08] text-white placeholder-[#86868B]' : 'bg-[#F2F2F7] border-black/[0.08] text-black placeholder-[#86868B]'}`}
                    />
                    <span className={`text-[10px] mt-1 block ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>Physics, Chemistry & Math aggregate</span>
                  </div>

                  <div>
                    <label htmlFor={kcetId} className={`block text-[11px] font-medium tracking-wide uppercase mb-1 ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
                      KCET Score (out of 180)
                    </label>
                    <input
                      id={kcetId}
                      type="number"
                      min={0}
                      max={180}
                      value={kcetMarks}
                      onChange={e => setKcetMarks(e.target.value)}
                      placeholder="e.g. 130"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all ${isDark ? 'bg-[#2C2C2E]/60 border-white/[0.08] text-white placeholder-[#86868B]' : 'bg-[#F2F2F7] border-black/[0.08] text-black placeholder-[#86868B]'}`}
                    />
                    <span className={`text-[10px] mt-1 block ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>PCM entrance test total</span>
                  </div>
                </div>

                <div>
                  <label htmlFor={catId} className={`block text-[11px] font-medium tracking-wide uppercase mb-1.5 ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
                    Category
                  </label>
                  <select
                    id={catId}
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all ${isDark ? 'bg-[#2C2C2E]/60 border-white/[0.08] text-white' : 'bg-[#F2F2F7] border-black/[0.08] text-black'}`}
                  >
                    <option value="GM">General Merit (GM)</option>
                    <option value="2AG">Category 2A General (2AG)</option>
                    <option value="2BG">Category 2B General (2BG)</option>
                    <option value="3AG">Category 3A General (3AG)</option>
                    <option value="3BG">Category 3B General (3BG)</option>
                    <option value="1G">Category 1 General (1G)</option>
                    <option value="SCG">Scheduled Caste (SCG)</option>
                    <option value="STG">Scheduled Tribe (STG)</option>
                    <option value="GMK">GM Kannada Medium (GMK)</option>
                    <option value="GMR">GM Rural (GMR)</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor={comedkId} className={`block text-[11px] font-medium tracking-wide uppercase mb-1 ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
                    COMEDK UGET Score (out of 180)
                  </label>
                  <input
                    id={comedkId}
                    type="number"
                    min={0}
                    max={180}
                    value={comedkScore}
                    onChange={e => setComedkScore(e.target.value)}
                    placeholder="e.g. 120"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all ${isDark ? 'bg-[#2C2C2E]/60 border-white/[0.08] text-white placeholder-[#86868B]' : 'bg-[#F2F2F7] border-black/[0.08] text-black placeholder-[#86868B]'}`}
                  />
                  <span className={`text-[10px] mt-1 block ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>Marks scored in COMEDK entrance</span>
                </div>

                <div>
                  <label htmlFor={pcmId} className={`block text-[11px] font-medium tracking-wide uppercase mb-1 ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
                    10+2 PCM Total (out of 300) <span className="text-[10px] lowercase font-normal opacity-70">(Optional eligibility check)</span>
                  </label>
                  <input
                    id={pcmId}
                    type="number"
                    min={0}
                    max={300}
                    value={boardPcm}
                    onChange={e => setBoardPcm(e.target.value)}
                    placeholder="e.g. 260"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all ${isDark ? 'bg-[#2C2C2E]/60 border-white/[0.08] text-white placeholder-[#86868B]' : 'bg-[#F2F2F7] border-black/[0.08] text-black placeholder-[#86868B]'}`}
                  />
                  <span className={`text-[10px] mt-1 block ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>Minimum 45% (135/300) required for general merit seat</span>
                </div>
              </>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              transition={appleSpring}
              onClick={handlePredict}
              className="w-full py-3.5 rounded-2xl font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] transition-all shadow-md active:scale-[0.98] text-sm flex items-center justify-center gap-2 mt-4"
            >
              <span>Calculate Prediction</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Prediction Results Display */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={appleSpring}
              className="space-y-6 sm:space-y-8"
            >
              {/* Primary Rank Banner */}
              <div 
                className={`p-4 sm:p-10 rounded-2xl sm:rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-3xl ${isDark ? 'bg-[#1C1C1E]/80 border-white/[0.08]' : 'bg-white/90 border-black/[0.06]'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[11px] uppercase font-bold tracking-widest text-[#0071E3]">
                        {result.examType} 2026 Expected Rank
                      </span>
                      <span className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${result.confidence === 'High' ? 'bg-[#30D158]/15 text-[#30D158]' : 'bg-[#FF9F0A]/15 text-[#FF9F0A]'}`}>
                        {result.confidence} Confidence (±{result.confidenceMargin})
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3 my-2">
                      <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] tabular-nums">
                        {result.range.min.toLocaleString()} <span className="font-light text-[#86868B]">–</span> {result.range.max.toLocaleString()}
                      </h2>
                    </div>

                    <p className={`text-xs sm:text-sm ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
                      Median Expected Rank: <strong className={isDark ? 'text-white' : 'text-black'}>~{result.estimatedRank.toLocaleString()}</strong> ({result.percentile}th percentile)
                    </p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 shrink-0">
                    <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${isDark ? 'bg-[#2C2C2E]/60 border-white/[0.06]' : 'bg-[#F2F2F7] border-black/[0.06]'}`}>
                      <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#86868B]">Merit Score</div>
                      <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#0071E3] mt-0.5 sm:mt-1 tabular-nums">{result.meritScore}{result.examType === 'KCET' ? '%' : ''}</div>
                      <div className="text-[9px] sm:text-[10px] text-[#86868B] mt-0.5">{result.examType === 'KCET' ? '50:50 Normalized' : 'Out of 180'}</div>
                    </div>

                    <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${isDark ? 'bg-[#2C2C2E]/60 border-white/[0.06]' : 'bg-[#F2F2F7] border-black/[0.06]'}`}>
                      <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#86868B]">Top Bracket</div>
                      <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#30D158] mt-0.5 sm:mt-1 tabular-nums">Top {Math.max(0.1, (100 - result.percentile)).toFixed(1)}%</div>
                      <div className="text-[9px] sm:text-[10px] text-[#86868B] mt-0.5">Competitive tier</div>
                    </div>
                  </div>
                </div>

                {/* Key Insights List */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-black/[0.06] dark:border-white/[0.06] grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5">
                  {result.insights.map((insight, idx) => (
                    <div key={idx} className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-xs leading-relaxed border ${isDark ? 'bg-[#2C2C2E]/40 border-white/[0.05] text-[#D1D1D6]' : 'bg-white/80 border-black/[0.04] text-[#424245]'}`}>
                      {insight}
                    </div>
                  ))}
                </div>
              </div>

              {/* Apple Visualizations Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                
                {/* SVG Curve Chart */}
                <div className={`p-4 sm:p-7 rounded-2xl sm:rounded-3xl border shadow-xl ${isDark ? 'bg-[#1C1C1E]/70 border-white/[0.08]' : 'bg-white/80 border-black/[0.06]'}`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div>
                      <h3 className="font-semibold text-sm tracking-tight">Score vs Rank Distribution</h3>
                      <p className={`text-[10px] sm:text-[11px] ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>Historical percentile trajectory</p>
                    </div>
                    {hoveredPoint && (
                      <span className="text-[11px] sm:text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-[#0071E3]">
                        {hoveredPoint.score}% → Rank {hoveredPoint.rank.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="relative w-full h-48 sm:h-56 pt-2">
                    <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="appleCurveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0071E3" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#0071E3" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Hairline Grid lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeDasharray="3 3" />
                      <line x1="40" y1="80" x2="480" y2="80" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeDasharray="3 3" />
                      <line x1="40" y1="140" x2="480" y2="140" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeDasharray="3 3" />
                      <line x1="40" y1="180" x2="480" y2="180" stroke={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"} />

                      {/* Area fill */}
                      <path
                        d="M 50 175 Q 160 160, 240 120 T 400 40 L 480 20 L 480 180 L 50 180 Z"
                        fill="url(#appleCurveGradient)"
                      />

                      {/* Smooth Trend Line */}
                      <path
                        d="M 50 175 Q 160 160, 240 120 T 400 40 L 480 20"
                        fill="none"
                        stroke="#0071E3"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Interactive Data Points */}
                      {[
                        { x: 50, y: 175, score: 50, rank: 105000 },
                        { x: 120, y: 160, score: 60, rank: 44000 },
                        { x: 200, y: 135, score: 70, rank: 18500 },
                        { x: 280, y: 100, score: 80, rank: 6800 },
                        { x: 370, y: 55, score: 90, rank: 1800 },
                        { x: 460, y: 22, score: 98, rank: 90 },
                      ].map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          fill="#0071E3"
                          className="hover:r-6 cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredPoint({ score: pt.score, rank: pt.rank })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}

                      {/* User Location Beacon */}
                      <g transform="translate(320, 85)">
                        <circle cx="0" cy="0" r="10" fill="#30D158" opacity="0.3" className="animate-ping" />
                        <circle cx="0" cy="0" r="5" fill="#30D158" stroke="#FFFFFF" strokeWidth="2" />
                        <text x="10" y="4" fill="#30D158" fontSize="11" fontWeight="bold">You (~{result.estimatedRank.toLocaleString()})</text>
                      </g>
                    </svg>
                  </div>
                  
                  <div className="flex justify-between text-[10px] text-[#86868B] mt-2 px-4 sm:px-6 font-mono">
                    <span>50%</span>
                    <span>70%</span>
                    <span>85%</span>
                    <span>98%</span>
                  </div>
                </div>

                {/* Year-over-Year Progression */}
                <div className={`p-4 sm:p-7 rounded-2xl sm:rounded-3xl border shadow-xl flex flex-col justify-between ${isDark ? 'bg-[#1C1C1E]/70 border-white/[0.08]' : 'bg-white/80 border-black/[0.06]'}`}>
                  <div>
                    <h3 className="font-semibold text-sm tracking-tight mb-1">Equivalent Rank Shift (2024–2026)</h3>
                    <p className={`text-[10px] sm:text-[11px] mb-4 sm:mb-6 ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>Historical rank progression at this exact performance tier</p>

                    <div className="space-y-3.5 sm:space-y-4">
                      {result.historicalTrends.map((trend, i) => (
                        <div key={i} className="space-y-1 sm:space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className={isDark ? 'text-white' : 'text-black'}>{trend.year} Counselling</span>
                            <span className="font-mono text-[#0071E3] font-semibold">Rank ~{trend.equivalentRank.toLocaleString()}</span>
                          </div>
                          <div className={`w-full h-2 sm:h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${i === 2 ? 'bg-[#0071E3]' : 'bg-[#86868B]/50'}`}
                              style={{ width: `${Math.min(100, Math.max(12, (trend.equivalentRank / 50000) * 100))}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`mt-5 sm:mt-6 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-xs leading-relaxed ${isDark ? 'bg-[#2C2C2E]/40 border-white/[0.05] text-[#86868B]' : 'bg-[#F2F2F7] border-black/[0.04] text-[#6E6E73]'}`}>
                    💡 <strong>Counselling Insight:</strong> College branches in emerging specializations (AIML, Data Science) saw expanded capacity in 2026, granting students slightly higher acceptance odds at identical merit scores.
                  </div>
                </div>
              </div>

              {/* What Can You Get? Admission Predictions */}
              <div className={`p-4 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-xl ${isDark ? 'bg-[#1C1C1E]/70 border-white/[0.08]' : 'bg-white/80 border-black/[0.06]'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 pb-3 sm:pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight">Available College Cutoffs</h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
                      Matched against official 2026 {result.examType} closing ranks
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className={`flex items-center gap-1 p-1 rounded-full border max-w-full overflow-x-auto apple-scrollbar ${isDark ? 'bg-[#2C2C2E]/60 border-white/[0.06]' : 'bg-[#F2F2F7] border-black/[0.06]'}`}>
                    {(['all', 'Safe', 'Moderate', 'Reach'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium tracking-tight whitespace-nowrap transition-all ${activeTab === tab ? 'bg-[#0071E3] text-white shadow-sm' : isDark ? 'text-[#86868B] hover:text-white' : 'text-[#6E6E73] hover:text-black'}`}
                      >
                        {tab === 'all' ? 'All (15+)' : tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* College Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                  {filteredColleges.map((col, idx) => {
                    const isSafe = col.chance === 'Safe';
                    const isMod = col.chance === 'Moderate';
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -2 }}
                        transition={appleSpring}
                        className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${isDark ? 'bg-[#2C2C2E]/50 border-white/[0.06] hover:border-white/20' : 'bg-[#F2F2F7]/80 border-black/[0.06] hover:border-black/20'}`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${isDark ? 'bg-white/10 text-[#D1D1D6]' : 'bg-black/5 text-[#424245]'}`}>
                              {col.tier}
                            </span>
                            <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full ${isSafe ? 'bg-[#30D158]/15 text-[#30D158]' : isMod ? 'bg-[#FF9F0A]/15 text-[#FF9F0A]' : 'bg-[#FF453A]/15 text-[#FF453A]'}`}>
                              ● {col.chance}
                            </span>
                          </div>

                          <h4 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2">{col.name}</h4>
                          <p className={`text-[11px] sm:text-xs mt-1 ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>{col.branch}</p>
                        </div>

                        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-xs">
                          <span className={`text-[10px] sm:text-[11px] ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>{col.location}</span>
                          <span className="font-mono text-[#0071E3] font-semibold text-xs">Cutoff: ~{col.closingRank2026.toLocaleString()}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* AI Counselor Action Bar */}
                <div className={`mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 ${isDark ? 'bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border-[#0071E3]/30' : 'bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border-blue-200'}`}>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold tracking-tight text-[#0071E3]">Need personalized option entry assistance?</h4>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
                      SeatSathi can create and prioritize an optimal college choice list based on your rank.
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    transition={appleSpring}
                    onClick={() => onStartCounseling(result.estimatedRank, category)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm text-white bg-[#0071E3] hover:bg-[#0077ED] shadow-sm whitespace-nowrap active:scale-95 transition-all text-center"
                  >
                    Start Admission Counseling →
                  </motion.button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};
