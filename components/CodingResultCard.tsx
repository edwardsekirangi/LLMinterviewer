'use client';

import type { CodingResult } from '@/lib/types';

interface Props {
  loading: boolean;
  result: CodingResult | null;
  onNewPrompt: () => void;
}

export default function CodingResultCard({ loading, result, onNewPrompt }: Props) {
  return (
    <div className="script-card">
      <div className="script-header">
        <div className="step-num s2">03</div>
        <div className="step-title">Coding help result</div>
        <div className="step-badge done">Done ✓</div>
      </div>
      <div className="script-body">
        {loading && (
          <div className="loading-row">
            <div className="loading-dots"><span /><span /><span /></div>
            <div className="loading-text">Generating coding help...</div>
          </div>
        )}

        {!loading && result && (
          <div className="structured-q-box">
            <div className="sq-type-row">
              <span className="sq-type-pill technical">Technical</span>
              <span className="sq-type-pill framework">Use: {result.recommended_framework}</span>
            </div>
            <div className="sq-headline">{result.clean_question}</div>
            <div className="sq-breakdown">
              <div className="sq-part">
                <div className="sq-part-label" style={{ color: 'var(--amber2)' }}>What they want</div>
                <div className="sq-part-text">{result.what_they_really_want}</div>
              </div>
              <div className="sq-part">
                <div className="sq-part-label" style={{ color: 'var(--green2)' }}>Framework</div>
                <div className="sq-part-text">{result.framework_reason}</div>
              </div>
            </div>

            <div className="code-help-box">
              <div className="sq-part-label" style={{ color: 'var(--amber2)' }}>
                {result.code_help.title}
              </div>
              <div className="sq-part-text">{result.code_help.goal}</div>
              <div className="code-lang-row">
                {result.code_help.language_options.map((lang) => (
                  <span key={lang} className="code-lang-btn active" style={{ cursor: 'default' }}>
                    {lang === 'cpp' ? 'C++' : lang === 'mql5' ? 'MQL5' : lang}
                  </span>
                ))}
              </div>
              <div className="code-step-list">
                {result.code_help.steps.map((step, i) => (
                  <div key={i} className="code-step-item">{step}</div>
                ))}
              </div>
              <pre className="code-starter">
                <code>{result.code_help.starter_code}</code>
              </pre>
              <div className="code-notes">
                {result.code_help.notes.map((note, i) => (
                  <div key={i} className="code-note">{note}</div>
                ))}
              </div>
            </div>

            <div className="script-actions">
              <button type="button" className="btn-action" onClick={onNewPrompt}>↺ New prompt</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
