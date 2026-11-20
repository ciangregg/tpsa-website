import { replayAnimation } from "./lib/observe.js";

/* Team: the triquetra's three loops and the list beneath it both select a
   group; cards open a detail modal. Group colour comes from --group, set per
   [data-group] in css/team.css. */
export function initTeam() {
  const section = document.getElementById("team");
  if (!section) return;
  const loops = [...section.querySelectorAll(".triq__loop")];
  const picks = [...section.querySelectorAll(".team__pick")];
  const grids = [...section.querySelectorAll(".team__grid")];
  const intakes = [...section.querySelectorAll(".intake--sep")];

  const select = (id) => {
    loops.forEach((l) => {
      const on = l.dataset.group === id;
      l.classList.toggle("is-active", on);
      l.setAttribute("aria-selected", String(on));
    });
    picks.forEach((p) => {
      const on = p.dataset.group === id;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-pressed", String(on));
    });
    grids.forEach((g) => {
      const on = g.dataset.group === id;
      g.classList.toggle("is-active", on);
      if (on) replayAnimation(g, "is-active"); // restart the card stagger
    });
    intakes.forEach((i) => i.classList.toggle("is-active", i.dataset.group === id));
  };

  loops.forEach((l) => {
    l.addEventListener("click", () => select(l.dataset.group));
    l.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(l.dataset.group); }
    });
  });
  picks.forEach((p) => p.addEventListener("click", () => select(p.dataset.group)));

  initModal(section);
}

/* The inbox a card falls back to when it names no address of its own. */
const SHARED_EMAIL = "problemsolving@tpsa.ie";

/* Marks for the profile links — the two brand glyphs on their own grids, and a
   stroked globe for a personal site. Static strings, so they are safe to
   insert as markup. */
const GLYPHS = {
  linkedin: '<svg class="btn__glyph" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.063 2.063 0 0 1 0 4.125Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"/></svg>',
  github: '<svg class="btn__glyph" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-2.91-.88-2.91-2.77 0-.79.28-1.44.75-1.95-.09-.23-.33-.94.07-1.95 0 0 .61-.19 2.01.75a6.9 6.9 0 0 1 1.83-.25c.62 0 1.25.08 1.83.25 1.4-.95 2.01-.75 2.01-.75.4 1.01.16 1.72.07 1.95.47.51.75 1.16.75 1.95 0 1.9-1.13 2.57-2.92 2.77.31.27.58.79.58 1.6 0 1.15-.01 2.09-.01 2.38 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>',
  website: '<svg class="btn__glyph" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8" cy="8" r="6.4"/><path d="M1.9 5.9h12.2M1.9 10.1h12.2"/><ellipse cx="8" cy="8" rx="3.1" ry="6.4"/></svg>',
};

/* The modal's link row, read off the card's data-* attributes.
   - data-email        address to write to; defaults to the shared inbox
   - data-email-label  the button's whole text; defaults to the first name
   - data-linkedin / data-github / data-website   profile and personal-site
     URLs; each button appears only when the card carries one, with
     data-linkedin-label / data-github-label / data-website-label overriding
     its text.
   Every label is overridable so that no button's wording has to be stitched
   together from a name that does not split into parts cleanly. The order
   below is the order they sit in, left to right. */
function profileLinks(card, name) {
  const d = card.dataset;
  const address = d.email || SHARED_EMAIL;
  // Mail to the shared inbox has to say who it is for; a personal address does not.
  const subject = address === SHARED_EMAIL ? `?subject=${encodeURIComponent("For " + name)}` : "";
  const links = [{
    cls: "btn--primary",
    label: d.emailLabel || `✉ Email ${name.split(" ")[0]}`,
    href: `mailto:${address}${subject}`,
  }];
  if (d.linkedin) links.push({ cls: "btn--linkedin", glyph: GLYPHS.linkedin, label: d.linkedinLabel || "LinkedIn", href: d.linkedin });
  if (d.github) links.push({ cls: "btn--github", glyph: GLYPHS.github, label: d.githubLabel || "GitHub", href: d.github });
  if (d.website) links.push({ cls: "btn--website", glyph: GLYPHS.website, label: d.websiteLabel || "Website", href: d.website });
  return links;
}

function initModal(section) {
  let modal = null;

  const close = () => {
    modal?.remove();
    modal = null;
    document.body.style.overflow = "";
  };

  const open = (card) => {
    const group = card.closest("[data-group]").dataset.group;
    const name = card.querySelector("h3").textContent;
    const role = card.querySelector(".tm__role").textContent;
    const bio = card.dataset.bio;
    const photo = card.querySelector("img").getAttribute("src");

    modal = document.createElement("div");
    modal.className = "tmodal";
    modal.innerHTML = `
      <div class="tmodal__card" role="dialog" aria-modal="true" data-group="${group}">
        <button class="tmodal__close" aria-label="Close">✕</button>
        <div class="tmodal__photo"><img alt=""></div>
        <div class="tmodal__info">
          <h3></h3>
          <div class="tmodal__role"></div>
          <p></p>
          <div class="tmodal__links"></div>
        </div>
      </div>`;
    // set text via the DOM rather than the template, so names and bios cannot
    // be interpreted as markup
    const card2 = modal.querySelector(".tmodal__card");
    card2.setAttribute("aria-label", name);
    modal.querySelector(".tmodal__photo img").src = photo;
    modal.querySelector(".tmodal__photo img").alt = name;
    modal.querySelector(".tmodal__info h3").textContent = name;
    modal.querySelector(".tmodal__role").textContent = role;
    modal.querySelector(".tmodal__info p").textContent = bio;
    const links = modal.querySelector(".tmodal__links");
    profileLinks(card, name).forEach(({ cls, glyph, label, href }) => {
      const a = document.createElement("a");
      a.className = `btn ${cls}`;
      a.href = href;
      if (glyph) a.insertAdjacentHTML("afterbegin", glyph);
      a.appendChild(document.createTextNode(label)); // label text, never markup
      if (!href.startsWith("mailto:")) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      links.appendChild(a);
    });

    modal.addEventListener("click", close);
    card2.addEventListener("click", (e) => e.stopPropagation());
    modal.querySelector(".tmodal__close").addEventListener("click", close);

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";
    modal.querySelector(".tmodal__close").focus();
  };

  section.querySelectorAll(".tm").forEach((card) => card.addEventListener("click", () => open(card)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal) close(); });
}
