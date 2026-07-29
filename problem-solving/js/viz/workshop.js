import { mount } from "./canvas.js";

/* ---------- TPSAI: EU AI Act conformity checklist (stylised) ----------
   An abstract requirements checklist: a scan cursor moves down, each row is
   assessed and ticked green, a progress bar fills, and a seal is issued. */
const ROWS = [0.60, 0.48, 0.70, 0.44, 0.66, 0.40, 0.56];
const N = ROWS.length;
const SCAN = 30, START = 24, HOLD = 150;

export function start(container) {
  let status = new Array(N).fill(0), cur = 0, scanT = 0, holdT = 0, done = false, t = 0;
  const reset = () => { status = new Array(N).fill(0); cur = 0; scanT = 0; holdT = 0; done = false; };

  const frame = ({ ctx, W, H }) => {
    const rr = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    };

    t++;
    // advance state machine
    if (!done && t > START) {
      if (cur < N) {
        if (status[cur] === 0) status[cur] = 1;
        scanT++;
        if (scanT >= SCAN) { status[cur] = 2; cur++; scanT = 0; }
      } else { done = true; holdT = 0; }
    } else if (done) {
      holdT++;
      if (holdT > HOLD) reset();
    }
    const doneCount = status.filter((s) => s === 2).length;

    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    const pad = W * 0.07;
    const headerH = H * 0.19, footerH = H * 0.13;
    const listTop = headerH, listH = H - headerH - footerH;
    const rowH = listH / N;

    // header — stylised title bar + risk-tier pill
    const th = Math.max(8, H * 0.05);
    ctx.fillStyle = "rgba(16,0,43,0.82)"; rr(pad, headerH * 0.34 - th / 2, W * 0.4, th, th / 2); ctx.fill();
    ctx.fillStyle = "rgba(123,44,191,0.35)"; rr(pad, headerH * 0.66 - th * 0.35, W * 0.24, th * 0.7, th * 0.35); ctx.fill();
    const ph = Math.max(14, H * 0.075), pw = Math.max(64, W * 0.2);
    const pxp = W - pad - pw, pyp = headerH * 0.5 - ph / 2;
    ctx.fillStyle = "rgba(123,44,191,0.14)"; rr(pxp, pyp, pw, ph, ph / 2); ctx.fill();
    ctx.fillStyle = "#7b2cbf";
    ctx.beginPath(); ctx.arc(pxp + ph * 0.6, pyp + ph / 2, ph * 0.16, 0, Math.PI * 2); ctx.fill();
    rr(pxp + ph * 0.95, pyp + ph / 2 - ph * 0.12, pw * 0.5, ph * 0.24, ph * 0.12); ctx.fill();
    ctx.strokeStyle = "rgba(16,0,43,0.1)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, headerH - 1); ctx.lineTo(W - pad, headerH - 1); ctx.stroke();

    // rows
    const box = Math.min(rowH * 0.42, 24);
    const lh = Math.max(6, Math.min(rowH * 0.24, 12));
    for (let i = 0; i < N; i++) {
      const ry = listTop + i * rowH, cy = ry + rowH / 2, st = status[i];
      if (st === 1) {
        ctx.fillStyle = "rgba(50,232,117,0.08)";
        rr(pad - 10, ry + rowH * 0.08, W - pad * 2 + 20, rowH * 0.84, 8); ctx.fill();
      }
      const bx = pad, by = cy - box / 2;
      if (st === 2) {
        ctx.fillStyle = "#32e875"; rr(bx, by, box, box, 6); ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = Math.max(2, box * 0.11); ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(bx + box * 0.26, by + box * 0.52);
        ctx.lineTo(bx + box * 0.44, by + box * 0.7);
        ctx.lineTo(bx + box * 0.76, by + box * 0.3);
        ctx.stroke();
      } else if (st === 1) {
        ctx.strokeStyle = "#32e875"; ctx.lineWidth = 2; rr(bx, by, box, box, 6); ctx.stroke();
        const sy = by + 3 + (box - 6) * (scanT / SCAN);
        ctx.strokeStyle = "rgba(50,232,117,0.9)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(bx + 3, sy); ctx.lineTo(bx + box - 3, sy); ctx.stroke();
      } else {
        ctx.strokeStyle = "rgba(16,0,43,0.2)"; ctx.lineWidth = 1.6; rr(bx, by, box, box, 6); ctx.stroke();
      }
      // stylised label bar
      const lx = bx + box + box * 0.7;
      const lw = ((W - pad) - lx - W * 0.1) * ROWS[i];
      ctx.fillStyle = st === 2 ? "rgba(16,0,43,0.5)" : st === 1 ? "rgba(16,0,43,0.42)" : "rgba(16,0,43,0.14)";
      rr(lx, cy - lh / 2, lw, lh, lh / 2); ctx.fill();
      // right tag bar
      const tw = W * 0.06;
      ctx.fillStyle = st === 0 ? "rgba(123,44,191,0.25)" : "rgba(123,44,191,0.7)";
      rr(W - pad - tw, cy - lh * 0.4, tw, lh * 0.8, lh * 0.4); ctx.fill();
    }

    // footer progress
    const fy = H - footerH + footerH * 0.3;
    const barX = pad, barW = W - pad * 2, barH = Math.max(6, footerH * 0.18);
    ctx.fillStyle = "rgba(16,0,43,0.09)"; rr(barX, fy, barW, barH, barH / 2); ctx.fill();
    const frac = doneCount / N;
    if (frac > 0) { ctx.fillStyle = "#32e875"; rr(barX, fy, barW * frac, barH, barH / 2); ctx.fill(); }
    const flh = Math.max(6, footerH * 0.22);
    ctx.fillStyle = "rgba(16,0,43,0.4)"; rr(barX, fy + barH + footerH * 0.24, barW * 0.3, flh, flh / 2); ctx.fill();

    // seal on completion
    if (done) {
      const s = Math.min(1, holdT / 12);
      const cr = Math.min(W, H) * 0.13;
      ctx.save();
      ctx.globalAlpha = s;
      ctx.translate(W - pad - cr, H - footerH - cr - H * 0.04);
      ctx.scale(0.8 + s * 0.2, 0.8 + s * 0.2);
      ctx.fillStyle = "rgba(50,232,117,0.18)"; ctx.beginPath(); ctx.arc(0, 0, cr * 1.25, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#32e875"; ctx.beginPath(); ctx.arc(0, 0, cr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = Math.max(3, cr * 0.16); ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(-cr * 0.42, cr * 0.05);
      ctx.lineTo(-cr * 0.1, cr * 0.4);
      ctx.lineTo(cr * 0.46, -cr * 0.38);
      ctx.stroke();
      ctx.restore();
    }
  };

  return mount(container, { frame });
}
