import { onceVisible } from "./lib/observe.js";

/* Featured In: draws the spine rule on scroll, and collapses the list to
   data-visible items once there are more than that — the three-diamond
   terminus becomes an expand button on its own. */
export function initPress() {
  const spine = document.querySelector(".spine");
  if (!spine) return;

  onceVisible(spine, () => spine.classList.add("is-drawn"), { threshold: 0.2 });

  // Someone of ours named in a mention opens their profile down in the Team
  // section. Going through the group button and the card reuses team.js's own
  // switching and modal.
  spine.querySelectorAll(".pr__person").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = document.querySelector(`.tm[data-member="${btn.dataset.member}"]`);
      if (!card) return;
      document.querySelector(`.team__pick[data-group="${card.closest("[data-group]").dataset.group}"]`)?.click();
      document.getElementById("team")?.scrollIntoView();
      card.click();
    });
  });

  const items = [...spine.querySelectorAll(".pr")];
  const visible = parseInt(spine.dataset.visible || "0", 10) || items.length;
  const cap = spine.querySelector(".spine__cap");
  const more = spine.querySelector(".spine__more");
  const label = more?.querySelector(".spine__lab");
  const hiddenCount = items.length - visible;

  if (hiddenCount <= 0) return; // nothing to expand; the inert cap stays

  cap.hidden = true;
  more.hidden = false;
  let expanded = false;

  const apply = () => {
    items.forEach((el, i) => { el.hidden = !expanded && i >= visible; });
    label.textContent = expanded
      ? "Show fewer"
      : `${hiddenCount} earlier mention${hiddenCount === 1 ? "" : "s"}`;
    more.setAttribute("aria-expanded", String(expanded));
  };
  apply();

  more.addEventListener("click", () => { expanded = !expanded; apply(); });
}
