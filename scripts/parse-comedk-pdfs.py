import os
import re
import json
import time
import pdfplumber

PDF_FILES = [
    # 2024
    {"file": "ComedK 2024 round1.pdf", "year": "2024", "round": "R1"},
    {"file": "ComedK 2024 round2 phase1.pdf", "year": "2024", "round": "R2"},
    {"file": "ComedK 2024 round3.pdf", "year": "2024", "round": "R3"},
    # 2025
    {"file": "ComedK 2025 round1.pdf", "year": "2025", "round": "R1"},
    {"file": "ComedK 2025 round2.pdf", "year": "2025", "round": "R2"},
    {"file": "ComedK 2025 round3.pdf", "year": "2025", "round": "R3"},
    # 2026
    {"file": "ComedK 2026 round1.pdf", "year": "2026", "round": "R1"},
    {"file": "ComedK 2026 round2.pdf", "year": "2026", "round": "R2"},
    {"file": "ComedK 2026 round3.pdf", "year": "2026", "round": "R3"},
    {"file": "ComedK 2026 round4.pdf", "year": "2026", "round": "R4"},
]

def clean_text(s):
    if not s:
        return ""
    return re.sub(r'\s+', ' ', s.replace('\n', ' ')).strip()

def clean_branch(b):
    if not b:
        return ""
    cleaned = clean_text(b)
    # Fix hyphen spacing like 'AE- Aeronautical' -> 'AE-Aeronautical'
    cleaned = re.sub(r'^([A-Z]{2,4})\s*-\s*', r'\1-', cleaned)
    # Fix hyphenation inside words like 'Telecommun- ication' -> 'Telecommunication'
    cleaned = re.sub(r'(\w+)-\s+(\w+)', r'\1\2', cleaned)
    return cleaned

def parse_all():
    start_time = time.time()
    colleges = {}
    total_records = 0
    file_stats = []

    for item in PDF_FILES:
        filepath = item["file"]
        year = item["year"]
        round_name = item["round"]
        
        if not os.path.exists(filepath):
            print(f"Warning: File {filepath} not found, skipping.")
            continue
            
        print(f"Parsing {filepath} ({year} {round_name})...")
        t_file = time.time()
        file_cutoffs = 0

        with pdfplumber.open(filepath) as pdf:
            for page_idx, page in enumerate(pdf.pages):
                tbls = page.extract_tables()
                if not tbls or len(tbls[0]) < 2:
                    continue
                
                tbl = tbls[0]
                raw_headers = tbl[0]
                branch_headers = [clean_branch(h) for h in raw_headers[3:]]
                
                last_code = None
                last_name = None
                
                for row in tbl[1:]:
                    if not row or len(row) < 3:
                        continue
                        
                    raw_code = clean_text(row[0]).upper()
                    raw_name = clean_text(row[1])
                    cat = clean_text(row[2]).upper()
                    
                    # Normalize category (HKR is equivalent to KKR)
                    if cat == 'HKR':
                        cat = 'KKR'
                        
                    if raw_code and raw_code.startswith('E'):
                        last_code = raw_code
                    elif not raw_code and last_code:
                        raw_code = last_code
                        
                    if raw_name:
                        last_name = raw_name
                    elif not raw_name and last_name:
                        raw_name = last_name
                        
                    if not raw_code or not raw_code.startswith('E') or cat not in ['GM', 'KKR']:
                        continue
                        
                    college_id = f"COMEDK_{raw_code}"
                    
                    if college_id not in colleges:
                        colleges[college_id] = {
                            "code": college_id,
                            "originalCode": raw_code,
                            "name": raw_name,
                            "branches": {}
                        }
                    elif raw_name and len(raw_name) > len(colleges[college_id]["name"]):
                        colleges[college_id]["name"] = raw_name
                        
                    for col_idx, rank_str in enumerate(row[3:]):
                        if col_idx >= len(branch_headers):
                            continue
                        branch = branch_headers[col_idx]
                        if not branch:
                            continue
                            
                        rank_str = (rank_str or '').replace('\n', '').replace(',', '').strip()
                        if rank_str.isdigit():
                            rank_val = int(rank_str)
                            
                            college_branches = colleges[college_id]["branches"]
                            if branch not in college_branches:
                                college_branches[branch] = {}
                            if year not in college_branches[branch]:
                                college_branches[branch][year] = {}
                            if round_name not in college_branches[branch][year]:
                                college_branches[branch][year][round_name] = {}
                                
                            college_branches[branch][year][round_name][cat] = rank_val
                            file_cutoffs += 1
                            total_records += 1

        print(f"  -> Extracted {file_cutoffs} cutoffs in {time.time()-t_file:.2f}s")
        file_stats.append({
            "file": filepath,
            "year": year,
            "round": round_name,
            "cutoffs": file_cutoffs
        })

    output_data = {
        "metadata": {
            "name": "SeatSathi",
            "description": "COMEDK Cutoff Data for 2024, 2025, and 2026",
            "examType": "COMEDK",
            "years": ["2024", "2025", "2026"],
            "rounds": ["R1", "R2", "R3", "R4"],
            "categories": ["GM", "KKR"],
            "totalEntries": total_records,
            "collegesCount": len(colleges),
            "lastUpdated": "2026-10-15",
            "filesProcessed": file_stats
        },
        "colleges": colleges
    }

    output_path = os.path.join("public", "comedkData.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"\nSUCCESS: Wrote {output_path} ({size_mb:.2f} MB)")
    print(f"Total Colleges: {len(colleges)}")
    print(f"Total Cutoff Entries: {total_records}")
    print(f"Total Elapsed Time: {time.time() - start_time:.2f}s")

if __name__ == "__main__":
    parse_all()
