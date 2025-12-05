import React, { useEffect, useRef, useState } from 'react';
import { LogEntry, LogType, DataRow } from '../types';
import { Send, Terminal, Loader2, Play } from 'lucide-react';
import { ChartRenderer } from './ChartRenderer';

interface ConsoleProps {
  logs: LogEntry[];
  onCommand: (cmd: string) => void;
  isProcessing: boolean;
  data: DataRow[];
}

export const Console: React.FC<ConsoleProps> = ({ logs, onCommand, isProcessing, data }) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onCommand(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-white relative">
      {/* Output Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-sm">
        <div className="text-gray-400 mb-6">
          <p>DataStat AI 1.0 (Web Assembly Edition)</p>
          <p>Type "help" or ask natural language questions about your data.</p>
        </div>

        {logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {log.type === LogType.COMMAND && (
              <div className="flex items-start gap-2 text-gray-500 font-bold mb-1">
                <span className="select-none mt-1">.</span>
                <span className="text-gray-800 bg-gray-50 px-2 py-1 rounded">{log.content as string}</span>
              </div>
            )}
            
            {log.type === LogType.RESPONSE_TEXT && (
              <div className="pl-6 text-gray-700 whitespace-pre-wrap leading-relaxed font-sans border-l-2 border-blue-100">
                {log.content as string}
              </div>
            )}
            
            {log.type === LogType.RESPONSE_CHART && (
              <div className="pl-6">
                <ChartRenderer config={log.content as any} data={data} />
              </div>
            )}
            
            {log.type === LogType.ERROR && (
              <div className="pl-6 text-red-600 font-semibold">
                r(198); {log.content as string}
              </div>
            )}

             {log.type === LogType.SYSTEM && (
              <div className="pl-6 text-blue-600 italic">
                {log.content as string}
              </div>
            )}
          </div>
        ))}
        
        {isProcessing && (
           <div className="flex items-center gap-2 pl-6 text-blue-500">
             <Loader2 className="w-4 h-4 animate-spin" />
             <span className="text-xs">Processing...</span>
           </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="relative flex items-center shadow-sm border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <div className="pl-3 text-gray-400">
                <Terminal className="w-4 h-4" />
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter command or question (e.g., 'summarize price', 'scatter price mpg')"
                className="flex-1 py-3 px-3 outline-none text-gray-700 font-mono text-sm bg-transparent"
                disabled={isProcessing}
            />
            <button 
                type="submit" 
                disabled={!input.trim() || isProcessing}
                className="mr-2 p-1.5 rounded-md text-blue-600 hover:bg-blue-50 disabled:text-gray-300 transition-colors"
            >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
            </button>
        </form>
      </div>
    </div>
  );
};