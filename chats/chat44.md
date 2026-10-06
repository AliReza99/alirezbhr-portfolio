# Experience expand animation

_Started 2026-10-06 06:24 UTC_

---

## User

lets try to add some animation for the experience expand/unexpand, try something and I'll tell you if I like it or we should go for the next idea

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

I added a staggered "ink-in" animation to the experience cards in v22:

- **Opening:** the card grows taller as before. Each bullet then slides down into place, one after another, with a slight bounce. Each bullet's dot pops in just after its line.
- **Closing:** all bullets fade out quickly together while the card shrinks back.
- **Plus/minus button:** it now springs a little when it turns.

Try opening and closing a card. If it's not right, my next idea is to have the cards unfold like a sheet of paper, or to draw the bullet lines in as if by hand.

## User

next one, and I mean something genuinly creative, for example I have this in mind that when we click on that card, the + button hit the bottom of the card so it expand and the button gets back to it's original place

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I replaced the stagger with your falling-button idea:

- **Opening:** the + button crouches, then drops to the bottom of the card. It squashes on impact and a few small ink lines spray out to each side. It then rides the bottom edge down as the card opens and springs back up to its place as a −.
- **Closing:** the − drops to the bottom of the open card and grabs the edge. It pulls the edge up until the card closes, then hops back up to its place as a +.

While an animation is running, clicks on that card are ignored. If the system's "reduce motion" setting is on, cards just open and close without the animation.

## User

only do it for expanding it,

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The falling-button animation now plays only when a card opens. Closing is back to a plain 0.3s shrink, and the − turns back into a + right away.

## User

lets also try to rotate the card when it hit the bottom of it, very subtle

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

When the button hits the bottom, the whole card now tilts slightly down on the right (0.7°) and wobbles back to straight over about 0.7s. It pivots from a point near its left edge, so the side the button hits dips the most.

## User

not shaking, very subtle

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The card no longer wobbles. When the button hits, it now tips 0.4° in a single quick motion, then eases back to straight over about half a second.

## User

I don't like it remove that rotate animation

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I removed the card tilt. Opening a card now plays the falling-button animation on its own, as it was before the tilt.

## User

I want that expanding animation to be different for each 3 of the experiences, come up with some idea for the rest of the 2,

## User

I want that expanding animation to be different for each 3 of the experiences, come up with some idea for the rest of the 2,

## User

add a easter egg so if the user played more than 3 times with the animations show a toast acknowledging it, it should be fun

## Assistant

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

After the 4th time a visitor opens a card, a toast now bounces up from the bottom of the screen.

- It looks like a taped-on paper note with a slight tilt, matching the rest of the page.
- The handwritten headline says "Okay, you found the toy box." The line below reads "4 opens and counting. I spent way too long on those little buttons, so thanks for playing with them." A small hint underneath says each card opens differently.
- It closes after 7 seconds or with the × button, and shows only once per visit.

The toast's text is my own, so feel free to rewrite it.

## User

the text should be shorter, and sarcastic

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The toast now reads "Wow. Riveting stuff." with "4 times. The resume is also in there, you know." underneath. I removed the hint line.

## User

try another text, it's not much understandable for non native speakers

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The toast now reads "Having fun?" with "You clicked it 4 times. The text inside is important too." underneath. Both use simple words, so they're easy for non-native speakers to follow.

## User

it turned out great, what other ideas do you have in mind which we can add ? list them and then we can decide to implement it or not

## Assistant

Here are some ideas that fit the hand-drawn paper style:

**Small touches**
1. **Copy email stamp:** clicking Copy stamps a tilted "COPIED" ink mark next to the button, which fades out.
2. **Highlighter on hover:** hovering a bold phrase in the bullets redraws its highlight, like a quick marker swipe.
3. **Scribble cursor trail:** on empty page space, the cursor leaves a faint pencil line that fades after a second.
4. **Tape peel:** hovering a taped item lifts a corner of the tape slightly.
5. **Section titles drawn in:** the wavy line next to each heading draws itself from left to right when it scrolls into view.

