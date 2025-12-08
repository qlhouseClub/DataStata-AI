
export interface DataRow {
  [key: string]: string | number | null;
}

export interface VariableSummary {
  name: string;
  type: 'number' | 'string' | 'date';
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  distinct?: number;
  missing: number;
  sample: any[];
}

export enum LogType {
  COMMAND = 'COMMAND',
  RESPONSE_TEXT = 'RESPONSE_TEXT',
  RESPONSE_CHART = 'RESPONSE_CHART',
  ERROR = 'ERROR',
  SYSTEM = 'SYSTEM'
}

export interface SeriesConfig {
  dataKey: string;
  label?: string;
  color?: string;
  filter?: {
    column: string;
    value: string | number;
  };
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'scatter' | 'area' | 'pie' | 'radar' | 'donut' | 'treemap';
  title: string;
  xAxisKey: string;
  // Global filter applied to the X-axis domain (and thus the whole chart)
  xFilter?: {
    column: string;
    value: string | number;
  };
  series: SeriesConfig[]; 
  description?: string;
  groupBy?: string; // Color by
  sizeBy?: string;  // Size by (for scatter)
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: LogType;
  content: string | ChartConfig;
}

export interface SheetData {
  data: DataRow[];
  columns: string[];
  summaries: VariableSummary[];
}

export interface Dataset {
  id: string;
  name: string;
  sheets: { [sheetName: string]: SheetData };
  activeSheetName: string;
}

export type Language = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'ko';
export type Theme = 'light' | 'dark';

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

// Helper to get active sheet data easily
export const getActiveSheet = (dataset: Dataset): SheetData => {
  return dataset.sheets[dataset.activeSheetName];
};
