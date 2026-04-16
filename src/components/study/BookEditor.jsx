import { useState, useEffect, useRef, useCallback } from 'react';
import { BOOK_POSITIONS } from '../scenes/StudyScene';

const CANVAS_W = 1344;
const CANVAS_H = 768;

function useCanvasScale() {
  const [scale, setScale] = useState(
    () => Math.max(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H)
  );
  useEffect(() => {
    const update = () => setScale(Math.max(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return scale;
}

let nextId = BOOK_POSITIONS.length + 1;

export default function BookEditor() {
  const scale     = useCanvasScale();
  const canvasRef = useRef(null);

  const [rects,    setRects]    = useState(() => BOOK_POSITIONS.map((r, i) => ({ ...r, id: i })));
  const [selected, setSelected] = useState(null);
  const [copied,   setCopied]   = useState(false);

  // What's being dragged: { type: 'move'|'draw'|'resize', handle?, id?, ... }
  const actionRef = useRef(null);

  // ── Pointer → canvas coords ────────────────────────────────────────────────
  function toCanvas(clientX, clientY) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { cx: 0, cy: 0 };
    return {
      cx: (clientX - rect.left) / scale,
      cy: (clientY - rect.top)  / scale,
    };
  }

  // ── Hit test: which rect is under the cursor? ─────────────────────────────
  function hitRect(cx, cy) {
    for (let i = rects.length - 1; i >= 0; i--) {
      const r = rects[i];
      if (cx >= r.left && cx <= r.left + r.width && cy >= r.top && cy <= r.top + r.height) {
        return r.id;
      }
    }
    return null;
  }

  // ── Resize handle hit (8 handles: corners + edge midpoints) ───────────────
  const HANDLE_R = 6 / scale;
  function hitHandle(rect, cx, cy) {
    const { left: l, top: t, width: w, height: h } = rect;
    const handles = {
      tl: [l,       t      ], tc: [l+w/2,   t      ], tr: [l+w,     t      ],
      ml: [l,       t+h/2  ],                          mr: [l+w,     t+h/2  ],
      bl: [l,       t+h    ], bc: [l+w/2,   t+h    ], br: [l+w,     t+h    ],
    };
    for (const [key, [hx, hy]] of Object.entries(handles)) {
      if (Math.abs(cx - hx) <= HANDLE_R && Math.abs(cy - hy) <= HANDLE_R) return key;
    }
    return null;
  }

  // ── Pointer down ──────────────────────────────────────────────────────────
  function onPointerDown(e) {
    e.preventDefault();
    const { cx, cy } = toCanvas(e.clientX, e.clientY);

    // Check selected rect's resize handles first
    if (selected !== null) {
      const selRect = rects.find(r => r.id === selected);
      if (selRect) {
        const handle = hitHandle(selRect, cx, cy);
        if (handle) {
          actionRef.current = { type: 'resize', id: selRect.id, handle, startCx: cx, startCy: cy, orig: { ...selRect } };
          return;
        }
      }
    }

    const hitId = hitRect(cx, cy);
    if (hitId !== null) {
      setSelected(hitId);
      const r = rects.find(r => r.id === hitId);
      actionRef.current = { type: 'move', id: hitId, startCx: cx, startCy: cy, origLeft: r.left, origTop: r.top };
    } else {
      // Start drawing a new rect
      setSelected(null);
      actionRef.current = { type: 'draw', startCx: cx, startCy: cy, newId: nextId++ };
      setRects(prev => [...prev, { id: actionRef.current.newId, top: cy, left: cx, width: 0, height: 0 }]);
    }
  }

  const onPointerMove = useCallback((e) => {
    const a = actionRef.current;
    if (!a) return;
    const { cx, cy } = toCanvas(e.clientX, e.clientY);

    if (a.type === 'draw') {
      const left   = Math.min(cx, a.startCx);
      const top    = Math.min(cy, a.startCy);
      const width  = Math.abs(cx - a.startCx);
      const height = Math.abs(cy - a.startCy);
      setRects(prev => prev.map(r => r.id === a.newId ? { ...r, left, top, width, height } : r));

    } else if (a.type === 'move') {
      const dl = cx - a.startCx;
      const dt = cy - a.startCy;
      setRects(prev => prev.map(r => r.id === a.id
        ? { ...r, left: Math.round(a.origLeft + dl), top: Math.round(a.origTop + dt) }
        : r));

    } else if (a.type === 'resize') {
      const { orig, handle } = a;
      let { left, top, width, height } = orig;
      const dl = cx - a.startCx;
      const dt = cy - a.startCy;

      if (handle.includes('l')) { left  = orig.left  + dl; width  = orig.width  - dl; }
      if (handle.includes('r')) { width  = orig.width  + dl; }
      if (handle.includes('t')) { top   = orig.top   + dt; height = orig.height - dt; }
      if (handle.includes('b')) { height = orig.height + dt; }

      // Prevent negative size
      if (width < 8)  { width = 8;  if (handle.includes('l')) left = orig.left + orig.width - 8; }
      if (height < 8) { height = 8; if (handle.includes('t')) top  = orig.top  + orig.height - 8; }

      setRects(prev => prev.map(r => r.id === a.id
        ? { ...r, left: Math.round(left), top: Math.round(top), width: Math.round(width), height: Math.round(height) }
        : r));
    }
  }, [scale]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerUp = useCallback((e) => {
    const a = actionRef.current;
    if (a?.type === 'draw') {
      // Remove if too small
      setRects(prev => {
        const r = prev.find(r => r.id === a.newId);
        if (!r || r.width < 5 || r.height < 5) return prev.filter(r => r.id !== a.newId);
        setSelected(a.newId);
        return prev;
      });
    }
    actionRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup',   onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup',   onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  // Delete selected with Delete/Backspace key
  useEffect(() => {
    function onKey(e) {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected !== null) {
        setRects(prev => prev.filter(r => r.id !== selected));
        setSelected(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  // ── Copy config ────────────────────────────────────────────────────────────
  function copy() {
    const lines = rects.map(r =>
      `  { top: ${Math.round(r.top)}, left: ${Math.round(r.left)}, width: ${Math.round(r.width)}, height: ${Math.round(r.height)} },`
    ).join('\n');
    navigator.clipboard.writeText(`export const BOOK_POSITIONS = [\n${lines}\n];`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const selRect = rects.find(r => r.id === selected);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>

      {/* Canvas */}
      <div
        ref={canvasRef}
        onPointerDown={onPointerDown}
        style={{
          position: 'absolute',
          width: CANVAS_W, height: CANVAS_H,
          top: '50%', left: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          cursor: 'crosshair',
          userSelect: 'none',
        }}
      >
        <img src="/scenes/study.png?v=2" alt="" draggable={false}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        />

        {/* Rectangles */}
        {rects.map((r, idx) => {
          const isSel = r.id === selected;
          return (
            <div key={r.id} style={{ position: 'absolute', left: r.left, top: r.top, width: r.width, height: r.height }}>
              {/* Fill */}
              <div style={{
                position: 'absolute', inset: 0,
                background: isSel ? 'rgba(255,140,0,0.18)' : 'rgba(168,192,154,0.18)',
                border: `2px dashed ${isSel ? 'rgba(255,140,0,0.9)' : 'rgba(168,192,154,0.8)'}`,
                borderRadius: 4,
                boxSizing: 'border-box',
              }} />
              {/* Index label */}
              <div style={{
                position: 'absolute', top: 2, left: 4,
                fontFamily: 'monospace', fontSize: 11 / scale,
                color: isSel ? '#ff8c00' : '#3a6a3a',
                fontWeight: 700, pointerEvents: 'none',
              }}>{idx + 1}</div>

              {/* Resize handles (only on selected) */}
              {isSel && [
                ['tl', 0,       0      ], ['tc', '50%',   0      ], ['tr', '100%',  0      ],
                ['ml', 0,       '50%'  ],                            ['mr', '100%',  '50%'  ],
                ['bl', 0,       '100%' ], ['bc', '50%',   '100%' ], ['br', '100%',  '100%' ],
              ].map(([key, lft, tp]) => (
                <div key={key} style={{
                  position: 'absolute',
                  left: lft, top: tp,
                  width: 10, height: 10,
                  marginLeft: -5, marginTop: -5,
                  background: '#ff8c00',
                  border: '1.5px solid rgba(0,0,0,0.3)',
                  borderRadius: 2,
                  cursor: cursors[key],
                }} />
              ))}
            </div>
          );
        })}
      </div>

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 16, right: 16,
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 12, padding: '1rem 1.1rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        zIndex: 300, fontFamily: "'DynaPuff', sans-serif",
        fontSize: '0.78rem', minWidth: 230,
        backdropFilter: 'blur(6px)',
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.6rem', color: '#3a2a1a' }}>
          📚 Book Editor
        </div>

        <div style={{ color: '#666', marginBottom: '0.75rem', lineHeight: 1.6 }}>
          <strong>Drag empty area</strong> — draw rect<br />
          <strong>Drag rect</strong> — move<br />
          <strong>Drag corner</strong> — resize<br />
          <strong>Delete / Backspace</strong> — remove
        </div>

        {selRect ? (
          <div style={{
            background: '#f5f0eb', borderRadius: 8,
            padding: '0.5rem 0.65rem', marginBottom: '0.6rem',
            fontFamily: 'monospace', fontSize: '0.73rem',
            color: '#4a3a2a', lineHeight: 1.7,
          }}>
            top: {Math.round(selRect.top)} &nbsp; left: {Math.round(selRect.left)}<br />
            w: {Math.round(selRect.width)} &nbsp; h: {Math.round(selRect.height)}
          </div>
        ) : (
          <div style={{ color: '#aaa', marginBottom: '0.6rem', fontSize: '0.72rem' }}>
            {rects.length} rect{rects.length !== 1 ? 's' : ''} — click to select
          </div>
        )}

        {selected !== null && (
          <button
            onClick={() => { setRects(p => p.filter(r => r.id !== selected)); setSelected(null); }}
            style={{ ...btnStyle, marginBottom: '0.4rem', background: '#c0392b', color: '#fff', width: '100%' }}
          >
            Delete selected
          </button>
        )}

        <button onClick={copy} style={{
          width: '100%',
          background: copied ? '#5a8a5a' : '#3a2a1a',
          color: '#fff', border: 'none', borderRadius: 7,
          padding: '0.45rem 0.8rem', cursor: 'pointer',
          fontFamily: "'DynaPuff', sans-serif", fontWeight: 800,
          fontSize: '0.78rem', letterSpacing: '0.03em',
          transition: 'background 0.2s',
        }}>
          {copied ? '✓ Copied!' : 'Copy BOOK_POSITIONS'}
        </button>
        <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#999', textAlign: 'center' }}>
          Paste into StudyScene.jsx
        </div>
      </div>
    </div>
  );
}

const cursors = {
  tl: 'nw-resize', tc: 'n-resize',  tr: 'ne-resize',
  ml: 'w-resize',                    mr: 'e-resize',
  bl: 'sw-resize', bc: 's-resize',  br: 'se-resize',
};

const btnStyle = {
  border: 'none', borderRadius: 7,
  padding: '0.35rem 0.8rem', cursor: 'pointer',
  fontFamily: "'DynaPuff', sans-serif", fontWeight: 800,
  fontSize: '0.78rem',
};
