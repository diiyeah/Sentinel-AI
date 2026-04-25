import React, { useState } from 'react';
import { Lightbulb, BookOpen, Tag, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CARDS = [
  {
    key: 'summary', colorClass: 'ic-blue', icon: Lightbulb, label: 'Summary',
    render: (d) => (
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
        {d.summary}
      </p>
    ),
  },
  {
    key: 'topics', colorClass: 'ic-purple', icon: BookOpen, label: 'Topics',
    render: (d) => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {d.topics.map((t, i) => (
          <span key={i} style={{
            padding: '2px 8px', borderRadius: 99,
            background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
            fontSize: 10.5, fontWeight: 600, color: '#c084fc',
          }}>{t}</span>
        ))}
      </div>
    ),
  },
  {
    key: 'definitions', colorClass: 'ic-teal', icon: Tag, label: 'Key Terms',
    render: (d) => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {d.definitions.map((t, i) => (
          <span key={i} style={{
            padding: '2px 8px', borderRadius: 99,
            background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)',
            fontSize: 10.5, fontWeight: 600, color: '#2dd4bf',
          }}>{t}</span>
        ))}
      </div>
    ),
  },
  {
    key: 'stats', colorClass: 'ic-amber', icon: BarChart2, label: 'Stats',
    render: (d) => (
      <div style={{ display: 'flex', gap: 18 }}>
        {[
          { label: 'Pages', val: d.pageCount },
          { label: 'Topics', val: d.topics.length },
          { label: 'Terms', val: d.definitions.length },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function InsightCards({ insights }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
      flexShrink: 0,
      transition: 'background 0.25s',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
        }}
      >
        <div className="label">
          <Lightbulb size={11} />
          Document Insights
        </div>
        {open
          ? <ChevronUp size={13} color="var(--text-muted)" />
          : <ChevronDown size={13} color="var(--text-muted)" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              padding: '0 14px 12px',
            }}>
              {CARDS.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.key}
                    className={card.colorClass}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      padding: '11px 12px',
                      borderRadius: 11,
                      background: 'var(--ic-bg)',
                      border: '1px solid var(--ic-border)',
                      display: 'flex', flexDirection: 'column', gap: 7,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon size={12} color="var(--ic-text)" />
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--ic-text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        {card.label}
                      </span>
                    </div>
                    {card.render(insights)}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
