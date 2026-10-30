#!/usr/bin/env node
// Control previo a publicación de una página CMO (ver docs/CMO-RELEASE-CHECKLIST.md).
//   node tools/cmo-release-check.mjs <index.html> [paginas-legales.html ...] [--strict]
// Errores (exit 1): metadatos ausentes/incoherentes. Avisos: marcadores [PENDIENTE…] (exit 1 con --strict).
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const [page, ...extra] = args.filter(a => !a.startsWith('--'));
if (!page) { console.error('Uso: cmo-release-check.mjs <index.html> [legal.html ...] [--strict]'); process.exit(2); }
const errors = [], warnings = [];
const html = readFileSync(page, 'utf8');
const block = /<script type="application\/json" id="cmo-app-meta">([\s\S]*?)<\/script>/.exec(html);
let meta = null;
if (!block) errors.push('Falta <script type="application/json" id="cmo-app-meta">');
else { try { meta = JSON.parse(block[1]); } catch (e) { errors.push('JSON de metadatos inválido: ' + e.message); } }
if (meta) {
  const semver = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
  if (meta.schema !== 'cmo-app-meta/1') errors.push('schema debe ser "cmo-app-meta/1"');
  for (const k of ['id', 'name', 'appVersion']) if (!meta[k]) errors.push(`Falta ${k}`);
  if (meta.appVersion && !semver.test(meta.appVersion)) errors.push('appVersion no es SemVer');
  if (!Array.isArray(meta.credits) || !meta.credits.length) errors.push('credits vacío');
  if (meta.status !== 'released') warnings.push(`status="${meta.status}": la firma mostrará «pendiente de publicación»`);
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.releaseDate || '')) errors.push('status "released" exige releaseDate AAAA-MM-DD');
  if (meta.algorithm && !meta.algorithm.version) errors.push('algorithm sin version (no cambiar versiones clínicas en silencio)');
}
for (const f of [page, ...extra]) {
  const n = (readFileSync(f, 'utf8').match(/\[PENDIENTE[^\]]*\]/g) || []).length;
  if (n) warnings.push(`${f}: ${n} marcador(es) [PENDIENTE…] por completar`);
}
errors.forEach(e => console.error('ERROR  ' + e));
warnings.forEach(w => console.warn('AVISO  ' + w));
const fail = errors.length || (strict && warnings.length);
console.log(fail ? 'NO APTO para publicación.' : errors.length + warnings.length ? 'Apto con avisos.' : 'Apto.');
process.exit(fail ? 1 : 0);
