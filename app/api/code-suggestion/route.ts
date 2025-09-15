import { type NextRequest, NextResponse } from "next/server"
// --- NEW: Import the Google Generative AI SDK ---
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// --- NEW: Configuration for the Gemini API ---
const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.GOOGLE_API_KEY || "";

// --- NEW: Initialize the Generative AI Client (done once per module load) ---
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
  // A lower temperature is often better for code completion to get more predictable results
  temperature: 0.3, 
  topK: 1,
  topP: 1,
  maxOutputTokens: 512, // Increased token limit for potentially longer suggestions
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];


// --- Interfaces (unchanged) ---
interface CodeSuggestionRequest {
  fileContent: string
  cursorLine: number
  cursorColumn: number
  suggestionType: string
  fileName?: string
}

interface CodeContext {
  language: string
  framework: string
  beforeContext: string
  currentLine: string
  afterContext: string
  cursorPosition: { line: number; column: number }
  isInFunction: boolean
  isInClass: boolean
  isAfterComment: boolean
  incompletePatterns: string[]
}


export async function POST(request: NextRequest) {
  try {
    const body: CodeSuggestionRequest = await request.json()
    const { fileContent, cursorLine, cursorColumn, suggestionType, fileName } = body

    if (!fileContent || cursorLine < 0 || cursorColumn < 0 || !suggestionType) {
      return NextResponse.json({ error: "Invalid input parameters" }, { status: 400 })
    }

    const context = analyzeCodeContext(fileContent, cursorLine, cursorColumn, fileName)
    const prompt = buildPrompt(context, suggestionType)
    
    // This now calls the updated generateSuggestion function
    const suggestion = await generateSuggestion(prompt)

    return NextResponse.json({
      suggestion,
      context,
      metadata: {
        language: context.language,
        framework: context.framework,
        position: context.cursorPosition,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error: unknown) {
    console.error("Context analysis error:", error)
    return NextResponse.json({ error: "Internal server error", message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

/**
 * --- UPDATED: Generate suggestion using the Gemini API ---
 */
async function generateSuggestion(prompt: string): Promise<string> {
  if (!API_KEY) {
    console.error("GOOGLE_API_KEY is not set.");
    return "// AI suggestion unavailable: API key not configured.";
  }
  
  try {
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{text: prompt}] }],
        generationConfig,
        safetySettings,
    });

    const response = result.response;
    let suggestion = response.text();

    // Clean up the suggestion (your existing logic is great)
    if (suggestion.includes("```")) {
      const codeMatch = suggestion.match(/```[\w]*\n?([\s\S]*?)```/)
      suggestion = codeMatch ? codeMatch[1].trim() : suggestion
    }

    suggestion = suggestion.replace(/\|CURSOR\|/g, "").trim()
    
    return suggestion;
  } catch (error) {
    console.error("Gemini AI generation error:", error);
    return "// AI suggestion unavailable";
  }
}


// --- All your excellent helper functions for code analysis remain unchanged ---
function analyzeCodeContext(content: string, line: number, column: number, fileName?: string): CodeContext {
    const lines = content.split("\n")
    const currentLine = lines[line] || ""
  
    const contextRadius = 10
    const startLine = Math.max(0, line - contextRadius)
    const endLine = Math.min(lines.length, line + contextRadius)
  
    const beforeContext = lines.slice(startLine, line).join("\n")
    const afterContext = lines.slice(line + 1, endLine).join("\n")
  
    const language = detectLanguage(content, fileName)
    const framework = detectFramework(content)
  
    const isInFunction = detectInFunction(lines, line)
    const isInClass = detectInClass(lines, line)
    const isAfterComment = detectAfterComment(currentLine, column)
    const incompletePatterns = detectIncompletePatterns(currentLine, column)
  
    return {
      language,
      framework,
      beforeContext,
      currentLine,
      afterContext,
      cursorPosition: { line, column },
      isInFunction,
      isInClass,
      isAfterComment,
      incompletePatterns,
    }
}

function buildPrompt(context: CodeContext, suggestionType: string): string {
    return `You are an expert code completion assistant. Generate a ${suggestionType} suggestion.

Language: ${context.language}
Framework: ${context.framework}

Context:
${context.beforeContext}
${context.currentLine.substring(0, context.cursorPosition.column)}|CURSOR|${context.currentLine.substring(context.cursorPosition.column)}
${context.afterContext}

Analysis:
- In Function: ${context.isInFunction}
- In Class: ${context.isInClass}
- After Comment: ${context.isAfterComment}
- Incomplete Patterns: ${context.incompletePatterns.join(", ") || "None"}

Instructions:
1. Provide only the code that should be inserted at the cursor.
2. Do not add any explanations or markdown formatting like \`\`\`.
3. Maintain proper indentation and style.
4. Follow ${context.language} best practices.
5. Make the suggestion contextually appropriate.

Generate suggestion:`
}

function detectLanguage(content: string, fileName?: string): string {
    if (fileName) {
        const ext = fileName.split(".").pop()?.toLowerCase()
        const extMap: Record<string, string> = {
         ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript",
         py: "Python", java: "Java", go: "Go", rs: "Rust", php: "PHP",
        }
        if (ext && extMap[ext]) return extMap[ext]
    }
    if (content.includes("interface ") || content.includes(": string")) return "TypeScript"
    if (content.includes("def ") || content.includes("import ")) return "Python"
    if (content.includes("func ") || content.includes("package ")) return "Go"
    return "JavaScript"
}

function detectFramework(content: string): string {
    if (content.includes("import React") || content.includes("useState")) return "React"
    if (content.includes("import Vue") || content.includes("<template>")) return "Vue"
    if (content.includes("@angular/") || content.includes("@Component")) return "Angular"
    if (content.includes("next/") || content.includes("getServerSideProps")) return "Next.js"
    return "None"
}

function detectInFunction(lines: string[], currentLine: number): boolean {
    for (let i = currentLine - 1; i >= 0; i--) {
        const line = lines[i]
        if (line?.match(/^\s*(function|def|const\s+\w+\s*=|let\s+\w+\s*=)/)) return true
        if (line?.match(/^\s*}/)) break
    }
    return false
}
  
function detectInClass(lines: string[], currentLine: number): boolean {
    for (let i = currentLine - 1; i >= 0; i--) {
        const line = lines[i]
        if (line?.match(/^\s*(class|interface)\s+/)) return true
    }
    return false
}

function detectAfterComment(line: string, column: number): boolean {
    const beforeCursor = line.substring(0, column)
    return /\/\/.*$/.test(beforeCursor) || /#.*$/.test(beforeCursor)
}

function detectIncompletePatterns(line: string, column: number): string[] {
    const beforeCursor = line.substring(0, column)
    const patterns: string[] = []
    if (/^\s*(if|while|for)\s*\($/.test(beforeCursor.trim())) patterns.push("conditional")
    if (/^\s*(function|def)\s*$/.test(beforeCursor.trim())) patterns.push("function")
    if (/\{\s*$/.test(beforeCursor)) patterns.push("object")
    if (/\[\s*$/.test(beforeCursor)) patterns.push("array")
    if (/=\s*$/.test(beforeCursor)) patterns.push("assignment")
    if (/\.\s*$/.test(beforeCursor)) patterns.push("method-call")
    return patterns
}