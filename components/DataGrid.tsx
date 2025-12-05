import React from 'react';
import { DataRow, VariableSummary } from '../types';
import { X } from 'lucide-react';

interface DataGridProps {
  data: DataRow[];
  summaries: VariableSummary[];
  onClose: () => void;
}

export const DataGrid: React.FC<DataGridProps> = ({ data, summaries, onClose }) => {
  // Simple virtualization or pagination strategy: Just show first 100 rows for MVP performance
  const displayData = data.slice(0, 100);

  return (
    <div className="absolute inset-0 z-20 bg-white flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-800">Data Editor (Browse)</h2>
            <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-600">
                Displaying {displayData.length} of {data.length} rows
            </span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50 w-12 text-center">
                #
              </th>
              {summaries.map((col) => (
                <th key={col.name} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 border-l">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50 transition-colors">
                <td className="px-4 py-2 whitespace-nowrap text-gray-400 font-mono text-xs text-center border-r border-gray-100">
                    {idx + 1}
                </td>
                {summaries.map((col) => (
                  <td key={col.name} className="px-4 py-2 whitespace-nowrap text-gray-700 border-r border-gray-100 last:border-r-0">
                    {row[col.name] !== null && row[col.name] !== undefined ? String(row[col.name]) : <span className="text-gray-300">.</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 100 && (
            <div className="p-4 text-center text-gray-500 italic text-sm">
                Showing first 100 rows. Use console commands to analyze full dataset.
            </div>
        )}
      </div>
    </div>
  );
};