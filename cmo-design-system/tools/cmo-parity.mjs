// Arnés de paridad clínica para migraciones visuales del CMO Design System.
// Misma semilla → mismas interacciones en la versión ANTERIOR y la NUEVA; compara textContent de <main>,
// valores de todos los campos y localStorage (fechas normalizadas). Además: axe, desbordamiento y capturas.
// Uso: node cmo-parity.mjs <raízAnterior> <raízNueva> <basePath> <axe.min.js> <dirCapturas> [semillas=25] [pasos: selectores separados por |; FILL rellena de nuevo]
// Opcional: PROBE=<selector> imprime su texto por semilla; SKIP=<selectores> excluye campos (p. ej. selector de idioma);
// RANDCLICK=<selector> pulsa al azar controles tipo botón (opciones de variables), con la misma semilla.
// Con la semilla 1 pasa axe también sobre el estado final del recorrido (resultados), en ambas versiones.
// Valide siempre el arnés con una mutación clínica controlada (p. ej. un umbral) antes de confiar en un 25/25.
// Pasos especiales (en la lista separada por |): PICK@<select> elige una opción no vacía (campos obligatorios);
// TYPE@<campo>@<texto> escribe un texto fijo (textarea obligatorios); EACH@<fila>@<botón> rellena y confirma
// fila a fila cuando cada clic vuelve a pintar el DOM (EACHDENS=<factor> ajusta la densidad; EACHSKIP=<selector>
// deja «sin determinar» filas que enmascaran umbrales, p. ej. reglas de embarazo). DLG=1 imprime los diálogos.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import {createRequire} from 'node:module';
const require=createRequire(import.meta.url); const {chromium}=require('playwright');
const [RB,RA,BASE,AXE,SHOTS,SEEDS='25',CLICK='']=process.argv.slice(2);
const T={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
function serve(root){return new Promise(r=>{const s=http.createServer((q,res)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(!u.startsWith(BASE)){res.writeHead(404);return res.end()}u=u.slice(BASE.length)||'index.html';const f=path.join(root,u);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end()}res.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res)}).listen(0,()=>r(s))})}
const b=await chromium.launch(); const sb=await serve(RB), sa=await serve(RA);
const url=s=>`http://127.0.0.1:${s.address().port}${BASE}`;
async function run(srv,seed){
  const ctx=await b.newContext({viewport:{width:1280,height:900}}); const p=await ctx.newPage(); const errs=[],ext=[];
  p.on('pageerror',e=>errs.push(String(e))); p.on('dialog',d=>{if(process.env.DLG)console.log('DIALOG',d.message().replace(/\n/g,' '));d.accept()}); p.on('request',r=>{if(!r.url().startsWith(url(srv)))ext.push(r.url())});
  if(process.env.PROBE)await p.addInitScript(sel=>{window.__PROBE=sel},process.env.PROBE);
  await p.goto(url(srv)); await p.waitForTimeout(150);
  const snap=await p.evaluate(async ({seed,CLICK,SKIP,RANDCLICK,EACHDENS,EACHSKIP})=>{
    const R=()=>document.querySelector('main')||document.querySelector('#app')||document.body; // raíz comparada
    let x=seed*2654435761%4294967296||1; const rnd=()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296};
    const dens=((seed%5)+1)/10; // densidad 0,1–0,5: cubre casos de baja puntuación y evita que la prioridad automática enmascare umbrales
    const fire=e=>{e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const fillAll=async()=>{ for(let pass=0;pass<2;pass++){ // 2 pasadas: campos que aparecen dinámicamente
      for(const el of R().querySelectorAll('select, input, textarea')){
        if((SKIP&&el.matches(SKIP))||el.disabled||el.type==='file'||el.type==='hidden'||el.closest('[hidden]'))continue;
        if(el.tagName==='SELECT'&&el.options.length){el.selectedIndex=rnd()<dens*2?Math.floor(rnd()*el.options.length):0;fire(el)}
        else if(el.type==='checkbox'||el.type==='radio'){if(rnd()<dens*.6){el.checked=true;fire(el)}}
        else if(el.type==='number'){el.value=String(Math.floor(rnd()*20));fire(el)}
        else if(el.type==='date'){el.value='2026-01-15';fire(el)}
        else if(el.tagName==='TEXTAREA'){}
        else {el.value='T'+Math.floor(rnd()*1000);fire(el)}
      }
      if(RANDCLICK){for(const b of [...R().querySelectorAll(RANDCLICK)]){if(rnd()<dens*0.8&&!b.disabled){b.click();await sleep(5)}}} // controles tipo botón (opciones)
      await sleep(30);
    } };
    await fillAll();
    // CLICK: selectores separados por | ; el token FILL vuelve a rellenar los campos que hayan aparecido
    if(CLICK){for(const sel of CLICK.split('|')){if(sel==='FILL'){await fillAll();continue}
      // PICK@<select>: elige una opción no vacía al azar (campos obligatorios que bloquean el avance)
      if(sel.startsWith('PICK@')){const c=document.querySelector(sel.slice(5));if(c&&c.options.length>1){c.selectedIndex=1+Math.floor(rnd()*(c.options.length-1));fire(c)}continue}
      // TYPE@<campo>@<texto>: texto fijo en campos obligatorios que FILL no rellena (textarea)
      if(sel.startsWith('TYPE@')){const [,f,t]=sel.split('@');const c=document.querySelector(f);if(c){c.value=t;fire(c)}continue}
      // EACH@<fila>@<botón>: confirma fila a fila cuando cada clic vuelve a pintar el DOM (rellena la 1.ª fila, pulsa, repite)
      if(sel.startsWith('EACH@')){const [,row,btn]=sel.split('@');for(let i=0;i<80;i++){const r=document.querySelector(row);if(!r)break;
        const c=r.querySelector('select');if(c&&c.options.length){c.selectedIndex=(EACHSKIP&&r.matches(EACHSKIP))?0:rnd()<dens*(+EACHDENS||2)?Math.floor(rnd()*c.options.length):0;fire(c)}
        const k=r.querySelector(btn);if(!k)break;k.click();await sleep(10)}continue}const e=document.querySelector(sel);if(e){e.click();await sleep(80)}}}
    const vals=[...R().querySelectorAll('select, input, textarea')].map(e=>e.type==='checkbox'||e.type==='radio'?e.checked:e.value);
    const norm=s=>s.replace(/\d{1,2}\/\d{1,2}\/\d{4},?\s*\d{1,2}:\d{2}(:\d{2})?/g,'<FECHA>').replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g,'<ISO>').replace(/\bcase-\d{10,}-[a-z0-9]+\b/g,'<CASEID>').replace(/\s+/g,' ');
    const probe=(window.__PROBE&&document.querySelector(window.__PROBE))?.textContent?.trim()||null;
    return {probe,text:norm(R().textContent),vals,ls:Object.keys(localStorage).sort().map(k=>k+'='+norm(localStorage.getItem(k)).replace(/"(id|caseId|createdAt|updatedAt|savedAt|exportedAt|evaluation_id)":"[^"]*"/g,'"$1":"*"'))};
  },{seed,CLICK,SKIP:process.env.SKIP||'',RANDCLICK:process.env.RANDCLICK||'',EACHDENS:process.env.EACHDENS||'',EACHSKIP:process.env.EACHSKIP||''});
  let flowAxe=null;
  if(seed===1){ // axe también sobre el estado final del recorrido (resultados, paneles abiertos tras los clics)
    await p.addScriptTag({path:AXE}); const r=await p.evaluate(()=>axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}));
    flowAxe=r.violations.map(v=>`${v.id}(${v.nodes.length}): ${v.nodes.slice(0,2).map(n=>n.target.join(' ')).join(' ; ')}`);
  }
  await ctx.close(); return {...snap,errs,ext,flowAxe};
}
let diff=0,errs=0,ext=new Set(),sample=null;
for(let s=1;s<=+SEEDS;s++){const A=await run(sb,s),B=await run(sa,s);
  const same=A.text===B.text&&JSON.stringify(A.vals)===JSON.stringify(B.vals)&&JSON.stringify(A.ls)===JSON.stringify(B.ls);
  if(!same){diff++; if(!sample){const i=[...A.text].findIndex((c,j)=>c!==B.text[j]);sample={seed:s,before:A.text.slice(Math.max(0,i-80),i+120),after:B.text.slice(Math.max(0,i-80),i+120),valsEq:JSON.stringify(A.vals)===JSON.stringify(B.vals),lsEq:JSON.stringify(A.ls)===JSON.stringify(B.ls),lsDiff:(()=>{const x=JSON.stringify(A.ls),y=JSON.stringify(B.ls);const j=[...x].findIndex((c,k)=>c!==y[k]);return j<0?null:[x.slice(Math.max(0,j-60),j+60),y.slice(Math.max(0,j-60),j+60)]})()}}}
  if(process.env.PROBE)process.stdout.write(`[${s}:${A.probe}|${B.probe}] `);
  errs+=B.errs.length; B.ext.forEach(u=>ext.add(u)); if(s===1)console.log('axe tras recorrido · antes:',JSON.stringify(A.flowAxe),'· después:',JSON.stringify(B.flowAxe));
  if(s===1)console.log('muestra semilla 1: textlen',B.text.length,'| valores',B.vals.length,'| localStorage',B.ls.length);
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
