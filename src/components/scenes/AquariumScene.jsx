import { useState, useEffect } from 'react';
import AquariumCanvas from '../aquarium/AquariumCanvas';
import FishReveal from '../aquarium/FishReveal';

export default function AquariumScene({ navigateTo }) {
  const [selectedFish, setSelectedFish] = useState(null);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="scene" style={{ background: '#1a3a5c' }}>
      <AquariumCanvas onFishClick={setSelectedFish} />

      {/* Hint text */}
      <div
        style={{
          position: 'absolute',
          bottom: '6%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 10,
          opacity: showHint ? 1 : 0,
          transition: 'opacity 1s ease',
        }}
      >
        <p
          style={{
            fontFamily: "'Homemade Apple', cursive",
            fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
            color: 'rgba(210, 235, 255, 0.85)',
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
            margin: 0,
          }}
        >
          click a fish to see what's inside
        </p>
      </div>

      <FishReveal item={selectedFish} onClose={() => setSelectedFish(null)} />
    </div>
  );
}
