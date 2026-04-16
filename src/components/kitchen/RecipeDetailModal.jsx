import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecipeDetailModal({ recipe, accent, onClose }) {
  useEffect(() => {
    if (!recipe) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [recipe, onClose]);

  return (
    <AnimatePresence>
      {recipe && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(74, 55, 40, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1.5rem',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 18 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              borderRadius: '1rem',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: `0 6px 0 ${accent}70, 0 16px 52px rgba(40,60,40,0.26)`,
              border: `2px solid ${accent}90`,
              position: 'relative',
              backgroundColor: `color-mix(in srgb, ${accent} 10%, white)`,
            }}
          >
            {/* Accent header band */}
            <div style={{
              background: accent,
              borderRadius: '0.85rem 0.85rem 0 0',
              padding: '0.85rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{
                fontFamily: "'Yuji Syuku', 'Homemade Apple', cursive",
                fontSize: '1.8rem',
                fontWeight: 700,
                color: '#fff',
                margin: 0,
                lineHeight: 1.15,
                textShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}>
                {recipe.name}
              </h2>
              <button
                onClick={onClose}
                style={{
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.25)',
                  border: '2px solid rgba(255,255,255,0.6)',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontFamily: "'DynaPuff', sans-serif",
                  fontWeight: 800,
                  color: '#fff',
                  padding: '0.2rem 0.6rem',
                  lineHeight: 1.5,
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.4rem 1.75rem 1.75rem' }}>
              {/* Header — title moved to band above, keep empty div for spacing compat */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span />
              </div>

              {/* Meta row */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {recipe.makes && (
                  <span style={metaStyle}>Makes {recipe.makes}</span>
                )}
                <span style={metaStyle}>⏱ {recipe.time}</span>
                <span style={metaStyle}>◎ {recipe.difficulty}</span>
              </div>

              {/* Description */}
              <p style={{
                fontFamily: "'DynaPuff', sans-serif",
                fontSize: '0.9rem',
                color: '#3e5842',
                lineHeight: 1.6,
                margin: '0 0 1.5rem',
              }}>
                {recipe.description}
              </p>

              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Ingredients */}
                <div style={{ flex: '0 0 auto', minWidth: '160px', maxWidth: '220px' }}>
                  <SectionHeading accent={accent}>食材</SectionHeading>
                  {recipe.ingredients.map((group, gi) => (
                    <div key={gi} style={{ marginBottom: group.group ? '0.75rem' : 0 }}>
                      {group.group && (
                        <p style={groupHeadingStyle}>{group.group}</p>
                      )}
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {group.items.map((item, ii) => (
                          <li key={ii} style={ingredientStyle}>
                            <span style={{ color: accent, marginRight: '0.45rem', flexShrink: 0 }}>♥</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{
                  width: '1.5px',
                  alignSelf: 'stretch',
                  background: `${accent}30`,
                  flexShrink: 0,
                }} />

                {/* Steps */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <SectionHeading accent={accent}>做法</SectionHeading>
                  <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {recipe.steps.map((step, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                        <span style={{
                          fontFamily: "'Homemade Apple', cursive",
                          fontSize: '1rem',
                          color: accent,
                          fontWeight: 700,
                          lineHeight: 1.4,
                          flexShrink: 0,
                          minWidth: '1.2rem',
                        }}>
                          {i + 1}
                        </span>
                        <span style={stepStyle}>{step}</span>
                      </li>
                    ))}
                  </ol>

                  {/* Notes */}
                  {recipe.notes?.length > 0 && (
                    <div style={{ marginTop: '1.25rem', borderTop: `1px dashed ${accent}40`, paddingTop: '0.9rem' }}>
                      <SectionHeading accent={accent}>笔记</SectionHeading>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {recipe.notes.map((note, i) => (
                          <li key={i} style={{ ...stepStyle, color: '#6a8870', fontStyle: 'italic' }}>
                            ● {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '1.5rem' }}>
                {recipe.tags.map(tag => (
                  <span key={tag} style={{
                    fontFamily: "'DynaPuff', sans-serif",
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: '#fff',
                    border: `2px solid ${accent}80`,
                    color: accent,
                    borderRadius: '999px',
                    padding: '0.15rem 0.6rem',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionHeading({ accent, children }) {
  return (
    <p style={{
      fontFamily: "'Yuji Syuku', serif",
      fontSize: '1.15rem',
      color: accent,
      margin: '0 0 0.5rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
    }}>
      {children}
    </p>
  );
}

const metaStyle = {
  fontFamily: "'DynaPuff', sans-serif",
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#5a7860',
};

const groupHeadingStyle = {
  fontFamily: "'DynaPuff', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#7a6352',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 0.3rem',
};

const ingredientStyle = {
  fontFamily: "'DynaPuff', sans-serif",
  fontSize: '0.82rem',
  color: '#304838',
  lineHeight: 1.6,
  display: 'flex',
  alignItems: 'flex-start',
};

const stepStyle = {
  fontFamily: "'DynaPuff', sans-serif",
  fontSize: '0.85rem',
  color: '#304838',
  lineHeight: 1.6,
};
