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

// Robust Custom Tooltip that iterates config.series to ensure perfect legend alignment
const CustomTooltip = ({ active, payload, label, theme, config }: any) => {
  if (active && payload && payload.length) {
    const isDark = theme === 'dark';
    
    // Determine which items to show
    let itemsToShow = [];

    if (['pie', 'donut', 'treemap'].includes(config.type)) {
        // For single-series/relational charts, rely on Recharts' active payload directly
        itemsToShow = payload.map((entry: any) => ({
            name: entry.name,
            value: entry.value,
            color: entry.fill || entry.color
        }));
    } else {
        // For Axis-based charts (Line, Bar, Area, Scatter), we iterate the CONFIG
        // This ensures the tooltip order matches the legend and handles missing payload items gracefully.
        itemsToShow = config.series.map((s: any, index: number) => {
             const uniqueKey = `__series_${index}`;
             const displayLabel = s.label || s.dataKey;

             // 1. Find the specific payload item for this series
             //    Recharts payload items usually match by dataKey (Bar/Line) or name (Scatter)
             const pItem = payload.find((p: any) => 
                p.dataKey === uniqueKey || 
                p.name === displayLabel || 
                p.name === s.dataKey
             );

             // 2. Resolve the Value
             let value: any = undefined;

             if (pItem) {
                 // Scatter charts often return value as [x, y] array
                 if (Array.isArray(pItem.value) && pItem.value.length === 2) {
                     value = pItem.value[1]; 
                 } else {
                     value = pItem.value;
                 }
             }

             // 3. Fallback to Raw Data (activeRow)
             //    If pItem didn't provide a valid value (or wasn't found), look in the raw data object.
             //    We prioritize the payload object attached to pItem (specific point), 
             //    fallback to payload[0].payload (shared row).
             if (value === undefined || value === null) {
                 const row = pItem?.payload || payload[0]?.payload;
                 if (row) {
                     // Try the mapped unique key first (respects filters)
                     if (row[uniqueKey] !== undefined && row[uniqueKey] !== null) {
                         value = row[uniqueKey];
                     }
                     // Fallback to original dataKey (if somehow mapped key is missing but data exists)
                     else if (row[s.dataKey] !== undefined && row[s.dataKey] !== null) {
                         value = row[s.dataKey];
                     }
                 }
             }

             // Attempt to get color from payload if active, otherwise fallback to config/preset
             const color = s.color || pItem?.color || pItem?.fill || pItem?.stroke || PRESET_PALETTE[index % PRESET_PALETTE.length];

             return {
                 name: displayLabel,
                 value: value,
                 color: color
             };
        });
    }
    
    return (
      <div className={`p-3 rounded-lg shadow-xl border text-xs z-50 transition-all duration-75 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`}>
        <p className={`font-bold mb-2 pb-1 border-b ${isDark ? 'text-gray-300 border-gray-700' : 'text-gray-600 border-gray-100'}`}>
            {label || (payload[0]?.payload && config.xAxisKey && payload[0].payload[config.xAxisKey]) || ''}
        </p>
        <div className="space-y-1.5">
          {itemsToShow.map((item: any, index: number) => {
            let displayValue = 'N/A';
            
            if (typeof item.value === 'number') {
                displayValue = item.value.toLocaleString(undefined, { maximumFractionDigits: 2 });
            } else if (typeof item.value === 'string') {
                displayValue = item.value;
            } else if (item.value !== null && item.value !== undefined) {
                displayValue = String(item.value);
            }

            return (
                <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div 
                        className="w-2 h-2 rounded-full shadow-sm" 
                        style={{ backgroundColor: item.color || '#ccc' }}
                    />
                    <span className="font-medium opacity-90 truncate max-w-[120px]" title={item.name}>
                        {item.name}:
                    </span>
                </div>
                <span className="font-mono font-bold">
                    {displayValue}
                </span>
                </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

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

    const isAxisChart = ['line', 'bar', 'area', 'radar'].includes(config.type);

    // SCATTER, PIE, TREEMAP, DONUT: Use Flat Mapping (No Aggregation)
    // Scatter needs individual points. Pie needs separate slices.
    if (!isAxisChart) {
        return filteredData.map(row => {
            const newRow: any = { ...row };
            config.series.forEach((s, index) => {
                const uniqueKey = `__series_${index}`;
                if (s.filter) {
                    const rowVal = row[s.filter.column];
                    if (String(rowVal) === String(s.filter.value)) {
                        newRow[uniqueKey] = row[s.dataKey];
                    } else {
                        newRow[uniqueKey] = null;
                    }
                } else {
                    newRow[uniqueKey] = row[s.dataKey];
                }
            });
            return newRow;
        });
    }

    // LINE, BAR, AREA, RADAR: Pivot/Group by X-Axis Key
    // This allows multiple rows (e.g. Type A and Type B) with the same Date to be merged into one X-Axis point.
    // This fixes the tooltip issue where only the 'active' row's data was shown (leading to N/A for others).
    const groupedMap = new Map<string, any>();

    filteredData.forEach(row => {
        const xVal = row[config.xAxisKey];
        if (xVal === null || xVal === undefined) return;

        const xKey = String(xVal);

        if (!groupedMap.has(xKey)) {
            // Initialize with the X value and row properties
            // Initialize all series keys to null to ensure structure exists
            const initObj: any = { ...row, [config.xAxisKey]: xVal };
            config.series.forEach((_, i) => initObj[`__series_${i}`] = null);
            groupedMap.set(xKey, initObj);
        }

        const combinedRow = groupedMap.get(xKey);

        config.series.forEach((s, index) => {
            const uniqueKey = `__series_${index}`;
            
            // Check Filter
            let matches = true;
            if (s.filter) {
                const rowFilterVal = row[s.filter.column];
                matches = String(rowFilterVal) === String(s.filter.value);
            }

            if (matches) {
                const val = row[s.dataKey];
                // Strict check to ensure 0 is treated as a valid value
                if (val !== undefined && val !== null && val !== '') {
                    combinedRow[uniqueKey] = val;
                }
            }
        });
    });

    let result = Array.from(groupedMap.values());

    // Auto-sort if the X-axis looks like a Date or Number
    if (result.length > 0) {
        const sampleX = result[0][config.xAxisKey];
        if (typeof sampleX === 'string' && !isNaN(Date.parse(sampleX)) && sampleX.length > 4) {
             result.sort((a, b) => new Date(a[config.xAxisKey]).getTime() - new Date(b[config.xAxisKey]).getTime());
        } else if (typeof sampleX === 'number') {
             result.sort((a, b) => a[config.xAxisKey] - b[config.xAxisKey]);
        }
    }

    return result;
  }, [rawData, config.series, config.xFilter, config.type, config.xAxisKey]);

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#d1d5db' : '#374151';

  const renderChart = () => {
    const commonProps = {
        data: chartData,
        margin: { top: 10, right: 10, left: 0, bottom: 0 }
    };

    const axisStyle = { fontSize: 11, fill: axisColor };
    const legendStyle = { fontSize: 12, color: textColor, paddingTop: '10px' };
    const tooltipProps = {
        content: <CustomTooltip theme={theme} config={config} />,
        cursor: { fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        filterNull: false // Key for showing all legend items
    };

    switch (config.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
            <XAxis dataKey={config.xAxisKey} tick={axisStyle} stroke={axisColor} tickLine={false} />
            <YAxis tick={axisStyle} stroke={axisColor} tickLine={false} axisLine={false} />
            <Tooltip {...tooltipProps} />
            <Legend wrapperStyle={legendStyle} />
            {config.series.map((s, index) => (
              <Bar 
                key={`bar-${index}`}
                dataKey={`__series_${index}`} // Use Unique Key
                fill={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]} 
                name={s.label || s.dataKey}
                animationDuration={500}
              />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
            <XAxis dataKey={config.xAxisKey} tick={axisStyle} stroke={axisColor} tickLine={false} />
            <YAxis tick={axisStyle} stroke={axisColor} tickLine={false} axisLine={false} />
            <Tooltip {...tooltipProps} />
            <Legend wrapperStyle={legendStyle} />
            {config.series.map((s, index) => (
              <Line 
                key={`line-${index}`}
                type="monotone" 
                dataKey={`__series_${index}`} // Use Unique Key
                stroke={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]} 
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                strokeWidth={2}
                name={s.label || s.dataKey}
                connectNulls
                animationDuration={500}
              />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
            <XAxis dataKey={config.xAxisKey} tick={axisStyle} stroke={axisColor} tickLine={false} />
            <YAxis tick={axisStyle} stroke={axisColor} tickLine={false} axisLine={false} />
            <Tooltip {...tooltipProps} />
            <Legend wrapperStyle={legendStyle} />
            {config.series.map((s, index) => (
              <Area 
                key={`area-${index}`}
                type="monotone" 
                dataKey={`__series_${index}`} // Use Unique Key
                stroke={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]} 
                fill={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]} 
                fillOpacity={0.3}
                name={s.label || s.dataKey}
                connectNulls
                animationDuration={500}
              />
            ))}
          </AreaChart>
        );
      case 'scatter':
        return (
          <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} />
            <XAxis 
                type={config.xType || 'category'} 
                dataKey={config.xAxisKey} 
                name={config.xAxisKey} 
                tick={axisStyle} 
                stroke={axisColor} 
                domain={['auto', 'auto']}
                tickLine={false}
            />
            <YAxis type="number" tick={axisStyle} stroke={axisColor} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip theme={theme} config={config} />} />
            <Legend wrapperStyle={legendStyle} />
            {config.series.map((s, index) => (
                <Scatter 
                    key={`scatter-${index}`}
                    name={s.label || s.dataKey} 
                    // Explicitly map Y using the unique key for this series
                    data={chartData.map(d => ({ ...d, x: d[config.xAxisKey], y: d[`__series_${index}`] }))} 
                    fill={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]} 
                    line={false}
                    animationDuration={500}
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
                    dataKey="__series_0" // Always use first series unique key
                    nameKey={config.xAxisKey}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius="80%"
                    fill={pieSeries.color || PRESET_PALETTE[0]}
                    label
                    stroke={isDark ? '#1f2937' : '#fff'}
                    animationDuration={500}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRESET_PALETTE[index % PRESET_PALETTE.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip theme={theme} config={config} />} />
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
                        key={`radar-${index}`}
                        name={s.label || s.dataKey}
                        dataKey={`__series_${index}`}
                        stroke={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]}
                        fill={s.color || PRESET_PALETTE[index % PRESET_PALETTE.length]}
                        fillOpacity={0.5}
                        animationDuration={500}
                    />
                ))}
                <Legend wrapperStyle={legendStyle} />
                <Tooltip {...tooltipProps} />
            </RadarChart>
        );
      case 'treemap':
        const tmSeries = config.series[0];
        if (!tmSeries) return <div className="flex items-center justify-center h-full text-gray-400">No series data</div>;

        return (
            <ResponsiveContainer width="100%" height="100%">
                <Treemap
                    data={chartData}
                    dataKey="__series_0"
                    nameKey={config.xAxisKey}
                    stroke={isDark ? '#1f2937' : '#fff'}
                    fill={tmSeries.color || PRESET_PALETTE[0]}
                    content={<CustomTreemapContent colors={PRESET_PALETTE}/>}
                    animationDuration={500}
                >
                    <Tooltip content={<CustomTooltip theme={theme} config={config} />} />
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