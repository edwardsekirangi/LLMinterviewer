'use client';

import type { BulletScript } from '@/lib/types';

interface Props {
  loading: boolean;
  script: BulletScript | null;
  onNextQuestion: () => void;
}

export default function ScriptCard({ loading, script, onNextQuestion }: Props) {
  function copyScript() {
    const box = document.querySelector('.script-box');
    if (!box) return;
    navigator.clipboard.writeText((box as HTMLElement).innerText);
  }

  function speakScript() {
    const box = document.querySelector('.script-box');
    if (!box) return;
    const utterance = new SpeechSynthesisUtterance((box as HTMLElement).innerText);
    utterance.rate = 1.05;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  return (
    <div className="script-card">
      <div className="script-header">
        <div className="step-num s2">02</div>
        <div className="step-title">Your ready-to-say bullet script</div>
        <div className="step-badge done">Done ✓</div>
      </div>
      <div className="script-body">
        {loading && (
          <div className="loading-row">
            <div className="loading-dots"><span /><span /><span /></div>
            <div className="loading-text">Generating your bullet script…</div>
          </div>
        )}
        {!loading && script && (
          <>
            <div className="script-box">
              <div className="script-intro">{script.intro}</div>
              <ul className="script-list">
                {script.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <div className="script-close">{script.close}</div>
            </div>
            <div className="script-actions">
              <button type="button" className="btn-action" onClick={copyScript}>📋 Copy all bullets</button>
              <button type="button" className="btn-action speak" onClick={speakScript}>🔊 Speak the whole script</button>
              <button type="button" className="btn-action" onClick={onNextQuestion}>↺ New question</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
