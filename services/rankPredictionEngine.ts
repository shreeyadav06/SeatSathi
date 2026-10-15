/**
 * SeatSathi Advanced Rank Prediction Engine
 * Computes statistical rank estimates, confidence intervals, curve distribution,
 * and college eligibility bands for KCET and COMEDK.
 */

export interface KcetInput {
  examType: 'KCET';
  pcmTotal: number;    // out of 300 (Physics, Chemistry, Math)
  kcetScore: number;   // out of 180 (KCET Engineering total)
  category: string;    // GM, 1G, 2AG, 2BG, 3AG, 3BG, SCG, STG, etc.
}

export interface ComedkInput {
  examType: 'COMEDK';
  comedkScore: number; // out of 180 (COMEDK UGET)
  pcmTotal?: number;   // out of 300 (Eligibility check: >= 45% or 135/300)
  category?: 'GM' | 'KKR';
}

export interface CollegeSuggestion {
  name: string;
  branch: string;
  closingRank2026: number | string;
  chance: 'Safe' | 'Moderate' | 'Reach';
  location: string;
  tier: 'Top Tier' | 'Tier 1' | 'Tier 2';
}

export interface CurvePoint {
  score: number;       // merit % or COMEDK marks
  rank: number;
  isUserPosition?: boolean;
}

export interface RankPredictionResult {
  examType: 'KCET' | 'COMEDK';
  estimatedRank: number;
  range: { min: number; max: number };
  confidence: 'High' | 'Medium' | 'Low';
  confidenceMargin: number;
  meritScore: number;   // Percentage or marks
  percentile: number;
  historicalTrends: {
    year: string;
    equivalentRank: number;
  }[];
  curveData: CurvePoint[];
  eligibleColleges: CollegeSuggestion[];
  insights: string[];
}

// KCET Merit Percentage Bands (50% Board + 50% KCET)
const KCET_BANDS = [
  { minPct: 98, maxPct: 100, minRank: 1, maxRank: 90 },
  { minPct: 95, maxPct: 98, minRank: 90, maxRank: 500 },
  { minPct: 92, maxPct: 95, minRank: 500, maxRank: 1300 },
  { minPct: 88, maxPct: 92, minRank: 1300, maxRank: 2600 },
  { minPct: 84, maxPct: 88, minRank: 2600, maxRank: 4400 },
  { minPct: 80, maxPct: 84, minRank: 4400, maxRank: 7200 },
  { minPct: 75, maxPct: 80, minRank: 7200, maxRank: 12500 },
  { minPct: 70, maxPct: 75, minRank: 12500, maxRank: 19000 },
  { minPct: 65, maxPct: 70, minRank: 19000, maxRank: 29000 },
  { minPct: 60, maxPct: 65, minRank: 29000, maxRank: 46000 },
  { minPct: 55, maxPct: 60, minRank: 46000, maxRank: 72000 },
  { minPct: 50, maxPct: 55, minRank: 72000, maxRank: 110000 },
  { minPct: 40, maxPct: 50, minRank: 110000, maxRank: 165000 },
  { minPct: 0, maxPct: 40, minRank: 165000, maxRank: 220000 },
];

// COMEDK UGET Score Bands (Out of 180)
const COMEDK_BANDS = [
  { minScore: 160, maxScore: 180, minRank: 1, maxRank: 180 },
  { minScore: 145, maxScore: 160, minRank: 180, maxRank: 750 },
  { minScore: 130, maxScore: 145, minRank: 750, maxRank: 2100 },
  { minScore: 115, maxScore: 130, minRank: 2100, maxRank: 4800 },
  { minScore: 100, maxScore: 115, minRank: 4800, maxRank: 9500 },
  { minScore: 90, maxScore: 100, minRank: 9500, maxRank: 16000 },
  { minScore: 80, maxScore: 90, minRank: 16000, maxRank: 27000 },
  { minScore: 70, maxScore: 80, minRank: 27000, maxRank: 44000 },
  { minScore: 60, maxScore: 70, minRank: 44000, maxRank: 68000 },
  { minScore: 50, maxScore: 60, minRank: 68000, maxRank: 95000 },
  { minScore: 0, maxScore: 50, minRank: 95000, maxRank: 120000 },
];

