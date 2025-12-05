import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ChartConfig, DataRow } from '../types';

interface ChartRendererProps {
  config: ChartConfig;
  data: DataRow[];
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ config, data }) => {
  // Limit data points for performance if too large
  const displayData = data.length > 2000 ? data.slice(0, 2000) : data;

  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return (
          <BarChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={config.yAxisKey} fill="#3b82f6" />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={config.yAxisKey} stroke="#3b82f6" dot={false} strokeWidth={2} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={displayData}>
             <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxisKey} />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey={config.yAxisKey} stroke="#3b82f6" fill="#93c5fd" />
          </AreaChart>
        );
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey={config.xAxisKey} name={config.xAxisKey} />
            <YAxis type="number" dataKey={config.yAxisKey} name={config.yAxisKey as string} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name={`${config.xAxisKey} vs ${config.yAxisKey}`} data={displayData} fill="#3b82f6" />
          </ScatterChart>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{config.title}</h3>
      {config.description && <p className="text-sm text-gray-500 mb-4">{config.description}</p>}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};