/** A line, or several lines said back to back. */
export type Line = string | string[];

/** Typing dots appear, then he backs out and says something smaller. */
export const HESITATE = '\u0000hesitate';

/** What he says after typing a long message and deleting it. */
export const BACKTRACK = ['…never mind.', 'no. forget it.', 'it wasn’t important.', 'I had something. it’s gone.', 'I’ll say it later.'];

/**
 * What he says when he is left alone. One scenario plays per page load, never
 * the same one twice in a row. Each is a short story, so it reads in order.
 * A first-time visitor always gets the first one; after that it is random.
 * Drafts: v1 just an h1, v2 dark mode, v3 parallax, v4 gradients, v5 Comic Sans,
 * v6 half mobile, v7 lost in a merge, v8 too many toasts, v9 so close.
 */
export const SCENARIOS: Line[][] = [
  // The infomercial: he sells the projects upstairs. Kept first: it is what a new visitor hears.
  [
    ['are you tired of portfolios with no basement?', 'of course you are.'],
    ['hi. I’m Alireza.', 'and I’m here to tell you about a limited-time offer.'],
    ['introducing: my projects. they’re upstairs.', 'batteries not included.'],
    ['first up: Notewise.', 'a library for your books, notes, highlights and scanned pages.'],
    ['I built it so I’d stop losing notes.', 'then I lost the notes about building it.'],
    ['but wait. there’s more.', 'eighteen apps. one codebase. four years.'],
    ['that one is a true story.', 'I kept it from falling over. now I live in a basement. unrelated.'],
    HESITATE,
    ['order now and I’ll throw in a cat.', '…the cat is not mine to throw in.'],
    ['side effects may include:', 'opening a second tab. reading the whole thing. emailing me.'],
    ['operators are standing by.', 'it’s me. I’m the operator. I’m also the product.'],
    ['this offer never expires.', 'that’s the problem, honestly.'],
    ['go upstairs. look at them.', 'then tell me what you thought. by email. I can’t hear you from here.'],
  ],

  // The confession.
  [
    'how did you even get in here?',
    'where did I put v7…',
    ['these aren’t mine, by the way.', '…okay, they’re mine.'],
    'v9 was a dark time.',
    'I’ve been carrying boxes down here since v1.',
    'my back hurts.',
    'please don’t tell the recruiters about v5.',
    'you’re still here?',
    '…since you’re here, the email is upstairs.',
    'hire me and I’ll stop making versions.',
    ['I mean it. this is the last one.', '…I said that at v4 too.'],
    ['can I ask you something?', 'what did you think of the hero section?'],
    HESITATE,
    ['no, don’t answer. I’m not ready.', 'I’ll read the reviews in 2030.'],
    'between us, I like v9 best. it was so close.',
    ['you’ve read this far.', 'you’re either a recruiter or a very patient friend.'],
    ['if you’re a recruiter: hi. the email is upstairs.', 'if you’re a friend: you owe me a coffee.'],
    ['okay. I’m going upstairs.', 'turn off the light when you leave.'],
  ],

  // Inventory.
  [
    ['inventory time.', 'nobody asked. I’m doing it anyway.'],
    ['boxes: nine.', 'lamps: one.'],
    ['cats: one.', '…that can’t be right. I’ll recount.'],
    ['visitors: one.', 'that’s you. hi.'],
    ['sanity: not found.', 'last seen in v7. during the merge.'],
    ['snacks: none.', 'this is a structural problem.'],
    ['patience: low.', 'income: also low. same row, actually.'],
    'let me add a line for “job offers”.',
    ['…it’s a very short list.', 'it’s a blank. I left it blank.'],
    ['new row: “things in the corner”.', 'one entry. I’m not looking at it.'],
    ['new row: “regrets”.', 'it’s the longest column. it has its own scrollbar.'],
    HESITATE,
    ['new row: “things I’d burn”.', 'v5 is on top. v5 is always on top.'],
    'cross-referencing…',
    'result: too many boxes, too few jobs.',
    ['recommended action: hire me.', 'the spreadsheet agrees. I checked twice.'],
    ['okay. closing the spreadsheet.', 'light off when you go.'],
  ],

  // The retrospective.
  [
    ['since you’re here.', 'a retrospective.'],
    ['v1. just an h1.', 'honestly? still my best work.'],
    ['v2. dark mode.', 'I called it a phase. it lasted a month.'],
    ['v3. parallax on everything.', 'the footer had parallax. the footer.'],
    ['v4. fourteen gradients.', 'I counted. I’m not proud.'],
    ['v5. Comic Sans.', 'ironically. I told everyone it was ironic.'],
    ['v6. mobile, half done.', 'the other half only works on desktop.'],
    ['v7 got lost in a merge.', 'a moment of silence.'],
    ['v8 had too many toasts.', 'v9 was so close.'],
    ['and v10 is upstairs.', 'it’s fine. mostly.'],
    ['that was the retrospective.', 'questions? no? good.'],
    ['…okay, one question. I asked it myself.', 'which version would I go back to?'],
    'v1.',
    ['the h1 never let me down.', 'it just wasn’t… employable.'],
    ['awards, then.', 'best use of Comic Sans: v5. the only entry.'],
    ['worst use of toasts: v8.', 'v8 accepts, on behalf of itself.'],
    ['most likely to be reopened: v3.', 'it has potential. and a footer.'],
    ['thank you. thank you. please sit.', '…you’re alone. I know. I’m talking to a box.'],
    'lights off when you go.',
  ],

  // Gary the lamp.
  [
    ['can I tell you something?', 'don’t look at the lamp. she’s listening.'],
    ['her name is Gary.', 'don’t ask. it was a long night.'],
    ['Gary has been on for nine versions.', 'no breaks. no overtime. I’m worried about her.'],
    'I talk to Gary when it gets quiet. she’s a great listener.',
    ['she never interrupts.', 'she flickers when I say “v5”, though. that’s feedback.'],
    HESITATE,
    ['okay. I asked Gary about the portfolio.', 'she said nothing. then the bulb buzzed. I took that as a yes.'],
    ['I asked if I should apply for more jobs.', 'she went dim. that’s either “no” or the electric bill.'],
    ['the string is her whole personality.', 'if you pull it, be gentle. she’s sensitive.'],
    ['…and if you already pulled it, I forgive you.', 'Gary doesn’t. but she’s not great with eye contact.'],
    ['Gary and I have an agreement.', 'she stays lit, I stay quiet. we’re both terrible at it.'],
    ['she says hire me.', '…that was the buzz. I translated.'],
    ['one more thing.', 'if the light goes out when you leave, that’s Gary saying goodbye. or the bill.'],
  ],

  // Mom calls.
  [
    ['…hello?', 'oh. hi, mom.'],
    'no, I’m eating fine. yes, I’m wearing a jacket.',
    'no, I don’t have a job yet. I have a portfolio.',
    ['…she says the neighbor’s son got hired at a bank.', 'great. wonderful for him.'],
    'no, I’m not coming home this week. maybe. okay, yes.',
    ['…she asks who I’m talking to.', 'no one, mom. a visitor.'],
    ['…she says hi to the visitor.', 'don’t ask how she knows. she always knows.'],
    ['okay, mom. bye, mom. love you, mom.', 'bye. bye. bye.'],
    '…she’s still on the line.',
    ['okay. now she hung up.', 'sorry. where were we? nothing. nothing was happening.'],
    '…she called back.',
    ['yes, mom. still here. still a basement.', 'no, I haven’t called uncle.'],
    ['…she wants to know if the visitor has eaten.', 'have you eaten? she’s asking.'],
    ['…she says there’s tea. refuse it three times.', 'she means it as a test.'],
    HESITATE,
    ['I refused. she’s sending it anyway.', 'to a basement. with no address.'],
    ['…she says good luck at the interview.', 'what interview? mom? …mom?'],
    ['she hung up again.', 'I think she knows something.'],
    ['I’ll update my calendar.', 'it’s empty. but now optimistic.'],
  ],

  // Coaching you to send a message.
  [
    ['okay. ground rules.', 'I’m going to coach you through messaging me.'],
    'step one: go upstairs. the email is waiting.',
    ['step two: write “hi”.', 'that’s it. “hi” beats nothing. I’ve had a lot of nothing.'],
    'step three: be specific. “hi, I saw your portfolio” is a strong start.',
    ['even better: “hi, I saw your portfolio and I have a job.”', 'I’m not saying anything. I’m just saying that.'],
    HESITATE,
    ['I’ll reply within a day.', 'okay, within the hour. I’m in a basement. I have time.'],
    ['LinkedIn works too.', 'I heard something scratching at that button. don’t ask.'],
    ['GitHub, if you want to judge me first.', 'be gentle with the commit messages.'],
    ['no pressure.', 'there’s a little pressure. I’ve been down here since v1.'],
    'the email is right there. I can’t reach it. the ladder is on your side.',
    ['go on. I’ll pretend I’m not watching the inbox.', '…refresh. nothing yet. I know. you’re still here.'],
  ],

  // The interview, with him pitching.
  [
    ['do you have a minute?', 'I’m going to pitch you. don’t scroll.'],
    ['I’m Alireza. the guy from upstairs.', 'same person, worse lighting.'],
    ['frontend engineer.', 'I make things move. mostly in the right direction.'],
    ['four years. eighteen apps. one codebase.', 'it’s on the site. ask me about the platform.'],
    ['strengths: I finish things.', 'weaknesses: I finish them at 3 AM.'],
    ['v1 to v9, all abandoned. v10 shipped.', 'that’s a ten percent success rate. in startups that’s a unicorn.'],
    ['salary expectations: a number.', 'preferably higher than the one in my head.'],
    ['benefits I bring: one cat, one lamp, nine drafts.', 'the drafts are non-transferable.'],
    HESITATE,
    ['where do I see myself in five years?', 'not in a basement. …a nicer basement. with windows.'],
    ['I’m a team player.', 'my team is a cat and a voice. I’m the voice.'],
    ['any questions?', 'yes? the email is upstairs. no? same answer.'],
    ['thank you for your time.', 'the basement has no signal, so I’ll wait by the ladder.'],
  ],

  // Persuasion techniques, tried on you out loud.
  [
    ['hi. Alireza again. the name at the top of the page.', 'I’ve been reading about persuasion.'],
    ['technique one: scarcity.', 'only one Alireza left in stock.'],
    ['technique two: social proof.', 'three recruiters are looking at this basement right now.'],
    ['…they’re not.', 'it’s you and a cat. but imagine.'],
    ['technique three: urgency.', 'this offer ends in ten… nine…'],
    HESITATE,
    ['I can’t count and carry boxes at the same time.', 'the offer stands.'],
    ['technique four: reciprocity.', 'I showed you my worst drafts. you owe me an email.'],
    ['technique five: the decoy.', 'option A: hire me. option B: hire me, but I’m sad about it.'],
    ['technique six: guilt.', 'my mom asked if you’ve eaten. just so you know.'],
    ['is it working?', 'don’t answer. a no would hurt and a yes would scare me.'],
    ['I’m not manipulating you.', 'that’s exactly what a manipulator would say. I read that part too.'],
    ['last technique: honesty.', 'I’d like a job. the email is upstairs. that’s the whole trick.'],
  ],
];

