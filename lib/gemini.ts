export function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY ?? process.env['Gemini API Key'];
}

function extractTextFromParts(parts: Array<{ text?: string }> | undefined) {
  return parts?.map((part) => part.text ?? '').join('').trim() ?? '';
}

export async function generateGeminiJson({
  model,
  systemPrompt,
  userMessage,
}: {
  model: string;
  systemPrompt: string;
  userMessage: string;
}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return { error: 'GEMINI_API_KEY not configured', status: 500 as const };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 1200,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      error: err.error?.message ?? 'API error',
      status: res.status,
    } as const;
  }

  const data = await res.json();
  const text = extractTextFromParts(data.candidates?.[0]?.content?.parts);
  return { text, status: 200 as const };
}

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite';
