import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, Flashcard, MangaPanel, Chapter } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper to safely parse JSON from a model's response
const parseJsonResponse = <T>(response: GenerateContentResponse): T => {
    const text = response.text;
    if (!text) {
        console.error("AI response was empty.", response);
        throw new Error("The AI returned an empty response. It might have been blocked due to safety policies.");
    }

    let jsonString = text.trim();
    
    // Clean potential markdown code fences
    if (jsonString.startsWith("```json")) {
        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    } else if (jsonString.startsWith("```")) {
        jsonString = jsonString.substring(3, jsonString.length - 3).trim();
    }
    
    // Find the first '{' or '[' to start parsing from
    const startIndex = jsonString.search(/[[{]/);
    if (startIndex === -1) {
        console.error("No JSON object/array found in response:", text);
        throw new Error("The AI returned a non-JSON response.");
    }
    
    jsonString = jsonString.substring(startIndex);

    try {
        return JSON.parse(jsonString) as T;
    } catch (e) {
        console.error("Failed to parse JSON:", jsonString);
        console.error("Original model response:", text);
        throw new Error("Could not parse the response from the AI model.");
    }
};

type FileType = Chapter['sourceFile']['type'];

const getFileParts = (fileContent: string, fileType: FileType, mimeType?: string) => {
  if (fileType === 'image' || fileType === 'file') {
    if (!mimeType) throw new Error(`Mime type must be provided for file type: ${fileType}`);
    return [{
      inlineData: {
        mimeType: mimeType,
        data: fileContent.substring(fileContent.indexOf(',') + 1),
      },
    }];
  }
  return [{ text: fileContent }];
};


export const generateSummary = async (fileContent: string, fileType: FileType, mimeType?: string): Promise<string> => {
  const parts = getFileParts(fileContent, fileType, mimeType);
  const prompt = "Provide a concise, easy-to-understand summary of the following course material. Use headings and bullet points for clarity.";
  
  const model = fileType === 'text' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
  
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [...parts, { text: prompt }] },
  });

  if (!response.text) {
      console.error("Empty response from summary generation API:", response);
      throw new Error("Summary generation failed. The request may have been blocked or returned no content.");
  }
  return response.text;
};

export const generateQuiz = async (fileContent: string, fileType: FileType, mimeType?: string): Promise<QuizQuestion[]> => {
  const parts = getFileParts(fileContent, fileType, mimeType);
  const prompt = `Based on the provided material, create a multiple-choice quiz with 5 questions.
  For each question, provide 4 options and clearly indicate the correct answer.`;

  const model = fileType === 'text' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [...parts, { text: prompt }] },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer"]
        }
      }
    }
  });

  return parseJsonResponse<QuizQuestion[]>(response);
};

const splitTextIntoEvenScenes = (text: string, numScenes: number): string[] => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0 || numScenes <= 0) {
        return [];
    }
    const wordsPerScene = Math.ceil(words.length / numScenes);
    const scenes: string[] = [];
    for (let i = 0; i < words.length; i += wordsPerScene) {
        const sceneWords = words.slice(i, i + wordsPerScene);
        scenes.push(sceneWords.join(' '));
    }
    return scenes;
};

export const generateMangaScript = async (fileContent: string, fileType: FileType, mimeType?: string): Promise<MangaPanel[]> => {
    const parts = getFileParts(fileContent, fileType, mimeType);
    
    let numPanels: number;
    let scenePrompts = '';

    if (fileType === 'image' || fileType === 'file') {
        numPanels = fileType === 'image' ? 4 : 6;
    } else { // 'text'
        const wordCount = fileContent.trim().split(/\s+/).filter(w => w.length > 0).length;
        
        if (wordCount < 75) {
            numPanels = 2; // Use 2 panels for very short texts for a minimal narrative.
        } else {
            // Dynamically calculate panels: roughly 1 per 125 words, capped between 3 and 8.
            const calculatedPanels = Math.ceil(wordCount / 125);
            numPanels = Math.max(3, Math.min(8, calculatedPanels));
        }
        
        const scenes = splitTextIntoEvenScenes(fileContent, numPanels);
        if (scenes.length > 0) {
            scenePrompts = 'Scenes to convert into manga panels:\n' + scenes.map((scene, idx) => `--- Scene ${idx + 1} ---\n${scene}`).join('\n\n');
        }
    }
    
    if (numPanels === 0) return [];

    const prompt = `You are an expert manga story creator. Convert the following educational content into an engaging manga script with ${numPanels} panels.
${fileType !== 'text' ? `The content is a ${fileType}. Your task is to interpret it and create an educational story.` : ''}

IMPORTANT: You must create EXACTLY ${numPanels} panels.${fileType === 'text' ? ' Create one panel for each scene provided below.' : ''}

For each panel, provide:
1. **scene**: A vivid, visual description of what the reader sees (characters, setting, actions, expressions)
2. **dialogue**: An array of 1-3 speech bubbles with conversational, engaging dialogue.
3. **narration**: Optional narrative text box for explaining concepts or setting mood. If there is no narration for a panel, you MUST omit the "narration" key entirely from that panel's JSON object.
4. **emotion**: The mood/emotion (e.g., excited, shocked, curious, determined).

Manga style guidelines:
- Use dramatic reactions and exaggerated expressions.
- Make characters relatable students or teachers.
- Keep dialogue punchy and expressive.

${scenePrompts}

Return ONLY a valid JSON array with ${numPanels} panel objects. No extra text before or after.
`;

    const model = fileType === 'text' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [...parts, { text: prompt }] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        scene: { type: Type.STRING },
                        dialogue: { type: Type.ARRAY, items: { type: Type.STRING } },
                        narration: { type: Type.STRING },
                        emotion: { type: Type.STRING }
                    },
                    required: ["scene", "dialogue", "emotion"]
                }
            }
        }
    });

    const script = parseJsonResponse<Omit<MangaPanel, 'imageUrl'>[]>(response);
    return script.map(panel => ({ ...panel, narration: panel.narration || null, imageUrl: null }));
};

export const generateMangaPanelImage = async (sceneDescription: string): Promise<string> => {
    const prompt = `Create a professional black and white manga panel. The style should be clean, with dynamic lines and expressive characters. Use screen tones for shading. Scene: ${sceneDescription}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const candidate = response.candidates?.[0];
    // Check for explicit blocks or lack of content
    if (!candidate || !candidate.content?.parts || candidate.content.parts.length === 0) {
        console.error("Invalid response from image generation API:", response);
        throw new Error("Image generation failed. The request may have been blocked due to safety policies.");
    }

    for (const part of candidate.content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No image data found in the response parts.");
};

export const generateFlashcards = async (fileContent: string, fileType: FileType, mimeType?: string): Promise<Flashcard[]> => {
    const parts = getFileParts(fileContent, fileType, mimeType);
    const prompt = `Based on the provided material, create a set of 10 flashcards.
    For each flashcard, provide a 'term' (a key concept or name) and a concise 'definition'.`;

    const model = fileType === 'text' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [...parts, { text: prompt }] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        term: { type: Type.STRING },
                        definition: { type: Type.STRING }
                    },
                    required: ["term", "definition"]
                }
            }
        }
    });

    return parseJsonResponse<Flashcard[]>(response);
};