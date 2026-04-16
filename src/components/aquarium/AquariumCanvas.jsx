import { useEffect, useRef, useState } from 'react';
import { FUN_CONTENT } from '../../data/funContent';
import RayCanvas from './RayCanvas';
import BubblesLayer from './BubblesLayer';

const CREATURE_DEFS = [
  {
    type: 'jellyfish',
    src: '/creatures/jellyfish_1.png',
    animName: 'jellyfish-pulse',
    animDurBase: 3.8, animDurVariance: 1.0,
    speed: 0.42, w: 160, h: 200, flip: false, count: 2, speedRange: [2.0, 3.5], scaleRange: [0.5, 1.0],
  },
  {
    type: 'fish',
    src: '/creatures/fish_1.png',
    animName: 'fish-wiggle',
    animDurBase: 2.4, animDurVariance: 0.5,
    speed: 1.5, w: 164, h: 116, flip: true, count: 1, speedRange: [3.0, 6.2], scaleRange: [0.8, 1.6],
  },
  {
    type: 't_fish',
    src: '/creatures/t_fish_1.png',
    animName: 'fish-wiggle',
    animDurBase: 3.0, animDurVariance: 0.5,
    speed: 0.95, w: 150, h: 108, flip: true, count: 1, speedRange: [3.0, 6.2], scaleRange: [0.8, 1.6],
  },
  {
    type: 'bluetang',
    src: '/creatures/bluetang.png',
    animName: 'fish-wiggle',
    animDurBase: 2.0, animDurVariance: 0.4,
    speed: 1.3, w: 154, h: 112, flip: true, count: 2, speedRange: [3.0, 6.2], scaleRange: [0.8, 1.6],
  },
  {
    type: 'parrotfish',
    src: '/creatures/parrotfish.png',
    animName: 'fish-wiggle',
    animDurBase: 2.7, animDurVariance: 0.5,
    speed: 1.0, w: 162, h: 108, flip: true, count: 1, speedRange: [3.0, 6.2], scaleRange: [0.8, 1.6],
  },
  {
    type: 'ray',
    src: '/creatures/ray.png',
    animName: 'ray-flap',
    animDurBase: 2.2, animDurVariance: 0.4,
    speed: 0.7, w: 200, h: 120, flip: true, count: 1, speedRange: [2.0, 3.5], scaleRange: [1.0, 2.0],
  },
];

function getScreenScale(W, H) {
  // Use a more sensitive baseline so they don't shrink too fast on smaller windows
  const scale = Math.sqrt((W * H) / (1100 * 600));
  return Math.max(0.65, Math.min(1.35, scale));
}

function initCreatures() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const scale = getScreenScale(W, H);
  const list = [];
  let uid = 0;
  CREATURE_DEFS.forEach((def) => {
    for (let i = 0; i < def.count; i++) {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const animDur = (def.animDurBase + (Math.random() * 2 - 1) * def.animDurVariance).toFixed(2) + 's';
      const visualScale = def.scaleRange[0] + Math.random() * (def.scaleRange[1] - def.scaleRange[0]);
      list.push({
        id: uid, def, dir, animDur, visualScale,
        depth: Math.random() < 0.8 ? 'back' : 'front',
        w: def.w * scale, h: def.h * scale,
        x: dir > 0 ? -def.w - Math.random() * W : W + def.w + Math.random() * W,
        baseY: H * 0.12 + Math.random() * (H * 0.68),
        vx: def.speed * dir * (def.speedRange[0] + Math.random() * (def.speedRange[1] - def.speedRange[0])) * scale,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: 0.0004 + Math.random() * 0.0004,
        driftAmplitude: H * (0.025 + Math.random() * 0.045),
        contentIndex: uid % FUN_CONTENT.length,
      });
      uid++;
    }
  });
  return list;
}

// ─── Option 1: CSS wiggle on DOM elements ────────────────────────────────────

