import React, { useState } from 'react';
import { Brain, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizCard({ quiz }) {
  const questions = quiz?.questions || [];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);   // index of chosen option
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState([]);        // { selected, correct }
  const [done, setDone] = useState(false);

  const q = questions[current];
  const score = answers.filter(a => a.selected === a.correct).length;

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
  };

  const handleNext = () => {
    setAnswers(prev => [...prev, { selected, correct: q.correct }]);
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const handleReset = () => {
    setCurrent(0); setSelected(null); setRevealed(false);
    setAnswers([]); setDone(false);
  };

  const pct = Math.round((score / questions.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: 16,
        border: '1px solid rgba(168,85,247,0.25)',
        background: 'linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(99,102,241,0.06) 100%)',
        overflow: 'hidden',
        maxWidth: 680,
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(168,85,247,0.15)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(168,85,247,0.06)',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'rgba(168,85,247,0.15)',
          border: '1px solid rgba(168,85,247,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Brain size={15} color="#d8b4fe" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#d8b4fe' }}>Knowledge Quiz</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Based on your document</div>
        </div>
        {!done && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Progress bar */}
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
              {current + 1} / {questions.length}
            </div>
            <div style={{ width: 80, height: 4, borderRadius: 99, background: 'var(--bg-active)', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${((current + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
                transition={{ duration: 0.4 }}
                style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #a855f7, #6366f1)' }}
              />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '18px 18px 16px' }}>
        <AnimatePresence mode="wait">
          {done ? (
            <ScoreScreen key="score" score={score} total={questions.length} pct={pct} onReset={handleReset} />
          ) : (
            <motion.div key={current} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              {/* Question */}
              <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.55, marginBottom: 14 }}>
                {q.question}
              </p>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {q.options.map((opt, i) => {
                  let cls = 'quiz-option';
                  if (revealed) {
                    if (i === q.correct) cls += ' reveal-correct';
                    else if (i === selected) cls += ' selected-wrong';
                  }
                  return (
                    <button
                      key={i}
                      className={cls}
                      onClick={() => handleSelect(i)}
                      disabled={revealed}
                      style={{ gap: 10 }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                        background: revealed && i === q.correct
                          ? 'rgba(16,185,129,0.2)'
                          : revealed && i === selected
                            ? 'rgba(239,68,68,0.2)'
                            : 'var(--bg-active)',
                        border: `1px solid ${revealed && i === q.correct ? 'rgba(16,185,129,0.4)' : revealed && i === selected ? 'rgba(239,68,68,0.4)' : 'var(--border-default)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        color: revealed && i === q.correct ? '#6ee7b7' : revealed && i === selected ? '#fca5a5' : 'var(--text-muted)',
                      }}>
                        {revealed && i === q.correct
                          ? <CheckCircle2 size={13} />
                          : revealed && i === selected
                            ? <XCircle size={13} />
                            : String.fromCharCode(65 + i)}
                      </div>
                      <span style={{ fontSize: 13.5 }}>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback + Next */}
              <AnimatePresence>
                {revealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12.5, fontWeight: 600,
                      color: selected === q.correct ? '#6ee7b7' : '#fca5a5',
                    }}>
                      {selected === q.correct
                        ? <><CheckCircle2 size={15} /> Correct!</>
                        : <><XCircle size={15} /> Incorrect</>}
                    </div>
                    <button
                      onClick={handleNext}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '7px 14px', borderRadius: 8,
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        border: 'none', color: '#fff',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        boxShadow: '0 3px 12px rgba(99,102,241,0.35)',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {current + 1 >= questions.length ? 'See Results' : 'Next'}
                      <ChevronRight size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ScoreScreen({ score, total, pct, onReset }) {
  const grade = pct >= 80 ? { label: 'Excellent!', color: '#6ee7b7', bg: 'rgba(16,185,129,0.1)' }
    : pct >= 60 ? { label: 'Good job!', color: '#93c5fd', bg: 'rgba(59,130,246,0.1)' }
    : { label: 'Keep practicing!', color: '#fcd34d', bg: 'rgba(245,158,11,0.1)' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0' }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: grade.bg,
        border: `2px solid ${grade.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 24px ${grade.color}40`,
      }}>
        <Trophy size={28} color={grade.color} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: grade.color }}>{pct}%</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{grade.label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          You got {score} out of {total} questions right
        </div>
      </div>

      {/* Score bar */}
      <div style={{ width: '100%', maxWidth: 280 }}>
        <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-active)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              height: '100%', borderRadius: 99,
              background: `linear-gradient(90deg, ${grade.color}, ${grade.color}aa)`,
            }}
          />
        </div>
      </div>

      <button
        onClick={onReset}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 18px', borderRadius: 9,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-secondary)',
          fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <RotateCcw size={13} />
        Try Again
      </button>
    </motion.div>
  );
}
