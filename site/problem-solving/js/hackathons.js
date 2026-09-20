/* Hackathons & Documents band.
   Two switch buttons pick a panel; each hackathon row expands in place; the
   library filters its document rows by free text and by tag. Everything the
   filter reads sits in the markup — data-tags on each .doc, so the list is
   complete and readable with JavaScript switched off. */
export function initHackathons() {
  const section = document.getElementById("hackathons");
  if (!section) return;

  /* panel switch */
  const tabs = [...section.querySelectorAll(".hk__tab")];
  const panels = [...section.querySelectorAll(".hk__panel")];
  const show = (name) => {
    tabs.forEach((t) => {
      const on = t.dataset.panel === name;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    panels.forEach((p) => p.classList.toggle("is-active", p.id === `hk-panel-${name}`));
  };
  tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.panel)));
  show(tabs.find((t) => t.classList.contains("is-active"))?.dataset.panel || "hack");

  /* one hackathon open at a time */
  const items = [...section.querySelectorAll(".hkx")];
  items.forEach((item) => {
    const row = item.querySelector(".hkx__row");
    row.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      items.forEach((other) => {
        other.classList.toggle("is-open", other === item && open);
        other.querySelector(".hkx__row").setAttribute("aria-expanded", String(other === item && open));
      });
    });
  });

  /* document library */
  const list = section.querySelector("#doc-list");
  if (!list) return;
  const docs = [...list.querySelectorAll(".doc")];
  const search = section.querySelector("#doc-search");
  const chips = [...section.querySelectorAll(".chip")];
  const count = section.querySelector("#doc-count");
  const empty = section.querySelector(".lib__empty");
  let tag = "all";

  const apply = () => {
    const q = (search.value || "").trim().toLowerCase();
    let shown = 0;
    docs.forEach((doc) => {
      const tags = (doc.dataset.tags || "").toLowerCase();
      const title = doc.textContent.toLowerCase();
      const on = (tag === "all" || tags.includes(tag.toLowerCase()))
        && (!q || title.includes(q) || tags.includes(q));
      doc.hidden = !on;
      if (on) shown += 1;
    });
    count.textContent = `${shown} document${shown === 1 ? "" : "s"}`;
    empty.hidden = shown !== 0;
  };

  search.addEventListener("input", apply);
  chips.forEach((chip) => chip.addEventListener("click", () => {
    tag = chip.dataset.tag;
    chips.forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    apply();
  }));
  apply();
}
