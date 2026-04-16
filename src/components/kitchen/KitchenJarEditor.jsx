import { useState, useRef, useEffect, useCallback } from 'react';
import { CATEGORIES } from '../../data/recipes';

const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

const CANVAS_W = 1344;
const CANVAS_H = 768;

// labelTop/labelLeft = % within the jar image div
// labelSize = font size in canvas px
const DEFAULT_JARS = [
  { categoryId: 'drinks',  left: 864, bottom: 218, width: 75, labelTop: 63, labelLeft: 59, labelSize: 15 },
  { categoryId: 'sweets',  left: 531, bottom: 220, width: 43, labelTop: 58, labelLeft: 52, labelSize: 15 },
  { categoryId: 'snacks',  left: 574, bottom: 220, width: 44, labelTop: 64, labelLeft: 52, labelSize: 13 },
  { categoryId: 'braised', left: 700, bottom: 221, width: 34, labelTop: 60, labelLeft: 51, labelSize: 15 },
  { categoryId: 'stewed',  left: 618, bottom: 220, width: 43, labelTop: 65, labelLeft: 50, labelSize: 15 },
  { categoryId: 'steamed', left: 661, bottom: 220, width: 38, labelTop: 60, labelLeft: 52, labelSize: 15 },
  { categoryId: 'wok',     left: 737, bottom: 219, width: 30, labelTop: 58, labelLeft: 49, labelSize: 15 },
  { categoryId: 'roasted', left: 768, bottom: 219, width: 38, labelTop: 60, labelLeft: 50, labelSize: 15 },
];

