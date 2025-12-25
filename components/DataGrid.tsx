import React, { useState, useRef, useEffect } from 'react';
import { Dataset, getActiveSheet, Language, ChartConfig, SeriesConfig, Theme, ColorPalette } from '../types';
import { FileText, BarChart2, Download, X, Plus, ChevronDown, Filter, MoveDiagonal, Palette as PaletteIcon, Check, Layers, ListFilter } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { ChartRenderer } from './ChartRenderer';
import { downloadChartAsJpg } from '../utils/chartUtils';
import { PRESET_PALETTE, generatePalette } from '../utils/colorUtils';

interface DataGridProps {
  datasets: Dataset[];
  activeDatasetId: string;
  onSetActiveDataset: (id: string) => void;
  onSetActiveSheet: (datasetId: string, sheetName: string) => void;
  onClose: () => void;
  onGenerateChart: (cmd: string) => void;
  language: Language;
  theme: Theme;
}

const getChartLayout = (type: string, t: any) => {
    switch (type) {
        case 'pie':
        case 'donut':
            return { 
                mainLabel: t.segmentLabel || "Segment Label", 
                subLabel: t.segmentSize || "Segment Size", 
                isSingle: true,
                hasAxis: false 
            };
        case 'treemap':
            return { 
                mainLabel: t.groupBy || "Group By", 
                subLabel: t.sizeBy || "Size By", 
                isSingle: true, 
                hasAxis: false 
            };
        case 'radar':
            return { 
                mainLabel: t.domain || "Domain (Subject)", 
                subLabel: t.metric || "Metric", 
                isSingle: false, 
                hasAxis: true 
            };
        case 'scatter':
             return { 
                mainLabel: t.xAxis || "X Axis", 
                subLabel: t.yAxis || "Y Axis", 
                isSingle: false, 
                hasAxis: true 
            };
        default:
            return { 
                mainLabel: t.xAxis || "X Axis", 
                subLabel: t.yAxis || "Y Axis", 
                isSingle: false, 
                hasAxis: true 
            };
    }
}

