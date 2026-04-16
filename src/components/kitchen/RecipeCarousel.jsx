import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import RecipeDetailModal from './RecipeDetailModal';

const CARD_W = 162;
const CARD_H = 230;   // minimum — card grows taller for long titles
const GAP = 18;
const STRIDE = CARD_W + GAP;

// ─── Hero card ────────────────────────────────────────────────────────────────

function HeroCard({ accent, heroImage }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
      <div style={{
        width: '80%', aspectRatio: '1/1',
        borderRadius: '0.75rem',
        border: `2px solid ${accent}`,
        overflow: 'hidden', flexShrink: 0,
      }}>
        <img src={heroImage} alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

// ─── Recipe card ─────────────────────────────────────────────────────────────

function RecipeCard({ recipe, accent, index, scrollX, containerWidth, padding, onOpen, wasDragging }) {
  const cardCenter = padding + index * STRIDE + CARD_W / 2;
  const offset = useTransform(scrollX, x => x + cardCenter - containerWidth / 2);

  // More dramatic scale/opacity: center is clearly the focus
  const rotateY = useTransform(offset, [-650, -200, -60, 60, 200, 650], [38, 12, 0, 0, -12, -38]);
  const scale = useTransform(offset, [-STRIDE, -STRIDE * 0.35, 0, STRIDE * 0.35, STRIDE], [0.65, 1.06, 1.06, 1.06, 0.65]);
  const opacity = useTransform(offset, [-STRIDE * 1.2, -STRIDE * 0.45, -STRIDE * 0.2, 0, STRIDE * 0.2, STRIDE * 0.45, STRIDE * 1.2], [0.18, 0.52, 1, 1, 1, 0.52, 0.18]);

  const imgSrc = recipe.image;

  return (
    <motion.div
      style={{
        rotateY, scale, opacity,
        width: CARD_W,
        minHeight: CARD_H,   // grows taller for long titles, stays compact for short ones
        height: 'auto',
        flexShrink: 0,
        borderRadius: '1.4rem',
        overflow: 'hidden',
        background: '#fff',
        border: `2px solid ${accent}99`,
        boxShadow: `0 4px 0 ${accent}60, 0 6px 16px rgba(50,70,55,0.12)`,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={() => { if (!wasDragging.current) onOpen(); }}
      whileHover={{ y: -4, boxShadow: `0 7px 0 ${accent}70, 0 12px 28px rgba(50,70,55,0.2)` }}
      transition={{ duration: 0.14 }}
    >
      {/* Image — fixed px height so it never inflates with the card */}
      <div style={{
        flex: '0 0 128px',
        background: [
          `radial-gradient(ellipse at 30% 70%, ${accent}44 0%, transparent 55%)`,
          `radial-gradient(ellipse at 70% 30%, ${accent}28 0%, transparent 50%)`,
          '#f5f9f4',
        ].join(', '),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        borderBottom: `2px solid ${accent}60`,
      }}>
        <img src={imgSrc} alt={recipe.name} draggable={false}
          style={{ height: '100%', width: '100%', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none' }} />
      </div>

      {/* Label */}
      <div style={{
        flex: 1, padding: '0.55rem 0.65rem 0.6rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: '0.25rem',
      }}>
        <h3 style={{
          fontFamily: "'Yuji Syuku', 'Homemade Apple', cursive", fontSize: '1.05rem', fontWeight: 700,
          color: '#2a3e2e', margin: 0, lineHeight: 1.2,
        }}>
          {recipe.name}
        </h3>

        <div style={{ width: '40px', height: '2px', borderRadius: '1px', background: `${accent}bb`, flexShrink: 0 }} />

        <p style={{
          fontFamily: "'DynaPuff', sans-serif", fontSize: '0.67rem',
          fontWeight: 700, color: '#5a7060', margin: 0, lineHeight: 1.3,
        }}>
          {recipe.time} · {recipe.difficulty}
        </p>

        <button
          onClick={e => { e.stopPropagation(); if (!wasDragging.current) onOpen(); }}
          style={{
            fontFamily: "'DynaPuff', sans-serif", fontSize: '0.65rem', fontWeight: 800,
            color: '#fff', background: accent, border: 'none', borderRadius: '999px',
            padding: '0.18rem 0.65rem', cursor: 'pointer', lineHeight: 1.5,
            boxShadow: `0 2px 0 ${accent}cc`, marginTop: 'auto',
          }}
        >
          see recipe →
        </button>
      </div>
    </motion.div>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

export default function RecipeCarousel({ recipes, accent, heroImage }) {
  const containerRef = useRef(null);
  const [cw, setCw] = useState(820);
  const [openRecipe, setOpenRecipe] = useState(null);

  const N = recipes.length;
  const scrollX = useMotionValue(0);

  useEffect(() => {
    if (!containerRef.current) return;
    setCw(containerRef.current.offsetWidth);
    scrollX.set(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Spacer on each side so first/last card lands centered
  const padding = Math.max(0, cw / 2 - CARD_W / 2);
  const trackWidth = padding * 2 + N * STRIDE - GAP;
  const dragLeft = -(N - 1) * STRIDE;
  const dragRight = 0;

  const wasDragging = useRef(false);
  const pointerDownX = useRef(0);

  return (
    <div>
      <HeroCard accent={accent} heroImage={heroImage} />

      <div
        ref={containerRef}
        style={{ width: '100%', overflowX: 'hidden', overflowY: 'visible', perspective: '1100px', paddingBlock: '0.6rem' }}
        onWheel={e => {
          e.preventDefault();
          scrollX.set(Math.min(0, Math.max(dragLeft, scrollX.get() - e.deltaX)));
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: dragLeft, right: dragRight }}
          dragTransition={{ bounceStiffness: 260, bounceDamping: 26, power: 0.28 }}
          style={{ x: scrollX, display: 'flex', gap: GAP, width: trackWidth, cursor: 'grab' }}
          whileTap={{ cursor: 'grabbing' }}
          onPointerDown={e => { pointerDownX.current = e.clientX; wasDragging.current = false; }}
          onPointerMove={e => { if (Math.abs(e.clientX - pointerDownX.current) > 6) wasDragging.current = true; }}
        >
          <div style={{ width: padding, flexShrink: 0 }} />
          {recipes.map((recipe, i) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              accent={accent}
              index={i}
              scrollX={scrollX}
              containerWidth={cw}
              padding={padding}
              onOpen={() => setOpenRecipe(recipe)}
              wasDragging={wasDragging}
            />
          ))}
          <div style={{ width: padding, flexShrink: 0 }} />
        </motion.div>
      </div>

      <p style={{
        fontFamily: "'DynaPuff', sans-serif", fontSize: '0.68rem', fontWeight: 800,
        color: '#7a9878', textAlign: 'center', marginTop: '0.85rem',
        letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        drag to explore · {N} recipes
      </p>

      <RecipeDetailModal recipe={openRecipe} accent={accent} onClose={() => setOpenRecipe(null)} />
    </div>
  );
}
