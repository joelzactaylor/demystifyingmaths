/* Arithmetic and bank contract regression checks. No browser or dependencies. */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const rounded = n => Number(n.toFixed(9));
const expected = {
    placeValue: [8*1000,6/100,7*1000+8,45/100,2e6+40e3+6,307/1000,307,605/1000],
    orderingNumbers: [Math.max(4.7,4.68),Math.min(.503,.53,.305),Math.max(-3,-8),Math.max(-2.4,-2.04,-2.44),Math.min(-.6,.06,-.06,.6),[ -1.2,.12,1.2,-.12].sort((a,b)=>b-a)[1],Math.max(4582,4528,4805),Math.max(708,780,807)],
    inequalitySymbols: ['=','≠',12,-4+1,-2+1,3-(-1)+1,Math.max(-5,-2),Math.min(.7,.07)],
    powersOfTen: [6.04*100,.037*1000,83/100,4.2/1000,7.2*.1,.6/.01],
    columnAddition: [0+5,0,(8+7)%10,5+6+Math.floor((8+7)/10),7.85+4.9,2.35+.85+1.6,4+2,342+526,18.75+6.9,4.86+7.58],
    columnSubtraction: [0,7,7-1,12-6,14.6-8.35,2.4-1.75,6145-2978,14.6-8.35],
    exchangingAcrossZeros: [3-1,10-1,5.02-1.376,13-4.675,50-27.68,5-2.675],
    longMultiplication: [2*10,347*20,Math.floor(6*7/10),6*4+4,24*36,32*18,300*20,40*6,2*100,123*200],
    multiplyingDecimals: [3.7*2.6,.24*1.3,.3*.7,.2*.6,.5*.4,.08*.5,135,1+2,2.4*1.5,.8*.6],
    shortDivision: [9%4,(9%4)*10+8,156/3,852/3,17/8,7/4,604/2,804/4,18.9/7,36.8/4],
    interpretingRemainders: [Math.floor(29/4),Math.ceil(29/4),29/4,23/5,43%6,Math.ceil(43/6),29%4,4-1],
    longDivision: [Math.floor(179/23),(179%23)*10+4,75.6/24,54/12,1248/24,67.2/16,2448/24,Math.floor((2448/24)%100/10)],
    dividingByDecimals: [100,55.2*100,10,3.6/.12,2/.5,3/.25],
    usingAGivenCalculation: [43*26/100,43*26/10,43*26/43,43*26/4.3,260*4.3,11.18/2.6]
};
const mixed = {
    placeValue:[4/100,6e6+50,2+7/100,0], orderingNumbers:[Math.min(-.7,-.07,0),Math.max(3.09,3.9,3.099),[-5,2,-2].sort((a,b)=>a-b)[1],1],
    inequalitySymbols:[6-1,-3,4,1], powersOfTen:[.48*1000,62/100,3/.1,0],
    columnAddition:[3768+2457,8.06+2.7,1.85+.95+2.4,1], columnSubtraction:[753-286,15.8-7.46,6.75-2.9,1],
    exchangingAcrossZeros:[4000-658,6.02-1.875,20-13.76,1], longMultiplication:[246*37,123*204,28*36,1],
    multiplyingDecimals:[1.8*2.4,.06*.5,1.2*.8,1], shortDivision:[816/4,22.5/6,7/8,0],
    interpretingRemainders:[Math.floor(47/6),Math.ceil(47/6),37/8,1], longDivision:[2448/24,45.6/16,Math.ceil(145/24),1],
    dividingByDecimals:[7.2/.3,.84/.07,5.4/.45,1], usingAGivenCalculation:[37*24/100,88.8/2.4,2.4*37,0]
};
let count=0;
for(const [page,answers] of Object.entries(expected)) {
    const html=fs.readFileSync(`pages/curriculum/GCSE/number/structure/writtenMethods/${page}.html`,'utf8');
    const headings=[...html.matchAll(/<h1([^>]*)>([\s\S]*?)<\/h1>/g)].map(m=>({id:m[1].match(/id="([^"]+)"/)?.[1]||'',textContent:m[2]}));
    const host={dataset:{lessonCheckAnchors:''},querySelectorAll:()=>headings};
    const context={window:{},location:{pathname:page+'.html'},document:{querySelector:()=>host}};
    vm.createContext(context);
    vm.runInContext(fs.readFileSync('js/writtenMethodsLessonBank.js','utf8'),context);
    vm.runInContext(fs.readFileSync('js/writtenMethodsRecallBank.js','utf8'),context);
    const bank=context.window.WrittenMethodsLessonBank, questions=bank.buildRound();
    assert.equal(bank.evaluateResponse({expected: 6000}, '6,000').state, 'correct');
    assert.equal(bank.evaluateResponse({expected: 6}, '0,06').state, 'unreadable');
    assert.equal(bank.evaluateResponse({expected: 60}, '6,0').state, 'unreadable');
    assert.equal(questions.length,answers.length,page+' coverage');
    questions.forEach((q,i)=>{
        const correct=typeof answers[i]==='number'?rounded(answers[i]):answers[i];
        assert.equal(q.expected,correct,page+' calculation '+i);
        assert.equal(bank.evaluateResponse(q,String(correct)).state,'correct');
        assert.notEqual(bank.evaluateResponse(q,'').state,'correct');
        assert.notEqual(bank.evaluateResponse(q,'999999999').state,'correct');
        assert.ok(!q.prompt.includes('?'),page+' statement form');
        assert.ok(bank.explainMistake(q,'123').includes('123'),page+' answer-specific reminder');
        count++;
    });
    const recall=context.window.WrittenMethodsRecallBank;
    assert.ok(recall.correct({type:'number',expected:6000},'6,000'));
    assert.ok(!recall.correct({type:'number',expected:6},'0,06'));
    recall.build(page).forEach((q,i)=>{
        const correct=rounded(mixed[page][i]);
        assert.equal(String(q.expected),String(correct),page+' recall '+i);
        assert.ok(recall.correct(q,String(correct)));
        assert.ok(!recall.correct(q,''));
        assert.ok(!q.prompt.includes('?'));
        count++;
    });
}
console.log(`${Object.keys(expected).length} lessons: ${count} fixed questions, independently calculated answers and bank contracts passed.`);
