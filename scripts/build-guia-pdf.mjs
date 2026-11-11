// Genera guia-de-uso-cmo.pdf a partir de guia.html (misma fuente que la web: estilos de impresión en @layer cmo.print).
// Uso:  node scripts/build-guia-pdf.mjs      (requiere Playwright con Chromium; sin red: sirve el hub en localhost)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const meta = JSON.parse(/<script type="application\/json" id="cmo-app-meta">([\s\S]*?)<\/script>/.exec(fs.readFileSync(path.join(ROOT, 'guia.html'), 'utf8'))[1]);

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, url === '/' ? 'index.html' : url);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }); res.end(data);
  });
});
await new Promise((r) => server.listen(0, r));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${server.address().port}/guia.html`);
  await page.waitForFunction(() => customElements.get('cmo-author-signature') && document.querySelector('cmo-author-signature').shadowRoot !== undefined);
  await page.emulateMedia({ media: 'print' });
  const foot = 'font-family: Arial, sans-serif; font-size: 8px; color: #4b5568; width: 100%; padding: 0 15mm; display: flex; justify-content: space-between;';
  await page.pdf({
    path: path.join(ROOT, 'guia-de-uso-cmo.pdf'),
    format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true, outline: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="${foot}"><span>Hub de Estratificación CMO · Guía de uso · v${meta.appVersion}</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`
  });
  console.log('guia-de-uso-cmo.pdf generado (v' + meta.appVersion + ')');
} finally { await browser.close(); server.close(); }
