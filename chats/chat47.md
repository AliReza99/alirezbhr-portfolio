# Portfolio Education Secrets

_Started 2026-10-06 08:33 UTC_

---

## User

each part of this portfolio there's some secrets and animation and interaction or easter egg 
I need some ideas for education part 
what do you have in mind ?

## Assistant

_[tool: grep]_

_[tool: read_file]_

Ideas that fit the existing sketchbook style (Caveat notes, tape, hatched offset shadows, toasts):

1. **Graded exam.** Hovering the card makes a red-pen circle draw itself around a grade ("A+" or "20/20", the Iranian scale), with a scribbled "see me after class" in the margin. Click the grade and it gets crossed out and rewritten: "actually, A++".

2. **Fal-e Hafez (a nod to Shiraz).** A small sealed envelope is taped to the card. Opening it pulls out a random "fortune", written as a short developer couplet ("Ship on Friday and the bugs shall find thee"). Each click gives a new one. Very local, very personal.

3. **Logic-gate unlock.** A tiny AND/OR circuit sits in the corner with two toggle switches. Get the right combination and the LED lights up, the card flips over, and the back is a student ID with a barcode, the years, and a doodled photo spot.

4. **Margin doodles.** When the card scrolls into view, bored-student doodles draw themselves in the margins: a cube, a stick figure, "01101" scribbles, a clock reading 3 AM. Hovering one plays a small reaction.

5. **Binary degree.** On hover, "B.Sc. Computer Engineering" scrambles into 0s and 1s, then decodes back one letter at a time.

6. **Cap toss.** Clicking the card three times throws a mortarboard up out of the card. It spins, lands crooked on the section title, and stays there.

7. **All-nighter tally.** Tally marks scratch themselves in next to "where it started", counting up the coffees, and a toast says "4 years, ~1,460 coffees".

My pick is **2 + 1**. The Hafez envelope is the most personal of these, and the red-pen grade suits the hand-drawn look while needing almost no new UI. **3** is the strongest if you want a real puzzle.

Which ones should I build? I'd put them in a v25 copy.

## User

lets do the 2, keep in mind to make the ui like hand drawn/hand written or doodle

## Assistant

_[tool: read_file]_

Now the logic class.

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: copy_files]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: ready_for_verification]_

I added the fāl-e Hāfez easter egg to the Education card in **Portfolio v25**. It's out for a background check now; I haven't looked at it in the browser myself yet.

- **The envelope:** a hand-drawn envelope with a red wax seal sits on the right of the Shiraz University card. Next to it is a handwritten note, "make a wish, then open", with a doodled arrow. Hovering makes it wiggle.
- **Opening it:** the flap opens, the letter inside rises, and a taped piece of lined notebook paper pops out under the card. The two lines of the fortune and a "meaning" line then write themselves in one at a time.
- **The fortunes:** I wrote 10 short developer fortunes in Hafez style, for example "Ship it not on Friday, O seeker of peace, for the weekend belongs to the bugs." Each is signed "— Hāfez, probably".
- **Drawing again:** clicking the envelope again (the note now says "another one?") puts the slip back in and pulls out a different fortune. "fold it back" closes everything.
- **Hidden extra:** after the 6th fortune, a toast pops up, for example "Greedy. In Shiraz you get one fāl per wish."

## User

it should open up to the whole page with the background faded or less distractive

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The fortune now opens over the whole page. The rest of the page fades behind it: blurred, washed out and greyed. A background check is running and I haven't looked at it myself yet.

- **Opening:** the slip flies out of the envelope to the center of the screen, larger than before, and the lines still write themselves in.
- **Inside the slip:** "another one?" draws a new fortune and "fold it back" closes it.
- **Closing:** you can also click the faded background or press Esc. The slip flies back into the envelope.

## User

remove the "another one" and ""fold it back" buttons , add a simple close on top right corner

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I removed "another one?" and "fold it back" from the slip. There's now a close button in its top-right corner, matching the toast's close button, and it rotates on hover. The page loads without errors, but I skipped the visual check for this small change.

Clicking the background or pressing Esc still closes the slip. To get a new fortune, close it and open the envelope again.

## User

move the Hafez, probably to left side instead of right

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

"— Hāfez, probably" now sits on the left side of the slip.

## User

