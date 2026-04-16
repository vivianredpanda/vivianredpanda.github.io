import { useEffect, useRef } from 'react';

export default function RayCanvas({ width, height, flipped }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = '/creatures/ray.png';

    const W = width;
    const H = height;

    // ── Diagonal body strip corners (fractions of W, H) ──────────────────
    // Runs from head (left) diagonally up to tail (right).
    // Adjust these if the body strip needs to shift.
    const TL = { x: W * 0.11, y: H * 0.66 }; // top-left
    const TR = { x: W * 0.89, y: H * 0.00 }; // top-right
    const BR = { x: W * 0.91, y: H * 0.28 }; // bot-right
    const BL = { x: W * 0.24, y: H * 1.00 }; // bot-left

    const FREQ    = 0.0022;
    const AMP_TOP = 0.16;
    const AMP_BOT = 0.10;

    let startTime = performance.now();

    const tick = (now) => {
      if (!img.complete || img.naturalWidth === 0) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - startTime;
      const flapSin = Math.sin(elapsed * FREQ);

      ctx.clearRect(0, 0, W, H);

      ctx.save();
      if (flipped) {
        ctx.translate(W, 0);
        ctx.scale(-1, 1);
      }

      // ── 1. Top wing: stretch perpendicular to the actual wing edge ───────
      // Wing anchors — the real pixel edge of the wing (not the body polygon
      // corners). Everything on this line stays perfectly pinned.
      const WL = { x: W * 0.20, y: H * 0.59 }; // wing-edge left anchor
      const WR = { x: W * 0.40, y: H * 0.42 }; // wing-edge right anchor
      const scaleY = 1 - flapSin * AMP_TOP;
      const theta = Math.atan2(WR.y - WL.y, WR.x - WL.x);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-W * 2, -H * 2);
      ctx.lineTo(W * 3,  -H * 2);
      ctx.lineTo(TR.x, TR.y);
      ctx.lineTo(TL.x, TL.y);
      ctx.closePath();
      ctx.clip();
      ctx.translate(WL.x, WL.y);   // anchor on the wing edge
      ctx.rotate(theta);             // undo alignment (outer)
      ctx.scale(1, scaleY);         // stretch perpendicular to wing edge
      ctx.rotate(-theta);            // align wing edge with x-axis (inner)
      ctx.translate(-WL.x, -WL.y); // restore translation
      ctx.drawImage(img, 0, 0, W, H);
      ctx.restore();

      // ── 2. Bottom fin: stretch perpendicular to the bottom body edge ────
      // Mirror the top-wing technique: anchor on the BL→BR edge so the
      // seam stays pinned and the fin stretches outward without rotating.
      const WBL     = { x: BL.x, y: BL.y };
      const WBR     = { x: BR.x, y: BR.y };
      const scaleYB = 1 + flapSin * AMP_BOT; // opposite phase → natural paired flap
      const thetaB  = Math.atan2(WBR.y - WBL.y, WBR.x - WBL.x);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(BL.x, BL.y);
      ctx.lineTo(BR.x, BR.y);
      ctx.lineTo(W * 3,  H * 3);
      ctx.lineTo(-W * 2, H * 3);
      ctx.closePath();
      ctx.clip();
      ctx.translate(WBL.x, WBL.y);
      ctx.rotate(thetaB);
      ctx.scale(1, scaleYB);
      ctx.rotate(-thetaB);
      ctx.translate(-WBL.x, -WBL.y);
      ctx.drawImage(img, 0, 0, W, H);
      ctx.restore();

      // ── 3. Body strip: diagonal polygon, drawn flat on top of both wings ─
      // This hides all seams and keeps the head + body perfectly still.
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(TL.x, TL.y);
      ctx.lineTo(TR.x, TR.y);
      ctx.lineTo(BR.x, BR.y);
      ctx.lineTo(BL.x, BL.y);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, W, H);
      ctx.restore();

      ctx.restore(); // flip

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, flipped]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  );
}
