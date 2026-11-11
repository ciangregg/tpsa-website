import { mount } from "./canvas.js";
import { brandColor } from "../lib/brand.js";

const NL = 7, NR = 5;

/* ---------- SPARÁN / Public Payments Tracker: flow of state expenditure ---------- */
export function start(container) {
  const particles = [];

  const spawn = () => {
    particles.push({
      a: (Math.random() * NL) | 0,
      b: (Math.random() * NR) | 0,
      t: 0,
      sp: 0.004 + Math.random() * 0.006,
      r: 1.4 + Math.random() * 2.6,
      c: Math.random(),
    });
  };
  for (let i = 0; i < 60; i++) { spawn(); particles[i].t = Math.random(); }

  const frame = ({ ctx, W, H }) => {
    const leftY = (i) => (H * (i + 0.5)) / NL;
    const rightY = (i) => (H * (i + 0.5)) / NR;
    const bez = (t, a, b) => {
      const x0 = W * 0.14, x1 = W * 0.86, y0 = leftY(a), y1 = rightY(b), cx = W * 0.5, mt = 1 - t;
      return {
        x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
        y: mt * mt * y0 + 2 * mt * t * ((y0 + y1) / 2) + t * t * y1,
      };
    };

    ctx.fillStyle = "rgba(244,244,244,0.28)";
    ctx.fillRect(0, 0, W, H);

    // faint stream lines
    ctx.strokeStyle = "rgba(123,44,191,0.08)"; ctx.lineWidth = 1;
    for (let a = 0; a < NL; a++) for (let b = 0; b < NR; b++) {
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.1) { const p = bez(t, a, b); t === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }
      ctx.stroke();
    }

    for (const p of particles) {
      p.t += p.sp;
      const pos = bez(p.t, p.a, p.b);
      ctx.fillStyle = brandColor(p.c, 0.85);
      ctx.beginPath(); ctx.arc(pos.x, pos.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = particles.length - 1; i >= 0; i--) if (particles[i].t >= 1) { particles.splice(i, 1); spawn(); }

    // nodes
    ctx.fillStyle = "#3c096c";
    for (let i = 0; i < NL; i++) { ctx.beginPath(); ctx.arc(W * 0.14, leftY(i), 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#32e875";
    for (let i = 0; i < NR; i++) { ctx.beginPath(); ctx.arc(W * 0.86, rightY(i), 6, 0, Math.PI * 2); ctx.fill(); }
  };

  return mount(container, { frame });
}
