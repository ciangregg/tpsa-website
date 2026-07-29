import { VIZ } from "./viz/index.js";
import { onceVisible, replayAnimation } from "./lib/observe.js";

/* Project explorer: the tab list swaps which .px__detail panel is shown. Only
   the visible panel's visualisation runs — switching stops the old one and
   starts the new. Flip cards reset to their front face on every switch. */
export function initProjects() {
  const section = document.getElementById("projects");
  if (!section) return;
  const tabs = [...section.querySelectorAll(".px__item")];
  const panels = [...section.querySelectorAll(".px__detail")];

  let stopViz = null;
  let inView = false;

  const startViz = (panel) => {
    stopViz?.();
    stopViz = null;
    const frame = panel.querySelector("[data-viz]");
    const run = frame && VIZ[frame.dataset.viz];
    if (run) stopViz = run(frame);
  };

  const select = (id, { animate = true } = {}) => {
    tabs.forEach((t) => {
      const on = t.dataset.project === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    let active = null;
    panels.forEach((p) => {
      const on = p.id === `panel-${id}`;
      p.classList.toggle("is-active", on);
      p.querySelector(".flip")?.classList.remove("is-flipped");
      if (on) active = p;
    });
    if (!active) return;
    if (animate) replayAnimation(active, "is-active");
    if (inView) startViz(active);
  };

  tabs.forEach((t) => t.addEventListener("click", () => select(t.dataset.project)));

  // flip cards
  section.querySelectorAll(".flip").forEach((flip) => {
    const toggle = () => {
      const flipped = flip.classList.toggle("is-flipped");
      flip.setAttribute("aria-label", flipped
        ? "Show the animation"
        : "Flip for how this animation relates to the project");
    };
    flip.addEventListener("click", toggle);
    flip.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });

  // hold off on the first animation until the section is actually on screen
  onceVisible(section, () => {
    inView = true;
    const active = panels.find((p) => p.classList.contains("is-active"));
    if (active) startViz(active);
  }, { threshold: 0.1 });
}
