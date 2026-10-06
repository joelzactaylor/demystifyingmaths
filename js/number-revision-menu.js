(() => {
    'use strict';
    const bank=window.NumberRevisionBank,core=window.NumberRevisionCore;
    for(const card of document.querySelectorAll('[data-revision-entry]')){
        const group=card.dataset.revisionEntry;
        if(!bank.groups[group])continue;
        const label=document.createElement('p');label.className='revision-menu-label';
        const row=document.createElement('div');row.className='revision-menu-marks';row.setAttribute('role','img');card.append(label,row);
        function update(){
            const questions=[...bank.questions.filter(q=>bank.lessons[q.lesson].group===group),...bank.problems.filter(q=>q.group===group)];
            let saved={},unavailable=false;
            try {
                const raw=localStorage.getItem('dm-number-revision-v1:'+group+':marks');
                if(raw!==null){
                    try {
                        const parsed=JSON.parse(raw);
                        if(parsed && typeof parsed==='object' && !Array.isArray(parsed))saved=parsed;
                        else unavailable=true;
                    } catch (_) { unavailable=true; }
                }
            } catch (_) { unavailable=true; }
            if(!unavailable && questions.some(q=>Object.hasOwn(saved,q.id) && !core.markRecord(saved[q.id],q)))unavailable=true;
            let attempted=0,verified=0,totalMarks=0,review=0,missing=0;row.replaceChildren();
            for(const [index,q] of questions.entries()){
                const r=!unavailable && core.markRecord(saved[q.id],q),valid=!!r;
                const needsReview=valid && r.unassessed>0;
                const missingWorking=valid && r.missingWorking;
                if(valid)attempted++;
                if(valid)verified+=r.earned;
                if(needsReview)review++;
                if(missingWorking)missing++;
                totalMarks+=q.marks;
                const name=q.title || bank.lessons[q.lesson].title+' '+(q.variant+1);
                const description='Question '+(index+1)+' · '+name+': '+(unavailable?'saved progress unavailable':valid?r.earned+' of '+q.marks+' '+(q.marks===1?'mark':'marks')+' verified on last check'+(needsReview?' · working needs review':missingWorking?' · required working missing':''):'not attempted');
                const box=document.createElement('span');box.className='revision-menu-box';box.title=description;box.setAttribute('aria-hidden','true');
                for(let i=0;i<q.marks;i++){const part=document.createElement('i');if(valid && i<r.earned)part.className='earned';box.append(part);}
                if(valid && r.earned===0)box.classList.add('attempted');row.append(box);
            }
            label.textContent=unavailable?'Saved progress unavailable':questions.length ? attempted+' / '+questions.length+' attempted' : '';
            label.hidden=!questions.length;row.hidden=!questions.length;
            row.setAttribute('aria-label',unavailable?'Saved progress unavailable.':attempted+' of '+questions.length+' questions attempted; '+verified+' of '+totalMarks+' marks verified on their latest checks.'+(review?' '+review+' '+(review===1?'question has':'questions have')+' working that needs review.':'')+(missing?' '+missing+' '+(missing===1?'question is':'questions are')+' missing required working.':''));
        }
        update();window.addEventListener('storage',update);window.addEventListener('pageshow',update);
    }
})();
