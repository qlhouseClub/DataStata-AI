
import React, { useState } from 'react';
import { X, Book, Database, Terminal, Sparkles, PieChart, ArrowRight, MousePointer, Maximize2, Layers, Hash, Type as TypeIcon, Calendar, Activity, Play, ChevronRight, LayoutTemplate } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface HelpModalProps {
  onClose: () => void;
  language: Language;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose, language }) => {
  const t = getTranslation(language);
  const topics = t.helpTopics;
  
  const [activeTopic, setActiveTopic] = useState<keyof typeof topics>('intro');

  const navItems = [
    { id: 'intro', icon: Book },
    { id: 'workflow', icon: Play }, // New Workflow section
    { id: 'data', icon: Database },
    { id: 'commands', icon: Terminal },
    { id: 'ai', icon: Sparkles },
    { id: 'viz', icon: PieChart },
  ];

  const renderUIPreview = (type: string) => {
    // 1. Interface Anatomy (Neutral)
    if (type === 'interface_anatomy') {
        return (
            <div className="my-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                <div className="flex h-48">
                    {/* Fake Sidebar */}
                    <div className="w-1/4 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-2 relative">
                        <div className="absolute top-2 left-2 right-2 border-2 border-dashed border-red-400 bg-red-400/10 p-1 text-[10px] text-red-600 dark:text-red-300 font-bold rounded text-center">
                            1. Data Control
                        </div>
                        <div className="mt-10 space-y-1 opacity-50">
                            <div className="h-2 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="h-2 w-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                        {/* Fake Grid */}
                        <div className="flex-1 bg-white dark:bg-gray-800 p-2 relative border-b border-gray-200 dark:border-gray-700">
                            <div className="absolute inset-4 border-2 border-dashed border-blue-400 bg-blue-400/10 flex items-center justify-center text-[10px] text-blue-600 dark:text-blue-300 font-bold rounded">
                                2. Data View / Chart
                            </div>
                        </div>
                        {/* Fake Console */}
                        <div className="h-16 bg-gray-50 dark:bg-gray-900 p-2 relative">
                             <div className="absolute inset-2 border-2 border-dashed border-green-400 bg-green-400/10 flex items-center justify-center text-[10px] text-green-600 dark:text-green-300 font-bold rounded">
                                3. Command Input
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 text-xs text-gray-500 grid grid-cols-3 gap-2 border-t border-gray-200 dark:border-gray-700">
                    <div><strong className="text-red-500">1. Data Control:</strong> Upload files, switch Frames, click variables.</div>
                    <div><strong className="text-blue-500">2. Data View:</strong> Displays raw spreadsheet data or generated charts.</div>
                    <div><strong className="text-green-500">3. Command:</strong> Type Stata commands or natural language queries here.</div>
                </div>
            </div>
        );
    }

    // 2. Workflow Timeline (Step-by-Step)
    if (type === 'workflow_timeline') {
        return (
            <div className="my-6 py-4 relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                
                {/* Step 1 */}
                <div className="relative pl-10 mb-6">
                    <div className="absolute left-1 top-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-4 border-white dark:border-gray-800">1</div>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Load Data</h4>
                    <div className="mt-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-gray-400"/>
                        <span>Upload <code>data.csv</code> -> Frame Created</span>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="relative pl-10 mb-6">
                    <div className="absolute left-1 top-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-4 border-white dark:border-gray-800">2</div>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Inspect</h4>
                    <div className="mt-2 p-2 bg-gray-900 text-white rounded font-mono text-xs">
                        <span className="text-gray-400">.</span> summarize price
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">Check Min, Max, Mean values to understand range.</div>
                </div>

                {/* Step 3 */}
                <div className="relative pl-10">
                    <div className="absolute left-1 top-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-4 border-white dark:border-gray-800">3</div>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Analyze & Visualize</h4>
                    <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded text-xs">
                        <p className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Input (Natural Language):</p>
                        <p className="italic">"Plot a scatter of price vs mpg"</p>
                        <div className="mt-2 h-16 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center text-gray-400">
                            [Chart Generated Automatically]
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // 3. Variable Types (Technical)
    if (type === 'variable_types') {
        return (
            <div className="my-4 grid grid-cols-3 gap-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-900/50 flex flex-col items-center text-center">
                    <Hash className="w-5 h-5 text-blue-500 mb-1"/>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Numeric</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-1">Integers, Floats.<br/>Use for math.</span>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-100 dark:border-orange-900/50 flex flex-col items-center text-center">
                    <TypeIcon className="w-5 h-5 text-orange-500 mb-1"/>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">String</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-1">Text, Categories.<br/>Use for grouping.</span>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-900/50 flex flex-col items-center text-center">
                    <Calendar className="w-5 h-5 text-green-500 mb-1"/>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Date</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-1">Time objects.<br/>Use for timelines.</span>
                </div>
            </div>
        )
    }

    // 4. Builder Logic
    if (type === 'builder_guide') {
        return (
            <div className="my-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase text-gray-500">Chart Builder Logic</div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded text-center">
                        <div className="font-bold text-gray-700 dark:text-gray-200">X Axis</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Category / Time</div>
                        <div className="mt-2 bg-white dark:bg-gray-600 py-1 px-2 rounded text-xs border border-gray-200 dark:border-gray-500">Date</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400"/>
                    <div className="flex-1 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded text-center border border-indigo-100 dark:border-indigo-800">
                        <div className="font-bold text-indigo-700 dark:text-indigo-300">Y Series</div>
                        <div className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-1">Values to Measure</div>
                        <div className="mt-2 flex flex-col gap-1">
                            <div className="bg-white dark:bg-gray-800 py-1 px-2 rounded text-xs border border-indigo-200 dark:border-indigo-700">Revenue</div>
                            <div className="bg-white dark:bg-gray-800 py-1 px-2 rounded text-xs border border-indigo-200 dark:border-indigo-700">Cost</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[900px] h-[800px] flex overflow-hidden animate-pop-in border border-gray-200 dark:border-gray-700">
        
        {/* Sidebar Directory */}
        <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t.help}
            </h2>
            <p className="text-xs text-gray-400 mt-1">User Manual & Reference</p>
          </div>
          
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const topicKey = item.id as keyof typeof topics;
              const isActive = activeTopic === topicKey;
              const ItemIcon = item.icon;
              const topicTitle = topics[topicKey]?.title || item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTopic(topicKey)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-700' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <ItemIcon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                  {topicTitle}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto text-blue-500"/>}
                </button>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
             <div className="text-[10px] text-gray-400 text-center">
                DataStata.AI v2.2 Documentation
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-800 relative">
          <div className="flex items-center justify-end p-4 shrink-0 absolute top-0 right-0 z-10">
             <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Close Help"
             >
               <X className="w-5 h-5" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-10 scrollbar-thin">
            {topics[activeTopic] && (
                <>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {topics[activeTopic].title}
                    </h1>
                    <div className="w-12 h-1 bg-blue-500 rounded mb-6"></div>
                    
                    <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {topics[activeTopic].content.split('\n').map((line, idx) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <div key={idx} className="h-4"></div>;

                        // UI Preview Block
                        const uiMatch = trimmed.match(/^\[UI_PREVIEW:\s*(.*?)\]$/);
                        if (uiMatch) {
                            return <React.Fragment key={idx}>{renderUIPreview(uiMatch[1])}</React.Fragment>;
                        }

                        // Glossary/Term Definition (> **Term**: Def)
                        if (trimmed.startsWith('> **')) {
                            return (
                                <div key={idx} className="my-3 pl-4 border-l-4 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-r italic text-gray-600 dark:text-gray-400 text-xs">
                                     {trimmed.replace(/^> /, '').split(/(\*\*.*?\*\*)/).map((p, i) => 
                                        p.startsWith('**') ? <span key={i} className="text-gray-800 dark:text-gray-200 not-italic">{p.slice(2,-2)}</span> : p
                                     )}
                                </div>
                            )
                        }

                        // Header ###
                        if (trimmed.startsWith('###')) {
                            return (
                                <div key={idx} className="mt-8 mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                        {trimmed.replace(/^###\s*/, '')}
                                    </h3>
                                </div>
                            );
                        }

                        // Header #### (Sub-section)
                        if (trimmed.startsWith('####')) {
                            return (
                                <div key={idx} className="mt-4 mb-2">
                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                                        {trimmed.replace(/^####\s*/, '')}
                                    </h4>
                                </div>
                            );
                        }

                        // Bullets with Bold/Code support
                        if (trimmed.startsWith('•')) {
                            const content = trimmed.slice(1).trim();
                            const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g);
                            return (
                                <div key={idx} className="flex gap-3 mb-2 ml-1">
                                <span className="text-gray-300 mt-1.5">•</span>
                                <span className="text-gray-700 dark:text-gray-300">
                                    {parts.map((p, i) => {
                                    if (p.startsWith('**') && p.endsWith('**')) {
                                        return <strong key={i} className="text-gray-900 dark:text-gray-100 font-semibold">{p.slice(2, -2)}</strong>;
                                    }
                                    if (p.startsWith('`') && p.endsWith('`')) {
                                        return <code key={i} className="bg-gray-100 dark:bg-gray-700 text-pink-600 dark:text-pink-400 px-1 py-0.5 rounded font-mono text-xs border border-gray-200 dark:border-gray-600">{p.slice(1, -1)}</code>;
                                    }
                                    return p;
                                    })}
                                </span>
                                </div>
                            )
                        }
                        
                        // Normal paragraph with bold and code
                        const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
                        return (
                        <p key={idx} className="mb-3">
                            {parts.map((part, i) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={i} className="text-gray-900 dark:text-gray-100 font-semibold">{part.slice(2, -2)}</strong>;
                                }
                                if (part.startsWith('`') && part.endsWith('`')) {
                                    return <code key={i} className="bg-gray-100 dark:bg-gray-700 text-pink-600 dark:text-pink-400 px-1 py-0.5 rounded font-mono text-xs border border-gray-200 dark:border-gray-600">{part.slice(1, -1)}</code>
                                }
                                return part;
                            })}
                        </p>
                        )
                    })}
                    </div>
                </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
