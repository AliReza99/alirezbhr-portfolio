# Hand-drawn neo brutalism blend

_Started 2026-10-05 11:35 UTC_

---

## User

take the current v7 as reference, but I want to add a touch of hand drawing style for some fonts or even cards or anything else to appear, it should be balance between neo brutalism and elegant hand drawing, be creative

## Assistant

_[tool: read_file]_

_[tool: run_script]_

_[tool: dc_set_props]_

_[tool: show_html]_

_[tool: ready_for_verification]_

I made **Portfolio v9** from v7. The neo-brutalist layout is unchanged. The hand-drawn parts sit on top of it:

- **Hero:** a pen loop circles "Alireza" with a "← that's me" note beside it, and "fast, scalable" gets a double scribble underline.
- **Card shadows:** the hatched offset shadows are slightly wobbly, like they were sketched in pencil. The front faces of the cards stay crisp.
- **Section headers:** the straight rules are now pen lines, and the number chips are tilted a little.
- **Experience:** bullets are small pen strokes, the key metrics get a marker highlight that fills in as you scroll to them, and the company tags are tilted like stickers.
- **Work and Education:** strips of torn tape hold the cards in place.
- **Skills:** the group labels are handwritten, like notes in the margin.
- **Contact:** "working together?" is underlined by hand, with a "← fastest way to reach me" note pointing at the email.

The pen strokes draw themselves in when they scroll into view. The Tweaks panel lets you change the pen colour, set how wobbly the shadows are (0 makes them straight), and turn the handwritten notes on or off.

The two notes ("that's me" and "fastest way to reach me") are new wording I added, so change or remove them as you like.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I fixed the hand-drawn strokes in v9: they weren't appearing because the animation trigger never fired.

- The pen lines and highlights are now visible by default. They're only hidden while waiting to draw in, and only when animation can actually run.
- The page now checks for strokes every half second and draws each one as it scrolls into view.
- As a backup, anything already on screen after 1.5 seconds is drawn straight away.

A fresh check of the page is running in the background.

