
import React, { useState } from 'react';
import { Brain, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight, Loader2, BookMarked, RefreshCw, FileQuestion, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────
   QuizPanel — full-page quiz mode
   Props:
     questions       : array of { question, options[], correct, explanation, page }
     isGenerating    : bool — show skeleton while generating
     hasDocuments    : bool — show empty state if no doc
     onCitationClick : (page) => void
     onRegenerate    : () => void
───────────────────────────────────────────────────────── */
export default function QuizPanel({ questions, isGenerating, hasDocuments, onCitationClick, onRegenerate }) {

  if (!hasDocuments) return <QuizEmpty />;
  if (isGenerating)  return <QuizSkeleton />;
  if (!questions?.length) return <QuizEmpty uploaded />;

  return <QuizRunner questions={questions} onCitationClick={onCitationClick} onRegenerate={onRegenerate} />;
}

/* ─── Empty / no-doc state ─────────────────────────────── */
function QuizEmpty({ uploaded }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 32px', textAlign: 'center',
    }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'var(--quiz-bg)',
          border: '1px solid var(--quiz-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          boxShadow: '0 0 32px rgba(139,92,246,0.15)',
        }}
      >
        <FileQuestion size={30} color="var(--quiz-accent)" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.3px' }}
      >
        {uploaded ? 'Generating your quiz…' : 'Upload a PDF first'}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 340 }}
      >
        {uploaded
          ? 'Quiz questions are being generated from your document. This takes a few seconds.'
          : 'Upload a PDF from the sidebar. A 5-question quiz will be auto-generated from the document content.'}
      </motion.p>
    </div>
  );
}

