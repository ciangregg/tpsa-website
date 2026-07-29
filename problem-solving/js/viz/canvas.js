/**
 * Shared canvas plumbing for the project visualisations.
 *
 * `mount(container, draw)` fills the container with a DPR-scaled canvas, calls
 * `draw({ctx, W, H})` once per frame, and returns a stop() that cancels the
 * loop, disconnects the resize observer and empties the container again.
 * `onResize` runs on mount and whenever the box changes, for anything that
 * needs rebuilding at the new size.
 */
export function mount(container, { frame, onResize }) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "width:100%;height:100%;display:block";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const state = { ctx, W: 0, H: 0 };
  let raf = 0;

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.W = r.width; state.H = r.height;
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize?.(state);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const loop = () => { frame(state); raf = requestAnimationFrame(loop); };
  loop();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    canvas.remove();
  };
}
