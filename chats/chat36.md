# Background noise and grain

_Started 2026-10-06 05:25 UTC_

---

## User

add a subtle noise/film-grain effect on the background of the page

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

I swapped the old grain for a new one that sits on the page background only, so the cards and text stay clean. It's an animated, ink-toned grain at 50% opacity, and it stops moving for visitors who have reduced motion turned on. I haven't checked the final look myself yet; a review is still running. If it's too strong or too faint, I'll change the opacity.

## User

it should be animating like the old TV noise

## Assistant

_[tool: grep]_

I'll replace the CSS layer with a canvas that redraws random static every frame.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

The background now has TV-style static: random black-and-white noise redrawn 24 times a second, sitting behind the content at 16% opacity. Visitors with reduced motion turned on see a still frame. If it's too strong or too faint, the opacity can go up or down.

## User

it should be very subtle

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

I turned the static down from 16% to 5% opacity, so it's now very faint.

## User

a bit more

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

I raised the static to 8% opacity.

## User

no I meant a bit more subtle

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

I misread that, sorry. I've now dropped the static to 3.5% opacity, below the earlier 5%.

## User

reduce the speed of it

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

The static now redraws 10 times a second instead of 24.

## User

is this effect performant ?

## Assistant

Yes, it's light.

- **Setup:** the 8 noise tiles (160×160 each) are generated once when the page loads.
- **Each update:** one pattern fill on a half-resolution canvas, about 960×540 on a 1080p screen. That's a single GPU-accelerated draw, 10 times a second.
- **Background tabs:** the browser pauses the animation when the tab isn't visible.
- **Layout and scrolling:** the canvas is fixed behind the content and ignores clicks, so it doesn't affect layout or scrolling.

The one small waste is that the loop still wakes up 60 times a second just to skip frames. Switching it to a 10fps timer would remove that. On low-end phones a constantly redrawing full-screen layer uses a bit of battery. If that matters, the noise could become a CSS background that jumps between positions, which the browser handles with almost no work. Want me to make either change?

