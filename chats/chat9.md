# Hover buttons exit screen effect

_Started 2026-10-05 12:15 UTC_

---

## User

the buttons at the end of the page like linkedin and github and resume, change them so when we hover they appear out of the screen, like reverse of what we have with primary buttons but in reverse

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: run_script]_

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I changed the LinkedIn, GitHub and Résumé buttons in Portfolio v8. They now sit flat until you hover. On hover the button lifts up and to the left and turns purple. The same striped shadow your primary buttons use shows up behind it. That's the reverse of the primary buttons, which press down on hover. Clicking drops the button back to flat.

## User

it's not working properly it's getting drawn for a split second on top of the texts of that

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I think I found the flicker and changed it, but I haven't watched the hover myself, so please check it. On hover, the striped shadow faded in at the same time the purple faded in. For that split second the shadow showed through the text. Now the purple and the shadow switch on instantly, and only the lift still animates.

## User

its ok now but when we hover off of it the stip behind it desappear immediately

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I changed the hover-off, but I haven't watched it myself, so please check it. When you move the mouse away, the button now slides back down first. The stripes and the purple stay until it lands, then disappear. Hovering on still shows them instantly, so the earlier flicker fix stays in place.

## User

remove the background color of that so it won't get purple when we hover

## Assistant

_[tool: grep]_

The button faces need a solid fill or the stripes show through, so I'll use the page background color (#FBF6EF) instead of purple.

_[tool: run_script]_

_[tool: ready_for_verification]_

The three buttons no longer turn purple on hover. They use the page's background color, so they look the same as at rest, just lifted with the striped shadow behind. They can't be fully see-through, or the stripes would show through the text.

