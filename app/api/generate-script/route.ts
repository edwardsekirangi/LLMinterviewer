import { NextRequest, NextResponse } from 'next/server';
import { roleLabels } from '@/lib/constants';
import type { Role } from '@/lib/types';

export async function POST(req: NextRequest) {
  const { rawQuestion, role } = await req.json() as { rawQuestion: string; role: Role };

  const roleLabel = roleLabels[role] ?? roleLabels.quant;

  const systemPrompt = `You are an elite ${roleLabel} interview coach.
The candidate gives you a raw interview question.
Return ONLY a clean JSON object with exactly this structure (no markdown, no extra text):

{
  "intro": "The exact first sentence they should say (natural & confident)",
  "bullets": [
    "Full spoken sentence for bullet 1",
    "Full spoken sentence for bullet 2"
  ],
  "close": "Strong closing sentence"
}

Rules:
- 5-8 bullets maximum
- Each bullet is a complete, natural sentence ready to speak out loud
- Sound professional but conversational (no jargon unless role-appropriate)
- For Quant/Algo: include frameworks, math, or code steps
- For DS/SWE: mention metrics, tools, trade-offs
- For Fund Manager: mention P&L impact, risk, portfolio context
- Make it concise and high-signal — exactly what they should say in a real interview.`;

  const userMessage = `Role: ${roleLabel}\n\nQuestion: ${rawQuestion}`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error?.message ?? 'API error' }, { status: res.status });
  }

  const data = await res.json();
  const raw: string = data.content[0].text;
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      intro: "Here's how I'd approach this question.",
      bullets: ["Bullet 1 placeholder.", "Bullet 2 placeholder."],
      close: "That's my complete answer.",
    });
  }
}
