/**
 * Lazy loader for COMEDK Cutoff Data
 * Fetches /comedkData.json and caches it in memory.
 */

import { Colleges } from './types';

export interface ComedkData {
  metadata: {
    name: string;
    description: string;
    examType: string;
    years: string[];
    rounds: string[];
    categories: string[];
    totalEntries: number;
    collegesCount: number;
    lastUpdated: string;
  };
  colleges: Colleges;
}

let cachedComedkColleges: Colleges | null = null;
let loadingComedkPromise: Promise<Colleges> | null = null;

export async function loadComedkColleges(): Promise<Colleges> {
  if (cachedComedkColleges) {
    return cachedComedkColleges;
  }

  if (loadingComedkPromise) {
    return loadingComedkPromise;
  }

  loadingComedkPromise = (async () => {
    try {
      console.log('Fetching COMEDK data from static JSON...');
      const response = await fetch('/comedkData.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch COMEDK data: ${response.statusText}`);
      }
      const json: ComedkData = await response.json();
      cachedComedkColleges = json.colleges || {};
      console.log(`Successfully loaded ${Object.keys(cachedComedkColleges).length} COMEDK colleges.`);
      return cachedComedkColleges;
    } catch (err) {
      console.error('Error loading COMEDK data:', err);
      return {};
    }
  })();

  return loadingComedkPromise;
}

export async function loadComedkData(): Promise<ComedkData> {
  const colleges = await loadComedkColleges();
  return {
    metadata: {
      name: 'SeatSathi',
      description: 'COMEDK Cutoff Data for 2024, 2025, and 2026',
      examType: 'COMEDK',
      years: ['2024', '2025', '2026'],
      rounds: ['R1', 'R2', 'R3', 'R4'],
      categories: ['GM', 'KKR'],
      totalEntries: 6149,
      collegesCount: Object.keys(colleges).length,
      lastUpdated: '2026-10-15'
    },
    colleges
  };
}

export function isComedkDataLoaded(): boolean {
  return cachedComedkColleges !== null;
}

export function getCachedComedkColleges(): Colleges | null {
  return cachedComedkColleges;
}
