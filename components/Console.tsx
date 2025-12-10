

import React, { useEffect, useRef } from 'react';
import { LogEntry, LogType, DataRow, Language, Theme } from '../types';
import { ChartRenderer } from './ChartRenderer';
import { Loader2, X, Copy, Check, Terminal } from 'lucide-react';
import { getTranslation } from '../utils/translations';

interface ConsoleProps {
  logs: LogEntry[];
  isProcessing: boolean;
  data: DataRow[];
  onClose?: () => void;
  language: Language;
  theme: Theme;
}

export const Console: React.FC<ConsoleProps> = ({ logs, isProcessing, data, onClose, language, theme }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(language);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isProcessing]);

  const handleCopyLogs = () => {
      const text = logs.map(l => {
          if (l.type === LogType.COMMAND) return `. ${l.content}`;
          if (l.type === LogType.RESPONSE_TEXT || l.type === LogType.RESPONSE_RICH) return l.content;
          return '';
      }).join('\n\n');
      
      navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[600px] bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-blue-100 dark:border-gray-700 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-blue-100 dark:border-gray-700 shrink-0">
         <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm tracking-wide">
                {t.console}
            </span>
         </div>
         <div className="flex items-center gap-3">
            <button 
                onClick={handleCopyLogs}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium transition-colors"
                title="Copy all output"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500"/> : <Copy className="w-3.5 h-3.5"/>}
                {copied ? "Copied" : "Copy Output"}
            </button>
            {onClose && (
                 <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                     <X className="w-5 h-5" />
                 </button>
             )}
         </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-sm bg-white dark:bg-gray-800">
        <div className="text-blue-900/40 dark:text-blue-300/40 mb-8 select-none border-b border-dashed border-gray-100 dark:border-gray-700 pb-4">
          <p className="font-bold text-lg">DataStata.AI 2.2 (MP)</p>
          <p className="text-xs">Type commands below or use natural language.</p>
        </div>

        {logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-1 duration-200 group">
            {log.type === LogType.COMMAND && (
              <div className="flex items-start gap-2 mb-2">
                <span className="text-gray-400 font-bold select-none mt-0.5">.</span>
                <span className="text-gray-900 dark:text-gray-100 font-bold">{log.content as string}</span>
              </div>
            )}
            
            {log.type === LogType.RESPONSE_TEXT && (
              <div className="pl-5 text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-mono text-[13px]">
                {log.content as string}
              </div>
            )}
            
            {log.type === LogType.RESPONSE_RICH && (
                <div className="pl-5">
                    <MarkdownRenderer content={log.content as string} />
                </div>
            )}
            
            {log.type === LogType.RESPONSE_CHART && (
              <div className="pl-5 my-2 border rounded-lg border-gray-100 dark:border-gray-700 p-2 shadow-sm bg-white dark:bg-gray-750">
                <div className="h-64">
                    <ChartRenderer config={log.content as any} data={data} theme={theme} />
                </div>
              </div>
            )}
            
            {log.type === LogType.ERROR && (
              <div className="pl-5 text-red-600 dark:text-red-400 font-semibold bg-red-50/50 dark:bg-red-900/20 p-2 rounded inline-block">
                r(198); {log.content as string}
              </div>
            )}

             {log.type === LogType.SYSTEM && (
              <div className="pl-5 text-blue-500 italic text-xs border-l-2 border-blue-200 dark:border-blue-800 pl-2">
                {log.content as string}
              </div>
            )}
          </div>
        ))}
        
        {isProcessing && (
           <div className="flex items-center gap-2 pl-5 text-blue-600 dark:text-blue-400 mt-4">
             <Loader2 className="w-4 h-4 animate-spin" />
             <span className="text-xs font-medium">{t.processing}</span>
           </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

// --- MARKDOWN RENDERER ---
const parseInline = (text: string) => {
    // Split by bold and inline code. Note: simplified parser.
    // Handles **text** and `text`.
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={idx} className="font-bold text-gray-900 dark:text-gray-100">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={idx} className="bg-gray-100 dark:bg-gray-700 text-pink-600 dark:text-pink-400 px-1 py-0.5 rounded font-mono text-xs border border-gray-200 dark:border-gray-600">{part.slice(1, -1)}</code>;
        }
        return part;
    });
};

