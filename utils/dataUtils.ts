
import { DataRow, VariableSummary, SheetData, Dataset } from '../types';
import { read, utils } from 'xlsx';

// Helper to strictly format dates as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseExcel = (buffer: ArrayBuffer): { [sheetName: string]: DataRow[] } => {
  try {
    const workbook = read(buffer, { type: 'array' });
    if (workbook.SheetNames.length === 0) return {};
    
    const result: { [sheetName: string]: DataRow[] } = {};

    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        
        // Use cellDates: true to interpret numbers as dates where appropriate
        const rawData = utils.sheet_to_json(worksheet, { defval: null, cellDates: true }) as any[];
        
        if (rawData.length > 0) {
            // Post-process to format Dates as YYYY-MM-DD string
            const processedData = rawData.map(row => {
                const newRow: DataRow = {};
                Object.keys(row).forEach(key => {
                    let val = row[key];
                    
                    if (val instanceof Date) {
                        newRow[key] = formatDate(val);
                    } 
                    else if (typeof val === 'string') {
                        // Attempt to parse string dates that look like dates (e.g. "2025-3-1 0:00")
                        // We check for common date separators like -, / or : to avoid parsing simple numbers or text
                        if (val.match(/[\d]{1,4}[-/\.][\d]{1,2}[-/\.][\d]{1,4}/)) {
                            const parsed = new Date(val);
                            // Check if valid date
                            if (!isNaN(parsed.getTime())) {
                                newRow[key] = formatDate(parsed);
                            } else {
                                newRow[key] = val;
                            }
                        } else {
                             newRow[key] = val;
                        }
                    } 
                    else {
                        newRow[key] = val;
                    }
                });
                return newRow;
            });
            result[sheetName] = processedData;
        }
    });
    
    return result;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    return {};
  }
};

export const parseCSV = (csvText: string): DataRow[] => {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const data: DataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    const matches = currentLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || currentLine.split(','); 
    
    const values = matches ? matches : currentLine.split(',');

    if (values.length === headers.length) {
      const row: DataRow = {};
      headers.forEach((header, index) => {
        let value: string | number | null = values[index] ? values[index].trim().replace(/^"|"$/g, '') : null;
        
        if (value !== null && value !== '' && !isNaN(Number(value))) {
          // If it looks like a number, parse it
          value = Number(value);
        } 
        // We could add date parsing here too if needed for CSVs
        
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
    
    const firstVal = values[0];
    const isNumber = typeof firstVal === 'number';
    // Strict check for our normalized YYYY-MM-DD format
    const isDate = typeof firstVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(firstVal);
    
    const summary: VariableSummary = {
      name: col,
      type: isNumber ? 'number' : isDate ? 'date' : 'string',
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

export const formatStataTable = (headers: string[], rows: (string | number | null)[][]): string => {
  if (headers.length === 0) return '';

  const widths = headers.map((h, i) => {
    const maxDataLen = Math.max(...rows.map(r => String(r[i] ?? '').length));
    return Math.max(h.length, maxDataLen, 10) + 2; 
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

export const mergeDatasets = (
    masterData: DataRow[], 
    usingData: DataRow[], 
    key: string
): { mergedData: DataRow[], report: string } => {
    // 1:1 Merge
    // Index using data
    const usingMap = new Map<string | number, DataRow>();
    usingData.forEach(row => {
        const val = row[key];
        if (val !== null && val !== undefined) {
            usingMap.set(val, row);
        }
    });

    let matchCount = 0;
    let masterOnlyCount = 0;
    let usingOnlyCount = 0; // Not fully tracked in simple left join, but we can approximate

    const mergedData = masterData.map(mRow => {
        const val = mRow[key];
        if (val !== null && val !== undefined && usingMap.has(val)) {
            matchCount++;
            return { ...mRow, ...usingMap.get(val)! }; // Master values overwritten by Using if dupes, typical merge default varies
        } else {
            masterOnlyCount++;
            return mRow;
        }
    });
    
    // Note: This is a Left Join (Keep Master). Stata default merge keeps all usually, but for simplicity we do Left here.
    
    const report = `
    Result                      # of obs.
    -----------------------------------------
    not matched                 ${masterOnlyCount}
        from master             ${masterOnlyCount}
        from using              (not tracked)
    
    matched                     ${matchCount}
    -----------------------------------------
    `;

    return { mergedData, report };
};