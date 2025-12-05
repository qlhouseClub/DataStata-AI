import React, { useState } from 'react';
import { Dataset, getActiveSheet, Language, ChartConfig } from '../types';
import { FileText, BarChart2, Download, X, Plus, Trash2, ChevronDown } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { ChartRenderer } from './ChartRenderer';
import { downloadChartAsJpg } from '../utils/chartUtils';

interface DataGridProps {
  datasets: Dataset[];
  activeDatasetId: string;
  onSetActiveDataset: (id: string) => void;
  onSetActiveSheet: (datasetId: string, sheetName: string) => void;
  onClose: () => void;
  onGenerateChart: (cmd: string) => void;
  language: Language;
}

export const DataGrid: React.FC<DataGridProps> = ({ 
    datasets, 
    activeDatasetId, 
    onSetActiveDataset, 
    onSetActiveSheet,
    language
}) => {
  const t = getTranslation(language);
  const activeDataset = datasets.find(d => d.id === activeDatasetId);
  const activeSheetData = activeDataset ? getActiveSheet(activeDataset) : null;
  const data = activeSheetData?.data || [];
  const summaries = activeSheetData?.summaries || [];
  
  // Virtualization limit for rendering
  const displayData = data.slice(0, 100);

  // Cell Selection State
  const [selectedCell, setSelectedCell] = useState<{rowIndex: number, colName: string} | null>(null);

  // Chart Builder State
  const [showChartBuilder, setShowChartBuilder] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [xVar, setXVar] = useState('');
  
  // Multi-Y State
  const [yVars, setYVars] = useState<string[]>([]);

  const [colorVar, setColorVar] = useState(''); 
  const [sizeVar, setSizeVar] = useState('');
  
  // Local Inline Chart State
  const [inlineChart, setInlineChart] = useState<ChartConfig | null>(null);

  const handleAddYVar = (val: string) => {
    if (val && !yVars.includes(val)) {
        setYVars([...yVars, val]);
    }
  };

  const handleRemoveYVar = (val: string) => {
      setYVars(yVars.filter(v => v !== val));
  };

  const handleCreateChart = () => {
      if (!xVar || yVars.length === 0) return;
      
      const config: ChartConfig = {
          type: chartType as any,
          title: `${yVars.join(', ')} by ${xVar}`,
          xAxisKey: xVar,
          yAxisKey: yVars,
          groupBy: colorVar,
          sizeBy: sizeVar,
          description: `Generated from ${activeDataset?.name}`
      };
      
      setInlineChart(config);
      setShowChartBuilder(false);
  };

  const handleAddSeriesToInlineChart = (varName: string) => {
    if (!inlineChart) return;
    const currentY = Array.isArray(inlineChart.yAxisKey) 
        ? inlineChart.yAxisKey 
        : [inlineChart.yAxisKey];
    
    if (!currentY.includes(varName)) {
        setInlineChart({
            ...inlineChart,
            yAxisKey: [...currentY, varName],
            title: `${[...currentY, varName].join(', ')} by ${inlineChart.xAxisKey}`
        });
    }
  };

  const handleRemoveSeriesFromInlineChart = (varName: string) => {
    if (!inlineChart) return;
    const currentY = Array.isArray(inlineChart.yAxisKey) 
        ? inlineChart.yAxisKey 
        : [inlineChart.yAxisKey];
    
    const newY = currentY.filter(y => y !== varName);
    
    // If no Y axis left, maybe close chart? For now just empty.
    setInlineChart({
        ...inlineChart,
        yAxisKey: newY
    });
  };

  const INLINE_CHART_ID = "inline-chart-pane";

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* 1. File Tabs (Pinned Top) */}
      <div className="flex items-center bg-gray-100 border-b border-gray-200 overflow-x-auto no-scrollbar shrink-0 z-20">
        {datasets.map(d => (
            <button
                key={d.id}
                onClick={() => onSetActiveDataset(d.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap border-r border-gray-200 transition-colors ${d.id === activeDatasetId ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <FileText className="w-3.5 h-3.5" />
                {d.name}
            </button>
        ))}
      </div>

      {/* 2. Sheet & Toolbar (Pinned Top) */}
      {activeDataset && (
          <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-white shrink-0 z-20 shadow-sm relative">
              <div className="flex items-center gap-1 overflow-x-auto">
                 <span className="text-xs font-bold text-gray-400 uppercase mr-2 tracking-wider">Sheets:</span>
                 {Object.keys(activeDataset.sheets).map(sheetName => (
                     <button
                        key={sheetName}
                        onClick={() => onSetActiveSheet(activeDataset.id, sheetName)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${activeDataset.activeSheetName === sheetName ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
                     >
                        {sheetName}
                     </button>
                 ))}
              </div>
              <div className="flex items-center gap-4 relative">
                  <span className="text-xs text-gray-400">
                      Total: <span className="font-mono text-gray-600">{data.length}</span> rows
                  </span>
                  
                  {/* Chart Toggle Button */}
                  <button 
                    onClick={() => {
                        setShowChartBuilder(!showChartBuilder);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${showChartBuilder || inlineChart ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                      <BarChart2 className="w-4 h-4" />
                      {t.visualize}
                  </button>

                  {/* Chart Builder Popover */}
                  {showChartBuilder && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 shadow-2xl rounded-lg z-50 p-5 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                          <div className="flex items-center justify-between mb-4">
                             <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <BarChart2 className="w-4 h-4 text-indigo-600"/>
                                {t.createChart}
                             </h4>
                             <button onClick={() => setShowChartBuilder(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
                          </div>
                          
                          <div className="space-y-4">
                              {/* Chart Type */}
                              <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t.type}</label>
                                  <div className="relative">
                                    <select 
                                        className="w-full text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none"
                                        value={chartType}
                                        onChange={(e) => setChartType(e.target.value)}
                                    >
                                        <option value="line">Line Chart</option>
                                        <option value="bar">Bar Chart</option>
                                        <option value="area">Area Chart</option>
                                        <option value="scatter">Scatter Plot</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
                                  </div>
                              </div>
                              
                              {/* X Axis */}
                              <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t.xAxis}</label>
                                  <div className="relative">
                                    <select 
                                        className="w-full text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none"
                                        value={xVar}
                                        onChange={(e) => setXVar(e.target.value)}
                                    >
                                        <option value="">{t.select}</option>
                                        {summaries.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
                                  </div>
                              </div>

                              {/* Multi-Y Selection */}
                              <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t.yAxis} <span className="font-normal text-gray-400">(Multi-Select)</span></label>
                                  
                                  <div className="relative mb-2">
                                      <select 
                                            className="w-full text-sm bg-white border border-gray-300 text-gray-700 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                                            value=""
                                            onChange={(e) => {
                                                if(e.target.value) handleAddYVar(e.target.value);
                                            }}
                                        >
                                            <option value="">+ Add Variable...</option>
                                            {summaries.filter(s => s.type === 'number').map(s => (
                                                <option key={s.name} value={s.name} disabled={yVars.includes(s.name)}>{s.name}</option>
                                            ))}
                                      </select>
                                      <Plus className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
                                  </div>

                                  {/* Selected Y Vars Chips */}
                                  <div className="flex flex-wrap gap-2 min-h-[28px]">
                                      {yVars.length === 0 && <span className="text-xs text-gray-400 italic">No variables selected</span>}
                                      {yVars.map((v, i) => (
                                          <div key={i} className="flex items-center gap-1 pl-2 pr-1 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium shadow-sm animate-in fade-in zoom-in duration-200">
                                              {v}
                                              <button onClick={() => handleRemoveYVar(v)} className="p-0.5 hover:bg-indigo-200 rounded text-indigo-500 hover:text-indigo-800 transition-colors"><X className="w-3 h-3"/></button>
                                          </div>
                                      ))}
                                  </div>
                              </div>

                              {/* Colors/Size (Optional) */}
                              {chartType === 'scatter' && (
                                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                                      <div>
                                          <label className="block text-xs font-medium text-gray-500 mb-1">{t.colorBy}</label>
                                          <select className="w-full text-xs border rounded p-1.5 bg-gray-50" value={colorVar} onChange={e => setColorVar(e.target.value)}>
                                              <option value="">None</option>
                                              {summaries.filter(s => s.type === 'string').map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                          </select>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-medium text-gray-500 mb-1">{t.sizeBy}</label>
                                          <select className="w-full text-xs border rounded p-1.5 bg-gray-50" value={sizeVar} onChange={e => setSizeVar(e.target.value)}>
                                              <option value="">None</option>
                                              {summaries.filter(s => s.type === 'number').map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                          </select>
                                      </div>
                                  </div>
                              )}

                              <button 
                                onClick={handleCreateChart}
                                disabled={!xVar || yVars.length === 0}
                                className="w-full py-2.5 mt-2 bg-indigo-600 text-white text-sm rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                              >
                                  {t.generate}
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      <div className="flex-1 relative overflow-hidden flex">
        {/* Main Grid */}
        <div className="flex-1 overflow-auto bg-white">
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>
            ) : (
                <table className="min-w-full divide-y divide-gray-200 text-sm border-separate border-spacing-0">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50 w-12 text-center select-none">
                        #
                    </th>
                    {summaries.map((col) => (
                        <th key={col.name} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 border-l border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors whitespace-nowrap">
                        {col.name}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {displayData.map((row, idx) => {
                        const isRowSelected = selectedCell?.rowIndex === idx;
                        return (
                        <tr key={idx} className={`transition-colors ${isRowSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-400 font-mono text-xs text-center border-r border-gray-100 bg-gray-50 select-none sticky left-0 z-1">
                                {idx + 1}
                            </td>
                            {summaries.map((col) => {
                                const isCellSelected = isRowSelected && selectedCell?.colName === col.name;
                                return (
                                <td 
                                    key={col.name} 
                                    onClick={() => setSelectedCell({ rowIndex: idx, colName: col.name })}
                                    className={`px-4 py-2 whitespace-nowrap text-gray-700 border-r border-gray-100 cursor-cell ${isCellSelected ? 'bg-blue-200 ring-1 ring-blue-400 inset-0' : ''}`}
                                >
                                    {row[col.name] !== null && row[col.name] !== undefined ? String(row[col.name]) : <span className="text-gray-300">.</span>}
                                </td>
                                )
                            })}
                        </tr>
                        );
                    })}
                </tbody>
                </table>
            )}
        </div>

        {/* Inline Chart Pane - Floating Panel next to toolbar/content */}
        {inlineChart && (
            <div className="absolute top-2 right-4 w-[500px] h-[450px] bg-white rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-200 z-30 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 ring-1 ring-black/5">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/50 backdrop-blur shrink-0">
                    <span className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                        <BarChart2 className="w-3.5 h-3.5" />
                        Analysis Preview
                    </span>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => downloadChartAsJpg(INLINE_CHART_ID, inlineChart.title.replace(/\s+/g, '_'))}
                            title="Export JPG"
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                            <Download className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            onClick={() => setInlineChart(null)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 p-4 bg-white min-h-0" id={INLINE_CHART_ID}>
                    <ChartRenderer config={inlineChart} data={data} />
                </div>

                {/* Footer for dynamic Y-Axis modification */}
                <div className="p-3 border-t border-gray-100 bg-gray-50 shrink-0">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">Y-Axis:</span>
                            {(Array.isArray(inlineChart.yAxisKey) ? inlineChart.yAxisKey : [inlineChart.yAxisKey]).map(yVar => (
                                <span key={yVar} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 text-xs text-gray-700 shadow-sm animate-in fade-in">
                                    {yVar}
                                    <button 
                                        onClick={() => handleRemoveSeriesFromInlineChart(yVar)}
                                        className="text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            
                            <div className="relative group ml-1">
                                <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-xs hover:bg-blue-100 font-medium transition-colors">
                                    <Plus className="w-3 h-3"/> Add
                                </button>
                                <select 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    value=""
                                    onChange={(e) => {
                                        if (e.target.value) handleAddSeriesToInlineChart(e.target.value);
                                    }}
                                >
                                    <option value="">Select variable...</option>
                                    {summaries.filter(s => s.type === 'number').map(s => (
                                        <option key={s.name} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};