const MarkdownRenderer = ({ content }: { content: string }) => {
    // 1. Split by Code Blocks first to preserve them
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
        <div className="space-y-3 text-sm leading-relaxed font-sans text-gray-700 dark:text-gray-300">
            {parts.map((part, i) => {
                if (part.startsWith('```')) {
                    // Code Block
                    const code = part.replace(/^```\w*\n?|```$/g, '');
                    return (
                        <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-3 font-mono text-xs overflow-x-auto border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                             {code}
                        </div>
                    );
                }

                // Regular Markdown Text
                const lines = part.split(/\n/);
                const elements: React.ReactNode[] = [];
                
                let inList = false;
                let listItems: React.ReactNode[] = [];

                lines.forEach((line, lineIdx) => {
                    const trimmed = line.trim();
                    
                    // Headers
                    if (line.match(/^#{1,6}\s/)) {
                         if (inList) {
                             elements.push(<ul key={`list-${i}-${lineIdx}`} className="list-disc pl-5 space-y-2 marker:text-blue-500 mb-4">{listItems}</ul>);
                             listItems = [];
                             inList = false;
                         }
                         const level = line.match(/^#+/)[0].length;
                         const text = line.replace(/^#+\s/, '');
                         const sizes = ['text-xl', 'text-lg', 'text-base font-bold', 'text-sm font-bold'];
                         const margin = level === 1 ? 'mt-6 mb-3' : 'mt-4 mb-2';
                         elements.push(
                             <h3 key={`h-${i}-${lineIdx}`} className={`${sizes[level-1] || 'font-bold'} text-gray-900 dark:text-gray-50 ${margin} first:mt-0`}>
                                 {parseInline(text)}
                             </h3>
                         );
                         return;
                    }

                    // Lists (Bullets)
                    // Matches "- " or "* "
                    if (line.match(/^\s*[-*]\s/)) {
                        inList = true;
                        const text = line.replace(/^\s*[-*]\s/, '');
                        
                        // Check for "Metric: Value" pattern for enhanced styling
                        // e.g., "**Revenue**: 50%" or "**Revenue**: $50M"
                        const metricMatch = text.match(/^\*\*(.*?)\*\*:\s*(.*)$/);
                        
                        if (metricMatch) {
                            // Enhanced List Item with Visualization
                            const label = metricMatch[1];
                            const valueStr = metricMatch[2];
                            
                            // Try to extract a percentage for bar
                            let pct = 0;
                            if (valueStr.includes('%')) {
                                const num = parseFloat(valueStr);
                                if (!isNaN(num)) pct = Math.min(100, Math.max(0, num));
                            }

                            listItems.push(
                                <li key={`li-${i}-${lineIdx}`} className="pl-1">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                        <span className="font-semibold text-gray-800 dark:text-gray-200 min-w-[140px]">{label}:</span>
                                        <span className="flex-1 text-gray-600 dark:text-gray-300">{parseInline(valueStr)}</span>
                                    </div>
                                    {/* Visual Bar if percentage is found or if user explicitly mentions "Growth", "Share" etc and value is number-like */}
                                    {pct > 0 && (
                                        <div className="mt-1.5 h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden max-w-[200px] mb-1">
                                            <div 
                                                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    )}
                                </li>
                            );
                        } else {
                            // Standard List Item
                            listItems.push(<li key={`li-${i}-${lineIdx}`} className="pl-1">{parseInline(text)}</li>);
                        }
                        return;
                    }

                    // End list if empty line or standard text
                    if (inList && trimmed === '') {
                         elements.push(<ul key={`list-${i}-${lineIdx}`} className="list-disc pl-5 space-y-2 marker:text-blue-500 mb-4">{listItems}</ul>);
                         listItems = [];
                         inList = false;
                         return;
                    }
                    
                    if (inList) {
                        // If it's just text inside a list area but not a bullet, technically part of previous item, 
                        // but for simple parsing we close list or treat as text.
                        // Let's close list to be safe.
                         elements.push(<ul key={`list-${i}-${lineIdx}`} className="list-disc pl-5 space-y-2 marker:text-blue-500 mb-4">{listItems}</ul>);
                         listItems = [];
                         inList = false;
                    }

                    if (trimmed !== '') {
                        elements.push(<p key={`p-${i}-${lineIdx}`} className="mb-2 last:mb-0">{parseInline(line)}</p>);
                    }
                });

                if (inList) {
                     elements.push(<ul key={`list-end-${i}`} className="list-disc pl-5 space-y-2 marker:text-blue-500 mb-4">{listItems}</ul>);
                }

                return <div key={i}>{elements}</div>;
            })}
        </div>
    );
};
