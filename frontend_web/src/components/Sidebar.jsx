import React, { useState, useRef } from 'react';
import { FileText, UploadCloud, Layers, Clock, ChevronRight, CheckCircle2, AlignLeft, GitBranch, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import MindMap from './MindMap';
import { API_BASE_URL } from '../config';

function fmtBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}
function fmtTime(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Sidebar({ isUploading, uploadedFiles, onFileUpload, onSelectFile, activePdfName, insights }) {
  const [isDragging, setIsDragging]         = useState(false);
  const [summaryOpen, setSummaryOpen]       = useState(false);
  const [mindmapOpen, setMindmapOpen]       = useState(false);
  const [summary, setSummary]               = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [mindMapData, setMindMapData]       = useState(null);
  const [loadingMindMap, setLoadingMindMap] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') onFileUpload(file);
  };

  const handleSummary = async () => {
    if (summaryOpen) { setSummaryOpen(false); return; }
    setSummaryOpen(true);
    if (summary) return; // already loaded
    setLoadingSummary(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/ask`, {
        params: { question: 'Give a concise summary of this document in 5-6 bullet points.' }
      });
      setSummary(res.data.answer || 'Could not generate summary.');
    } catch {
      setSummary('Could not generate summary. Make sure a document is uploaded.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleMindMap = async () => {
    if (mindmapOpen) { setMindmapOpen(false); return; }
    setMindmapOpen(true);
    if (mindMapData && !mindMapData.error) return; // already loaded
    setLoadingMindMap(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/mindmap`);
      setMindMapData(res.data);
    } catch {
      setMindMapData({ error: 'Could not generate mind map.' });
    } finally {
      setLoadingMindMap(false);
    }
  };

  const handleRegenerateMindMap = async () => {
    setLoadingMindMap(true);
    setMindMapData(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/mindmap`);
      setMindMapData(res.data);
    } catch {
      setMindMapData({ error: 'Could not generate mind map.' });
    } finally {
      setLoadingMindMap(false);
    }
  };

  const mindMapDataFinal = insights
    ? mindMapData
    : null;

  return (
    <aside style={{
      width: 252, minWidth: 252, height: '100%',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      zIndex: 10, flexShrink: 0,
      transition: 'background 0.25s',
    }}>

      {/* ── Upload zone ── */}
      <div style={{ padding: '14px 12px 0' }}>
        <div className="label" style={{ marginBottom: 8 }}>
          <UploadCloud size={11} />
          Upload Document
        </div>

        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
          style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && onFileUpload(e.target.files[0])}
            disabled={isUploading} />

          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div key="up"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}
              >
                <div style={{ position: 'relative', width: 34, height: 34 }}>
                  <UploadCloud size={24} color="var(--accent-light)"
                    style={{ position: 'absolute', top: 5, left: 5 }} />
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '2px solid transparent',
                    borderTopColor: 'var(--accent-light)',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-light)' }}>Processing…</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Building vector index</div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="idle"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileText size={17} color="var(--text-secondary)" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {isDragging ? 'Drop to upload' : 'Drop PDF here'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>or click to browse</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '14px 0 0' }} />

      {/* ── File list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
        {uploadedFiles.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              No documents yet.<br />Upload a PDF to get started.
            </div>
          </div>
        ) : (
          <>
            <div className="label" style={{ marginBottom: 8 }}>
              <Layers size={11} />
              Knowledge Base
              <span style={{
                marginLeft: 'auto',
                background: 'var(--accent-dim)',
                color: 'var(--accent-light)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 99, padding: '1px 7px',
                fontSize: 9, fontWeight: 700,
              }}>{uploadedFiles.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <AnimatePresence>
                {uploadedFiles.map((file, i) => {
                  const active = activePdfName === file.name;
                  return (
                    <motion.button
                      key={file.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => onSelectFile(file)}
                      className={`nav-item ${active ? 'active' : ''}`}
                      style={{ padding: '8px 9px', gap: 8 }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: active ? 'rgba(99,102,241,0.15)' : 'var(--bg-active)',
                        border: `1px solid ${active ? 'rgba(99,102,241,0.25)' : 'var(--border-subtle)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {active
                          ? <CheckCircle2 size={13} color="var(--accent-light)" />
                          : <FileText size={13} color="var(--text-muted)" />}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 11.5, fontWeight: 600,
                          color: active ? 'var(--accent-light)' : 'var(--text-primary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{file.name}</div>
                        <div style={{
                          fontSize: 9.5, color: 'var(--text-muted)', marginTop: 1,
                          display: 'flex', gap: 4, alignItems: 'center',
                        }}>
                          <span>{fmtBytes(file.size)}</span>
                          <span>·</span>
                          <Clock size={8} />
                          <span>{fmtTime(file.uploadedAt)}</span>
                        </div>
                      </div>

                      {active && <ChevronRight size={12} color="var(--accent-light)" style={{ flexShrink: 0 }} />}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* ── Summary & MindMap quick actions ── */}
      {uploadedFiles.length > 0 && (
        <div style={{ padding: '0 12px 12px', flexShrink: 0 }}>
          <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 10 }} />
          <div className="label" style={{ marginBottom: 8 }}>
            <AlignLeft size={11} />
            Quick Actions
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {/* Summary button */}
            <button
              onClick={handleSummary}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '7px 0', borderRadius: 8,
                background: summaryOpen ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                border: `1px solid ${summaryOpen ? 'rgba(99,102,241,0.3)' : 'var(--border-default)'}`,
                color: summaryOpen ? 'var(--accent-light)' : 'var(--text-secondary)',
                fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!summaryOpen) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
              onMouseLeave={e => { if (!summaryOpen) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
            >
              {loadingSummary ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <AlignLeft size={12} />}
              Summary
            </button>

            {/* Mind Map button */}
            <button
              onClick={handleMindMap}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '7px 0', borderRadius: 8,
                background: mindmapOpen ? 'rgba(139,92,246,0.12)' : 'var(--bg-elevated)',
                border: `1px solid ${mindmapOpen ? 'rgba(139,92,246,0.3)' : 'var(--border-default)'}`,
                color: mindmapOpen ? '#c4b5fd' : 'var(--text-secondary)',
                fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!mindmapOpen) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
              onMouseLeave={e => { if (!mindmapOpen) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
            >
              {loadingMindMap ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <GitBranch size={12} />}
              Mind Map
            </button>
          </div>

          {/* Summary panel */}
          <AnimatePresence>
            {summaryOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  marginTop: 8, padding: '10px 12px', borderRadius: 9,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  maxHeight: 200, overflowY: 'auto',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Summary
                    </span>
                    <button onClick={() => { setSummaryOpen(false); setSummary(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                      <X size={12} />
                    </button>
                  </div>
                  {loadingSummary ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11 }}>
                      <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
                      Generating summary…
                    </div>
                  ) : (
                    <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {summary}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mind Map — React Flow fullscreen */}
          {mindmapOpen && (
            <MindMap
              apiData={mindMapDataFinal}
              isLoading={loadingMindMap}
              onRegenerate={handleRegenerateMindMap}
              onClose={() => setMindmapOpen(false)}
            />
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Devmox v1.0</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--success)',
            boxShadow: '0 0 6px rgba(16,185,129,0.6)',
          }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Online</span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </aside>
  );
}
