/* Local-only ink and typed working. Drawing is never silently treated as recognised maths. */
(() => {
    'use strict';
    const ns='http://www.w3.org/2000/svg';
    function touchesStroke(point, stroke, radius=14) {
        return stroke.some((end,index)=>{
            const start=stroke[Math.max(0,index-1)];
            const dx=end[0]-start[0],dy=end[1]-start[1];
            const lengthSquared=dx*dx+dy*dy;
            const t=lengthSquared ? Math.max(0,Math.min(1,((point[0]-start[0])*dx+(point[1]-start[1])*dy)/lengthSquared)) : 0;
            return Math.hypot(point[0]-start[0]-t*dx,point[1]-start[1]-t*dy)<=radius;
        });
    }
    function mount(sheet,paper,q,response,changed,redraw=()=>{}){
        const area=document.createElement('div');area.className='revision-working';
        if(paper){
            const b=paper.working;
            Object.assign(area.style,{left:b.left/paper.width*100+'%',top:b.top/paper.height*100+'%',width:b.width/paper.width*100+'%',height:b.height/paper.height*100+'%'});
        }
        const toolbar=document.createElement('div');toolbar.className='working-toolbar';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Working tools');
        const surface=document.createElement('div');surface.className='working-surface';
        const ink=document.createElementNS(ns,'svg');ink.setAttribute('viewBox','0 0 760 200');ink.setAttribute('preserveAspectRatio','none');ink.setAttribute('aria-hidden','true');
        const texts=document.createElement('div');texts.className='working-texts';
        surface.append(ink,texts);area.append(toolbar,surface);
        sheet.insertBefore(area,sheet.querySelector('.revision-gap'));
        let data=response.scratch || {strokes:[],texts:[]}, mode='text', active=null,
            pointTotal=data.strokes.reduce((sum,stroke)=>sum+stroke.length,0);
        // Text fields have a fixed four-line height. A short question's working
        // surface is only tall enough for that field, while a show-working
        // question has room to move it through most of the page. Keep stored
        // viewBox coordinates inside the actual surface in both cases.
        const textYLimit=q.showWorking ? 90 : 0;
        for(const item of data.texts)item.y=Math.max(0,Math.min(textYLimit,item.y));
        const history=[],buttons={};
        const snapshot=()=>JSON.stringify(data);
        // Only typed equations are assessed. Ink is saved and can be changed
        // without invalidating marks that were earned from unchanged text.
        const evidence=()=>JSON.stringify(data.texts.filter(t=>t.text.trim()).map(t=>({id:t.id,text:t.text})));
        let lastEvidence=evidence();
        function remember(value){history.push(value);if(history.length>30)history.shift();}
        function checkpoint(){remember(snapshot());}
        function save(){
            const current=evidence(),assessmentChanged=current!==lastEvidence;
            lastEvidence=current;
            response.scratch=data;
            changed(assessmentChanged);
            buttons.Undo.disabled=!history.length;
        }
        function point(e){const r=surface.getBoundingClientRect();return [Math.max(0,Math.min(760,(e.clientX-r.left)*760/r.width)),Math.max(0,Math.min(200,(e.clientY-r.top)*200/r.height))].map(n=>Math.round(n*10)/10);}
        function setMode(next){mode=next;surface.dataset.tool=next;for(const name of ['Pen','Text','Eraser'])buttons[name].setAttribute('aria-pressed',String(name.toLowerCase()===mode));}
        function button(name,run){const el=document.createElement('button');el.type='button';el.textContent=name;el.dataset.tool=name.toLowerCase();el.addEventListener('click',run);toolbar.append(el);buttons[name]=el;return el;}
        button('Pen',()=>setMode('pen'));
        button('Text',()=>{
            setMode('text');
            const existing=texts.querySelector('textarea');
            if(existing)existing.focus();
            else addText(12,12);
        });
        button('Eraser',()=>setMode('eraser'));
        button('Undo',()=>{if(history.length){data=JSON.parse(history.pop());render();save();}}).disabled=true;
        function addText(x,y){
            const empty=data.texts.find(item=>!item.text.trim());
            if(empty){texts.querySelector('[data-id="'+empty.id+'"] textarea').focus();return;}
            if(data.texts.length>=12)return;
            checkpoint();const item={id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),x:Math.min(x,390),y:Math.min(y,textYLimit),text:''};
            data.texts.push(item);render();save();texts.querySelector('[data-id="'+item.id+'"] textarea').focus();
        }
        function render(){
            pointTotal=data.strokes.reduce((sum,stroke)=>sum+stroke.length,0);
            ink.replaceChildren();texts.replaceChildren();
            data.strokes.forEach((stroke,index)=>{
                const p=document.createElementNS(ns,'path');p.setAttribute('d',stroke.map((p,i)=>(i?'L':'M')+p.join(',')).join(' '));
                p.setAttribute('fill','none');p.setAttribute('stroke','#253b43');p.setAttribute('stroke-width','2.2');p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round');p.dataset.index=index;ink.append(p);
            });
            for(const item of data.texts){
                const box=document.createElement('div');box.className='working-text';box.dataset.id=item.id;
                box.style.left=item.x/760*100+'%';box.style.top=item.y/200*100+'%';
                const move=document.createElement('button');move.className='working-text-move';move.type='button';move.textContent='Move';move.setAttribute('aria-label','Move working text; arrow keys adjust position');
                const del=document.createElement('button');del.className='working-text-delete';del.type='button';del.textContent='×';del.setAttribute('aria-label','Delete working text');
                const field=document.createElement('textarea');field.setAttribute('aria-label','Working calculations');field.placeholder='Type your working';field.value=item.text;field.maxLength=1500;field.spellcheck=false;field.wrap='off';
                let before=null;
                field.addEventListener('focus',()=>{before=snapshot();});
                field.addEventListener('input',()=>{item.text=field.value;save();});
                field.addEventListener('scroll',redraw);
                field.addEventListener('blur',()=>{if(before && before!==snapshot()){remember(before);buttons.Undo.disabled=false;}before=null;});
                del.addEventListener('click',()=>{checkpoint();data.texts=data.texts.filter(t=>t.id!==item.id);render();save();buttons.Text.focus();});
                let drag;
                move.addEventListener('pointerdown',e=>{
                    // Commit typing before recording a separate move, even
                    // though preventing pointer defaults would retain focus.
                    if(document.activeElement===field)field.blur();
                    drag={p:point(e),x:item.x,y:item.y,before:snapshot()};
                    move.setPointerCapture(e.pointerId);e.preventDefault();
                });
                const position=(x,y)=>{item.x=Math.max(0,Math.min(390,x));item.y=Math.max(0,Math.min(textYLimit,y));box.style.left=item.x/760*100+'%';box.style.top=item.y/200*100+'%';};
                move.addEventListener('pointermove',e=>{if(drag){const p=point(e);position(drag.x+p[0]-drag.p[0],drag.y+p[1]-drag.p[1]);redraw();}});
                const endMove=()=>{
                    if(!drag)return;
                    const previous=drag.before;drag=null;
                    if(previous!==snapshot()){remember(previous);save();}
                };
                move.addEventListener('pointerup',endMove);
                move.addEventListener('pointercancel',endMove);
                move.addEventListener('keydown',e=>{
                    const delta={ArrowLeft:[-5,0],ArrowRight:[5,0],ArrowUp:[0,-5],ArrowDown:[0,5]}[e.key];
                    if(!delta)return;
                    e.preventDefault();const previous=snapshot();
                    position(item.x+delta[0],item.y+delta[1]);
                    if(previous!==snapshot()){remember(previous);save();}
                });
                // The field comes first for keyboard users; CSS keeps the
                // compact Move/Delete strip visually above it.
                box.append(field,move,del);texts.append(box);
            }
        }
        let strokeBefore=null;
        surface.addEventListener('pointerdown',e=>{
            if(e.target.closest('.working-text')||e.button!==0)return;
            if(mode==='text'){addText(...point(e));return;}
            if(mode==='pen' && (data.strokes.length>=200 || pointTotal>=3999))return;
            strokeBefore=snapshot();surface.setPointerCapture(e.pointerId);e.preventDefault();
            if(mode==='pen') {active=[point(e)];data.strokes.push(active);pointTotal++;}
            else active='erase';
            draw(e);
        });
        function draw(e){
            if(!active)return;const p=point(e);
            if(active==='erase'){
                data.strokes=data.strokes.filter(stroke=>!touchesStroke(p,stroke));
                pointTotal=data.strokes.reduce((sum,stroke)=>sum+stroke.length,0);
            }
            else if(active.length<1000 && pointTotal<4000){active.push(p);pointTotal++;}
            // Redraw only the ink: never replace a focused text field while drawing.
            ink.replaceChildren();for(const s of data.strokes){const path=document.createElementNS(ns,'path');path.setAttribute('d',s.map((p,i)=>(i?'L':'M')+p.join(',')).join(' '));path.setAttribute('class','working-stroke');ink.append(path);}
        }
        surface.addEventListener('pointermove',draw);
        function end(){
            if(!active)return;
            active=null;
            if(strokeBefore!==snapshot()){remember(strokeBefore);save();}
            strokeBefore=null;
        }
        surface.addEventListener('pointerup',end);surface.addEventListener('pointercancel',end);
        if(q.calculator===true){
            button('Calculator',()=>{
                if(area.querySelector('.working-calculator'))return;
                const panel=document.createElement('div');panel.className='working-calculator';
                const title=document.createElement('button');title.textContent='Calculator · move';title.type='button';
                const input=document.createElement('input');input.setAttribute('aria-label','Calculator expression');
                const result=document.createElement('output');result.setAttribute('aria-live','polite');
                const equals=document.createElement('button');equals.type='button';equals.textContent='=';
                const close=document.createElement('button');close.type='button';close.textContent='Close';
                const calc=()=>{try{result.textContent=window.NumberRevisionMarking.calculate(input.value);}catch(e){result.textContent=e.message;}};
                equals.onclick=calc;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();calc();}};
                close.onclick=()=>{panel.remove();buttons.Calculator.focus();};
                let start;title.onpointerdown=e=>{start=[e.clientX,e.clientY,panel.offsetLeft,panel.offsetTop];title.setPointerCapture(e.pointerId);};
                const place=(x,y)=>{panel.style.left=Math.max(-100,Math.min(450,x))+'px';panel.style.top=Math.max(-80,Math.min(300,y))+'px';};
                title.onpointermove=e=>{if(start)place(start[2]+e.clientX-start[0],start[3]+e.clientY-start[1]);};title.onpointerup=()=>{start=null;};title.onpointercancel=()=>{start=null;};
                title.setAttribute('aria-label','Move calculator; arrow keys adjust position');
                title.onkeydown=e=>{const d={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(d){e.preventDefault();place(panel.offsetLeft+d[0],panel.offsetTop+d[1]);}};
                panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close.click();}});
                panel.append(title,close,input,equals,result);area.append(panel);input.focus();
            });
        }
        render();setMode('text');
        return {assess:()=>window.NumberRevisionMarking.assess(q,data.texts),hasInk:()=>data.strokes.length>0,
            hasText:()=>data.texts.some(item=>item.text.trim()),area,surface,texts};
    }
    window.NumberRevisionWorking={mount,touchesStroke};
})();
