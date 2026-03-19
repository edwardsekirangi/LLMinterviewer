import type { StructuredQuestion } from '@/lib/types';

interface Props {
  loading: boolean;
  structuredData: StructuredQuestion | null;
}

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

export default function StepTwo({ loading, structuredData }: Props) {
  const badgeState = loading ? 'active' : structuredData ? 'done' : 'waiting';
  const badgeLabel = loading ? 'Processing' : structuredData ? 'Done' : 'Processing';

  return (
    <div className="step-card">
      <div className="step-header">
        <div className="step-num s2">02</div>
        <div className="step-title">Structured question — understand what&#39;s really being asked</div>
        <div className={`step-badge ${badgeState}`}>{badgeLabel}</div>
      </div>
      <div className="step-body">
        {loading && (
          <div className="loading-row">
            <div className="loading-dots">
              <span /><span /><span />
            </div>
            <div className="loading-text">Structuring your question…</div>
          </div>
        )}
        {!loading && structuredData && (
          <div className="structured-q-box">
            <div className="sq-type-row">
              <span className={`sq-type-pill ${structuredData.question_type}`}>
                {cap(structuredData.question_type)}
              </span>
              <span className="sq-type-pill framework">
                Use: {structuredData.recommended_framework}
              </span>
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
          </div>
        )}
      </div>
    </div>
  );
}
