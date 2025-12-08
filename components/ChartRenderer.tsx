
import React, { useMemo } from 'react';
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
  Area,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap
} from 'recharts';
import { ChartConfig, DataRow, Theme } from '../types';
import { PRESET_PALETTE } from '../utils/colorUtils';

interface ChartRendererProps {
  config: ChartConfig;
  data: DataRow[];
  theme?: Theme;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ config, data, theme = 'light' }) => {
  const rawData = data.length > 2000 ? data.slice(0, 2000) : data;

  const chartData = useMemo(() => {
    let filteredData = rawData;
    if (config.xFilter) {
        filteredData = rawData.filter(row => {
            const rowVal = row[config.xFilter!.column];
            return String(rowVal) === String(config.xFilter!.value);
        });
    }

    return filteredData.map(row => {
      const newRow: any = { ...row };
      config.series.forEach(s => {
        const chartKey = s.label || s.dataKey;
        if (s.filter) {
           const rowVal = row[s.filter.column];
           if (String(rowVal) === String(s.filter.value)) {
               newRow[chartKey] = row[s.dataKey];
           } else {
               newRow[chartKey] = null; 
           }
        } else {
           if (chartKey !== s.dataKey) {
               newRow[chartKey] = row[s.dataKey];
           }
        }
      });
      return newRow;
    });
  }, [rawData, config.series, config.xFilter]);

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const bgColor = isDark ? '#1f2937' : '#ffffff';

  const renderChart = () => {
    const commonProps = {
        data: chartData,
        margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    const axisStyle = { fontSize: 12, fill: axisColor };
    const legendStyle = { fontSize: 13, color: textColor };
    const tooltipStyle = { 
        fontSize: 12, 
        borderRadius: '6px', 
        border: isDark ? '1px solid #374151' : 'none', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        backgroundColor: bgColor,
        color: textColor
    };

    switch (config.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey={config.xAxisKey} tick={axisStyle} stroke={axisColor} />
            <YAxis tick={axisStyle} stroke={axisColor} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={legendStyle} />
            {config.series.map((s, index) => (
              <Bar 
                key={s.label || s.dataKey} 
                dataKey={s.label || s.dataKey} 
                fill={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]} 
                name={s.label || s.dataKey}
              />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey={config.xAxisKey} tick={axisStyle} stroke={axisColor} />
            <YAxis tick={axisStyle} stroke={axisColor} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={legendStyle} />
            {config.series.map((s, index) => (
              <Line 
                key={s.label || s.dataKey} 
                type="monotone" 
                dataKey={s.label || s.dataKey} 
                stroke={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]} 
                dot={false} 
                strokeWidth={2}
                name={s.label || s.dataKey}
                connectNulls
              />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey={config.xAxisKey} tick={axisStyle} stroke={axisColor} />
            <YAxis tick={axisStyle} stroke={axisColor} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={legendStyle} />
            {config.series.map((s, index) => (
              <Area 
                key={s.label || s.dataKey} 
                type="monotone" 
                dataKey={s.label || s.dataKey} 
                stroke={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]} 
                fill={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]} 
                fillOpacity={0.3}
                name={s.label || s.dataKey}
                connectNulls
              />
            ))}
          </AreaChart>
        );
      case 'scatter':
        return (
          <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis type="category" dataKey={config.xAxisKey} name={config.xAxisKey} tick={axisStyle} stroke={axisColor} />
            <YAxis type="number" tick={axisStyle} stroke={axisColor} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
            <Legend wrapperStyle={legendStyle} />
            {config.series.map((s, index) => (
                <Scatter 
                    key={s.label || s.dataKey}
                    name={s.label || s.dataKey} 
                    data={chartData} 
                    fill={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]} 
                    line={false}
                />
            ))}
          </ScatterChart>
        );
      case 'pie':
      case 'donut':
        const pieSeries = config.series[0];
        if (!pieSeries) return <div className="flex items-center justify-center h-full text-gray-400">No series data</div>;
        const innerRadius = config.type === 'donut' ? '50%' : '0%';
        
        return (
            <PieChart>
                <Pie
                    data={chartData}
                    dataKey={pieSeries.label || pieSeries.dataKey}
                    nameKey={config.xAxisKey}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius="80%"
                    fill={pieSeries.color || PRESET_PALETTE[0]}
                    label
                    stroke={isDark ? '#1f2937' : '#fff'}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRESET_PALETTE[index % PRESET_PALETTE.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={legendStyle} />
            </PieChart>
        );
      case 'radar':
        return (
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey={config.xAxisKey} tick={axisStyle} />
                <PolarRadiusAxis angle={30} domain={['auto', 'auto']} tick={axisStyle} stroke={axisColor}/>
                {config.series.map((s, index) => (
                    <Radar
                        key={s.label || s.dataKey}
                        name={s.label || s.dataKey}
                        dataKey={s.label || s.dataKey}
                        stroke={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]}
                        fill={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]}
                        fillOpacity={0.5}
                    />
                ))}
                <Legend wrapperStyle={legendStyle} />
                <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
        );
      case 'treemap':
        const tmSeries = config.series[0];
        if (!tmSeries) return <div className="flex items-center justify-center h-full text-gray-400">No series data</div>;

        return (
            <ResponsiveContainer width="100%" height="100%">
                <Treemap
                    data={chartData}
                    dataKey={tmSeries.label || tmSeries.dataKey}
                    nameKey={config.xAxisKey}
                    stroke={isDark ? '#1f2937' : '#fff'}
                    fill={tmSeries.color || PRESET_PALETTE[0]}
                    content={<CustomTreemapContent colors={PRESET_PALETTE}/>}
                >
                    <Tooltip contentStyle={tooltipStyle} />
                </Treemap>
            </ResponsiveContainer>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-gray-800 transition-colors duration-200">
      <div className="mb-2 shrink-0">
         <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-tight">{config.title}</h3>
         {config.description && <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>}
      </div>
      <div className="flex-1 min-h-0 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CustomTreemapContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, colors } = props;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: colors[index % colors.length],
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
          className="stroke-white dark:stroke-gray-800"
        />
        {width > 30 && height > 30 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
          >
            {name}
          </text>
        )}
      </g>
    );
};
