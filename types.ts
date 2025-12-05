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
  yAxisKey: string | string[]; // Single key or multiple for multi-line
  description?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: LogType;
  content: string | ChartConfig;
}

export interface DatasetState {
  fileName: string | null;
  data: DataRow[];
  columns: string[];
  summaries: VariableSummary[];
}