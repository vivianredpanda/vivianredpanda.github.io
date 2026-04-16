import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeCarousel from '../kitchen/RecipeCarousel';
import { CATEGORIES, RECIPES } from '../../data/recipes';

// Fixed canvas — matches kitchen_bg.png natural resolution.
// Everything is in canvas pixels; the canvas CSS-scales to cover the viewport.
const CANVAS_W = 1344;
const CANVAS_H = 768;

// Jar positions in canvas pixels (converted from % via the jar editor).
// left/bottom/width are all in px relative to the 1344×768 canvas.
const CATEGORY_JARS = [
  { categoryId: 'drinks', left: 814, bottom: 218, width: 75, labelTop: 63, labelLeft: 59, labelSize: 15 },
  { categoryId: 'sweets', left: 481, bottom: 220, width: 43, labelTop: 58, labelLeft: 52, labelSize: 15 },
  { categoryId: 'snacks', left: 524, bottom: 220, width: 44, labelTop: 64, labelLeft: 52, labelSize: 13 },
  { categoryId: 'braised', left: 650, bottom: 221, width: 34, labelTop: 60, labelLeft: 51, labelSize: 15 },
  { categoryId: 'stewed', left: 568, bottom: 220, width: 43, labelTop: 65, labelLeft: 50, labelSize: 15 },
  { categoryId: 'steamed', left: 611, bottom: 220, width: 38, labelTop: 60, labelLeft: 52, labelSize: 15 },
  { categoryId: 'wok', left: 687, bottom: 219, width: 30, labelTop: 58, labelLeft: 49, labelSize: 15 },
  { categoryId: 'roasted', left: 718, bottom: 219, width: 38, labelTop: 60, labelLeft: 50, labelSize: 15 },
];

const BY_CATEGORY = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = RECIPES.filter(r => r.categoryId === cat.id);
  return acc;
}, {});

const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

function useCanvasScale() {
  const [scale, setScale] = useState(
    () => Math.max(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H)
  );
  useEffect(() => {
    function update() {
      setScale(Math.max(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H));
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return scale;
}

export default function KitchenScene({ navigateTo, setOverlayOpen }) {
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const scale = useCanvasScale();

  useEffect(() => {
    if (setOverlayOpen) setOverlayOpen(!!openCategoryId);
  }, [openCategoryId, setOverlayOpen]);

  const cat = openCategoryId ? CAT_BY_ID[openCategoryId] : null;
  const recipes = openCategoryId ? BY_CATEGORY[openCategoryId] : [];

  return (
    <div className="scene">
      {/* Fixed canvas — scaled to cover the viewport */}
      <div style={{
        position: 'absolute',
        width: CANVAS_W,
        height: CANVAS_H,
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center',
      }}>
        {/* Background image */}
        <img
          src="/scenes/kitchen.png"
          alt=""
          draggable={false}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            userSelect: 'none', pointerEvents: 'none',
          }}
        />

        {/* Jars */}
        {CATEGORY_JARS.map((hs) => {
          const category = CAT_BY_ID[hs.categoryId];
          return (
            <motion.div
              key={hs.categoryId}
              whileHover={{ y: -6, scale: 1.07 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => setOpenCategoryId(hs.categoryId)}
              style={{
                position: 'absolute',
                left: hs.left,
                bottom: hs.bottom,
                width: hs.width,
                cursor: 'pointer',
              }}
            >
              <img
                src={`/kitchen/${category.jar}.png`}
                alt={category.label}
                draggable={false}
                style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
              />
              <div style={{
                position: 'absolute',
                top: `${hs.labelTop}%`,
                left: `${hs.labelLeft}%`,
                transform: 'translate(-50%, -50%)',
                fontFamily: "'Zhi Mang Xing', cursive",
                fontSize: hs.labelSize,
                fontWeight: 700,
                color: '#4a3a2a',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                lineHeight: 1.1,
                textShadow: '0 1px 2px rgba(255,255,255,0.6)',
              }}>
                {category.label}
              </div>
            </motion.div>
          );
        })}

        {/* Recipe Creator Container (Right Corner) */}
        <motion.div
          whileHover={{ y: -8, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => { window.location.search = '?recipe-editor'; }}
          style={{
            position: 'absolute',
            left: 1005,
            bottom: 198,
            width: 130,
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <img src="/kitchen/container.png" alt="Create Recipe" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
          <div style={{
            position: 'absolute',
            top: '68%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: "'Zhi Mang Xing', cursive",
            fontSize: 24,
            fontWeight: 800,
            color: '#5a4a3a',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            textShadow: '0 1px 3px rgba(255,255,255,0.8)',
          }}>
            写食谱
          </div>
        </motion.div>
      </div>

      {/* Modal — lives outside the canvas so it always covers the full viewport */}
      <AnimatePresence>
        {cat && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenCategoryId(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(18, 12, 8, 0.65)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 100,
              padding: '1.5rem',
            }}
          >
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.96 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '900px',
                maxHeight: '90vh',
                overflowY: 'auto',
                borderRadius: '1rem',
                padding: '1.6rem 1.6rem 1.4rem',
                boxShadow: `0 6px 0 ${cat.accent}60, 0 16px 56px rgba(40,60,40,0.28)`,
                border: `2px solid ${cat.accent}90`,
                backgroundColor: `color-mix(in srgb, ${cat.accent} 12%, white)`,
              }}
            >
              <div style={{
                background: '#fff',
                borderRadius: '0.75rem',
                padding: '1.4rem 1.4rem 1.2rem',
                border: `3px solid ${cat.accent}`,
                maxWidth: '400px',
                margin: '0 auto',
              }}>
                <h2 style={{
                  fontFamily: "'Yuji Syuku', serif",
                  fontSize: '2rem', fontWeight: 700,
                  color: cat.accent,
                  margin: '0 0 1rem',
                  textAlign: 'center', letterSpacing: '0.02em',
                }}>
                  {cat.label}
                </h2>

                {recipes.length > 0 ? (
                  <RecipeCarousel recipes={recipes} accent={cat.accent} heroImage={cat.heroImage} />
                ) : (
                  <p style={{
                    fontFamily: "'DynaPuff', sans-serif",
                    fontSize: '0.9rem', color: '#9a8272',
                    textAlign: 'center', padding: '2.5rem 0',
                  }}>
                    No recipes yet — check back soon!
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button
                  onClick={() => setOpenCategoryId(null)}
                  style={{
                    background: '#fff',
                    border: `2px solid ${cat.accent}80`,
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: cat.accent,
                    padding: '0.25rem 1.5rem',
                    lineHeight: 1.5,
                    fontFamily: "'DynaPuff', sans-serif",
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                  }}
                >
                  exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
