/* Full-screen menu. Links stagger in via a transition-delay set per link. */
export function initOverlay() {
  const ov = document.getElementById("overlay");
  const openBtn = document.getElementById("menu-open");
  const closeBtn = document.getElementById("menu-close");
  const links = [...ov.querySelectorAll(".ov__links a")];

  const setOpen = (open) => {
    ov.classList.toggle("ov--open", open);
    ov.setAttribute("aria-hidden", String(!open));
    openBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    links.forEach((a, i) => { a.style.transitionDelay = open ? `${0.12 + i * 0.06}s` : "0s"; });
    if (open) closeBtn.focus();
  };

  openBtn.addEventListener("click", () => setOpen(true));
  closeBtn.addEventListener("click", () => setOpen(false));
  links.forEach((a) => a.addEventListener("click", () => setOpen(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && ov.classList.contains("ov--open")) setOpen(false); });
}
