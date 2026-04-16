import { useState } from 'react';
import { ABOUT } from '../../data/about';

export default function GardenScene({ navigateTo }) {
  const [activeCard, setActiveCard] = useState(null); // 'about' | 'skills' | 'contact'

  return (
    <div
      className="scene scene-with-bg"
      style={{ backgroundImage: 'url(/scenes/garden.png)' }}
    >

      {/* Card strip — right side, stacked vertically */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(2rem, 8%, 4rem)',
          right: 'clamp(0.5rem, 3%, 1.5rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          width: 'clamp(220px, 80vw, 340px)',
          zIndex: 20,
        }}
      >
        <GardenCard
          title="about me"
          isOpen={activeCard === 'about'}
          onToggle={() => setActiveCard(activeCard === 'about' ? null : 'about')}
        >
          {ABOUT.bio.map((p, i) => (
            <p key={i} style={bodyStyle}>{p}</p>
          ))}
        </GardenCard>

        <GardenCard
          title="skills"
          isOpen={activeCard === 'skills'}
          onToggle={() => setActiveCard(activeCard === 'skills' ? null : 'skills')}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {ABOUT.skills.map((skill) => (
              <span key={skill} style={pillStyle}>{skill}</span>
            ))}
          </div>
        </GardenCard>

        <GardenCard
          title="interests"
          isOpen={activeCard === 'interests'}
          onToggle={() => setActiveCard(activeCard === 'interests' ? null : 'interests')}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {ABOUT.interests.map((interest) => (
              <span key={interest} style={pillStyle}>{interest}</span>
            ))}
          </div>
        </GardenCard>

        <GardenCard
          title="say hello"
          isOpen={activeCard === 'contact'}
          onToggle={() => setActiveCard(activeCard === 'contact' ? null : 'contact')}
        >
          <p style={{ ...bodyStyle, marginBottom: '0.5rem' }}>
            <a href={`mailto:${ABOUT.contact.email}`} style={linkStyle}>
              {ABOUT.contact.email}
            </a>
          </p>
          <p style={{ ...bodyStyle, marginBottom: '0.5rem' }}>
            <a href={ABOUT.contact.github} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              github.com/vivianredpanda
            </a>
          </p>
          <p style={bodyStyle}>
            <a href={ABOUT.contact.linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              {ABOUT.contact.linkedin.replace('https://', '')}
            </a>
          </p>
        </GardenCard>
      </div>
    </div>
  );
}

function GardenCard({ title, isOpen, onToggle, children }) {
  return (
    <div
      style={{
        background: 'rgba(245, 240, 232, 0.92)',
        border: '1.5px solid #dce5d5',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(74, 55, 40, 0.12)',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'Homemade Apple', cursive",
          fontSize: 'clamp(0.95rem, 4.5vw, 1.3rem)',
          color: '#4a3728',
          textAlign: 'left',
          lineHeight: 1.2,
        }}
      >
        {title}
        <span style={{ fontSize: '1rem', color: '#8b9d83', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      {isOpen && (
        <div style={{ padding: '0 1rem 0.9rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}

const bodyStyle = {
  fontFamily: "'DynaPuff', sans-serif",
  fontSize: '0.88rem',
  lineHeight: 1.6,
  color: '#4a3728',
  margin: '0 0 0.4rem',
};

const pillStyle = {
  fontFamily: "'DynaPuff', sans-serif",
  fontSize: '0.78rem',
  background: '#dce5d5',
  color: '#4a3728',
  borderRadius: '999px',
  padding: '0.2rem 0.6rem',
};

const linkStyle = {
  color: '#5a9cc4',
  textDecoration: 'none',
  fontFamily: "'DynaPuff', sans-serif",
  fontSize: '0.88rem',
};
