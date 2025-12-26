
import React, { useState } from 'react';
import { FullReport, Dataset, Theme, Language, ReportSection, DataRow, ChartConfig } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ChartRenderer } from './ChartRenderer';
import { X, FileCode, AlertTriangle, TrendingUp, Info, ShieldCheck, TrendingDown, Lightbulb, Table, Languages } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { PRESET_PALETTE } from '../utils/colorUtils';

interface ReportViewProps {
  report: FullReport;
  dataset: Dataset;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
}

const langLabels: Record<string, string> = {
    'en': 'English',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'ja': '日本語',
    'ko': '한국어'
};

export const ReportView: React.FC<ReportViewProps> = ({ report, dataset, onClose, language, onLanguageChange, theme }) => {
  const t = getTranslation(language);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  /**
   * IMPORTANT:
   * We now transform the `tableData` (which comes from the deterministic pre-computation)
   * into the format required for the chart. 
   */
  const getChartDataFromTable = (section: ReportSection): DataRow[] => {
      if (!section.tableData || !section.tableData.headers || !section.tableData.rows) return [];
      
      const { headers, rows } = section.tableData;
      
      return rows.map(rowVals => {
          const rowObj: DataRow = {};
          headers.forEach((h, i) => {
              const val = rowVals[i];
              // Attempt to parse numbers, keep strings as is
              if (val !== null && val !== undefined && val !== '') {
                   // Remove commas for parsing
                   const cleanVal = String(val).replace(/,/g, '');
                   if (!isNaN(Number(cleanVal))) {
                       rowObj[h] = Number(cleanVal);
                   } else {
                       rowObj[h] = val;
                   }
              } else {
                  rowObj[h] = null;
              }
          });
          return rowObj;
      });
  };

  // Helper to Convert Recharts Config to ECharts Option for Export
  const getEChartsOption = (config: ChartConfig, data: DataRow[]) => {
      const isCategoryAxis = ['bar', 'line', 'area'].includes(config.type);
      
      // Extract Categories (X Axis)
      const categories = isCategoryAxis ? data.map(d => d[config.xAxisKey]) : [];
      
      const series = config.series.map((s, i) => {
          const color = s.color || PRESET_PALETTE[i % PRESET_PALETTE.length];
          const seriesData = data.map(d => d[s.dataKey]);

          // Base Series Config
          const base: any = {
              name: s.label || s.dataKey,
              data: seriesData,
              itemStyle: { color: color },
          };

          if (config.type === 'line') {
              base.type = 'line';
              base.smooth = true;
              base.symbolSize = 6;
          } else if (config.type === 'bar') {
              base.type = 'bar';
              base.barMaxWidth = 50;
          } else if (config.type === 'area') {
              base.type = 'line';
              base.areaStyle = { opacity: 0.3 };
              base.smooth = true;
          } else if (config.type === 'donut' || config.type === 'pie') {
               // Pie requires data format { value, name }
               base.type = 'pie';
               base.radius = config.type === 'donut' ? ['40%', '70%'] : '70%';
               base.data = data.map((d, idx) => ({
                   value: d[s.dataKey],
                   name: d[config.xAxisKey],
                   itemStyle: { color: PRESET_PALETTE[idx % PRESET_PALETTE.length] }
               }));
               // Remove category data for pie
               delete base.itemStyle; 
          }

          return base;
      });

      const option: any = {
          title: { text: config.title, left: 'center', textStyle: { fontSize: 14 } },
          tooltip: { trigger: (config.type === 'pie' || config.type === 'donut') ? 'item' : 'axis' },
          legend: { bottom: 0 },
          grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
          series: series
      };

      if (isCategoryAxis) {
          option.xAxis = { type: 'category', data: categories, boundaryGap: config.type === 'bar' };
          option.yAxis = { type: 'value' };
      }

      return option;
  };

  const handleExportHTML = () => {
    // 1. Clone the DOM content to manipulate it for export
    const contentNode = document.getElementById('report-content');
    if (!contentNode) return;
    
    // Deep clone so we don't affect the live view
    const clone = contentNode.cloneNode(true) as HTMLElement;

    // 2. Prepare ECharts Data injection
    const echartsInjections: { id: string, option: any }[] = [];
    
    // Find all chart containers in the CLONE
    // Note: The order of querySelectorAll matches the order of report.sections if rendered linearly
    const chartContainers = clone.querySelectorAll('.chart-container');
    
    let chartIndex = 0;
    report.sections.forEach((section, idx) => {
        // Check if this section actually rendered a chart in the DOM
        const data = getChartDataFromTable(section);
        const hasChart = section.chartConfig && data.length > 0;
        
        if (hasChart) {
            const container = chartContainers[chartIndex];
            if (container) {
                const chartId = `echart-export-${idx}`;
                
                // Replace the Recharts container content with a simple clean div for ECharts
                container.innerHTML = `<div id="${chartId}" style="width: 100%; height: 400px;"></div>`;
                // Remove extra styling that might conflict
                container.removeAttribute('class');
                container.setAttribute('style', 'margin-top: 2rem; padding: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem;');

                // Generate the Option
                const option = getEChartsOption(section.chartConfig!, data);
                echartsInjections.push({ id: chartId, option });
                
                chartIndex++;
            }
        }
    });

    // 3. Construct the full HTML
    const htmlBody = clone.innerHTML;
    
    const html = `
      <!DOCTYPE html>
      <html lang="${language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${report.title}</title>
        <!-- Inject Tailwind via CDN for perfect styling fidelity -->
        <script src="https://cdn.tailwindcss.com"></script>
        <!-- Inject ECharts for interactive charts -->
        <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; background-color: #f9fafb; padding: 40px; }
          .container { max-width: 900px; margin: 0 auto; background: white; padding: 48px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
          /* Markdown specific overrides if needed */
          ul { list-style-type: none; }
        </style>
      </head>
      <body>
        <div class="container">
           <div class="mb-8 border-b border-gray-200 pb-6">
              <h1 class="text-4xl font-extrabold text-gray-900 mb-2">${report.title}</h1>
              <p class="text-gray-500 text-sm">Generated on ${report.date} • Dataset: ${dataset.name}</p>
           </div>
           
           ${htmlBody}

           <div class="mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
              Generated by DataStata.AI
           </div>
        </div>

        <script>
          // Initialize ECharts
          const chartData = ${JSON.stringify(echartsInjections)};
          
          window.onload = function() {
              chartData.forEach(item => {
                  const dom = document.getElementById(item.id);
                  if (dom) {
                      const myChart = echarts.init(dom);
                      myChart.setOption(item.option);
                      
                      // Handle resize
                      window.addEventListener('resize', function() {
                          myChart.resize();
                      });
                  }
              });
          };
        </script>
      </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 overflow-y-auto animate-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between print:hidden">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                 <FileCode className="w-5 h-5 text-purple-600 dark:text-purple-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t.reportView}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{dataset.name} • {report.date}</p>
             </div>
         </div>
         <div className="flex items-center gap-3">
             {/* Language Switcher */}
             <div className="relative">
                <button 
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-gray-600"
                >
                    <Languages className="w-4 h-4" />
                    <span>{langLabels[language]}</span>
                </button>
                
                {isLangMenuOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsLangMenuOpen(false)} 
                        />
                        <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                            {Object.keys(langLabels).map(l => (
                                <button 
                                    key={l}
                                    onClick={() => {
                                        onLanguageChange(l as Language);
                                        setIsLangMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${l === language ? 'text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                    {langLabels[l]}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

             <button 
                onClick={handleExportHTML}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-gray-600"
             >
                <FileCode className="w-4 h-4" />
                {t.exportHtml}
             </button>
             <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
             >
                <X className="w-6 h-6" />
             </button>
         </div>
      </div>

      {/* Report Content Container */}
      <div className="max-w-5xl mx-auto p-8 md:p-12" id="report-content">
         {/* Title Section */}
         <div className="text-left mb-12 border-b border-gray-200 dark:border-gray-700 pb-8">
             <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                 {report.title}
             </h1>
             <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Executive Summary</h4>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                    {report.summary}
                </p>
             </div>
         </div>

         {/* Sections */}
         <div className="space-y-20">
             {report.sections.map((section, idx) => {
                 // Determine Styling based on Insight Type
                 let borderColor = "border-gray-200 dark:border-gray-700";
                 let icon = <Info className="w-6 h-6 text-gray-400" />;
                 let titleColor = "text-gray-800 dark:text-gray-100";
                 let bgAccent = "";

                 switch(section.insightType) {
                     case 'trend':
                         borderColor = "border-blue-400 dark:border-blue-500";
                         icon = <TrendingUp className="w-6 h-6 text-blue-500" />;
                         titleColor = "text-blue-700 dark:text-blue-400";
                         bgAccent = "bg-blue-50/30 dark:bg-blue-900/10";
                         break;
                     case 'strength':
                         borderColor = "border-emerald-400 dark:border-emerald-500";
                         icon = <ShieldCheck className="w-6 h-6 text-emerald-500" />;
                         titleColor = "text-emerald-700 dark:text-emerald-400";
                         bgAccent = "bg-emerald-50/30 dark:bg-emerald-900/10";
                         break;
                     case 'anomaly':
                         borderColor = "border-amber-400 dark:border-amber-500";
                         icon = <AlertTriangle className="w-6 h-6 text-amber-500" />;
                         titleColor = "text-amber-700 dark:text-amber-400";
                         bgAccent = "bg-amber-50/30 dark:bg-amber-900/10";
                         break;
                     case 'weakness':
                         borderColor = "border-red-400 dark:border-red-500";
                         icon = <TrendingDown className="w-6 h-6 text-red-500" />;
                         titleColor = "text-red-700 dark:text-red-400";
                         bgAccent = "bg-red-50/30 dark:bg-red-900/10";
                         break;
                     case 'recommendation':
                         borderColor = "border-purple-400 dark:border-purple-500";
                         icon = <Lightbulb className="w-6 h-6 text-purple-500" />;
                         titleColor = "text-purple-700 dark:text-purple-400";
                         bgAccent = "bg-purple-50/30 dark:bg-purple-900/10";
                         break;
                 }

                 // Use data from TABLE, not raw dataset
                 const chartData = getChartDataFromTable(section);
                 const hasValidChart = section.chartConfig && chartData.length > 0;

                 return (
                     <div key={idx} className={`break-inside-avoid relative pl-8 border-l-4 ${borderColor} ${bgAccent} rounded-r-2xl p-8 transition-all hover:bg-opacity-70`}>
                         <div className="flex items-center gap-4 mb-6">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">{icon}</div>
                            <h3 className={`text-2xl font-bold ${titleColor} uppercase tracking-wide`}>{section.title}</h3>
                         </div>
                         
                         <div className="mb-8 prose dark:prose-invert max-w-none">
                            <MarkdownRenderer content={section.content} />
                         </div>

                         {/* Structured Data Table */}
                         {section.tableData && section.tableData.rows.length > 0 && (
                            <div className="my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                    <Table className="w-4 h-4 text-gray-400"/>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Key Data Points</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900/50 dark:text-gray-300">
                                            <tr>
                                                {section.tableData.headers.map((h, i) => (
                                                    <th key={i} className="px-6 py-3 font-semibold">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {section.tableData.rows.map((row, rIdx) => (
                                                <tr key={rIdx} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    {row.map((cell, cIdx) => (
                                                        <td key={cIdx} className="px-6 py-3 font-mono text-gray-600 dark:text-gray-300">
                                                            {cell}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                         )}

                         {hasValidChart && (
                             <div className="mt-8 h-[400px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 chart-container overflow-hidden ring-1 ring-black/5">
                                 <ChartRenderer 
                                    config={section.chartConfig!} 
                                    data={chartData} 
                                    theme={theme} 
                                 />
                                 <div className="text-center mt-4 text-xs text-gray-400 font-medium tracking-wide">
                                     Figure {idx + 1}: {section.chartConfig!.title}
                                 </div>
                             </div>
                         )}
                     </div>
                 );
             })}
         </div>
         
         <div className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 text-center flex flex-col items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">DS</div>
             <div className="text-sm text-gray-400 font-medium">Generated by DataStata.AI</div>
         </div>
      </div>
    </div>
  );
};
