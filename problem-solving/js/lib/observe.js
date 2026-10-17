/** Calls `fn` the first time `el` scrolls into view, then stops observing. */
export function onceVisible(el, fn, opts = {}) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      fn(e.target);
    });
  }, { threshold: opts.threshold ?? 0.2, rootMargin: opts.rootMargin ?? "0px 0px -8% 0px" });
  io.observe(el);
  return () => io.disconnect();
}

/** Restarts a CSS animation that is already applied to `el`. */
export function replayAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth; // force reflow so the animation starts from zero again
  el.classList.add(className);
}
