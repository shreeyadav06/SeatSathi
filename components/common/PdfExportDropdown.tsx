import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CollegeRecommendation } from '../../types';

const loadPdfExport = () => import('../../services/pdfExport');

interface PdfExportDropdownProps {
  recommendations: CollegeRecommendation[];
  studentInfo?: {
    rank?: number;
    category?: string;
    course?: string;
  };
}

export const PdfExportDropdown: React.FC<PdfExportDropdownProps> = ({ recommendations, studentInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (count: number | 'all') => {
    setExporting(true);
    try {
      const { exportToPDF } = await loadPdfExport();
      await exportToPDF(recommendations, {
        count: count === 'all' ? recommendations.length : count,
        title: 'SeatSathi College Recommendations',
        studentInfo
      });
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
      setIsOpen(false);
    }
  };

  if (recommendations.length === 0) return null;

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#2C2C2E]/60 hover:bg-[#3A3A3C]/80 disabled:bg-[#1C1C1E]/40 text-white rounded-full border border-[#3A3A3C]/50 backdrop-blur-md shadow-sm transition-colors"
      >
        {exporting ? (
          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M12 18v-6" />
            <path d="m9 15 3 3 3-3" />
          </svg>
        )}
        Export PDF
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="absolute right-0 mt-2 w-48 bg-[#1C1C1E]/80 backdrop-blur-xl rounded-xl shadow-2xl z-50 overflow-hidden border border-[#3A3A3C]/50"
          >
            <button
              onClick={() => handleExport(10)}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-[#3A3A3C]/60 transition-colors"
            >
              Top 10 Colleges
            </button>
            {recommendations.length > 10 && (
              <button
                onClick={() => handleExport(50)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-[#3A3A3C]/60 transition-colors border-t border-[#3A3A3C]/30"
              >
                Top 50 Colleges
              </button>
            )}
            {recommendations.length > 50 && (
              <button
                onClick={() => handleExport(100)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-[#3A3A3C]/60 transition-colors border-t border-[#3A3A3C]/30"
              >
                Top 100 Colleges
              </button>
            )}
            <button
              onClick={() => handleExport('all')}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-[#3A3A3C]/60 transition-colors border-t border-[#3A3A3C]/30"
            >
              All ({recommendations.length})
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
