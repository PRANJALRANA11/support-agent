import axios, { type AxiosInstance } from "axios";
import { OPENROUTER_API_KEY } from "../../config.js";

// ---------- Types ----------
interface ChatText {
  type: "text";
  text: string;
}

interface ChatImage {
  type: "image_url";
  image_url: {
    url: string;
  };
}

type ChatContent = ChatText | ChatImage;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: ChatContent[] | string;
}

interface ChatChoice {
  message: ChatMessage;
}

interface ChatCompletionResponse {
  choices: ChatChoice[];
}

// ---------- Client ----------
const client: AxiosInstance = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
});

// ---------- Conversation State ----------
const messages: ChatMessage[] = [
  {
    role: "system",
    content:
      "You are a friendly AI assistant that can understand images and text.",
  },
];

// ---------- Core Function ----------
export async function sendMessage(
  content: ChatContent[] | string
): Promise<string | ChatContent[]> {
  messages.push({ role: "user", content });

  try {
    const res = await client.post<ChatCompletionResponse>("/chat/completions", {
      model: "google/gemini-2.5-pro",
      messages,
    });

    const reply = res.data.choices[0].message;
    console.log("Assistant:", reply.content);

    messages.push(reply);
    return reply;
  } catch (err: any) {
    console.error("Error:", err.response?.data || err.message);
  }
}
