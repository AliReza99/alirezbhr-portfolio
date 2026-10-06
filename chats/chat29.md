# Experience cards rework

_Started 2026-10-05 19:32 UTC_

---

## User

rework the experience cards, there's lots of empty space here, and make them collapsible

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I reworked the experience cards in a new file, **Portfolio v13**. v12 is unchanged.

- **Less empty space:** the title, company and description now sit together in one header row, and the bullet points span the full card width below it. Wide screens show the bullets in two columns, and narrow screens stack them in one.
- **Collapsible:** click anywhere on a card's header to open or close it. A +/– button on the right shows the state, and opening and closing animate. The first card starts open and the other two start closed.

## User

don't put two column for bullets, only one

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The bullets in all three experience cards are now one column in Portfolio v13. The page loads without errors.

## User

instead of + - icon change it to something that we know it's collapsible

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I swapped the +/− icon on all three experience cards for a chevron that points down when a card is closed and flips up when it's open. It sits in the same small bordered box.

## User

I'm also not the fan of the whole white text on black background that you used for the company name, try to redesign the experience card again

## Assistant

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I redesigned the experience card headers in Portfolio v13. A background check is still running.

- **Company name:** the white-on-black block is gone. The company now appears as small purple uppercase text above the job title.
- **Collapse control:** the +/– box is replaced by a small button that says "Expand" or "Collapse", with an arrow that flips when the card opens. On narrow screens it moves below the title.

You undid my earlier arrow-only icon, so I put the arrow next to the label this time. Tell me if you'd rather have the label alone.

## User

it's better, but change the expand collapse button again

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I replaced the expand/collapse button on all three experience cards with a handwritten "show more" / "show less" label in purple, using the same script font as your section notes. It has a hand-drawn arrow that flips when the card opens and no box around it. The page loads without errors.

## User

no it don't fit the rest of the ui

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The toggle on each experience card is now a "Show more" / "Show less" button in the same style as the page's other buttons, like Read more and Copy. It has the same border, striped offset shadow and hover effects, and the arrow points down when the card is closed and flips up when it opens. A background check is still running.

## User

the + - was better IMO

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The +/– toggle box is back on all three experience cards. The new header, with the company name in small purple text above the title, stays as it was. The page loads without errors.

## User

but make them animated with rough.js

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The +/– on each experience card is now drawn with rough.js. Its strokes jitter while you hover over the card header, the same way your arrows do. When the card opens, the vertical stroke rotates down to turn the + into a –. A background check is still running.

## User

remove the hover purple background effect

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I removed the purple hover background from the +/– toggle on all three experience cards. The page loads without errors.

