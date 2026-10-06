# V8 redesign with neo-brutalism

_Started 2026-10-05 12:25 UTC_

---

## User

take the v8 version as a reference and think about it and redesign again, it should be a balance between neo brutalism and hand drawn things with animations and interactive elements

## Assistant

_[tool: read_file]_

_[tool: list_files]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

I rebuilt the portfolio as `Portfolio v9.dc.html`, keeping v8 untouched. I haven't looked at it myself yet, and a background check is still running. I'll only hear back if it finds a problem.

**Style:** Thick ink outlines and hard offset shadows give the neo-brutalist side. Wobbly pen-drawn borders, tape, Caveat notes and drawn-on scribbles give the hand-drawn side. When you hover a card, its outline redraws with a pencil-like jitter.

**Interactive:**
- **Hero stickers:** The four stats are draggable stickers that tilt as you move them and settle back with a bounce.
- **Experience:** Pick a role on the left and the bullets and checkmarks redraw on the right.
- **Skills:** Filter chips highlight one skill category and dim the rest.
- **Page-wide:** A scrolling marquee strip, nav highlighting for the section you're in, and reveal-on-scroll animations. The underline and circle scribbles draw themselves. The morphing hover buttons and the copy-email button carry over from v8.

**Tweaks:** Accent color, shadow depth, and an animations on/off switch.

I added a few things that weren't in v8: section numbers, handwritten notes ("frontend engineer", "go on, drag them around"), colored marker highlights in the About paragraph, and the marquee itself.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

_[tool: get_webview_logs]_

_[tool: eval_js]_

I fixed the wrapping problems the check found at narrow widths: the header logo, the "frontend engineer" tag, the GitHub and LinkedIn links, and the hero buttons now stay on one line. The page renders correctly. One empty console error appeared on reload and I couldn't trace it. I did not re-run the full check after this fix.

