'use client';

// This is the main page of the app. It manages the overall state and flow of the application, including:
// - The current role selected by the user (quant, product manager, etc.)
// - The raw question input by the user
// - The generated script returned from the API
// - Loading and error states
// It renders the Header, RoleSelector, StepOne, and ScriptCard components, passing down necessary props and handlers.
import { useRef, useState } from 'react';
import Header from '@/components/Header';
import CodingHelpSection from '@/components/CodingHelpSection';
import RoleSelector from '@/components/RoleSelector';
import StepOne from '@/components/StepOne';
import CodingResultCard from '@/components/CodingResultCard';
import ScriptCard from '@/components/ScriptCard';
import type { BulletScript, CodingResult, CodeLanguage, Role, AppSection } from '@/lib/types';

export default function Home() {
  const [currentRole, setCurrentRole] = useState<Role>('quant');
  const [rawQuestion, setRawQuestion] = useState('');
  const [script, setScript] = useState<BulletScript | null>(null);
  const [codingResult, setCodingResult] = useState<CodingResult | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [section, setSection] = useState<AppSection>('interview');
  const scriptCardRef = useRef<HTMLDivElement>(null);

  async function handleGenerate() {
    setError('');
    setLoading(true);
    setShowScript(true);
    setScript(null);
    setCodingResult(null);

    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawQuestion, role: currentRole }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'API error');
      }
      const data: BulletScript = await res.json();
      setScript(data);
      setDone(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError('Error: ' + msg);
      setShowScript(false);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scriptCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }

  async function handleCodingHelp(payload: { prompt: string; language: CodeLanguage }) {
    setError('');
    setLoading(true);
    setShowScript(true);
    setScript(null);
    setCodingResult(null);

    try {
      const res = await fetch('/api/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawQuestion: payload.prompt,
          role: currentRole,
          mode: 'coding',
          language: payload.language,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'API error');
      }
      const data: CodingResult = await res.json();
      setCodingResult(data);
      setDone(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError('Error: ' + msg);
      setShowScript(false);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scriptCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }

  function handleNextQuestion() {
    setRawQuestion('');
    setScript(null);
    setShowScript(false);
    setDone(false);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="shell">
      <Header />
      <RoleSelector currentRole={currentRole} onRoleChange={setCurrentRole} />

      <div className="mode-switch">
        <button
          type="button"
          className={`mode-pill ${section === 'interview' ? 'active' : ''}`}
          onClick={() => setSection('interview')}
        >
          Interview help
        </button>
        <button
          type="button"
          className={`mode-pill ${section === 'coding' ? 'active' : ''}`}
          onClick={() => setSection('coding')}
        >
          Coding help
        </button>
      </div>

      {error && <div className="error-bar">{error}</div>}

      {section === 'interview' ? (
        <StepOne
          rawQuestion={rawQuestion}
          onQuestionChange={setRawQuestion}
          onGenerate={handleGenerate}
          loading={loading}
          done={done}
        />
      ) : (
        <CodingHelpSection loading={loading} onGenerate={handleCodingHelp} />
      )}

      {showScript && section === 'interview' && (
        <div ref={scriptCardRef}>
          <ScriptCard loading={loading} script={script} onNextQuestion={handleNextQuestion} />
        </div>
      )}

      {showScript && section === 'coding' && (
        <div ref={scriptCardRef}>
          <CodingResultCard loading={loading} result={codingResult} onNewPrompt={handleNextQuestion} />
        </div>
      )}
    </div>
  );
}