export default function KitchenJarEditor() {
  const [jars, setJars]         = useState(DEFAULT_JARS);
  const [selected, setSelected] = useState(null);
  const [copied, setCopied]     = useState(false);

  const [scale, setScale] = useState(
    () => Math.max(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H)
  );
  useEffect(() => {
    const update = () => setScale(Math.max(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const draggingRef = useRef(null);
  const jarElRefs   = useRef({});  // categoryId → DOM element of jar div

  // ── Drag handlers ──────────────────────────────────────────────────────────

  function startJarDrag(e, categoryId, type) {
    e.preventDefault();
    e.stopPropagation();
    const jar = jars.find(j => j.categoryId === categoryId);
    draggingRef.current = {
      categoryId, type,
      startX: e.clientX, startY: e.clientY,
      startLeft: jar.left, startBottom: jar.bottom, startWidth: jar.width,
    };
    setSelected(categoryId);
  }

  function startLabelDrag(e, categoryId) {
    e.preventDefault();
    e.stopPropagation();
    const jar    = jars.find(j => j.categoryId === categoryId);
    const jarEl  = jarElRefs.current[categoryId];
    const rect   = jarEl?.getBoundingClientRect() ?? { width: 100, height: 100 };
    draggingRef.current = {
      categoryId, type: 'label',
      startX: e.clientX, startY: e.clientY,
      startLabelLeft: jar.labelLeft,
      startLabelTop:  jar.labelTop,
      jarWScreen: rect.width,
      jarHScreen: rect.height,
    };
    setSelected(categoryId);
  }

  const onPointerMove = useCallback((e) => {
    const d = draggingRef.current;
    if (!d) return;

    if (d.type === 'label') {
      const dxPct = ((e.clientX - d.startX) / d.jarWScreen) * 100;
      const dyPct = ((e.clientY - d.startY) / d.jarHScreen) * 100;
      setJars(prev => prev.map(j => j.categoryId !== d.categoryId ? j : {
        ...j,
        labelLeft: Math.round(Math.max(0, Math.min(100, d.startLabelLeft + dxPct))),
        labelTop:  Math.round(Math.max(0, Math.min(100, d.startLabelTop  + dyPct))),
      }));
      return;
    }

    const dxCanvas = (e.clientX - d.startX) / scale;
    const dyCanvas = (e.clientY - d.startY) / scale;
    setJars(prev => prev.map(j => {
      if (j.categoryId !== d.categoryId) return j;
      if (d.type === 'move') return {
        ...j,
        left:   Math.round(Math.max(0, Math.min(CANVAS_W - d.startWidth, d.startLeft   + dxCanvas))),
        bottom: Math.round(Math.max(0, Math.min(CANVAS_H,                d.startBottom - dyCanvas))),
      };
      return { ...j, width: Math.round(Math.max(20, Math.min(400, d.startWidth + dxCanvas))) };
    }));
  }, [scale]);

  const onPointerUp = useCallback(() => { draggingRef.current = null; }, []);

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup',   onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup',   onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  // ── Copy config ────────────────────────────────────────────────────────────

  function copyConfig() {
    const lines = jars.map(j => {
      const pad = ' '.repeat(Math.max(1, 10 - j.categoryId.length));
      return `  { categoryId: '${j.categoryId}',${pad}left: ${j.left}, bottom: ${j.bottom}, width: ${j.width}, labelTop: ${j.labelTop}, labelLeft: ${j.labelLeft}, labelSize: ${j.labelSize} },`;
    }).join('\n');
    navigator.clipboard.writeText(`const CATEGORY_JARS = [\n${lines}\n];`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sel = jars.find(j => j.categoryId === selected);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', cursor: 'default' }}>

      {/* Canvas */}
      <div style={{
        position: 'absolute',
        width: CANVAS_W, height: CANVAS_H,
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center',
      }}>
        <img src="/scenes/kitchen.png" alt="" draggable={false}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        />

        {jars.map((jar) => {
          const cat   = CAT_BY_ID[jar.categoryId];
          const isSel = selected === jar.categoryId;

          return (
            <div
              key={jar.categoryId}
              ref={el => jarElRefs.current[jar.categoryId] = el}
              onPointerDown={e => startJarDrag(e, jar.categoryId, 'move')}
              style={{
                position: 'absolute',
                left: jar.left, bottom: jar.bottom, width: jar.width,
                cursor: 'grab',
                outline: isSel ? '2px dashed rgba(255,140,0,0.9)' : '2px dashed rgba(255,255,255,0.4)',
                outlineOffset: '3px',
                borderRadius: '4px',
                userSelect: 'none',
              }}
            >
              <img src={`/kitchen/${cat.jar}.png`} alt={cat.label} draggable={false}
                style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
              />

              {/* Label — draggable separately */}
              <div
                onPointerDown={e => startLabelDrag(e, jar.categoryId)}
                style={{
                  position: 'absolute',
                  top:  `${jar.labelTop}%`,
                  left: `${jar.labelLeft}%`,
                  transform: 'translate(-50%, -50%)',
                  fontFamily: "'Zhi Mang Xing', cursive",
                  fontSize: jar.labelSize,
                  fontWeight: 700,
                  color: '#4a3a2a',
                  whiteSpace: 'nowrap',
                  cursor: 'move',
                  textShadow: '0 1px 2px rgba(255,255,255,0.6)',
                  outline: isSel ? '1px dashed rgba(255,140,0,0.7)' : 'none',
                  outlineOffset: '3px',
                }}
              >
                {cat.label}
              </div>

              {/* Jar resize handle */}
              <div
                onPointerDown={e => startJarDrag(e, jar.categoryId, 'resize')}
                style={{
                  position: 'absolute', bottom: -5, right: -5,
                  width: 12, height: 12,
                  background: isSel ? '#ff8c00' : 'rgba(255,255,255,0.75)',
                  border: '1.5px solid rgba(0,0,0,0.3)',
                  borderRadius: 3, cursor: 'se-resize',
                }}
              />
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
        zIndex: 300,
        fontFamily: "'DynaPuff', sans-serif",
        fontSize: '0.78rem', minWidth: 230,
        backdropFilter: 'blur(6px)',
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.6rem', color: '#3a2a1a' }}>
          🫙 Jar Editor
        </div>

        <div style={{ color: '#666', marginBottom: '0.75rem', lineHeight: 1.6 }}>
          <strong>Drag jar</strong> — move<br />
          <strong>Drag ▪</strong> corner — resize jar<br />
          <strong>Drag label text</strong> — reposition label
        </div>

        {sel ? (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{
              background: '#f5f0eb', borderRadius: 8,
              padding: '0.5rem 0.65rem', marginBottom: '0.5rem',
              fontFamily: 'monospace', fontSize: '0.73rem',
              color: '#4a3a2a', lineHeight: 1.7,
            }}>
              <strong>{sel.categoryId}</strong><br />
              jar — left: {sel.left}  bottom: {sel.bottom}  w: {sel.width}<br />
              label — top: {sel.labelTop}%  left: {sel.labelLeft}%
            </div>

            {/* Font size control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#666', fontSize: '0.73rem' }}>Label size:</span>
              <button onClick={() => setJars(p => p.map(j => j.categoryId === sel.categoryId ? { ...j, labelSize: Math.max(6, j.labelSize - 1) } : j))}
                style={btnStyle}>−</button>
              <span style={{ fontFamily: 'monospace', minWidth: 24, textAlign: 'center' }}>{sel.labelSize}px</span>
              <button onClick={() => setJars(p => p.map(j => j.categoryId === sel.categoryId ? { ...j, labelSize: Math.min(40, j.labelSize + 1) } : j))}
                style={btnStyle}>+</button>
            </div>
          </div>
        ) : (
          <div style={{ color: '#aaa', marginBottom: '0.75rem', fontSize: '0.72rem' }}>
            Click a jar to select
          </div>
        )}

        <button onClick={copyConfig} style={{
          width: '100%',
          background: copied ? '#5a8a5a' : '#3a2a1a',
          color: '#fff', border: 'none', borderRadius: 7,
          padding: '0.45rem 0.8rem', cursor: 'pointer',
          fontFamily: "'DynaPuff', sans-serif", fontWeight: 800,
          fontSize: '0.78rem', letterSpacing: '0.03em',
          transition: 'background 0.2s',
        }}>
          {copied ? '✓ Copied!' : 'Copy CATEGORY_JARS config'}
        </button>
        <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#999', textAlign: 'center' }}>
          Paste into KitchenScene.jsx
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  width: 24, height: 24,
  background: '#e8e0d8', border: 'none', borderRadius: 4,
  cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
