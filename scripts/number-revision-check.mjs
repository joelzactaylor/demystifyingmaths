import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context = vm.createContext({window: {}});
for (const file of ['number-revision-bank', 'number-revision-core']) vm.runInContext(readFileSync('js/' + file + '.js', 'utf8'), context);
const bank = context.window.NumberRevisionBank, core = context.window.NumberRevisionCore;
for(const obsolete of ['record','schedule','queue','independent'])assert.equal(core[obsolete],undefined,'Legacy scheduling API returned: '+obsolete);
// Derive answers from the mathematical quantities, independently of the bank.
const expected = {
    placeValue: [7/100, 4*1e6+3*1000+20],
    orderingNumbers: [Math.max(-.8,-.08,-.18), Math.min(6.205,6.25,6.025)],
    inequalitySymbols: [Array.from({length:11},(_,i)=>i-5).filter(n=>n>-3&&n<=2).length,-5],
    powersOfTen: [72/1000*1000,480/100/(1/100)],
    columnAddition: [(1685+760)/100,(275+86+140)/100],
    columnSubtraction: [(2170-846)/100,(925-380)/100],
    exchangingAcrossZeros: [(7010-2468)/1000,(3000-1785)/100],
    longMultiplication: [208*34,24*36], multiplyingDecimals: [14*6/1000,320*15/1000],
    shortDivision: [924/3,19/8], interpretingRemainders: [Math.ceil(53/8),Math.floor(53/8)],
    longDivision: [2448/16,612/240], dividingByDecimals: [630/15,420/35],
    usingAGivenCalculation: [28*35/1000,980/35],
    indexNotation: [3**4, Array.from({length:8},(_,i)=>i+1).find(n=>2**n===32)],
    recognisingPowers: [Array.from({length:8},(_,i)=>i+1).find(n=>4**n===64),Array.from({length:8},(_,i)=>i+1).find(n=>5**n===625)],
    squareRoots: [Math.sqrt(.81),Math.sqrt(196)], positiveAndNegativeRoots: [-Math.sqrt(121),new Set([Math.sqrt(0),-Math.sqrt(0)]).size],
    cubeAndHigherRoots: [-Math.cbrt(125),Array.from({length:10},(_,i)=>i).find(n=>n**5===243)]
};
const problems = {'wm-tickets':(45000-18*1250-24*775)/100,'wm-bottles':Math.ceil((1800/75)/5),'wm-rope':(1500-8*135)/100,'wm-packs':360/24-420/30,'pr-square':4*Math.sqrt(144),'pr-cube':Math.sqrt(4**3),'pr-solutions':Math.sqrt(81)+Math.sqrt(81),'pr-powers':Math.log2(64)+Math.log(64)/Math.log(4)};
for (const q of bank.questions) assert.equal(q.expected, expected[q.lesson][q.variant], q.id);
for (const q of bank.problems) assert.equal(q.expected, problems[q.id], q.id);
assert.equal(bank.questions.length, 38); assert.equal(bank.problems.length, 8);
for(const [group,expectedPaper] of Object.entries({writtenMethods:{questions:32,marks:57},powersAndRoots:{questions:14,marks:19}})){
    const paper=[...bank.questions.filter(q=>bank.lessons[q.lesson].group===group),...bank.problems.filter(q=>q.group===group)];
    assert.equal(paper.length,expectedPaper.questions,group+': paper length changed');
    assert.equal(paper.reduce((sum,q)=>sum+q.marks,0),expectedPaper.marks,group+': paper mark total changed');
}
for(const [group,rows] of Object.entries(bank.groups)){
    const expectedOrder=rows.flatMap(([lesson])=>[lesson,lesson]);
    const actualOrder=bank.questions.filter(q=>bank.lessons[q.lesson].group===group).map(q=>q.lesson);
    assert.deepEqual(Array.from(actualOrder),Array.from(expectedOrder),group+': questions no longer follow the taught sequence');
}
for (const q of [...bank.questions,...bank.problems]) {
    assert.equal(core.check(q, String(q.expected)), 'correct', q.id);
    assert.equal(core.check(q, ' '+String(q.expected).replace('-', '−')+' '), 'correct');
    assert.equal(core.check(q, ''), 'blank');
    assert.equal(core.check(q, String(q.expected+1)), 'wrong');
    for (const value of ['0,06','1,2,3','Infinity','NaN','1e3','3/4','five','12 cm','--5']) assert.notEqual(core.check(q,value),'correct');
    assert(!q.prompt.includes('?'), q.id+': statement gap, not a question');
    assert(typeof q.examPrompt === 'string' && q.examPrompt.length > 5, q.id+': missing standalone exam wording');
    assert.equal(q.answerForm, Number.isInteger(q.expected) ? 'figures' : 'decimal', q.id+': ambiguous answer form');
    assert(Number.isInteger(q.marks) && q.marks >= 1 && q.marks <= 3, q.id+': invalid mark allocation');
    assert(!/show your working/i.test(q.examPrompt),q.id+': working instruction is duplicated inside the authored prompt');
    for (const raw of Object.keys(q.mistakes || {})) {
        assert.equal(core.check(q,raw),'wrong',q.id+': feedback route is not a wrong numerical answer');
        assert(q.mistakes[raw].length>=24,q.id+': feedback route is too vague to help');
    }
    for (const id of q.prerequisites) assert(bank.lessons[id], q.id+': missing prerequisite');
}
assert.equal(core.number('4,003,020'), 4003020);
for(const grouped of ['4 003 020','4\u00a0003\u00a0020','4\u202f003\u202f020'])assert.equal(core.number(grouped),4003020,'Valid spaced digit grouping was rejected');
for(const malformed of ['4 00 3020','40 03 020','4 0030 020'])assert.equal(core.number(malformed),null,'Malformed spaced digit grouping was accepted');
assert.equal(core.check({expected:.07},'.070000000000000001'),'wrong','Rounded near-answer accepted');
assert.equal(core.check({expected:81},'81.000000000000000001'),'wrong');
assert.equal(core.check({expected:0},'0.000000000000000000001'),'wrong');
for(const raw of ['.0700','+000.070',' 0.07000 ']) assert.equal(core.check({expected:.07},raw),'correct');
assert.equal(core.check({expected:0},'-000.000'),'correct');
assert(!core.feedback({expected:2,hint:'Try again.'},'two').includes('units'),'Unitless question mentions units');
assert.match(core.feedback({expected:.07,hint:'Check the place.'},'.7'),/10 times too large/,'Decimal power-of-ten error was missed through floating-point comparison');
assert.match(core.feedback({expected:72,hint:'Check the place.'},'.072'),/1,000 times too small|1000 times too small/,'Power-of-ten direction or factor was not explained');
assert.doesNotMatch(core.feedback({expected:.07,hint:'Check the place.'},'.71'),/times too/,'Unrelated decimal was misdiagnosed as a power-of-ten error');
for (const [id, raw, phrase] of [
    ['orderingNumbers:0','-0.18','closer still'],
    ['inequalitySymbols:0','4','−3 is excluded'],
    ['columnAddition:1','3.61','remaining 1.40 m'],
    ['longMultiplication:0','832','partial product'],
    ['shortDivision:0','38','zero must remain'],
    ['indexNotation:0','12','four equal factors'],
    ['positiveAndNegativeRoots:1','2','same number']
]) {
    const q=bank.questions.find(q=>q.id===id);
    assert(core.feedback(q,raw).includes(phrase),id+': recognisable wrong answer did not receive specific feedback');
}
for (const l of Object.values(bank.lessons)) {
    const path = l.url.replace('/demystifyingmaths/', '');
    assert(existsSync(path),path);
    assert(readFileSync(path,'utf8').includes('id="'+l.anchor+'"'),l.id+': missing deep link');
    assert(bank.lessons[bank.prerequisites[l.id]],l.id+': missing foundation');
}
assert.equal(core.restoreSession({ids:['unknown'],index:0},bank,'writtenMethods'),null);
assert.equal(core.restoreSession({ids:['indexNotation:0'],index:0},bank,'writtenMethods'),null);
const restored = core.restoreSession({ids:['indexNotation:0'],index:1,responses:{'indexNotation:0':{draft:'wrong',correct:true,finished:true}}},bank,'powersAndRoots');
assert.equal(restored.index,0); assert.equal(restored.responses['indexNotation:0'].correct,false);
const draft = core.cleanResponse({draft:'81'},bank.questions.find(q=>q.id==='indexNotation:0'));
assert.equal(draft.correct,false);
const duplicateScratch=core.cleanResponse({scratch:{texts:[{id:'same',x:1,y:2,text:'first'},{id:'same',x:3,y:4,text:'second'}]}},bank.questions[0]).scratch;
assert.deepEqual(Array.from(duplicateScratch.texts,box=>box.text),['first'],'Duplicate saved working identifiers were retained');
const oversizedScratch=core.cleanResponse({scratch:{strokes:Array.from({length:10},()=>Array.from({length:1000},()=>[1,1]))}},bank.questions[0]).scratch;
assert.equal(oversizedScratch.strokes.reduce((sum,stroke)=>sum+stroke.length,0),4000,'Saved ink exceeded its per-question storage budget');
const closedSolution=core.cleanResponse({solution:true,solutionOpen:false,finished:true},bank.questions[0]);
assert.equal(closedSolution.solution,true);
assert.equal(closedSolution.solutionOpen,false);
assert.equal(closedSolution.finished,true);
assert.equal(core.cleanResponse({solution:true},bank.questions[0]).solutionOpen,true,'Legacy open solutions must remain available');
const markedQuestion=bank.questions.find(q=>q.id==='indexNotation:0');
assert.equal(core.cleanResponse({draft:'81',correct:true,finished:true,workingRevision:1,markRevision:0},markedQuestion).finished,false,'Unchecked working was allowed to count as finished');
assert.equal(core.cleanResponse({draft:'81',correct:true,finished:true,solution:true,workingRevision:1,markRevision:0},markedQuestion).finished,true,'Viewed solution no longer provided its completion route');
assert.match(bank.questions.find(q=>q.id==='positiveAndNegativeRoots:1').examPrompt,/answer as a figure/i,'Number-of-solutions prompt does not resolve figures versus words');
const twoMark=bank.questions.find(q=>q.marks===2);
const oneMark=bank.questions.find(q=>q.marks===1);
assert(core.markRecord({earned:1,total:2,answerCorrect:false},twoMark));
assert(core.markRecord({earned:0,total:2,answerCorrect:false,unassessed:1},twoMark));
assert(core.markRecord({earned:0,total:2,answerCorrect:true,missingWorking:true},twoMark));
assert(core.markRecord({earned:0,total:2,answerCorrect:true,unassessed:1},twoMark));
assert(!Object.hasOwn(core.markRecord({earned:1,total:2,junk:'discard me'},twoMark),'junk'),'Validated mark record retained unknown data');
for(const junk of [
    {earned:3,total:2},
    {earned:0,total:2,answerCorrect:false,missingWorking:true},
    {earned:1,total:2,answerCorrect:true,missingWorking:true},
    {earned:0,total:2,answerCorrect:true,unassessed:1,missingWorking:true},
    {earned:2,total:2,answerCorrect:true,missingWorking:true},
    {earned:0,total:2,answerCorrect:true,unassessed:3}
]) assert.equal(core.markRecord(junk,twoMark),null,'Impossible saved mark state was accepted');
assert.equal(core.markRecord({earned:0,total:1,answerCorrect:false,unassessed:1},oneMark),null,'A one-mark answer acquired a reviewable method mark');
assert.equal(core.markRecord({earned:0,total:1,answerCorrect:true,missingWorking:true},oneMark),null,'A one-mark answer claimed required working was missing');
console.log('38 retrieval prompts and 8 problems: independent arithmetic, input grammar, scope links and corrupt/draft state passed.');
