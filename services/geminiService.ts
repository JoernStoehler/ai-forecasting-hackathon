
import { GoogleGenAI, Type } from "@google/genai";
import { Event } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development if the env var is not set.
  // In a real production environment, the key should always be present.
  console.warn("API_KEY environment variable not set. Using a placeholder. App will not function correctly without a valid key.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || " " });

const model = 'gemini-2.5-flash';

// Basic schema validation
function validateEvents(data: any): data is Event[] {
  if (!Array.isArray(data)) return false;
  return data.every(item => 
    typeof item === 'object' &&
    item !== null &&
    'date' in item && typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
    'icon' in item && typeof item.icon === 'string' &&
    'title' in item && typeof item.title === 'string' &&
    'description' in item && typeof item.description === 'string'
  );
}

export async function getAiForecast(history: Event[], systemPrompt: string): Promise<Event[]> {
  try {
    const historyJson = JSON.stringify(history, null, 2);
    
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
              },
              required: ['date', 'icon', 'title', 'description'],
            },
          },
        }
    });

    const text = response.text.trim();
    
    // FIX: Removed markdown stripping (`replace`) as `responseMimeType: 'application/json'` ensures clean JSON output.
    const newEventsData = JSON.parse(text);

    if (validateEvents(newEventsData)) {
      // Ensure dates are not in the past
      const lastDate = history[history.length - 1]?.date;
      if (lastDate) {
        for (const event of newEventsData) {
          if (event.date < lastDate) {
            throw new Error(`Model returned an event with a past date: ${event.date}`);
          }
        }
      }
      return newEventsData;
    } else {
      throw new Error("AI response failed schema validation.");
    }

  } catch (error) {
    console.error("Error fetching AI forecast:", error);
    if (error instanceof Error) {
       throw new Error(`Failed to get AI forecast: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching the AI forecast.");
  }
}
