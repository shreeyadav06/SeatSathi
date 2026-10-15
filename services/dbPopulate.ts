import { db, CollegeRecord, BranchRecord, CutoffRecord, extractLocation, getLocationKeywords, normalizeBranchName } from './database';
import { KcetData, CollegeMetadataRecord } from '../KCETcutoffdata/types';

async function loadKCETData() {
  const { loadKCETData: lazyLoad } = await import('../KCETcutoffdata/collegeDataLazy');
  return lazyLoad();
}

async function loadComedkData() {
  const { loadComedkData: lazyLoadComedk } = await import('../KCETcutoffdata/comedkDataLoader');
  return lazyLoadComedk();
}

async function fetchCollegeMetadata() {
  const { loadCollegeMetadata } = await import('../KCETcutoffdata/metadataLoader');
  return loadCollegeMetadata();
}

export async function populateDatabase(): Promise<{ success: boolean; stats: { colleges: number; branches: number; cutoffs: number; metadata: number }; timeMs: number }> {
  const startTime = performance.now();
  
  try {
    // Clear existing data
    await db.colleges.clear();
    await db.branches.clear();
    await db.cutoffs.clear();
    await db.collegeMetadata.clear();
    
    // Lazily load college data & metadata concurrently
    const [KCET_DATA, COMEDK_DATA, METADATA_JSON] = await Promise.all([
      loadKCETData(),
      loadComedkData().catch(e => {
        console.error("Failed to fetch COMEDK data", e);
        return { colleges: {} };
      }),
      fetchCollegeMetadata().catch(e => {
        console.error("Failed to fetch college metadata", e);
        return {};
      })
    ]);
    const data = KCET_DATA as KcetData;
    const comedkColleges = COMEDK_DATA.colleges || {};
    
    const collegeRecords: CollegeRecord[] = [];
    const branchRecords: BranchRecord[] = [];
    const cutoffRecords: CutoffRecord[] = [];
    const metadataRecords: CollegeMetadataRecord[] = [];
    
    // Process KCET colleges
    Object.entries(data.colleges).forEach(([code, college]) => {
      const location = extractLocation(college.name);
      const locationKeywords = getLocationKeywords(college.name);
      
      collegeRecords.push({
        code,
        name: college.name,
        location,
        locationKeywords,
        examType: 'KCET'
      });
      
      Object.entries(college?.branches || {}).forEach(([branchName, branchData]) => {
        const { normalized, category, isPure } = normalizeBranchName(branchName);
        
        branchRecords.push({
          collegeCode: code,
          collegeName: college.name,
          branchName,
          branchNormalized: normalized,
          branchCategory: category,
          isPure,
          location,
          examType: 'KCET'
        });
        
        Object.entries(branchData).forEach(([year, yearData]) => {
          Object.entries(yearData).forEach(([round, roundData]) => {
            if (!roundData) return;
            
            Object.entries(roundData).forEach(([cat, cutoffRank]) => {
              if (typeof cutoffRank !== 'number') return;
              
              cutoffRecords.push({
                collegeCode: code,
                collegeName: college.name,
                branchName,
                branchNormalized: normalized,
                branchCategory: category,
                isPure,
                location,
                year,
                round,
                category: cat,
                cutoffRank,
                examType: 'KCET'
              });
            });
          });
        });
      });
    });

    // Process COMEDK colleges
    Object.entries(comedkColleges).forEach(([code, college]: [string, any]) => {
      const location = extractLocation(college.name);
      const locationKeywords = getLocationKeywords(college.name);
      
      collegeRecords.push({
        code,
        name: college.name,
        location,
        locationKeywords,
        examType: 'COMEDK',
        originalCode: college.originalCode || code.replace('COMEDK_', '')
      });
      
      Object.entries(college?.branches || {}).forEach(([branchName, branchData]: [string, any]) => {
        const { normalized, category, isPure } = normalizeBranchName(branchName);
        
        branchRecords.push({
          collegeCode: code,
          collegeName: college.name,
          branchName,
          branchNormalized: normalized,
          branchCategory: category,
          isPure,
          location,
          examType: 'COMEDK'
        });
        
        Object.entries(branchData).forEach(([year, yearData]: [string, any]) => {
          Object.entries(yearData).forEach(([round, roundData]: [string, any]) => {
            if (!roundData) return;
            
            Object.entries(roundData).forEach(([cat, cutoffRank]: [string, any]) => {
              if (typeof cutoffRank !== 'number') return;
              
              cutoffRecords.push({
                collegeCode: code,
                collegeName: college.name,
                branchName,
                branchNormalized: normalized,
                branchCategory: category,
                isPure,
                location,
                year,
                round,
                category: cat,
                cutoffRank,
                examType: 'COMEDK'
              });
            });
          });
        });
      });
    });
    
    // Process metadata
    Object.entries(METADATA_JSON).forEach(([code, record]) => {
      metadataRecords.push(record);
    });
    
    // Bulk insert all records (much faster than individual inserts)
    await db.transaction('rw', [db.colleges, db.branches, db.cutoffs, db.collegeMetadata], async () => {
      await db.colleges.bulkAdd(collegeRecords);
      await db.branches.bulkAdd(branchRecords);
      await db.cutoffs.bulkAdd(cutoffRecords);
      if (metadataRecords.length > 0) {
        await db.collegeMetadata.bulkAdd(metadataRecords);
      }
    });
    
    const endTime = performance.now();
    
    return {
      success: true,
      stats: {
        colleges: collegeRecords.length,
        branches: branchRecords.length,
        cutoffs: cutoffRecords.length,
        metadata: metadataRecords.length
      },
      timeMs: Math.round(endTime - startTime)
    };
    
  } catch (error) {
    console.error('Database population error:', error);
    return {
      success: false,
      stats: { colleges: 0, branches: 0, cutoffs: 0, metadata: 0 },
      timeMs: 0
    };
  }
}

// Data version - increment this when KCET_DATA or COMEDK_DATA changes significantly
// This forces a database repopulation on the client side
const DATA_VERSION = 11; // Incremented: Added COMEDK 2024-2026 R1-R4 cutoffs and metadata
const VERSION_KEY = 'kcet_data_version';

/**
 * Check if database needs population and populate if needed
 */
export async function ensureDatabaseReady(): Promise<boolean> {
  try {
    const cutoffCount = await db.cutoffs.count();
    const metadataCount = await db.collegeMetadata.count();
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const needsUpdate = !storedVersion || parseInt(storedVersion) < DATA_VERSION || metadataCount === 0;
    
    if (cutoffCount === 0 || needsUpdate) {
      console.log(needsUpdate ? 'Data version changed or metadata missing, repopulating database...' : 'Database empty, populating...');
      const result = await populateDatabase();
      console.log(`Database populated in ${result.timeMs}ms:`, result.stats);
      if (result.success) {
        localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
      }
      return result.success;
    }
    
    console.log(`Database ready with ${cutoffCount} cutoff records and ${metadataCount} metadata records (version ${storedVersion})`);
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}
