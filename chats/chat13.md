# Hand-drawn animated arrows

_Started 2026-10-05 12:44 UTC_

---

## User

change the arrows shown in buttons to be hand dawn and have animation when hovered using rough.js

## Assistant

_[tool: grep]_

Let me see the full button lines.

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

Cards are wrapped in `<a>`, so the whole card triggers the hover.

_[tool: ready_for_verification]_

I replaced all 8 button and card arrows (↗/→) with hand-drawn ones made with rough.js. They follow the text colour.

On hover, the arrow redraws itself stroke by stroke (line first, then the head) and nudges toward where it points. While you keep hovering, the lines keep shifting slightly, like an animated sketch. When you move away, it settles back.

For the two "Read more" cards, hovering anywhere on the card starts the animation, not just the arrow.

## User

before hover it should be normal arrow and when hovered it's sketchy like how we're transitioning between the font of that button

## Assistant

_[tool: grep]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Arrows now look like normal, clean arrows until you hover. On hover, the clean one wipes away and a sketchy rough.js arrow wipes in, using the same timing and easing as the button text's switch to the handwritten font. The sketchy arrow also tilts slightly, like the text does, and its lines keep shifting while you hover.

## User

but don't change it for the footer buttons

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The three footer buttons (LinkedIn, GitHub, Résumé) have their original ↗ arrows back, with no hover effect. All other buttons still switch to the sketchy arrow on hover.

