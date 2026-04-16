import { useEffect, useRef } from 'react';

const BUBBLE_COUNT = 28;

function randBetween(a, b) { return a + Math.random() * (b - a); }

function makeBubble(W, H) {
  const r = Math.random();
  // Skew toward small bubbles, occasionally a big one
  const size = r < 0.6
    ? randBetween(2, 5)      // small
    : r < 0.9
      ? randBetween(5, 10)   // medium
      : randBetween(10, 18); // occasional large
  return {
    x: Math.random() * W,
    y: H * 0.1 + Math.random() * H * 0.9,
    rx: size,
    ry: size * randBetween(0.7, 1.3), // slight oval
    vy: -(randBetween(0.15, 0.2) + (1 / size) * randBetween(0.4, 0.9)), // smaller = faster
    driftPhase: Math.random() * Math.PI * 2,
    driftSpeed: randBetween(0.0004, 0.0014),
    driftAmp: randBetween(4, size * 2.5),
    opacity: randBetween(0.15, 0.5),
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleSpeed: randBetween(0.001, 0.003),
  };
}

export default function BubblesLayer() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const bubbles = Array.from({ length: BUBBLE_COUNT }, () =>
      makeBubble(window.innerWidth, window.innerHeight)
    );

    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      bubbles.forEach((b) => {
        b.y += b.vy;
        // Wobble the oval shape over time
        const rx = b.rx * (1 + Math.sin(elapsed * b.wobbleSpeed + b.wobblePhase) * 0.08);
        const ry = b.ry * (1 + Math.cos(elapsed * b.wobbleSpeed + b.wobblePhase) * 0.08);
        const x = b.x + Math.sin(elapsed * b.driftSpeed + b.driftPhase) * b.driftAmp;

        if (b.y + ry < 0) {
          Object.assign(b, makeBubble(W, H));
          b.y = H + ry;
        }

        // Bubble ring
        ctx.beginPath();
        ctx.ellipse(x, b.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(190, 225, 255, ${b.opacity})`;
        ctx.lineWidth = rx > 8 ? 1.5 : 1;
        ctx.stroke();

        // Inner fill for larger bubbles
        if (rx > 6) {
          ctx.beginPath();
          ctx.ellipse(x, b.y, rx * 0.85, ry * 0.85, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220, 240, 255, ${b.opacity * 0.12})`;
          ctx.fill();
        }

        // Highlight glint
        ctx.beginPath();
        ctx.ellipse(x - rx * 0.3, b.y - ry * 0.3, rx * 0.25, ry * 0.2, -0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.7})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    />
  );
}
