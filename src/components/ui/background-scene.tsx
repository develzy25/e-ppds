'use client';

import React, { useEffect, useRef } from 'react';

/**
 * BackgroundScene — Animated 3D mesh gradient backdrop.
 * Renders as a fixed full-screen element behind all content.
 * Respects prefers-reduced-motion.
 */
export function BackgroundScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Detect dark mode
    const isDark = () => document.documentElement.classList.contains('dark');

    const orbs = [
      { x: 0.2, y: 0.28, r: 0.55, speed: 0.0004, phase: 0 },
      { x: 0.8, y: 0.72, r: 0.48, speed: 0.0003, phase: Math.PI * 0.66 },
      { x: 0.6, y: 0.12, r: 0.38, speed: 0.0005, phase: Math.PI * 1.33 },
    ];

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dark = isDark();

      const colors = dark
        ? [
            `oklch(0.55 0.16 158 / 0.10)`,
            `oklch(0.48 0.18 258 / 0.12)`,
            `oklch(0.42 0.14 200 / 0.09)`,
          ]
        : [
            `oklch(0.75 0.12 158 / 0.20)`,
            `oklch(0.70 0.14 220 / 0.15)`,
            `oklch(0.82 0.10 85  / 0.13)`,
          ];

      orbs.forEach((orb, i) => {
        const px = orb.x + Math.sin(t * orb.speed + orb.phase) * 0.06;
        const py = orb.y + Math.cos(t * orb.speed * 1.3 + orb.phase) * 0.05;
        const cx = px * canvas.width;
        const cy = py * canvas.height;
        const radius = orb.r * Math.max(canvas.width, canvas.height);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, colors[i]);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 0.75, Math.sin(t * 0.0002) * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
      style={{ opacity: 1 }}
    />
  );
}
