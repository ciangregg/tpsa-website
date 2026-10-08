# The Problem Solving Association — website

The TPSA redesign, as a plain static site: HTML, CSS and JavaScript, no build
step and no dependencies. This site takes over from **tpsa.ie/problem-solving**.

It is a single long-scroll page: attractor hero → about → ethics band → project
explorer → team → featured in → contact.

## Running it

There is nothing to install and nothing to compile — this folder is served as-is
and `tpsa.sh` does not touch it. From the repository root:

```bash
./tpsa.sh server      # then open http://localhost:8000/problem-solving/
```

That serves the whole `site/` directory, so the links in and out of this page
resolve the same way they do in production. Editing a file and reloading the
page is the whole development loop.

A server is needed rather than opening `index.html` from disk, because the
scripts are ES modules and browsers block those on `file://`.

## Deploying

Nothing to do. This folder lives at `site/problem-solving/`, and the GitHub
Actions workflow publishes all of `site/` to the `production` branch on every
push to `main` — see the repository README. Every path in the page is relative,
so the folder works wherever it is mounted.

Two things worth knowing:

- **`index.html`** hard-codes `https://tpsa.ie/problem-solving/` in the
  `canonical`, `og:url` and `og:image` tags. If the page ever moves, update
  those three URLs — they are the only absolute paths in the project.
- `site/.htaccess` 301s `/problem-solving`, `/problem-solving.html` and
  `/problemsolving` to `/problem-solving/`, so the old URL and the Irish Times
  links in the *Featured In* section keep resolving.

To take a fresh export of the design, replace `index.html`, `css/`, `js/` and
`assets/` wholesale — the folder is a self-contained drop-in, and nothing
outside it needs to change.

## Layout

```
index.html     the whole page: every section, all copy, all markup
css/
  tokens/      design-system tokens, copied verbatim from the handoff bundle
  *.css        one stylesheet per section, linked in cascade order
js/
  main.js      entry point; calls each init function
  nav, overlay, reveal, counters, press    small behaviours, one file each
  projects.js  tab switching, flip cards, visualisation lifecycle
  team.js      group selector and member modal
  attractor.js the hero's Halvorsen attractor
  viz/         the six project visualisations + shared canvas plumbing
  lib/         scroll observer, brand colour ramp, Ireland coastline
assets/        logo, knot pattern, team photos
```

### Editing content

**All copy lives in `index.html`.** There is no data layer to go through — to
change a project description, a team member's bio or a press quote, edit the
markup where it appears.

A few conventions the JavaScript relies on:

- **Projects** — each tab is `.px__item` with `data-project="id"`, paired with a
  `.px__detail` panel whose `id` is `panel-id`. The panel's `.viz-frame` carries
  `data-viz="name"`, which selects a module from `js/viz/index.js`. To reorder
  projects, move the tab and its panel together and renumber the `.px__num`
  labels.
- **Team** — three groups keyed by `data-group` (`leadership`, `researchers`,
  `interns`) on the triquetra loops, the selector buttons and the card grids.
  Each card's bio sits in `data-bio`; the modal reads it from there, and
  `data-member` is the slug other sections use to open that profile. Group
  colours are defined once as `--group` at the bottom of `css/team.css`.

  The modal's buttons come off the same card, all of them optional:

  | attribute | effect |
  | --- | --- |
  | `data-email` | address the email button writes to. Defaults to `problemsolving@tpsa.ie`, and only that shared address gets a `For <name>` subject line — a personal address is written to directly. |
  | `data-email-label` | the email button's whole text, including any glyph you want in front of it. Without it the label is `✉ Email <first word of the name>`, which reads badly for anyone whose name does not split on a space that way — set it rather than live with the guess. |
  | `data-linkedin` | profile URL. Adds a blue LinkedIn button; `data-linkedin-label` overrides its text. |
  | `data-github` | profile URL. Adds a black GitHub button; `data-github-label` overrides its text. |
  | `data-website` | personal site. Adds a purple button with a globe; `data-website-label` overrides its text. |

  The three link buttons appear only for the members that carry a URL, always
  in that order after the email button — LinkedIn, GitHub, then website
  furthest right — and open in a new tab. So a fully specified card looks
  like:

  ```html
  <button class="tm" style="--tmd:0s" data-member="ada-lovelace"
          data-bio="…"
          data-email="ada@tpsa.ie" data-email-label="✉ Write to Ada"
          data-linkedin="https://www.linkedin.com/in/ada-lovelace/"
          data-github="https://github.com/adalovelace"
          data-website="https://adalovelace.ie">
  ```
- **Press** — add a `.pr` block inside `.spine`, newest first, alternating
  `pr--l` / `pr--r`. `data-visible` on `.spine` caps how many show; once there
  are more, the three-diamond terminus becomes an expand button on its own.
  An article closes with a single `.pr__link`; a podcast closes with a
  `.pr__listen` row carrying one `.pr__pod` link per platform. To credit one of
  ours, add a `.pr__with` line whose `.pr__person` button names them by
  `data-member` — clicking it opens their profile in the Team section.
- **Stat counters** — `data-count-to`, with optional `data-prefix`,
  `data-suffix` and `data-decimals`. The element's text is the final value, so
  the figures are correct with JavaScript disabled.
- **Scroll reveals** — add `data-reveal` to any element; tune with
  `style="--rd:.1s"` (delay) and `--ry` (travel distance).

### Styles

`index.html` links the token files first, then one stylesheet per section.
**Link order is the cascade order** — `responsive.css` must stay last, since it
holds the shared breakpoints. If the request count ever matters, the files can
be concatenated in that same order without any other change.

The files under `css/tokens/` are copied verbatim from the `tokens/` directory of
the `tpsa-design-system` bundle in the Claude Design project. Keep them in sync
with that source rather than editing them ad hoc.

## Notes on the port

The design was handed off as a prototype that pulled React and Babel from a CDN
and transpiled JSX in the browser. This is that design rebuilt as static files.
Content that the prototype generated at runtime is now real markup, so the page
is fully readable — copy, all six project descriptions, all eleven team members,
the stat figures — with JavaScript switched off.

Compared against the prototype at 1440×900, the Ethics, Team, Featured and
Contact sections are pixel-identical, and total page height matches exactly.
Three differences remain:

- **Hero** and **Projects** differ only inside the live animated canvases, which
  draw a different frame on every run. Both diff regions fall entirely within
  the canvas bounds.
- **About** differs by 0.009% — about 145 subpixels on the edge of one glyph in
  `€78.5bn`. The prototype's JSX split the counter into three adjacent text
  nodes (`€`, `78.5`, `bn`), which the browser shapes as separate runs, losing
  kerning at the `5`→`b` boundary. This build uses a single text node, so the
  string is shaped in one pass. The static build is the more correct rendering
  of the two.

Deliberate behaviour changes, none of them visual:

- Only the visible project's visualisation runs. Switching projects tears the
  previous one down — the prototype relied on React unmounting to achieve this.
- The COTHROM visualisation dropped an unused `energy` value that was
  recomputed ten times a second and never displayed.
- A `prefers-reduced-motion` block collapses the CSS motion while forcing the
  reveal and hero elements to their visible end state. It does not stop the
  canvas animations — those would need a JavaScript guard if that is wanted.
- Team member names and bios are written into the modal with `textContent`
  rather than interpolated into an HTML string.

Typography is still the design system's Arial stack. `Font Specimens.html` in
the Claude Design project holds ten alternatives that were prepared but never
chosen; switching is a one-line change to `--font-sans` in
`css/tokens/typography.css` plus self-hosting the woff2 files.
