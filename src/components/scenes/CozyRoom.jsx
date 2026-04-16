import { useState, useEffect, useRef } from 'react';

// Original image dimensions (used to compute cover crop offsets)
const IMG_W = 1344;
const IMG_H = 768;
const IMG_RATIO = IMG_W / IMG_H; // 1.75

// Vanishing point in image-% coordinates (center of back wall)
const VP_IMG_X = 48;
const VP_IMG_Y = 42;

// Convert image-% coordinates to viewport-% given current viewport size (cover logic)
function toViewport(imgPctX, imgPctY, imgPctW, imgPctH, vw, vh) {
  const viewRatio = vw / vh;
  let scale, offsetX, offsetY;
  if (viewRatio > IMG_RATIO) {
    // wider than image → scale by width, crop top/bottom
    scale = vw / IMG_W;
    offsetX = 0;
    offsetY = (vh - IMG_H * scale) / 2;
  } else {
    // taller than image → scale by height, crop left/right
    scale = vh / IMG_H;
    offsetX = (vw - IMG_W * scale) / 2;
    offsetY = 0;
  }
  return {
    left: (imgPctX / 100 * IMG_W * scale + offsetX) / vw * 100,
    top: (imgPctY / 100 * IMG_H * scale + offsetY) / vh * 100,
    width: (imgPctW / 100 * IMG_W * scale) / vw * 100,
    height: (imgPctH / 100 * IMG_H * scale) / vh * 100,
  };
}

// perspectiveDir:
//  +1 = left-wall object  (left side recedes)
//  -1 = right-wall object (right side recedes)
//   0 = no correction
// Positions are in image-% coordinates (relative to native 1344×768 image)
const OBJECTS = [
  {
    key: 'kitchen',
    src: '/objects/kitchen.png',
    label: 'kitchen',
    scene: 'kitchen',
    top: -2, left: 6, width: 18, height: 95,
    perspectiveDir: 1, transformOrigin: 'right top',
  },
  {
    key: 'window',
    src: '/objects/window.png',
    label: 'go outside',
    scene: 'garden',
    top: 9.5, left: 27, width: 43.5, height: 52.9,
    perspectiveDir: 0, transformOrigin: 'center top',
  },
  {
    key: 'bookshelf',
    src: '/objects/bookshelf.png',
    label: 'the study',
    scene: 'study',
    top: 16, left: 68.5, width: 17, height: 71.8,
    perspectiveDir: -1, transformOrigin: 'left top',
  },
  {
    key: 'aquarium',
    src: '/objects/aquarium2.png',
    label: 'fish tank',
    scene: 'aquarium',
    top: 43, left: 76.2, width: 23.2, height: 28.4,
    perspectiveDir: -1, transformOrigin: 'left top',
  },
];

const REF_RATIO = IMG_RATIO; // 1.75 — no correction at native image ratio
const FACTOR = 5;
const PERSP_DIST = 800;
const PAN_STEP = 220; // pixels per arrow click

