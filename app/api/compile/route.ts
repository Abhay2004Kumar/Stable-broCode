// app/api/compile/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { sourceCode, languageId, stdin } = await req.json();
  
  const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': process.env.RAPID_API_KEY!,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    },
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin,
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to submit code to Judge0' },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}