/* ─── Loading skeleton ─────────────────────────────────── */
function QuizSkeleton() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 32px',
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ marginBottom: 20 }}
      >
        <Loader2 size={36} color="var(--quiz-accent)" />
      </motion.div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
        Generating Quiz…
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Analysing document and crafting 5 questions
      </div>

      {/* Skeleton cards */}
      <div style={{ width: '100%', maxWidth: 640, marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            height: 48, borderRadius: 12,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, var(--bg-hover) 50%, transparent 100%)',
              backgroundSize: '400px 100%',
              animation: 'shimmer-move 1.6s linear infinite',
              animationDelay: `${i * 0.15}s`,
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main quiz runner ─────────────────────────────────── */
function QuizRunner({ questions, onCitationClick, onRegenerate }) {
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState(null);   // chosen option index
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers]   = useState([]);      // { selected, correct, page }
  const [done, setDone]         = useState(false);

  const q     = questions[current];
  const total = questions.length;
  const score = answers.filter(a => a.selected === a.correct).length;

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
  };

  const handleNext = () => {
    setAnswers(prev => [...prev, { selected, correct: q.correct, page: q.page }]);
    if (current + 1 >= total) {
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

  const progress = done ? 1 : (current + (revealed ? 1 : 0)) / total;

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 24px 40px',
    }}>
      <div style={{ width: '100%', maxWidth: 660 }}>

        {/* ── Panel header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--quiz-bg)',
              border: '1px solid var(--quiz-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(139,92,246,0.15)',
            }}>
              <Brain size={17} color="var(--quiz-accent)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                Knowledge Quiz
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                {total} questions · auto-generated from document
              </div>
            </div>
          </div>

          {!done && (
            <button
              onClick={onRegenerate}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 8,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <RefreshCw size={12} />
              Regenerate
            </button>
          )}
        </div>

        {/* ── Progress bar ── */}
        {!done && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                Question {current + 1} of {total}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                {Math.round(progress * 100)}%
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: 'var(--bg-active)', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  height: '100%', borderRadius: 99,
                  background: 'linear-gradient(90deg, var(--quiz-accent), var(--accent))',
                }}
              />
            </div>
          </div>
        )}

        {/* ── Question / Score ── */}
        <AnimatePresence mode="wait">
          {done ? (
            <ScoreScreen
              key="score"
              score={score}
              total={total}
              answers={answers}
              questions={questions}
              onCitationClick={onCitationClick}
              onReset={handleReset}
              onRegenerate={onRegenerate}
            />
          ) : (
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {/* Question card */}
              <div style={{
                padding: '20px 22px',
                borderRadius: 14,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: 14,
              }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 9px', borderRadius: 99,
                  background: 'var(--quiz-bg)',
                  border: '1px solid var(--quiz-border)',
                  fontSize: 10, fontWeight: 700,
                  color: 'var(--quiz-accent)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  marginBottom: 12,
                }}>
                  <Brain size={10} />
                  Q{current + 1}
                </div>
                <p style={{
                  fontSize: 15.5, fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.55, margin: 0,
                  letterSpacing: '-0.1px',
                }}>
                  {q.question}
                </p>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {q.options.map((opt, i) => {
                  const isCorrect  = i === q.correct;
                  const isSelected = i === selected;
                  let cls = 'quiz-opt';
                  if (revealed) {
                    if (isCorrect)           cls += ' correct';
                    else if (isSelected)     cls += ' wrong';
                  }

                  return (
                    <motion.button
                      key={i}
                      className={cls}
                      onClick={() => handleSelect(i)}
                      disabled={revealed}
                      whileHover={!revealed ? { x: 3 } : {}}
                      transition={{ duration: 0.12 }}
                    >
                      {/* Letter badge */}
                      <div style={{
                        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800,
                        background: revealed && isCorrect
                          ? 'rgba(16,185,129,0.2)'
                          : revealed && isSelected
                            ? 'rgba(239,68,68,0.2)'
                            : 'var(--bg-active)',
                        border: `1px solid ${
                          revealed && isCorrect ? 'rgba(16,185,129,0.35)'
                          : revealed && isSelected ? 'rgba(239,68,68,0.35)'
                          : 'var(--border-default)'
                        }`,
                        color: revealed && isCorrect
                          ? 'var(--success-text)'
                          : revealed && isSelected
                            ? 'var(--danger-text)'
                            : 'var(--text-muted)',
                        transition: 'all 0.15s',
                      }}>
                        {revealed && isCorrect
                          ? <CheckCircle2 size={13} />
                          : revealed && isSelected
                            ? <XCircle size={13} />
                            : String.fromCharCode(65 + i)}
                      </div>
                      <span style={{ fontSize: 13.5, lineHeight: 1.45 }}>{opt}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation + Next */}
              <AnimatePresence>
                {revealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Explanation card */}
                    {q.explanation && (
                      <div style={{
                        padding: '13px 15px',
                        borderRadius: 11,
                        background: selected === q.correct ? 'var(--success-dim)' : 'var(--danger-dim)',
                        border: `1px solid ${selected === q.correct ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                        marginBottom: 12,
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                      }}>
                        <div style={{ flexShrink: 0, marginTop: 1 }}>
                          {selected === q.correct
                            ? <CheckCircle2 size={15} color="var(--success-text)" />
                            : <XCircle size={15} color="var(--danger-text)" />}
                        </div>
                        <div>
                          <div style={{
                            fontSize: 11.5, fontWeight: 700,
                            color: selected === q.correct ? 'var(--success-text)' : 'var(--danger-text)',
                            marginBottom: 4,
                          }}>
                            {selected === q.correct ? 'Correct!' : 'Incorrect'}
                          </div>
                          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {q.explanation}
                          </div>
                          {q.page && (
                            <button
                              onClick={() => onCitationClick?.(q.page)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                marginTop: 8, padding: '3px 9px', borderRadius: 6,
                                background: 'var(--accent-dim)',
                                border: '1px solid rgba(99,102,241,0.22)',
                                color: 'var(--accent-light)',
                                fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
                                fontFamily: 'inherit', transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                            >
                              <BookMarked size={10} />
                              See p.{q.page} in PDF
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Next button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={handleNext}
                        className="btn btn-primary"
                        style={{ gap: 6, padding: '8px 18px', fontSize: 13 }}
                      >
                        {current + 1 >= total ? (
                          <><Trophy size={14} /> See Results</>
                        ) : (
                          <>Next Question <ChevronRight size={14} /></>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Score screen ─────────────────────────────────────── */
function ScoreScreen({ score, total, answers, questions, onCitationClick, onReset, onRegenerate }) {
  const pct = Math.round((score / total) * 100);
  const [showReview, setShowReview] = useState(false);

  const grade =
    pct >= 80 ? { label: 'Excellent!',       color: 'var(--success)',  textColor: 'var(--success-text)',  bg: 'var(--success-dim)' } :
    pct >= 60 ? { label: 'Good job!',         color: '#60a5fa',         textColor: '#93c5fd',              bg: 'rgba(59,130,246,0.1)' } :
                { label: 'Keep practising!',  color: 'var(--warning)',  textColor: '#fcd34d',              bg: 'var(--warning-dim)' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Score card */}
      <div style={{
        padding: '28px 24px',
        borderRadius: 16,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center',
        marginBottom: 16,
      }}>
        {/* Trophy */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: grade.bg,
          border: `2px solid ${grade.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: `0 0 28px ${grade.color}40`,
        }}>
          <Trophy size={30} color={grade.color} />
        </div>

        <div style={{ fontSize: 36, fontWeight: 800, color: grade.textColor, lineHeight: 1, marginBottom: 4 }}>
          {pct}%
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {grade.label}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          You answered {score} out of {total} questions correctly
        </div>

        {/* Score bar */}
        <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-active)', overflow: 'hidden', marginBottom: 20 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            style={{
              height: '100%', borderRadius: 99,
              background: `linear-gradient(90deg, ${grade.color}, ${grade.color}bb)`,
            }}
          />
        </div>

        {/* Per-question dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {answers.map((a, i) => (
            <div
              key={i}
              title={`Q${i + 1}: ${a.selected === a.correct ? 'Correct' : 'Wrong'}`}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: a.selected === a.correct ? 'var(--success)' : 'var(--danger)',
                boxShadow: a.selected === a.correct
                  ? '0 0 6px rgba(16,185,129,0.5)'
                  : '0 0 6px rgba(239,68,68,0.5)',
              }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={onReset}
            className="btn btn-ghost"
            style={{ fontSize: 12.5, padding: '7px 16px' }}
          >
            <RotateCcw size={13} />
            Try Again
          </button>
          <button
            onClick={onRegenerate}
            className="btn btn-ghost"
            style={{ fontSize: 12.5, padding: '7px 16px' }}
          >
            <RefreshCw size={13} />
            New Quiz
          </button>
          <button
            onClick={() => setShowReview(r => !r)}
            className="btn btn-primary"
            style={{ fontSize: 12.5, padding: '7px 16px' }}
          >
            <Lightbulb size={13} />
            {showReview ? 'Hide Review' : 'Review Answers'}
          </button>
        </div>
      </div>

      {/* Answer review */}
      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {questions.map((q, i) => {
                const a = answers[i];
                const correct = a?.selected === q.correct;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: 'var(--bg-elevated)',
                      border: `1px solid ${correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}
                  >
                    {/* Q header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                        background: correct ? 'var(--success-dim)' : 'var(--danger-dim)',
                        border: `1px solid ${correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 1,
                      }}>
                        {correct
                          ? <CheckCircle2 size={11} color="var(--success-text)" />
                          : <XCircle size={11} color="var(--danger-text)" />}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                        {q.question}
                      </p>
                    </div>

                    {/* Your answer vs correct */}
                    {!correct && a && (
                      <div style={{ fontSize: 11.5, color: 'var(--danger-text)', marginBottom: 4, paddingLeft: 28 }}>
                        Your answer: <strong>{q.options[a.selected]}</strong>
                      </div>
                    )}
                    <div style={{ fontSize: 11.5, color: 'var(--success-text)', marginBottom: 6, paddingLeft: 28 }}>
                      Correct: <strong>{q.options[q.correct]}</strong>
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div style={{
                        fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
                        paddingLeft: 28, paddingTop: 6,
                        borderTop: '1px solid var(--border-subtle)',
                      }}>
                        {q.explanation}
                      </div>
                    )}

                    {/* Citation */}
                    {q.page && (
                      <div style={{ paddingLeft: 28, marginTop: 8 }}>
                        <button
                          onClick={() => onCitationClick?.(q.page)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '3px 9px', borderRadius: 6,
                            background: 'var(--accent-dim)',
                            border: '1px solid rgba(99,102,241,0.22)',
                            color: 'var(--accent-light)',
                            fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                        >
                          <BookMarked size={10} />
                          p.{q.page}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
