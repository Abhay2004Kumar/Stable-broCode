// features/compiler/lib/judge0.ts

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const RAPID_API_KEY = process.env.RAPID_API_KEY;
const RAPID_API_HOST = 'judge0-ce.p.rapidapi.com';

interface SubmissionResponse {
  token: string;
  status?: {
    id: number;
    description: string;
  };
  stdout?: string;
  stderr?: string;
  compile_output?: string;
}

export async function submitCode(
  sourceCode: string,
  languageId: number,
  stdin: string = ''
): Promise<SubmissionResponse> {
  if (typeof window === 'undefined') {
    throw new Error('submitCode should only be called on the client side');
  }

  const response = await fetch('/api/compile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sourceCode,
      languageId,
      stdin,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit code');
  }

  return response.json();
}

export const languages = [
  // --- Updated Language Versions ---
  { id: 105, name: 'C++ (GCC 14.1.0)', extension: 'cpp' },
  { id: 50, name: 'C (GCC 11.2.0)', extension: 'c' },
  { id: 71, name: 'Python (3.11.2)', extension: 'py' },
  { id: 63, name: 'JavaScript (Node.js 20.1.0)', extension: 'js' },
  { id: 62, name: 'Java (OpenJDK 17.0.2)', extension: 'java' },
  { id: 60, name: 'Go (1.20.1)', extension: 'go' },
  { id: 108, name: 'Rust (1.85.0)', extension: 'rs' },
  
];