export const DataGrid: React.FC<DataGridProps> = ({ 
    datasets, 
    activeDatasetId, 
    onSetActiveDataset, 
    onSetActiveSheet,
    language,
    theme
}) => {
  const t = getTranslation(language);
  const activeDataset = datasets.find(d => d.id === activeDatasetId);
  const activeSheetData = activeDataset ? getActiveSheet(activeDataset) : null;
  const data = activeSheetData?.data || [];
  const summaries = activeSheetData?.summaries || [];
  
  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(200);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll and visible count when dataset changes
  useEffect(() => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
    }
    setVisibleCount(200);
  }, [activeDatasetId, activeDataset?.activeSheetName]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        // Load more rows when scrolled near bottom (buffer of 500px)
        if (scrollTop + clientHeight >= scrollHeight - 500) {
            if (visibleCount < data.length) {
                setVisibleCount(prev => Math.min(prev + 200, data.length));
            }
        }
    }
  };
  
  const displayData = data.slice(0, visibleCount);
  const [selectedCell, setSelectedCell] = useState<{rowIndex: number, colName: string} | null>(null);

  // Chart Builder State
  const [showChartBuilder, setShowChartBuilder] = useState(false);
  const [chartType, setChartType] = useState('line');
  
  // X-Axis State
  const [xVar, setXVar] = useState('');
  const [xSubsetVal, setXSubsetVal] = useState('');
  const [isXFilterOpen, setIsXFilterOpen] = useState(false);

  // Multi-Y State
  const [tempSeries, setTempSeries] = useState<SeriesConfig[]>([]);

  // Inline Chart State
  const [inlineChart, setInlineChart] = useState<ChartConfig | null>(null);
  
  // Inline Chart Interactivity State
  const [inlineColorPickerIndex, setInlineColorPickerIndex] = useState<number | null>(null);
  const [showInlineAddY, setShowInlineAddY] = useState(false);

  // Pane Resize State
  const [paneSize, setPaneSize] = useState({ width: 500, height: 450 });
  const [isResizing, setIsResizing] = useState<'left' | 'bottom' | 'corner' | null>(null);
  const resizeRef = useRef<{ startX: number, startY: number, startW: number, startH: number } | null>(null);

  // Open Picker State: ID of the series currently being edited (index)
  const [openColorPickerIndex, setOpenColorPickerIndex] = useState<number | null>(null);
  
  const handleAddSeries = (varName: string) => {
      const color = PRESET_PALETTE[tempSeries.length % PRESET_PALETTE.length];
      const newSeries = { dataKey: varName, label: varName, color };
      
      const layout = getChartLayout(chartType, t);
      if (layout.isSingle) {
          setTempSeries([newSeries]);
      } else {
          setTempSeries([...tempSeries, newSeries]);
      }
  };

  const handleRemoveSeries = (index: number) => {
      const newS = [...tempSeries];
      newS.splice(index, 1);
      setTempSeries(newS);
  };

  const handleUpdateSeries = (index: number, updates: Partial<SeriesConfig>) => {
      const newS = [...tempSeries];
      newS[index] = { ...newS[index], ...updates };
      
      if (updates.dataKey && !updates.label) {
          // If changing variable, auto-update label unless specific filter logic exists
          newS[index].label = updates.dataKey;
      }

      if (updates.filter) {
          const s = newS[index];
          newS[index].label = `${s.dataKey} (${updates.filter.value})`;
      } else if (updates.filter === undefined && 'filter' in updates) {
          // Removing filter
          newS[index].label = newS[index].dataKey;
      }
      setTempSeries(newS);
  };
  
  // --- Inline Chart Handlers ---
  const handleInlineXChange = (newX: string) => {
      if (!inlineChart) return;
      setInlineChart({ ...inlineChart, xAxisKey: newX });
  };
  
  const handleInlineAddY = (varName: string) => {
      if (!inlineChart) return;
      const color = PRESET_PALETTE[inlineChart.series.length % PRESET_PALETTE.length];
      const layout = getChartLayout(inlineChart.type, t);
      
      if (layout.isSingle) {
          // Replace for single series charts
           setInlineChart({
                ...inlineChart,
                series: [{ dataKey: varName, label: varName, color }]
           });
      } else {
           setInlineChart({
                ...inlineChart,
                series: [...inlineChart.series, { dataKey: varName, label: varName, color }]
           });
      }
      setShowInlineAddY(false);
  };

  const handleInlineRemoveY = (index: number) => {
      if (!inlineChart) return;
      const newSeries = [...inlineChart.series];
      newSeries.splice(index, 1);
      setInlineChart({ ...inlineChart, series: newSeries });
  };

  const handleInlineUpdateSeries = (index: number, updates: Partial<SeriesConfig>) => {
      if (!inlineChart) return;
      const newSeries = [...inlineChart.series];
      newSeries[index] = { ...newSeries[index], ...updates };
      setInlineChart({ ...inlineChart, series: newSeries });
  };

  const handleCreateChart = () => {
      if (!xVar || tempSeries.length === 0) return;
      
      // Check X type for Scatter
      const xVarSummary = summaries.find(s => s.name === xVar);
      const xType = (chartType === 'scatter' && xVarSummary?.type === 'number') ? 'number' : 'category';

      const config: ChartConfig = {
          type: chartType as any,
          title: `${tempSeries.map(s => s.label).join(', ')} by ${xVar}`,
          xAxisKey: xVar,
          xType: xType,
          xFilter: (xVar && xSubsetVal) ? { column: xVar, value: xSubsetVal } : undefined,
          series: tempSeries,
          description: `Generated from ${activeDataset?.name}`
      };
      setInlineChart(config);
      setShowChartBuilder(false);
  };

  const getDistinctValues = (colName: string) => {
      if (!activeSheetData) return [];
      const distinct = new Set(
          activeSheetData.data
            .map(r => r[colName])
            .filter(v => v !== null && v !== undefined && v !== '')
            .map(v => String(v))
      );
      return Array.from(distinct).sort().slice(0, 100);
  };

  const categoricalCols = summaries.filter(s => s.type !== 'number'); 
  const usedInY = new Set(tempSeries.map(s => s.dataKey));
  const xOptions = summaries.filter(s => !usedInY.has(s.name));
  const yOptions = summaries.filter(s => s.type === 'number' && s.name !== xVar);
  const allNumeric = summaries.filter(s => s.type === 'number');
  const INLINE_CHART_ID = "inline-chart-pane";

  const layout = getChartLayout(chartType, t);

  // Resize Handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeRef.current) return;
      const { startX, startY, startW, startH } = resizeRef.current;
      if (isResizing === 'left' || isResizing === 'corner') {
          setPaneSize(prev => ({ ...prev, width: Math.max(300, startW + (startX - e.clientX)) }));
      }
      if (isResizing === 'bottom' || isResizing === 'corner') {
          setPaneSize(prev => ({ ...prev, height: Math.max(300, startH + (e.clientY - startY)) }));
      }
    };
    const handleMouseUp = () => { setIsResizing(null); resizeRef.current = null; };
    if (isResizing) { document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp); }
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isResizing]);
  const startResize = (type: any, e: any) => { e.preventDefault(); setIsResizing(type); resizeRef.current = { startX: e.clientX, startY: e.clientY, startW: paneSize.width, startH: paneSize.height }; };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 transition-colors duration-200 relative">
      <div className="flex items-center bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar shrink-0 z-20">
        {datasets.map(d => (
            <button
                key={d.id}
                onClick={() => onSetActiveDataset(d.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700 transition-colors ${d.id === activeDatasetId ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-t-2 border-t-blue-600 dark:border-t-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'}`}
            >
                <FileText className="w-3.5 h-3.5" />
                {d.name}
            </button>
        ))}
      </div>

      {activeDataset && (
          <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 z-20 shadow-sm relative">
              <div className="flex items-center gap-1 overflow-x-auto">
                 <span className="text-xs font-bold text-gray-400 uppercase mr-2 tracking-wider">Sheets:</span>
                 {Object.keys(activeDataset.sheets).map(sheetName => (
                     <button
                        key={sheetName}
                        onClick={() => onSetActiveSheet(activeDataset.id, sheetName)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${activeDataset.activeSheetName === sheetName ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-medium' : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                     >
                        {sheetName}
                     </button>
                 ))}
              </div>
              <div className="flex items-center gap-4 relative">
                  <span className="text-xs text-gray-400">Total: <span className="font-mono text-gray-600 dark:text-gray-300">{data.length}</span> rows</span>
                  <button 
                    onClick={() => {
                        setShowChartBuilder(!showChartBuilder);
                        if (!showChartBuilder && tempSeries.length === 0 && inlineChart) {
                            setTempSeries(inlineChart.series);
                            setXVar(inlineChart.xAxisKey);
                            setChartType(inlineChart.type);
                            if (inlineChart.xFilter) {
                                setXSubsetVal(String(inlineChart.xFilter.value));
                                setIsXFilterOpen(true);
                            }
                        }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${showChartBuilder || inlineChart ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                  >
                      <BarChart2 className="w-4 h-4" />
                      {t.visualize}
                  </button>

                  {showChartBuilder && (
                      <div className="absolute right-0 top-full mt-2 w-[450px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-lg z-50 p-5 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5 flex flex-col max-h-[85vh]">
                          <div className="flex items-center justify-between mb-4 shrink-0">
                             <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400"/>
                                {t.createChart}
                             </h4>
                             <button onClick={() => setShowChartBuilder(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-4 h-4"/></button>
                          </div>
                          
                          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
                              <div>
                                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{t.type}</label>
                                  <div className="relative">
                                    <select 
                                        className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md p-2 outline-none appearance-none" 
                                        value={chartType} 
                                        onChange={(e) => {
                                            setChartType(e.target.value);
                                            // Validate series count for single-type charts immediately
                                            const newLayout = getChartLayout(e.target.value, t);
                                            if (newLayout.isSingle && tempSeries.length > 1) {
                                                setTempSeries([tempSeries[0]]);
                                            }
                                        }}>
                                        <option value="line">{t.line}</option>
                                        <option value="bar">{t.bar}</option>
                                        <option value="area">{t.area}</option>
                                        <option value="scatter">{t.scatter}</option>
                                        <option value="pie">{t.pie}</option>
                                        <option value="donut">{t.donut}</option>
                                        <option value="radar">{t.radar}</option>
                                        <option value="treemap">{t.treemap}</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
                                  </div>
                              </div>
                              
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">{layout.mainLabel}</label>
                                  <div className="relative mb-3">
                                    <select className="w-full text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md p-2 outline-none appearance-none focus:border-blue-400 transition-colors" value={xVar} onChange={(e) => { setXVar(e.target.value); setXSubsetVal(''); }}>
                                        <option value="">{t.select}</option>
                                        {xOptions.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
                                  </div>

                                  {xVar && (
                                      <div className="animate-in fade-in">
                                          {isXFilterOpen ? (
                                             <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Filter (Subset)</label>
                                                    <button onClick={() => { setIsXFilterOpen(false); setXSubsetVal(''); }} className="text-[10px] text-red-400 hover:text-red-500">Clear</button>
                                                </div>
                                                <div className="relative">
                                                    <select className="w-full text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded p-1.5 outline-none appearance-none focus:border-blue-400 transition-colors" value={xSubsetVal} onChange={(e) => setXSubsetVal(e.target.value)}>
                                                        <option value="">All Data (Total)</option>
                                                        {getDistinctValues(xVar).map(val => (
                                                            <option key={val} value={val}>{val}</option>
                                                        ))}
                                                    </select>
                                                    <Filter className="absolute right-2 top-2 w-3 h-3 text-gray-400 pointer-events-none"/>
                                                </div>
                                             </div>
                                          ) : (
                                              <button 
                                                onClick={() => setIsXFilterOpen(true)}
                                                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-blue-500 transition-colors mt-1 font-medium"
                                              >
                                                <Filter className="w-3 h-3" />
                                                Add Filter...
                                              </button>
                                          )}
                                      </div>
                                  )}
                              </div>

                              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                  <label className="block text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-2 uppercase tracking-wide">{layout.subLabel}</label>
                                  
                                  {/* Single Series Mode */}
                                  {layout.isSingle ? (
                                      <div className="relative mb-3">
                                          <select 
                                            className="w-full text-sm bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-800 text-gray-700 dark:text-gray-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer" 
                                            value={tempSeries[0]?.dataKey || ""} 
                                            onChange={(e) => { 
                                                if(e.target.value) handleAddSeries(e.target.value); 
                                            }}
                                          >
                                                <option value="">{t.select}</option>
                                                {yOptions.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                          </select>
                                          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
                                      </div>
                                  ) : (
                                      // Multi Series Mode
                                      <div className="relative mb-3">
                                          <select className="w-full text-sm bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-800 text-gray-700 dark:text-gray-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer" value="" onChange={(e) => { if(e.target.value) handleAddSeries(e.target.value); }}>
                                                <option value="">+ Add Series...</option>
                                                {yOptions.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                          </select>
                                          <Plus className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"/>
                                      </div>
                                  )}

                                  {/* List of active series */}
                                  <div className="space-y-3 relative">
                                      {tempSeries.map((s, i) => (
                                          <div key={i} className="p-3 rounded bg-white dark:bg-gray-750 border border-indigo-100 dark:border-indigo-900/30 shadow-sm animate-in fade-in">
                                              <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                                      {/* Dropdown to Modify Series DataKey */}
                                                      <div className="relative flex-1">
                                                          <select
                                                              className="w-full text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-transparent border-none outline-none appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded px-1 transition-colors truncate"
                                                              value={s.dataKey}
                                                              onChange={(e) => handleUpdateSeries(i, { dataKey: e.target.value })}
                                                          >
                                                              {allNumeric.filter(opt => opt.name === s.dataKey || opt.name !== xVar).map(opt => (
                                                                  <option key={opt.name} value={opt.name}>{opt.name}</option>
                                                              ))}
                                                          </select>
                                                          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-indigo-300 pointer-events-none"/>
                                                      </div>
                                                      
                                                      {/* Color Picker Trigger */}
                                                      <div className="relative shrink-0">
                                                          <button 
                                                              onClick={() => setOpenColorPickerIndex(openColorPickerIndex === i ? null : i)}
                                                              className="w-5 h-5 rounded hover:scale-110 transition-transform shadow-sm ring-1 ring-gray-200 dark:ring-gray-600"
                                                              style={{ backgroundColor: s.color }}
                                                              title="Change Color"
                                                          />
                                                          
                                                          {/* Color Picker Popover */}
                                                          {openColorPickerIndex === i && (
                                                              <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg p-3 w-64 animate-in fade-in zoom-in-95">
                                                                  <div className="flex justify-between items-center mb-2">
                                                                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Preset Colors</span>
                                                                      <button onClick={() => setOpenColorPickerIndex(null)}><X className="w-3 h-3 text-gray-400"/></button>
                                                                  </div>
                                                                  <div className="grid grid-cols-6 gap-2 mb-4">
                                                                      {PRESET_PALETTE.map(color => (
                                                                          <button 
                                                                            key={color} 
                                                                            className={`w-6 h-6 rounded-md hover:scale-110 transition-transform ${s.color === color ? 'ring-2 ring-blue-500' : ''}`}
                                                                            style={{ backgroundColor: color }}
                                                                            onClick={() => {
                                                                                handleUpdateSeries(i, { color });
                                                                                setOpenColorPickerIndex(null);
                                                                            }}
                                                                          />
                                                                      ))}
                                                                  </div>
                                                              </div>
                                                          )}
                                                      </div>
                                                  </div>
                                                  
                                                  {/* Remove button only if multi-series enabled or to clear single selection */}
                                                  <button onClick={() => handleRemoveSeries(i)} className="text-gray-400 hover:text-red-500 ml-2"><X className="w-3.5 h-3.5"/></button>
                                              </div>
                                              
                                              {/* Series Filter - Hide for Pie/Donut to simplify unless advanced */}
                                              {!layout.isSingle && (
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-gray-400 mb-1 uppercase">Condition (Optional)</label>
                                                    <div className="flex gap-2">
                                                        <select 
                                                            className="w-1/2 text-xs border border-gray-200 dark:border-gray-600 rounded px-1.5 py-1 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 outline-none focus:border-indigo-300 transition-colors"
                                                            value={s.filter?.column || ''}
                                                            onChange={(e) => {
                                                                const col = e.target.value;
                                                                if (!col) {
                                                                    const { filter, ...rest } = s;
                                                                    handleUpdateSeries(i, rest as any);
                                                                } else {
                                                                    handleUpdateSeries(i, { filter: { column: col, value: '' } });
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Select Column...</option>
                                                            {categoricalCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                        </select>
                                                        
                                                        {s.filter?.column ? (
                                                            <select 
                                                                className="w-1/2 text-xs border border-gray-200 dark:border-gray-600 rounded px-1.5 py-1 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 outline-none focus:border-indigo-300 transition-colors"
                                                                value={s.filter.value}
                                                                onChange={(e) => handleUpdateSeries(i, { filter: { column: s.filter!.column, value: e.target.value } })}
                                                            >
                                                                <option value="">Value...</option>
                                                                {getDistinctValues(s.filter.column).map(val => (
                                                                    <option key={val} value={val}>{val}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <div className="w-1/2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-100 dark:border-gray-600 flex items-center justify-center text-[10px] text-gray-300 italic">
                                                                None
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                              )}
                                          </div>
                                      ))}
                                  </div>
                              </div>

                              <button 
                                onClick={handleCreateChart}
                                disabled={!xVar || tempSeries.length === 0}
                                className="w-full py-2.5 bg-indigo-600 text-white text-sm rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 shadow-md transition-all active:scale-[0.98]"
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
        <div 
          className="flex-1 overflow-auto bg-white dark:bg-gray-800"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
            {data.length === 0 ? <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div> : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm border-separate border-spacing-0">
                <thead className="bg-gray-50 dark:bg-gray-750 sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    <tr>
                        <th className="px-4 py-2 bg-gray-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 w-12 text-center border-b border-gray-200 dark:border-gray-700">#</th>
                        {summaries.map((col) => (
                            <th key={col.name} className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 border-l border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 whitespace-nowrap">
                                {col.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {displayData.map((row, idx) => {
                        const isRowSelected = selectedCell?.rowIndex === idx;
                        return (
                        <tr key={idx} className={isRowSelected ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-750'}>
                            <td className="px-4 py-2 text-gray-400 font-mono text-xs text-center border-r border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 sticky left-0">{idx + 1}</td>
                            {summaries.map((col) => {
                                const isCellSelected = isRowSelected && selectedCell?.colName === col.name;
                                return (
                                    <td 
                                        key={col.name} 
                                        onClick={() => setSelectedCell({ rowIndex: idx, colName: col.name })} 
                                        className={`px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700 cursor-cell ${isCellSelected ? 'bg-blue-200 dark:bg-blue-800 ring-1 ring-blue-400' : ''}`}
                                    >
                                        {row[col.name] ?? <span className="text-gray-300 dark:text-gray-600">.</span>}
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

        {inlineChart && (
            <div 
                className="absolute top-2 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-200 dark:border-gray-700 z-30 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 ring-1 ring-black/5"
                style={{ width: paneSize.width, height: paneSize.height }}
            >
                <div className="absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize hover:bg-blue-200/50 z-40" onMouseDown={(e) => startResize('left', e)}/>
                <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-200/50 z-40" onMouseDown={(e) => startResize('bottom', e)}/>
                <div className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize hover:bg-blue-400 z-50 flex items-center justify-center rounded-tr bg-gray-100/50 dark:bg-gray-700" onMouseDown={(e) => startResize('corner', e)}><MoveDiagonal className="w-3 h-3 text-gray-400" /></div>

                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750/50 backdrop-blur shrink-0 handle-drag">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 pl-2"><BarChart2 className="w-3.5 h-3.5" />Analysis Preview</span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => downloadChartAsJpg(INLINE_CHART_ID, inlineChart.title.replace(/\s+/g, '_'))} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setInlineChart(null)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><X className="w-3.5 h-3.5" /></button>
                    </div>
                </div>

                {/* Conditions Bar with Interactive Controls */}
                <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 min-h-[40px]">
                    <div className="flex items-center gap-1 text-gray-400 mr-1">
                        <ListFilter className="w-3 h-3" />
                    </div>

                    {/* Interactive X Axis Label */}
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 relative group">
                        <span className="text-gray-400">{getChartLayout(inlineChart.type, t).mainLabel}:</span> 
                        <select 
                            className="bg-transparent outline-none appearance-none cursor-pointer pr-3 font-semibold"
                            value={inlineChart.xAxisKey} 
                            onChange={(e) => handleInlineXChange(e.target.value)}
                        >
                            {summaries.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-gray-400 pointer-events-none"/>
                    </div>

                    {/* Filter (Read only for now) */}
                    {inlineChart.xFilter && (
                         <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-[10px] font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <Filter className="w-2.5 h-2.5" />
                            {inlineChart.xFilter.column} = {inlineChart.xFilter.value}
                        </div>
                    )}
                    
                    <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    
                    {/* Y Axis Series (Interactive) */}
                    {inlineChart.series.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-gray-700 text-[10px] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm relative group">
                            <button 
                                onClick={() => setInlineColorPickerIndex(inlineColorPickerIndex === idx ? null : idx)}
                                className="w-2 h-2 rounded-full ring-1 ring-black/5 dark:ring-white/10 hover:scale-125 transition-transform" 
                                style={{ backgroundColor: s.color || PRESET_PALETTE[idx % PRESET_PALETTE.length] }}
                            />
                            {s.label || s.dataKey}
                            <button 
                                onClick={() => handleInlineRemoveY(idx)}
                                className="ml-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-2.5 h-2.5" />
                            </button>

                            {/* Inline Color Picker */}
                            {inlineColorPickerIndex === idx && (
                                <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded p-2 w-32 animate-in fade-in zoom-in-95 grid grid-cols-4 gap-1">
                                    {PRESET_PALETTE.map(c => (
                                        <button 
                                            key={c}
                                            className="w-5 h-5 rounded hover:scale-110"
                                            style={{ backgroundColor: c }}
                                            onClick={() => {
                                                handleInlineUpdateSeries(idx, { color: c });
                                                setInlineColorPickerIndex(null);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Add Y Button - Only show if multi-series supported */}
                    {!getChartLayout(inlineChart.type, t).isSingle && (
                        <div className="relative">
                            <button 
                                onClick={() => setShowInlineAddY(!showInlineAddY)}
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                            >
                                <Plus className="w-3 h-3"/>
                            </button>
                            {showInlineAddY && (
                                <select 
                                    className="absolute top-full left-0 mt-1 w-32 text-[10px] border rounded bg-white dark:bg-gray-700 shadow-lg p-1 outline-none z-50"
                                    size={5}
                                    onChange={(e) => handleInlineAddY(e.target.value)}
                                >
                                    {allNumeric.filter(n => !inlineChart.series.find(s => s.dataKey === n.name) && n.name !== inlineChart.xAxisKey).map(n => (
                                        <option key={n.name} value={n.name} className="p-1 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer">{n.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 p-4 bg-white dark:bg-gray-800 min-h-0 relative" id={INLINE_CHART_ID}>
                    <ChartRenderer config={inlineChart} data={data} theme={theme} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};