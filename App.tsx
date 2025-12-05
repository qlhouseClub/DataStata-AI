
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Console } from './components/Console';
import { DataGrid } from './components/DataGrid';
import { ChartWindow } from './components/ChartWindow';
import { LogEntry, LogType, DataRow, Dataset, SheetData, getActiveSheet, Language, ChartConfig } from './types';
import { parseCSV, generateSummaries, parseExcel } from './utils/dataUtils';
import { analyzeData } from './services/geminiService';
import { interpretStataCommand } from './services/stataInterpreter';
import { Loader2, Terminal, Send, Play, List, Activity, Trash2, LayoutTemplate } from 'lucide-react';
import { getTranslation } from './utils/translations';

const App: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false); // Controls the overlay console
  const [language, setLanguage] = useState<Language>('en');
  
  // Popup Chart State
  const [popupChart, setPopupChart] = useState<ChartConfig | null>(null);

  // Command Bar State
  const [commandInput, setCommandInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);

  const t = getTranslation(language);
  const inputElementRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
        setApiKeyError(true);
        addLog(LogType.ERROR, "API Key missing.");
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
    // Auto-open console on error or text response to ensure user sees it
    if (type === LogType.ERROR || (type === LogType.RESPONSE_TEXT && !isConsoleOpen)) {
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
        setIsConsoleOpen(false); // Hide console to show data grid by default on load
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

  const handleCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd || isProcessing) return;

    setCommandInput('');
    // Keep focus if needed, or let blur happen naturally? 
    // Usually user wants to type more commands. But we set false in blur.
    
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

    // 1. Stata Interpreter
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

    // 2. Gemini
    setIsProcessing(true);
    try {
        const sheetData = getActiveSheet(activeDataset);
        const sampleRows = sheetData.data.slice(0, 3);
        const analysis = await analyzeData(cmd, sheetData.summaries, sampleRows);

        if (analysis.intent === 'CHART' && analysis.chartConfig) {
            setPopupChart(analysis.chartConfig);
            addLog(LogType.RESPONSE_TEXT, analysis.textResponse);
        } else {
            addLog(LogType.RESPONSE_TEXT, analysis.textResponse);
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

  // Quick Action Handlers
  const insertCommand = (text: string) => {
      setCommandInput(text);
      inputElementRef.current?.focus();
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden relative font-sans">
      <Sidebar 
        datasets={datasets}
        activeDatasetId={activeDatasetId}
        onSetActiveDataset={setActiveDatasetId}
        onUpload={handleFileUpload} 
        onToggleConsole={() => setIsConsoleOpen(!isConsoleOpen)}
        isConsoleOpen={isConsoleOpen}
        onVariableClick={(v) => insertCommand((commandInput + ' ' + v).trim())}
        language={language}
        onSetLanguage={setLanguage}
      />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
        {/* Main View Area: DataGrid is default/background */}
        <div className="flex-1 relative overflow-hidden">
             <DataGrid 
                datasets={datasets}
                activeDatasetId={activeDatasetId!}
                onSetActiveDataset={setActiveDatasetId}
                onSetActiveSheet={handleSetActiveSheet}
                onClose={() => {}}
                onGenerateChart={(cmd) => {
                    setCommandInput(cmd);
                    handleCommand(); // Auto execute for chart builder
                }}
                language={language}
              />
            
            {/* Console Overlay (Highest Priority 1) */}
            {isConsoleOpen && (
                <Console 
                    logs={logs} 
                    isProcessing={isProcessing}
                    data={activeDataForGrid}
                    onClose={() => setIsConsoleOpen(false)}
                    language={language}
                />
            )}

            {/* Popup Chart Window (Highest Priority 2) */}
            {popupChart && (
                <ChartWindow 
                    config={popupChart}
                    data={activeDataForGrid}
                    onClose={() => setPopupChart(null)}
                    language={language}
                />
            )}
        </div>

        {/* Persistent Command Bar (Footer) */}
        <div 
            className={`border-t border-gray-200 bg-gray-50 transition-all duration-300 ease-in-out shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30 ${isInputFocused ? 'h-48' : 'h-16'}`}
        >
            <div className="h-full flex flex-col">
                {/* Quick Actions (Visible when focused) */}
                <div className={`overflow-hidden transition-all duration-300 ${isInputFocused ? 'h-12 opacity-100' : 'h-0 opacity-0'} bg-white border-b border-gray-100 flex items-center px-4 gap-2`}>
                    <span className="text-xs font-semibold text-gray-500 uppercase mr-2">{t.quickActions}:</span>
                    <button onClick={() => insertCommand('summarize')} className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center gap-1"><List className="w-3 h-3"/> summarize</button>
                    <button onClick={() => insertCommand('describe')} className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center gap-1"><LayoutTemplate className="w-3 h-3"/> describe</button>
                    <button onClick={() => insertCommand('list in 1/10')} className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center gap-1"><Activity className="w-3 h-3"/> list</button>
                    <button onClick={() => insertCommand('clear all')} className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 flex items-center gap-1 ml-auto"><Trash2 className="w-3 h-3"/> clear</button>
                </div>

                {/* Input Area */}
                <form onSubmit={handleCommand} className="flex-1 flex items-center p-3 relative">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                        <Terminal className="w-5 h-5" />
                     </div>
                     <textarea
                        ref={inputElementRef}
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        onFocus={() => {
                            setIsInputFocused(true);
                            setIsConsoleOpen(true); // Automatically open console pane when typing
                        }}
                        onBlur={() => setTimeout(() => setIsInputFocused(false), 200)} // Delay to allow button clicks
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleCommand();
                            }
                        }}
                        placeholder={t.commandPlaceholder}
                        className="w-full h-full pl-10 pr-12 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-mono text-sm leading-relaxed shadow-sm transition-all"
                     />
                     <button 
                        type="submit"
                        disabled={!commandInput.trim() || isProcessing}
                        className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-full disabled:text-gray-300 transition-colors"
                     >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5" />}
                     </button>
                </form>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
