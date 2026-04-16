import { motion } from 'framer-motion';

export default function BackButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'fixed',
        top: 'clamp(0.6rem, 2.5vw, 1.25rem)',
        left: 'clamp(0.6rem, 2.5vw, 1.25rem)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: 'clamp(0.25rem, 1.2vw, 0.5rem) clamp(0.6rem, 2vw, 1.1rem)',
        background: 'rgba(245, 240, 232, 0.92)',
        backdropFilter: 'blur(6px)',
        border: '1.5px solid #c5d4b8',
        borderRadius: '999px',
        cursor: 'pointer',
        fontFamily: "'Homemade Apple', cursive",
        fontSize: 'clamp(0.75rem, 2.5vw, 1.05rem)',
        color: '#4a3728',
        boxShadow: '0 2px 12px rgba(74, 55, 40, 0.1)',
      }}
    >
      <span style={{ fontSize: '1rem' }}>←</span>
      back to room
    </motion.button>
  );
}
