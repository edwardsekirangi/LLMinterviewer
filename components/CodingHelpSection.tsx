'use client';

import { useState } from 'react';
import type { CodeLanguage } from '@/lib/types';

const languageLabels: Record<CodeLanguage, string> = {
  javascript: 'JavaScript',
  cpp: 'C++',
  mql5: 'MQL5',
  python: 'Python',
  sql: 'SQL',
};

interface Props {
  loading: boolean;
  onGenerate: (payload: { prompt: string; language: CodeLanguage }) => void;
}

export default function CodingHelpSection({ loading, onGenerate }: Props) {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<CodeLanguage>('python');

  return (
    <div className="step-card active">
      <div className="step-header">
        <div className="step-num s2">02</div>
        <div className="step-title">Coding help</div>
        <div className={`step-badge ${loading ? 'active' : 'waiting'}`}>
          {loading ? 'Generating' : 'Ready'}
        </div>
      </div>
      <div className="step-body">
        <div className="sec-label">Pick a language</div>
        <div className="code-lang-row" style={{ marginBottom: 16 }}>
          {(Object.keys(languageLabels) as CodeLanguage[]).map((lang) => (
            <button
              key={lang}
              type="button"
              className={`code-lang-btn ${language === lang ? 'active' : ''}`}
              onClick={() => setLanguage(lang)}
            >
              {languageLabels[lang]}
            </button>
          ))}
        </div>

        <textarea
          className="q-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder="Describe the coding problem in plain English. Example: write a function that finds the best entry and exit points for a moving average crossover strategy."
        />

        <div className="step-footer">
          <div className="char-count">{prompt.length} chars</div>
          <button
            type="button"
            className="btn-primary"
            disabled={loading || prompt.trim().length < 10}
            onClick={() => onGenerate({ prompt, language })}
          >
            Get coding help →
          </button>
        </div>
      </div>
    </div>
  );
}
