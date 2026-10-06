# Handwritten text selectability

_Started 2026-10-05 20:02 UTC_

---

## User

the handwritten texts should not be user selectable

## Assistant

_[tool: grep]_

Simplest: add a helmet CSS rule targeting Caveat spans would require attribute matching; instead replace inline style occurrences.

_[tool: run_script]_

_[tool: ready_for_verification]_

The handwritten text can't be selected anymore. That covers all 10 places it appears: the hero greeting, the section tags, the "fastest way to reach me" note, and the handwritten word that shows on link hover.

## User

this card is stealing so much attention

## User

put it in a card tho

## User

put it in a card tho

## Assistant

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

The Education entry is back in a card, but a quieter one than before: a thin, faint border on the cream background, with no shadow or striped side panel. The heading stays at the smaller size.

## User

no use the original card but rework on the text hirarchy and font sizing of it

## Assistant

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

The original card is back with its offset shadow and striped side panel. Inside it:
- "Shiraz University" is now the heading, at 21px instead of 44px.
- The degree sits below it as 15px body text instead of the uppercase mono label above.

I wrote the degree as "B.Sc. Computer Engineering", but I added the "B.Sc." myself. Let me know if that's wrong and I'll fix it.

## User

rework on this part to make it more readable, you can change the texts if you want

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

I reworked the contact section so it reads more easily:
- **Headline:** cut to "Interested in working together?" and made it smaller, with wider letter spacing and no forced line breaks.
- **New line below it:** "Send me an email about a role, a project, or just to say hello. I'll get back to you soon."
- **New label:** "Or find me on" now sits above the LinkedIn, GitHub and Résumé links.

The email address, copy button and handwritten note are unchanged.

## User

it's better but it's still a bit hard to read because GET IN TOUCH and the interested in working together both are having high contrast, you're free to change this section anyway you want

## Assistant

_[tool: read_file]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

I removed the "Interested in working together?" heading, so "GET IN TOUCH" is the only heading in the section. That line now opens a short paragraph in regular body text, which leaves the bold email address as the main thing to look at.