**Easter eggs**
6. **Doodle mode:** pressing D lets the visitor draw on the page with a pencil. Pressing Esc clears it.
7. **Konami code:** entering the classic up-up-down-down sequence knocks every card slightly crooked. A handwritten note says "Oops. Let me fix that." and the cards snap back.
8. **Shaking the cursor over a card:** the card's tape comes loose and the card drops a few pixels, as if it were falling off the page.
9. **Visiting at night:** after 10pm, a small handwritten note appears: "Working late too?"
10. **Footer note:** the page footer stays empty, and a tiny "nothing here" doodle appears only when someone scrolls all the way to the bottom.

**Bigger moments**
11. **Page intro:** on first load, the hero's outlines draw themselves in before the text fades up.
12. **Resume button:** clicking it slides a paper sheet up out of the button before the PDF opens.
13. **Project cards:** each card flips over on hover to show a handwritten note about the project on the back.

My picks would be 1, 5 and 6, since they're small, on-brand, and easy to stumble on. Tell me which numbers you want.

## User

do the 1st one

## Assistant

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Clicking Copy now slams a purple "COPIED" ink stamp down just to the right of the button. It has a double border and slightly rough edges, and lands at a slightly different tilt each time. It fades out after about 2 seconds. The button still switches to "Copied ✓" as before.

On narrow screens the stamp may overlap the icons next to the button. If you'd rather it sit on top of the button, tell me and I'll move it.

## User

Found issues — fixing…

## Assistant

Nothing to fix. The verifier's report was about the "COPIED" stamp, and you'd already undone that change, so the file is back to how it was before.

If you want the stamp back, I can put it partly over the Copy button itself. That keeps it clear of the "fastest way to reach me" note and its arrow.

## User

for the copy I'm thinking about each time we click it, an ink drop fills it until the whole box of it is filled with ink

## Assistant

_[tool: read_file]_

_[tool: run_script]_

_[tool: ready_for_verification]_

The Copy button now fills with ink as you click it:

- Each click drops a small ink drop from above the button. It lands on the ink surface with a tiny two-droplet splash, and the surface sloshes a little.
- The ink rises a fifth of the way per click, with a slight bounce, so the button is completely filled after 5 clicks. Any text under the ink turns cream so the label stays readable.
- Once full, it stays full for the rest of the visit, and further clicks still drop and splash. Every click still copies the email.

## User

I don't want the drops to come from above, make it like it's filling itself

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I removed the falling drop and the splash. Each click now makes the ink rise by itself from the bottom of the button, with a gentle slosh at the surface. It still takes 5 clicks to fill.

## User

and when it's filled (for example after x amount of clicks) don't return the copy back to it's original place, it should stay in the pressed state

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Once the ink fills the button (after 5 clicks), it now stays pressed down into its shadow, the same position as on hover, even after the mouse moves away.

## User

after 10 clicks show another toast say something sarcastic again something like: 
I swear it was copied with the first time

change the text to make it even more fun

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

On the 10th click of Copy, the same paper toast now pops up. It reads "Yes, it's copied." with "It worked on the first click. The other 9 were just for fun." underneath.

The experience-card toast still reads "Having fun?" as before. Each toast shows only once per visit.

## User

the toast close icon should not be rotated

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The close button's square is now upright, with a straight × drawn inside it.

## User

reduce the clicks amount to lie 5

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The copy toast now appears on the 5th click instead of the 10th. Its second line now reads "The other 4 were just for fun." That's the same click that fills the button with ink, so both happen at once.

## User

lets try: Scribble cursor trail: on empty page space, the cursor leaves a faint pencil line that fades after a second.

## Assistant

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Moving the mouse over empty page space now leaves a faint pencil line, a soft main stroke with a thin, slightly wobbly second stroke. The line fades out over 1 second.

- It stops over text, buttons, links, cards and the toast, and starts a new line when the cursor comes back to empty space.
- It sits behind all content and stays where it was drawn when the page scrolls.
- It's turned off on touch screens and when the system's "reduce motion" setting is on.