export default function AquariumCanvas({ onFishClick }) {
  const [creatures] = useState(initCreatures);
  const creaturesRef = useRef(creatures);
  const posElemsRef = useRef({});
  const animRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const scale = getScreenScale(W, H);
      creaturesRef.current.forEach((c) => {
        c.w = c.def.w * scale;
        c.h = c.def.h * scale;
        c.vx = (c.vx > 0 ? 1 : -1) * Math.abs(c.def.speed * (c.def.speedRange[0] + Math.random() * (c.def.speedRange[1] - c.def.speedRange[0])) * scale);

        const el = posElemsRef.current[c.id];
        if (el) {
          el.style.width = `${c.w}px`;
          el.style.height = `${c.h}px`;
        }
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const startTime = performance.now();
    let lastTime = startTime;

    const tick = (now) => {
      // Normalize delta to 60fps so speed is frame-rate independent
      const delta = Math.min((now - lastTime) / (1000 / 60), 3);
      lastTime = now;
      const elapsed = now - startTime;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const scale = getScreenScale(W, H);

      creaturesRef.current.forEach((c) => {
        c.x += c.vx * delta;
        const y = c.baseY + Math.sin(elapsed * c.driftSpeed + c.driftPhase) * c.driftAmplitude;
        const margin = c.w * 2;
        if (c.vx > 0 && c.x > W + margin) {
          c.x = -margin;
          c.baseY = H * 0.12 + Math.random() * (H * 0.68);
          c.vx = c.def.speed * (c.def.speedRange[0] + Math.random() * (c.def.speedRange[1] - c.def.speedRange[0])) * scale;
          c.visualScale = c.def.scaleRange[0] + Math.random() * (c.def.scaleRange[1] - c.def.scaleRange[0]);
          c.depth = Math.random() < 0.8 ? 'back' : 'front';
        } else if (c.vx < 0 && c.x < -margin) {
          c.x = W + margin;
          c.baseY = H * 0.12 + Math.random() * (H * 0.68);
          c.vx = -c.def.speed * (c.def.speedRange[0] + Math.random() * (c.def.speedRange[1] - c.def.speedRange[0])) * scale;
          c.visualScale = c.def.scaleRange[0] + Math.random() * (c.def.scaleRange[1] - c.def.scaleRange[0]);
          c.depth = Math.random() < 0.8 ? 'back' : 'front';
        }
        const el = posElemsRef.current[c.id];
        if (el) el.style.transform = `translate(${c.x - c.w / 2}px, ${y - c.h / 2}px) scale(${c.visualScale})`;
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const renderCreature = (c) => (
    <div
      key={c.id}
      className="creature"
      ref={(el) => { posElemsRef.current[c.id] = el; }}
      style={{ width: c.w, height: c.h }}
      onClick={() => onFishClick(FUN_CONTENT[c.contentIndex])}
    >
      {c.def.type === 'ray' ? (
        <RayCanvas width={c.w} height={c.h} flipped={c.dir > 0} />
      ) : (
        <div style={{ transform: c.def.flip && c.dir < 0 ? 'scaleX(-1)' : undefined }}>
          <img
            src={c.def.src}
            alt={c.def.type}
            draggable={false}
            style={{
              width: c.w, height: c.h,
              objectFit: 'contain', display: 'block',
              animation: `${c.def.animName} ${c.animDur} cubic-bezier(0.45, 0, 0.55, 1) infinite`,
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/scenes/aquarium-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {creatures.filter(c => c.depth === 'back').map(renderCreature)}
      <img
        src="/scenes/aquarium-fg.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute', bottom: 0, left: 0,
          width: '100%', height: 'auto',
          pointerEvents: 'none', userSelect: 'none',
        }}
      />
      {creatures.filter(c => c.depth === 'front').map(renderCreature)}
      <BubblesLayer />
    </div>
  );
}

// ─── Option 4: Canvas + sin-wave rotation (kept for reference) ───────────────
/*
function loadImages(defs) {
  const map = {};
  defs.forEach((def) => { const img = new Image(); img.src = def.src; map[def.type] = img; });
  return map;
}

function AquariumCanvasOption4({ onFishClick }) {
  const creaturesRef = useRef(initCreatures());
  const canvasRef = useRef(null);
  const bgImgRef = useRef(null);
  const creatureImgsRef = useRef(loadImages(CREATURE_DEFS));
  const animRef = useRef(null);
  const hoveredIdRef = useRef(null);

  useEffect(() => {
    const img = new Image(); img.src = '/scenes/aquarium-bg.png';
    img.onload = () => { bgImgRef.current = img; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    let startTime = performance.now(), lastTime = startTime;
    const tick = (now) => {
      const delta = Math.min(now - lastTime, 50); lastTime = now;
      const elapsed = now - startTime, W = canvas.width, H = canvas.height;
      if (bgImgRef.current) {
        const bg = bgImgRef.current, scale = Math.max(W / bg.naturalWidth, H / bg.naturalHeight);
        ctx.drawImage(bg, (W - bg.naturalWidth * scale) / 2, (H - bg.naturalHeight * scale) / 2, bg.naturalWidth * scale, bg.naturalHeight * scale);
      } else { ctx.fillStyle = '#1a4a6c'; ctx.fillRect(0, 0, W, H); }
      creaturesRef.current.forEach((c) => {
        const def = c.def;
        c.x += c.vx;
        const y = c.baseY + Math.sin(elapsed * c.driftSpeed + c.driftPhase) * c.driftAmplitude;
        const margin = def.w * 2;
        if (c.vx > 0 && c.x > W + margin) { c.x = -margin; c.baseY = H * 0.12 + Math.random() * (H * 0.68); }
        else if (c.vx < 0 && c.x < -margin) { c.x = W + margin; c.baseY = H * 0.12 + Math.random() * (H * 0.68); }
        const img = creatureImgsRef.current[def.type];
        if (!img?.complete || !img.naturalWidth) return;
        ctx.save(); ctx.translate(c.x, y);
        if (def.flip && c.vx < 0) ctx.scale(-1, 1);
        if (def.type === 'jellyfish') {
          const pulse = Math.sin(elapsed * 0.0025 + c.wigglePhase);
          ctx.scale(1 + pulse * 0.06, 1 - pulse * 0.05);
        } else {
          ctx.rotate(Math.sin(elapsed * def.wiggleFreq + c.wigglePhase) * def.wiggleAmp);
        }
        ctx.drawImage(img, -def.w / 2, -def.h / 2, def.w, def.h);
        ctx.restore();
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  const handleClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const hit = [...creaturesRef.current].reverse().find((c) =>
      Math.abs(mx - c.x) < c.def.w / 2 && Math.abs(my - c.baseY) < c.def.h);
    if (hit) onFishClick(FUN_CONTENT[hit.contentIndex]);
  }, [onFishClick]);

  return <canvas ref={canvasRef} style={{ display: 'block' }} onClick={handleClick} />;
}
*/
