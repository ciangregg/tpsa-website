import { start as cothrom } from "./cothrom.js";
import { start as payments } from "./payments.js";
import { start as praxis } from "./praxis.js";
import { start as advert } from "./advert.js";
import { start as ecnetica } from "./ecnetica.js";
import { start as workshop } from "./workshop.js";

/* Each visualisation is `start(container) -> stop()`. The container is the
   .viz-frame div already in the markup; start() fills it and stop() empties it
   again, so only the visible project's animation ever runs. */
export const VIZ = { cothrom, payments, praxis, advert, ecnetica, workshop };
