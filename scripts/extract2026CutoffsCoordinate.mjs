import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const collegeDataPath = path.join(ROOT, 'public', 'collegeData.json');

const KCET_CATEGORIES = new Set([
  'GM', 'GMK', 'GMR',
  '1G', '1K', '1R',
  '2AG', '2AK', '2AR',
  '2BG', '2BK', '2BR',
  '3AG', '3AK', '3AR',
  '3BG', '3BK', '3BR',
  'SCG', 'SCK', 'SCR',
  'STG', 'STK', 'STR',
  'S1G', 'S2G', 'S3G', 'S4G',
  'S1K', 'S2K', 'S3K', 'S4K',
  'S1R', 'S2R', 'S3R', 'S4R',
  'EWG', 'EWK', 'EWR',
  'PHG', 'PHK', 'PHR'
]);

function cleanName(name) {
  return name.replace(/\s+/g, ' ').replace(/Course\s*Name.*/i, '').trim();
}

async function extractRoundPdf(pdfFileName, round, collegesMap) {
  const filePath = path.join(ROOT, pdfFileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`File ${pdfFileName} not found, skipping.`);
    return { pages: 0, cutoffs: 0 };
  }

  console.log(`\nProcessing ${pdfFileName} (Round ${round})...`);
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await getDocument({ data }).promise;
  console.log(`Loaded ${doc.numPages} pages.`);

  let totalCutoffs = 0;
  let totalBranches = 0;

  for (let pNum = 1; pNum <= doc.numPages; pNum++) {
    const page = await doc.getPage(pNum);
    const content = await page.getTextContent();

    // 1. Extract header row items (Y in [18, 26])
    const headerItems = content.items
      .filter(it => {
        const y = Math.round(it.transform[5]);
        return y >= 18 && y <= 26 && it.str.trim();
      })
      .map(it => ({ x: Math.round(it.transform[4]), str: it.str.trim() }))
      .sort((a, b) => a.x - b.x);

    const colleges = [];
    let curCollege = null;
    let curBranchWords = [];
    let lastX = 0;

    for (const item of headerItems) {
      if (item.str.startsWith('College:')) {
        const match = item.str.match(/College:\s*(E\d{3})\s*(.*)/i);
        if (match) {
          if (curCollege && curBranchWords.length) {
            const bName = curBranchWords.map(w => w.str).join(' ').replace(/\s+/g, ' ').trim();
            curCollege.branches.push({ name: bName, xMin: curBranchWords[0].x });
            curBranchWords = [];
          }
          const cCode = match[1].toUpperCase();
          const cName = cleanName(match[2]);
          curCollege = { code: cCode, name: cName, branches: [] };
          colleges.push(curCollege);

          if (!collegesMap[cCode]) {
            collegesMap[cCode] = {
              code: cCode,
              name: cName || cCode,
              branches: {}
            };
          }
          continue;
        }
      }

      if (item.str === 'Course Name') continue;
      if (!curCollege) continue;

      // When gap between words is >= 8, it represents the start of a new branch column
      if (curBranchWords.length > 0 && (item.x - lastX) >= 8) {
        const bName = curBranchWords.map(w => w.str).join(' ').replace(/\s+/g, ' ').trim();
        curCollege.branches.push({ name: bName, xMin: curBranchWords[0].x });
        curBranchWords = [];
      }
      curBranchWords.push(item);
      lastX = item.x;
    }

    if (curCollege && curBranchWords.length) {
      const bName = curBranchWords.map(w => w.str).join(' ').replace(/\s+/g, ' ').trim();
      curCollege.branches.push({ name: bName, xMin: curBranchWords[0].x });
    }

    // Flatten all branches on this page with college association
    const allBranchesOnPage = [];
    colleges.forEach(c => {
      c.branches.forEach(b => {
        allBranchesOnPage.push({
          code: c.code,
          branchName: b.name,
          xMin: b.xMin
        });
      });
    });

    totalBranches += allBranchesOnPage.length;

    // 2. Identify Category rows (Y > 40)
    const catBands = [];
    content.items.forEach(it => {
      const s = it.str.trim();
      if (KCET_CATEGORIES.has(s)) {
        const y = Math.round(it.transform[5]);
        if (y > 40) {
          let band = catBands.find(b => Math.abs(b.y - y) <= 3 && b.cat === s);
          if (!band) catBands.push({ cat: s, y });
        }
      }
    });

    // 3. Match cutoff ranks to nearest branch column
    catBands.forEach(band => {
      content.items.forEach(it => {
        const y = Math.round(it.transform[5]);
        const s = it.str.trim();
        if (Math.abs(y - band.y) <= 5 && /^\d+(\.\d+)?$/.test(s)) {
          const rank = Math.round(parseFloat(s));
          if (rank >= 100 && rank <= 250000) {
            const x = Math.round(it.transform[4]);

            // Find closest branch on this page
            let bestBranch = null;
            let bestDist = 999;
            for (const b of allBranchesOnPage) {
              const dist = Math.abs(x - b.xMin);
              if (dist < bestDist) {
                bestDist = dist;
                bestBranch = b;
              }
            }

            // Margin of error allowance <= 10 pixels
            if (bestBranch && bestDist <= 10) {
              const { code, branchName } = bestBranch;

              if (!collegesMap[code].branches[branchName]) {
                collegesMap[code].branches[branchName] = {};
              }
              if (!collegesMap[code].branches[branchName]['2026']) {
                collegesMap[code].branches[branchName]['2026'] = {};
              }
              if (!collegesMap[code].branches[branchName]['2026'][round]) {
                collegesMap[code].branches[branchName]['2026'][round] = {};
              }

              // Save primary category cutoff
              collegesMap[code].branches[branchName]['2026'][round][band.cat] = rank;
              totalCutoffs++;

              // Backward compatibility mapping for SC sub-categories (S1/S2/S3/S4) -> SCG/SCK/SCR
              if (band.cat.startsWith('S') && band.cat.endsWith('G') && band.cat.length === 3) {
                const prev = collegesMap[code].branches[branchName]['2026'][round]['SCG'];
                collegesMap[code].branches[branchName]['2026'][round]['SCG'] = prev ? Math.min(prev, rank) : rank;
              } else if (band.cat.startsWith('S') && band.cat.endsWith('K') && band.cat.length === 3) {
                const prev = collegesMap[code].branches[branchName]['2026'][round]['SCK'];
                collegesMap[code].branches[branchName]['2026'][round]['SCK'] = prev ? Math.min(prev, rank) : rank;
              } else if (band.cat.startsWith('S') && band.cat.endsWith('R') && band.cat.length === 3) {
                const prev = collegesMap[code].branches[branchName]['2026'][round]['SCR'];
                collegesMap[code].branches[branchName]['2026'][round]['SCR'] = prev ? Math.min(prev, rank) : rank;
              }
            }
          }
        }
      });
    });
  }

  console.log(`Finished ${pdfFileName}: extracted ${totalCutoffs} cutoffs across ${totalBranches} branch instances.`);
  return { pages: doc.numPages, cutoffs: totalCutoffs };
}

