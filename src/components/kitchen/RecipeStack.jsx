import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import RecipeDetailModal from './RecipeDetailModal';

// ─── Single recipe card face ─────────────────────────────────────────────────

function RecipeCardFace({ recipe, accent, onOpen }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#faf7f2',
      borderRadius: '1.5rem',
      border: `1.5px solid ${accent}55`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 6px 24px rgba(74,55,40,0.13)',
      userSelect: 'none',
    }}>
      {/* category accent strip */}
      <div style={{ background: accent, height: '7px', flexShrink: 0 }} />

      <div style={{
        padding: '1.1rem 1.4rem 1rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
      }}>
        <h3 style={{
          fontFamily: "'Yuji Syuku', 'Homemade Apple', cursive",
          fontSize: '1.5rem',
          color: '#4a3728',
          margin: 0,
          lineHeight: 1.15,
        }}>
          {recipe.name}
        </h3>

        <div style={{
          width: '32px',
          height: '2px',
          background: `${accent}88`,
          borderRadius: '1px',
          flexShrink: 0,
        }} />

        <p style={{
          fontFamily: "'DynaPuff', sans-serif",
          fontSize: '0.83rem',
          color: '#6a5244',
          margin: 0,
          lineHeight: 1.5,
          flex: 1,
        }}>
          {recipe.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={metaStyle}>{'\u23F1'} {recipe.time}</span>
            <span style={metaStyle}>{'\u25CE'} {recipe.difficulty}</span>
          </div>

          {/* View recipe button — stopPropagation so drag isn't confused */}
          {onOpen && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
              style={{
                fontFamily: "'DynaPuff', sans-serif",
                fontSize: '0.75rem',
                color: accent,
                background: `${accent}15`,
                border: `1px solid ${accent}55`,
                borderRadius: '999px',
                padding: '0.2rem 0.65rem',
                cursor: 'pointer',
                flexShrink: 0,
                lineHeight: 1.5,
              }}
            >
              see recipe →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const metaStyle = {
  fontFamily: "'DynaPuff', sans-serif",
  fontSize: '0.78rem',
  color: '#7a6352',
};

// ─── Drag wrapper for the top card ──────────────────────────────────────────

function DraggableCard({ children, onSendToBack }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-120, 120], [25, -25]);
  const rotateY = useTransform(x, [-120, 120], [-25, 25]);
  const didDragRef = useRef(false);

  function handleDragStart() {
    didDragRef.current = false;
  }

  function handleDragEnd(_, info) {
    if (Math.abs(info.offset.x) > 110 || Math.abs(info.offset.y) > 80) {
      didDragRef.current = true;
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      style={{
        x, y, rotateX, rotateY,
        width: '100%',
        height: '100%',
        cursor: 'grab',
      }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.55}
      whileTap={{ cursor: 'grabbing' }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

// ─── Stack ───────────────────────────────────────────────────────────────────

export default function RecipeStack({ recipes, accent }) {
  const [stack, setStack] = useState(recipes);
  const [openRecipe, setOpenRecipe] = useState(null);

  const sendToBack = () => {
    setStack(prev => {
      const top = prev[prev.length - 1];
      return [top, ...prev.slice(0, -1)];
    });
  };

  const count = stack.length;

  return (
    <div>
      <div style={{
        position: 'relative',
        width: '360px',
        height: '210px',
        perspective: '600px',
        margin: '0 auto',
      }}>
        {stack.map((recipe, index) => {
          const isTop = index === count - 1;
          const depth = count - 1 - index;
          const rotateZ = depth * 4.5;
          const scale = 1 - depth * 0.055;

          return (
            <motion.div
              key={recipe.id}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                zIndex: index,
              }}
              animate={{ rotateZ, scale, transformOrigin: '85% 90%' }}
              initial={false}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              {isTop && count > 1 ? (
                <DraggableCard onSendToBack={sendToBack}>
                  <RecipeCardFace
                    recipe={recipe}
                    accent={accent}
                    onOpen={() => setOpenRecipe(recipe)}
                  />
                </DraggableCard>
              ) : (
                <RecipeCardFace
                  recipe={recipe}
                  accent={accent}
                  onOpen={isTop ? () => setOpenRecipe(recipe) : null}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {count > 1 && (
        <p style={{
          fontFamily: "'DynaPuff', sans-serif",
          fontSize: '0.78rem',
          color: '#9a8272',
          textAlign: 'center',
          marginTop: '0.85rem',
          letterSpacing: '0.02em',
        }}>
          drag to flip &mdash; {count} recipes
        </p>
      )}

      <RecipeDetailModal
        recipe={openRecipe}
        accent={accent}
        onClose={() => setOpenRecipe(null)}
      />
    </div>
  );
}
