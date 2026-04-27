'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CodeLanguage, StructuredQuestion } from '@/lib/types';

interface Props {
  loading: boolean;
  structuredData: StructuredQuestion | null;
}

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function labelForLanguage(lang: CodeLanguage) {
  if (lang === 'cpp') return 'C++';
  if (lang === 'mql5') return 'MQL5';
  return lang;
}

export default function StepTwo({ loading, structuredData }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>('python');
  const badgeState = loading ? 'active' : structuredData ? 'done' : 'waiting';
  const badgeLabel = loading ? 'Processing' : structuredData ? 'Done' : 'Processing';
  const codeHelp = structuredData?.code_help;
  const languages = useMemo(
    (): CodeLanguage[] => codeHelp?.language_options ?? ['javascript', 'cpp', 'mql5', 'python', 'sql'],
    [codeHelp],
  );
  const activeLanguage = selectedLanguage;

  useEffect(() => {
    if (codeHelp?.language) {
      setSelectedLanguage(codeHelp.language);
    }
  }, [codeHelp?.language]);

  return (
    <div className="step-card">
      <div className="step-header">
        <div className="step-num s2">02</div>
        <div className="step-title">Structured question - understand what&apos;s really being asked</div>
        <div className={`step-badge ${badgeState}`}>{badgeLabel}</div>
      </div>
      <div className="step-body">
        {loading && (
          <div className="loading-row">
            <div className="loading-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="loading-text">Structuring your question...</div>
          </div>
        )}
        {!loading && structuredData && (
          <div className="structured-q-box">
            <div className="sq-type-row">
              <span className={`sq-type-pill ${structuredData.question_type}`}>
                {cap(structuredData.question_type)}
              </span>
              <span className="sq-type-pill framework">Use: {structuredData.recommended_framework}</span>
            </div>
            <div className="sq-headline">{structuredData.clean_question}</div>
            <div className="sq-breakdown">
              <div className="sq-part">
                <div className="sq-part-label" style={{ color: 'var(--amber2)' }}>What they want</div>
                <div className="sq-part-text">{structuredData.what_they_really_want}</div>
              </div>
              {structuredData.components.map((c, i) => (
                <div key={i} className="sq-part">
                  <div className="sq-part-label">{c.label}</div>
                  <div className="sq-part-text">{c.description}</div>
                </div>
              ))}
              <div className="sq-part">
                <div className="sq-part-label" style={{ color: 'var(--green2)' }}>
                  Why {structuredData.recommended_framework}
                </div>
                <div className="sq-part-text">{structuredData.framework_reason}</div>
              </div>
            </div>

            {structuredData.question_type === 'technical' && codeHelp && (
              <div className="code-help-box">
                <div className="code-help-head">
                  <div>
                    <div className="sq-part-label" style={{ color: 'var(--amber2)' }}>
                      {codeHelp.title}
                    </div>
                    <div className="sq-part-text">{codeHelp.goal}</div>
                  </div>

                  <div className="code-lang-row">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        className={`code-lang-btn ${activeLanguage === lang ? 'active' : ''}`}
                        onClick={() => setSelectedLanguage(lang)}
                      >
                        {labelForLanguage(lang)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sq-part-text" style={{ marginTop: '12px' }}>
                  Current language: {labelForLanguage(activeLanguage)}
                </div>

                <div className="code-step-list">
                  {codeHelp.steps.map((step, i) => (
                    <div key={i} className="code-step-item">{step}</div>
                  ))}
                </div>

                <pre className="code-starter">
                  <code>{codeHelp.starter_code}</code>
                </pre>

                {codeHelp.notes.length > 0 && (
                  <div className="code-notes">
                    {codeHelp.notes.map((note, i) => (
                      <div key={i} className="code-note">{note}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
