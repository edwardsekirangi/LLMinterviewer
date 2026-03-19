import { NextRequest, NextResponse } from 'next/server';
import { roleLabels } from '@/lib/constants';
import type { Role } from '@/lib/types';

export async function POST(req: NextRequest) {
  const { rawQuestion, role } = await req.json() as { rawQuestion: string; role: Role };

  const roleLabel = roleLabels[role] ?? roleLabels.quant;

  const systemPrompt = `You are an expert interview coach for ${roleLabel} roles.
A candidate gives you a raw interview question they received. Your job is to:
1. Identify what the interviewer is REALLY testing underneath the surface question
2. Break the question into its components so the candidate understands exactly what to address
3. Recommend the best answer framework

Return ONLY valid JSON — no markdown, no backticks, no preamble:
{
  "question_type": "behavioral" or "technical",
  "clean_question": "A sharply reworded version of the question (1 sentence, precise)",
  "what_they_really_want": "What skill or quality the interviewer is actually testing (1 sentence)",
  "components": [
    { "label": "Component label", "description": "What you must address here" }
  ],
  "recommended_framework": "STAR" or "CAR" or "Concept-Application-Tradeoff" or "Problem-Solution-Impact",
  "framework_reason": "Why this framework fits this question (1 sentence)"
}
Maximum 3 components. Keep all text concise.`;

  const userMessage = `Role I am interviewing for: ${roleLabel}\n\nRaw question: ${rawQuestion}`;

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
      model: 'claude-haiku-4-5-20251001',
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
  const text: string = data.content[0].text;

  try {
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      question_type: 'technical',
      clean_question: rawQuestion,
      what_they_really_want: 'Your ability to communicate clearly.',
      components: [{ label: 'Core answer', description: 'Address the question directly' }],
      recommended_framework: 'STAR',
      framework_reason: 'Works for most interview question types.',
    });
  }
}
