import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  Handle, Position, MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, RefreshCw, GitBranch, ZoomIn, ZoomOut } from 'lucide-react';

/* ── Node type colors ──────────────────────────────────── */
const NODE_STYLES = {
  center: {
    bg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'rgba(99,102,241,0.6)',
    text: '#fff',
    shadow: '0 0 32px rgba(99,102,241,0.5)',
    fontSize: 14,
    fontWeight: 700,
    padding: '12px 20px',
    borderRadius: 14,
  },
  topic: {
    bg: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.18) 100%)',
    border: 'rgba(99,102,241,0.4)',
    text: '#a5b4fc',
    shadow: '0 4px 16px rgba(99,102,241,0.2)',
    fontSize: 12.5,
    fontWeight: 700,
    padding: '9px 16px',
    borderRadius: 11,
  },
  subtopic: {
    bg: 'rgba(6,182,212,0.1)',
    border: 'rgba(6,182,212,0.35)',
    text: '#67e8f9',
    shadow: '0 2px 10px rgba(6,182,212,0.15)',
    fontSize: 11.5,
    fontWeight: 600,
    padding: '7px 13px',
    borderRadius: 9,
  },
  term: {
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.35)',
    text: '#6ee7b7',
    shadow: '0 2px 8px rgba(16,185,129,0.12)',
    fontSize: 11,
    fontWeight: 600,
    padding: '6px 11px',
    borderRadius: 8,
  },
};

/* ── Custom node component ─────────────────────────────── */
function MindNode({ data }) {
  const s = NODE_STYLES[data.type] || NODE_STYLES.topic;
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <div style={{
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        borderRadius: s.borderRadius,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        color: s.text,
        boxShadow: s.shadow,
        fontFamily: 'Inter, system-ui, sans-serif',
        whiteSpace: 'nowrap',
        maxWidth: 200,
        textAlign: 'center',
        cursor: 'default',
        transition: 'all 0.2s',
        backdropFilter: 'blur(8px)',
      }}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </>
  );
}

const nodeTypes = { mindNode: MindNode };

/* ── Layout: radial from center ────────────────────────── */
function buildLayout(apiData) {
  const nodes = [];
  const edges = [];

  const W = 900, H = 600;
  const cx = W / 2, cy = H / 2;

  // Center node
  nodes.push({
    id: 'center',
    type: 'mindNode',
    position: { x: cx - 80, y: cy - 24 },
    data: { label: apiData.center, type: 'center' },
    draggable: true,
  });

  // Group nodes by type for layout
  const topics    = (apiData.nodes || []).filter(n => n.type === 'topic');
  const subtopics = (apiData.nodes || []).filter(n => n.type === 'subtopic');
  const terms     = (apiData.nodes || []).filter(n => n.type === 'term');

  // Place topics in a circle around center
  const topicRadius = 260;
  topics.forEach((n, i) => {
    const angle = (i / topics.length) * 2 * Math.PI - Math.PI / 2;
    nodes.push({
      id: n.id,
      type: 'mindNode',
      position: {
        x: cx + topicRadius * Math.cos(angle) - 70,
        y: cy + topicRadius * Math.sin(angle) - 20,
      },
      data: { label: n.label, type: 'topic' },
      draggable: true,
    });
  });

  // Place subtopics further out
  const subRadius = 460;
  subtopics.forEach((n, i) => {
    const angle = (i / subtopics.length) * 2 * Math.PI - Math.PI / 4;
    nodes.push({
      id: n.id,
      type: 'mindNode',
      position: {
        x: cx + subRadius * Math.cos(angle) - 60,
        y: cy + subRadius * Math.sin(angle) - 18,
      },
      data: { label: n.label, type: 'subtopic' },
      draggable: true,
    });
  });

  // Place terms in inner ring offset
  const termRadius = 360;
  terms.forEach((n, i) => {
    const angle = (i / terms.length) * 2 * Math.PI + Math.PI / 6;
    nodes.push({
      id: n.id,
      type: 'mindNode',
      position: {
        x: cx + termRadius * Math.cos(angle) - 55,
        y: cy + termRadius * Math.sin(angle) - 16,
      },
      data: { label: n.label, type: 'term' },
      draggable: true,
    });
  });

  // Build edges
  const edgeColors = {
    center: '#6366f1',
    topic: '#06b6d4',
    subtopic: '#10b981',
    term: '#f59e0b',
  };

  (apiData.edges || []).forEach((e, i) => {
    const sourceNode = e.source === 'center'
      ? { data: { type: 'center' } }
      : (apiData.nodes || []).find(n => n.id === e.source);
    const color = edgeColors[sourceNode?.data?.type || sourceNode?.type] || '#6366f1';

    edges.push({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      label: e.label || '',
      type: 'smoothstep',
      animated: e.source === 'center',
      style: { stroke: color, strokeWidth: e.source === 'center' ? 2 : 1.5, opacity: 0.7 },
      labelStyle: { fill: '#8b8baa', fontSize: 9, fontFamily: 'Inter, sans-serif' },
      labelBgStyle: { fill: 'transparent' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color,
        width: 12, height: 12,
      },
    });
  });

  return { nodes, edges };
}

