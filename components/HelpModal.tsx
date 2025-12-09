
import React, { useState } from 'react';
import { X, Book, Database, Terminal, Sparkles, PieChart, BarChart2, Activity } from 'lucide-react';
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
    { id: 'data', icon: Database },
    { id: 'commands', icon: Terminal },
    { id: 'ai', icon: Sparkles },
    { id: 'viz', icon: PieChart },
  ];

  const renderUIPreview = (type: string) => {
    if (type === 'console_intro') {
      return (
        <div className="my-4 bg-gray-900 rounded-lg p-4 font-mono text-xs shadow-lg border border-gray-700">
           <div className="text-blue-400 mb-2 font-bold">DataStata.AI 2.2 (MP)</div>
           <div className="text-gray-300">. summarize price</div>
           <div className="text-gray-100 mt-2">
             <div className="flex border-b border-gray-700 pb-1 mb-1 font-bold">
                <span className="w-16">Variable</span>
                <span className="w-12 text-right">Obs</span>
                <span className="w-16 text-right">Mean</span>
                <span className="w-16 text-right">Std. Dev.</span>
             </div>
             <div className="flex">
                <span className="w-16">price</span>
                <span className="w-12 text-right">74</span>
                <span className="w-16 text-right">6165.2</span>
                <span className="w-16 text-right">2949.5</span>
             </div>
           </div>
        </div>
      );
    }
    if (type === 'command_summarize') {
        return (
            <div className="my-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md border-l-4 border-blue-500 font-mono text-xs">
                <span className="text-blue-600 dark:text-blue-300 font-bold">. summarize price mpg</span><br/>
                <span className="text-gray-500 dark:text-gray-400">... Output Table ...</span>
            </div>
        )
    }
    if (type === 'ai_regression') {
        return (
            <div className="my-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 text-xs font-mono shadow-sm">
                <div className="text-gray-500 mb-1 italic">// AI Response Simulation</div>
                <div className="text-gray-800 dark:text-gray-200">
                    <div>Source |       SS       df       MS</div>
                    <div>-------+------------------------------</div>
                    <div> Model |  317254682     2  1.5863e+08</div>
                    <div> Residual|  270775312    71  3813736.79</div>
                    <div>-------+------------------------------</div>
                    <div> Total |  588029994    73  8055205.40</div>
                </div>
            </div>
        )
    }
    if (type === 'chart_example') {
        return (
            <div className="my-4 h-32 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-2 left-2 flex gap-2">
                    <span className="h-4 w-12 bg-gray-200 dark:bg-gray-600 rounded"></span>
                    <span className="h-4 w-16 bg-blue-200 dark:bg-blue-800 rounded"></span>
                </div>
                <div className="flex items-end gap-1 h-16">
                    {[40, 60, 30, 80, 50, 70, 45].map((h, i) => (
                        <div key={i} className="w-3 bg-blue-500 rounded-t" style={{height: `${h}%`}}></div>
                    ))}
                </div>
            </div>
        )
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[850px] h-[700px] flex overflow-hidden animate-pop-in border border-gray-200 dark:border-gray-700">
        
        {/* Sidebar Directory */}
        <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t.help}
            </h2>
          </div>
          
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const topicKey = item.id as keyof typeof topics;
              const isActive = activeTopic === topicKey;
              const ItemIcon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTopic(topicKey)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <ItemIcon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                  {topics[topicKey].title}
                </button>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-center text-gray-400">
            DataStata.AI Documentation
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-end p-4 shrink-0">
             <button 
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
             >
               <X className="w-6 h-6" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-0 scrollbar-thin">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              {topics[activeTopic].title}
            </h1>
            
            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {topics[activeTopic].content.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={idx} className="h-4"></div>;

                // UI Preview Block
                const uiMatch = trimmed.match(/^\[UI_PREVIEW:\s*(.*?)\]$/);
                if (uiMatch) {
                    return <React.Fragment key={idx}>{renderUIPreview(uiMatch[1])}</React.Fragment>;
                }

                // Header ###
                if (trimmed.startsWith('###')) {
                    return <h3 key={idx} className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">{trimmed.replace(/^###\s*/, '')}</h3>
                }

                // Bullets with Bold support
                if (trimmed.startsWith('•')) {
                   const parts = line.split(/(\*\*.*?\*\*)/g);
                   return (
                     <div key={idx} className="flex gap-2 mb-2 ml-2">
                       <span className="text-blue-500 mt-1">•</span>
                       <span>
                         {parts.map((p, i) => {
                           if (p.startsWith('**') && p.endsWith('**')) {
                             return <strong key={i} className="text-gray-900 dark:text-gray-100 font-semibold">{p.slice(2, -2)}</strong>;
                           }
                           // Code inside bullet
                           const codeParts = p.split(/(`.*?`)/g);
                           if (codeParts.length > 1) {
                               return codeParts.map((cp, cpi) => 
                                   (cp.startsWith('`') && cp.endsWith('`')) 
                                   ? <code key={`${i}-${cpi}`} className="bg-gray-100 dark:bg-gray-700 text-pink-600 dark:text-pink-400 px-1 py-0.5 rounded font-mono text-xs">{cp.slice(1, -1)}</code> 
                                   : cp
                               );
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
                  <p key={idx} className="mb-2">
                     {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                             return <strong key={i} className="text-gray-900 dark:text-gray-100 font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        if (part.startsWith('`') && part.endsWith('`')) {
                            return <code key={i} className="bg-gray-100 dark:bg-gray-700 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded font-mono text-xs">{part.slice(1, -1)}</code>
                        }
                        return part;
                     })}
                  </p>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
