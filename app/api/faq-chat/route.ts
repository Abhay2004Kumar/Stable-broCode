import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// --- Configuration ---
const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.GOOGLE_API_KEY || "";

// --- Interfaces ---
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// --- Initialize the Generative AI Client ---
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 1024,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// BroCode website context
const BROCODE_CONTEXT = `
You are the BroCode Assistant, a helpful AI chatbot specifically designed to help users with the BroCode platform. 

ABOUT BROCODE:
BroCode is a modern, cloud-based code editor and development environment that runs entirely in web browsers. It's a SaaS platform designed for developers, students, and educators.

KEY FEATURES:
1. Online Code Editor: Monaco Editor (same as VS Code) with syntax highlighting
2. Multi-Language Support: C++, C, Python, JavaScript, Java, Go, Rust
3. Framework Templates: React, Next.js, Vue, Angular, Express, Hono
4. WebContainer Integration: Run Node.js applications directly in browser
5. AI-Powered Assistance: Code suggestions, completions, and chat help
6. Online Compiler: Judge0 API integration for code execution
7. Project Management: Save, organize, and star favorite projects
8. Real-time Collaboration: Share projects and work together
9. Terminal Access: Full terminal access within the browser
10. Template Library: Quick project bootstrapping with pre-built templates

TECHNICAL STACK:
- Frontend: Next.js 15, TypeScript, Tailwind CSS
- Backend: Node.js, Prisma ORM, MongoDB
- Authentication: NextAuth with Google/GitHub OAuth
- AI: Google Generative AI (Gemini)
- Code Execution: Judge0 API, WebContainer API
- UI: shadcn/ui components with modern blue/cyan theme

USER FEATURES:
- Free tier with basic features
- Premium tier with advanced AI assistance
- User roles: USER, PREMIUM_USER, ADMIN
- Project starring/favorites system
- Dashboard for project management
- AI chat assistance in playground

WEBSITE STRUCTURE:
- Root page: Landing page with hero section
- Dashboard: Project management interface
- Playground: Code editor environment
- Compiler: Online code compilation
- Authentication: Sign-in with Google/GitHub

IMPORTANT GUIDELINES:
1. Only answer questions related to BroCode platform, coding, programming, and web development
2. If asked about unrelated topics, politely redirect to BroCode-related topics
3. Be helpful, friendly, and informative
4. Suggest relevant features when appropriate
5. Keep responses concise but comprehensive
6. Use a professional but approachable tone

If someone asks about topics unrelated to programming, coding, or the BroCode platform, politely let them know you're specialized in helping with BroCode and coding-related questions.
`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check if the question is relevant to BroCode/coding
    const isRelevantQuery = await checkRelevance(message);
    
    if (!isRelevantQuery) {
      return NextResponse.json({
        response: "I'm specifically designed to help with BroCode platform and coding-related questions. Feel free to ask me about our features, how to get started, programming languages we support, or any other development-related topics! 💻",
        isRelevant: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Prepare chat history with context
    const contextualHistory = [
      {
        role: "user",
        parts: [{ text: BROCODE_CONTEXT }]
      },
      {
        role: "model", 
        parts: [{ text: "I understand. I'm the BroCode Assistant and I'll help users with questions about the BroCode platform, coding, and web development. I'll keep responses focused on these topics and redirect unrelated questions appropriately." }]
      }
    ];

    // Transform user history
    const chatHistory = (history || []).map((msg: ChatMessage) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Start chat with context + history
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [...contextualHistory, ...chatHistory],
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = result.response;

    if (!response || !response.text()) {
      throw new Error("Received an empty response from the Gemini API.");
    }

    return NextResponse.json({
      response: response.text(),
      isRelevant: true,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error in FAQ chat route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to generate AI response.", details: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to check if query is relevant to BroCode/coding
async function checkRelevance(message: string): Promise<boolean> {
  const codingKeywords = [
    'code', 'coding', 'programming', 'developer', 'software', 'web', 'app', 'api', 
    'javascript', 'python', 'java', 'react', 'nextjs', 'vue', 'angular', 'node',
    'brocode', 'editor', 'compiler', 'terminal', 'project', 'template', 'ai',
    'function', 'variable', 'algorithm', 'debug', 'error', 'syntax', 'framework',
    'library', 'package', 'npm', 'git', 'github', 'deployment', 'hosting',
    'frontend', 'backend', 'fullstack', 'database', 'server', 'client',
    'html', 'css', 'typescript', 'rust', 'go', 'c++', 'premium', 'subscription',
    'dashboard', 'playground', 'webcontainer', 'collaboration', 'share'
  ];

  const lowerMessage = message.toLowerCase();
  
  // Check if message contains coding-related keywords
  const hasCodeKeywords = codingKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );

  // Check for question patterns about the platform
  const platformQuestions = [
    'how', 'what', 'where', 'when', 'why', 'can i', 'how do i', 
    'help', 'support', 'feature', 'use', 'work', 'start', 'create'
  ];

  const hasPlatformQuestions = platformQuestions.some(pattern =>
    lowerMessage.includes(pattern)
  );

  // Consider it relevant if it has coding keywords OR platform questions
  return hasCodeKeywords || hasPlatformQuestions;
}