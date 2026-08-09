import { findMatchingColleges } from './services/toolService';
import { initDatabase } from './services/toolService';

async function test() {
  await initDatabase();
  console.log("Database initialized");
  
  const rank = 10331;
  const category = '3BG';
  const course = 'Computer Science';
  const location = 'Bengaluru';
  
  console.log(`Searching for: Rank=${rank}, Category=${category}, Course=${course}, Location=${location}`);
  const results = await findMatchingColleges(rank, category, course, location);
  
  console.log(`Found ${results.length} colleges`);
  if (results.length > 0) {
    console.log(JSON.stringify(results.slice(0, 5), null, 2));
  }
}

test().catch(console.error);
