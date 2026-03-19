'use client';

import { useEffect, useRef, useState } from 'react';
import type { CoachingResult } from '@/lib/types';
import CoachingPanel from './CoachingPanel';

interface Props {
  answerText: string;
  onAnswerChange: (val: string) => void;
  onCoach: () => void;
  coaching: CoachingResult | null;
  coachLoading: boolean;
  onNextQuestion: () => void;
  step3Done: boolean;
}

export default function StepThree({
  answerText,
  onAnswerChange,
  onCoach,
  coaching,
  coachLoading,
  onNextQuestion,
  step3Done,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const finalRef = useRef('');
  const answerZoneRef = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  const badgeState = coachLoading ? 'active' : step3Done ? 'done' : 'active';
  const badgeLabel = coachLoading ? 'Coaching…' : step3Done ? 'Done ✓' : 'Your turn';
  const stepNumClass = step3Done ? 'step-num done-num' : 'step-num s3';
  const stepNumText = step3Done ? '✓' : '03';

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SR) {
      setVoiceSupported(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalRef.current += e.results[i][0].transcript + ' ';
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      onAnswerChange(finalRef.current + interim);
    };

    rec.onerror = () => stopVoice();
    rec.onend = () => {
      if (isRecording) rec.start();
    };

    recognitionRef.current = rec;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (card3Ref.current) {
      setTimeout(() => card3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 200);
    }
  }, []);

  function startVoice() {
    if (!recognitionRef.current) return;
    finalRef.current = answerText;
    setIsRecording(true);
    recognitionRef.current.start();
    answerZoneRef.current?.classList.add('recording');
  }

  function stopVoice() {
    setIsRecording(false);
    recognitionRef.current?.stop();
    answerZoneRef.current?.classList.remove('recording');
  }

  function toggleVoice() {
    isRecording ? stopVoice() : startVoice();
  }

  return (
    <div className="step-card" ref={card3Ref}>
      <div className="step-header">
        <div className={stepNumClass}>{stepNumText}</div>
        <div className="step-title">Your answer</div>
        <div className={`step-badge ${badgeState}`}>{badgeLabel}</div>
      </div>
      <div className="step-body">
        <div className="answer-zone" ref={answerZoneRef}>
          <textarea
            className="a-textarea"
            value={answerText}
            onChange={(e) => onAnswerChange(e.target.value)}
            rows={5}
            placeholder="Answer the structured question above. Speak freely — don't self-edit, just answer as you would in the real interview…"
          />
          <div className="voice-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {voiceSupported ? (
                <button
                  className={`voice-btn${isRecording ? ' active' : ''}`}
                  onClick={toggleVoice}
                >
                  <div className="mic-dot" />
                  <span>{isRecording ? 'Listening… (click to stop)' : 'Speak your answer'}</span>
                </button>
              ) : (
                <span className="no-voice-msg">Voice not supported — type your answer</span>
              )}
            </div>
            <button
              className="btn-primary"
              onClick={onCoach}
              disabled={answerText.trim().length < 30 || coachLoading}
            >
              Get coaching →
            </button>
          </div>
        </div>

        {coachLoading && (
          <div className="loading-row" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <div className="loading-dots">
              <span /><span /><span />
            </div>
            <div className="loading-text">Coaching your answer…</div>
          </div>
        )}

        {!coachLoading && coaching && (
          <CoachingPanel coaching={coaching} onNextQuestion={onNextQuestion} />
        )}
      </div>
    </div>
  );
}
