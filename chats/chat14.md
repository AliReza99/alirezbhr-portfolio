# Motion designed page elements

_Started 2026-10-05 12:51 UTC_

---

## User

make the whole page like a motion designed elements

## Assistant

_[tool: read_file]_

_[tool: run_script]_

_[tool: dc_set_props]_

_[tool: ready_for_verification]_

I added motion across the whole page in **Portfolio v9**. v8 is unchanged. It's out for review now.

**When the page loads**
- The header slides down from the top.
- The words of the main headline rise in one after another.
- The four stat cards drop in like stamps, and their numbers count up.

**As you scroll**
- Cards drop in and their offset shadows slide out from underneath.
- Section titles slide up into view, and the handwritten notes next to them appear left to right, as if being written.
- The squiggly lines after each title draw across.
- List items rise in one at a time. Their small hand-drawn circles spin in, and the purple highlights sweep across the key phrases.
- Skill tags pop in.
- Project images are revealed from top to bottom while zooming out slightly.
- The arrow next to "fastest way to reach me" draws itself.

**Always moving**
- The handwritten notes jitter slightly, like hand-drawn animation.
- The logo square turns 90° every few seconds.
- The contact arrow nudges toward the email address.
- A purple bar along the bottom of the header fills as you scroll down the page.

There are two Tweaks: one sets motion to Full, Subtle or Off, and one turns the scroll bar on or off. The page shows no animation for visitors whose device is set to reduce motion.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

I fixed the bug where the "Hi, I'm Alireza" headline never appeared. The page now checks whether the box holding the words is on screen, instead of the hidden words themselves, so they rise in on load as intended. Project images had the same risk and now use the same check. It's back out for review.

