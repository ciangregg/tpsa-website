// Brand ramp (used by the project visualisations, not the attractor)
const STOPS = [
  { h: 274, s: 85, l: 30 }, { h: 273, s: 64, l: 46 }, { h: 276, s: 90, l: 68 }, { h: 146, s: 80, l: 55 },
];

export function brandColor(t, alpha = 0.7) {
  t = Math.max(0, Math.min(1, t));
  const n = STOPS.length - 1;
  const seg = Math.min(Math.floor(t * n), n - 1);
  const f = t * n - seg;
  const a = STOPS[seg], b = STOPS[seg + 1];
  return `hsla(${a.h + (b.h - a.h) * f}, ${a.s + (b.s - a.s) * f}%, ${a.l + (b.l - a.l) * f}%, ${alpha})`;
}
