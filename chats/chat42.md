# Experimental Neo Brutalism Shadows

_Started 2026-10-06 05:52 UTC_

---

## User

I want to experiment with new kind of shadows, lets try some innovative one that also feels the 3d with neo brutalism and black and white style in mind, 
go on implement it and I'll tell you if I like it or go for the next one

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: show_html]_

_[tool: ready_for_verification]_

I made the new shadow in **Portfolio v16**: an "extruded slab". The old flat offset shadow is now a 3D block. Each box shows a solid ink side face on the right and a hatched bottom face, joined by angled corner edges, like a block lit from the top-left.

- **Pressing:** on buttons and project cards, the front slides into the block and the sides get thinner as you push. Hovering presses part way; clicking presses it flat.
- **Social links:** they sit flat until you hover, then pop up out of the page as a block.
- **Crisp edges:** I turned off the wobbly hand-drawn effect on these shadows so the angled edges stay sharp. The rest of the hand-drawn look is unchanged.

v13 is untouched. Tell me if you like it or want the next idea.

## User

it's a bit too much make it less

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I toned down the 3D block shadow in v16:
- **Depth:** cards and boxes went from 8px to 5px, and buttons from 6px to 4px.
- **Movement:** hover and click now press about two-thirds as far.
- **Faces:** the solid right face is slightly lighter, and the hatched bottom face uses fainter, wider-spaced lines.

## User

increase the stips though

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

The stripes on the bottom face are now full ink and closer together (every 2.5px instead of 4px), so they read denser and darker.

## User

ok lets go for the next idea

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Next idea is in **Portfolio v17**: a halftone shadow that steps down like printed ink. It's built from three bands of dots offset 7px down and right from each box. The dots are dense and nearly solid next to the box, medium in the middle band, and sparse on the outside. The corners are stepped instead of angled.

Hover and click still press into the shadow as in v13, and the social links get the same shadow when they lift on hover. v16 is unchanged if you want to go back.

## User

no I don't like it, maybe for the next one try rough.js but it should be subtle don't overuse it

## User

I want to see some imperfections

## User

I want to see some imperfections

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The "2" means the shadow function got inserted twice — harmless, but I'll remove the duplicate.

_[tool: run_script]_

_[tool: ready_for_verification]_

I made the v18 shadows look more hand-drawn:
- **Outline:** roughly twice as wobbly, with edges that bow, and each edge drawn twice so the lines don't quite line up.
- **Hatching:** the angle varies a little from one shadow to the next, between −41° and −49°.

While doing this I found I had added the shadow code twice in the last round. I removed the extra copy; it hadn't changed how the page looks.

_[tool: run_script]_

_[tool: ready_for_verification]_

I toned the imperfections in v18 down to a slight wobble:
- **Wobble:** the shadow outline is a bit rougher than the original v18, but less than half as rough as the last round.
- **Edges:** each edge is a single line again, and the corners stay in place.
- **Hatching:** the angle varies only slightly now, between −43° and −47°.

## User

reduce the shadow , and change the style of it a little bit

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I updated the v18 shadow:
- **Smaller:** the offset is now 4px instead of 5px.
- **Style:** the sketchy outline is gone, so the shadow is only hatch lines. The lines are steeper (about −62° to −66°), slightly heavier and closer together, so the shadow keeps its shape without the outline.

## User

next

## User

no I don't like it, next

## User

no I don't like it, next

## User

go for the boxy one but change it

## User

go for the boxy one but change it

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I made **Portfolio v21** from the boxy v16 and swapped how the two faces look. The bottom face is now solid ink, so it reads as the darker side, and the right face has fine horizontal stripes inside a thin ink rim.

Depth and press behaviour are the same as in v16, and v16 itself is unchanged.

## User

no try again , some imperfection, subtle

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

**Portfolio v22** is v16's boxy shadow with a slight hand-made wobble added only to the shadow. Edges and hatch lines waver by a couple of pixels, like a careful ink drawing, while the boxes and text stay crisp.

The faces are back to v16's look: solid right side and hatched bottom. If you want it more or less wobbly, that's one number to change.

## User

I like v22, keep the cards shadow, but for the buttons use the v13 shadow

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

In v22, the buttons now use the v13 shadow again: the two hero buttons, the Copy button and the three social links, with their v13 hover behaviour too. The other seven boxes keep the boxy shadow: the experience and project cards plus the Skills and Education boxes.

## User

but remove their pressed effect

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I removed the press effect from the two project cards in v22, so they stay put on hover and click. They were the only boxy-shadow cards that pressed. The buttons still press like v13; if you meant the buttons instead, I can take theirs off.

## User

the pressing effect still exist

## Assistant

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

The press was coming from the buttons, so I removed it there in v22. The two hero buttons and the Copy button no longer move on hover or click. The social links no longer sink back down when clicked, but they still rise and show their shadow on hover; I can remove that too if you want them completely still.

## User

remove this part

## Assistant

_[tool: read_file]_

The element is the dotted left strip in the Education card (first child of the inner grid).

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

I removed the dotted strip on the left of the Education card in v22. The card is now one plain panel, and everything else is unchanged.

## User

well you actually removed the hover effect the buttons too, I only said the pressed effect should be removed, the effect was it was changing the button placement even more

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Sorry about that. In v22 the hover effect is back on the two hero buttons and the Copy button, and they shift 3px when you hover. Clicking no longer pushes them any further.

