'use client';

import { useRef, useState } from 'react';

interface Props {
  rawQuestion: string;
  onQuestionChange: (val: string) => void;
  onGenerate: () => void;
  loading: boolean;
  done: boolean;
}

export default function StepOne({ rawQuestion, onQuestionChange, onGenerate, loading, done }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const badgeState = loading ? 'active' : done ? 'done' : 'waiting';
  const badgeLabel = loading ? 'Generating…' : done ? 'Done' : 'Ready';
  const stepNumClass = done ? 'step-num done-num' : 'step-num s1';
  const stepNumText = done ? '✓' : '01';

  function getSupportedMimeType() {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
  }

  function getExtension(mimeType: string) {
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('ogg')) return 'ogg';
    return 'webm';
  }

  async function startRecording() {
    setMicError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const resolvedMime = recorder.mimeType;
        const blob = new Blob(chunksRef.current, { type: resolvedMime });
        await transcribeAudio(blob, resolvedMime);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setMicError('Microphone access denied. Please allow mic permissions and try again.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function transcribeAudio(blob: Blob, mimeType: string) {
    setTranscribing(true);
    try {
      const ext = getExtension(mimeType);
      const form = new FormData();
      form.append('audio', blob);
      form.append('filename', `recording.${ext}`);

      const res = await fetch('/api/transcribe', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Transcription failed');

      const data = await res.json();
      const appended = rawQuestion ? rawQuestion.trimEnd() + ' ' + data.text : data.text;
      onQuestionChange(appended.trim());
    } catch {
      setMicError('Transcription failed. Please try again or type the question manually.');
    } finally {
      setTranscribing(false);
    }
  }

  function toggleVoice() {
    isRecording ? stopRecording() : startRecording();
  }

  const micLabel = transcribing
    ? 'Transcribing…'
    : isRecording
    ? 'Listening… (tap to stop)'
    : 'Speak the question';

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

        {micError && <div className="error-bar">{micError}</div>}

        <div className="voice-row">
          <div className="voice-row-inner">
            <button
              type="button"
              className={`voice-btn${isRecording ? ' active' : ''}`}
              onClick={toggleVoice}
              disabled={transcribing}
            >
              <div className="mic-dot" />
              <span>{micLabel}</span>
            </button>
          </div>
        </div>

        <div className="step-footer">
          <div className="char-count">{rawQuestion.length} chars</div>
          <div className="btn-group">
            {rawQuestion.length > 0 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onQuestionChange('')}
                disabled={loading}
              >
                Clear
              </button>
            )}
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
    </div>
  );
}
