
import React, { useEffect, useRef } from 'react';
import { LogEntry, LogType, DataRow, Language } from '../types';
import { ChartRenderer } from './ChartRenderer';
import { Loader2, X, Copy, Check, Terminal } from 'lucide-react';
import { getTranslation } from '../utils/translations';

interface ConsoleProps {
  logs: LogEntry[];
  isProcessing: boolean;
  data: DataRow[];
  onClose?: () => void;
  language: Language;
}

export const Console: React.FC<ConsoleProps> = ({ logs, isProcessing, data, onClose, language }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(language);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isProcessing]);

  const handleCopyLogs = () => {
      const text = logs.map(l => {
          if (l.type === LogType.COMMAND) return `. ${l.content}`;
          if (l.type === LogType.RESPONSE_TEXT) return l.content;
          return '';
      }).join('\n\n');
      
      navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[600px] bg-white shadow-2xl rounded-lg border border-blue-100 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header - Blue/White Theme */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-blue-100 shrink-0">
         <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-50 rounded-md">
                <Terminal className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-800 text-sm tracking-wide">
                {t.console}
            </span>
         </div>
         <div className="flex items-center gap-3">
            <button 
                onClick={handleCopyLogs}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded text-xs font-medium transition-colors"
                title="Copy all output"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500"/> : <Copy className="w-3.5 h-3.5"/>}
                {copied ? "Copied" : "Copy Output"}
            </button>
            {onClose && (
                 <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                     <X className="w-5 h-5" />
                 </button>
             )}
         </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-sm bg-white">
        <div className="text-blue-900/40 mb-8 select-none border-b border-dashed border-gray-100 pb-4">
          <p className="font-bold text-lg">DataStata.AI 2.1 (MP)</p>
          <p className="text-xs">Type commands below or use natural language.</p>
        </div>

        {logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-1 duration-200 group">
            {log.type === LogType.COMMAND && (
              <div className="flex items-start gap-2 mb-2">
                <span className="text-gray-400 font-bold select-none mt-0.5">.</span>
                <span className="text-gray-900 font-bold">{log.content as string}</span>
              </div>
            )}
            
            {log.type === LogType.RESPONSE_TEXT && (
              <div className="pl-5 text-gray-700 whitespace-pre-wrap leading-relaxed font-mono text-[13px]">
                {log.content as string}
              </div>
            )}
            
            {log.type === LogType.RESPONSE_CHART && (
              <div className="pl-5 my-2 border rounded-lg border-gray-100 p-2 shadow-sm">
                <div className="h-64">
                    <ChartRenderer config={log.content as any} data={data} />
                </div>
              </div>
            )}
            
            {log.type === LogType.ERROR && (
              <div className="pl-5 text-red-600 font-semibold bg-red-50/50 p-2 rounded inline-block">
                r(198); {log.content as string}
              </div>
            )}

             {log.type === LogType.SYSTEM && (
              <div className="pl-5 text-blue-500 italic text-xs border-l-2 border-blue-200 pl-2">
                {log.content as string}
              </div>
            )}
          </div>
        ))}
        
        {isProcessing && (
           <div className="flex items-center gap-2 pl-5 text-blue-600 mt-4">
             <Loader2 className="w-4 h-4 animate-spin" />
             <span className="text-xs font-medium">{t.processing}</span>
           </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};
