
import React from 'react';
import { X, Download, BarChart2 } from 'lucide-react';
import { ChartConfig, DataRow, Language } from '../types';
import { ChartRenderer } from './ChartRenderer';
import { downloadChartAsJpg } from '../utils/chartUtils';
import { getTranslation } from '../utils/translations';

interface ChartWindowProps {
  config: ChartConfig;
  data: DataRow[];
  onClose: () => void;
  language: Language;
}

export const ChartWindow: React.FC<ChartWindowProps> = ({ config, data, onClose, language }) => {
  const t = getTranslation(language);
  const chartId = "popup-chart-container";

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-[800px] h-[600px] flex flex-col animate-pop-in border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-800">{t.chartWindow}: {config.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => downloadChartAsJpg(chartId, config.title.replace(/\s+/g, '_'))}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t.exportJpg}
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden bg-white" id={chartId}>
           <ChartRenderer config={config} data={data} />
           <div className="mt-4 text-center text-sm text-gray-500 font-medium">
             DataStata.AI Generated Chart
           </div>
        </div>
      </div>
    </div>
  );
};