export default function CozyRoom({ navigateTo }) {
  const [hoveredKey, setHoveredKey] = useState(null);
  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const [panOffset, setPanOffset] = useState(0); // 0 = centered; + = panned right (shows right side)
  const sceneRef = useRef(null);
  const maxPanRef = useRef(0);
  const isPannableRef = useRef(false);
  const touchStartXRef = useRef(null);
  const touchLastXRef = useRef(null);
  const touchStartYRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const aspectRatio = viewport.w / viewport.h;

  // Pan geometry — only relevant when viewport is narrower than the image ratio
  const isPannable = aspectRatio < IMG_RATIO;
  const scaledW = isPannable ? IMG_W * (viewport.h / IMG_H) : viewport.w;
  const maxPan = isPannable ? (scaledW - viewport.w) / 2 : 0;

  // Keep refs current so the wheel handler (registered once) always has fresh values
  useEffect(() => {
    maxPanRef.current = maxPan;
    isPannableRef.current = isPannable;
  });

  // Clamp pan to current bounds during render — avoids setState-in-effect
  const effectivePanOffset = isPannable ? Math.max(-maxPan, Math.min(maxPan, panOffset)) : 0;

  // --- Wheel / touchpad (registered imperatively so we can call preventDefault) ---
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const handler = (e) => {
      if (!isPannableRef.current) return;
      // Only intercept horizontal scroll
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        setPanOffset(p => Math.max(-maxPanRef.current, Math.min(maxPanRef.current, p + e.deltaX)));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // --- Touch swipe (mobile pan) ---
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      touchStartXRef.current = e.touches[0].clientX;
      touchLastXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (!isPannableRef.current) return;
      const dx = e.touches[0].clientX - touchLastXRef.current;
      const dy = e.touches[0].clientY - touchStartYRef.current;
      const totalDx = e.touches[0].clientX - touchStartXRef.current;
      // Only activate panning when the gesture is clearly horizontal
      if (Math.abs(totalDx) > Math.abs(dy) + 5) {
        e.preventDefault();
        setPanOffset(p => Math.max(-maxPanRef.current, Math.min(maxPanRef.current, p - dx)));
      }
      touchLastXRef.current = e.touches[0].clientX;
    };

    const onTouchEnd = () => {
      touchStartXRef.current = null;
      touchLastXRef.current = null;
      touchStartYRef.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // --- Background position ---
  // panOffset = 0 → center (50%)
  // panOffset = -maxPan → left side (0%)
  // panOffset = +maxPan → right side (100%)
  const bgPosX = maxPan > 0 ? (50 + (effectivePanOffset / maxPan) * 50).toFixed(2) : 50;

  // --- Perspective origin adjusted for pan ---
  const vp = toViewport(VP_IMG_X, VP_IMG_Y, 0, 0, viewport.w, viewport.h);
  const vpOriginX = (vp.left - (effectivePanOffset / viewport.w) * 100).toFixed(1);
  const vpOriginY = vp.top.toFixed(1);

  const ratioDelta = REF_RATIO - aspectRatio;
  const rotateYMag = ratioDelta * FACTOR;

  // --- Arrow visibility ---
  const canPanLeft = isPannable && effectivePanOffset > -maxPan + 1;
  const canPanRight = isPannable && effectivePanOffset < maxPan - 1;

  return (
    <div
      ref={sceneRef}
      className="scene"
      style={{
        backgroundImage: 'url(/scenes/cozy-room.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: `${bgPosX}% center`,
        backgroundRepeat: 'no-repeat',
        perspective: `${PERSP_DIST}px`,
        perspectiveOrigin: `${vpOriginX}% ${vpOriginY}%`,
      }}
    >

      {/* Panning content wrapper — all objects pan together */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: `translateX(${-effectivePanOffset}px)`,
      }}>

        {/* Welcome text */}
        <div style={{
          position: 'absolute', bottom: '6%', left: '50%',
          transform: 'translateX(-50%)', textAlign: 'center',
          pointerEvents: 'none', zIndex: 20,
        }}>
          <h1 style={{
            fontFamily: "'Homemade Apple', cursive",
            fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
            color: '#4a3728',
            textShadow: '0 1px 8px rgba(245,240,232,0.9)',
            lineHeight: 1.2,
          }}>
            Welcome to Vivian's Room
          </h1>
          <p style={{
            fontFamily: "'DynaPuff', sans-serif",
            fontSize: 'clamp(0.85rem, 1.2vw, 1rem)',
            color: '#7a6352', marginTop: '0.3rem',
            textShadow: '0 1px 6px rgba(245,240,232,0.9)',
          }}>
            click or swipe to explore
          </p>
        </div>

        {/* Object overlays */}
        {OBJECTS.map(({ key, src, label, scene, top, left, width, height, perspectiveDir, transformOrigin }) => {
          const hovered = hoveredKey === key;
          const rotateY = perspectiveDir * rotateYMag;
          const rotateTransform = rotateY !== 0 ? `rotateY(${rotateY.toFixed(2)}deg)` : '';
          const transform = [rotateTransform, hovered ? 'scale(1.05)' : '']
            .filter(Boolean).join(' ') || 'none';

          const vpos = toViewport(left, top, width, height, viewport.w, viewport.h);

          return (
            <div
              key={key}
              onClick={() => navigateTo(scene)}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              style={{
                position: 'absolute',
                top: `${vpos.top}%`, left: `${vpos.left}%`,
                width: `${vpos.width}%`, height: `${vpos.height}%`,
                cursor: 'pointer', zIndex: 10,
                transform,
                transformOrigin,
                transition: 'transform 0.25s ease',
              }}
            >
              <img
                src={src} alt={label} draggable={false}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'contain', objectPosition: 'bottom',
                  display: 'block', userSelect: 'none',
                  transition: 'filter 0.25s ease',
                  filter: hovered
                    ? 'drop-shadow(0 0 10px rgba(255,255,255,0.7)) drop-shadow(0 0 20px rgba(200,220,255,0.4)) brightness(1.08)'
                    : 'none',
                }}
              />
              <div style={{
                position: 'absolute', top: '-2rem', left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(245, 240, 232, 0.95)',
                border: '1.5px solid #c5d4b8', borderRadius: '999px',
                padding: '0.2rem 0.75rem',
                fontFamily: "'Homemade Apple', cursive", fontSize: '1rem', color: '#4a3728',
                whiteSpace: 'nowrap', pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(74,55,40,0.1)',
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                marginTop: hovered ? '0' : '4px', zIndex: 30,
              }}>
                {label}
              </div>
            </div>
          );
        })}

        {/* Static plant — also converted from image-% */}
        {(() => {
          const p = toViewport(57, 33, 19, 50, viewport.w, viewport.h);
          return (
            <img src="/objects/plant.png" alt="" draggable={false} style={{
              position: 'absolute',
              top: `${p.top}%`, left: `${p.left}%`,
              width: `${p.width}%`, height: `${p.height}%`,
              objectFit: 'contain', objectPosition: 'bottom',
              pointerEvents: 'none', userSelect: 'none', zIndex: 11,
            }} />
          );
        })()}
      </div>

      {/* Arrow buttons — fixed to viewport edges, outside the panning wrapper */}
      {canPanLeft && (
        <button
          onClick={() => setPanOffset(p => Math.max(-maxPan, p - PAN_STEP))}
          style={{
            position: 'absolute', left: '0.75rem', top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 50, border: 'none',
            background: 'rgba(245, 240, 232, 0.85)',
            borderRadius: '50%', width: '2.6rem', height: '2.6rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 10px rgba(74,55,40,0.18)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,240,232,1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,240,232,0.85)'}
          aria-label="Pan left"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {canPanRight && (
        <button
          onClick={() => setPanOffset(p => Math.min(maxPan, p + PAN_STEP))}
          style={{
            position: 'absolute', right: '0.75rem', top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 50, border: 'none',
            background: 'rgba(245, 240, 232, 0.85)',
            borderRadius: '50%', width: '2.6rem', height: '2.6rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 10px rgba(74,55,40,0.18)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,240,232,1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,240,232,0.85)'}
          aria-label="Pan right"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
