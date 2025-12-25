import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Console } from './components/Console';
import { DataGrid } from './components/DataGrid';
import { ChartWindow } from './components/ChartWindow';
import { HelpModal } from './components/HelpModal';
import { ReportView } from './components/ReportView';
import { LoadingModal } from './components/LoadingModal';
import { DimensionSelector } from './components/DimensionSelector';
import { LogEntry, LogType, Dataset, SheetData, getActiveSheet, Language, ChartConfig, Theme, FullReport } from './types';
import { parseCSV, generateSummaries, parseExcel } from './utils/dataUtils';
import { analyzeData, generateFullReport, generateCustomReport } from './services/geminiService';
import { interpretStataCommand } from './services/stataInterpreter';
import { Loader2, Terminal, Send, List, Activity, Trash2, LayoutTemplate, CircleHelp, Sparkles, Filter } from 'lucide-react';
import { getTranslation } from './utils/translations';

const App: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false); 
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  
  const [popupChart, setPopupChart] = useState<ChartConfig | null>(null);
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const [isDimensionSelectorOpen, setIsDimensionSelectorOpen] = useState(false);

  const [commandInput, setCommandInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const t = getTranslation(language);
  const inputElementRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (!process.env.API_KEY) {
        setApiKeyError(true);
    } else {
        addLog(LogType.SYSTEM, t.ready);
    }
  }, []);

  const addLog = (type: LogType, content: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random().toString(),
      timestamp: Date.now(),
      type,
      content,
    };
    setLogs((prev) => [...prev, newLog]);
    if (type === LogType.ERROR && content !== "API Key missing.") {
        setIsConsoleOpen(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addLog(LogType.SYSTEM, `Loading ${file.name}...`);
    setIsProcessing(true);

    const isExcel = file.name.endsWith('.xls') || file.name.endsWith('.xlsx');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const sheetsData: { [name: string]: SheetData } = {};
        let firstSheetName = '';

        if (isExcel) {
             const buffer = event.target?.result as ArrayBuffer;
             const parsedSheets = parseExcel(buffer);
             const sheetNames = Object.keys(parsedSheets);
             
             if (sheetNames.length === 0) throw new Error("No sheets found");
             
             sheetNames.forEach(name => {
                 const d = parsedSheets[name];
                 const cols = Object.keys(d[0] || {});
                 sheetsData[name] = {
                     data: d,
                     columns: cols,
                     summaries: generateSummaries(d, cols)
                 };
             });
             firstSheetName = sheetNames[0];

        } else {
             const text = event.target?.result as string;
             const data = parseCSV(text);
             if (data.length === 0) throw new Error("Empty dataset");
             const columns = Object.keys(data[0]);
             sheetsData['Sheet1'] = {
                 data,
                 columns,
                 summaries: generateSummaries(data, columns)
             };
             firstSheetName = 'Sheet1';
        }

        const newDataset: Dataset = {
            id: Date.now().toString(),
            name: file.name,
            sheets: sheetsData,
            activeSheetName: firstSheetName
        };

        setDatasets(prev => [...prev, newDataset]);
        setActiveDatasetId(newDataset.id);

        addLog(LogType.SYSTEM, `Loaded ${file.name}.`);
        setIsConsoleOpen(false); 
      } catch (err) {
        addLog(LogType.ERROR, `Failed to parse file: ${err}`);
      } finally {
        setIsProcessing(false);
      }
    };

    if (isExcel) {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file);
    }
  };

  const handleRemoveDataset = (id: string) => {
      const newDatasets = datasets.filter(d => d.id !== id);
      setDatasets(newDatasets);
      if (activeDatasetId === id) {
          setActiveDatasetId(newDatasets.length > 0 ? newDatasets[0].id : null);
      }
      addLog(LogType.SYSTEM, "Dataset removed.");
  };

  const handleFullAnalysis = async () => {
    const activeDataset = datasets.find(d => d.id === activeDatasetId);
    if (!activeDataset) {
        addLog(LogType.ERROR, "No dataset loaded for analysis.");
        return;
    }

    setIsGeneratingReport(true);
    addLog(LogType.SYSTEM, "Starting Full Analysis...");

    try {
        const report = await generateFullReport(activeDataset, language);
        setFullReport(report);
        addLog(LogType.RESPONSE_RICH, `**Report Generated**: ${report.title}`);
    } catch (e) {
        addLog(LogType.ERROR, "Analysis Failed. Please try again.");
    } finally {
        setIsGeneratingReport(false);
    }
  };

  const handleCustomAnalysis = async (selectedVars: string[]) => {
      setIsDimensionSelectorOpen(false);
      const activeDataset = datasets.find(d => d.id === activeDatasetId);
      if (!activeDataset) return;

      // Automatically include any Date/Time variables to support trend analysis
      const activeSheet = getActiveSheet(activeDataset);
      const dateVars = activeSheet.summaries.filter(s => s.type === 'date').map(s => s.name);
      
      // Combine and deduplicate
      const finalVars = Array.from(new Set([...selectedVars, ...dateVars]));

      if (finalVars.length === 0) {
          addLog(LogType.ERROR, "No variables selected for analysis.");
          return;
      }

      setIsGeneratingReport(true);
      addLog(LogType.SYSTEM, `Starting Custom Analysis on: ${finalVars.join(', ')}...`);

      try {
          const report = await generateCustomReport(activeDataset, language, finalVars);
          setFullReport(report);
          addLog(LogType.RESPONSE_RICH, `**Custom Report Generated**: ${report.title}`);
      } catch (e) {
          addLog(LogType.ERROR, "Custom Analysis Failed.");
      } finally {
          setIsGeneratingReport(false);
      }
  };

  const handleCommand = async (e?: React.FormEvent, overrideCmd?: string) => {
    if (e) e.preventDefault();
    const cmd = overrideCmd || commandInput.trim();
    if (!cmd || isProcessing) return;

    if (!overrideCmd) setCommandInput('');
    
    if (apiKeyError) {
        addLog(LogType.COMMAND, cmd);
        addLog(LogType.ERROR, "API Key missing.");
        return;
    }

    addLog(LogType.COMMAND, cmd);

    if (cmd.toLowerCase() === 'clear all') {
         setDatasets([]);
         setActiveDatasetId(null);
         return;
    }
    
    if (datasets.length === 0) {
        addLog(LogType.ERROR, "No data loaded.");
        return;
    }

    const activeDataset = datasets.find(d => d.id === activeDatasetId);
    if (!activeDataset) return;

    const stataResult = interpretStataCommand(cmd, activeDataset, datasets);
    if (stataResult.handled) {
        if (stataResult.logs) stataResult.logs.forEach(log => addLog(log.type, log.content));
        if (stataResult.action === 'SWITCH_FRAME' && stataResult.targetFrameId) {
            setActiveDatasetId(stataResult.targetFrameId);
        }
        if (stataResult.newData && stataResult.newSummaries) {
            setDatasets(prev => prev.map(d => {
                if (d.id === activeDatasetId) {
                    return {
                        ...d,
                        sheets: {
                            ...d.sheets,
                            [d.activeSheetName]: {
                                data: stataResult.newData!,
                                columns: stataResult.newSummaries!.map(s => s.name),
                                summaries: stataResult.newSummaries!
                            }
                        }
                    };
                }
                return d;
            }));
        }
        return;
    }

    setIsProcessing(true);
    try {
        const sheetData = getActiveSheet(activeDataset);
        const sampleRows = sheetData.data.slice(0, 3);
        const analysis = await analyzeData(cmd, sheetData.summaries, sampleRows, language);

        if (analysis.intent === 'CHART' && analysis.chartConfig) {
            const rawConfig = analysis.chartConfig as any;
            if (!rawConfig.series && rawConfig.yAxisKey) {
                 let keys: string[] = [];
                 if (Array.isArray(rawConfig.yAxisKey)) {
                     keys = rawConfig.yAxisKey;
                 } else if (typeof rawConfig.yAxisKey === 'string') {
                     keys = rawConfig.yAxisKey.split(',').map((k: string) => k.trim());
                 }
                 rawConfig.series = keys.map((k: string) => ({ dataKey: k, label: k }));
            }
            setPopupChart(rawConfig);
            addLog(LogType.RESPONSE_RICH, analysis.textResponse);
        } else {
            addLog(LogType.RESPONSE_RICH, analysis.textResponse);
        }
    } catch (err) {
        addLog(LogType.ERROR, "AI Error.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleSetActiveSheet = (datasetId: string, sheetName: string) => {
      setDatasets(prev => prev.map(d => {
          if (d.id === datasetId) {
              return { ...d, activeSheetName: sheetName };
          }
          return d;
      }));
  };

  const activeDataset = datasets.find(d => d.id === activeDatasetId);
  const activeDataForGrid = activeDataset ? getActiveSheet(activeDataset).data : [];

  const insertCommand = (text: string) => {
      setCommandInput(text);
      inputElementRef.current?.focus();
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-900 overflow-hidden relative font-sans transition-colors duration-200">
      <Sidebar 
        datasets={datasets}
        activeDatasetId={activeDatasetId}
        onSetActiveDataset={setActiveDatasetId}
        onRemoveDataset={handleRemoveDataset}
        onUpload={handleFileUpload} 
        onToggleConsole={() => setIsConsoleOpen(!isConsoleOpen)}
        isConsoleOpen={isConsoleOpen}
        onVariableClick={(v) => insertCommand((commandInput + ' ' + v).trim())}
        language={language}
        onSetLanguage={setLanguage}
        theme={theme}
        onSetTheme={setTheme}
      />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white dark:bg-gray-800">
        <div className="flex-1 relative overflow-hidden">
             <DataGrid 
                datasets={datasets}
                activeDatasetId={activeDatasetId!}
                onSetActiveDataset={setActiveDatasetId}
                onSetActiveSheet={handleSetActiveSheet}
                onClose={() => {}}
                onGenerateChart={(cmd) => {
                    setCommandInput(cmd);
                    handleCommand(undefined, cmd); 
                }}
                language={language}
                theme={theme}
              />
            
            {isConsoleOpen && (
                <Console 
                    logs={logs} 
                    isProcessing={isProcessing}
                    data={activeDataForGrid}
                    onClose={() => setIsConsoleOpen(false)}
                    language={language}
                    theme={theme}
                />
            )}

            {popupChart && (
                <ChartWindow 
                    config={popupChart}
                    data={activeDataForGrid}
                    onClose={() => setPopupChart(null)}
                    language={language}
                    theme={theme}
                />
            )}

            {fullReport && activeDataset && (
                <ReportView 
                    report={fullReport}
                    dataset={activeDataset}
                    onClose={() => setFullReport(null)}
                    language={language}
                    theme={theme}
                />
            )}
            
            {isGeneratingReport && <LoadingModal language={language} />}

            {isHelpOpen && (
                <HelpModal 
                    onClose={() => setIsHelpOpen(false)}
                    language={language}
                />
            )}

            {isDimensionSelectorOpen && activeDataset && (
                <DimensionSelector
                    summaries={getActiveSheet(activeDataset).summaries}
                    onConfirm={handleCustomAnalysis}
                    onClose={() => setIsDimensionSelectorOpen(false)}
                    language={language}
                    theme={theme}
                />
            )}
        </div>

        <div 
            className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-all duration-300 ease-in-out shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30 flex flex-col shrink-0"
            style={{ height: isInputFocused ? '180px' : '100px' }}
        >
            {/* Quick Actions Bar - Always Visible */}
            <div className="h-10 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center px-4 gap-2 shrink-0 relative">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mr-2">{t.quickActions}:</span>
                
                {/* Full Analysis Button */}
                <button 
                    onClick={handleFullAnalysis}
                    className="px-3 py-1 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-100 dark:hover:bg-purple-900/50 flex items-center gap-1 font-medium border border-purple-200 dark:border-purple-800"
                >
                    <Sparkles className="w-3 h-3"/> {t.fullAnalysis}
                </button>

                {/* Custom Analysis Button */}
                <button 
                    onClick={() => {
                        if (!activeDatasetId) {
                            addLog(LogType.ERROR, "Load a dataset first.");
                            return;
                        }
                        setIsDimensionSelectorOpen(true);
                    }}
                    className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-1 font-medium border border-indigo-200 dark:border-indigo-800"
                >
                    <Filter className="w-3 h-3"/> {t.customAnalysis}
                </button>

                <button onClick={() => insertCommand('summarize')} className="px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center gap-1"><List className="w-3 h-3"/> summarize</button>
                <button onClick={() => insertCommand('describe')} className="px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center gap-1"><LayoutTemplate className="w-3 h-3"/> describe</button>
                <button onClick={() => insertCommand('list in 1/10')} className="px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center gap-1"><Activity className="w-3 h-3"/> list</button>
                
                <div className="ml-auto flex items-center gap-2">
                     <button 
                        onClick={() => setIsHelpOpen(true)} 
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1"
                        title="Help & Manual"
                     >
                         <CircleHelp className="w-3 h-3"/> {t.help}
                     </button>
                     <button onClick={() => insertCommand('clear all')} className="px-3 py-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center gap-1"><Trash2 className="w-3 h-3"/> clear</button>
                </div>
            </div>

            <form onSubmit={(e) => handleCommand(e)} className="flex-1 flex items-center p-3 relative min-h-0">
                 <div className="absolute left-6 top-6 text-gray-400">
                    <Terminal className="w-5 h-5" />
                 </div>
                 <textarea
                    ref={inputElementRef}
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onFocus={() => {
                        setIsInputFocused(true);
                        setIsConsoleOpen(true); 
                    }}
                    onBlur={() => setTimeout(() => setIsInputFocused(false), 200)} 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleCommand();
                        }
                    }}
                    placeholder={t.commandPlaceholder}
                    className="w-full h-full pl-10 pr-12 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-mono text-sm leading-relaxed shadow-sm transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
                 />
                 <button 
                    type="submit"
                    disabled={!commandInput.trim() || isProcessing}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-full disabled:text-gray-300 dark:disabled:text-gray-600 transition-colors"
                 >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5" />}
                 </button>
            </form>
        </div>
      </main>
    </div>
  );
};

export default App;