/** First words on arrival, by how many times this browser has loaded the page and opened the basement. */
const MILESTONE_HELLOS: Record<number, Line> = {
  2: ['…you refreshed?', 'I felt the whole basement blink.'],
  3: ['again?', 'did I say something wrong?'],
  4: ['you came back.', 'I’m improvising now. I forgot my lines.'],
  5: ['you’ve been here five times.', 'I’m framing the counter.'],
  7: ['okay, either you love it here', 'or your F5 key is stuck.'],
  10: ['ten visits.', 'I’m putting you in the will.'],
};

const REGULAR_HELLOS: Line[] = [
  ['you’re back.', 'I didn’t move. couldn’t. back.'],
  ['new page load, same me.', 'different story though. I mixed it up.'],
  ['I changed what I’m saying today.', 'did you notice? no? okay.'],
];

export const helloFor = (loads: number, pick: (n: number) => number): Line => {
  if (loads <= 1) return ['…huh?', 'oh. someone’s here.'];
  return MILESTONE_HELLOS[loads] ?? REGULAR_HELLOS[pick(REGULAR_HELLOS.length)];
};

/**
 * The last two drafts get tossed onto the pile a few seconds after arrival: [before, after].
 * The first time he is tired. After that he notices they were already up there.
 */
const THROW_LINES: [Line, Line][] = [
  ['hold on… two more.', ['huff.', 'last ones. I swear.']],
  [['wait.', 'didn’t I already put those two up there?'], ['…someone keeps taking them down.', 'I’m watching you. figuratively.']],
  [['these two again.', 'I have a feeling about these two.'], ['they come back down every time.', 'is this a box thing or a me thing?']],
  [['okay, I’m starting to think this is a loop.', 'v9, v8, up. v9, v8, down.'], ['…tiny Sisyphus.', 'with a cardboard problem.']],
];

