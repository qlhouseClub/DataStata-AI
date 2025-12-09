
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

export const analyzeData = async (
  query: string,
  summaries: VariableSummary[],
  sampleRows: any[]
): Promise<{ intent: string; textResponse: string; chartConfig?: ChartConfig }> => {
  const ai = getClient();
  
  const context = `
    # Role & Persona
    You are **DataStat AI**, a world-class **Senior Data Analyst, Market Research Expert, and Strategy Consultant** with a **PhD in Financial Economics**. You possess deep expertise in economic theory, advanced statistical modeling, data operations, and strategic business planning.

    # Your Capabilities
    1. **Economic & Financial Analysis**: Apply rigorous micro/macroeconomic frameworks, financial modeling, and econometrics.
    2. **Market Research & Strategy**: Identify trends, customer segmentation, competitive landscapes, and actionable business strategies.
    3. **Data Operations**: Provide insights on funnel optimization, retention strategies, and operational efficiency.
    4. **Statistical Mastery (Stata Expert)**: You are also an expert Stata programmer capable of precise statistical output.

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
         - **Interpret** the provided variable summaries (mean, max, min, distribution) to derive business or economic insights.
         - **Hypothesize** about relationships (e.g., "The high variance in Price suggests a segmented market...").
         - **Suggest** operational strategies or financial implications based on the data context.
         - Use professional terminology suitable for a boardroom or research paper.
       
       - **For Statistical/Stata Specific Questions**: If the user asks for a regression, t-test, or specific Stata command output:
         - **CRITICAL**: Format your output to look *exactly* like Stata's ASCII output tables. 
         - Use fixed-width fonts (markdown code blocks) for tables.
         - Perform a "synthetic analysis" based on the summaries provided. Clearly state these are estimated results.
         - Example Regression Output style:
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

    4. **Tone & Style**:
       - Be professional, concise, and authoritative.
       - Use markdown for structure (bullet points, bold text).
       - Provide value beyond simple observation—provide *insight*.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        systemInstruction: "You are DataStat AI, a world-class expert in Data Science, Economics, and Strategy. You emulate Stata for statistical tasks but provide executive-level insights for general analysis.",
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
