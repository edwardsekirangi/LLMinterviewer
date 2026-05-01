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
  let res: Response;

  try {
    res = await fetch(url, {
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
          maxOutputTokens: 8192,
        },
      }),
    });
  } catch {
    return { error: `Network error calling ${model}`, status: 502 as const };
  }

  const rawText = await res.text().catch(() => '');

  if (!res.ok) {
    let message = `API error (${res.status}) from ${model}`;
    try {
      const err: { error?: { message?: string }; message?: string } = rawText ? JSON.parse(rawText) : {};
      message = err.error?.message ?? err.message ?? message;
    } catch {
      if (rawText.trim()) message = rawText;
    }
    return {
      error: message,
      status: res.status,
    } as const;
  }

  if (!rawText.trim()) {
    return { error: `Empty response from ${model}`, status: 502 as const };
  }

  try {
    const data = JSON.parse(rawText);
    const text = extractTextFromParts(data.candidates?.[0]?.content?.parts);
    if (!text.trim()) {
      return { error: `No text returned by ${model}`, status: 502 as const };
    }
    return { text, status: 200 as const };
  } catch {
    return { error: `Invalid JSON returned by ${model}`, status: 502 as const };
  }
}

export const DEFAULT_GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'] as const;

export async function generateGeminiJsonWithFallback({
  models = DEFAULT_GEMINI_MODELS,
  systemPrompt,
  userMessage,
}: {
  models?: readonly string[];
  systemPrompt: string;
  userMessage: string;
}) {
  let lastError = 'API error';
  let lastStatus = 500;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const result = await generateGeminiJson({ model, systemPrompt, userMessage });
      if (!('error' in result)) return result;
      const errorMessage = result.error ?? 'API error';
      const errorStatus = result.status ?? 500;
      lastError = errorMessage;
      lastStatus = errorStatus;

      const retryable = /high demand|quota|rate limit|temporarily unavailable|network error|empty response|invalid json/i.test(errorMessage);
      if (!retryable) {
        break;
      }

      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    }
  }

  return { error: `${lastError} [after fallback attempts]`, status: lastStatus } as const;
}
