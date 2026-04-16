const RAYS = [
  { left: '8%',  width: 70,  angle: -22, dur: 6.0, delay: 0.0,  opacity: 0.18 },
  { left: '22%', width: 110, angle: -18, dur: 8.5, delay: 1.5,  opacity: 0.12 },
  { left: '40%', width: 55,  angle: -25, dur: 5.5, delay: 3.0,  opacity: 0.15 },
  { left: '58%', width: 90,  angle: -20, dur: 7.0, delay: 0.8,  opacity: 0.10 },
  { left: '74%', width: 65,  angle: -15, dur: 9.0, delay: 2.2,  opacity: 0.13 },
];

export default function LightRays() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {RAYS.map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '-10%',
            left: r.left,
            width: r.width,
            height: '75%',
            background: 'linear-gradient(to bottom, rgba(200,235,255,0.55), transparent)',
            transform: `rotate(${r.angle}deg)`,
            transformOrigin: 'top center',
            animation: `ray-pulse ${r.dur}s ease-in-out ${r.delay}s infinite`,
            opacity: r.opacity,
          }}
        />
      ))}
    </div>
  );
}
