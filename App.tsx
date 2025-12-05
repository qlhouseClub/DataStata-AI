import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Console } from './components/Console';
import { DataGrid } from './components/DataGrid';
import { DatasetState, LogEntry, LogType, DataRow } from './types';
import { parseCSV, generateSummaries, parseExcel } from './utils/dataUtils';
import { analyzeData } from './services/geminiService';
import { interpretStataCommand } from './services/stataInterpreter';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [dataset, setDataset] = useState<DatasetState>({
    fileName: null,
    data: [],
    columns: [],
    summaries: [],
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDataViewOpen, setIsDataViewOpen] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
        setApiKeyError(true);
        addLog(LogType.ERROR, "API Key is missing. Please ensure process.env.API_KEY is configured.");
    } else {
        addLog(LogType.SYSTEM, "System ready. Upload a CSV, XLS, or XLSX file to begin analysis.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLog = (type: LogType, content: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random().toString(),
      timestamp: Date.now(),
      type,
      content,
    };
    setLogs((prev) => [...prev, newLog]);
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
        let data: DataRow[] = [];
        
        if (isExcel) {
             const buffer = event.target?.result as ArrayBuffer;
             data = parseExcel(buffer);
        } else {
             const text = event.target?.result as string;
             data = parseCSV(text);
        }

        if (data.length === 0) throw new Error("Empty dataset");
        
        const columns = Object.keys(data[0]);
        const summaries = generateSummaries(data, columns);

        setDataset({
          fileName: file.name,
          data,
          columns,
          summaries,
        });

        addLog(LogType.SYSTEM, `Dataset loaded successfully. ${data.length} observations, ${columns.length} variables.`);
        setIsDataViewOpen(true);
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

  const handleCommand = async (command: string) => {
    if (apiKeyError) {
        addLog(LogType.COMMAND, command);
        addLog(LogType.ERROR, "Cannot process command: API Key missing.");
        return;
    }

    addLog(LogType.COMMAND, command);

    // 1. Client-side Commands
    if (command.toLowerCase() === 'clear') {
        if (dataset.data.length > 0) {
             setDataset({ fileName: null, data: [], columns: [], summaries: [] });
             setLogs([]); // Optional: clear logs too or just data? Stata clear clears data.
             addLog(LogType.SYSTEM, "Data cleared from memory.");
        } else {
             setLogs([]);
        }
        return;
    }
    
    if (dataset.data.length === 0) {
        addLog(LogType.ERROR, "No data in memory. Please load a dataset first.");
        return;
    }

    // 2. Try Stata Interpreter
    const stataResult = interpretStataCommand(command, dataset.data, dataset.summaries);
    if (stataResult.handled) {
        if (stataResult.logs) {
            stataResult.logs.forEach(log => addLog(log.type, log.content));
        }
        if (stataResult.newData && stataResult.newSummaries) {
            setDataset(prev => ({
                ...prev,
                data: stataResult.newData!,
                summaries: stataResult.newSummaries!,
                columns: stataResult.newSummaries!.map(s => s.name)
            }));
        }
        return;
    }

    // 3. Fallback to Gemini
    setIsProcessing(true);
    try {
        const sampleRows = dataset.data.slice(0, 3);
        const analysis = await analyzeData(command, dataset.summaries, sampleRows);

        if (analysis.intent === 'CHART' && analysis.chartConfig) {
            addLog(LogType.RESPONSE_TEXT, analysis.textResponse);
            addLog(LogType.RESPONSE_CHART, analysis.chartConfig);
        } else {
            addLog(LogType.RESPONSE_TEXT, analysis.textResponse);
        }

    } catch (err) {
        addLog(LogType.ERROR, "An error occurred while communicating with the AI service.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden relative">
      <Sidebar 
        summaries={dataset.summaries} 
        onUpload={handleFileUpload} 
        fileName={dataset.fileName}
        onToggleDataView={() => setIsDataViewOpen(!isDataViewOpen)}
        isDataViewOpen={isDataViewOpen}
      />
      
      <main className="flex-1 flex flex-col h-full relative">
        <Console 
            logs={logs} 
            onCommand={handleCommand} 
            isProcessing={isProcessing}
            data={dataset.data}
        />
        
        {isDataViewOpen && dataset.data.length > 0 && (
          <DataGrid 
            data={dataset.data} 
            summaries={dataset.summaries} 
            onClose={() => setIsDataViewOpen(false)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;