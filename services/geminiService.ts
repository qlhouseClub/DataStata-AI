
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
    You are DataStat AI, an expert statistical assistant similar to Stata.
    
    Current Dataset Context:
    The user has loaded a dataset with the following variables (columns):
    ${JSON.stringify(summaries, null, 2)}

    First 3 rows of data for reference:
    ${JSON.stringify(sampleRows, null, 2)}
    
    User Query: "${query}"

    Instructions:
    1. Analyze the user's query in the context of the dataset.
    2. If the user asks for a plot, graph, or visualization, set intent to 'CHART' and provide a valid 'chartConfig'. 
    3. If the user asks for a regression, t-test, advanced summary, or explanation:
       - Set intent to 'ANALYSIS'.
       - **CRITICAL**: Format your output to look exactly like Stata's ASCII output tables. 
       - Use fixed-width fonts (markdown code blocks) for tables.
       - Example of regression style:
         \`\`\`
               Source |       SS       df       MS              Number of obs = ...
         -------------+------------------------------           F(  1,   72) = ...
                Model | ...                                     Prob > F      = ...
             Residual | ...                                     R-squared     = ...
         -------------+------------------------------           Adj R-squared = ...
                Total | ...                                     Root MSE      = ...
         ------------------------------------------------------------------------------
                price |      Coef.   Std. Err.      t    P>|t|     [95% Conf. Interval]
         -------------+----------------------------------------------------------------
                  mpg |  -238.8943   57.47701    -4.16   0.000    -353.4763   -124.3124
                _cons |   11253.06   1170.813     9.61   0.000     8919.088    13587.03
         ------------------------------------------------------------------------------
         \`\`\`
       - You cannot run actual regressions on the full dataset (you only have summaries), so perform a "synthetic analysis" based on the summaries provided (mean, min, max) and general knowledge of these variable types. Clearly state if these are estimated or illustrative results.
    4. Be concise and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        systemInstruction: "You are a Stata emulator. Prefer technical accuracy and ASCII table formatting for statistical queries.",
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