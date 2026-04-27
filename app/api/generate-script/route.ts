import { NextRequest, NextResponse } from 'next/server';
import { roleLabels } from '@/lib/constants';
import type { Role } from '@/lib/types';
import { generateGeminiJsonWithFallback } from '@/lib/gemini';

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

  const result = await generateGeminiJsonWithFallback({
    systemPrompt,
    userMessage,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const text = result.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

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
