export type ToastKind = 'exp' | 'copy' | 'bullet' | 'drag' | 'fal' | 'box' | 'cat' | 'deeper' | 'draw';

/** [title, body]. Bodies may contain {s} / {c} / {v} placeholders. */
export type ToastMessage = readonly [title: string, body: string];

export const TOASTS: Record<ToastKind, readonly ToastMessage[]> = {
  exp: [
    ['Having fun?', 'You clicked it 4 times. The text inside is important too.'],
    ['Okay, okay.', 'The button works. I promise. Now read the cards.'],
    ['Again?', 'These cards have words in them too, you know.'],
    ['Button lover?', '4 clicks. Maybe read what’s inside this time.'],
    ['I see you.', 'You like the button more than my experience. Rude.'],
  ],
  copy: [
    ['Yes, it’s copied.', 'It worked on the first click. The other 4 were just for fun.'],
    ['Still copied.', 'I swear it was copied the first time.'],
    ['Copied. Again.', 'Your clipboard is now 100% my email.'],
    ['We get it.', 'Now paste it somewhere and send me a message.'],
    ['That’s enough ink.', 'You can stop now. My email is not going anywhere.'],
  ],
  bullet: [
    ['They’re just bullets.', 'The skills are the words right next to them.'],
    ['Collect them all?', 'There are only five shapes. You’ve seen every one by now.'],
    ['Still rerolling?', 'None of them are rare. I promise.'],
    ['Bullet connoisseur.', 'Ten rerolls. The skills next to them took a bit longer to learn.'],
  ],
  drag: [
    ['Nice try.', '{s} doesn’t belong in {c}. I checked.'],
    ['Nope.', '{s} under {c}? That PR would never get approved.'],
    ['Rejected.', '{c} said no. {s} is going back home.'],
    ['Interesting choice.', 'Putting {s} in {c} is how legacy code starts.'],
    ['Hold on.', 'I spent a while sorting these. {s} stays where it is.'],
  ],
  fal: [
    ['Greedy.', 'In Shiraz you get one fāl per wish. That was six.'],
    ['Not the answer you wanted?', 'Hafez wrote around 500 ghazals. I only managed a few dozen.'],
    ['Make a wish first.', 'That’s how it works. You’ve been skipping that part.'],
    ['Okay, a confession.', 'None of these are really by Hafez. He never had to center a div.'],
  ],
  box: [
    ['Leave it.', 'v{v} is taped shut for a reason.'],
    ['Don’t open that.', 'v{v} had an autoplay carousel. With sound.'],
    ['Please.', 'v{v} used three fonts for one heading.'],
    ['Careful.', 'v{v} is held together by !important.'],
    ['Nope.', 'v{v} only worked in Safari. Somehow.'],
  ],
  cat: [
    ['Shh.', 'She’s had a long day in the basement.'],
    ['Let her sleep.', 'She climbed a whole ladder for this.'],
    ['Not my cat.', 'She just showed up one day and stayed.'],
  ],
  deeper: [
    ['That’s it.', 'There is no sub-basement. I checked.'],
    ['Still scrolling?', 'This is the bottom. Even the drafts stop here.'],
  ],
  draw: [
    ['Hey, I just cleaned this!', 'Nice art though. I’ll put it on the fridge.'],
    ['Wow, what a mess.', 'You made quite a mess on my portfolio.'],
    ['Picasso, is that you?', 'Please don’t sign it. Recruiters will see this.'],
    ['This is not a notebook.', 'It’s my portfolio. But okay, keep going.'],
    ['Beautiful.', 'I will frame it. Then I will refresh the page.'],
  ],
};
