
import { GoogleGenAI, Type } from "@google/genai";
import { ScenarioEvent } from '../types';
import { coerceScenarioEvents } from '../utils/events';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn(
    'GEMINI_API_KEY missing. Set VITE_GEMINI_API_KEY in .env.local so forecasts work locally.'
  );
}

const ai = new GoogleGenAI({ apiKey: API_KEY || ' ' });

const model = 'gemini-2.5-flash';

export async function getAiForecast(history: ScenarioEvent[], systemPrompt: string): Promise<ScenarioEvent[]> {
  try {
    const historyJson = JSON.stringify(history, null, 2);

    // TODO(next milestone): inject randomness parameters (e.g. seeds, scenario branches) before requesting forecasts.
    // FIX: Updated to use responseSchema for reliable JSON output as per Gemini API guidelines.
    const response = await ai.models.generateContent({
        model: model,
        contents: historyJson,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                icon: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                postMortem: { type: Type.BOOLEAN },
              },
              required: ['date', 'icon', 'title', 'description'],
            },
          },
        }
    });

    const text = typeof response.text === 'string' ? response.text.trim() : '';
    
    if (text.length === 0) {
      throw new Error("Gemini response did not include text content.");
    }
    
    // FIX: Removed markdown stripping (`replace`) as `responseMimeType: 'application/json'` ensures clean JSON output.
    const newEventsData = coerceScenarioEvents(JSON.parse(text), 'Gemini response');

    const lastDate = history[history.length - 1]?.date;
    if (lastDate) {
      const invalidDate = newEventsData.find(event => event.date < lastDate);
      if (invalidDate) {
        throw new Error(`Model returned an event with a past date: ${invalidDate.date}`);
      }
    }
    return newEventsData;

  } catch (error) {
    console.error("Error fetching AI forecast:", error);
    if (error instanceof Error) {
       throw new Error(`Failed to get AI forecast: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching the AI forecast.");
  }
}
