import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ContentCard from '../shared/ContentCard';
import { FALLBACK_PROJECTS, fetchProjects } from '../../data/projects';

const CANVAS_W = 1344;
const CANVAS_H = 768;

// ── Red panda position & size (canvas pixels) — paste values from /?panda-editor
const PANDA_LEFT   = 340;
const PANDA_BOTTOM = 25;
const PANDA_HEIGHT = 331;
// ────────────────────────────────────────────────────────────────────────────

// ── Book hotspot positions (canvas pixels) — paste values from /?book-editor ─
export const BOOK_POSITIONS = [
  { top: 56, left: 550, width: 18, height: 90 },
  { top: 60, left: 686, width: 18, height: 87 },
  { top: 55, left: 879, width: 15, height: 90 },
  { top: 198, left: 608, width: 14, height: 77 },
  { top: 53, left: 792, width: 16, height: 96 },
  { top: 188, left: 719, width: 19, height: 82 },
  { top: 323, left: 579, width: 17, height: 85 },
  { top: 179, left: 788, width: 21, height: 94 },
  { top: 318, left: 701, width: 25, height: 88 },
  { top: 456, left: 747, width: 21, height: 79 },
  { top: 591, left: 753, width: 19, height: 86 },
  { top: 60, left: 1014, width: 15, height: 88 },
  { top: 189, left: 897, width: 20, height: 85 },
  { top: 196, left: 966, width: 19, height: 77 },
  { top: 183, left: 1076, width: 19, height: 89 },
  { top: 317, left: 933, width: 18, height: 90 },
  { top: 313, left: 1031, width: 14, height: 94 },
  { top: 318, left: 1116, width: 18, height: 91 },
  { top: 313, left: 850, width: 14, height: 93 },
  { top: 448, left: 1013, width: 12, height: 89 },
  { top: 449, left: 890, width: 17, height: 86 },
  { top: 449, left: 890, width: 17, height: 86 },
];
// ────────────────────────────────────────────────────────────────────────────

const PANDA_EDITOR = new URLSearchParams(window.location.search).has('panda-editor');

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

// ── Panda position editor (/?panda-editor) ───────────────────────────────────

function PandaEditor({ scale }) {
  const dragRef   = useRef(null);
  const resizeRef = useRef(null);
  const [pos,  setPos]  = useState({ left: PANDA_LEFT, bottom: PANDA_BOTTOM });
  const [size, setSize] = useState(PANDA_HEIGHT);
  const [copied, setCopied] = useState(false);

  function onDragDown(e) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, startLeft: pos.left, startBottom: pos.bottom };
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragUp);
  }
  function onDragMove(e) {
    const d = dragRef.current; if (!d) return;
    setPos({
      left:   Math.round(d.startLeft   + (e.clientX - d.startX) / scale),
      bottom: Math.round(d.startBottom - (e.clientY - d.startY) / scale),
    });
  }
  function onDragUp() {
    dragRef.current = null;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragUp);
  }

  function onResizeDown(e) {
    e.preventDefault(); e.stopPropagation();
    resizeRef.current = { startX: e.clientX, startSize: size };
    window.addEventListener('pointermove', onResizeMove);
    window.addEventListener('pointerup', onResizeUp);
  }
  function onResizeMove(e) {
    const r = resizeRef.current; if (!r) return;
    setSize(Math.max(40, Math.min(900, r.startSize + (e.clientX - r.startX) / scale)));
  }
  function onResizeUp() {
    resizeRef.current = null;
    window.removeEventListener('pointermove', onResizeMove);
    window.removeEventListener('pointerup', onResizeUp);
  }

  function copy() {
    const text = `const PANDA_LEFT   = ${Math.round(pos.left)};\nconst PANDA_BOTTOM = ${Math.round(pos.bottom)};\nconst PANDA_HEIGHT = ${Math.round(size)};`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <img
        src="/characters/panda-reading.png"
        alt=""
        draggable={false}
        onPointerDown={onDragDown}
        style={{
          position: 'absolute',
          left: pos.left, bottom: pos.bottom,
          height: size,
          cursor: 'grab',
          filter: 'drop-shadow(0 4px 12px rgba(74,55,40,0.18))',
          outline: '2px dashed rgba(255,140,0,0.7)',
          outlineOffset: 4,
          userSelect: 'none',
        }}
      />
      <div onPointerDown={onResizeDown} style={{
        position: 'absolute',
        bottom: pos.bottom - 8, left: pos.left + size * 0.6,
        width: 14, height: 14,
        background: '#ff8c00', border: '1.5px solid rgba(0,0,0,0.3)',
        borderRadius: 3, cursor: 'se-resize',
      }} />
      <div style={{
        position: 'fixed', top: 16, right: 16,
        background: 'rgba(255,255,255,0.95)', borderRadius: 12,
        padding: '1rem 1.1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        zIndex: 300, fontFamily: "'DynaPuff', sans-serif", fontSize: '0.78rem', minWidth: 220,
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>🐼 Panda Editor</div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.73rem', background: '#f5f0eb', borderRadius: 6, padding: '0.4rem 0.6rem', marginBottom: '0.65rem', lineHeight: 1.7 }}>
          left: {Math.round(pos.left)}px &nbsp; bottom: {Math.round(pos.bottom)}px<br />
          height: {Math.round(size)}px
        </div>
        <div style={{ color: '#888', fontSize: '0.7rem', marginBottom: '0.6rem' }}>
          <strong>Drag panda</strong> — move &nbsp;|&nbsp; <strong>Drag ▪</strong> — resize
        </div>
        <button onClick={copy} style={{
          width: '100%', background: copied ? '#5a8a5a' : '#3a2a1a',
          color: '#fff', border: 'none', borderRadius: 7,
          padding: '0.45rem 0.8rem', cursor: 'pointer',
          fontFamily: "'DynaPuff', sans-serif", fontWeight: 800, fontSize: '0.78rem',
          transition: 'background 0.2s',
        }}>
          {copied ? '✓ Copied!' : 'Copy config'}
        </button>
        <div style={{ marginTop: '0.4rem', fontSize: '0.67rem', color: '#999', textAlign: 'center' }}>
          Paste into StudyScene.jsx
        </div>
      </div>
    </>
  );
}

// ── Scene ────────────────────────────────────────────────────────────────────

export default function StudyScene({ navigateTo }) {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [openProject, setOpenProject] = useState(null);
  const scale = useCanvasScale();

  useEffect(() => {
    fetchProjects()
      .then((data) => { if (data.length > 0) setProjects(data); })
      .catch(() => {});
  }, []);

  return (
    <div
      className="scene scene-with-bg"
      style={{ backgroundImage: 'url(/scenes/study.png?v=2)' }}
    >
      {/* Fixed canvas — same coordinate system as kitchen */}
      <div style={{
        position: 'absolute',
        width: CANVAS_W, height: CANVAS_H,
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center',
      }}>

        {/* Book hotspots */}
        {BOOK_POSITIONS.map((pos, i) => {
          const project = projects[i];
          if (!project) return null;
          return (
            <BookHotspot
              key={project.id ?? i}
              pos={pos}
              label={project.name}
              onClick={() => setOpenProject(project)}
            />
          );
        })}

        {/* Red panda */}
        {PANDA_EDITOR ? (
          <PandaEditor scale={scale} />
        ) : (
          <img
            src="/characters/panda-reading.png"
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: PANDA_LEFT, bottom: PANDA_BOTTOM,
              height: PANDA_HEIGHT,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 4px 12px rgba(74,55,40,0.18))',
            }}
          />
        )}
      </div>


      <ContentCard
        isOpen={!!openProject}
        onClose={() => setOpenProject(null)}
        title={openProject?.name}
      >
        {openProject && <ProjectDetail project={openProject} />}
      </ContentCard>
    </div>
  );
}

