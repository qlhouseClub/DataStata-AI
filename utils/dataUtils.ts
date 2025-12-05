import { DataRow, VariableSummary } from '../types';
import { read, utils } from 'xlsx';

export const parseExcel = (buffer: ArrayBuffer): DataRow[] => {
  try {
    const workbook = read(buffer, { type: 'array' });
    if (workbook.SheetNames.length === 0) return [];
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON. sheet_to_json treats the first row as headers by default.
    // defval: null ensures empty cells are null, similar to our CSV parser.
    const data = utils.sheet_to_json(worksheet, { defval: null }) as DataRow[];
    
    return data;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    return [];
  }
};

export const parseCSV = (csvText: string): DataRow[] => {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const data: DataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic regex for CSV splitting that handles quoted commas
    const currentLine = lines[i];
    const matches = currentLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || currentLine.split(','); 
    
    // Fallback split if regex fails or simple structure
    const values = matches ? matches : currentLine.split(',');

    if (values.length === headers.length) {
      const row: DataRow = {};
      headers.forEach((header, index) => {
        let value: string | number | null = values[index] ? values[index].trim().replace(/^"|"$/g, '') : null;
        
        // Attempt numeric conversion
        if (value !== null && value !== '' && !isNaN(Number(value))) {
          value = Number(value);
        }
        
        row[header] = value;
      });
      data.push(row);
    }
  }
  return data;
};

export const generateSummaries = (data: DataRow[], columns: string[]): VariableSummary[] => {
  const summaries: VariableSummary[] = [];

  columns.forEach((col) => {
    const values = data.map((d) => d[col]).filter((v) => v !== null && v !== undefined && v !== '');
    const totalCount = data.length;
    const missingCount = totalCount - values.length;
    
    // Determine type based on first non-null
    const firstVal = values[0];
    const isNumber = typeof firstVal === 'number';
    
    const summary: VariableSummary = {
      name: col,
      type: isNumber ? 'number' : 'string',
      missing: missingCount,
      sample: values.slice(0, 5),
    };

    if (isNumber) {
      const nums = values as number[];
      nums.sort((a, b) => a - b);
      summary.min = nums[0];
      summary.max = nums[nums.length - 1];
      const sum = nums.reduce((a, b) => a + b, 0);
      summary.mean = sum / nums.length;
      
      const mid = Math.floor(nums.length / 2);
      summary.median = nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    } else {
        const distinct = new Set(values as string[]);
        summary.distinct = distinct.size;
    }

    summaries.push(summary);
  });

  return summaries;
};

// Helper to format data into a fixed-width Stata-style table
export const formatStataTable = (headers: string[], rows: (string | number | null)[][]): string => {
  if (headers.length === 0) return '';

  // Calculate widths
  const widths = headers.map((h, i) => {
    const maxDataLen = Math.max(...rows.map(r => String(r[i] ?? '').length));
    return Math.max(h.length, maxDataLen, 10) + 2; // +2 for padding
  });

  const headerRow = headers.map((h, i) => h.padStart(widths[i])).join('');
  const separator = widths.map(w => '-'.repeat(w)).join('');
  
  const body = rows.map(row => {
    return row.map((cell, i) => {
      const val = cell === null ? '.' : String(cell);
      return val.padStart(widths[i]);
    }).join('');
  }).join('\n');

  return `${headerRow}\n${separator}\n${body}`;
};