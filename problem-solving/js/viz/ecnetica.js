import { mount } from "./canvas.js";

const LAYERS = [2, 3, 4, 3]; // bottom (foundations) -> top (advanced)

/* ---------- Ecnetica: knowledge graph with excitations ----------
   A layered graph representing a body of mathematical knowledge; pulses of
   understanding travel up and down the edges, lighting concepts as they go. */
export function start(container) {
  let nodes = [], edges = [];
  const pulses = [];

  const build = ({ W, H }) => {
    nodes = []; edges = [];
    const L = LAYERS.length;
    const idxByLayer = [];
    LAYERS.forEach((count, li) => {
      const y = H - (H * 0.14 + (li / (L - 1)) * H * 0.72);
      const ids = [];
      for (let k = 0; k < count; k++) {
        const x = W * (0.16 + (count === 1 ? 0.34 : (k / (count - 1)) * 0.68));
        ids.push(nodes.length);
        nodes.push({ x, y, glow: 0, layer: li });
      }
      idxByLayer.push(ids);
    });
    for (let li = 0; li < L - 1; li++) {
      idxByLayer[li].forEach((a) => {
        // connect to nearest 2 in next layer
        const sorted = idxByLayer[li + 1].slice()
          .sort((p, q) => Math.abs(nodes[p].x - nodes[a].x) - Math.abs(nodes[q].x - nodes[a].x));
        sorted.slice(0, 2).forEach((b) => edges.push({ a, b }));
      });
    }
  };

  const edgesAt = (n) => edges.map((e, i) => ({ e, i })).filter(({ e }) => e.a === n || e.b === n);

  const spawn = () => {
    if (!edges.length) return;
    pulses.push({
      ei: (Math.random() * edges.length) | 0,
      t: 0,
      up: Math.random() < 0.62, // more often propagating upward (toward advanced)
      speed: 0.012 + Math.random() * 0.01,
      c: Math.random() < 0.5 ? "#32e875" : "#c77dff",
    });
  };

  const frame = ({ ctx, W, H }) => {
    if (!nodes.length) return;
    if (pulses.length === 0) for (let i = 0; i < 5; i++) spawn();

    ctx.fillStyle = "rgba(244,244,244,0.9)";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(90,24,154,0.16)"; ctx.lineWidth = 1.2;
    edges.forEach((e) => {
      ctx.beginPath(); ctx.moveTo(nodes[e.a].x, nodes[e.a].y); ctx.lineTo(nodes[e.b].x, nodes[e.b].y); ctx.stroke();
    });

    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i], e = edges[p.ei];
      if (!e) { pulses.splice(i, 1); continue; }
      const from = p.up ? e.a : e.b, to = p.up ? e.b : e.a;
      p.t += p.speed;
      const tt = Math.min(p.t, 1);
      const x = nodes[from].x + (nodes[to].x - nodes[from].x) * tt;
      const y = nodes[from].y + (nodes[to].y - nodes[from].y) * tt;
      // trail
      const bt = Math.max(0, tt - 0.18);
      ctx.strokeStyle = p.c; ctx.globalAlpha = 0.5; ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(nodes[from].x + (nodes[to].x - nodes[from].x) * bt, nodes[from].y + (nodes[to].y - nodes[from].y) * bt);
      ctx.lineTo(x, y); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2); ctx.fill();
      if (p.t >= 1) {
        nodes[to].glow = 1;
        const outs = edgesAt(to).filter(({ i: k }) => k !== p.ei);
        if (outs.length && Math.random() < 0.85) {
          const nxt = outs[(Math.random() * outs.length) | 0];
          pulses.push({ ei: nxt.i, t: 0, up: nxt.e.a === to, speed: p.speed, c: p.c });
        }
        pulses.splice(i, 1);
      }
    }

    nodes.forEach((n) => {
      n.glow *= 0.94;
      const r = 5 + n.glow * 6;
      if (n.glow > 0.05) {
        ctx.fillStyle = `rgba(50,232,117,${n.glow * 0.4})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, r + 8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = n.glow > 0.2 ? "#32e875" : "#7b2cbf";
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2); ctx.fill();
    });

    if (pulses.length < 6 && Math.random() < 0.05) spawn();
  };

  return mount(container, { frame, onResize: build });
}
