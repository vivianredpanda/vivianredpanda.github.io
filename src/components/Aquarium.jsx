import { useEffect, useRef } from 'react';

export default function Aquarium() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas size
    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Fish class
    class Fish {
      constructor(x, y, size, color, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speed = speed;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.wobble = 0;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.direction === -1) {
          ctx.scale(-1, 1);
        }

        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.size * 0.5, -this.size * 0.2, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.size * 0.5, -this.size * 0.2, this.size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(-this.size * 1.8, this.size * 0.3 + Math.sin(this.wobble) * 5);
        ctx.lineTo(-this.size * 1.8, -this.size * 0.3 + Math.cos(this.wobble) * 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      update() {
        this.x += this.speed * this.direction;
        this.wobble += 0.05;

        // Bounce off edges
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.y < this.size) this.y = this.size;
        if (this.y > canvas.height - this.size) this.y = canvas.height - this.size;
      }
    }

    // Bubble class
    class Bubble {
      constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speedY = (Math.random() + 0.5) * 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
      }

      draw() {
        ctx.strokeStyle = `rgba(26, 140, 255, 0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(26, 140, 255, 0.1)`;
        ctx.fill();
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.radius -= 0.3;
      }

      isAlive() {
        return this.radius > 0;
      }
    }

    // Initialize fish
    const fish = [
      new Fish(50, 100, 20, '#e88556', 1.5),
      new Fish(150, 200, 15, '#f0a886', 1),
      new Fish(250, 150, 18, '#e88556', 1.2),
      new Fish(350, 250, 16, '#f0a886', 1.1),
    ];

    let bubbles = [];
    let frameCount = 0;

    // Animation loop
    function animate() {
      // Water background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#e0ecff');
      gradient.addColorStop(1, '#80bfff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sand bottom
      ctx.fillStyle = '#d4a574';
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

      // Seaweed
      ctx.strokeStyle = 'rgba(139, 157, 131, 0.6)';
      ctx.lineWidth = 3;
      for (let i = 0; i < canvas.width; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, canvas.height - 40);
        for (let j = 0; j < 5; j++) {
          const waveX = Math.sin(frameCount * 0.05 + j) * 5;
          ctx.lineTo(i + waveX, canvas.height - 40 - j * 20);
        }
        ctx.stroke();
      }

      // Update and draw fish
      fish.forEach(f => {
        f.update();
        f.draw();
      });

      // Add bubbles occasionally
      if (frameCount % 20 === 0) {
        bubbles.push(new Bubble(Math.random() * canvas.width, canvas.height - 50, 5));
      }

      // Update and draw bubbles
      bubbles = bubbles.filter(b => {
        b.update();
        if (b.isAlive()) {
          b.draw();
          return true;
        }
        return false;
      });

      frameCount++;
      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full border-4 border-orange-400 rounded-2xl shadow-lg"
        style={{ aspectRatio: '4/3', background: '#e0ecff' }}
      />
    </div>
  );
}
