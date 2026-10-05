import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context = vm.createContext({window: {}});
for (const file of ['number-revision-bank', 'number-revision-core']) vm.runInContext(readFileSync('js/' + file + '.js', 'utf8'), context);
const bank = context.window.NumberRevisionBank, core = context.window.NumberRevisionCore;
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
for (const q of [...bank.questions,...bank.problems]) {
    assert.equal(core.check(q, String(q.expected)), 'correct', q.id);
    assert.equal(core.check(q, ' '+String(q.expected).replace('-', '−')+' '), 'correct');
    assert.equal(core.check(q, ''), 'blank');
    assert.equal(core.check(q, String(q.expected+1)), 'wrong');
    for (const value of ['0,06','1,2,3','Infinity','NaN','1e3','3/4','five','12 cm','--5']) assert.notEqual(core.check(q,value),'correct');
    assert(!q.prompt.includes('?'), q.id+': statement gap, not a question');
    assert(typeof q.examPrompt === 'string' && q.examPrompt.length > 5, q.id+': missing standalone exam wording');
    assert.equal(q.answerForm, Number.isInteger(q.expected) ? 'figures' : 'decimal', q.id+': ambiguous answer form');
    assert(Number.isInteger(q.marks) && q.marks >= 1 && q.marks <= 3, q.id+': invalid suggested marks');
    for (const id of q.prerequisites) assert(bank.lessons[id], q.id+': missing prerequisite');
}
assert.equal(core.number('4,003,020'), 4003020);
assert.equal(core.check({expected:.07},'.070000000000000001'),'wrong','Rounded near-answer accepted');
assert.equal(core.check({expected:81},'81.000000000000000001'),'wrong');
assert.equal(core.check({expected:0},'0.000000000000000000001'),'wrong');
for(const raw of ['.0700','+000.070',' 0.07000 ']) assert.equal(core.check({expected:.07},raw),'correct');
assert.equal(core.check({expected:0},'-000.000'),'correct');
assert(!core.feedback({expected:2,hint:'Try again.'},'two').includes('units'),'Unitless question mentions units');
for (const l of Object.values(bank.lessons)) {
    const path = l.url.replace('/demystifyingmaths/', '');
    assert(existsSync(path),path);
    assert(readFileSync(path,'utf8').includes('id="'+l.anchor+'"'),l.id+': missing deep link');
    assert(bank.lessons[bank.prerequisites[l.id]],l.id+': missing foundation');
}
const now = Date.UTC(2026,9,4), day = 86400000;
let history = null;
for (const days of [1,3,7,14,30,30]) {
    history = core.schedule(history,true,0,now);
    assert.equal(history.due,now+days*day);
}
assert.equal(core.schedule(history,false,1,now).due,now+day);
assert.equal(core.schedule(history,false,1,now).step,0);
const records = {a:core.schedule(null,true,0,now),b:null};
assert.deepEqual(Array.from(core.queue(['a','b'],records,now)),['b:0']);
assert.deepEqual(Array.from(core.queue(['a'],records,now+day)),['a:1']);
assert.equal(core.queue(Array.from({length:12},(_,i)=>String(i)),{},now).length,6);
assert.equal(core.restoreSession({ids:['unknown'],index:0},bank,'writtenMethods'),null);
assert.equal(core.restoreSession({ids:['indexNotation:0'],index:0},bank,'writtenMethods'),null);
const restored = core.restoreSession({ids:['indexNotation:0'],index:1,responses:{'indexNotation:0':{draft:'wrong',correct:true,finished:true}}},bank,'powersAndRoots');
assert.equal(restored.index,0); assert.equal(restored.responses['indexNotation:0'].correct,false);
const draft = core.cleanResponse({draft:'81'},bank.questions.find(q=>q.id==='indexNotation:0'));
assert.equal(draft.correct,false);
const closedSolution=core.cleanResponse({solution:true,solutionOpen:false,finished:true},bank.questions[0]);
assert.equal(closedSolution.solution,true);
assert.equal(closedSolution.solutionOpen,false);
assert.equal(closedSolution.finished,true);
assert.equal(core.cleanResponse({solution:true},bank.questions[0]).solutionOpen,true,'Legacy open solutions must remain available');
assert(core.independent({correct:true,attempts:2,wrongCount:0,helped:false}), 'Rechecking an equivalent correct answer is not a mathematical mistake');
assert(!core.independent({correct:true,attempts:2,wrongCount:1,helped:false}));
for (const junk of [null,[],{},'bad',{due:-1,step:2,variant:1},{due:now,step:999,variant:0}]) assert.equal(core.record(junk),null);
console.log('38 retrieval prompts and 8 problems: independent arithmetic, input grammar, scope links, intervals, queue order and corrupt/draft state passed.');
