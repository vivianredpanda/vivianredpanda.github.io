import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContentCard({ isOpen, onClose, title, children }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(74, 55, 40, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#f5f0e8',
              borderRadius: '1.25rem',
              padding: '2rem',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 8px 40px rgba(74, 55, 40, 0.2)',
              border: '1.5px solid #dce5d5',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem',
                color: '#7a6352',
                lineHeight: 1,
                padding: '0.25rem',
              }}
              aria-label="Close"
            >
              ✕
            </button>

            {title && (
              <h2
                style={{
                  fontFamily: "'Antic Didone', serif",
                  fontSize: '1.8rem',
                  color: '#4a3728',
                  marginBottom: '1rem',
                  paddingRight: '2rem',
                }}
              >
                {title}
              </h2>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
