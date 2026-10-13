import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const collegeDataPath = path.join(ROOT, 'public', 'collegeData.json');
const extractedPath = path.join(ROOT, 'scripts', 'extracted_cutoffs.json');

if (!fs.existsSync(collegeDataPath)) {
  console.error('collegeData.json not found!');
  process.exit(1);
}

if (!fs.existsSync(extractedPath)) {
  console.error('extracted_cutoffs.json not found!');
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(collegeDataPath, 'utf-8'));
const collegesMap = rawData.colleges || rawData;
const extractedCutoffs = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));

const entries2026 = extractedCutoffs.filter(e => e.year === '2026');
console.log(`Found ${entries2026.length} entries for year 2026 to merge.`);

let insertedCount = 0;

for (const entry of entries2026) {
  const { code, name, branch, category, cutoffRank, year, round } = entry;
  if (!code || !category || !cutoffRank) continue;

  if (!collegesMap[code]) {
    collegesMap[code] = {
      code,
      name: name || code,
      branches: {}
    };
  }

  if (!collegesMap[code].branches) {
    collegesMap[code].branches = {};
  }

  const branchKey = branch || 'Engineering';

  if (!collegesMap[code].branches[branchKey]) {
    collegesMap[code].branches[branchKey] = {};
  }

  if (!collegesMap[code].branches[branchKey][year]) {
    collegesMap[code].branches[branchKey][year] = {};
  }

  if (!collegesMap[code].branches[branchKey][year][round]) {
    collegesMap[code].branches[branchKey][year][round] = {};
  }

  collegesMap[code].branches[branchKey][year][round][category] = cutoffRank;
  insertedCount++;
}

console.log(`Merged ${insertedCount} cutoff points into collegesMap.`);

// Update metadata
if (rawData.colleges) {
  rawData.metadata = rawData.metadata || {};
  if (!rawData.metadata.years.includes('2026')) {
    rawData.metadata.years.push('2026');
  }
  rawData.metadata.description = 'KCET Cutoff Data for 2024, 2025, and 2026';
  rawData.metadata.lastUpdated = new Date().toISOString().split('T')[0];
  rawData.colleges = collegesMap;
  fs.writeFileSync(collegeDataPath, JSON.stringify(rawData, null, 2));
} else {
  fs.writeFileSync(collegeDataPath, JSON.stringify(collegesMap, null, 2));
}

console.log(`Successfully updated ${collegeDataPath} with 2026 cutoffs!`);
