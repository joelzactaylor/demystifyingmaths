# The prose voice, as the written-methods pages actually write it

Not a style preference. Six agents read `columnAddition`, `columnSubtraction`,
`longDivision`, `longMultiplication`, `multiplyingDecimals` and `shortDivision`
and extracted the rules those pages obey, with the sentence that demonstrates
each one and a sentence that breaks it. Every rule below is testable against a
single sentence in isolation.

## How good the reference pages are

Worth knowing before treating them as a model. The walkthrough prose — the
middle of a section, where a calculation is being done — is disciplined and
would survive any editor. Across all 29 files in the directory there are zero
occurrences of *tricky*, *obviously*, *of course*, *in this lesson*, *you will
learn*, *don't worry* or *keep in mind*.

The openings are not. About one sentence in ten fails, and they cluster in three
places: **the introduction, the hinge between sections, and any sentence beside
a widget.** Copying an opener from these pages copies the fault. Copy the
middles.

## The rules

### 1. Every sentence asserts something about numbers, columns, or marks on paper. A sentence whose only content is a fact about the document — what the page covers, what a section will show, what kind of task this is — does not belong in the prose.

*Test:* Delete the sentence. If the only thing lost is information about the page's own shape or sequence, it fails.

> Seven ones and nine ones make sixteen ones whatever stands to the left of them.

Fails: Choosing between them turns out to be a count, and most of this page is about where that count comes from.

### 2. Name the numeral. Where an actual digit string from the running calculation was available, the sentence uses it rather than a category noun ('the numbers', 'a suitable multiple', 'a large division'). An abstract sentence is permitted only if the sentence beside it in the same paragraph carries the digits.

*Test:* Does the sentence contain a numeral, or does the very next sentence in the same paragraph instantiate it with one? If neither, it fails.

> For 179, 7 × 23 = 161 is small enough and 8 × 23 = 184 is too large.

Fails: The calculation treats their digits as whole numbers first, then restores the combined number of decimal places in the product.

### 3. No mechanics copy. The prose never describes an input box, a control, an animation, a rendering choice, or where to look. A figure is entered by stating the arithmetic it contains.

*Test:* Would the sentence still be true and still be worth writing if the page were printed on paper with no interactive parts? If not, it fails.

> In 984 ÷ 4, the 9 represents 9 hundreds.

Fails: The divisor remains a two-digit integer, and an ellipsis shows when a displayed decimal continues.

### 4. The grammatical subject is a mathematical object — a number, digit, column, row, point, remainder, quotient, or the method itself. Never the page, the lesson, the exam, the student, or a dummy 'there is'.

*Test:* Find the subject of the main clause. If it is the page, the reader, or the lesson, it fails.

> The decimal point is not divided or carried.

Fails: This page uses whole-number divisors from 2 to 9.

### 5. No word rates difficulty, importance, or novelty. Difficulty adjectives may attach to a calculation, never to the reader or the topic. 'Important', 'straightforward', 'tricky', 'easy to learn', 'the key thing' do not appear.

*Test:* Strike every judging adjective and adverb from the sentence. If it now says exactly the same thing about the maths, those words were failing.

> One hard addition is therefore several easy ones in disguise.

Fails: The other two columns are straightforward: 6 − 4 = 2 and 8 − 3 = 5.

### 6. No filler adverbs or softeners: simply, just, really, actually, basically, essentially, obviously, of course, in fact.

*Test:* Delete the adverb. If the sentence's meaning is unchanged, the adverb was banned and the deletion is the fix.

> Nothing is recalculated.

Fails: The six products are all still there; they have simply been added in two stages instead of one.

### 7. Nothing addresses the reader's state. No reassurance, no anticipation of confusion, no permission to find something hard, no 'anyone who loses their way'. Where an expectation must be corrected, the correction is a fact about the numbers.

*Test:* Does the sentence make a claim about what the reader feels, fears, remembers, notices, or needs? If yes, it fails.

> Nothing has gone wrong.

Fails: Anyone who loses their way in the short form can go back to the lines, which show their working at every step.

### 8. A reason is welded to its instruction inside the same sentence by because / so / so that, and the connective carries a real inference — the consequent must actually follow from the antecedent.

*Test:* Read only the clause after 'so' or 'because'. Does it genuinely follow from the clause before it, or is the connective decoration? Decoration fails.

> Do not start with 1 or 17 because neither contains a whole group of 23.

Fails: It makes each subtraction visible, so the remainder from one stage becomes the starting amount for the next.

### 9. A mistake is stated as the specific wrong answer it produces, written out, with its size named as a concrete multiple. Never as advice to take care.

