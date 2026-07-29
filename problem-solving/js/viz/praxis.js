const N = 40, HIST = 14, W = 520, H = 300, PAD = 24;
const SVG_NS = "http://www.w3.org/2000/svg";
const DASH = 700;

/* CSS `ease`, i.e. cubic-bezier(.25,.1,.25,1): invert x(u) by bisection, then
   read y(u). Twelve steps is far more precision than a 2s reveal needs. */
const bez = (a, b, u) => 3 * a * u * (1 - u) ** 2 + 3 * b * u ** 2 * (1 - u) + u ** 3;
const ease = (t) => {
  let lo = 0, hi = 1, u = t;
  for (let i = 0; i < 12; i++) {
    u = (lo + hi) / 2;
    if (bez(0.25, 0.25, u) < t) lo = u; else hi = u;
  }
  return bez(0.1, 1, u);
};

/* ---------- PRAXIS: probabilistic infrastructure forecast ----------
   An SVG rather than a canvas: the history line is solid, the forecast draws
   itself in, and two confidence bands fade up behind it.

   The reveal is timed here rather than handed to CSS transitions. A transition
   only runs if the browser resolved the start value in an earlier style pass,
   and switching tabs appends this SVG into a panel that came back from
   display:none in the same task - so both values could land in one pass and the
   whole reveal was skipped. Driving the values from a frame loop, the way the
   other visualisations do, makes it play on every route in. */
export function start(container) {
  const el = (name, attrs = {}) => {
    const n = document.createElementNS(SVG_NS, name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };

  const pts = [];
  let v = 42;
  for (let i = 0; i < N; i++) {
    v += Math.sin(i * 0.5) * 2 + (i < HIST ? (Math.random() - 0.5) * 3 : 3.2);
    pts.push(v);
  }

  const xs = (i) => PAD + (i / (N - 1)) * (W - PAD * 2);
  const ymin = 30, ymax = Math.max(...pts) + 30;
  const ys = (val) => H - PAD - ((val - ymin) / (ymax - ymin)) * (H - PAD * 2);
  const spread = (i) => (i < HIST ? 0 : (i - HIST) * 2.6);
  const band = (mult) => {
    let d = `M ${xs(HIST)} ${ys(pts[HIST])}`;
    for (let i = HIST; i < N; i++) d += ` L ${xs(i)} ${ys(pts[i] + spread(i) * mult)}`;
    for (let i = N - 1; i >= HIST; i--) d += ` L ${xs(i)} ${ys(pts[i] - spread(i) * mult)}`;
    return d + " Z";
  };
  const line = (upto) => pts.slice(0, upto).map((val, i) => `${i === 0 ? "M" : "L"} ${xs(i)} ${ys(val)}`).join(" ");

  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet" });
  svg.style.cssText = "width:100%;height:100%";

  const defs = el("defs");
  const grad = el("linearGradient", { id: "pxg", x1: "0", x2: "1" });
  grad.appendChild(el("stop", { offset: "0", "stop-color": "#9d4edd" }));
  grad.appendChild(el("stop", { offset: "1", "stop-color": "#32e875" }));
  defs.appendChild(grad);
  svg.appendChild(defs);

  for (let i = 0; i < 5; i++) {
    const y = PAD + (i * (H - 2 * PAD)) / 4;
    svg.appendChild(el("line", { x1: PAD, x2: W - PAD, y1: y, y2: y, stroke: "#e5e7eb", "stroke-width": "1" }));
  }

  /* Each track is a delay, a duration and what to do with its eased progress.
     They all start from their zero state so nothing flashes in fully drawn. */
  const tracks = [];
  const track = (delay, dur, apply) => { apply(0); tracks.push({ delay, dur, apply }); };

  const bandOuter = el("path", { d: band(2.1), fill: "rgba(157,78,221,0.12)" });
  const bandInner = el("path", { d: band(1), fill: "rgba(50,232,117,0.16)" });
  svg.appendChild(bandOuter);
  svg.appendChild(bandInner);
  track(0.5, 1.1, (p) => { bandOuter.style.opacity = p; });
  track(0.7, 1.1, (p) => { bandInner.style.opacity = p; });

  svg.appendChild(el("line", { x1: xs(HIST), x2: xs(HIST), y1: PAD, y2: H - PAD, stroke: "#c77dff", "stroke-width": "1.5", "stroke-dasharray": "4 4" }));
  svg.appendChild(el("path", { d: line(HIST + 1), fill: "none", stroke: "#3c096c", "stroke-width": "3", "stroke-linejoin": "round", "stroke-linecap": "round" }));

  const forecast = el("path", {
    d: line(N), fill: "none", stroke: "url(#pxg)", "stroke-width": "3",
    "stroke-dasharray": DASH, "stroke-linejoin": "round", "stroke-linecap": "round",
  });
  svg.appendChild(forecast);
  track(0, 2, (p) => { forecast.style.strokeDashoffset = DASH * (1 - p); });

  for (let i = 0; i < N; i += 5) {
    const c = el("circle", { cx: xs(i), cy: ys(pts[i]), r: "3.5", fill: "#5a189a" });
    svg.appendChild(c);
    track(0.8 + (i / 5) * 0.12, 0.4, (p) => { c.style.opacity = p; });
  }

  container.appendChild(svg);

  // A reduced-motion preference gets the finished chart, no reveal.
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  let raf = 0, t0 = 0;
  const tick = (now) => {
    t0 ||= now; // start the clock on the first frame we actually get
    const t = reduce ? Infinity : (now - t0) / 1000;
    let running = false;
    for (const tr of tracks) {
      const p = Math.min(1, Math.max(0, (t - tr.delay) / tr.dur));
      tr.apply(p < 1 ? ease(p) : 1);
      if (p < 1) running = true;
    }
    raf = running ? requestAnimationFrame(tick) : 0;
  };
  raf = requestAnimationFrame(tick);

  return () => { cancelAnimationFrame(raf); svg.remove(); };
}
