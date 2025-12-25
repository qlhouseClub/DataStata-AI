import React, { useState, useMemo } from 'react';
import { X, Check, Filter, Calendar } from 'lucide-react';
import { VariableSummary, Language, Theme } from '../types';
import { getTranslation } from '../utils/translations';

interface DimensionSelectorProps {
  summaries: VariableSummary[];
  onConfirm: (selectedVars: string[]) => void;
  onClose: () => void;
  language: Language;
  theme: Theme;
}

export const DimensionSelector: React.FC<DimensionSelectorProps> = ({ 
  summaries, 
  onConfirm, 
  onClose, 
  language,
  theme 
}) => {
  const t = getTranslation(language);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Split variables: Date vars are auto-included and hidden/shown as info
  const { dateVars, optionVars } = useMemo(() => {
      const dates: VariableSummary[] = [];
      const opts: VariableSummary[] = [];
      
      summaries.forEach(s => {
          if (s.type === 'date') {
              dates.push(s);
          } else {
              opts.push(s);
          }
      });
      return { dateVars: dates, optionVars: opts };
  }, [summaries]);

  const toggle = (name: string) => {
      const newSet = new Set(selected);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      setSelected(newSet);
  };

  const handleSelectAll = () => {
      if (selected.size === optionVars.length) {
          setSelected(new Set());
      } else {
          setSelected(new Set(optionVars.map(s => s.name)));
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[80vh] animate-pop-in">
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                    <Filter className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">{t.customAnalysis}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <Calendar className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
                <p className="font-semibold mb-1">Time Dimensions Auto-Included:</p>
                {dateVars.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {dateVars.map(d => (
                            <span key={d.name} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-[10px] font-mono border border-blue-200 dark:border-blue-700">
                                {d.name}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="opacity-70 italic">No date variables found (Trend analysis may be limited).</span>
                )}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
            <div className="flex justify-between items-center px-2 py-2 mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.selectDimensions}</span>
                <button 
                    onClick={handleSelectAll}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {selected.size === optionVars.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>
            <div className="space-y-1">
                {optionVars.map(s => {
                    const isSelected = selected.has(s.name);
                    return (
                        <div 
                            key={s.name}
                            onClick={() => toggle(s.name)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${
                                isSelected 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' 
                                : 'bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {s.name}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {s.type} • {s.distinct} distinct
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
                {t.close}
            </button>
            <button 
                onClick={() => onConfirm(Array.from(selected))}
                disabled={selected.size === 0}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {t.generate} Report
            </button>
        </div>
      </div>
    </div>
  );
};