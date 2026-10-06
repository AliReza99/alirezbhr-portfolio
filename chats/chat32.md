# Experience highlights animation

_Started 2026-10-05 19:52 UTC_

---

## User

add animation on highlights of experience, and make the color even more subtle

## User

increase height of the highlighter

## User

increase height of the highlighter

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I made the highlighter taller. It now covers the full height of the words, with a little extra space above and below.

## User

a bit darker

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I darkened the highlight a little, from opacity .10 to .14.

## User

speed up the animation

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The highlight animation is faster now. Each highlight draws in 0.45s instead of 0.8s, and they start 70ms apart instead of 120ms.

## User

replay the animation when we collapse/largen it

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The highlights now reset when you collapse a role and play again from the start each time you expand it.

## User

add stagger a little bit

## Assistant

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

The highlights now start 110ms apart instead of 70ms, so the stagger is easier to see.

## User

faster stagger, a bit slower animation

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The highlights now start 50ms apart instead of 110ms, and each one draws in over 0.6s instead of 0.45s.

## User

use this v13 as reference, I want the marker to mark first line and then try to do random marking like trying to fix it on the right of the card and then continue to highlight the rest of the lines

## Assistant

_[tool: copy_files]_

_[tool: read_file]_

_[tool: show_html]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I made Portfolio v14 from v13 with the new marker sequence; v13 is unchanged. When a role opens:

1. **First highlight:** it goes on streaky, like a marker that's drying out.
2. **Test scribble:** four marks get drawn just below the first bullet, on the right of the card. They're a short dab, a zigzag, a loop and a final swipe, each a bit darker than the last, as if the marker is coming back to life. The shape changes a little every time.
3. **The rest:** the remaining highlights then go on solid, 50ms apart.

The scribble stays on the card and sits behind the text. It resets along with the highlights when you collapse the role. The first highlight stays streaky after the animation ends.

## User

more scribble

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The scribble now has eight strokes instead of four and covers a larger area (130×78px instead of 96×58px). The strokes still get darker as they go. Because the scribble takes longer, the remaining highlights now start about 1.3s later.

## User

it was cool, but remove the whole idea

## Assistant

_[tool: delete_file]_

_[tool: ready_for_verification]_

I removed the marker idea by deleting v14 and reopened v13. v13 still has the plain staggered highlights, 50ms apart and 0.6s each.

