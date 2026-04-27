'use client';

import { useRef, useState } from 'react';
import type { CodeLanguage } from '@/lib/types';

const languageLabels: Record<CodeLanguage, string> = {
  javascript: 'JavaScript',
  cpp: 'C++',
  mql5: 'MQL5',
  python: 'Python',
  sql: 'SQL',
};

interface Props {
  loading: boolean;
  onGenerate: (payload: { prompt: string; language: CodeLanguage }) => void;
}

export default function CodingHelpSection({ loading, onGenerate }: Props) {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<CodeLanguage>('python');
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  function getSupportedMimeType() {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
  }

  function getExtension(mimeType: string) {
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('ogg')) return 'ogg';
    return 'webm';
  }

  async function transcribeAudio(blob: Blob, mimeType: string) {
    setTranscribing(true);
    try {
      const ext = getExtension(mimeType);
      const form = new FormData();
      form.append('audio', blob);
      form.append('filename', `coding.${ext}`);

      const res = await fetch('/api/transcribe', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Transcription failed');

      const data = await res.json();
      const appended = prompt ? prompt.trimEnd() + ' ' + data.text : data.text;
      setPrompt(appended.trim());
    } catch {
      setMicError('Transcription failed. Please try again or type the prompt manually.');
    } finally {
      setTranscribing(false);
    }
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

  function toggleVoice() {
    isRecording ? stopRecording() : startRecording();
  }

  return (
    <div className="step-card active">
      <div className="step-header">
        <div className="step-num s2">02</div>
        <div className="step-title">Coding help</div>
        <div className={`step-badge ${loading ? 'active' : 'waiting'}`}>
          {loading ? 'Generating' : 'Ready'}
        </div>
      </div>
      <div className="step-body">
        <div className="sec-label">Pick a language</div>
        <div className="code-lang-row" style={{ marginBottom: 16 }}>
          {(Object.keys(languageLabels) as CodeLanguage[]).map((lang) => (
            <button
              key={lang}
              type="button"
              className={`code-lang-btn ${language === lang ? 'active' : ''}`}
              onClick={() => setLanguage(lang)}
            >
              {languageLabels[lang]}
            </button>
          ))}
        </div>

        {micError && <div className="error-bar">{micError}</div>}

        <div className="voice-row" style={{ marginTop: 0, marginBottom: 14 }}>
          <div className="voice-row-inner">
            <button
              type="button"
              className={`voice-btn${isRecording ? ' active' : ''}`}
              onClick={toggleVoice}
              disabled={transcribing}
            >
              <div className="mic-dot" />
              <span>
                {transcribing
                  ? 'Transcribing...'
                  : isRecording
                    ? 'Listening... (tap to stop)'
                    : 'Speak the coding prompt'}
              </span>
            </button>
          </div>
        </div>

        <textarea
          className="q-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder="Describe the coding problem in plain English. Example: write a function that finds the best entry and exit points for a moving average crossover strategy."
        />

        <div className="step-footer">
          <div className="char-count">{prompt.length} chars</div>
          <button
            type="button"
            className="btn-primary"
            disabled={loading || transcribing || prompt.trim().length < 10}
            onClick={() => onGenerate({ prompt, language })}
          >
            Get coding help →
          </button>
        </div>
      </div>
    </div>
  );
}
