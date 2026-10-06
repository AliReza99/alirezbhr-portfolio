# Hand drawn text toggle interaction

_Started 2026-10-05 12:57 UTC_

---

## User

instead of always showing the hand drawn text like "The short version" and the hand drawn line next to it, I want it to switch to show that hand drawn mode and the imperfect line by some hover of when we entered that section or any other idea that you have

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I updated the section headings in Portfolio v9. Each heading now starts in a clean style: the subtitle (like "the short version") is small grey mono text, and the line next to it is straight. When you scroll a section to the middle of the screen, the subtitle wipes into the purple handwriting and the straight line pulls back while the wobbly line draws in. Only one section is in hand-drawn mode at a time, and hovering a heading switches it too.

I also added a new `sketchTrigger` tweak with three options: "Section in view" (the default), "Hover only" and "Always".

