import React, { useEffect, useState } from 'react';
import { Brain, Database, Sparkles, FileSpreadsheet, Search, BarChart3, LineChart } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { Language } from '../types';

interface LoadingModalProps {
  language: Language;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({ language }) => {
  const t = getTranslation(language);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { text: "Ingesting Data Frames...", icon: FileSpreadsheet },
    { text: "Profiling Variables & Types...", icon: Database },
    { text: "Calculating Statistics (Mean, Max, Dist)...", icon: Search },
    { text: "Detecting Trends & Anomalies...", icon: LineChart },
    { text: "Structuring Strategic Insights...", icon: Brain },
    { text: "Rendering Visualizations...", icon: BarChart3 },
    { text: "Finalizing Report...", icon: Sparkles },
  ];

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        // Non-linear progress for realism
        const increment = Math.max(0.5, (100 - prev) / 40); 
        return prev + increment;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Cycle through steps based on progress thresholds
    const newIndex = Math.floor((progress / 100) * steps.length);
    setStepIndex(Math.min(newIndex, steps.length - 1));
  }, [progress]);

  const CurrentIcon = steps[stepIndex].icon;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-white/90 dark:bg-gray-900/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md p-8 flex flex-col items-center text-center">
        
        {/* Bouncing Icon Animation */}
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
            <div className="relative w-20 h-20 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-blue-100 dark:border-blue-900 flex items-center justify-center">
                <CurrentIcon className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-bounce" />
            </div>
            
            {/* Floating particles */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
            <Brain className="absolute -bottom-2 -left-2 w-5 h-5 text-pink-400 animate-pulse delay-75" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            AI Analyzing...
        </h2>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 h-6 transition-all duration-300">
            {steps[stepIndex].text}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden">
            <div 
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
        
        <div className="flex justify-between w-full text-xs font-mono text-gray-400">
            <span>{Math.round(progress)}%</span>
            <span>Gemini 2.5 Pro</span>
        </div>
      </div>
    </div>
  );
};