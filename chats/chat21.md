# Skills bullets with rough.js

_Started 2026-10-05 13:35 UTC_

---

## User

change the bullets of skills to something else hand drawn by rough.js with randomness

## Assistant

_[tool: update_todos]_

_[tool: grep]_

## Assistant

_[tool: list_files]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

Rough.js is already loaded. Let me check the logic class.

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: update_todos]_

_[tool: ready_for_verification]_

I replaced the 7 Skills bullets in Portfolio v11 with marks drawn by rough.js. On every page load, each bullet randomly gets one of seven shapes: a scribbled star, a cross-hatched circle, a hatched diamond, a checkmark, an asterisk, a spiral or an arrow. Its color (purple, coral or black), tilt and wobble are random too.

The bullets in the Experience section are unchanged. A check of the updated page is still running.

## User

remove the random arrow one, and all of them should be black

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

I removed the arrow and made all the Skills bullets black. Each bullet now randomly gets one of six shapes on each page load: a star, a circle, a diamond, a checkmark, an asterisk or a spiral.

## User

also remove the tick one

## Assistant

_[tool: dc_js_str_replace]_

I removed the checkmark. The Skills bullets now pick from five shapes: a star, a circle, a diamond, an asterisk or a spiral.

## User

improve the title of each category of it to match the color and weight of the icons beside it

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

All 7 Skills category titles are now black (#141311) like their bullets, and bolder. I set the weight to 500, the boldest Geist Mono weight the page loads. If you want them heavier, I can load a bolder weight of the font.

## User

the category and the items of it are not aligned, maybe you have to increase the font size of the title of them

## Assistant

_[tool: run_script]_

_[tool: show_html]_

_[tool: ready_for_verification]_

I increased the category titles from 11px to 13px and changed how they line up with the items. The rows were aligned on the text's baseline, but each title row starts with its icon, so the title was measured from the icon instead of its text.

Now each title is centered on the first line of its items, which also holds when a list like Tooling wraps to a second line. A check of the page is still running.

