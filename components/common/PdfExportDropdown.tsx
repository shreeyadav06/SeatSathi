import React, { useState } from 'react';
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg transition-colors"
      >
        {exporting ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        Export PDF
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden min-w-[140px]">
          <button onClick={() => handleExport(10)} className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors">
            Top 10 Colleges
          </button>
          {recommendations.length > 10 && (
            <button onClick={() => handleExport(50)} className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors">
              Top 50 Colleges
            </button>
          )}
          {recommendations.length > 50 && (
            <button onClick={() => handleExport(100)} className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors">
              Top 100 Colleges
            </button>
          )}
          <button onClick={() => handleExport('all')} className="w-full px-4 py-2 text-left text-sm text-yellow-400 hover:bg-slate-700 transition-colors border-t border-slate-700">
            All ({recommendations.length})
          </button>
        </div>
      )}
    </div>
  );
};
