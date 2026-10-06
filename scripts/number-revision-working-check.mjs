import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const context=vm.createContext({window:{}});
vm.runInContext(readFileSync('js/number-revision-working.js','utf8'),context);
const {touchesStroke}=context.window.NumberRevisionWorking;

assert(touchesStroke([100,50],[[0,50],[200,50]]),'Erase the middle of a fast stroke');
assert(touchesStroke([100,100],[[0,0],[200,200]]),'Erase diagonal segments');
assert(touchesStroke([10,10],[[10,10]]),'Erase a single dot');
assert(touchesStroke([100,64],[[0,50],[200,50]]),'Include the eraser boundary');
assert(!touchesStroke([100,65],[[0,50],[200,50]]),'Do not erase neighbouring ink');
assert(!touchesStroke([220,50],[[0,50],[200,50]]),'Do not extend a segment beyond its end');
assert(!touchesStroke([0,0],[]));
console.log('Working tools: segment, endpoint, dot and eraser-boundary checks passed.');
