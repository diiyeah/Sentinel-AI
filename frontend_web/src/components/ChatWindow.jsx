import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Send, Sparkles, FileSearch, BookOpen, Zap, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';
import { API_BASE_URL } from '../config';

const SUGGESTIONS = [
  { icon: <FileSearch size={14} />, text: 'Summarize the key points of this document' },
  { icon: <BookOpen size={14} />, text: 'What are the main topics covered?' },
  { icon: <Zap size={14} />, text: 'List the most important definitions' },
];

const EL_KEY   = import.meta.env.VITE_ELEVENLABS_API_KEY;
const EL_VOICE = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

// ── Whisper STT (via Groq — free) + ElevenLabs TTS hook ────
function useVoice({ onTranscript, onSend }) {
  const [listening, setListening] = useState(false);
  const [speaking,  setSpeaking]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const audioRef         = useRef(null);
  const supported = !!(navigator.mediaDevices?.getUserMedia);

  const toggleListen = useCallback(async () => {
    if (listening) {
      mediaRecorderRef.current?.stop();
      setListening(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setLoading(true);
        try {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('file', blob, 'audio.webm');
          const res = await fetch(`${API_BASE_URL}/transcribe`, {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Transcription failed');
          }
          const transcript = data.text?.trim() || '';
          if (transcript) { onTranscript(transcript); onSend(transcript); }
        } catch (err) {
          console.error('Whisper error:', err);
        } finally {
          setLoading(false);
        }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setListening(true);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  }, [listening, onTranscript, onSend]);

  const speak = useCallback(async (text) => {
    if (!text) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    // Use ElevenLabs if key is available, otherwise fall back to browser TTS
    if (EL_KEY && EL_KEY !== 'your_elevenlabs_api_key_here') {
      setSpeaking(true);
      try {
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE}/stream`,
          {
            method: 'POST',
            headers: { 'xi-api-key': EL_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: text.slice(0, 500),
              model_id: 'eleven_monolingual_v1',
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
          }
        );
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
        audio.onerror = () => setSpeaking(false);
        audio.play();
      } catch (err) {
        console.error('ElevenLabs TTS error:', err);
        setSpeaking(false);
      }
    } else {
      // Browser built-in TTS fallback
      window.speechSynthesis?.cancel();
      const utt = new SpeechSynthesisUtterance(text.slice(0, 500));
      utt.rate = 1; utt.pitch = 1;
      utt.onstart = () => setSpeaking(true);
      utt.onend   = () => setSpeaking(false);
      utt.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utt);
    }
  }, []);

  const stopSpeak = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { listening, supported, speaking, loading, toggleListen, speak, stopSpeak };
}

export default function ChatWindow({ messages, isGenerating, onSendMessage, onCitationClick, hasDocuments }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const bottomRef   = useRef(null);

  const { listening, supported, speaking, loading, toggleListen, speak, stopSpeak } = useVoice({
    onTranscript: (t) => setInput(t),
    onSend: (t) => {
      if (t.trim() && hasDocuments) {
        onSendMessage(t.trim());
        setInput('');
      }
    },
  });

  // Auto-speak last AI message
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant' && last.content && !last.isQuiz) {
      // strip markdown for TTS
      const plain = last.content.replace(/[#*`_~\[\]]/g, '').slice(0, 500);
      speak(plain);
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

  const submit = (e) => {
    e?.preventDefault();
    if (input.trim() && !isGenerating) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const canSend = input.trim() && !isGenerating && hasDocuments;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {messages.length === 0 ? (
          <EmptyState hasDocuments={hasDocuments} />
        ) : (
          <div style={{ maxWidth: 740, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  message={msg}
                  onCitationClick={onCitationClick}
                  onSpeak={speak}
                  onStopSpeak={stopSpeak}
                  isSpeaking={speaking}
                />
              ))}
            </AnimatePresence>
            {isGenerating && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div style={{ padding: '0 20px 18px', background: 'var(--bg-base)', flexShrink: 0, transition: 'background 0.25s' }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>

          {/* Voice status banner */}
          <AnimatePresence>
            {(listening || loading) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 14px', borderRadius: 9, marginBottom: 8,
                  background: loading ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${loading ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`,
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: loading ? '#fbbf24' : '#ef4444',
                  animation: 'pulse-icon 1s ease-in-out infinite',
                }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: loading ? '#fcd34d' : '#fca5a5' }}>
                  {loading ? 'Transcribing with Whisper…' : 'Recording… speak now'}
                </span>
                {!loading && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  Click mic again to stop
                </span>}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={submit}>
            <div
              className="glass"
              style={{
                display: 'flex', alignItems: 'flex-end', gap: 6,
                padding: 7, borderRadius: 13,
                border: `1px solid ${listening ? 'rgba(239,68,68,0.4)' : 'var(--border-default)'}`,
                boxShadow: listening ? '0 0 0 3px rgba(239,68,68,0.1)' : 'var(--shadow-md)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={listening ? 'Listening…' : hasDocuments ? 'Ask a question or press mic to speak…' : 'Upload a document first…'}
                disabled={isGenerating || !hasDocuments}
                rows={1}
                style={{
                  flex: 1, minHeight: 42, maxHeight: 180,
                  padding: '10px 12px',
                  background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                  fontSize: 14, lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit', fontWeight: 400,
                }}
              />

              {/* TTS stop button */}
              {speaking && (
                <button type="button" onClick={stopSpeak}
                  title="Stop speaking"
                  style={{
                    width: 36, height: 36, flexShrink: 0, borderRadius: 8,
                    background: 'rgba(245,158,11,0.15)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    color: '#fbbf24', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                  <VolumeX size={16} />
                </button>
              )}

              {/* Mic button */}
              {supported && (
                <button type="button" onClick={toggleListen}
                  disabled={!hasDocuments || isGenerating || loading}
                  title={listening ? 'Stop recording' : loading ? 'Transcribing…' : 'Voice input (Whisper)'}
                  style={{
                    width: 36, height: 36, flexShrink: 0, borderRadius: 8,
                    background: listening ? 'rgba(239,68,68,0.15)' : loading ? 'rgba(245,158,11,0.12)' : 'var(--bg-active)',
                    border: `1px solid ${listening ? 'rgba(239,68,68,0.35)' : loading ? 'rgba(245,158,11,0.3)' : 'var(--border-default)'}`,
                    color: listening ? '#f87171' : loading ? '#fbbf24' : 'var(--text-secondary)',
                    cursor: hasDocuments && !isGenerating && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                    animation: listening ? 'pulse-ring 1.5s ease-in-out infinite' : 'none',
                  }}>
                  {loading
                    ? <Sparkles size={16} style={{ animation: 'pulse-icon 1s ease-in-out infinite' }} />
                    : listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}

              {/* Send button */}
              <button
                type="submit" disabled={!canSend}
                style={{
                  width: 36, height: 36, flexShrink: 0, borderRadius: 8,
                  border: 'none', padding: 0,
                  background: canSend ? 'linear-gradient(135deg, var(--accent) 0%, #4f46e5 100%)' : 'var(--bg-active)',
                  color: canSend ? '#fff' : 'var(--text-muted)',
                  cursor: canSend ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: canSend ? '0 3px 12px var(--accent-glow)' : 'none',
                }}
                onMouseEnter={e => { if (canSend) e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {isGenerating
                  ? <Sparkles size={16} style={{ animation: 'pulse-icon 1.5s ease-in-out infinite' }} />
                  : <Send size={16} style={{ marginLeft: -1 }} />}
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 8, fontWeight: 500 }}>
            {supported ? '🎤 Voice input supported · ' : ''}AI can make mistakes. Verify using citations.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse-icon { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
        @keyframes pulse-ring  { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } }
      `}</style>
    </div>
  );
}

function EmptyState({ hasDocuments }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', textAlign: 'center',
      maxWidth: 480, margin: '0 auto', width: '100%',
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'var(--accent-dim)',
          border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          boxShadow: '0 0 32px var(--accent-glow)',
        }}
      >
        <Sparkles size={26} color="var(--accent-light)" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.3px' }}
      >
        {hasDocuments ? 'Ask anything about your docs' : 'Upload a PDF to get started'}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}
      >
        {hasDocuments
          ? "I'll search through your document and provide answers with page citations."
          : "Upload a PDF from the sidebar, then ask questions. I'll provide cited answers."}
      </motion.p>

      {hasDocuments && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}
        >
          {SUGGESTIONS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 13px', borderRadius: 9,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontSize: 12.5,
            }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{s.icon}</span>
              {s.text}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: 'var(--accent-dim)',
        border: '1px solid rgba(99,102,241,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 10px var(--accent-glow)',
      }}>
        <Sparkles size={14} color="var(--accent-light)" />
      </div>
      <div style={{
        padding: '11px 15px', borderRadius: '4px 13px 13px 13px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div className="dot-pulse" style={{ height: 16 }}>
          <span /><span /><span />
        </div>
      </div>
    </motion.div>
  );
}
