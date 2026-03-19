'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  rawQuestion: string;
  onQuestionChange: (val: string) => void;
  onGenerate: () => void;
  loading: boolean;
  done: boolean;
}

export default function StepOne({ rawQuestion, onQuestionChange, onGenerate, loading, done }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const finalTextRef = useRef('');

  const badgeState = loading ? 'active' : done ? 'done' : 'waiting';
  const badgeLabel = loading ? 'Generating…' : done ? 'Done' : 'Ready';
  const stepNumClass = done ? 'step-num done-num' : 'step-num s1';
  const stepNumText = done ? '✓' : '01';

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    setVoiceSupported(true);
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
          finalTextRef.current += e.results[i][0].transcript + ' ';
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      onQuestionChange((finalTextRef.current + interim).trim());
    };

    rec.onerror = () => stopVoice();
    rec.onend = () => { if (isRecordingRef.current) rec.start(); };

    recognitionRef.current = rec;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startVoice() {
    if (!recognitionRef.current) return;
    finalTextRef.current = rawQuestion;
    isRecordingRef.current = true;
    setIsRecording(true);
    recognitionRef.current.start();
  }

  function stopVoice() {
    isRecordingRef.current = false;
    setIsRecording(false);
    recognitionRef.current?.stop();
  }

  function toggleVoice() {
    isRecording ? stopVoice() : startVoice();
  }

  return (
    <div className="step-card active">
      <div className="step-header">
        <div className={stepNumClass}>{stepNumText}</div>
        <div className="step-title">Paste or speak your interview question</div>
        <div className={`step-badge ${badgeState}`}>{badgeLabel}</div>
      </div>
      <div className="step-body">
        <textarea
          className="q-textarea"
          value={rawQuestion}
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder={`Paste the question here (or use the mic below)…\ne.g. Walk me through how you would build a momentum trading strategy`}
          rows={5}
        />

        <div className="voice-row">
          <div className="voice-row-inner">
            {voiceSupported && (
              <button
                type="button"
                className={`voice-btn${isRecording ? ' active' : ''}`}
                onClick={toggleVoice}
              >
                <div className="mic-dot" />
                <span>{isRecording ? 'Listening… (click to stop)' : 'Speak the question'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="step-footer">
          <div className="char-count">{rawQuestion.length} chars</div>
          <button
            type="button"
            className="btn-primary"
            onClick={onGenerate}
            disabled={rawQuestion.trim().length < 15 || loading}
          >
            Generate Bullet Script →
          </button>
        </div>
      </div>
    </div>
  );
}
