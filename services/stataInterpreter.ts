import { DataRow, VariableSummary, LogEntry, LogType } from '../types';
import { generateSummaries, formatStataTable } from '../utils/dataUtils';

interface InterpretResult {
  handled: boolean;
  logs?: LogEntry[];
  newData?: DataRow[];
  newSummaries?: VariableSummary[];
}

// Basic Stata-like interpreter
export const interpretStataCommand = (
  command: string, 
  data: DataRow[], 
  summaries: VariableSummary[]
): InterpretResult => {
  const cmd = command.trim();
  const parts = cmd.split(/\s+/);
  const keyword = parts[0].toLowerCase();

  // Create log helper
  const createLog = (content: string, type: LogType = LogType.RESPONSE_TEXT): LogEntry => ({
    id: Date.now().toString(),
    timestamp: Date.now(),
    type,
    content
  });

  // --- COMMAND: DESCRIBE (d) ---
  if (keyword === 'describe' || keyword === 'd') {
    const varList = parts.slice(1);
    const targetVars = varList.length > 0 
      ? summaries.filter(s => varList.includes(s.name))
      : summaries;

    if (targetVars.length === 0 && varList.length > 0) {
      return { handled: true, logs: [createLog(`Variable(s) not found`, LogType.ERROR)] };
    }

    const header = `Contains data\n  obs: ${data.length}\n vars: ${targetVars.length}\n\nVariable      Storage   Display    Value\nname          type      format     label      Variable label\n-------------------------------------------------------------`;
    const rows = targetVars.map(v => {
      const type = v.type === 'number' ? 'float' : 'str';
      // Simple mock formatting for display
      return `${v.name.padEnd(13)} ${type.padEnd(9)} %9.0g                 `;
    }).join('\n');

    return {
      handled: true,
      logs: [createLog(`${header}\n${rows}`)]
    };
  }

  // --- COMMAND: SUMMARIZE (su, summ) ---
  if (keyword === 'summarize' || keyword === 'su' || keyword === 'summ') {
    const varList = parts.slice(1);
    const targetSummaries = varList.length > 0 
      ? summaries.filter(s => varList.includes(s.name))
      : summaries.filter(s => s.type === 'number'); // Default to numeric only for simple summary

    if (targetSummaries.length === 0) {
       return { handled: true, logs: [createLog("No numeric variables to summarize.", LogType.RESPONSE_TEXT)] };
    }

    const headers = ['Variable', 'Obs', 'Mean', 'Std. Dev.', 'Min', 'Max'];
    const tableRows = targetSummaries.map(s => {
      // Calculate Std Dev on the fly for the table
      const values = s.sample.length > 0 
        ? data.map(d => d[s.name] as number).filter(v => typeof v === 'number') 
        : [];
      
      let stdDev = 0;
      if (values.length > 1 && s.mean !== undefined) {
        const variance = values.reduce((acc, val) => acc + Math.pow(val - s.mean!, 2), 0) / (values.length - 1);
        stdDev = Math.sqrt(variance);
      }

      return [
        s.name,
        values.length,
        s.mean?.toFixed(2) ?? '.',
        stdDev.toFixed(2),
        s.min ?? '.',
        s.max ?? '.'
      ];
    });

    return {
      handled: true,
      logs: [createLog(formatStataTable(headers, tableRows))]
    };
  }

  // --- COMMAND: LIST (l) ---
  if (keyword === 'list' || keyword === 'l') {
    // Parse "in 1/10"
    const inIndex = parts.indexOf('in');
    let start = 0;
    let end = 5; // Default short list
    let cols = parts.slice(1);

    if (inIndex !== -1) {
      const range = parts[inIndex + 1];
      cols = parts.slice(1, inIndex);
      
      const rangeParts = range.split('/');
      if (rangeParts.length === 2) {
        start = Math.max(0, parseInt(rangeParts[0]) - 1);
        end = parseInt(rangeParts[1]);
      } else if (rangeParts.length === 1) {
         start = parseInt(rangeParts[0]) - 1;
         end = start + 1;
      }
    } else if (parts.length === 1) {
        // default list 5
        end = Math.min(data.length, 5);
    } else {
        // list varname (all? limit to 20 for safety)
        end = Math.min(data.length, 20);
    }

    // Filter columns
    const allColNames = summaries.map(s => s.name);
    const validCols = cols.length > 0 
        ? cols.filter(c => allColNames.includes(c))
        : allColNames;

    if (validCols.length === 0) {
        return { handled: true, logs: [createLog("No valid variables specified.", LogType.ERROR)] };
    }

    const slice = data.slice(start, end);
    const tableRows = slice.map((row, idx) => {
        return [start + idx + 1, ...validCols.map(c => row[c])];
    });

    const output = formatStataTable(['Obs', ...validCols], tableRows);
    return {
        handled: true,
        logs: [createLog(output)]
    };
  }

  // --- COMMAND: GENERATE (gen, generate) ---
  if (keyword === 'generate' || keyword === 'gen') {
    // Syntax: gen newvar = expression
    const eqIndex = parts.indexOf('=');
    if (eqIndex === -1) {
       return { handled: true, logs: [createLog("Invalid syntax. Usage: generate newvar = expression", LogType.ERROR)] };
    }

    const newVarName = parts[1];
    if (eqIndex !== 2) { // gen var = ...
        return { handled: true, logs: [createLog("Invalid syntax. Usage: generate newvar = expression", LogType.ERROR)] };
    }

    if (summaries.find(s => s.name === newVarName)) {
        return { handled: true, logs: [createLog(`Variable ${newVarName} already exists.`, LogType.ERROR)] };
    }

    // Join the rest as expression
    let expression = parts.slice(eqIndex + 1).join(' ');
    
    // Replace variable names with row lookups for evaluation
    // We sort variables by length desc to avoid replacing substrings (e.g. replacing 'temp' inside 'temperature')
    const sortedVars = [...summaries].sort((a, b) => b.name.length - a.name.length);
    
    // Convert Stata power operator ^ to JS **
    expression = expression.replace(/\^/g, '**');

    try {
        const newData = data.map(row => {
            // Create a function scope with variables
            // This is a simple safe-ish eval by using Function constructor with args
            const keys = sortedVars.map(v => v.name);
            const values = keys.map(k => {
                const val = row[k];
                return (val === null || val === undefined) ? NaN : val;
            });
            
            // Basic support for arithmetic. 
            // Note: This matches whole words to avoid replacing "a" in "apple"
            // But strict "eval" with `with` is deprecated.
            // We'll use a Function constructor.
            
            const func = new Function(...keys, `return ${expression};`);
            let result = func(...values);

            if (typeof result === 'number' && (isNaN(result) || !isFinite(result))) {
                result = null;
            }
            
            return { ...row, [newVarName]: result };
        });

        const newSummaries = generateSummaries(newData, [...summaries.map(s => s.name), newVarName]);
        
        return {
            handled: true,
            logs: [createLog(`Variable ${newVarName} generated.`)],
            newData,
            newSummaries
        };

    } catch (err) {
        return { handled: true, logs: [createLog(`Error generating variable: ${err}`, LogType.ERROR)] };
    }
  }

  // --- COMMAND: DROP ---
  if (keyword === 'drop') {
      const dropVars = parts.slice(1);
      if (dropVars.length === 0) return { handled: true, logs: [createLog("Usage: drop varlist", LogType.ERROR)] };

      const newData = data.map(row => {
          const newRow = { ...row };
          dropVars.forEach(v => delete newRow[v]);
          return newRow;
      });

      const newCols = summaries.filter(s => !dropVars.includes(s.name)).map(s => s.name);
      const newSummaries = generateSummaries(newData, newCols);

      return {
          handled: true,
          logs: [createLog(`Dropped ${dropVars.length} variables.`)],
          newData,
          newSummaries
      };
  }

  // --- COMMAND: CLEAR ---
  if (keyword === 'clear') {
      // Handled in App.tsx but we can signal here
      return { handled: false }; // Let App handle clear or custom handle
  }
  
  // --- COMMAND: COUNT ---
  if (keyword === 'count') {
      return { handled: true, logs: [createLog(`${data.length}`)] };
  }

  return { handled: false };
};
