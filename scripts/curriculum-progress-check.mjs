// Storage and catalogue regression checks; Node built-ins only.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {runInNewContext} from "node:vm";

const catalog=JSON.parse(readFileSync("js/curriculum-progress-catalog.json","utf8"));
assert.deepEqual(catalog,JSON.parse(execFileSync(process.execPath,["scripts/curriculum-progress-catalog.mjs"],{encoding:"utf8"})),"Refresh the progress catalogue after publishing lessons");
const storage=new Map();
const context={window:{},location:{href:"https://example.test/demystifyingmaths/pages/curriculum/"},URL,
 localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
 document:{readyState:"loading",createElement:()=>({}),head:{appendChild(){}},addEventListener(){}}};
runInNewContext(readFileSync("js/curriculum-progress.js","utf8"),context);
const api=context.window.CurriculumProgress;
const folder="/pages/curriculum/GCSE/number/structure/powersAndRoots/";
const page=folder+"indexNotation.html";
assert.equal(api.normalise("/demystifyingmaths"+folder+"index.html#x"),folder);
assert.equal(api.read(page).complete,false);
api.record(page,1,8);
assert.equal(api.read(page).done,1);
assert.equal(api.read(page).complete,false);
api.record(page,8,8);
assert.equal(api.read(page).complete,true);
api.record(page,9,8);
assert.equal(api.read(page).done,8,"Ignore invalid counts");
storage.set("dm-index-notation-accepted-v1",JSON.stringify({"0:0":"5"}));
assert.equal(api.read(page).done,1,"Actual accepted answers take precedence");
for(const [name,key,answers] of [
 ["indexNotation","index-notation",[5,4,27,32,49,125,3,2]],
 ["recognisingPowers","recognising-powers",[11,5,5,4,3,2,4,5]],
 ["squareRoots","square-roots",[8,12,14,15,.3,.06,.8,0]],
 ["positiveAndNegativeRoots","roots",[-5,64,6,-6,-8,-11,1,0,9,2]],
 ["cubeAndHigherRoots","cube-roots",[5,10,-4,-2,3,2,-2,0]]
]){
 const saved=Object.fromEntries(answers.map((v,i)=>[Math.floor(i/2)+":"+i%2,String(v)]));
 storage.set("dm-"+key+"-accepted-v1",JSON.stringify(saved));
 assert.equal(api.read(folder+name+".html").complete,true,name+" existing answers");
}
const other="/pages/curriculum/other.html";
storage.set("dm-curriculum-v1:"+other,"{broken");
assert.equal(api.read(other).done,0);
storage.set("dm-curriculum-v1:"+other,JSON.stringify({done:-1,total:2}));
assert.equal(api.read(other).done,0);
context.localStorage.setItem=()=>{throw Error("Unavailable")};
context.localStorage.getItem=()=>{throw Error("Unavailable")};
api.record(other,2,2);
assert.equal(api.read(other).complete,true,"Session works without storage");
console.log(Object.keys(catalog.lessons).length+" lessons and "+catalog.menus.length+" menus: catalogue, storage validation, migration and unavailable-storage checks passed.");
