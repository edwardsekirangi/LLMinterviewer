import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
  }

  const formData = await req.formData();
  const audio = formData.get('audio') as Blob | null;
  const filename = (formData.get('filename') as string | null) ?? 'recording.webm';

  if (!audio) {
    return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
  }

  const groqForm = new FormData();
  groqForm.append('file', audio, filename);
  groqForm.append('model', 'whisper-large-v3');
  groqForm.append('language', 'en');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: groqForm,
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error?.message ?? 'Groq API error' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ text: data.text });
}
