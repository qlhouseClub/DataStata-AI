
import { DataRow, VariableSummary, LogEntry, LogType, Dataset, getActiveSheet } from '../types';
import { generateSummaries, formatStataTable, mergeDatasets } from '../utils/dataUtils';

interface InterpretResult {
  handled: boolean;
  logs?: LogEntry[];
  newData?: DataRow[];
  newSummaries?: VariableSummary[];
  action?: 'SWITCH_FRAME';
  targetFrameId?: string;
}

export const interpretStataCommand = (
  command: string, 
  activeDataset: Dataset,
  allDatasets: Dataset[]
): InterpretResult => {
  const cmd = command.trim();
  const parts = cmd.split(/\s+/);
  const keyword = parts[0].toLowerCase();
  
  const activeSheet = getActiveSheet(activeDataset);
  const data = activeSheet.data;
  const summaries = activeSheet.summaries;

  const createLog = (content: string, type: LogType = LogType.RESPONSE_TEXT): LogEntry => ({
    id: Date.now().toString() + Math.random(),
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

    const header = `Contains data from ${activeDataset.name} (Sheet: ${activeDataset.activeSheetName})\n  obs: ${data.length}\n vars: ${targetVars.length}\n\nVariable      Storage   Display    Value\nname          type      format     label      Variable label\n-------------------------------------------------------------`;
    const rows = targetVars.map(v => {
      const type = v.type === 'number' ? 'float' : 'str';
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
      : summaries.filter(s => s.type === 'number');

    if (targetSummaries.length === 0) {
       return { handled: true, logs: [createLog("No numeric variables to summarize.", LogType.RESPONSE_TEXT)] };
    }

    const headers = ['Variable', 'Obs', 'Mean', 'Std. Dev.', 'Min', 'Max'];
    const tableRows = targetSummaries.map(s => {
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
    const inIndex = parts.indexOf('in');
    let start = 0;
    let end = 5; 
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
        end = Math.min(data.length, 5);
    } else {
        end = Math.min(data.length, 20);
    }

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

  // --- COMMAND: MERGE ---
  // Syntax: merge 1:1 keyvar using filename
  if (keyword === 'merge') {
      // Very basic parser: merge 1:1 varname using filename
      // Indices: 0=merge, 1=1:1, 2=varname, 3=using, 4=filename
      if (parts[1] !== '1:1' || parts[3] !== 'using') {
          return { handled: true, logs: [createLog("Only 'merge 1:1 varname using filename' is supported currently.", LogType.ERROR)] };
      }
      
      const keyVar = parts[2];
      const usingName = parts[4].replace(/"/g, ''); // strip quotes
      
      // Find the dataset
      const usingDataset = allDatasets.find(d => d.name === usingName);
      if (!usingDataset) {
          const avail = allDatasets.map(d => d.name).join(', ');
          return { handled: true, logs: [createLog(`Dataset '${usingName}' not found. Available: ${avail}`, LogType.ERROR)] };
      }
      
      const usingSheetData = getActiveSheet(usingDataset).data;
      
      // Validate key
      if (!summaries.find(s => s.name === keyVar)) {
          return { handled: true, logs: [createLog(`Variable '${keyVar}' not found in master data.`, LogType.ERROR)] };
      }
      
      // Perform merge
      try {
          const result = mergeDatasets(data, usingSheetData, keyVar);
          const newCols = Object.keys(result.mergedData[0]);
          const newSummaries = generateSummaries(result.mergedData, newCols);
          
          return {
              handled: true,
              logs: [createLog(result.report)],
              newData: result.mergedData,
              newSummaries: newSummaries
          };
      } catch (e) {
          return { handled: true, logs: [createLog(`Merge failed: ${e}`, LogType.ERROR)] };
      }
  }
  
  // --- COMMAND: FRAME CHANGE ---
  // syntax: frame change framename (or dataset name in our case)
  if (keyword === 'frame' && parts[1] === 'change') {
      const targetName = parts.slice(2).join(' ').replace(/"/g, '');
      const target = allDatasets.find(d => d.name === targetName);
      if (target) {
           return {
               handled: true,
               logs: [createLog(`Switched to frame ${target.name}`)],
               action: 'SWITCH_FRAME',
               targetFrameId: target.id
           };
      } else {
           return { handled: true, logs: [createLog(`Frame ${targetName} not found.`, LogType.ERROR)] };
      }
  }

  // --- COMMAND: GENERATE (gen, generate) ---
  if (keyword === 'generate' || keyword === 'gen') {
    const eqIndex = parts.indexOf('=');
    if (eqIndex === -1 || eqIndex !== 2) {
       return { handled: true, logs: [createLog("Invalid syntax. Usage: generate newvar = expression", LogType.ERROR)] };
    }

    const newVarName = parts[1];
    if (summaries.find(s => s.name === newVarName)) {
        return { handled: true, logs: [createLog(`Variable ${newVarName} already exists.`, LogType.ERROR)] };
    }

    let expression = parts.slice(eqIndex + 1).join(' ');
    const sortedVars = [...summaries].sort((a, b) => b.name.length - a.name.length);
    expression = expression.replace(/\^/g, '**');

    try {
        const newData = data.map(row => {
            const keys = sortedVars.map(v => v.name);
            const values = keys.map(k => {
                const val = row[k];
                return (val === null || val === undefined) ? NaN : val;
            });
            
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
  
  // --- COMMAND: COUNT ---
  if (keyword === 'count') {
      return { handled: true, logs: [createLog(`${data.length}`)] };
  }

  return { handled: false };
};
