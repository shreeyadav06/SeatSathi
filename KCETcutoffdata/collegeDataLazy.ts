/**
 * Lazy-loaded College Data
 * This module loads college data on-demand to improve initial page load performance.
 * Instead of loading all 116 college files at startup (causing 75s LCP),
 * data is loaded asynchronously when needed.
 */

import { KCETData, College, Colleges } from './types';
import { metadata } from './metadata';

// Cache for loaded college data
let cachedColleges: Colleges | null = null;
let loadingPromise: Promise<Colleges> | null = null;

function mergeColleges(...parts: Record<string, College>[]): Colleges {
  const result: Colleges = {};
  for (const part of parts) {
    for (const [code, college] of Object.entries(part)) {
      if (result[code]) {
        result[code].branches = { ...result[code].branches, ...college.branches };
      } else {
        result[code] = { ...college };
      }
    }
  }
  return result;
}

/**
 * Lazily loads all college data using dynamic imports.
 * Returns cached data if already loaded.
 */
export async function loadCollegeData(): Promise<Colleges> {
  // Return cached data if available
  if (cachedColleges) {
    return cachedColleges;
  }
  
  // Return existing loading promise if already in progress
  if (loadingPromise) {
    return loadingPromise;
  }
  
  // Start loading all college files from static JSON on Vercel CDN
  loadingPromise = (async () => {
    try {
      console.log('Fetching college data from static JSON...');
      const response = await fetch('/collegeData.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch college data: ${response.statusText}`);
      }
      cachedColleges = await response.json();
      console.log(`Successfully loaded ${Object.keys(cachedColleges || {}).length} colleges.`);
      return cachedColleges!;
    } catch (err) {
      console.error('Error loading college data:', err);
      return {};
    }
  })();
  
  return loadingPromise;
}

/**
 * Lazily loads the full KCET_DATA object.
 */
export async function loadKCETData(): Promise<KCETData> {
  const colleges = await loadCollegeData();
  return {
    metadata: metadata as unknown as KCETData['metadata'],
    colleges,
  };
}

/**
 * Check if college data has been loaded.
 */
export function isCollegeDataLoaded(): boolean {
  return cachedColleges !== null;
}

/**
 * Get cached college data (returns null if not loaded yet).
 */
export function getCachedCollegeData(): Colleges | null {
  return cachedColleges;
}