*Test:* Does the sentence name the wrong number, or the exact quantity by which the answer is off? If it only counsels caution, it fails.

> Tidy the 20 down to 2 first and you will count one place instead of two and finish at 2.0, which is ten times too big.

Fails: Be careful to put the decimal point in the right place.

### 10. No previews and no trailers. A fact is delivered once, where it is used. An introduction states facts about the maths, not a summary of the sections beneath it.

*Test:* Does this sentence announce, promise, or summarise something the page delivers again later in its own words? If yes, it fails and the later delivery is the one to keep.

> Here is the surprise. 0.3 × 0.4 = 0.12, and 0.12 is smaller than 0.3 and smaller than 0.4.

Fails: There is one surprise on the way: 0.3 × 0.4 = 0.12, which is smaller than either number it came from.

### 11. A number in a sentence counts a mathematical thing, never the page's own items. No 'four slips', 'two things to settle', 'three steps below'.

*Test:* For every number in the sentence, ask what it counts. If it counts bullets, sections, or examples on the page, it fails.

> Wrong answers in column addition rarely come from the arithmetic.

Fails: Two things to settle before any subtracting starts.

### 12. No pointing at page furniture. 'Below', 'above', 'the first of these', 'as shown', 'the diagram', 'the board', 'watch' never appear. ('Above' is allowed only for a mark's position in the written calculation itself.)

*Test:* Does the sentence rely on the reader's eye moving somewhere to resolve a referent? If yes, it fails.

> If the tens column holds 8 and 6 with a regrouped 1 above it, the column totals 15:

Fails: Watch the hundreds column in the first of these: it gives its last hundred away, and then has to borrow one itself.

### 13. Every negation is resolved. What something is not is never stated without what it is, in the same sentence or the next.

*Test:* If the sentence contains 'not', 'never' or 'no', locate the positive replacement. If it is absent from this sentence and the one after, it fails.

> They do not alter the dividend: they show how the remainder from one place is renamed in the next smaller place.

Fails: The point is not handled the way it is in addition.

### 14. A paragraph closes on a value, a consequence, or a contrast — never on a restatement of what it just said, never on a label for what the reader has been shown, never on a transition to the next section.

*Test:* Read the paragraph's last sentence alone. Does it add a number or an inference, or does it comment on what came before? Commentary fails.

> Then 49 ÷ 7 = 7, so the quotient is 2.7.

Fails: That is the counting rule again, this time as a picture.

### 15. A paragraph opens with a short declarative — twelve words or fewer — that is a claim about numbers, a named calculation frame ('In 984 ÷ 4', 'For 179'), or a condition. Never a discourse marker, never a scene-setter.

*Test:* Read the opening sentence alone. Does it state a fact or fix a frame, or does it clear its throat? Throat-clearing fails.

> Two marks record the swap.

Fails: The same split happens inside a calculation.

### 16. Frequency and proportion claims are either attached to a named list of causes or cut. No bare 'most of them', 'nearly always', 'people often'.

*Test:* Does the sentence quantify something it cannot know? If the frequency word is not immediately followed by the specific named cases, it fails.

> A failed inverse check usually points to an omitted quotient zero, an ignored carried remainder or a digit written in the wrong column.

Fails: Four slips account for most of them, and each one is a failure of the arrangement rather than of the adding.

### 17. A cross-reference sits inside a sentence that does its own mathematical work, and names the case that sends the reader elsewhere. It is never a standalone signpost.

*Test:* Remove the link and its clause. Does a real fact about numbers remain in the sentence? If nothing remains, it fails.

> A divisor with two or more digits needs long division; a decimal divisor is first changed using the method on dividing by decimals.

Fails: Whether a remainder is sufficient can depend on the question's context, as explained on interpreting a remainder.

### 18. No sentence exceeds about thirty words, and a long sentence earns its length by holding two parallel branches split on a semicolon, not by stacking subordinate clauses.

*Test:* Count the words. Over thirty, check for a semicolon splitting two parallel halves; without one, it fails.

> Stop if the answer is required as a whole-number quotient with a remainder; append a decimal point and zeroes only if the answer should continue as a decimal.

Fails: What changes, from one section to the next, is how much of the working is written down — and the short form at the end is the one that writes the least, which is exactly why it is the hardest to read.

### 19. Terminology is fixed. A term keeps the same word every time it appears; no synonym is swapped in for rhythm, no informal substitute ('goes into', 'leftover', 'the number on top') and no unearned formalism ('partial product', 'distributive law', 'algorithm').

