import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { Message, Attachment } from "../types";

// Keys
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

// Models
const GEMINI_MODEL = 'gemini-2.0-flash-lite';
const GROQ_TEXT_MODEL = 'llama-3.3-70b-versatile';
const GROQ_VISION_MODEL = 'llama-3.2-11b-vision-preview';

// Generate embedding for text (Gemini is efficient and has a free tier for this)
export const embedText = async (text: string): Promise<number[] | null> => {
  try {
    if (!GEMINI_KEY) return null;
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Embedding Error:", error);
    return null;
  }
};

/**
 * Sends a message to the AI.
 * Uses Groq (Llama 3) if available for text/images (higher rate limits).
 * Falls back to Gemini for video or if Groq key is missing.
 */
export const sendMessageToAI = async (
  history: Message[],
  currentMessage: string,
  attachments: Attachment[] = [],
  systemContextOverride?: string
): Promise<string> => {

  const hasVideo = attachments.some(a => a.type === 'video');
  const defaultContext = "Eres un asistente virtual útil y profesional para CSIF Prisiones (sindicato de funcionarios de prisiones). Ayudas con turnos, normativa, y análisis de documentos o videos de seguridad. Sé breve y conciso.";
  const finalSystemPrompt = systemContextOverride || defaultContext;

  // 1. If we have a video or NO Groq key, we use Gemini
  if (hasVideo || !GROQ_KEY) {
    return sendMessageWithGemini(history, currentMessage, attachments, finalSystemPrompt);
  }

  // 2. Otherwise, use Groq (Fast & High Limits)
  try {
    return await sendMessageWithGroq(currentMessage, attachments, finalSystemPrompt);
  } catch (error: any) {
    console.warn("Groq Error, falling back to Gemini:", error);
    return sendMessageWithGemini(history, currentMessage, attachments, finalSystemPrompt);
  }
};

// --- GROQ IMPLEMENTATION ---
async function sendMessageWithGroq(prompt: string, attachments: Attachment[], systemPrompt: string): Promise<string> {
  const hasImages = attachments.some(a => a.type === 'image');
  const model = hasImages ? GROQ_VISION_MODEL : GROQ_TEXT_MODEL;

  const messages: any[] = [
    { role: "system", content: systemPrompt }
  ];

  // Prepare content with images if present
  if (hasImages) {
    const contentParts: any[] = [{ type: "text", text: prompt }];
    for (const att of attachments) {
      if (att.type === 'image' && att.base64) {
        contentParts.push({
          type: "image_url",
          image_url: { url: `data:${att.mimeType};base64,${att.base64}` }
        });
      }
    }
    messages.push({ role: "user", content: contentParts });
  } else {
    messages.push({ role: "user", content: prompt });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || "Groq request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// --- GEMINI IMPLEMENTATION (Fallback) ---
async function sendMessageWithGemini(history: Message[], prompt: string, attachments: Attachment[], systemPrompt: string): Promise<string> {
  try {
    if (!GEMINI_KEY) return "Error: API Keys missing.";

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const parts: Part[] = [];

    // Attachments
    for (const attach of attachments) {
      if (attach.base64) {
        parts.push({
          inlineData: { mimeType: attach.mimeType, data: attach.base64 }
        });
      }
    }

    parts.push({ text: `${systemPrompt}\n\nUser: ${prompt}` });
    const result = await model.generateContent(parts);
    return result.response.text();
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes('429')) {
      return "Error: Se ha excedido la cuota mensual de Gemini. Por favor, configura una API Key de Groq para continuar sin límites.";
    }
    return "Error al conectar con los servicios de IA.";
  }
}

// Keep old exports for compatibility or rename them
export const sendMessageToGemini = sendMessageToAI;

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};