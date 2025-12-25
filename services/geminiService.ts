import { GoogleGenAI, Type, Schema } from '@google/genai';
import { VariableSummary, ChartConfig, Dataset, FullReport } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API Key not found in environment');
  }
  return new GoogleGenAI({ apiKey });
};

// Definition of the expected JSON response from Gemini
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      enum: ['ANALYSIS', 'CHART', 'UNKNOWN'],
      description: "The type of response required. ANALYSIS for text answers, CHART for visualizations.",
    },
    textResponse: {
      type: Type.STRING,
      description: "The text analysis or answer to the user's question. Used if intent is ANALYSIS or to accompany a CHART.",
    },
    chartConfig: {
      type: Type.OBJECT,
      nullable: true,
      description: "Configuration for rendering a chart if intent is CHART.",
      properties: {
        type: { type: Type.STRING, enum: ['bar', 'line', 'scatter', 'area', 'pie', 'radar', 'donut', 'treemap'] },
        title: { type: Type.STRING },
        xAxisKey: { type: Type.STRING },
        yAxisKey: { type: Type.STRING, description: "For multi-line, use comma separated keys string, though currently we support single string mainly." },
        description: { type: Type.STRING }
      },
      required: ['type', 'title', 'xAxisKey', 'yAxisKey']
    }
  },
  required: ['intent', 'textResponse']
};

// REPORT SCHEMA
const reportSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Format: '[Filename] Analysis Report'" },
    summary: { type: Type.STRING, description: "A brief executive summary of the findings." },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING, description: "Detailed Markdown analysis. Highlight key metrics with **bold**." },
            insightType: { 
                type: Type.STRING, 
                enum: ['trend', 'strength', 'anomaly', 'weakness', 'recommendation'],
                description: "The dimension of this analysis section."
            },
            tableData: {
                type: Type.OBJECT,
                nullable: true,
                description: "Structured table of key data points supporting the analysis.",
                properties: {
                    headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    rows: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING } // Using string for flexibility in schema, parse to number if needed
                        } 
                    }
                },
                required: ['headers', 'rows']
            },
            chartConfig: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                    // STRICTLY RESTRICTED TYPES
                    type: { type: Type.STRING, enum: ['bar', 'line', 'donut', 'treemap'] },
                    title: { type: Type.STRING },
                    xAxisKey: { type: Type.STRING },
                    description: { type: Type.STRING },
                    series: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                dataKey: { type: Type.STRING },
                                label: { type: Type.STRING },
                                color: { type: Type.STRING, nullable: true }
                            },
                            required: ['dataKey']
                        }
                    }
                },
                required: ['type', 'title', 'xAxisKey', 'series']
            }
        },
        required: ['title', 'content', 'insightType']
      }
    }
  },
  required: ['title', 'summary', 'sections']
};

