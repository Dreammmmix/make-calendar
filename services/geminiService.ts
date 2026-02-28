import { GoogleGenAI } from "@google/genai";

const CAPTION_MODEL = 'gemini-3-flash-preview';

/**
 * Generates a creative caption for a calendar month based on the image.
 */
export const generateCalendarCaption = async (base64Image: string, month: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are a poetic editor for a high-end lifestyle magazine. 
      Analyze this image which is chosen for the month of ${month}.
      Write a short, evocative, and inspiring caption or quote (max 15 words) that captures the mood of the image and the essence of ${month}.
      Do not use hashtags. Just the text.
    `;

    const response = await ai.models.generateContent({
      model: CAPTION_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        temperature: 0.7,
        maxOutputTokens: 50,
      }
    });

    return response.text?.trim() || `Beautiful moments in ${month}`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Capturing the essence of ${month}`;
  }
};

/**
 * Generates captions for all filled months in parallel
 */
export const generateAllCaptions = async (
  monthsData: { id: number; image: string | null; name: string }[]
): Promise<{ id: number; caption: string }[]> => {
  
  const tasks = monthsData
    .filter(m => m.image !== null)
    .map(async (m) => {
      const caption = await generateCalendarCaption(m.image!.split(',')[1], m.name);
      return { id: m.id, caption };
    });

  return Promise.all(tasks);
};