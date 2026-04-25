import { NextRequest, NextResponse } from 'next/server';
import { roleLabels } from '@/lib/constants';
import type { Role } from '@/lib/types';
import { DEFAULT_GEMINI_MODEL, generateGeminiJson } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  const { answer, role, rawQuestion, framework } = await req.json() as {
    answer: string;
    role: Role;
    rawQuestion: string;
    framework: string;
  };

  const roleLabel = roleLabels[role] ?? roleLabels.quant;

  const systemPrompt = `You are a sharp, honest interview coach for ${roleLabel} roles.
Analyse the candidate's answer against the structured question and give direct, specific coaching.

Return ONLY valid JSON — no markdown, no backticks, no preamble:
{
  "strength": "1-2 sentences on what they said that actually worked",
  "missing": "1-2 sentences on the most important thing missing or unclear — be specific",
  "structure_tip": "Exactly how they should have structured this using the ${framework} framework — 2 sentences max",
  "ideal_blocks": [
    { "label": "Block label", "content": "What they should say in this block — specific, concrete, 1-3 sentences" }
  ],
  "score": 52
}
ideal_blocks must match the ${framework} framework labels exactly.
score is 0-100 for structure and clarity only — not knowledge depth.
Be honest. Most first attempts score 30-55.`;

  const userMessage = `Role: ${roleLabel}\nQuestion: ${rawQuestion}\nFramework: ${framework}\nCandidate answer: ${answer}`;

  const result = await generateGeminiJson({
    model: DEFAULT_GEMINI_MODEL,
    systemPrompt,
    userMessage,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const text = result.text;

  try {
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      strength: 'You clearly have knowledge of this topic.',
      missing: 'Your answer needed more structure.',
      structure_tip: `Use the ${framework} framework to organise your points.`,
      ideal_blocks: [
        { label: 'Opening', content: 'Start with a clear one-sentence thesis.' },
        { label: 'Body', content: 'Walk through each component with a concrete example.' },
        { label: 'Closing', content: 'Land with a specific outcome or learning.' },
      ],
      score: 38,
    });
  }
}
