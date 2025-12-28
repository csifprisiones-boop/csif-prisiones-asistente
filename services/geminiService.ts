import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { Message, Attachment } from "../types";

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Using the stable Flash model which has excellent speed and free tier availability
const MODEL_NAME = 'gemini-2.0-flash-lite';

// Generate embedding for text
export const embedText = async (text: string): Promise<number[] | null> => {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) return null;

    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Embedding Error:", error);
    return null;
  }
};

export const sendMessageToGemini = async (
  history: Message[],
  currentMessage: string,
  attachments: Attachment[] = [],
  systemContextOverride?: string
): Promise<string> => {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return "Error: API Key is missing. Please check your configuration.";
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Prepare parts
    const parts: Part[] = [];

    // Add attachments
    for (const attach of attachments) {
      if (attach.base64) {
        parts.push({
          inlineData: {
            mimeType: attach.mimeType,
            data: attach.base64
          }
        });
      }
    }

    // Add prompt with appropriate context
    // If override is provided (RAG), use it. Otherwise use default persona.
    const defaultContext = "Eres un asistente virtual útil y profesional para CSIF Prisiones (sindicato de funcionarios de prisiones). Ayudas con turnos, normativa, y análisis de documentos o videos de seguridad. Sé breve y conciso.";
    const finalSystemPrompt = systemContextOverride || defaultContext;

    parts.push({ text: `${finalSystemPrompt}\n\nUser: ${currentMessage}` });

    const result = await model.generateContent(parts);
    const response = await result.response;

    return response.text();

  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Check for common error types
    if (error.message?.includes('429')) {
      return "Error: Se ha excedido la cuota de uso. Por favor, espera un momento antes de preguntar de nuevo.";
    }

    return `Error: ${error.message || "Something went wrong interacting with Gemini/Google."}`;
  }
};

// Helper to convert File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};