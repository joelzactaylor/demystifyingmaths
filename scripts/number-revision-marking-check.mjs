import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context=vm.createContext({window:{}});
vm.runInContext(readFileSync('js/number-revision-marking.js','utf8'),context);
const m=context.window.NumberRevisionMarking;
vm.runInContext(readFileSync('js/number-revision-bank.js','utf8'),context);
for(const q of [...context.window.NumberRevisionBank.questions,...context.window.NumberRevisionBank.problems]){
    assert.equal(m.schemes[q.id]?.length||0,q.marks-1,q.id+': missing method criteria');
    assert.equal(q.showWorking,q.marks>1);
}
for(const [id,rules] of Object.entries(m.schemes)){
    for(const alternatives of rules)for(const equation of alternatives){
        const [lhs,rhs]=equation.split('=');
        // Independent bounded arithmetic check of authored constants.
        const allowed=lhs.replace(/sqrt\((\d+)\)/g,(_,n)=>String(Math.sqrt(Number(n)))).replace(/\^/g,'**');
        assert(/^[\d.()+*/ -]+$/.test(allowed));
        assert(/^[\d.()+*/ -]+$/.test(rhs));
        assert(Math.abs(vm.runInNewContext(allowed)-vm.runInNewContext(rhs))<1e-10,equation);
    }
    const texts=rules.map((r,i)=>({id:'t'+i,text:r[0]}));
    assert.equal(m.assess({id},texts).hits.length,rules.length);
    assert.equal(m.assess({id},texts.map(t=>({...t,text:'1+1=2'}))).hits.length,0,'Unrelated working earned a mark');
    assert.equal(m.assess({id},[]).hits.length,0);
}
const square = text => m.assess({id:'pr-square'},[{id:'example',text}]);
assert.equal(square('144 =12^2\n\np = 12x4=48').hits.length,1);
assert.equal(square('144 =12²').hits[0].row,0);
assert.equal(square('12*12=145').hits.length,1,'Arithmetic slip must retain method credit');
assert.equal(square('140+4=144').hits.length,0,'Matching a value is not matching a method');
assert.equal(square('alert(144)').hits.length,0);
assert.equal(square('1 2 × 1 2 = 144').hits.length,0,'Whitespace joined separate numbers');
assert.equal(square('12.0000000000000001 × 12 = 144').hits.length,0,'Floating-point rounding changed an operand');
assert.equal(square('012.000 × 12. = 144').hits.length,1,'Equivalent decimal notation rejected');
assert.equal(square('-12^2=144').hits.length,0,'Unary minus must not become a squared factor');
assert.equal(square('').finalEligible,false);
assert.equal(square('sqrt(144)=12').finalCode,'A1');
assert.equal(square('√144 = 12').hits.length,1,'Root symbol was not recognised');
assert.equal(square('√(144) = 12').hits.length,1);
assert.equal(square('12 cm × 12 cm = 144 cm²').hits.length,1,'Valid square working with units was rejected');
assert.equal(square('√(140 + 4) = 12').hits.length,0,'Unsupported root expression should not be guessed');
const tickets=text=>m.assess({id:'wm-tickets'},[{id:'combined',text}]);
assert.equal(tickets('450 - (18 × 12.50 + 24 × 7.75) = 39').hits.length,2,'Combined method lost working marks');
assert.equal(tickets('450 - (18 × 12.50 + 24 × 7.75) = 40').hits.length,2,'Arithmetic slip lost valid methods');
assert.equal(tickets('450 - (18 + 12.50 + 24 + 7.75) = 39').hits.length,0,'Wrong operations earned marks');
assert.equal(tickets('Adults: 18 × £12.50 = £225.\nChildren: 24 × £7.75 = £186.').hits.length,2,'The displayed solution notation was rejected');
assert.equal(tickets('18 × $12.50 = $225').hits.length,0,'Unsupported currency was silently stripped');
assert.equal(m.assess({id:'wm-packs'},[{id:'units',text:'£360 / 24 = £15'}]).hits.length,0,'Pounds were mistaken for pence');
assert.equal(m.assess({id:'wm-packs'},[{id:'units',text:'360p / 24 = 15p'}]).hits.length,1,'Valid pence working was rejected');
assert.equal(m.assess({id:'columnAddition:1'},[{id:'units',text:'2.75m + 0.86m = 3.61m'}]).hits.length,1,'Valid length working was rejected');
assert.equal(square('12 kg × 12 kg = 144 kg²').hits.length,0,'An unauthorised unit was silently stripped');
assert.equal(m.assess({id:'wm-bottles'},[{id:'commas',text:'1,800 ÷ 75 = 24'}]).hits.length,1,'Valid thousands separators rejected');
assert.equal(m.assess({id:'wm-bottles'},[{id:'commas',text:'1,80 ÷ 75 = 24'}]).hits.length,0,'Malformed thousands separator was accepted');
assert.equal(m.assess({id:'longDivision:1'},[{id:'division',text:'2 × 24 = 48'}]).hits.length,1,'Valid quotient-digit step rejected');
assert.equal(m.assess({id:'longDivision:0'},[{id:'division',text:'5 × 16 = 80'}]).hits.length,1);
for(const text of ['19 ÷ 8 = 2 remainder 3','19 / 8 = 2 r 3','30 ÷ 8 = 3 rem 6']){
    assert.equal(m.assess({id:'shortDivision:1'},[{id:'remainder',text}]).hits.length,1,'Remainder notation rejected: '+text);
}
assert.equal(m.assess({id:'shortDivision:1'},[{id:'remainder',text:'19 ÷ 8 = 3 remainder 2'}]).hits.length,0);
for(const id of Object.keys(m.schemes)){
    assert(m.assess({id},[]).criteria.every(c=>c.description && !c.description.startsWith('Method:')),'Missing a learner-facing criterion: '+id);
}
assert.equal(m.calculate('(12.5 + 7.75) * 2'),40.5);
for(const expr of ['alert(1)','1/0','2**3','1;2','Math.random()'])assert.throws(()=>m.calculate(expr));
console.log(Object.keys(m.schemes).length+' authored working schemes and restricted calculator grammar passed.');
