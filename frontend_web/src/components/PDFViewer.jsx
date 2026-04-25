import React from 'react';
import { FileText, X, BookOpen, FileSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PDFViewer({ pdfUrl, pdfName, activePage, onClose }) {
  return (
    <AnimatePresence>
      {pdfUrl ? (
        <motion.aside
          key="viewer"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 460, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          style={{
            width: 460, minWidth: 460, height: '100%',
            background: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border-subtle)',
            display: 'flex', flexDirection: 'column',
            zIndex: 10, flexShrink: 0, overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            height: 50, flexShrink: 0,
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 9,
            background: 'var(--bg-surface)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
              background: 'var(--accent-dim)',
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={12} color="var(--accent-light)" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {pdfName || 'Document Viewer'}
              </div>
              {activePage && (
                <div style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 1 }}>
                  Viewing page {activePage}
                </div>
              )}
            </div>

            {activePage && (
              <div style={{
                padding: '3px 8px', borderRadius: 6,
                background: 'var(--accent-dim)',
                border: '1px solid rgba(99,102,241,0.2)',
                fontSize: 10, fontWeight: 700,
                color: 'var(--accent-light)',
                letterSpacing: '0.04em', textTransform: 'uppercase',
                flexShrink: 0,
              }}>
                p.{activePage}
              </div>
            )}

            <button
              onClick={onClose}
              style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: 'transparent', border: '1px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Cited page banner */}
          <AnimatePresence>
            {activePage && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{
                  padding: '7px 14px',
                  background: 'var(--accent-dim)',
                  borderBottom: '1px solid rgba(99,102,241,0.15)',
                  display: 'flex', alignItems: 'center', gap: 7,
                  flexShrink: 0,
                }}
              >
                <FileSearch size={12} color="var(--accent-light)" />
                <span style={{ fontSize: 11, color: 'var(--accent-light)', fontWeight: 600 }}>
                  Jumped to cited page {activePage}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PDF iframe */}
          <div style={{ flex: 1, padding: 8, background: 'var(--bg-base)' }}>
            <iframe
              src={activePage ? `${pdfUrl}#page=${activePage}` : pdfUrl}
              style={{
                width: '100%', height: '100%',
                borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                background: '#fff',
              }}
              title="PDF Viewer"
            />
          </div>
        </motion.aside>
      ) : (
        <div style={{
          width: 460, minWidth: 460, height: '100%',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 12, padding: 32, textAlign: 'center',
          zIndex: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 13,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 4,
          }}>
            <BookOpen size={20} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
            No document open
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 220 }}>
            Upload a PDF and click a citation to jump to the source page
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
