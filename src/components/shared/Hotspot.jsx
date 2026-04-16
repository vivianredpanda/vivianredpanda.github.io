import { useState } from 'react';
import { motion } from 'framer-motion';

// A clickable invisible hotspot positioned over a scene background.
// Position props (top, left, width, height) are percentages of the scene container.
export default function Hotspot({ top, left, width, height, label, onClick, children }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      style={{
        position: 'absolute',
        top: `${top}%`,
        left: `${left}%`,
        width: `${width}%`,
        height: `${height}%`,
        cursor: 'pointer',
        zIndex: 10,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      {/* Hover glow overlay */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '0.75rem',
          background: 'rgba(168, 192, 154, 0.18)',
          boxShadow: '0 0 0 2px rgba(168, 192, 154, 0.5), 0 4px 24px rgba(168, 192, 154, 0.3)',
          pointerEvents: 'none',
        }}
      />

      {/* Label tooltip */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? -4 : 4 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          top: '-2.2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(245, 240, 232, 0.95)',
          border: '1.5px solid #c5d4b8',
          borderRadius: '999px',
          padding: '0.2rem 0.75rem',
          fontFamily: "'Homemade Apple', cursive",
          fontSize: '1rem',
          color: '#4a3728',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(74, 55, 40, 0.1)',
        }}
      >
        {label}
      </motion.div>

      {children}
    </motion.div>
  );
}
