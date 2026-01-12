import { GoogleGenAI } from "@google/genai";

// Helper to get a fresh client instance with the latest key
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const CAPTION_MODEL = 'gemini-3-flash-preview';
const IMAGE_MODEL = 'gemini-3-pro-image-preview'; // Nano Banana Pro

/**
 * Generates a creative caption for a calendar month based on the image.
 */
export const generateCalendarCaption = async (base64Image: string, month: string): Promise<string> => {
  try {
    const ai = getAIClient();
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

/**
 * Remixes an uploaded image based on a text prompt (Img2Img).
 * Uses gemini-3-pro-image-preview.
 */
export const remixImageWithAI = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    const ai = getAIClient();
    
    // Using gemini-3-pro-image-preview for high quality image editing/generation
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Follow this instruction strictly to transform the attached image: ${prompt}. Maintain the original aspect ratio.`
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1", // The model requires a ratio, but usually respects input for img2img if prompted, though 1:1 is safest default for this model family
          imageSize: "1K"
        }
      },
    });

    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};