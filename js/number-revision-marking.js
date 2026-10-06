/* Conservative, authored method checks. Unrecognised working is not wrong working. */
(() => {
    'use strict';
    const schemes = {
        'columnAddition:0': [['8+6=14','6+7+1=14']],
        'columnAddition:1': [['2.75+0.86=3.61','0.86+1.4=2.26','2.75+1.4=4.15']],
        'columnSubtraction:0': [['10-6=4','11-8=3']],
        'columnSubtraction:1': [['9.25-3.8=5.45']],
        'exchangingAcrossZeros:0': [['10-8=2','10-6=4']],
        'exchangingAcrossZeros:1': [['30-17.85=12.15']],
        'longMultiplication:0': [['208*30=6240','208*4=832']],
        'longMultiplication:1': [['36*20=720','36*4=144','24*30=720','24*6=144']],
        'multiplyingDecimals:0': [['14*6=84']],
        'multiplyingDecimals:1': [['32*15=480','3.2*1.5=4.8']],
        'shortDivision:0': [['24/3=8','9/3=3']],
        'shortDivision:1': [['19=8*2+3','30=8*3+6']],
        'interpretingRemainders:0': [['53=8*6+5','8*6=48','53/8=6.625']],
        'interpretingRemainders:1': [['53=8*6+5','8*6=48','53/8=6.625']],
        'longDivision:0': [['24-16=8','84-80=4','16*100=1600','16*50=800','16*5=80','16*3=48']],
        'longDivision:1': [['61-48=13','132-120=12','24*2=48','24*5=120']],
        'dividingByDecimals:0': [['630/15=42']],
        'dividingByDecimals:1': [['4.2/0.35=12','420/35=12']],
        'wm-tickets': [['18*12.5=225','12.5*18=225'], ['24*7.75=186','7.75*24=186']],
        'wm-bottles': [['18/0.75=24','1800/75=24'], ['24/5=4.8','5*4=20','4*5=20']],
        'wm-rope': [['8*1.35=10.8','1.35*8=10.8']],
        'wm-packs': [['360/24=15','3.6/24=0.15'], ['420/30=14','4.2/30=0.14']],
        'pr-square': [['12*12=144','144^0.5=12','sqrt(144)=12']],
        'pr-cube': [['8*8=64','sqrt(64)=8','64^0.5=8']],
        'pr-solutions': [['9-(-9)=18','9+9=18','2*9=18']],
        'pr-powers': [['2^6=64','2*2*2*2*2*2=64'], ['4^3=64','4*4*4=64']]
    };
    const normalize = value => String(value).toLowerCase().replace(/^[a-z ]+:/,'')
        .replace(/[×x]/g,'*').replace(/÷/g,'/').replace(/[−–]/g,'-').replace(/²/g,'^2').replace(/³/g,'^3')
        .replace(/\s/g,'').replace(/(?:\d*\.\d+|\d+)/g,n=>{const [w,f='']=n.split('.');const whole=w.replace(/^0+/,'')||'0',fraction=f.replace(/0+$/,'');return whole+(fraction?'.'+fraction:'');});
    // Compare operations, not just their numerical results: 6+6 is not evidence
    // of squaring 12. Products are commutative; square notation is equivalent
    // to multiplying two equal factors. No learner text is executed.
    function expression(source) {
        const s = normalize(source);
        let i = 0;
        function node(op, children) {
            if (op === '*' || op === '+') {
                children = children.flatMap(child => child.op === op ? child.children : [child]);
                children.sort((a, b) => a.key.localeCompare(b.key));
            }
            return {op, children, key: op + '(' + children.map(child => child.key).join(',') + ')'};
        }
        function atom() {
            if (s[i] === '√') {
                i++;
                return node('sqrt', [atom()]);
            }
            if (s.startsWith('sqrt(', i)) {
                i += 5;
                const value = sum();
                if (s[i++] !== ')') throw Error('Incomplete root');
                return node('sqrt', [value]);
            }
            if (s[i] === '(') {
                i++;
                const value = sum();
                if (s[i++] !== ')') throw Error('Incomplete bracket');
                return value;
            }
            const number = s.slice(i).match(/^(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d*)?|\.\d+)/);
            if (!number) throw Error('Unsupported expression');
            i += number[0].length;
            // Keep decimal digits exact; Number() would round a near miss
            // such as 12.0000000000000001 into the required operand 12.
            return {key: number[0].replace(/,/g, '').replace(/\.$/, '')};
        }
        function power() {
            const base = atom();
            if (s[i] !== '^') return base;
            i++;
            const exponent = unary();
            if (exponent.key === '2' || exponent.key === '3') return node('*', Array(Number(exponent.key)).fill(base));
            if (exponent.key === '0.5') return node('sqrt', [base]);
            return node('^', [base, exponent]);
        }
        function unary() {
            if (s[i] === '-') { i++; return node('-', [unary()]); }
            if (s[i] === '+') { i++; return unary(); }
            return power();
        }
        function product() {
            let value = unary();
            while (s[i] === '*' || s[i] === '/') value = node(s[i++], [value, unary()]);
            return value;
        }
        function sum() {
            let value = product();
            while (s[i] === '+' || s[i] === '-') value = node(s[i++], [value, product()]);
            return value;
        }
        if (s.length > 200) return null;
        try {
            const result = sum();
            return i === s.length ? result : null;
        } catch { return null; }
    }
    // Compile authored evidence once; parse each learner line once per check.
    const expectedOperations = Object.fromEntries(Object.entries(schemes).map(([id,rules])=>[
        id, rules.map(alternatives=>new Set(alternatives.flatMap(eq=>eq.split('=').map(expression)).filter(part=>part?.op).map(part=>part.key)))
    ]));
    function operationsIn(part) {
        if (!part?.op) return [];
        if (part.op === '-' && part.children.length === 1) return [part.key];
        return [part.key, ...part.children.flatMap(operationsIn)];
    }
    const poundWorking=new Set(['wm-tickets','multiplyingDecimals:1','exchangingAcrossZeros:1']);
    const metricWorking=new Set(['columnAddition:1','columnSubtraction:1','dividingByDecimals:1','wm-rope','pr-square']);
    function workingLines(q, texts) {
        return texts.flatMap(box=>box.text.split('\n').flatMap((line,row)=>{
            // Whitespace must not join two separate numbers into a new one.
            if (/\d\s+\d/.test(line)) return [];
            // Only strip pound labels where the authored operations are all
            // in pounds. Mixed pound/pence questions need unit-aware evidence.
            if(poundWorking.has(q.id))line=line.replace(/£\s*(?=\d|\.)/g,'');
            if(metricWorking.has(q.id))line=line.replace(/(^|[^a-z])(?:cm|m)(?:²|\^2)?(?=\s|$|[=+*/×÷().,−-])/gi,'$1');
            if(q.id==='wm-packs')line=line.replace(/(^|[^a-z])p(?=\s|$|[=+*/×÷().,−-])/gi,'$1');
            let equation=normalize(line).replace(/^[a-z]+=/, '');
            const remainder=equation.match(/^(\d+)\/(\d+)=(\d+)(?:remainder|rem|r)(\d+)$/);
            if(remainder){
                const [,dividend,divisor,quotient,left]=remainder;
                equation=dividend+'='+divisor+'*'+quotient+'+'+left;
            }
            const parts=equation.split('=');
            return [{id:box.id,row,operations:parts.map(expression).flatMap(operationsIn)}];
        }));
    }
    function assess(q, texts) {
        const rules = schemes[q.id] || [], hits = [], lines=workingLines(q,texts);
        for (const [criterion,expected] of (expectedOperations[q.id] || []).entries()) {
            const hit=lines.find(line=>line.operations.some(key=>expected.has(key)));
            if(hit)hits.push({id:hit.id,row:hit.row,code:'M1',criterion});
        }
        const descriptions = {
            'columnAddition:0': ['Add a column and account for the carried amount.'],
            'columnAddition:1': ['Add two of the lengths as an intermediate step.'],
            'columnSubtraction:0': ['Subtract a column after exchanging.'],
            'columnSubtraction:1': ['Subtract the remaining length from the original length.'],
            'exchangingAcrossZeros:0': ['Subtract a column after exchanging through the zero.'],
            'exchangingAcrossZeros:1': ['Subtract the purchase price from £30.'],
            'longMultiplication:0': ['Calculate a partial product using the place value of a digit.'],
            'longMultiplication:1': ['Split a factor and calculate a partial product.'],
            'multiplyingDecimals:0': ['Multiply the corresponding whole numbers before scaling.'],
            'multiplyingDecimals:1': ['Multiply the length by the price per metre.'],
            'shortDivision:0': ['Divide a place-value amount by 3.'],
            'shortDivision:1': ['Find a quotient digit and its remainder.'],
            'interpretingRemainders:0': ['Divide the number of jars by the capacity of a box.'],
            'interpretingRemainders:1': ['Find how many complete groups of 8 fit into 53.'],
            'longDivision:0': ['Use a multiple of 16 or subtract it at a division step.'],
            'longDivision:1': ['Use a multiple of 24 or subtract it at a division step.'],
            'dividingByDecimals:0': ['Scale both numbers equally to make the divisor whole.'],
            'dividingByDecimals:1': ['Divide the total length by the length of each piece.'],
            'pr-square': ['Find the side length from the area.'],
            'pr-cube': ['Find how many cubes fit along a side of the new square.'],
            'pr-solutions': ['Find the distance between the two roots.'],
            'pr-powers': ['Evaluate the power of 2.', 'Evaluate the power of 4.'],
            'wm-tickets': ['Calculate the adult ticket cost.', 'Calculate the child ticket cost.'],
            'wm-bottles': ['Find the number of bottles.', 'Find the number of full boxes.'],
            'wm-rope': ['Calculate the total length cut off.'],
            'wm-packs': ['Find the cost per pencil in the first pack.', 'Find the cost per pencil in the second pack.']
        };
        const criteria = rules.map((alternatives, index) => ({
            code: 'M1',
            description: descriptions[q.id]?.[index] || 'Method: '+alternatives[0].split('=').find(part=>expression(part)?.op).replace(/\*/g,' × ').replace(/\//g,' ÷ ')+' (or equivalent).',
            earned: hits.some(hit => hit.criterion === index)
        }));
        return {hits, criteria, available:rules.length, supported:!!schemes[q.id], finalCode: rules.length ? 'A1' : 'B1', finalEligible: hits.length === rules.length};
    }
    // Small arithmetic grammar for the optional calculator. Never execute user code.
    function calculate(source) {
        const s=String(source).replace(/\s/g,'').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
        if(s.length>120)throw Error('Calculation is too long.');
        let i=0;
        function atom(){
            if(s[i]==='+'){i++;return atom();} if(s[i]==='-'){i++;return -atom();}
            if(s[i]==='('){i++;const n=sum();if(s[i++]!==')')throw Error('Close the bracket.');return n;}
            const m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error('Enter a calculation.');i+=m[0].length;return Number(m[0]);
        }
        function product(){let n=atom();while(s[i]==='*'||s[i]==='/'){const op=s[i++],b=atom();n=op==='*'?n*b:n/b;}return n;}
        function sum(){let n=product();while(s[i]==='+'||s[i]==='-'){const op=s[i++],b=product();n=op==='+'?n+b:n-b;}return n;}
        const n=sum();if(i!==s.length||!Number.isFinite(n))throw Error('Check the calculation.');return Number(n.toPrecision(12));
    }
    window.NumberRevisionMarking={assess,calculate,schemes};
})();
