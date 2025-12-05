
import React from 'react';
import { VariableSummary, Dataset, Language } from '../types';
import { FileSpreadsheet, Hash, Type as TypeIcon, Calendar, Upload, Database, Layers, Languages, Layout } from 'lucide-react';
import { getTranslation } from '../utils/translations';

interface SidebarProps {
  datasets: Dataset[];
  activeDatasetId: string | null;
  onSetActiveDataset: (id: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleConsole: () => void;
  isConsoleOpen: boolean;
  onVariableClick: (varName: string) => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  datasets,
  activeDatasetId,
  onSetActiveDataset,
  onUpload, 
  onToggleConsole,
  isConsoleOpen,
  onVariableClick,
  language,
  onSetLanguage
}) => {
  const t = getTranslation(language);
  const activeDataset = datasets.find(d => d.id === activeDatasetId);
  const activeSheetName = activeDataset ? activeDataset.activeSheetName : '';
  const summaries = activeDataset ? activeDataset.sheets[activeSheetName].summaries : [];

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col h-full shrink-0 z-10 shadow-lg">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-blue-700 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6" />
          {t.title}
        </h1>
        
        <div className="mt-3 flex items-center gap-2">
             <Languages className="w-4 h-4 text-gray-400" />
             <select 
                value={language} 
                onChange={(e) => onSetLanguage(e.target.value as Language)}
                className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-gray-600 w-full"
             >
                 <option value="en">English</option>
                 <option value="zh-CN">简体中文</option>
                 <option value="zh-TW">繁體中文</option>
                 <option value="ja">日本語</option>
                 <option value="ko">한국어</option>
             </select>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 space-y-3">
        {/* Dataset List / Frames */}
        <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Database className="w-3 h-3"/> {t.frames}
            </h3>
            {datasets.length === 0 ? (
                <div className="text-sm text-gray-400 italic pl-2">No files</div>
            ) : (
                <div className="space-y-1">
                    {datasets.map(d => (
                        <div 
                            key={d.id}
                            onClick={() => onSetActiveDataset(d.id)}
                            className={`px-2 py-1.5 rounded text-sm cursor-pointer flex items-center gap-2 truncate ${d.id === activeDatasetId ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-200 text-gray-600'}`}
                        >
                            <Layers className="w-3 h-3 shrink-0" />
                            <span className="truncate" title={d.name}>{d.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="flex gap-2">
          <label className="flex-1 cursor-pointer bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-1.5 px-3 rounded text-sm flex items-center justify-center gap-2 transition-colors">
            <Upload className="w-4 h-4" />
            {t.loadData}
            <input type="file" accept=".csv,.xls,.xlsx" onChange={onUpload} className="hidden" />
          </label>
        </div>
        
        {datasets.length > 0 && (
          <button 
            onClick={onToggleConsole}
            className={`w-full py-1.5 px-3 rounded text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${isConsoleOpen ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            <Layout className="w-4 h-4" />
            {isConsoleOpen ? t.viewData : t.hideData}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">{t.variables} ({activeSheetName})</h3>
        {summaries.length === 0 ? (
          <p className="text-sm text-gray-400 px-2">...</p>
        ) : (
          <div className="space-y-1">
            {summaries.map((v) => (
              <div 
                key={v.name} 
                onClick={() => onVariableClick(v.name)}
                className="flex items-center justify-between p-2 hover:bg-white hover:shadow-sm rounded group cursor-pointer transition-all border border-transparent hover:border-gray-200"
                title="Click to insert variable name"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {v.type === 'number' && <Hash className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  {v.type === 'string' && <TypeIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                  {v.type === 'date' && <Calendar className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                  <span className="text-sm font-medium text-gray-700 truncate">{v.name}</span>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100">
                  +
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
        DataStata.AI v2.1
      </div>
    </div>
  );
};
