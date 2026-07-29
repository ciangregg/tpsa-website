import { onceVisible } from "./lib/observe.js";

/* Fades every [data-reveal] element up as it scrolls into view. Delay and
   travel are set per element in the markup via --rd / --ry. */
export function initReveal() {
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    onceVisible(el, (t) => t.classList.add("is-in"), { threshold: 0.15 });
  });
}