// Books whose top edge is above this threshold get their label shown below.
const LABEL_BELOW_THRESHOLD = 150;

// ── Book hotspot (canvas-pixel positioned) ────────────────────────────────────

function BookHotspot({ pos, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef(null);
  const labelBelow = pos.top < LABEL_BELOW_THRESHOLD;

  function onEnter() {
    clearTimeout(leaveTimer.current);
    setHovered(true);
  }
  function onLeave() {
    leaveTimer.current = setTimeout(() => setHovered(false), 500);
  }

  // Expand the hover hit-area by this many canvas px on each side
  const PAD = 10;

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      style={{
        position: 'absolute',
        left: pos.left - PAD, top: pos.top - PAD,
        width: pos.width + PAD * 2, height: pos.height + PAD * 2,
        cursor: 'pointer',
        zIndex: 10,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      {/* Visual glow — inset by PAD so it aligns with the actual book */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          top: PAD, left: PAD, right: PAD, bottom: PAD,
          borderRadius: '0.4rem',
          background: 'rgba(168,192,154,0.18)',
          boxShadow: '0 0 0 2px rgba(168,192,154,0.5), 0 4px 24px rgba(168,192,154,0.3)',
          pointerEvents: 'none',
        }}
      />

      {/* Label — above or below depending on shelf */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : (labelBelow ? -4 : 4) }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          ...(labelBelow
            ? { top: '100%', marginTop: '0.3rem' }
            : { bottom: '100%', marginBottom: '0.3rem' }),
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(245,240,232,0.95)',
          border: '1.5px solid #c5d4b8',
          borderRadius: '999px',
          padding: '0.2rem 0.75rem',
          fontFamily: "'Antic Didone', serif",
          fontSize: '1rem',
          color: '#4a3728',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(74,55,40,0.1)',
        }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
}

function ProjectDetail({ project }) {
  return (
    <div>
      {project.description && <p style={bodyStyle}>{project.description}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.75rem 0' }}>
        {project.language && <span style={tagStyle}>{project.language}</span>}
        {project.topics?.map((t) => <span key={t} style={tagStyle}>{t}</span>)}
      </div>
      <a
        href={project.html_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-block', marginTop: '0.5rem', fontFamily: "'DynaPuff', sans-serif", fontSize: '0.9rem', color: '#5a9cc4', textDecoration: 'none' }}
      >
        view on GitHub ↗
      </a>
    </div>
  );
}

const bodyStyle = { fontFamily: "'DynaPuff', sans-serif", fontSize: '0.95rem', lineHeight: 1.65, color: '#4a3728', margin: '0 0 0.25rem' };
const tagStyle  = { fontFamily: "'DynaPuff', sans-serif", fontSize: '0.78rem', background: '#f0f4ed', border: '1px solid #c5d4b8', color: '#4a3728', borderRadius: '999px', padding: '0.2rem 0.6rem' };
