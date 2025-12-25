


import React from 'react';
import { BarChart3 } from 'lucide-react';

const parseInline = (text: string) => {
    // Split by bold and inline code.
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // Updated: Bold text now uses brand color (blue/indigo) for highlighting "Key Content"
            return <strong key={idx} className="font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1 rounded-sm">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={idx} className="bg-gray-100 dark:bg-gray-700 text-pink-600 dark:text-pink-400 px-1 py-0.5 rounded font-mono text-xs border border-gray-200 dark:border-gray-600">{part.slice(1, -1)}</code>;
        }
        return part;
    });
};

export const MarkdownRenderer = ({ content }: { content: string }) => {
    // 1. Split by Code Blocks first to preserve them
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
        <div className="space-y-4 text-sm leading-relaxed font-sans text-gray-700 dark:text-gray-300 text-left">
            {parts.map((part, i) => {
                if (part.startsWith('```')) {
                    // Code Block
                    const code = part.replace(/^```\w*\n?|```$/g, '');
                    return (
                        <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-3 font-mono text-xs overflow-x-auto border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-inner">
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
                    
                    // Headers (Standard Markdown Style)
                    if (line.match(/^#{1,6}\s/)) {
                         if (inList) {
                             elements.push(<ul key={`list-${i}-${lineIdx}`} className="space-y-2 mb-4">{listItems}</ul>);
                             listItems = [];
                             inList = false;
                         }
                         const level = line.match(/^#+/)[0].length;
                         const text = line.replace(/^#+\s/, '');
                         
                         // Visual Header Styles - Left Aligned
                         const styles = [
                             'text-xl font-extrabold text-gray-900 dark:text-gray-100 mt-6 mb-3 pb-2 border-b-2 border-blue-500 w-fit pr-8', // h1
                             'text-lg font-bold text-gray-800 dark:text-gray-200 mt-5 mb-2 flex items-center gap-2', // h2
                             'text-base font-bold text-gray-700 dark:text-gray-300 mt-4 mb-2', // h3
                         ];
                         
                         elements.push(
                             <div key={`h-${i}-${lineIdx}`} className={styles[level-1] || 'font-bold mt-2'}>
                                 {parseInline(text)}
                             </div>
                         );
                         return;
                    }

                    // Lists (Bullets)
                    if (line.match(/^\s*[-*]\s/)) {
                        inList = true;
                        const text = line.replace(/^\s*[-*]\s/, '');
                        
                        // Check for "Metric: Value" pattern for enhanced styling
                        const metricMatch = text.match(/^(\*\*.*?\*\*):\s*(.*)$/);
                        
                        if (metricMatch) {
                            // Enhanced List Item with Visualization
                            const label = metricMatch[1]; // **Label**
                            const valueStr = metricMatch[2];
                            
                            // Try to extract a percentage for bar
                            let pct = 0;
                            if (valueStr.includes('%')) {
                                const num = parseFloat(valueStr);
                                if (!isNaN(num)) pct = Math.min(100, Math.max(0, num));
                            }

                            listItems.push(
                                <li key={`li-${i}-${lineIdx}`} className="pl-1 mb-2 list-none">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex-1 min-w-[140px] flex items-center gap-2">
                                            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                                                <BarChart3 className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-gray-800 dark:text-gray-200 font-medium">{parseInline(label)}</span>
                                        </div>
                                        
                                        <div className="flex-[2] flex flex-col justify-center">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                 <span className="font-mono font-bold text-gray-900 dark:text-gray-100 text-sm">{valueStr}</span>
                                            </div>
                                            {/* Visual Bar if percentage is found */}
                                            {pct > 0 && (
                                                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        } else {
                            // Standard List Item with custom bullet
                            listItems.push(
                                <li key={`li-${i}-${lineIdx}`} className="pl-1 flex gap-2 items-start">
                                    <div className="min-w-[6px] h-[6px] rounded-full bg-blue-400 mt-2 shrink-0" />
                                    <span>{parseInline(text)}</span>
                                </li>
                            );
                        }
                        return;
                    }

                    // End list if empty line or standard text
                    if (inList && trimmed === '') {
                         elements.push(<ul key={`list-${i}-${lineIdx}`} className="space-y-2 mb-4">{listItems}</ul>);
                         listItems = [];
                         inList = false;
                         return;
                    }
                    
                    if (inList) {
                         elements.push(<ul key={`list-${i}-${lineIdx}`} className="space-y-2 mb-4">{listItems}</ul>);
                         listItems = [];
                         inList = false;
                    }

                    if (trimmed !== '') {
                        elements.push(<p key={`p-${i}-${lineIdx}`} className="mb-3 last:mb-0 text-gray-600 dark:text-gray-300">{parseInline(line)}</p>);
                    }
                });

                if (inList) {
                     elements.push(<ul key={`list-end-${i}`} className="space-y-2 mb-4">{listItems}</ul>);
                }

                return <div key={i}>{elements}</div>;
            })}
        </div>
    );
};