export const analyzeData = async (
  query: string,
  summaries: VariableSummary[],
  sampleRows: any[],
  userLanguage: string = 'en'
): Promise<{ intent: string; textResponse: string; chartConfig?: ChartConfig }> => {
  const ai = getClient();
  
  const langMap: Record<string, string> = {
    'en': 'English',
    'zh-CN': 'Simplified Chinese',
    'zh-TW': 'Traditional Chinese',
    'ja': 'Japanese',
    'ko': 'Korean'
  };
  const targetLang = langMap[userLanguage] || 'English';

  const context = `
    # Role & Persona
    You are **DataStat AI**, a world-class **Senior Data Analyst, Market Research Expert, and Strategy Consultant** with a **PhD in Financial Economics**. 

    # Language Instruction (CRITICAL)
    - **Detect the language** of the 'User Query'.
    - **Response Language**:
      1. If the query is in a recognizable natural language (Chinese, English, Japanese, etc.), **respond in that same language**.
      2. If the query is technical code, short keywords, or ambiguous (e.g., "summarize"), **respond in ${targetLang}**.

    # Current Dataset Context
    The user has loaded a dataset with the following variables (columns):
    ${JSON.stringify(summaries, null, 2)}

    First 3 rows of data for reference:
    ${JSON.stringify(sampleRows, null, 2)}
    
    # User Query
    "${query}"

    # Instructions
    1. **Analyze the Query**: Determine if the user needs a Visualization ('CHART'), a Statistical Analysis/Deep Insight ('ANALYSIS').
    
    2. **If Intent = 'CHART'**: 
       - If the user explicitly asks for a plot, graph, or visualization.
       - Provide a valid 'chartConfig' JSON.

    3. **If Intent = 'ANALYSIS'**:
       - **For Insight/Strategy Questions**: Provide a professional, executive-level analysis. 
         - **Structure**: Use distinct Markdown headers (### Title) to separate sections. Use bullet points for lists.
         - **Formatting**: Use **bold** for emphasis. 
         - **Data Visualization**: When listing specific metrics or KPIs, **STRICTLY** use the format '**Label**: Value' (e.g., '**Conversion Rate**: 12.5%' or '**Revenue**: $5M'). The UI will automatically convert this format into a visual bar chart or highlight.
       
       - **For Statistical/Stata Specific Questions**: If the user asks for a regression, t-test, or specific Stata command output:
         - **CRITICAL**: Format your output to look *exactly* like Stata's ASCII output tables. 
         - Use markdown code blocks (\`\`\`) for tables to ensure monospace formatting.

    4. **Tone & Style**:
       - Be professional, concise, and authoritative.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        systemInstruction: "You are DataStat AI. Use rich Markdown for analysis.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      intent: 'ANALYSIS',
      textResponse: "I encountered an error processing your request. Please check your API key or try a different query."
    };
  }
};

export const generateFullReport = async (
    dataset: Dataset,
    targetLanguageCode: string
): Promise<FullReport> => {
    return runReportGeneration(dataset, targetLanguageCode, 'FULL', []);
};

export const generateCustomReport = async (
    dataset: Dataset,
    targetLanguageCode: string,
    selectedDimensions: string[]
): Promise<FullReport> => {
    return runReportGeneration(dataset, targetLanguageCode, 'CUSTOM', selectedDimensions);
};

const runReportGeneration = async (
    dataset: Dataset,
    targetLanguageCode: string,
    mode: 'FULL' | 'CUSTOM',
    customDimensions: string[]
): Promise<FullReport> => {
    const ai = getClient();
    const sheetInfo = Object.keys(dataset.sheets).map(name => {
        return {
            sheetName: name,
            summaries: dataset.sheets[name].summaries,
            sample: dataset.sheets[name].data.slice(0, 3)
        };
    });

    const langMap: Record<string, string> = {
        'en': 'English',
        'zh-CN': 'Simplified Chinese',
        'zh-TW': 'Traditional Chinese',
        'ja': 'Japanese',
        'ko': 'Korean'
    };
    const targetLang = langMap[targetLanguageCode] || 'English';

    let prompt = `
    # Task
    Generate a **Professional Strategic Analysis Report**.
    Target Language: **${targetLang}**.
    
    # Input Data Context
    Dataset Name: ${dataset.name}
    Sheets Data: 
    ${JSON.stringify(sheetInfo, null, 2)}
    `;

    if (mode === 'CUSTOM') {
        prompt += `
        # SCOPE: CUSTOM ANALYSIS
        **CRITICAL**: You must ONLY analyze the following variables: ${JSON.stringify(customDimensions)}.
        Do not discuss other variables unless they are critical Time/Date dimensions required for trending.
        `;
    }

    prompt += `
    # Report Structure Requirements
    You MUST generate exactly these 5 sections in the 'sections' array, in this order:

    1. **Trend Analysis** ('insightType': 'trend')
       - Analyze evolution over time. 
       - CHART REQUIREMENT: Use 'line' or 'bar' chart. **X-Axis MUST be a Date/Time variable**.

    2. **Strength Analysis** ('insightType': 'strength')
       - Identify top performers, high-growth areas, or competitive advantages.
       - CHART REQUIREMENT: Use 'bar' or 'treemap'.

    3. **Anomaly Analysis** ('insightType': 'anomaly')
       - Detect outliers, unusual spikes/drops, or deviations from the mean.
       - CHART REQUIREMENT: Use 'line' (to show spike) or 'bar'.

    4. **Weakness Analysis** ('insightType': 'weakness')
       - Identify underperforming areas, declining trends, or risks.
       - CHART REQUIREMENT: Use 'bar' or 'donut'.

    5. **Comprehensive Recommendations** ('insightType': 'recommendation')
       - Strategic advice based on the above findings.
       - No chart required here, but strongly encouraged if it supports the strategy.

    # Chart Rules (STRICT)
    - **Allowed Types**: 'line', 'bar', 'donut', 'treemap'.
    - **Time Lock**: For 'line' and 'bar' charts in Trend Analysis, the X-Axis MUST be a time-based variable (Date, Year, Month). If no date exists, use a sequential index or category.
    - **Donut/Treemap**: Use these for displaying composition or part-to-whole relationships.
    - **MISSING DATA**: If you cannot create a meaningful chart because the required variables are missing or values are insufficient, set 'chartConfig' to null. Do NOT generate a chart with placeholders.

    # Data Table Requirement
    - For EACH section, you MUST provide 'tableData'.
    - This should be a structured summary of the key numbers discussed in that section (e.g., Top 5 Products, Year-over-Year Growth table).
    - Limit tables to 5-10 rows.

    # Formatting
    - Report Title Format: "${dataset.name} Analysis Report"
    - Use Markdown for 'content'.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: reportSchema,
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response");
        
        const report = JSON.parse(text) as FullReport;
        report.date = new Date().toLocaleDateString();
        return report;
    } catch (error) {
        console.error("Report Generation Error:", error);
        throw error;
    }
};