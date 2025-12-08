
import React from 'react';
import { X, Download, BarChart2 } from 'lucide-react';
import { ChartConfig, DataRow, Language, Theme } from '../types';
import { ChartRenderer } from './ChartRenderer';
import { downloadChartAsJpg } from '../utils/chartUtils';
import { getTranslation } from '../utils/translations';

interface ChartWindowProps {
  config: ChartConfig;
  data: DataRow[];
  onClose: () => void;
  language: Language;
  theme: Theme;
}

export const ChartWindow: React.FC<ChartWindowProps> = ({ config, data, onClose, language, theme }) => {
  const t = getTranslation(language);
  const chartId = "popup-chart-container";

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-[800px] h-[600px] flex flex-col animate-pop-in border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">{t.chartWindow}: {config.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => downloadChartAsJpg(chartId, config.title.replace(/\s+/g, '_'))}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t.exportJpg}
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-hidden bg-white dark:bg-gray-800" id={chartId}>
           <ChartRenderer config={config} data={data} theme={theme} />
           <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
             DataStata.AI Generated Chart
           </div>
        </div>
      </div>
    </div>
  );
};