async function run() {
  console.log('--- Starting Coordinate-based 2026 KCET Cutoff Extraction ---');
  if (!fs.existsSync(collegeDataPath)) {
    console.error('collegeData.json does not exist at:', collegeDataPath);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(collegeDataPath, 'utf-8'));
  const collegesMap = rawData.colleges || rawData;

  // Clean out stale dummy "Engineering" 2026 cutoffs
  Object.values(collegesMap).forEach(college => {
    if (college.branches && college.branches['Engineering'] && college.branches['Engineering']['2026']) {
      delete college.branches['Engineering']['2026'];
      if (Object.keys(college.branches['Engineering']).length === 0) {
        delete college.branches['Engineering'];
      }
    }
  });

  const rounds = [
    { file: 'KCET 2026 r1 cutoff.pdf', round: 'R1' },
    { file: 'KCET 2026 r2 cutoff.pdf', round: 'R2' },
    { file: 'KCET 2026 r3 cutoff.pdf', round: 'R3' },
  ];

  let grandTotalCutoffs = 0;
  for (const { file, round } of rounds) {
    const stats = await extractRoundPdf(file, round, collegesMap);
    grandTotalCutoffs += stats.cutoffs;
  }

  console.log(`\n=== Total 2026 cutoffs extracted across all rounds: ${grandTotalCutoffs} ===`);

  // Count colleges and branches with 2026 data
  let collegesWith2026 = 0;
  let branchesWith2026 = 0;

  Object.values(collegesMap).forEach(college => {
    let hasCollege2026 = false;
    Object.values(college.branches || {}).forEach(branchData => {
      if (branchData['2026'] && Object.keys(branchData['2026']).length > 0) {
        branchesWith2026++;
        hasCollege2026 = true;
      }
    });
    if (hasCollege2026) collegesWith2026++;
  });

  console.log(`Colleges with 2026 cutoffs: ${collegesWith2026} / ${Object.keys(collegesMap).length}`);
  console.log(`Branches with 2026 cutoffs: ${branchesWith2026}`);

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

  console.log(`Successfully updated ${collegeDataPath} with high-fidelity 2026 cutoffs!`);
}

run().catch(err => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
