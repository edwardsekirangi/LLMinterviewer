import { useEffect, useRef } from 'react';
import type { CoachingResult } from '@/lib/types';

interface Props {
  coaching: CoachingResult;
  onNextQuestion: () => void;
}

export default function CoachingPanel({ coaching, onNextQuestion }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = coaching.score + '%';
    }, 300);
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }, [coaching]);

  return (
    <div className="coaching-panel" ref={panelRef}>
      <div className="coach-block">
        <div className="coach-block-header">
          <div className="coach-block-title strength">💪 What you did well</div>
        </div>
        <p>{coaching.strength}</p>
      </div>

      <div className="coach-block">
        <div className="coach-block-header">
          <div className="coach-block-title missed">⚠ What was missing or unclear</div>
        </div>
        <p>{coaching.missing}</p>
      </div>

      <div className="coach-block">
        <div className="coach-block-header">
          <div className="coach-block-title structure">📐 How to structure this answer</div>
        </div>
        <p>{coaching.structure_tip}</p>
      </div>

      <div className="coach-block">
        <div className="coach-block-header">
          <div className="coach-block-title ideal">✦ Ideal structured answer</div>
        </div>
        <div className="ideal-answer">
          {coaching.ideal_blocks.map((b, i) => (
            <div key={i} className="ideal-block">
              <div className="ideal-block-label">{b.label}</div>
              <p>{b.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="score-strip">
        <div className="score-strip-label">Structure score</div>
        <div className="score-bar-track">
          <div className="score-bar-fill" ref={fillRef} style={{ width: '0%' }} />
        </div>
        <div className="score-val">{coaching.score}/100</div>
      </div>

      <div className="next-btn-row">
        <button className="btn-secondary" onClick={onNextQuestion}>
          ↺ Try another question
        </button>
      </div>
    </div>
  );
}
