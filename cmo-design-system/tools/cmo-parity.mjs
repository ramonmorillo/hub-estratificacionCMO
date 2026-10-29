// Arnés de paridad clínica para migraciones visuales del CMO Design System.
// Misma semilla → mismas interacciones en la versión ANTERIOR y la NUEVA; compara textContent de <main>,
// valores de todos los campos y localStorage (fechas normalizadas). Además: axe, desbordamiento y capturas.
// Uso: node cmo-parity.mjs <raízAnterior> <raízNueva> <basePath> <axe.min.js> <dirCapturas> [semillas=25] [selectoresClic separados por |]
// Valide siempre el arnés con una mutación clínica controlada (p. ej. un umbral) antes de confiar en un 25/25.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import {createRequire} from 'node:module';
const require=createRequire(import.meta.url); const {chromium}=require('playwright');
const [RB,RA,BASE,AXE,SHOTS,SEEDS='25',CLICK='']=process.argv.slice(2);
const T={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
function serve(root){return new Promise(r=>{const s=http.createServer((q,res)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(!u.startsWith(BASE)){res.writeHead(404);return res.end()}u=u.slice(BASE.length)||'index.html';const f=path.join(root,u);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end()}res.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res)}).listen(0,()=>r(s))})}
const b=await chromium.launch(); const sb=await serve(RB), sa=await serve(RA);
const url=s=>`http://127.0.0.1:${s.address().port}${BASE}`;
async function run(srv,seed){
  const ctx=await b.newContext({viewport:{width:1280,height:900}}); const p=await ctx.newPage(); const errs=[],ext=[];
  p.on('pageerror',e=>errs.push(String(e))); p.on('dialog',d=>d.accept()); p.on('request',r=>{if(!r.url().startsWith(url(srv)))ext.push(r.url())});
  await p.goto(url(srv)); await p.waitForTimeout(150);
  const snap=await p.evaluate(async ({seed,CLICK})=>{
    let x=seed*2654435761%4294967296||1; const rnd=()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296};
    const fire=e=>{e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    for(let pass=0;pass<2;pass++){ // 2 pasadas: campos que aparecen dinámicamente
      for(const el of document.querySelectorAll('main select, main input, main textarea')){
        if(el.disabled||el.type==='file'||el.type==='hidden'||el.closest('[hidden]'))continue;
        if(el.tagName==='SELECT'&&el.options.length){el.selectedIndex=Math.floor(rnd()*el.options.length);fire(el)}
        else if(el.type==='checkbox'||el.type==='radio'){if(rnd()<.4){el.checked=true;fire(el)}}
        else if(el.type==='number'){el.value=String(Math.floor(rnd()*20));fire(el)}
        else if(el.type==='date'){el.value='2026-01-15';fire(el)}
        else if(el.tagName==='TEXTAREA'){}
        else {el.value='T'+Math.floor(rnd()*1000);fire(el)}
      }
      await sleep(30);
    }
    if(CLICK){for(const sel of CLICK.split('|')){const e=document.querySelector(sel);if(e){e.click();await sleep(60)}}}
    const vals=[...document.querySelectorAll('main select, main input, main textarea')].map(e=>e.type==='checkbox'||e.type==='radio'?e.checked:e.value);
    const norm=s=>s.replace(/\d{1,2}\/\d{1,2}\/\d{4},?\s*\d{1,2}:\d{2}(:\d{2})?/g,'<FECHA>').replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g,'<ISO>').replace(/\s+/g,' ');
    return {text:norm(document.querySelector('main').textContent),vals,ls:Object.keys(localStorage).sort().map(k=>k+'='+norm(localStorage.getItem(k)).replace(/"(id|createdAt|updatedAt|savedAt|exportedAt)":"[^"]*"/g,'"$1":"*"'))};
  },{seed,CLICK});
  await ctx.close(); return {...snap,errs,ext};
}
let diff=0,errs=0,ext=new Set(),sample=null;
for(let s=1;s<=+SEEDS;s++){const A=await run(sb,s),B=await run(sa,s);
  const same=A.text===B.text&&JSON.stringify(A.vals)===JSON.stringify(B.vals)&&JSON.stringify(A.ls)===JSON.stringify(B.ls);
  if(!same){diff++; if(!sample){const i=[...A.text].findIndex((c,j)=>c!==B.text[j]);sample={seed:s,before:A.text.slice(Math.max(0,i-80),i+120),after:B.text.slice(Math.max(0,i-80),i+120),valsEq:JSON.stringify(A.vals)===JSON.stringify(B.vals),lsEq:JSON.stringify(A.ls)===JSON.stringify(B.ls)}}}
  errs+=B.errs.length; B.ext.forEach(u=>ext.add(u)); if(s===1)console.log('muestra semilla 1: textlen',B.text.length,'| valores',B.vals.length,'| localStorage',B.ls.length);
}
console.log(`PARIDAD: ${+SEEDS-diff}/${SEEDS} semillas idénticas`); if(sample)console.log('primera diferencia',JSON.stringify(sample,null,1));
console.log('errores JS (after):',errs,'| peticiones externas (after):',[...ext]);
const out={};
for(const [label,srv] of [['before',sb],['after',sa]]) for(const [w,n] of [[1280,'desktop'],[375,'mobile']]){
  const p=await (await b.newContext({viewport:{width:w,height:900}})).newPage(); await p.goto(url(srv)); await p.waitForTimeout(200);
  await p.addScriptTag({path:AXE}); const r=await p.evaluate(()=>axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}));
  const m=await p.evaluate(()=>{const i=document.querySelector('main input:not([type=checkbox]):not([type=file]), main select');i?.focus();const cs=i&&getComputedStyle(i);return {overflow:document.documentElement.scrollWidth-innerWidth,focus:cs?.outlineColor,border:cs?.borderTopColor}});
  out[`${label}-${n}`]={axe:r.violations.map(v=>`${v.id}(${v.nodes.length})`),...m};
  await p.screenshot({path:`${SHOTS}/${label}-${n}.png`,fullPage:true});
}
console.log(JSON.stringify(out,null,1)); await b.close(); sb.close(); sa.close(); process.exit(diff?1:0);
