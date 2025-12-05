
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

export interface ChartConfig {
  type: 'bar' | 'line' | 'scatter' | 'area' | 'pie';
  title: string;
  xAxisKey: string;
  yAxisKey: string | string[]; 
  description?: string;
  // Multi-dimensional additions
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

// Helper to get active sheet data easily
export const getActiveSheet = (dataset: Dataset): SheetData => {
  return dataset.sheets[dataset.activeSheetName];
};