## User

ok only do it when we're holding the click button

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

_[tool: run_script]_

_[tool: ready_for_verification]_

You now draw by holding the mouse button down. A stroke has to start on empty page space, but once started it keeps going until you let go.

The lines stay for the rest of the visit and move with the page when it scrolls. They sit behind the cards and text, and nothing is saved, so reloading the page wipes them.

If you want visitors to be able to erase their drawing, I can add a way to clear it, such as pressing Esc.

## User

when they draw a little bit show a toast with text like
you made quite a mess on my portfolio 
change the text to make it even more funny

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Once a visitor has drawn about 1,500px of lines in total, the paper toast pops up shortly after they let go of the mouse. It reads "Hey, I just cleaned this!" with "Nice art though. I'll put it on the fridge." underneath. It shows once per visit, like the others.

## User

the text should be random, another one could be you made quite a mess on my portfolio 

do the text change and rotation for the other toasts too (5 texts for each easter egg)

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Each easter egg now picks one of 5 messages at random each time it shows. I took "rotation" to mean rotating through different texts. If you meant the toast's tilt, tell me.

**Experience cards**
- Having fun? / You clicked it 4 times. The text inside is important too.
- Okay, okay. / The button works. I promise. Now read the cards.
- Again? / These cards have words in them too, you know.
- Button lover? / 4 clicks. Maybe read what's inside this time.
- I see you. / You like the button more than my experience. Rude.

**Copy**
- Yes, it's copied. / It worked on the first click. The other 4 were just for fun.
- Still copied. / I swear it was copied the first time.
- Copied. Again. / Your clipboard is now 100% my email.
- We get it. / Now paste it somewhere and send me a message.
- That's enough ink. / You can stop now. My email is not going anywhere.

**Drawing**
- Hey, I just cleaned this! / Nice art though. I'll put it on the fridge.
- Wow, what a mess. / You made quite a mess on my portfolio.
- Picasso, is that you? / Please don't sign it. Recruiters will see this.
- This is not a notebook. / It's my portfolio. But okay, keep going.
- Beautiful. / I will frame it. Then I will refresh the page.

Each easter egg still shows its toast only once per visit, so a visitor sees one random message from each.

## User

make the pencil thicker

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The pencil line is thicker now: the main stroke went from 1.5px to 2.6px and the thin wobbly stroke from 0.8px to 1.3px. Both are also slightly darker.

## User

to make my about section be more interactive, I have some idea like:
making the "boring work" hoverable like showing underline under it so when the user hover over it shows a hand drawing of a bored face animation or something like that 
what's your idea ? think about it

## Assistant

_[tool: grep]_

_[tool: read_file]_

Here's what I'd do. Each phrase that has a doodle gets a dashed pencil underline, so visitors can tell it's hoverable. On hover, a small doodle draws itself in pencil above the words, in the same ink as the rest of the page. On touch screens, a tap shows it.

**Ideas per phrase**
1. **"boring work":** your bored face. Its eyelids droop, it yawns, and little "z z z" letters float up. It could end with a tiny gear spinning in, so it also hints at "automating myself out".
2. **"12x performance improvements":** a snail doodle gets speed lines and turns into a rocket, or the "12x" counts up quickly from 1x.
3. **"save weeks":** a small calendar whose pages tear off one after another.
4. **"super-application":** a tiny box that keeps growing until it barely fits its frame.
5. **"existentialist literature":** Sisyphus pushing a boulder up a hill, which then rolls back down. It's an inside joke for anyone who knows Camus.
6. **"running until my knees give up":** a stick figure jogs, its knees wobble, and it flops over.
7. **"getting lost in mountains (usually on purpose)":** mountain peaks with a dotted trail that loops around in a confused way, ending at a tiny "you are here" pin.

I'd pick 3 or 4 of these at most, so the paragraph stays readable. My picks would be 1, 5, 6 and 7, because they show personality. The work ones (2 to 4) already carry numbers.

