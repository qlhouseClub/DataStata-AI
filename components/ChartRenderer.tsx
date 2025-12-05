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

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const ChartRenderer: React.FC<ChartRendererProps> = ({ config, data }) => {
  // Limit data points for performance if too large
  const displayData = data.length > 2000 ? data.slice(0, 2000) : data;

  // Normalize yAxisKey to array for unified handling
  const yKeys = Array.isArray(config.yAxisKey) ? config.yAxisKey : [config.yAxisKey];

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
            {yKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
            ))}
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
            {yKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                dot={false} 
                strokeWidth={2} 
              />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={displayData}>
             <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yKeys.map((key, index) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                fill={COLORS[index % COLORS.length]} 
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );
      case 'scatter':
        // Scatter usually compares 2 variables directly, but we can support multiple series if needed
        // For simplicity, we stick to the first Y key vs X key for scatter basic behavior, 
        // or iterate if we wanted multiple scatter groups sharing an X.
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey={config.xAxisKey} name={config.xAxisKey} />
            <YAxis type="number" dataKey={yKeys[0]} name={yKeys[0]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name={`${config.xAxisKey} vs ${yKeys[0]}`} data={displayData} fill={COLORS[0]} />
          </ScatterChart>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className="mb-2">
         <h3 className="text-lg font-semibold text-gray-800 leading-tight">{config.title}</h3>
         {config.description && <p className="text-xs text-gray-500">{config.description}</p>}
      </div>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};