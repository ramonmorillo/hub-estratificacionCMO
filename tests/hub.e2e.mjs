// Pruebas de regresión, accesibilidad y privacidad del hub (Playwright preinstalado, sin dependencias del repo).
//   node tests/hub.e2e.mjs            (opcional: AXE_PATH=/ruta/axe.min.js  SHOTS=/dir/capturas)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
  try { res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const results = [];
const check = async (name, fn) => { try { await fn(); results.push(['PASS', name]); } catch (e) { results.push(['FAIL', name, e.message.split('\n')[0]]); } };

const browser = await chromium.launch();
async function open(path, viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const external = [], errors = [];
  await page.route('**/*', r => { const u = r.request().url(); if (u.startsWith(base)) return r.continue(); external.push(u); return r.abort(); });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto(base + path, { waitUntil: 'load' });
  return { ctx, page, external, errors };
}
const state = page => page.evaluate(() => ({
  count: document.getElementById('resultCount').textContent,
  names: [...document.querySelectorAll('#artifactsGrid h3')].map(h => h.textContent.trim()),
  urls: [...document.querySelectorAll('#artifactsGrid a[href]')].map(a => a.href)
}));

const before = await open('/tests/fixtures/index.baseline-9369b30.html');
const after = await open('/index.html');

await check('Catálogo idéntico: 10 herramientas, mismos nombres y URLs que la versión anterior', async () => {
  const [a, b] = [await state(before.page), await state(after.page)];
  assert.equal(b.names.length, 10); assert.deepEqual(b.names, a.names); assert.deepEqual(b.urls, a.urls);
});
await check('Búsqueda: resultados idénticos a la versión anterior en 9 términos', async () => {
  for (const term of ['', 'vih', 'hepatitis', 'neuro', 'NEUROLOGÍA', 'riesgo', 'pediátrica', 'oncologia', 'zzz']) {
    for (const s of [before, after]) await s.page.fill('#searchInput', term);
    const [a, b] = [await state(before.page), await state(after.page)];
    assert.deepEqual(b.names, a.names, `término "${term}"`); assert.equal(b.count, a.count, `contador "${term}"`);
  }
  for (const s of [before, after]) await s.page.fill('#searchInput', '');
});
await check('Filtros por categoría: resultados idénticos a la versión anterior y aria-pressed correcto', async () => {
  const cats = await after.page.$$eval('#categories button', bs => bs.map(b => b.dataset.category));
  assert.equal(cats.length, 9);
  for (const c of cats) {
    for (const s of [before, after]) await s.page.click(`#categories [data-category="${c}"]`);
    const [a, b] = [await state(before.page), await state(after.page)];
    assert.deepEqual(b.names, a.names, `categoría ${c}`);
    assert.equal(await after.page.getAttribute(`#categories [data-category="${c}"]`, 'aria-pressed'), 'true');
  }
});
await check('Estado vacío accesible y contador anunciado (role=status)', async () => {
  await after.page.fill('#searchInput', 'zzz');
  assert.match(await after.page.textContent('#artifactsGrid'), /No se encontraron resultados/);
  assert.equal(await after.page.getAttribute('#resultCount', 'role'), 'status');
  await after.page.fill('#searchInput', '');
  await after.page.click('#categories [data-category="all"]');
});
await check('Teclado: primer Tab = enlace de salto visible; foco con contorno ≥3 px', async () => {
  const { page, ctx } = await open('/index.html');
  await page.keyboard.press('Tab');
  const f = await page.evaluate(() => { const e = document.activeElement, cs = getComputedStyle(e); return { cls: e.className, outline: parseFloat(cs.outlineWidth), left: e.getBoundingClientRect().left }; });
  assert.equal(f.cls, 'cmo-skip'); assert.ok(f.left >= 0, 'enlace de salto visible al enfocar');
  await page.keyboard.press('Tab');
  const o = await page.evaluate(() => parseFloat(getComputedStyle(document.activeElement).outlineWidth));
  assert.ok(o >= 3, `outline ${o}`); await ctx.close();
});
await check('Firma de autoría: versión 1.0.0 y fecha «pendiente de publicación» (no inventada)', async () => {
  const t = await after.page.textContent('cmo-author-signature');
  assert.match(t, /Versión:?\s*1\.0\.0/); assert.match(t, /pendiente de publicación/); assert.match(t, /Ramón Morillo Verdugo/);
  assert.doesNotMatch(t, /\d{2}\/\d{2}\/\d{4}/);
});
await check('Privacidad: sin cookies ni almacenamiento local; único recurso externo = Cloudflare Web Analytics', async () => {
  for (const p of ['/index.html', '/legal.html']) {
    const s = await open(p);
    const st = await s.page.evaluate(() => ({ c: document.cookie, l: localStorage.length, s: sessionStorage.length }));
    const cookies = await s.ctx.cookies();
    assert.deepEqual([st.c, st.l, st.s, cookies.length], ['', 0, 0, 0], p);
    assert.ok(s.external.every(u => u.startsWith('https://static.cloudflareinsights.com/')), p + ': ' + s.external.join(', '));
    await s.ctx.close();
  }
});
await check('Sin errores de JavaScript en consola', async () => { assert.deepEqual(after.errors, []); });
await check('Responsive: sin desplazamiento horizontal a 320, 375, 768 y 1440 px', async () => {
  for (const width of [320, 375, 768, 1440]) for (const p of ['/index.html', '/legal.html']) {
    const s = await open(p, { width, height: 800 });
    const over = await s.page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(over <= 0, `${p} @${width}px desborda ${over}px`); await s.ctx.close();
  }
});
await check('Movimiento reducido: sin transiciones', async () => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage(); await page.route(/cloudflareinsights/, r => r.abort());
  await page.goto(base + '/index.html');
  assert.equal(await page.$eval('.cmo-card', e => getComputedStyle(e).transitionDuration), '0s'); await ctx.close();
});
const axePath = process.env.AXE_PATH;
if (axePath && existsSync(axePath)) {
  await check('axe-core (WCAG 2.0/2.1/2.2 A y AA): 0 infracciones en index y legal', async () => {
    for (const p of ['/index.html', '/legal.html']) {
      const s = await open(p);
      await s.page.addScriptTag({ path: axePath });
      const r = await s.page.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }));
      assert.deepEqual(r.violations.map(v => `${v.id} (${v.nodes.length})`), [], p); await s.ctx.close();
    }
  });
} else results.push(['SKIP', 'axe-core no disponible (defina AXE_PATH)']);

if (process.env.SHOTS) {
  for (const [w, n] of [[1280, 'desktop'], [375, 'mobile']]) for (const p of ['index', 'legal']) {
    const s = await open(`/${p}.html`, { width: w, height: 900 });
    await s.page.screenshot({ path: join(process.env.SHOTS, `${p}-${n}.png`), fullPage: true }); await s.ctx.close();
  }
}
await browser.close(); server.close();
for (const r of results) console.log(r.join('  '));
const failed = results.filter(r => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed} / ${results.length} comprobaciones sin fallo`);
process.exit(failed ? 1 : 0);
