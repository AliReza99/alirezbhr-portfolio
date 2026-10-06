# Hover sketch and doodle animation

_Started 2026-10-06 08:07 UTC_

---

## User

when we're hovering over selected works, I want the image of it to be changed to sketch image which I will send you 
and I want the card to be like hand-drawn doodle style with a little bit of animation which I also included in the images to get inspired by

## User

when we're hovering over selected works, I want the image of it to be changed to sketch image which I will send you 
and I want the card to be like hand-drawn doodle style with a little bit of animation which I also included in the images to get inspired by

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: image_metadata]_

_[tool: copy_files]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I saved the hover effect as **Portfolio v23** so v22 is left as it was. When you hover over a Selected Work card:
- **Image:** the Notewise screenshot fades into your sketch, and the sketch lines wobble a little, like a hand-drawn animation.
- **Border:** the straight border and the line under the image turn into hand-drawn ones that flicker between three shapes.
- **Text:** the title, description, tech list and "Read more" wipe from left to right into a handwriting font (Patrick Hand).
- **Card:** it tilts slightly, and a hatched shadow slides out under the "Read more" button.

The frontend platform card gets the same hand-drawn treatment but still shows its screenshot, because I only have the Notewise sketch. Send me that card's sketch and I'll add it. People who have turned off animations in their system settings get the sketch and borders without the movement.

## User

also make the shadow animated

## Assistant

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

When you hover a card, its hatched shadow now springs out from 5px to 10px deep and its edges wobble like the hand-drawn border. For people who've turned off animations in their system settings, the shadow still deepens on hover but doesn't spring or wobble.

## User

Found issues — fixing…

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

The shadow change broke the hand-drawn popups in the About section: their staggered drawing animation stopped playing. I've fixed that. The card shadow now uses its own setting, so the popups animate again, and the shadow still springs deeper and wobbles on hover. A final check is still running.

## User

don't rotate the card on hover

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

The cards no longer tilt on hover. Everything else on hover stays the same.

## User

here's the image for the second card that I didn't provided to you, use this image for the hand drawn mode of Scaling a frontend platform

## User

here's the image for the second card that I didn't provided to you, use this image for the hand drawn mode of Scaling a frontend platform

## User

increase animation speed of texts switching to new font

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

The text now switches to the handwriting font about twice as fast: each wipe takes 0.22s instead of 0.45s. I also halved the delays between the title, description, tags and button, so they still play in the same order.

## User

use another font family for that, maybe something that looks more hand drawn

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

On hover, the cards' text now switches to Gochi Hand instead of Patrick Hand. It looks more like quick marker handwriting. If you want something messier, Gaegu and Architects Daughter are other options.

## User

no it's too much, switch to something else

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I switched the hover text to Kalam. It still looks handwritten, but it's lighter and neater than Gochi Hand, more like pen than marker.

