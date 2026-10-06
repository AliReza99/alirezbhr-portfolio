# Read more button repositioning

_Started 2026-10-05 19:16 UTC_

---

## User

change the Read more button of selected work to be under the stack of that cards

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: ready_for_verification]_

On both Selected Work cards, "Read more" now sits under the tech stack line instead of next to the title.

## User

and the arrow should be right arrow

## Assistant

_[tool: grep]_

`data-rarrow="e"` gives the right-pointing arrow.

_[tool: run_script]_

_[tool: ready_for_verification]_

The arrow on both "Read more" links now points right instead of diagonally.

## User

actually use normal button for it so the user know it's clickable

## Assistant

_[tool: read_file]_

_[tool: run_script]_

_[tool: ready_for_verification]_

"Read more" on both cards is now a real button, styled like the Résumé button but smaller: an outlined box with a hatched offset shadow and a right arrow. The whole card is still the link, so the button is styled to match but isn't a separate link.

## User

without shadow

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I removed the shadow from both "Read more" buttons. They're now plain outlined boxes with the right arrow.

