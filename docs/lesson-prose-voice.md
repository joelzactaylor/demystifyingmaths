# The voice of Demystifying Maths

Mathigon's [Circles introduction](https://mathigon.org/course/circles/introduction#radius)
is the reference for tone: curious, conversational, concrete and respectful.
Write original explanations in that spirit, not copies of its prose. This
standard applies to lessons, captions, questions, hints and feedback site-wide.
It supersedes the former thirty-rule guide and conflicting bans on reader
address, questions, transitions and useful interaction instructions.

## Explore an idea with the reader

Use “we” for shared reasoning and “you” for a choice the learner can make.
Contractions are welcome. Questions can introduce a problem, invite a prediction
or connect two ideas. Answer explanatory questions promptly. Teach the idea and
give a worked example before assessing it: never ask someone to guess a
definition or method that has not been explained.

A short transition is useful when it explains why the next mathematical
question follows. Do not force every paragraph to start with a number or every
heading to state a theorem. “How do we know we've found them all?” can be clearer
than a compressed technical claim. Avoid announcements about page structure.

## Give the mathematics a purpose

Start with something worth finding out. Arranging 24 counters in equal rows
gives factors meaning; “factors are useful in many areas” does not. Context can
be practical, visual, historical or mathematical. Do not invent a shopping
story for every calculation. Verify historical and scientific claims.

Introduce the everyday idea, give its mathematical name, then use that name
consistently. “Nothing left over” can lead naturally to “no remainder”.
Scope claims correctly: here, factors means positive whole-number factors of
a positive whole number. Accuracy matters more than formality.

## Explain generously

Keep paragraphs focused, usually two to four sentences. Vary sentence length.
Word counts are review signals, not laws. Never replace an ordinary explanation
with a cryptic phrase merely to make it shorter. Put each reason beside its
step. Define terms before using them and support general claims with examples.

Restating a relationship is useful when moving from a picture to a calculation
or helping someone recover after an incorrect answer. Remove repetition that
adds no perspective or support. Relevant context may introduce a lesson; it
does not automatically belong in an optional box.

Avoid “obviously”, “of course” and claims that something is easy. Warmth comes
from taking the learner's reasoning seriously, not from congratulating every
answer. Correct inline answers need no visible success message.

## Make interaction part of the explanation

Keep a diagram beside the prose it supports when both remain readable. Colour
can connect the same mathematical object in words and pictures. A question
should continue that thought; put its answer gap where the missing quantity or
relationship belongs. An unrelated form after a large section is not integration.

For assessed interactions, the response completes a statement or equation, not
a separate question. Read the prompt and accepted answer together: they must
form one natural mathematical statement. Choice options complete that same
sentence. Leave answer gaps empty, without question-mark placeholders. This is
a language and presentation choice, not a reason to change the task or its layout.

Brief visible instructions are welcome when they make an action discoverable:
give only the simplest action, and only when needed. Do not list alternative
input methods or keyboard mechanics in the teaching prose.
“Move the point around the circle. Does its distance from the centre change?”
names both an action and its mathematical purpose. Supply keyboard access and
an understandable static explanation too. Hidden instructions alone cannot
make an unfamiliar interaction usable.

Teach, demonstrate, invite a response, then vary one feature. Usually offer two
short opportunities per new idea, with less prompting on the second. Successful
inline answers become plain green text: no automatic success explanation or tick.
After a wrong entry, optional help must respond to what was entered. Do not infer
a misconception without evidence; offer a checking step when the cause is unclear.
Navigation locks cannot substitute for teaching; retain access to the whole lesson.

Keep examples continuous across prose, questions and follow-on explanations.
After moving from 49 to 36, do not casually refer to “7” again without resetting
the context. Avoid instructions such as “Decide what each question is asking for”.
Separate unrelated mathematical objects with words, not ambiguous punctuation;
do not automatically append a full stop directly to an inline numerical answer.
Finish with a concise visible Key points summary, not a compulsory mistakes list.

## Original example

“Suppose you have 24 counters. How many ways can you arrange them in equal rows?
Four rows of 6 use all 24, because 4 × 6 = 24. We call 4 and 6 a factor pair.
Finding one factor gives us its partner too: divide 24 by 4 to get 6.”

The question supplies a purpose, the example supplies evidence, and the term
arrives when it has something to name. The prose addresses a learner without
assuming their feelings or pretending the result is surprising.

## Review

Read aloud: can a GCSE learner follow the reasoning without decoding the
wording? Is each question answerable from what was just taught? Does the
interaction clarify the relationship? Does feedback help an incorrect answer?

Run `node scripts/voice-check.mjs <page>` and review its suggestions. It flags
patronising language, empty reassurance and unusually long sentences. Ordinary
questions, “we”, “you”, contractions and useful instructions are allowed.
Use `docs/lesson-page-cycle.md` for mathematical and visual review; this guide
takes precedence where its older voice and shape rules conflict.
