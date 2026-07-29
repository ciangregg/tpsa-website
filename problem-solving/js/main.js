import { initNav } from "./nav.js";
import { initOverlay } from "./overlay.js";
import { initReveal } from "./reveal.js";
import { initCounters } from "./counters.js";
import { initAttractor } from "./attractor.js";
import { initProjects } from "./projects.js";
import { initThemes } from "./themes.js";
import { initTeam } from "./team.js";
import { initPress } from "./press.js";

initNav();
initOverlay();
initReveal();
initCounters();
initAttractor();
initProjects();
initThemes();
initTeam();
initPress();

document.getElementById("year").textContent = new Date().getFullYear();
