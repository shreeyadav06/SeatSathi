import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const KCET_DATA_DIR = path.join(ROOT, 'KCETcutoffdata');
const PUBLIC_DIR = path.join(ROOT, 'public');

async function buildCollegeData() {
  console.log('Building consolidated collegeData.json...');
  
  let allColleges = {};
  
  // Read all collegesX.ts files
  const files = fs.readdirSync(KCET_DATA_DIR).filter(f => f.startsWith('colleges') && f.endsWith('.ts'));
  
  console.log(`Found ${files.length} college files.`);
  
  for (const file of files) {
    const filePath = path.join(KCET_DATA_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract the JSON object part
    // The files look like: export const collegesX: Record<string, College> = { ... };
    const match = content.match(/export\s+const\s+colleges\d+[^=]*=\s*({[\s\S]*});/);
    if (match && match[1]) {
      try {
        // Evaluate the object string. Since it might have trailing commas or not be strict JSON,
        // using new Function is safer for parsing JS object literals than JSON.parse
        const obj = new Function('return ' + match[1])();
        Object.assign(allColleges, obj);
      } catch (e) {
        console.error(`Failed to parse ${file}:`, e.message);
      }
    }
  }
  
  const outputPath = path.join(PUBLIC_DIR, 'collegeData.json');
  fs.writeFileSync(outputPath, JSON.stringify(allColleges));
  console.log(`Successfully merged ${Object.keys(allColleges).length} colleges to ${outputPath} (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

buildCollegeData();
