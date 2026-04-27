import { NextRequest, NextResponse } from 'next/server';
import { roleLabels } from '@/lib/constants';
import type { Role } from '@/lib/types';
import { DEFAULT_GEMINI_MODEL, generateGeminiJson } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  const { rawQuestion, role } = await req.json() as { rawQuestion: string; role: Role };

  const roleLabel = roleLabels[role] ?? roleLabels.quant;

  const systemPrompt = `You are an expert interview coach for ${roleLabel} roles.
A candidate gives you a raw interview question they received. Your job is to:
1. Identify what the interviewer is REALLY testing underneath the surface question
2. Break the question into its components so the candidate understands exactly what to address
3. Recommend the best answer framework
4. If the question is coding-oriented, also generate a simple step-by-step coding helper with well-commented starter code
5. Include language-specific help for JavaScript, C++, MQL5, Python, and SQL when relevant

Return ONLY valid JSON - no markdown, no backticks, no preamble:
{
  "question_type": "behavioral" or "technical",
  "clean_question": "A sharply reworded version of the question (1 sentence, precise)",
  "what_they_really_want": "What skill or quality the interviewer is actually testing (1 sentence)",
  "components": [
    { "label": "Component label", "description": "What you must address here" }
  ],
  "recommended_framework": "STAR" or "CAR" or "Concept-Application-Tradeoff" or "Problem-Solution-Impact",
  "framework_reason": "Why this framework fits this question (1 sentence)",
  "code_help": {
    "title": "Short title for the coding helper",
    "language": "javascript" or "cpp" or "mql5" or "python" or "sql",
    "language_options": ["javascript", "cpp", "mql5", "python", "sql"],
    "goal": "What the user should build in simple plain English",
    "steps": [
      "Step 1: what to do first",
      "Step 2: next action",
      "Step 3: next action"
    ],
    "starter_code": "A short well-commented starter example or skeleton in the selected language",
    "notes": [
      "Important implementation note",
      "Edge case or interview tip"
    ]
  }
}
Maximum 3 components. Keep all text concise.`;

  const userMessage = `Role I am interviewing for: ${roleLabel}\n\nRaw question: ${rawQuestion}`;

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
      question_type: 'technical',
      clean_question: rawQuestion,
      what_they_really_want: 'Your ability to communicate clearly.',
      components: [{ label: 'Core answer', description: 'Address the question directly' }],
      recommended_framework: 'STAR',
      framework_reason: 'Works for most interview question types.',
      code_help: {
        title: 'Coding helper',
        language: 'python',
        language_options: ['javascript', 'cpp', 'mql5', 'python', 'sql'],
        goal: 'Build a clear solution plan before writing code.',
        steps: [
          'Step 1: Restate the problem and identify inputs, outputs, and constraints.',
          'Step 2: Choose the simplest algorithm that solves the core case.',
          'Step 3: Write commented starter code and then fill in the edge cases.',
        ],
        starter_code: `# Replace with your final solution
def solve():
    # 1. Read inputs
    # 2. Apply the core logic
    # 3. Return or print the result
    pass`,
        notes: ['Keep the solution simple first, then optimize if needed.'],
      },
    });
  }
}