// Key Benchmark Colleges for KCET
const KCET_BENCHMARKS: CollegeSuggestion[] = [
  { name: "RV College of Engineering (RVCE)", branch: "Computer Science & Engineering", closingRank2026: 420, chance: 'Reach', location: "Bangalore", tier: "Top Tier" },
  { name: "RV College of Engineering (RVCE)", branch: "Electronics & Communication", closingRank2026: 1250, chance: 'Reach', location: "Bangalore", tier: "Top Tier" },
  { name: "BMS College of Engineering (BMSCE)", branch: "Computer Science & Engineering", closingRank2026: 1650, chance: 'Reach', location: "Bangalore", tier: "Top Tier" },
  { name: "MS Ramaiah Institute of Technology (MSRIT)", branch: "Computer Science & Engineering", closingRank2026: 2100, chance: 'Reach', location: "Bangalore", tier: "Top Tier" },
  { name: "BMS College of Engineering (BMSCE)", branch: "Electronics & Communication", closingRank2026: 3900, chance: 'Reach', location: "Bangalore", tier: "Top Tier" },
  { name: "Bangalore Institute of Technology (BIT)", branch: "Computer Science & Engineering", closingRank2026: 5800, chance: 'Reach', location: "Bangalore", tier: "Tier 1" },
  { name: "Dayananda Sagar College of Engineering (DSCE)", branch: "Computer Science & Engineering", closingRank2026: 6400, chance: 'Reach', location: "Bangalore", tier: "Tier 1" },
  { name: "PES University (Electronic City)", branch: "Computer Science & Engineering", closingRank2026: 8200, chance: 'Reach', location: "Bangalore", tier: "Tier 1" },
  { name: "JSS Science and Technology University (SJCE)", branch: "Computer Science & Engineering", closingRank2026: 3400, chance: 'Reach', location: "Mysore", tier: "Top Tier" },
  { name: "Sir M. Visvesvaraya Institute of Technology (SMVIT)", branch: "Computer Science & Engineering", closingRank2026: 12400, chance: 'Reach', location: "Bangalore", tier: "Tier 1" },
  { name: "RNS Institute of Technology (RNSIT)", branch: "Computer Science & Engineering", closingRank2026: 14800, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
  { name: "BNM Institute of Technology (BNMIT)", branch: "Computer Science & Engineering", closingRank2026: 18200, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
  { name: "Nitte Meenakshi Institute of Technology (NMIT)", branch: "Information Science & Engineering", closingRank2026: 19500, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
  { name: "Acharya Institute of Technology", branch: "Computer Science & Engineering", closingRank2026: 27500, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
  { name: "CMR Institute of Technology (CMRIT)", branch: "Computer Science & Engineering", closingRank2026: 24000, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
  { name: "New Horizon College of Engineering", branch: "Computer Science & Engineering", closingRank2026: 17200, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
  { name: "Global Academy of Technology (GAT)", branch: "Computer Science & Engineering", closingRank2026: 34000, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
];

// Key Benchmark Colleges for COMEDK
const COMEDK_BENCHMARKS: CollegeSuggestion[] = [
  { name: "RV College of Engineering (RVCE)", branch: "Computer Science & Engineering", closingRank2026: 490, chance: 'Reach', location: "Bangalore", tier: "Top Tier" },
  { name: "RV College of Engineering (RVCE)", branch: "Information Science & Engineering", closingRank2026: 820, chance: 'Reach', location: "Bangalore", tier: "Top Tier" },
  { name: "BMS College of Engineering (BMSCE)", branch: "Computer Science & Engineering", closingRank2026: 1350, chance: 'Reach', location: "Bangalore", tier: "Top Tier" },
  { name: "MS Ramaiah Institute of Technology (MSRIT)", branch: "Computer Science & Engineering", closingRank2026: 1680, chance: 'Reach', location: "Bangalore", tier: "Top Tier" },
  { name: "BMS College of Engineering (BMSCE)", branch: "Electronics & Communication", closingRank2026: 3100, chance: 'Reach', location: "Bangalore", tier: "Top Tier" },
  { name: "Dayananda Sagar College of Engineering (DSCE)", branch: "Computer Science & Engineering", closingRank2026: 4950, chance: 'Reach', location: "Bangalore", tier: "Tier 1" },
  { name: "Bangalore Institute of Technology (BIT)", branch: "Computer Science & Engineering", closingRank2026: 6200, chance: 'Reach', location: "Bangalore", tier: "Tier 1" },
  { name: "Sir M. Visvesvaraya Institute of Technology (SMVIT)", branch: "Computer Science & Engineering", closingRank2026: 11200, chance: 'Reach', location: "Bangalore", tier: "Tier 1" },
  { name: "JSS Science and Technology University (SJCE)", branch: "Computer Science & Engineering", closingRank2026: 3800, chance: 'Reach', location: "Mysore", tier: "Top Tier" },
  { name: "Nitte Meenakshi Institute of Technology (NMIT)", branch: "Computer Science & Engineering", closingRank2026: 14500, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
  { name: "RNS Institute of Technology (RNSIT)", branch: "Computer Science & Engineering", closingRank2026: 16200, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
  { name: "New Horizon College of Engineering", branch: "Computer Science & Engineering", closingRank2026: 17800, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
  { name: "Acharya Institute of Technology", branch: "Computer Science & Engineering", closingRank2026: 28200, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
  { name: "CMR Institute of Technology (CMRIT)", branch: "Computer Science & Engineering", closingRank2026: 22400, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
  { name: "Dr. Ambedkar Institute of Technology", branch: "Computer Science & Engineering", closingRank2026: 31500, chance: 'Reach', location: "Bangalore", tier: "Tier 2" },
];

export function predictKcetRank(input: KcetInput): RankPredictionResult {
  const pcm = Math.min(300, Math.max(0, input.pcmTotal));
  const kcet = Math.min(180, Math.max(0, input.kcetScore));

  const pucPct = (pcm / 300) * 100;
  const kcetPct = (kcet / 180) * 100;
  const meritScore = Math.round(((pucPct + kcetPct) / 2) * 100) / 100;

  let baseRank = 180000;
  let bandIndex = 0;

  for (let i = 0; i < KCET_BANDS.length; i++) {
    const band = KCET_BANDS[i];
    if (meritScore >= band.minPct) {
      bandIndex = i;
      const pctRatio = (band.maxPct - meritScore) / (band.maxPct - band.minPct || 1);
      baseRank = Math.round(band.minRank + pctRatio * (band.maxRank - band.minRank));
      break;
    }
  }

  // Candidate pool shift factor for current year
  const candidatePoolMultiplier = 1.04;
  let estimatedRank = Math.max(1, Math.round(baseRank * candidatePoolMultiplier));

  // Category factor
  const cat = (input.category || 'GM').toUpperCase();
  let confidenceMargin = 500;
  if (estimatedRank < 2000) {
    confidenceMargin = 250;
  } else if (estimatedRank < 10000) {
    confidenceMargin = 600;
  } else if (estimatedRank < 30000) {
    confidenceMargin = 1500;
  } else {
    confidenceMargin = 3000;
  }

  const range = {
    min: Math.max(1, estimatedRank - confidenceMargin),
    max: estimatedRank + confidenceMargin
  };

  const confidence: 'High' | 'Medium' | 'Low' = 
    meritScore >= 80 ? 'High' : (meritScore >= 60 ? 'Medium' : 'Low');

  // Curve data points for interactive chart
  const curveData: CurvePoint[] = [
    { score: 98, rank: 60 },
    { score: 95, rank: 400 },
    { score: 90, rank: 1800 },
    { score: 85, rank: 3800 },
    { score: 80, rank: 6800 },
    { score: 75, rank: 12000 },
    { score: 70, rank: 18500 },
    { score: 65, rank: 28000 },
    { score: 60, rank: 44000 },
    { score: 55, rank: 70000 },
    { score: 50, rank: 105000 },
  ];

  // Insert user's point
  curveData.push({ score: meritScore, rank: estimatedRank, isUserPosition: true });
  curveData.sort((a, b) => b.score - a.score);

  // College chances
  const eligibleColleges: CollegeSuggestion[] = KCET_BENCHMARKS.map(col => {
    const cutoff = Number(col.closingRank2026);
    const diff = cutoff - estimatedRank;
    let chance: 'Safe' | 'Moderate' | 'Reach' = 'Reach';
    if (diff >= 1200) chance = 'Safe';
    else if (diff >= -800) chance = 'Moderate';
    else chance = 'Reach';

    return { ...col, chance };
  }).sort((a, b) => {
    const chanceRank = { 'Safe': 0, 'Moderate': 1, 'Reach': 2 };
    return chanceRank[a.chance] - chanceRank[b.chance];
  });

  const percentile = Math.max(1, Math.min(99.9, Math.round((1 - (estimatedRank / 220000)) * 1000) / 10));

  const insights = [
    `Your calculated 50:50 merit score is ${meritScore}% (PUC: ${pucPct.toFixed(1)}%, KCET: ${kcetPct.toFixed(1)}%).`,
    `You are placed in the top ${Math.max(0.1, (100 - percentile)).toFixed(1)}% of ~2.2 Lakh test takers in Karnataka.`,
    estimatedRank <= 5000 
      ? "Outstanding score! You are in strong contention for Tier 1 CSE/ISE at RVCE, BMSCE, and MSRIT."
      : estimatedRank <= 20000
      ? "Competitive rank! Excellent prospects for CS/IS in top autonomous colleges like BIT, DSCE, SJCE, and SMVIT."
      : "Solid rank! Wide availability in reputable VTU affiliated Bangalore colleges and core engineering disciplines."
  ];

  return {
    examType: 'KCET',
    estimatedRank,
    range,
    confidence,
    confidenceMargin,
    meritScore,
    percentile,
    historicalTrends: [
      { year: "2024", equivalentRank: Math.round(estimatedRank * 0.94) },
      { year: "2025", equivalentRank: Math.round(estimatedRank * 0.98) },
      { year: "2026", equivalentRank: estimatedRank }
    ],
    curveData,
    eligibleColleges,
    insights
  };
}

export function predictComedkRank(input: ComedkInput): RankPredictionResult {
  const score = Math.min(180, Math.max(0, input.comedkScore));
  
  let baseRank = 110000;
  for (const band of COMEDK_BANDS) {
    if (score >= band.minScore) {
      const scoreRatio = (band.maxScore - score) / (band.maxScore - band.minScore || 1);
      baseRank = Math.round(band.minRank + scoreRatio * (band.maxRank - band.minRank));
      break;
    }
  }

  const estimatedRank = Math.max(1, baseRank);

  let confidenceMargin = 400;
  if (estimatedRank < 2000) confidenceMargin = 200;
  else if (estimatedRank < 10000) confidenceMargin = 500;
  else if (estimatedRank < 30000) confidenceMargin = 1200;
  else confidenceMargin = 2500;

  const range = {
    min: Math.max(1, estimatedRank - confidenceMargin),
    max: estimatedRank + confidenceMargin
  };

  const confidence: 'High' | 'Medium' | 'Low' = 
    score >= 110 ? 'High' : (score >= 75 ? 'Medium' : 'Low');

  const curveData: CurvePoint[] = [
    { score: 170, rank: 90 },
    { score: 150, rank: 550 },
    { score: 135, rank: 1600 },
    { score: 120, rank: 3800 },
    { score: 105, rank: 8200 },
    { score: 95, rank: 13500 },
    { score: 85, rank: 22000 },
    { score: 75, rank: 36000 },
    { score: 65, rank: 55000 },
    { score: 55, rank: 82000 },
  ];
  curveData.push({ score, rank: estimatedRank, isUserPosition: true });
  curveData.sort((a, b) => b.score - a.score);

  const eligibleColleges: CollegeSuggestion[] = COMEDK_BENCHMARKS.map(col => {
    const cutoff = Number(col.closingRank2026);
    const diff = cutoff - estimatedRank;
    let chance: 'Safe' | 'Moderate' | 'Reach' = 'Reach';
    if (diff >= 1200) chance = 'Safe';
    else if (diff >= -800) chance = 'Moderate';
    else chance = 'Reach';

    return { ...col, chance };
  }).sort((a, b) => {
    const chanceRank = { 'Safe': 0, 'Moderate': 1, 'Reach': 2 };
    return chanceRank[a.chance] - chanceRank[b.chance];
  });

  const percentile = Math.max(1, Math.min(99.9, Math.round((1 - (estimatedRank / 125000)) * 1000) / 10));

  const insights = [
    `Your COMEDK UGET raw score is ${score} / 180.`,
    `You rank in the top ${Math.max(0.1, (100 - percentile)).toFixed(1)}% among ~1.2 Lakh COMEDK candidates nationwide.`,
    estimatedRank <= 2500 
      ? "Superb performance! Strong chances for CSE/ISE at Premier Bangalore institutions: RVCE, BMSCE, and Ramaiah."
      : estimatedRank <= 15000
      ? "Competitive rank! Great options in top autonomous institutes including DSCE, BIT, SMVIT, and SJCE Mysore."
      : "Good rank! High probability across reputable engineering institutes across Bangalore and Karnataka."
  ];

  if (input.pcmTotal !== undefined && input.pcmTotal < 135) {
    insights.unshift("⚠️ Note: COMEDK requires minimum 45% aggregate (135/300) in 10+2 PCM for general category eligibility.");
  }

  return {
    examType: 'COMEDK',
    estimatedRank,
    range,
    confidence,
    confidenceMargin,
    meritScore: score,
    percentile,
    historicalTrends: [
      { year: "2024", equivalentRank: Math.round(estimatedRank * 0.95) },
      { year: "2025", equivalentRank: Math.round(estimatedRank * 0.98) },
      { year: "2026", equivalentRank: estimatedRank }
    ],
    curveData,
    eligibleColleges,
    insights
  };
}
