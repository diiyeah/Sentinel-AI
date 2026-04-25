import React, { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, FileSearch, BookOpen, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';

const SUGGESTIONS = [
  { icon: <FileSearch size={14} />, text: 'Summarize the key points of this document' },
  { icon: <BookOpen size={14} />, text: 'What are the main topics covered?' },
  { icon: <Zap size={14} />, text: 'List the most important definitions' },
];

export default function ChatWindow({ messages, isGenerating, onSendMessage, onCitationClick, hasDocuments }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

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
                <ChatMessage key={i} message={msg} onCitationClick={onCitationClick} />
              ))}
            </AnimatePresence>
            {isGenerating && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div style={{
        padding: '0 20px 18px',
        background: 'var(--bg-base)',
        flexShrink: 0,
        transition: 'background 0.25s',
      }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <form onSubmit={submit}>
            <div
              className="glass"
              style={{
                display: 'flex', alignItems: 'flex-end', gap: 8,
                padding: 7, borderRadius: 13,
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-md)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--border-focus)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim), var(--shadow-md)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={hasDocuments ? 'Ask a question about your document…' : 'Upload a document first…'}
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
              <button
                type="submit"
                disabled={!canSend}
                className={canSend ? 'btn btn-primary' : ''}
                style={{
                  width: 36, height: 36, flexShrink: 0, borderRadius: 8,
                  border: 'none', padding: 0,
                  background: canSend
                    ? 'linear-gradient(135deg, var(--accent) 0%, #4f46e5 100%)'
                    : 'var(--bg-active)',
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
            AI can make mistakes. Verify important information using the citations provided.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse-icon { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
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
