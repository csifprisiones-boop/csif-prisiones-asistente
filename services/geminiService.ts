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

  // Debug logs (visible in browser console to help us diagnose)
  console.log("Checking API Keys...");
  console.log("Groq Key present:", !!GROQ_KEY);
  console.log("Gemini Key present:", !!GEMINI_KEY);

  const hasVideo = attachments.some(a => a.type === 'video');
  const defaultContext = "Eres un asistente virtual útil y profesional para CSIF Prisiones (sindicato de funcionarios de prisiones). Ayudas con turnos, normativa, y análisis de documentos o videos de seguridad. Sé breve y conciso.";
  const finalSystemPrompt = systemContextOverride || defaultContext;

  // 1. If we have a video, always use Gemini (Groq doesn't support video)
  if (hasVideo) {
    if (!GEMINI_KEY) return "Error: Para analizar vídeos se requiere la clave de Gemini.";
    return sendMessageWithGemini(history, currentMessage, attachments, finalSystemPrompt);
  }

  // 2. Try Groq if key is available
  if (GROQ_KEY) {
    try {
      console.log("Attempting to use Groq engine...");
      const result = await sendMessageWithGroq(currentMessage, attachments, finalSystemPrompt);
      return result;
    } catch (error: any) {
      console.error("Groq Error:", error);
      // Fallback only if Gemini key exists
      if (GEMINI_KEY) {
        console.log("Falling back to Gemini due to Groq error...");
        return sendMessageWithGemini(history, currentMessage, attachments, finalSystemPrompt);
      }
      return `Error en el servicio principal (Groq): ${error.message}. Además, no hay clave de respaldo para Gemini configurada.`;
    }
  }

  // 3. Fallback to Gemini if no Groq key but Gemini key exists
  if (GEMINI_KEY) {
    console.log("No Groq key found. Using Gemini directly...");
    return sendMessageWithGemini(history, currentMessage, attachments, finalSystemPrompt);
  }

  return "Error: No se ha detectado ninguna clave de API (VITE_GROQ_API_KEY o VITE_GEMINI_API_KEY). Por favor, configúralas en el panel de Netlify.";
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
      if (!GROQ_KEY) {
        return "⚠️ ATENCIÓN: Gemini se ha agotado y NO se detecta la clave de Groq en Netlify. Por favor, añade la variable VITE_GROQ_API_KEY en el panel de Netlify para que el asistente vuelva a funcionar.";
      }
      return "Error: Ambas plataformas (Groq y Gemini) han alcanzado su límite. Inténtalo de nuevo en unos minutos.";
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