/* ── Main MindMap component ────────────────────────────── */
export default function MindMap({ apiData, isLoading, onRegenerate, onClose }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // If onClose provided, open fullscreen immediately
  const [fullscreen, setFullscreen] = useState(!!onClose);

  const handleClose = () => {
    setFullscreen(false);
    onClose?.();
  };

  useEffect(() => {
    if (apiData && !apiData.error) {
      const { nodes: n, edges: e } = buildLayout(apiData);
      setNodes(n);
      setEdges(e);
    }
  }, [apiData]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const flowProps = {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    nodeTypes,
    fitView: true,
    fitViewOptions: { padding: 0.2 },
    minZoom: 0.3,
    maxZoom: 2,
    proOptions: { hideAttribution: true },
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: 12,
      }}>
        <Loader2 size={28} color="var(--accent-light)" style={{ animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
          Extracting concepts…
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          AI is mapping entities and relationships
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!apiData || apiData.error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: 10, padding: 24, textAlign: 'center',
      }}>
        <GitBranch size={28} color="var(--text-muted)" />
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
          {apiData?.error || 'No mind map yet'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Upload a PDF and click "Mind Map" to generate
        </div>
      </div>
    );
  }

  const FlowCanvas = ({ style }) => (
    <ReactFlow {...flowProps} style={style}>
      <Background
        color="rgba(99,102,241,0.08)"
        gap={28}
        size={1.5}
        variant="dots"
      />
      <Controls
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
        showInteractive={false}
      />
      <MiniMap
        nodeColor={(n) => {
          const s = NODE_STYLES[n.data?.type] || NODE_STYLES.topic;
          return s.border;
        }}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 10,
        }}
        maskColor="rgba(0,0,0,0.3)"
      />
    </ReactFlow>
  );

  return (
    <>
      {/* Inline canvas */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <FlowCanvas style={{ background: 'transparent' }} />

        {/* Toolbar */}
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 10,
          display: 'flex', gap: 6,
        }}>
          <button
            onClick={onRegenerate}
            title="Regenerate"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <RefreshCw size={11} /> Regenerate
          </button>
          <button
            onClick={() => setFullscreen(true)}
            title="Fullscreen"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8,
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: '#c4b5fd',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.12)'}
          >
            <ZoomIn size={11} /> Fullscreen
          </button>
        </div>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'var(--bg-base)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-surface)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <GitBranch size={15} color="#c4b5fd" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Visual Mind Map
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {apiData.center} · Drag nodes to rearrange · Scroll to zoom
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={onRegenerate}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
                <button
                  onClick={() => setFullscreen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 16px', borderRadius: 9,
                    background: 'linear-gradient(135deg, var(--accent) 0%, #4f46e5 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                    boxShadow: '0 3px 12px var(--accent-glow)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                >
                  ← Back
                </button>
              </div>
            </div>

            {/* Full canvas */}
            <div style={{ flex: 1, background: 'var(--bg-base)', position: 'relative' }}>
              <FlowCanvas style={{ width: '100%', height: '100%', background: 'transparent' }} />
              {/* Floating back button always visible */}
              <button
                onClick={() => { setFullscreen(false); onClose?.(); }}
                style={{
                  position: 'absolute', top: 16, left: 16, zIndex: 10,
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none', color: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                ← Back
              </button>
            </div>

            {/* Legend */}
            <div style={{
              padding: '10px 20px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              display: 'flex', gap: 20, alignItems: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Legend</span>
              {[
                { color: '#a5b4fc', label: 'Main Topic' },
                { color: '#67e8f9', label: 'Subtopic' },
                { color: '#6ee7b7', label: 'Key Term' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, opacity: 0.8 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{l.label}</span>
                </div>
              ))}
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                Drag nodes · Scroll to zoom · Click edges to select
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