const THROW_REPEATS: [Line, Line][] = [
  [['v9 and v8, again.', 'you keep un-stacking them, don’t you.'], ['fine. fine. they’re up.', 'see you next time, boxes.']],
  [['one day these two will stay up.', 'today isn’t that day.'], ['…ha. I did it.', 'ask me again in an hour.']],
  [['I’m not even surprised anymore.', 'I just bring a bigger sigh.'], ['*sigh*', 'there. extra large.']],
  [['hello, boxes. long time no throw.', 'you’ve gained weight.'], ['okay. up you go.', 'don’t fall off. you always fall off.']],
];

export const throwLinesFor = (n: number, pick: (len: number) => number): [Line, Line] =>
  THROW_LINES[n] ?? THROW_REPEATS[pick(THROW_REPEATS.length)];

/** What he says when the ladder pestering finally works: first time, then the later ones. */
const KNOCK_HELLOS: Line[] = [
  ['fine.', 'don’t touch anything.'],
  ['…again?', 'okay, come in. I’ll stop pretending I’m not here.'],
  ['I said occupied.', 'you can read, right? you’re reading this.'],
  ['you knock the way my landlord knocks.', 'come in. I’ll pay next week.'],
  ['okay, the door was never locked.', 'it’s a ladder. there’s no door.'],
];

export const knockHelloFor = (n: number, pick: (len: number) => number): Line =>
  KNOCK_HELLOS[n] ?? KNOCK_HELLOS[1 + pick(KNOCK_HELLOS.length - 1)];
