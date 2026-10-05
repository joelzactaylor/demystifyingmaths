// Independent arithmetic and coverage checks for cumulative retrieval.
import {readFileSync} from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const context = {window:{}};
vm.runInNewContext(readFileSync(new URL("../js/powersRootsRecallBank.js", import.meta.url), "utf8"), context);
const bank = context.window.PowersRootsRecallBank;
const power = (b,n) => Array.from({length:n}).reduce(value => value*b, 1);
const pages = ["indexNotation","recognisingPowers","squareRoots","positiveAndNegativeRoots","cubeAndHigherRoots"];
for(let round=0;round<3;round++) {
    const b=3, e=4, side=9, applicationSide=12, fact=11*11;
    const expected = [
        [power(b,e),fact,side*side,"1"],
        [fact,e,4,"1"],
        [fact,side,applicationSide*4,"1"],
        [side,side,applicationSide*4,"1"],
        [-5,3,4*4,"2"]
    ];
    pages.forEach((page,p) => {
        const questions=bank.build(page,round);
        assert.equal(questions.length,4);
        questions.forEach((q,i) => {
            assert(!q.prompt.includes("?"), "An answer must complete a statement");
            assert.equal(q.expected,expected[p][i],page+":"+round+":"+i);
            const answer=q.type==="pair" ? side+", -"+side : String(expected[p][i]);
            assert(bank.correct(q,answer));
            assert(!bank.correct(q,""));
            assert(!bank.correct(q,"999"));
            assert(!bank.correct(q,"2x"));
            if(q.type==="choice") {
                assert.equal(new Set(q.choices).size,q.choices.length);
                q.choices.forEach((_,j) => assert.equal(bank.correct(q,String(j)),String(j)===q.expected));
            } else assert(bank.help(q,"999").length>15);
            if(q.type==="pair") {
                assert(bank.correct(q,"±"+side));
                assert(bank.correct(q,"-"+side+" and "+side));
                assert(!bank.correct(q,String(side)));
                assert(!bank.correct(q,side+", "+side));
            }
        });
    });
}
assert.equal(power(-5,3),-125);
assert.equal(power(3,5),243);
console.log("20 fixed questions: arithmetic, validation, both-root answers and stable question selection passed.");
const teachingAnswers = {
    indexNotation: [5, 4, power(3,3), power(2,5), 7*7, 5*5*5, 3, 2],
    recognisingPowers: [Math.sqrt(121), Math.cbrt(125), 5, 4, 3, 2, 4, 5],
    squareRoots: [64,144,196,225,.09,.0036,.64,0].map(Math.sqrt),
    positiveAndNegativeRoots: [-Math.sqrt(25),(-8)*(-8),Math.sqrt(36),-Math.sqrt(36),-Math.sqrt(64),-Math.sqrt(121),1,0,Math.sqrt(81),2],
    cubeAndHigherRoots: [Math.cbrt(125),Math.cbrt(1000),Math.cbrt(-64),Math.cbrt(-8),3,2,-2,0]
};
for (const [page, name] of [
    ["indexNotation","IndexNotationBank"], ["recognisingPowers","RecognisingPowersBank"],
    ["squareRoots","SquareRootsLessonBank"], ["positiveAndNegativeRoots","RootsLessonBank"],
    ["cubeAndHigherRoots","CubeRootsLessonBank"]
]) {
    const source=readFileSync(new URL("../js/"+page+".js", import.meta.url), "utf8");
    const sandbox={window:{}};
    vm.runInNewContext(source.split('document.addEventListener("DOMContentLoaded"')[0],sandbox);
    const api = sandbox.window[name], questions = api.buildRound();
    assert.equal(questions.length, teachingAnswers[page].length);
    questions.forEach((q,i)=>{
        assert(Math.abs(q.expected-teachingAnswers[page][i])<1e-12, page+': teaching arithmetic '+i);
        assert.equal(api.evaluateResponse(q,String(q.expected)).state,'correct');
        for (const wrong of ['', ' ', 'words', '1..2', '1,2', '999999']) {
            assert.notEqual(api.evaluateResponse(q,wrong).state,'correct',page+': accepted '+wrong);
        }
        assert(!q.prompt.includes("?"), page+": question instead of statement");
        assert(!/^(Find|Work out|How many|Which|What|And what)\b/.test(q.prompt), page+": separate question instruction");
        assert(q.prompt || q.expression || q.display, page+": missing statement");
    });
    assert(!source.includes('input.placeholder = "?"'), page+": question-mark placeholder");
}
console.log("All 42 teaching prompts also use statement or equation gaps.");
