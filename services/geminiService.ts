import { GoogleGenAI, Type, Schema } from '@google/genai';
import { VariableSummary, ChartConfig } from '../types';

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
        type: { type: Type.STRING, enum: ['bar', 'line', 'scatter', 'area', 'pie'] },
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

export const analyzeData = async (
  query: string,
  summaries: VariableSummary[],
  sampleRows: any[]
): Promise<{ intent: string; textResponse: string; chartConfig?: ChartConfig }> => {
  const ai = getClient();
  
  const context = `
    You are DataStat AI, an expert statistical assistant similar to Stata but with natural language capabilities.
    
    Current Dataset Context:
    The user has loaded a dataset with the following variables (columns):
    ${JSON.stringify(summaries, null, 2)}

    First 3 rows of data for reference:
    ${JSON.stringify(sampleRows, null, 2)}
    
    User Query: "${query}"

    Instructions:
    1. Analyze the user's query in the context of the dataset.
    2. If the user asks for a plot, graph, or visualization, set intent to 'CHART' and provide a valid 'chartConfig'. 
       - Ensure 'xAxisKey' and 'yAxisKey' match exactly one of the variable names provided in the summaries.
       - Choose the most appropriate chart type (scatter for correlation, bar for comparison, etc.).
    3. If the user asks for a regression, summary, or explanation, set intent to 'ANALYSIS' and provide a detailed 'textResponse'.
       - You cannot run actual regressions, but you can interpret the provided summary statistics (mean, min, max) or explain how one would analyze it.
       - If the user asks "summarize", use the provided summary stats to write a nice report.
    4. Be concise, professional, and accurate. Use markdown for the text response.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        systemInstruction: "You are a helpful, precise data analysis assistant.",
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