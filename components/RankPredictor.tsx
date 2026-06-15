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
        // Interpolate within the band
        const pctRange = band.maxPct - band.minPct;
        const rankRange = band.maxRank - band.minRank;
        
        // Example: If merit=95.5 in band 94-97. 
        // offset from top = maxPct - meritScore = 97 - 95.5 = 1.5
        // rank ratio = 1.5 / 3 = 0.5
        // exact rank = minRank + (0.5 * rankRange)
        const rankRatio = (band.maxPct - meritScore) / pctRange;
        const exactBaseRank = band.minRank + Math.floor(rankRatio * rankRange);
        
        // We use the exact base rank, but add a 10-20% drift penalty for candidate inflation (2026+)
        const driftMultiplier = 1.15; 
        const driftedRank = Math.floor(exactBaseRank * driftMultiplier);
        
        // Add ±500 error margin for board normalization
        baseMinRank = Math.max(1, driftedRank - 500);
        baseMaxRank = driftedRank + 500;
        break;
      }
    }
    
    setPredictedRank({ min: baseMinRank, max: baseMaxRank });
  };

  return (
    <div className="rank-predictor-container" style={{ padding: '20px', background: '#1e1e1e', borderRadius: '12px', color: 'white' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>KCET Rank Predictor</h2>
      
      <div style={{ background: '#ff3b3020', border: '1px solid #ff3b30', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
        <strong>⚠️ Approximate Statistical Model</strong>
        <p style={{ margin: '8px 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
          This predictor uses historical 50:50 normalization (KEA Formula) and applies a candidate-pool drift factor. 
          Board marks are normalized by KEA across different boards. <b>Actual ranks will vary.</b>
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>PUC PCM Total (out of 300)</label>
          <input 
            type="number" 
            value={pcmTotal}
            onChange={(e) => setPcmTotal(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#2c2c2c', border: '1px solid #444', color: 'white' }}
            placeholder="e.g. 285"
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>KCET Score (out of 180)</label>
          <input 
            type="number" 
            value={kcetTotal}
            onChange={(e) => setKcetTotal(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#2c2c2c', border: '1px solid #444', color: 'white' }}
            placeholder="e.g. 135"
          />
        </div>

        <button 
          onClick={calculateRank}
          style={{ padding: '12px', background: '#0a84ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Predict Approximate Rank
        </button>

        {predictedRank && (
          <div style={{ marginTop: '20px', padding: '20px', background: '#2c2c2c', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', color: '#888', margin: '0 0 8px' }}>Expected Rank Range</p>
            <h3 style={{ fontSize: '2.5rem', margin: 0, color: '#0a84ff' }}>
              {predictedRank.min.toLocaleString()} - {predictedRank.max.toLocaleString()}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>*Includes ±500 board normalization margin</p>
          </div>
        )}
      </div>
    </div>
  );
};
