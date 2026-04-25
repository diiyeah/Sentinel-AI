import React from 'react';
import { Cpu, ChevronDown, GraduationCap, Sun, Moon, MessageSquare, Brain, Loader2 } from 'lucide-react';

const LEVELS = ['Class 4', 'Class 6', 'Class 8', 'Class 10'];

const LEVEL_META = {
  'Class 4':  { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)'  },
  'Class 6':  { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)'  },
  'Class 8':  { color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)' },
  'Class 10': { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
};

export default function Header({ theme, onToggleTheme, studentLevel, onLevelChange, sidebarTab, onTabChange, hasDocuments, isGeneratingQuiz }) {
  const lm = LEVEL_META[studentLevel] || LEVEL_META['Class 10'];

  return (
    <header style={{
      height: 54,
      flexShrink: 0,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12,
      zIndex: 30,
      boxShadow: 'var(--shadow-sm)',
    }}>

      {/* ── Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 14px rgba(99,102,241,0.35)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
              fill="rgba(255,255,255,0.95)" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Devmox
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.03em' }}>
            Smart Document Assistant
          </div>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="tab-switcher" style={{ marginLeft: 8 }}>
        <button
          className={`tab-btn ${sidebarTab === 'chat' ? 'active' : ''}`}
          onClick={() => onTabChange('chat')}
        >
          <MessageSquare size={13} />
          Chat
        </button>
        <button
          className={`tab-btn ${sidebarTab === 'quiz' ? 'active' : ''}`}
          onClick={() => onTabChange('quiz')}
          style={{ position: 'relative' }}
        >
          {isGeneratingQuiz
            ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
            : <Brain size={13} />}
          Quiz
          {hasDocuments && !isGeneratingQuiz && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 14, height: 14, borderRadius: '50%',
              background: 'var(--accent)',
              color: '#fff', fontSize: 8, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>5</span>
          )}
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* ── Level selector ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <GraduationCap size={13} color="var(--text-muted)" />
        <div style={{ position: 'relative' }}>
          <select
            value={studentLevel}
            onChange={e => onLevelChange(e.target.value)}
            style={{
              appearance: 'none',
              padding: '4px 26px 4px 9px',
              borderRadius: 7,
              border: `1px solid ${lm.border}`,
              background: lm.bg,
              color: lm.color,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {LEVELS.map(l => (
              <option key={l} value={l} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>{l}</option>
            ))}
          </select>
          <ChevronDown size={11} color={lm.color} style={{
            position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* ── Theme toggle ── */}
      <button
        onClick={onToggleTheme}
        style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-secondary)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </header>
  );
}
