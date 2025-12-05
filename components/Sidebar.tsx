import React from 'react';
import { VariableSummary } from '../types';
import { FileSpreadsheet, Hash, Type as TypeIcon, Calendar, Upload } from 'lucide-react';

interface SidebarProps {
  summaries: VariableSummary[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string | null;
  onToggleDataView: () => void;
  isDataViewOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  summaries, 
  onUpload, 
  fileName,
  onToggleDataView,
  isDataViewOpen
}) => {
  return (
    <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-blue-700 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6" />
          DataStat AI
        </h1>
        <p className="text-xs text-gray-500 mt-1">Research Assistant</p>
      </div>

      <div className="p-4 border-b border-gray-200">
        <label className="block mb-2 text-sm font-medium text-gray-700">Dataset</label>
        {fileName ? (
           <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 truncate" title={fileName}>
             {fileName}
           </div>
        ) : (
          <div className="mb-3 text-sm text-gray-500 italic">No data loaded</div>
        )}
        
        <div className="flex gap-2">
          <label className="flex-1 cursor-pointer bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-1.5 px-3 rounded text-sm flex items-center justify-center gap-2 transition-colors">
            <Upload className="w-4 h-4" />
            Load CSV
            <input type="file" accept=".csv" onChange={onUpload} className="hidden" />
          </label>
        </div>
        
        {fileName && (
          <button 
            onClick={onToggleDataView}
            className={`mt-2 w-full py-1.5 px-3 rounded text-sm font-medium border transition-colors ${isDataViewOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {isDataViewOpen ? 'Hide Data Grid' : 'View Data Grid'}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Variables</h3>
        {summaries.length === 0 ? (
          <p className="text-sm text-gray-400 px-2">No variables found.</p>
        ) : (
          <div className="space-y-1">
            {summaries.map((v) => (
              <div key={v.name} className="flex items-center justify-between p-2 hover:bg-white rounded group cursor-default transition-colors">
                <div className="flex items-center gap-2 overflow-hidden">
                  {v.type === 'number' && <Hash className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  {v.type === 'string' && <TypeIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                  {v.type === 'date' && <Calendar className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                  <span className="text-sm font-medium text-gray-700 truncate" title={v.name}>{v.name}</span>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-gray-600">
                  {v.type === 'number' ? 'num' : 'str'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
        v1.0.0 • React + Gemini
      </div>
    </div>
  );
};