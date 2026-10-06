# Handwritten text animation

_Started 2026-10-05 20:00 UTC_

---

## User

the handwritten texts should be animated like we're writing it

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: grep]_

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I animated all 9 handwritten Caveat notes in `Portfolio v13.dc.html` so they look like they're being written. A soft edge reveals each note left to right when it scrolls into view, and it only plays once.

- **Which notes:** the hero greeting, the six section tags, the Skills note with its little arrow, and "fastest way to reach me".
- **Speed:** longer notes take longer to write, at roughly 55 ms per character. The hero line starts slightly later than the others so it plays as the page loads.
- **Reduced motion:** if someone has reduced motion turned on in their system settings, the notes appear without the animation.

The large hand-drawn arrow next to "fastest way to reach me" stays still, because it sits outside the text that's animated. I can make it draw itself in the same way if you'd like.

