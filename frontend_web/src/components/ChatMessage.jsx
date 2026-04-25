import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Sparkles, BookMarked, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatMessage({ message, onCitationClick, onSpeak, onStopSpeak, isSpeaking }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        display: 'flex',
        gap: 10,
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      {/* AI avatar */}
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 2,
          boxShadow: '0 0 10px rgba(99,102,241,0.15)',
        }}>
          <Sparkles size={13} color="var(--accent-light)" />
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: '76%',
        borderRadius: isUser ? '13px 3px 13px 13px' : '3px 13px 13px 13px',
        padding: isUser ? '9px 14px' : '12px 15px',
        background: isUser
          ? 'linear-gradient(135deg, #5254e8 0%, #4338ca 100%)'
          : 'var(--bg-elevated)',
        border: isUser ? 'none' : '1px solid var(--border-default)',
        boxShadow: isUser
          ? '0 4px 16px rgba(99,102,241,0.25)'
          : 'var(--shadow-sm)',
        color: isUser ? '#fff' : 'var(--text-primary)',
        transition: 'background 0.25s, border-color 0.25s',
      }}>
        {isUser ? (
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, fontWeight: 400 }}>
            {message.content}
          </p>
        ) : (
          <>
            <div className="prose-chat">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Citations + speak */}
            {message.citations?.length > 0 && (
              <div style={{
                marginTop: 11, paddingTop: 9,
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BookMarked size={10} color="var(--text-muted)" />
                  <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Sources
                  </span>
                </div>
                {message.citations.map((page, i) => (
                  <button
                    key={i}
                    onClick={() => onCitationClick?.(page)}
                    className="badge badge-accent"
                    style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.22)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                  >
                    p.{page}
                  </button>
                ))}
                {/* Speak button */}
                {onSpeak && (
                  <button
                    onClick={() => isSpeaking ? onStopSpeak() : onSpeak(message.content.replace(/[#*`_~\[\]]/g, '').slice(0, 500))}
                    title={isSpeaking ? 'Stop' : 'Read aloud'}
                    style={{
                      marginLeft: 'auto',
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 6,
                      background: isSpeaking ? 'rgba(245,158,11,0.12)' : 'var(--bg-active)',
                      border: `1px solid ${isSpeaking ? 'rgba(245,158,11,0.3)' : 'var(--border-subtle)'}`,
                      color: isSpeaking ? '#fbbf24' : 'var(--text-muted)',
                      fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    <Volume2 size={10} />
                    {isSpeaking ? 'Stop' : 'Read'}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 2,
        }}>
          <User size={13} color="var(--text-secondary)" />
        </div>
      )}
    </motion.div>
  );
}
