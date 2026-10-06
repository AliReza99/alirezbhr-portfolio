# Portfolio skills section ideas

_Started 2026-10-06 08:25 UTC_

---

## User

as you know this portfolio is full of easter eggs, I need some ideas about skills section, think about it and tell me you ideas

## Assistant

_[tool: grep]_

_[tool: read_file]_

The theme I'd suggest: **each skill acts out what it does when you play with it.** That matches the rest of the site, where things reward you for poking at them.

**Skills that act out what they do**
1. **JSCodeShift: run a codemod on the card.** Click it and every skill in the card rewrites itself into handwriting in a fast cascade. A margin note then says *"23 files migrated in 0.4s"*. This ties back to your "weeks to seconds" line in Experience, and it can reuse the type-to-handwriting effect from the project cards.
2. **Vitest / Playwright: run the test suite.** Click either one and a sketchy tick appears beside each row, one after another. One row fails on purpose: *"Real-time & 3D — flaky, retrying…"* and then it passes.
3. **MUI: get replaced.** Hovering scribbles it out and writes *"TailwindCSS, 12x faster"* above it. That's a real story from your resume.
4. **Three.js: the card goes 3D.** While you hover it, the whole Skills card tilts toward your cursor, with its hand-drawn shadow moving as it tilts.
5. **Kubernetes: scale up.** Each click stacks one more copy of the card behind the real one (*"replicas: 3"*). The fifth click shows a toast: *"Cluster's full. Please stop."*
6. **Turborepo: cache hit.** The first click does a slow build-style shimmer across the card. Every click after that is instant, with a note: *"cached, 0ms"*.
7. **WebRTC: a peer connects.** A second cursor shows up and copies your mouse movements for a few seconds, then *"peer disconnected"*.

**Easter eggs for the card itself**
8. **Reroll the bullets.** Clicking a doodle bullet redraws it as a new random shape. After about 10 clicks, a toast says *"They're bullets. The skills are to the right."*
9. **Drag a skill into the wrong row.** Pick up "Playwright" and drop it under State & Data. It snaps back with a toast: *"Nice try. That's not how state works."*

**My picks:** 1, 2 and 4. They're the clearest, they use the hand-drawn style you already have, and 1 and 2 show off real skills instead of just being jokes. All three would work through your existing toast setup.

Which ones should I build?

## User

yes I'm more fan of the card easter itself

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I added both card easter eggs to a new file, **Portfolio v24**. It's still being checked in the background.

- **Reroll the bullets:** clicking a doodle bullet spins it and redraws it as a different shape. The 10th click shows a toast like *"They're just bullets."* I made the clickable area a bit bigger than the bullet so it's easier to hit.
- **Drag a skill into the wrong row:** each skill can be picked up as a little paper tag. Dropping it on a different row makes that row shake, the tag springs back, and a toast names both the skill and the row, e.g. *"Playwright under State & Data? That PR would never get approved."* Dropping it anywhere else just sends it back without a toast.

Dragging only works with a mouse. On a phone, starting a scroll on a skill word would pick it up and get in the way, so I left touch out.

## User

make the whole category and the icon clickable to roll it

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Clicking anywhere on a category label (the name or its doodle icon) now rerolls that row's bullet. When you hover the label, the name turns purple and the icon tilts slightly, so it reads as clickable.

## User

it should let us re-order the skills in the same category though

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

You can now drag a skill to a new spot within its own category. As you drag, the other skills slide over with a small bounce, and dropping the tag leaves it in the new position. Dragging into a different category still gets rejected with the toast. A background check is still running.

The new order doesn't persist: refreshing the page puts the skills back in their original order.

