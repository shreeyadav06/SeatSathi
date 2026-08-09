1. Since we shifted from DB populate in browser to cloudflare D1, the latency has increased a lot and the responses are taking well over 30sec to get the results 

2. Also confirm which is better, DB populate in browser or cloudflare D1?

**Answer & Analysis:** 
For this specific application (SeatSathi), **DB populate in the browser (IndexedDB) is significantly better than Cloudflare D1.**

**Why Browser DB (IndexedDB) is the Clear Winner Here:**
- **Static Data:** College cutoff data changes only once a year. There is no need for real-time syncing, which is the primary benefit of a cloud DB like D1.
- **Zero-Latency Queries:** With IndexedDB (Dexie), queries happen locally on the user's device. Search results appear in 10–50 milliseconds, ensuring the Gemini Live conversational experience remains smooth and instantaneous.
- **Bandwidth Efficiency:** Downloading a static JSON file once (which gets cached) is much faster than making multiple network requests to a Cloudflare worker every time the user asks a question.

**Why Cloudflare D1 is experiencing 30+ second latencies:**
- **The N+1 Query Problem:** If the AI is trying to evaluate multiple courses and locations (e.g., "CS or IS in Bengaluru or Mysore"), making separate D1 queries for each combination over HTTP stacks up network round-trip times massively.
- **Cold Starts:** If the Cloudflare Worker hasn't been used recently, it takes a few seconds to "wake up".
- **AI Tool Calling Timeouts:** Gemini Live expects very fast tool responses (ideally under 3-5 seconds). Slow responses from D1 cause the AI to stall, retry, or hallucinate, resulting in the perceived 30+ second delay.

**Recommendation:** 
Revert to the IndexedDB (`dbQuery.ts`) approach. The only downside is a one-time 2-3 second loading penalty on the first visit while it populates Dexie. After that, every search will be lightning-fast.

3. **Location Normalization Bug in College Search:**
   When searching for colleges with a location query like "bengaluru", the application fails to return results (returns 0 colleges). 
   - **Root Cause:** The `findMatchingCollegesFast` (in `dbQuery.ts`) and `findMatchingCollegesLegacy` (in `toolService.ts`) methods do not properly normalize the location search term. They convert "bengaluru" to lowercase, but the underlying college records use "bangalore" (or have "Bangalore" in their name). Therefore, the strict equality checks or `.includes()` substring matches fail.
   - **Solution:** Both functions should pass the user's location query through the existing `extractLocation(location)` helper from `database.ts` (which correctly maps "bengaluru" to "bangalore") before performing database filters or string matches.

4. **Node.js Environment Fetch limitations (Development/Testing):**
   If you ever run the college search logic outside the browser (e.g., in a Node script using `vite-node`), the legacy fallback fails with `TypeError: Invalid URL` because it uses a relative URL `fetch('/collegeData.json')`. This is perfectly fine in the browser but breaks server-side scripts since Node's `fetch` requires absolute URLs.
