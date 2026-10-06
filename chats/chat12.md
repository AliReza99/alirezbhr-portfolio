# V8 with hand-drawn motions

_Started 2026-10-05 12:38 UTC_

---

## User

take this v8 version as reference, add a little bit of motions and hand drawn things (either by hovering on items or something else, using rough.js, to get some imperfections)

## Assistant

_[tool: read_file]_

_[tool: list_files]_

_[tool: grep]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I saved the new version as `Portfolio v9.dc.html` and left v8 as it was. I haven't looked at it myself; the automatic check is still running and will flag any problems.

**Hand-drawn (rough.js)**
- **Hover sketches:** Cards, buttons, stat tiles and project tiles get a coral outline that draws itself on hover. Skill chips get a circled ellipse, and nav links get an underline. The wobble is different on every hover.
- **Scroll-in drawings:** The hero name "Alireza" gets a thick scribbled underline. "working together?" gets a hand-drawn circle. The section rules are redrawn as wobbly lines. The contact arrow draws itself.

**Motion**
- **Hero:** The hero text and stat tiles fade in one after another.
- **Scroll reveals:** Sections and cards slide up as they scroll into view, and the handwritten labels tilt in.
- **Highlights and ticks:** The highlighter marks sweep across, and the bullet ticks pop in.
- **Reduced motion:** Reduced-motion settings turn all of this off.

I added two tweaks, `accent` (the sketch colour, default coral) and `roughness` (how wobbly the lines are). Your earlier accent and shadow values were set on a v9 file that didn't exist, so they weren't carried over. I left out a shadow tweak.

## User

change the draw color of navbar links to primary purple that we have

## Assistant

_[tool: str_replace_edit]_

Navbar link underlines now draw in the primary purple `#A99BFF` (the logo and résumé button colour), at 4px so they show on the cream background. They no longer follow the `accent` tweak.

