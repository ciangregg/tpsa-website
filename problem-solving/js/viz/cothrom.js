import { mount } from "./canvas.js";
import { IB, IB_AR, IRELAND, pointInPoly } from "../lib/ireland.js";

const DISTRICT_COLORS = ["#32e875", "#9d4edd", "#c77dff"];
const K = 3;
const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/* ---------- COTHROM: fair electoral redistricting on Ireland ----------
   Population cells that fall inside the island of Ireland anneal (Potts model
   with a population-balance term) into three compact, equal-population
   districts. Boundary energy falls as gerrymandered edges dissolve. */
export function start(container) {
  let ox = 0, oy = 0, rectW = 0, rectH = 0, COLS = 0, ROWS = 0;
  let land = null, landCells = [], grid = null, counts = null, frameNo = 0;

  const idx = (x, y) => y * COLS + x;

  const seed = () => {
    grid = new Array(COLS * ROWS).fill(-1);
    // scatter K seed points across the land, assign each land cell to nearest → contiguous start
    const seeds = [];
    for (let k = 0; k < K; k++) seeds.push(landCells[(Math.random() * landCells.length) | 0]);
    counts = new Array(K).fill(0);
    for (const [x, y] of landCells) {
      let best = 0, bd = Infinity;
      for (let k = 0; k < K; k++) {
        const dx = x - seeds[k][0], dy = y - seeds[k][1], d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = k; }
      }
      grid[idx(x, y)] = best; counts[best]++;
    }
  };

  const build = ({ W, H }) => {
    const pad = 0.05;
    const fitW = W * (1 - pad * 2), fitH = H * (1 - pad * 2);
    if (fitW / fitH > IB_AR) { rectH = fitH; rectW = rectH * IB_AR; }
    else { rectW = fitW; rectH = rectW / IB_AR; }
    ox = (W - rectW) / 2; oy = (H - rectH) / 2;
    const cell = Math.max(7, Math.round(Math.min(rectW, rectH) / 28));
    COLS = Math.max(1, Math.round(rectW / cell));
    ROWS = Math.max(1, Math.round(rectH / cell));
    land = new Array(COLS * ROWS).fill(false);
    landCells = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const nx = IB.minX + ((x + 0.5) / COLS) * (IB.maxX - IB.minX);
      const ny = IB.minY + ((y + 0.5) / ROWS) * (IB.maxY - IB.minY);
      if (pointInPoly(nx, ny, IRELAND)) { land[y * COLS + x] = true; landCells.push([x, y]); }
    }
    seed();
  };

  const localEnergy = (x, y, d) => {
    let e = 0;
    for (const [dx, dy] of NB) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      if (!land[idx(nx, ny)]) continue; // coast is a free boundary
      if (grid[idx(nx, ny)] !== d) e++;
    }
    return e;
  };

  const step = () => {
    const temp = Math.max(0.02, 1 - frameNo / 240);
    const target = landCells.length / K;
    const balW = 0.9;
    const tries = Math.min(1200, landCells.length * 2);
    for (let n = 0; n < tries; n++) {
      const [x, y] = landCells[(Math.random() * landCells.length) | 0];
      const [dx, dy] = NB[(Math.random() * 4) | 0];
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || !land[idx(nx, ny)]) continue;
      const cur = grid[idx(x, y)], cand = grid[idx(nx, ny)];
      if (cur === cand) continue;
      if (counts[cur] <= 1) continue;
      const dBoundary = localEnergy(x, y, cand) - localEnergy(x, y, cur);
      const dBal =
        (Math.pow(counts[cur] - 1 - target, 2) - Math.pow(counts[cur] - target, 2) +
         Math.pow(counts[cand] + 1 - target, 2) - Math.pow(counts[cand] - target, 2)) / (target * target);
      const dE = dBoundary + balW * dBal;
      if (dE <= 0 || Math.random() < temp * 0.2) {
        grid[idx(x, y)] = cand; counts[cur]--; counts[cand]++;
      }
    }
  };

  const frame = ({ ctx, W, H }) => {
    if (!landCells.length) return;
    step();

    const px = (x) => ox + (x / COLS) * rectW;
    const py = (y) => oy + (y / ROWS) * rectH;
    ctx.clearRect(0, 0, W, H);

    const cw = rectW / COLS, ch = rectH / ROWS;
    for (const [x, y] of landCells) {
      ctx.fillStyle = DISTRICT_COLORS[grid[idx(x, y)]];
      ctx.fillRect(px(x) - 0.3, py(y) - 0.3, cw + 0.6, ch + 0.6);
    }

    // inter-district borders
    ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 1.4;
    for (const [x, y] of landCells) {
      const d = grid[idx(x, y)];
      if (x < COLS - 1 && land[idx(x + 1, y)] && grid[idx(x + 1, y)] !== d) {
        ctx.beginPath(); ctx.moveTo(px(x + 1), py(y)); ctx.lineTo(px(x + 1), py(y + 1)); ctx.stroke();
      }
      if (y < ROWS - 1 && land[idx(x, y + 1)] && grid[idx(x, y + 1)] !== d) {
        ctx.beginPath(); ctx.moveTo(px(x), py(y + 1)); ctx.lineTo(px(x + 1), py(y + 1)); ctx.stroke();
      }
    }

    // coastline
    ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.lineJoin = "round";
    ctx.beginPath();
    IRELAND.forEach(([nx, ny], i) => {
      const X = ox + ((nx - IB.minX) / (IB.maxX - IB.minX)) * rectW;
      const Y = oy + ((ny - IB.minY) / (IB.maxY - IB.minY)) * rectH;
      i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
    });
    ctx.closePath(); ctx.stroke();

    frameNo++;
    if (frameNo > 520) { frameNo = 0; seed(); }
  };

  return mount(container, { frame, onResize: build });
}
