// Print the curriculum progress catalogue; no page generation or dependencies.
// Redirecting this generated data is safe; lesson HTML is never written here.
import {readdirSync,readFileSync} from "node:fs";
import {join} from "node:path";
const root="pages/curriculum";
const files=readdirSync(root,{recursive:true}).filter(p=>p.endsWith(".html")).sort();
const lessons={};
const menus=[];
for(const relative of files){
 const html=readFileSync(join(root,relative),"utf8"),path="/"+root+"/"+relative;
 if(relative.endsWith("index.html")) menus.push(path.replace(/index\.html$/,""));
 else if(!/(?:^|\/)practice[^/]*\.html$/.test(relative) && /class="lesson-main\b/.test(html))
 lessons[path]={written:!html.includes("&mdash;coming soon&mdash;")};
}
console.log(JSON.stringify({version:1,lessons,menus},null,2));
