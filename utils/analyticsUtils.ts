
import { DataRow, VariableSummary } from '../types';

interface AggregationResult {
    dimension: string;
    metrics: { [key: string]: number };
    count: number;
}

// Helper to check if a value is effectively numeric
const isNumeric = (n: any) => !isNaN(parseFloat(n)) && isFinite(n);

/**
 * Aggregates data by a Date column (bucketed by Month/Year ideally, or raw date if sparse)
 */
export const aggregateByTime = (
    data: DataRow[], 
    dateCol: string, 
    numericCols: string[]
): string => {
    if (!dateCol || numericCols.length === 0) return "";

    const buckets: { [key: string]: { count: number, sums: { [key: string]: number } } } = {};

    data.forEach(row => {
        const dateVal = row[dateCol];
        if (!dateVal) return;

        // Simple bucket strategy: Try to grab YYYY-MM
        let bucketKey = String(dateVal).substring(0, 7); // "2023-01"

        if (!buckets[bucketKey]) {
            buckets[bucketKey] = { count: 0, sums: {} };
            numericCols.forEach(c => buckets[bucketKey].sums[c] = 0);
        }

        buckets[bucketKey].count++;
        numericCols.forEach(c => {
            const val = row[c];
            if (isNumeric(val)) {
                buckets[bucketKey].sums[c] += Number(val);
            }
        });
    });

    // Format as CSV-like string for the LLM
    // Limit to top 24 periods to save tokens
    const sortedKeys = Object.keys(buckets).sort();
    const limitedKeys = sortedKeys.length > 24 
        ?  [...sortedKeys.slice(0, 12), ...sortedKeys.slice(-12)] // Show start and end
        : sortedKeys;

    // Use pure column name for header to allow direct mapping
    let output = `${dateCol},Count,${numericCols.join(',')}\n`;
    
    limitedKeys.forEach(k => {
        const b = buckets[k];
        const sums = numericCols.map(c => Math.round(b.sums[c] * 100) / 100).join(',');
        output += `${k},${b.count},${sums}\n`;
    });

    return output;
};

/**
 * Aggregates data by a Categorical column (Top N groups)
 */
export const aggregateByCategory = (
    data: DataRow[], 
    catCol: string, 
    numericCols: string[]
): string => {
    if (!catCol || numericCols.length === 0) return "";

    const groups: { [key: string]: { count: number, sums: { [key: string]: number } } } = {};

    data.forEach(row => {
        const catVal = String(row[catCol] || 'Unknown');
        
        if (!groups[catVal]) {
            groups[catVal] = { count: 0, sums: {} };
            numericCols.forEach(c => groups[catVal].sums[c] = 0);
        }

        groups[catVal].count++;
        numericCols.forEach(c => {
            const val = row[c];
            if (isNumeric(val)) {
                groups[catVal].sums[c] += Number(val);
            }
        });
    });

    // Sort by count (descending) and take top 10
    const sortedGroups = Object.keys(groups).sort((a, b) => groups[b].count - groups[a].count).slice(0, 10);

    // Use pure column name for header
    let output = `${catCol},Count,${numericCols.join(',')}\n`;
    
    sortedGroups.forEach(k => {
        const b = groups[k];
        const sums = numericCols.map(c => Math.round(b.sums[c] * 100) / 100).join(',');
        output += `${k},${b.count},${sums}\n`;
    });

    return output;
};

/**
 * Pre-calculates insights for the LLM to ground it in reality.
 */
export const generatePreComputedContext = (
    data: DataRow[],
    summaries: VariableSummary[],
    scope: 'FULL' | 'CUSTOM',
    customVars: string[] = []
): string => {
    // 1. Identify Roles
    const dateVars = summaries.filter(s => s.type === 'date').map(s => s.name);
    
    // For numeric vars: In custom mode, use selected. 
    // In FULL mode: UPDATED to use ALL numeric variables. 
    // We rely on Gemini's large context window to handle full dataset width.
    let numericVars = summaries.filter(s => s.type === 'number').map(s => s.name);
    if (scope === 'CUSTOM') {
        numericVars = numericVars.filter(n => customVars.includes(n));
    } 
    // Previously sliced to 4, now we keep all.

    // For cat vars: Pick categorical vars with reasonable cardinality (e.g., < 50 unique)
    // We still filter for distinct < 50 to avoid grouping by unique IDs (which makes no sense for aggregation)
    let catVars = summaries.filter(s => s.type === 'string' && (s.distinct || 0) < 50).map(s => s.name);
    if (scope === 'CUSTOM') {
        catVars = catVars.filter(c => customVars.includes(c));
    }
    // Previously sliced to 3, now we keep all valid groupable columns.

    if (numericVars.length === 0) return "No numeric variables found for aggregation.";

    let context = "### GROUND TRUTH DATA (Deterministic Aggregations)\n";
    context += "Use the data below to populate tables and commentary. DO NOT calculate your own sums.\n\n";

    // 2. Generate Time Series Data (Trend)
    if (dateVars.length > 0) {
        // Use primary date var (first one found or selected)
        const primaryDate = scope === 'CUSTOM' 
            ? (dateVars.find(d => customVars.includes(d)) || dateVars[0])
            : dateVars[0];
        
        context += `#### Trend Data (Aggregated by ${primaryDate})\n`;
        context += aggregateByTime(data, primaryDate, numericVars);
        context += "\n";
    }

    // 3. Generate Categorical Data (Structure/Strength/Weakness)
    if (catVars.length > 0) {
        catVars.forEach(cat => {
            context += `#### Group Data (Aggregated by ${cat})\n`;
            context += aggregateByCategory(data, cat, numericVars);
            context += "\n";
        });
    }

    return context;
};
