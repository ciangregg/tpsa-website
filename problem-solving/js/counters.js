import { onceVisible } from "./lib/observe.js";

/* Eases the stat figures up from zero when they scroll into view. The markup
   already contains the final value, so the numbers are correct without JS. */
export function initCounters() {
  document.querySelectorAll("[data-count-to]").forEach((el) => {
    const target = parseFloat(el.dataset.countTo);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const render = (v) => {
      el.textContent = prefix + (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-IE")) + suffix;
    };
    render(0);
    onceVisible(el, () => {
      const duration = 2000;
      let start = null;
      const tick = (t) => {
        if (start === null) start = t;
        const p = Math.min((t - start) / duration, 1);
        render(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
  });
}
