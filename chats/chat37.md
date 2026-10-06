# Mobile version for v13

_Started 2026-10-06 05:30 UTC_

---

## User

create mobile version of the whole page, based on v13

## Assistant

_[tool: read_file]_

_[tool: run_script]_

_[tool: dc_set_props]_

_[tool: show_html]_

_[tool: ready_for_verification]_

I made **Portfolio v13 Mobile.dc.html**, a copy of v13 set up for a 390px-wide phone screen and capped at 430px wide. It's being checked in the background now.

What changed from v13:
- **Hero:** the two buttons stack and run the full width, and they're taller so they're easier to tap.
- **Experience:** the cards have tighter padding and smaller titles, and the +/− toggle stays on the same line as the title.
- **Selected work:** the cards sit in one column, and the "Read more" buttons are taller.
- **Skills:** each category name sits above its list instead of beside it.
- **Contact:** the Copy button is bigger, and LinkedIn, GitHub and Resume sit in an even three-button row.
- **Sizing:** font sizes and spacing are fixed numbers now, so the page looks the same however wide the preview window is.

On a phone, the hover effects (the handwritten label swap and the arrow wiggle) only show briefly when you tap.

