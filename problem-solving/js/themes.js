/* Themes ↔ projects, wired both ways. In the About box each theme expands to
   the projects working under it, one open at a time; picking a project there
   opens it in the project explorer. Going the other way, a project's Theme
   value scrolls back up and opens that theme. */
export function initThemes() {
  const rows = [...document.querySelectorAll(".theme__row")];
  if (!rows.length) return;

  const setOpen = (row, open) => {
    row.setAttribute("aria-expanded", String(open));
    row.closest(".theme")?.classList.toggle("is-open", open);
  };

  const openTheme = (id) => {
    let opened = null;
    rows.forEach((r) => {
      const on = r.dataset.theme === id;
      setOpen(r, on);
      if (on) opened = r;
    });
    return opened;
  };

  rows.forEach((row) => {
    setOpen(row, false); // collapsed to start, now that the panels are reachable
    row.addEventListener("click", () => {
      if (row.getAttribute("aria-expanded") === "true") setOpen(row, false);
      else openTheme(row.dataset.theme);
    });
  });

  // A project listed under a theme opens that project in the explorer. Going
  // through the tab button reuses the explorer's own switching.
  document.querySelectorAll(".theme__proj").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(`.px__item[data-project="${btn.dataset.project}"]`)?.click();
      document.getElementById("projects")?.scrollIntoView();
    });
  });

  // The Theme value on a project opens that theme back up in the About box.
  document.querySelectorAll(".px__theme").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = openTheme(btn.dataset.theme);
      if (!row) return;
      row.focus({ preventScroll: true }); // keeps the keyboard where the eye lands
      row.closest(".theme").scrollIntoView({ block: "center" });
    });
  });
}