I really liked the idea, however the envelop itself seems a bit not matching the rest of the page, maybe try something less distractive idk

## Assistant

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I made the envelope quieter so it fits the rest of the page. A background check is running and I haven't looked at it myself yet.

- **Look:** it's now a small line-drawn envelope (56×38) in the page's ink and cream colors. The seal is a tiny orange dot, and it sits straight instead of tilted.
- **Hover:** it behaves like your social links. It lifts slightly and the hatched shadow appears behind it.
- **Hint:** cut down to one line, "make a wish", with no arrow.
- **Opening:** the flap opens and the letter peeks out as before, but less dramatically.

If it's still too loud, the next step down would be removing the hint text or the orange seal.

## User

no try something else

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I replaced the envelope with a folded corner on the Education card, like a dog-eared page in a notebook. A background check is running and I haven't looked at it myself yet.

- **Resting:** a small fold in the card's top-right corner, in the card's own ink and paper colors.
- **Hover:** the fold gets bigger and "psst… a fāl?" appears next to it in handwriting.
- **Click:** the fortune slip flies out from the corner into the faded full-page view, the same as before.

Touch screens have no hover, so phone visitors will only see the fold itself, without the hint.

## User

I really liked this one, however make the whole card hoverable, so when we hover show some hint so the user go for that corner

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Hovering anywhere on the Education card now shows the hint. A background check is running and I haven't looked at it myself yet.

- **Card hover:** "psst… a fāl?" slides in next to the folded corner with a small arrow pointing at it, and the corner gently pulses.
- **Corner hover:** the pulse stops and the corner gets bigger, ready to click.
- **Phones:** touch screens have no hover, so there the hint is always shown.

## User

each time we hover it should show something else, 
some ideas:
A gift from Shiraz ? 
hey click here! 
It won't bite to click here 
...

and your psst a fal is great 
continue these maybe 8 different texts would be great 
you can change the texts to make it even funnier if you want

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Each time you hover the card, the hint now shows the next of 8 lines, in order, then starts over:

1. psst… a fāl?
2. a gift from Shiraz?
3. hey, click here!
4. it won't bite. promise.
5. don't click this corner.
6. Hafez left you a note
7. make a wish, then click
8. still not curious?

The page loads without errors, but I skipped the visual check for this change.

## User

how many fal are there?

## Assistant

There are 10 fāls. Each draw picks one at random, and you never get the same one twice in a row. Want me to add more?

## User

yeah add about 30 quality ones, it can also be unrelated to programming though, or mock me for burning tons of tokens for this portfolio 
or roast me for wasting time on portfolio instead of getting a job 
these kind of stuff if you think it's funny 
go on

## Assistant

_[tool: run_script]_

_[tool: run_script]_

_[tool: ready_for_verification]_

There are now 48 fāls; I added 38 new ones to the original 10:

- **Roasting you (12):** months spent polishing instead of job hunting, v25 and no offer letter, "one small tweak" at noon turning into 3 AM.
- **Burning tokens (2):** "the most expensive pun on the internet."
- **Persian and everyday life (8):** ta'arof, tahdig, orange blossoms, the cat with no deadlines.
- **Programming (8):** npm, regex, the intern who pushed to main, the rubber duck.
- **Hire me (8):** these point to your email and the contact section, for example "he finished this. Mostly. Hire him."

I also changed the toast after the 6th fortune to "…I only managed a few dozen." The page loads without errors, but I skipped the visual check for this text change.

## User

change the font though, it kinda hard to read

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

The fortune lines and the "meaning" line now use Patrick Hand, which is still handwritten but much easier to read than Kalam and Caveat. The fortune lines are also slightly bigger. The "fāl no." heading and "— Hāfez, probably" stay in Caveat, so the slip still feels hand-drawn.

The page loads without errors, but I skipped the visual check for this change.

## User

no I liked the previous one it's even worse

## Assistant

_[tool: run_script]_

I put the fonts back the way they were: Kalam for the fortune lines and Caveat for the "meaning" line, at the original sizes. Patrick Hand is removed completely.

## User

The best time to hire him was last year;
the second best time is after this fortune.
meaning: go on. The copy button is right below.

change meaning to something like: Hire Alireza right now

## Assistant

_[tool: run_script]_

The "meaning" line for that fortune now reads "hire Alireza. Right now."