The doodles would be simple hand-drawn line sketches I draw myself, not illustrations. Tell me which numbers you want.

## User

great, do it

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I added hover doodles to four phrases in the About paragraph. Each phrase now has a purple dashed underline and darker text. On hover, or a tap on phones, a small paper card pops up above it. The doodle draws itself in pencil, then loops:

- **"boring work":** a bored face that keeps yawning, with "z z z" floating up. Caption: "me, before automation".
- **"existentialist literature":** Sisyphus pushes a boulder up a slope, it rolls back down, and he walks back for it. Caption: "one must imagine him happy".
- **"running until my knees give up":** a stick figure jogs, wobbles, flops over, then gets back up. Caption: "km 3. knees: no."
- **"getting lost in mountains":** a dot wanders a loopy dotted trail over the peaks to an X. Caption: "you are here (probably)".

I wrote the captions myself, so change them if you like. A check is running now. Cards near the left or right edge of the screen may stick out past the edge on phones.

## User

try something else, the sketch can be less detailed with less animation but with more hand drawing effect

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I redrew the About doodles as simpler sketches, with more of a hand-drawn feel and less motion:

- **Simpler drawings:** a bored face with flat eyes and a crooked mouth, a figure pushing a boulder up a hill, a runner with wobbly knees, and peaks with a loopy dotted trail. The looping animations are gone; each sketch now only draws itself once in pencil when you hover.
- **Hand-drawn look:** every line is drawn twice, with a faint second stroke slightly off from the first, like a pencil going over it again. All lines are slightly roughened.
- **Line boil:** while the card is open, the lines jitter a little a few times per second, like hand-drawn cartoon frames.
- **Card:** the card's border is now a pencil-drawn wobbly rectangle instead of a solid border and shadow. The caption is inside it.

A check is running now. If the jitter feels too busy, I can turn it off and keep the sketches still.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I made the doodle cards bigger: 176px wide instead of 150px, and a bit taller. The pencil frame now sits further out, so the captions have room on every side. The drawings and captions are unchanged, and the cards still sit centered above their phrases. A check is running now.

## User

also the Psisyphus one the person placement is incorrect it should be on top of the line but right now the line get through him

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I moved Sisyphus and the boulder up so they stand on the hill line instead of being crossed by it. His feet now rest on the slope, and the boulder touches the slope with his hands against it. I placed them by calculating where the line runs, but didn't open the card to look, so tell me if anything still overlaps.

## User

make the underline less visible and less distractive, but animate it on page open so they know it's something interactive

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The underlines under the four doodle phrases are now thinner and faint by default (30% purple), and they turn darker when you hover.

The first time the About paragraph scrolls into view, each underline draws itself in from left to right. They go one after another, 0.3s apart. Each starts dark and settles to the faint color, which hints that the phrases are interactive. It plays once per visit and is skipped when "reduce motion" is on. A check is running now.

## User

increase the animation speed of the drawing, draw it faster, or even change the animation of it

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The hover doodles now draw about twice as fast. Each line takes 0.22s instead of 0.55s, and the gaps between lines are 60% shorter. The whole sketch, caption included, finishes in about 0.5s instead of over 1s, so it reads like a quick scribble.

If it's still too slow, the next option is to skip the drawing and stamp the sketch in all at once with a small pop.

## User

I liked it when it was slower

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The doodles draw at the slower speed again: 0.55s per line with the original gaps between lines, and the caption fades in last.

## User

what is this drawing style called ?

## Assistant

It's usually called a **hand-drawn doodle** or **sketchy** style.

- **Overall look:** simple stick figures and objects with rough, slightly wobbly pencil lines. It's close to **sketchnoting**, and similar to the look of tools like Excalidraw or the Rough.js library.
- **The lines drawing themselves:** a **draw-on** or **line-drawing animation**, sometimes called a self-drawing or path animation.
- **The constant jitter:** **line boil**, a classic hand-drawn animation effect. It comes from cartoons where every frame is redrawn by hand, so the lines never sit perfectly still.