*Test:* For each technical noun, check it is the same word this page used the last time it named that object. A fresh synonym fails.

> At each stage, choose the greatest multiple of the divisor that does not exceed the current amount.

Fails: See how many times the bottom number goes into the leftover bit.

### 20. No sentence says the same thing twice. Paired synonyms, and restatements of the previous sentence with no new number, are cut to the half that carries the content.

*Test:* Split the sentence at its 'and' or its colon. If both halves make the same claim, it fails.

> Regrouping renames a quantity; it never changes it.

Fails: Column addition is the arrangement that separates them and keeps them apart.

### 21. Present tense, active voice, no promissory future. Nothing is deferred to a later part of the page or a later stage of the reader's education.

*Test:* Does the sentence describe what the numbers do now, or what will be covered? Coverage fails.

> The context decides what each column counts.

Fails: Later on you will see how the same idea works with decimals.

### 22. Second person appears only as the subject of an arithmetic verb — multiply, count, write, tidy, clear, cross out — or not at all. It is never the subject of a verb about learning, noticing, remembering, or understanding.

*Test:* Find 'you'. What verb does it govern? If the verb is mental rather than arithmetic, it fails.

> You run the whole-number method on the digits, then work out where the point belongs.

Fails: You will remember that the points have to line up.

### 23. No rhetorical questions and no exclamation marks. A point another writer would raise as a question to the reader is stated flat as a fact.

*Test:* Look for ? or !. Either one fails.

> Exam questions rarely say multiply.

Fails: So where does the decimal point go?

### 24. At most one metaphor register per page, applied to the mathematical objects themselves, cashed out in the sentence that follows and then dropped. No 'think of it as', no analogy sustained past two sentences.

*Test:* Is the figure explained in literal arithmetic within the next sentence? If it is left standing, or reappears three sentences later, it fails.

> Swapping a £10 note for ten £1 coins does not change how much money you have.

Fails: Think of the carried digit as a little passenger travelling to the next column.

## Phrases the voice never uses

- simply / just / really / actually / basically / essentially — every filler adverb, with no exception ('the excess is simply worth more than the column can express')
- obviously / of course / clearly / naturally — anything that rates a fact as self-evident
- it is important to / the important thing is / the key point is / worth noting
- notice that / note that / observe that / as you can see / look at how
- remember / recall / don't forget / keep in mind / bear in mind
- this page / this lesson / this section / in what follows / most of this page is about
- what changes from one section to the next / the rest of this page / we will now / next we
- below / above (as a pointer) / as shown / the diagram / the animation / the board / the first of these / see the example
- click / drag / tap / use the boxes / enter a number / choose whether to / use whole numbers or decimals / an ellipsis shows
- two things to settle / four slips / three steps — any number that counts the page's own items
- straightforward / simple / easy / tricky / hard to grasp / the difficult part is (applied to anything but a named calculation)
- don't worry / it may seem / at first this looks / anyone who loses their way / if you find this confusing
- students often / a common mistake is / many people think / people get this wrong
- be careful / take care / make sure you / it is a good idea to / try to remember
- might / may / could / perhaps / probably / tends to / can depend on (as hedges on a mathematical claim)
- nearly always / usually / most of the time / in most cases (unattached to named causes)
- there is one surprise on the way / here is the surprise / as we will see / you'll see why in a moment
- let's / let us / we / our / us / I
- think of it as / imagine that / it's like / picture a
- however / therefore / in other words / that said / moreover / furthermore as a sentence opener
- later you will learn / for now / we'll cover this later / this is beyond the scope of this page
- turns out to be / it is most of what you need / this is the whole trick
- separates them and keeps them apart — any pair of synonyms joined by 'and'
- goes into / leftover / the top number / the bottom number / take away (informal substitutes for fixed terms)
- partial product / distributive law / algorithm / minuend / subtrahend (formalism the page has not earned)
- rhetorical questions of any kind, and exclamation marks of any kind
- great! / well done / now you know how to / you should now be able to

## Checking it

`plain.mjs` tests the shapes that can be tested mechanically — clefts that delay
the verb without marking a contrast, circumlocution, padding before the point,
and length that comes from clauses stacked on clauses rather than from content.
Most of the rules above need a reader. Run the audit described in
`lesson-page-cycle.md` and judge them by hand.

A cleft is not automatically a fault. *"What changes, from one section to the
next, is how much of the working is written down"* fronts a real contrast and
earns its shape; *"What covers it is knowing the numbers"* fronts nothing and
was cut. The difference is whether anything is being contrasted.
