'use client';

import { useRef, useState } from 'react';
import Header from '@/components/Header';
import RoleSelector from '@/components/RoleSelector';
import StepOne from '@/components/StepOne';
import ScriptCard from '@/components/ScriptCard';
import type { BulletScript, Role } from '@/lib/types';

export default function Home() {
  const [currentRole, setCurrentRole] = useState<Role>('quant');
  const [rawQuestion, setRawQuestion] = useState('');
  const [script, setScript] = useState<BulletScript | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const scriptCardRef = useRef<HTMLDivElement>(null);

  async function handleGenerate() {
    setError('');
    setLoading(true);
    setShowScript(true);
    setScript(null);

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

      {error && <div className="error-bar">{error}</div>}

      <StepOne
        rawQuestion={rawQuestion}
        onQuestionChange={setRawQuestion}
        onGenerate={handleGenerate}
        loading={loading}
        done={done}
      />

      {showScript && (
        <div ref={scriptCardRef}>
          <ScriptCard loading={loading} script={script} onNextQuestion={handleNextQuestion} />
        </div>
      )}
    </div>
  );
}
