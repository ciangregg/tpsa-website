/* Swaps the nav to its solid state once the hero is mostly scrolled past. */
export function initNav() {
  const nav = document.getElementById("nav");
  const apply = () => nav.classList.toggle("nav--solid", window.scrollY > window.innerHeight * 0.7);
  window.addEventListener("scroll", apply, { passive: true });
  window.addEventListener("resize", apply);
  apply();
}
