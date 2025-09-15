// app/api/chat/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// --- Configuration ---
const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.GOOGLE_API_KEY || "";

// --- Interfaces (can be simplified) ---
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// --- Initialize the Generative AI Client ---
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

// These safety settings are important to prevent harmful content
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    
    // Transform the history to the format required by the Google AI SDK
    // The SDK uses "model" for the assistant's role
    const chatHistory = (history || []).map((msg: ChatMessage) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Start a chat session with the model, including the history
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: chatHistory,
    });

    // Send the new message and get the response
    const result = await chat.sendMessage(message);
    const response = result.response;

    if (!response || !response.text()) {
       throw new Error("Received an empty response from the Gemini API.");
    }

    return NextResponse.json({
      response: response.text(),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error in Gemini chat route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to generate AI response.", details: errorMessage },
      { status: 500 }
    );
  }
}