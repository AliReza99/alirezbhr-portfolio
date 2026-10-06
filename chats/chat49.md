# Easter egg scroll mechanic

_Started 2026-10-06 10:07 UTC_

---

## User

about the easter egg that we can scroll even more than the page to get to the basement, I want to change it, I don't want the text "nothing down here.really" to be there, instead when we're on bottom of the page the page actually should go a little bit more and show something or text, and then if we tried we should be able to go there 
whats your idea?

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

Here's how it works right now: the page ends, the "nothing down here. really." note sits under the footer, and if you keep scrolling past the end, the STAFF ONLY hatch slides up out of nowhere. Your change would put a short, real bit of floor below the footer so people find it just by scrolling, then pushing further opens the basement.

Some options for what that floor strip could show:

1. **Ajar hatch (my pick).** A dark floor strip with the STAFF ONLY hatch already open a crack. Warm light leaks out of the gap. When you push, the lid lifts open with the swing animation you already have, and you drop in. It teases the basement without a single word.
2. **Ladder poking up.** The top two rungs of the basement ladder stick up through a hole in the floor. Pushing slides you down them. It ties straight into the ladder that's already down there.
3. **Cat's tail.** A floorboard gap with the cat's tail hanging out, swishing now and then. Pushing follows her down. It's the cutest option, but it gives her away before you meet her.
4. **Pull cord.** A light-switch cord hangs from the floor edge. Scrolling stretches it, and past a certain point it clicks, the basement light comes on and you go down. It's the most physical one, but it doesn't fit the floor/hatch idea as well.

For any of them, the strip would be about 120–160px of normal page, so people actually see it. Short tilted Caveat note optional (e.g. "staff only"), or no text at all.

Which one should I build? I'd save it as v27.

## User

and I want the current "Staff only, keep going" to be there, I want to change them 
lets create v27 and do the Ajar hatch

## Assistant

_[tool: copy_files]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I've made v27. The page now ends in a short dark floor strip with the STAFF ONLY hatch left slightly open and warm light spilling out underneath.

- **Removed:** the "nothing down here. really." note and the "keep going…" text. The hatch used to slide up from offscreen; now it's always there at the bottom of the page.
- **Pushing past the end:** the lid lifts gradually and the light gets brighter. Push far enough and the lid flips open and you drop into the basement.
- **In the basement:** the hatch stays open above it. Going back up resets it to slightly open.

I kept the STAFF ONLY label on the lid. If you meant to change that text too, tell me what it should say.

## User

no I don't like it, actually I like the ladder poking up one

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I've replaced the hatch in v27 with the ladder. Its top rungs now stick up through a gap in the floor at the bottom of the page, with warm light coming from below. It sits at the same spot as the basement ladder, so the drop lines up.

When you keep scrolling past the end, the ladder slowly rises and wobbles a little while the light gets brighter. Push far enough and it pops up once, then you drop into the basement.

## User

ok at first we should not go scroll to the end of the page, just show a little bit of it and then we can scroll more and more

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I've changed v27 so a normal scroll stops early and you only see a small peek: the ladder tips and the edge of the floor, about 96px. Scrolling further pulls more of the dark floor and lit gap into view a bit at a time, with some resistance. If you let go early, it eases back to the peek. Push far enough and you drop into the basement.

This works the same with the mouse wheel, touch and the arrow/PageDown/End keys.

## User

revert it, try again, it didn't work properly this time

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I've undone the last change and rebuilt the reveal in v27 using the push-past-the-end method from v26, which already worked.

- **At the bottom:** the page ends on a short peek, about 96px. You see the ladder tips poking up and a sliver of the dark gap.
- **Pushing further:** the page lifts and the rest of the dark floor slides up from below, lined up with the peek. The ladder rises a bit and the light gets brighter.
- **Letting go:** it eases back to the peek.
- **Push far enough:** you drop into the basement.

## User

make it easier to go to the basement, right now it's too much force

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Getting into the basement now takes a bit over half the scrolling it did before. Each scroll counts for more, the dark floor slides up sooner, and it waits a little longer before easing back if you pause.

## User

it should be if we try for the third time, we should go there

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

At the bottom of the page, the third try now takes you into the basement. A try is one scroll flick (a short pause starts a new one), one swipe on touch, or one key press.

- **First try:** the floor slides up a third of the way and stays there.
- **Second try:** it slides up two thirds.
- **Third try:** you drop into the basement.

If you stop for about 2.5 seconds, it eases back to the peek and the count starts over.

## User

the ceiling have some offsetting problem, fix it

## User

the ceiling have some offsetting problem, fix it

## User

there's still this ladder step which is wrong or something, I guess there's this about 10px something is making this issue

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

That stray line was the bottom edge of the basement ladder's top cap. The sketchy line style wobbles a few pixels, so it still poked out below the ceiling. I moved the cap up another 6px (18px above the edge now), so it should be fully hidden. I haven't looked at it myself yet, so tell me if any of the line still shows.

## User

no revert it to 2 previous versions, there's this fully black line which have to be removed to fix it

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I put the basement ceiling and the ladder top back the way they were two versions ago. The one change: I took out the ceiling's solid black 12px band, so only the strip's floor shows above the basement.

The thin white sketched ceiling line is still there. Tell me if that needs to go too.

## User

remove the top of the ladder mesh something one

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I removed the cross-hatched piece at the top of the basement ladder. Now only the rails and rungs are drawn, so it runs straight on from the ladder in the floor gap above.

## User

this part is on the way of the ladder, remove it

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

I removed the basement's ceiling line, which was the part crossing the ladder. The basement now starts right under the floor strip.

## User

remove the ladder interance black line

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I removed the black floor slab on both sides of the ladder opening. The page now goes straight from the cream floor into the dark basement, with the light glowing around the ladder.

## User

it's on top of the ladder when we're in the full basement

## Assistant

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: run_script]_

_[tool: ready_for_verification]_

The thing sitting on top of the ladder was a thin 12px dark band at the bottom of the floor strip, plus a glow blob at the top of the basement ladder. I removed both, so the basement now starts right under the cream page and the ladder runs straight down with no seam.

To make that work:
- **Peek:** just the dark ladder tips poking up from the bottom edge of the page.
- **Push:** the dark floor slides up from below as before, with the ladder lined up.
- **Basement ladder:** the rails now start at the very top instead of 12px down.

The page didn't finish loading on my side, so I haven't confirmed the result visually yet.

## User

it's perfect now, however the cat is now displaced

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

_[tool: run_script]_

_[tool: update_todos]_

_[tool: ready_for_verification]_

I moved the sleeping cat down into the new floor strip, so it's back on the floor right beside the ladder tips and still opens its note when clicked. The cat was attached to the old page bottom, which is why it floated up when the strip was added. I haven't seen the result myself yet, so tell me if it's still off.

You've used 90% of your usage quota, so this is a good place to pause.

## User

when we entered the basement, the one step of the ladder is missing, you have to add that back, it's not missing when we haven't entered there yet

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I put the missing step back on the basement ladder. Its steps now start just under the floor, at the same spots as the ladder you see before entering, so nothing should jump or vanish when you go down. I haven't checked it on screen, so tell me if a step is still off.

