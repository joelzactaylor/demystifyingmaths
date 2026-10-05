/* Local-only, versioned progress. Completion comes from answers, never visits.
   Per-lesson records avoid unrelated tabs overwriting one another. */
(() => {
    "use strict";
    if (window.CurriculumProgress) return;
    const BASE = "/demystifyingmaths";
    const PREFIX = "dm-curriculum-v1:";
    const normalise = url => new URL(url, location.href).pathname.replace(/^\/demystifyingmaths(?=\/)/, "").replace(/\/index\.html$/, "/");
    const here = normalise(location.href);
    const folder = "/pages/curriculum/GCSE/number/structure/powersAndRoots/";
    const legacy = {
        indexNotation: ["index-notation",[5,4,27,32,49,125,3,2]],
        recognisingPowers: ["recognising-powers",[11,5,5,4,3,2,4,5]],
        squareRoots: ["square-roots",[8,12,14,15,.3,.06,.8,0]],
        positiveAndNegativeRoots: ["roots",[-5,64,6,-6,-8,-11,1,0,9,2]],
        cubeAndHigherRoots: ["cube-roots",[5,10,-4,-2,3,2,-2,0]]
    };
    const memory = new Map();
    let storageAvailable = true, catalog = null;
    try { const k=PREFIX+"test"; localStorage.setItem(k,"1"); localStorage.removeItem(k); }
    catch (_) { storageAvailable=false; }
    const get = key => { try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; } };
    const read = path => {
        const name = path.startsWith(folder) ? path.slice(folder.length).replace(/\.html$/,"") : "";
        if (legacy[name]) {
            const [key, answers] = legacy[name];
            const saved = get("dm-"+key+"-accepted-v1");
            if (saved && typeof saved === "object") {
                const done = answers.filter((answer,i) => {
                    const v=saved[Math.floor(i/2)+":"+i%2];
                    return typeof v === "string" && v.trim() !== "" && Number(v.replace(/−/g,"-"))===answer;
                }).length;
                return {done,total:answers.length,complete:done===answers.length};
            }
        }
        const saved = get(PREFIX+path) || memory.get(path);
        if (!saved || !Number.isInteger(saved.done) || !Number.isInteger(saved.total) || saved.total < 1 || saved.done < 0 || saved.done > saved.total)
            return {done:0,total:legacy[name]?.[1].length || 1,complete:false};
        return {...saved,complete:saved.done===saved.total};
    };
    const record = (path, done, total) => {
        if (!Number.isInteger(done)||!Number.isInteger(total)||total<1||done<0||done>total) return;
        const existing=get(PREFIX+path) || memory.get(path);
        if(existing?.done===done && existing?.total===total)return;
        const value={done,total};
        memory.set(path,value);
        try { localStorage.setItem(PREFIX+path,JSON.stringify(value)); }
        catch (_) { storageAvailable=false; }
        render();
    };
    const reset = () => {
        memory.delete(here);
        try { localStorage.removeItem(PREFIX+here); } catch (_) {}
    };
    window.CurriculumProgress={read,record,normalise};
    const css=document.createElement("link"); css.rel="stylesheet"; css.href=BASE+"/css/curriculum-progress.css"; document.head.appendChild(css);

    const themes = {
        powersAndRoots:["#5146bd","#f1effc"],writtenMethods:["#096f78","#eaf7f7"],
        directedNumber:["#a13e59","#fff0f4"],factorsAndPrimes:["#306c39","#eef7ed"],
        indexLaws:["#a04c16","#fff3e8"],workingInStandardForm:["#245ca3","#edf4ff"],
        usingACalculator:["#65511e","#faf5e5"],surds:["#7946a1","#f6effb"]
    };
    const theme = path => {
        const slug=path.replace(/\/$/,"").split("/").pop();
        if(themes[slug])return themes[slug];
        let h=0;for(const c of slug)h=(h*31+c.charCodeAt(0))>>>0;
        return ["hsl("+(h%360)+" 48% 33%)","hsl("+(h%360)+" 45% 96%)"];
    };
    const applyTheme=(element,path)=>{
        const [accent,soft]=theme(path);
        element.style.setProperty("--topic-accent",accent);
        element.style.setProperty("--topic-soft",soft);
    };
    const leaves = path => catalog ? Object.keys(catalog.lessons).filter(p=>p.startsWith(path)) : [];
    function render() {
        if(!catalog)return;
        document.querySelectorAll("a.topic-card").forEach(card=>{
            const path=normalise(card.href);
            if(!path.startsWith("/pages/curriculum/"))return;
            const menu=catalog.menus.includes(path);
            const lesson=Object.hasOwn(catalog.lessons,path);
            const review=/\/practice[^/]+\.html$/.test(path);
            if(!menu&&!lesson&&!review)return;
            const children=menu?leaves(path):[];
            const state=menu?{done:children.filter(p=>read(p).complete).length,total:children.length}:read(path);
            const complete=state.total>0&&state.done===state.total;
            let block=card.querySelector(".card-progress");
            if(!block){
                block=document.createElement("span");block.className="card-progress";
                const label=document.createElement("span");label.className="card-progress__label";
                const bar=document.createElement("progress");block.append(label,bar);card.appendChild(block);
            }
            const title=card.querySelector("h3")?.textContent.trim()||"Lesson";
            const text=menu ? (state.total ? state.done+" / "+state.total+" lessons completed":"Lessons coming soon")
                : lesson && !catalog.lessons[path].written ? "Coming soon"
                : complete ? (review?"Review completed":"Completed")
                : state.done ? state.done+" / "+state.total+" answered"
                : review?"Optional review":"Not started";
            block.querySelector("span").textContent=text;
            const bar=block.querySelector("progress");
            bar.max=state.total||1;bar.value=state.done;
            bar.setAttribute("aria-label",title+": "+text);
            card.classList.toggle("is-lesson-complete",complete);
            if(menu)applyTheme(card,path);
        });
        const summary=document.querySelector("[data-progress-summary]");
        if(summary){
            const ordered=[...document.querySelectorAll("a.topic-card")].map(a=>normalise(a.href)).filter(p=>Object.hasOwn(catalog.lessons,p));
            const paths=ordered.length?ordered:leaves(here),done=paths.filter(p=>read(p).complete).length;
            summary.textContent=done+" / "+paths.length+" lessons completed";
            const bar=document.querySelector("[data-topic-progress]");
            if(bar){bar.max=paths.length||1;bar.value=done;bar.setAttribute("aria-label",summary.textContent);}
            const next=paths.find(p=>!read(p).complete);
            const resume=document.querySelector("[data-resume-lesson]");
            if(resume){
                const supported=next && /\/structure\/(?:writtenMethods|powersAndRoots)\//.test(next);
                const session=next && get("dm-lesson-session-v1:"+BASE+next);
                const returning=supported && (read(next).done>0 || session?.started===true);
                resume.href=BASE+(next||paths[0])+(returning?"?resume=1":"");
                resume.textContent=done===paths.length?"Revisit the lessons":returning?"Pick up where you left off":paths.some(p=>read(p).done)?"Continue learning":"Start learning";
            }
        }
        document.querySelectorAll("[data-local-progress-note]").forEach(note=>{
            note.hidden=false;
            note.textContent=storageAvailable?"Saved in this browser. Clearing browser data resets progress.":"This browser can't save progress. Your answers still work, but won't survive a reload.";
        });
    }
    async function start(){
        const main=document.querySelector("main");
        if(!main)return;
        const topic=here.endsWith("/")?here:here.slice(0,here.lastIndexOf("/")+1);
        if(topic.split("/").filter(Boolean).length>=7){
            applyTheme(document.body,topic);document.body.classList.add("has-curriculum-theme");
            if(main.classList.contains("curriculum-main"))document.body.classList.add("subtopic-menu");
        }
        const roots=[...main.querySelectorAll("[data-lesson-check]")];
        if(roots.length){
            const sync=()=>{
                const done=roots.reduce((n,r)=>n+r.querySelectorAll(".lesson-check__turn.is-correct").length,0);
                const total=roots.length*2;
                if (main.dataset.lessonCheckApi === 'WrittenMethodsLessonBank') record(here,done,total);
                else if(done>0)record(here,Math.max(done,read(here).done),total);
            };
            roots.forEach(root=>new MutationObserver(sync).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]}));
            sync();
            document.addEventListener("click",e=>{if(e.target.closest(".roots-reset"))reset();},true);
        }
        document.addEventListener("curriculumreviewprogress",e=>{
            const previous=read(here);
            if(previous.complete)return;
            record(here,Math.max(e.detail.done,previous.total===e.detail.total?previous.done:0),e.detail.total);
        });
        try {
            const response=await fetch(BASE+"/js/curriculum-progress-catalog.json");
            if(!response.ok)throw Error("Catalogue unavailable");
            catalog=await response.json();
            render();
        } catch (_) {
            document.querySelectorAll("[data-progress-summary]").forEach(e=>e.textContent="Progress unavailable");
        }
        addEventListener("storage",render);addEventListener("pageshow",render);
    }
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
