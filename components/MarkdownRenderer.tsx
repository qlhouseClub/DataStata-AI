
import React from 'react';
import { BarChart3 } from 'lucide-react';

const parseInline = (text: string) => {
    // Split by bold and inline code.
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
        // Value Highlight (**123**)
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={idx} className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 rounded border border-emerald-100 dark:border-emerald-800 shadow-sm">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        // Field/Variable Highlight (`Revenue`)
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <span key={idx} className="font-medium text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 rounded mx-0.5">
                    {part.slice(1, -1)}
                </span>
            );
        }
        return part;
    });
};

export const MarkdownRenderer = ({ content }: { content: string }) => {
    // 1. Split by Code Blocks first to preserve them
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
        <div className="space-y-4 text-sm leading-7 font-sans text-gray-700 dark:text-gray-300 text-left">
            {parts.map((part, i) => {
                if (part.startsWith('```')) {
                    // Code Block
                    const code = part.replace(/^```\w*\n?|```$/g, '');
                    return (
                        <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-3 font-mono text-xs overflow-x-auto border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-inner mb-4">
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
                             elements.push(<ul key={`list-${i}-${lineIdx}`} className="space-y-2 mb-4 pl-2">{listItems}</ul>);
                             listItems = [];
                             inList = false;
                         }
                         const level = line.match(/^#+/)[0].length;
                         const text = line.replace(/^#+\s/, '');
                         
                         // Visual Header Styles - Left Aligned
                         const styles = [
                             'text-xl font-extrabold text-gray-900 dark:text-gray-100 mt-6 mb-4 pb-2 border-b-2 border-blue-500 w-fit pr-8', // h1
                             'text-lg font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3 flex items-center gap-2', // h2
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
                        const metricMatch = text.match(/^(\*\*.*?\*\*|`.*?`):\s*(.*)$/);
                        
                        if (metricMatch) {
                            // Enhanced List Item with Visualization
                            const label = metricMatch[1]; // **Label** or `Label`
                            const valueStr = metricMatch[2];
                            
                            // Try to extract a percentage for bar
                            let pct = 0;
                            if (valueStr.includes('%')) {
                                const num = parseFloat(valueStr);
                                if (!isNaN(num)) pct = Math.min(100, Math.max(0, num));
                            }

                            listItems.push(
                                <li key={`li-${i}-${lineIdx}`} className="mb-2 list-none">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex-1 min-w-[140px] flex items-center gap-2">
                                            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                                                <BarChart3 className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-gray-800 dark:text-gray-200 font-medium">{parseInline(label)}</span>
                                        </div>
                                        
                                        <div className="flex-[2] flex flex-col justify-center">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                 <span className="font-mono font-bold text-gray-900 dark:text-gray-100 text-sm">{parseInline(valueStr)}</span>
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
                                <li key={`li-${i}-${lineIdx}`} className="pl-1 flex gap-2 items-start text-sm leading-7">
                                    <div className="min-w-[6px] h-[6px] rounded-full bg-blue-400 mt-2.5 shrink-0" />
                                    <span>{parseInline(text)}</span>
                                </li>
                            );
                        }
                        return;
                    }

                    // End list if empty line or standard text
                    if (inList && trimmed === '') {
                         elements.push(<ul key={`list-${i}-${lineIdx}`} className="space-y-2 mb-6 pl-2">{listItems}</ul>);
                         listItems = [];
                         inList = false;
                         return;
                    }
                    
                    if (inList) {
                         elements.push(<ul key={`list-${i}-${lineIdx}`} className="space-y-2 mb-6 pl-2">{listItems}</ul>);
                         listItems = [];
                         inList = false;
                    }

                    if (trimmed !== '') {
                        // Standard paragraph with 14px text (text-sm), relaxed line-height (leading-7) and margin (mb-4)
                        elements.push(<p key={`p-${i}-${lineIdx}`} className="mb-4 last:mb-0 text-gray-600 dark:text-gray-300 text-sm leading-7">{parseInline(line)}</p>);
                    }
                });

                if (inList) {
                     elements.push(<ul key={`list-end-${i}`} className="space-y-2 mb-6 pl-2">{listItems}</ul>);
                }

                return <div key={i}>{elements}</div>;
            })}
        </div>
    );
};
