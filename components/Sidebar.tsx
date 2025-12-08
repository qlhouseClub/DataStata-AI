
import React from 'react';
import { VariableSummary, Dataset, Language, Theme } from '../types';
import { FileSpreadsheet, Hash, Type as TypeIcon, Calendar, Upload, Database, Layers, Languages, Layout, Trash2, Moon, Sun } from 'lucide-react';
import { getTranslation } from '../utils/translations';

interface SidebarProps {
  datasets: Dataset[];
  activeDatasetId: string | null;
  onSetActiveDataset: (id: string) => void;
  onRemoveDataset: (id: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleConsole: () => void;
  isConsoleOpen: boolean;
  onVariableClick: (varName: string) => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  datasets,
  activeDatasetId,
  onSetActiveDataset,
  onRemoveDataset,
  onUpload, 
  onToggleConsole,
  isConsoleOpen,
  onVariableClick,
  language,
  onSetLanguage,
  theme,
  onSetTheme
}) => {
  const t = getTranslation(language);
  const activeDataset = datasets.find(d => d.id === activeDatasetId);
  const activeSheetName = activeDataset ? activeDataset.activeSheetName : '';
  const summaries = activeDataset ? activeDataset.sheets[activeSheetName].summaries : [];

  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full shrink-0 z-10 shadow-lg transition-colors duration-200">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6" />
            {t.title}
            </h1>
            <button 
                onClick={() => onSetTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Toggle Theme"
            >
                {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
        </div>
        
        <div className="mt-3 flex items-center gap-2">
             <Languages className="w-4 h-4 text-gray-400" />
             <select 
                value={language} 
                onChange={(e) => onSetLanguage(e.target.value as Language)}
                className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 outline-none text-gray-600 dark:text-gray-300 w-full"
             >
                 <option value="en">English</option>
                 <option value="zh-CN">简体中文</option>
                 <option value="zh-TW">繁體中文</option>
                 <option value="ja">日本語</option>
                 <option value="ko">한국어</option>
             </select>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        {/* Dataset List / Frames */}
        <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Database className="w-3 h-3"/> {t.frames}
            </h3>
            {datasets.length === 0 ? (
                <div className="text-sm text-gray-400 italic pl-2">No files</div>
            ) : (
                <div className="space-y-1">
                    {datasets.map(d => (
                        <div 
                            key={d.id}
                            className={`group flex items-center justify-between px-2 py-1.5 rounded text-sm cursor-pointer transition-colors ${d.id === activeDatasetId ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                            onClick={() => onSetActiveDataset(d.id)}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <Layers className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[120px]" title={d.name}>{d.name}</span>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveDataset(d.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="flex gap-2">
          <label className="flex-1 cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium py-1.5 px-3 rounded text-sm flex items-center justify-center gap-2 transition-colors">
            <Upload className="w-4 h-4" />
            {t.loadData}
            <input type="file" accept=".csv,.xls,.xlsx" onChange={onUpload} className="hidden" />
          </label>
        </div>
        
        {datasets.length > 0 && (
          <button 
            onClick={onToggleConsole}
            className={`w-full py-1.5 px-3 rounded text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${isConsoleOpen ? 'bg-gray-800 text-white border-gray-800 dark:bg-black dark:border-black' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
          >
            <Layout className="w-4 h-4" />
            {isConsoleOpen ? t.viewData : t.hideData}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">{t.variables} ({activeSheetName})</h3>
        {summaries.length === 0 ? (
          <p className="text-sm text-gray-400 px-2">...</p>
        ) : (
          <div className="space-y-1">
            {summaries.map((v) => (
              <div 
                key={v.name} 
                onClick={() => onVariableClick(v.name)}
                className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded group cursor-pointer transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="Click to insert variable name"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {v.type === 'number' && <Hash className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  {v.type === 'string' && <TypeIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                  {v.type === 'date' && <Calendar className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{v.name}</span>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100">
                  +
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400">
        DataStata.AI v2.2
      </div>
    </div>
  );
};
