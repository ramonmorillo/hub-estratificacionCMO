#!/usr/bin/env node
// Copia una versión FIJADA del CMO Design System dentro de una herramienta.
// Nunca se ejecuta automáticamente: cada actualización es un cambio revisable.
//   node tools/cmo-ds-sync.mjs <dir-herramienta> [--dest vendor/cmo-ds]   → copia + manifiesto
//   node tools/cmo-ds-sync.mjs <dir-herramienta> --check [--dest ...]     → verifica integridad
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['src/cmo-tokens.css', 'src/cmo-components.css', 'src/cmo-author-signature.js', 'assets/cmo-mark.svg', 'assets/favicon.svg'];
const args = process.argv.slice(2);
const target = args.find(a => !a.startsWith('--'));
const destRel = args.includes('--dest') ? args[args.indexOf('--dest') + 1] : 'vendor/cmo-ds';
if (!target || !existsSync(target)) { console.error('Uso: cmo-ds-sync.mjs <dir-herramienta> [--check] [--dest ruta]'); process.exit(2); }
const dest = join(target, destRel);
const sha = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const manifestPath = join(dest, 'CMO-DS-VERSION.json');

if (args.includes('--check')) {
  if (!existsSync(manifestPath)) { console.error(`Sin manifiesto en ${manifestPath}`); process.exit(1); }
  const man = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const bad = Object.entries(man.files).filter(([f, h]) => !existsSync(join(dest, f)) || sha(join(dest, f)) !== h);
  if (bad.length) { console.error(`CMO DS ${man.version}: ficheros alterados o ausentes → ${bad.map(b => b[0]).join(', ')}`); process.exit(1); }
  console.log(`CMO DS ${man.version}: copia íntegra (${Object.keys(man.files).length} ficheros).`);
  process.exit(0);
}

const version = readFileSync(join(root, 'VERSION'), 'utf8').trim();
mkdirSync(dest, { recursive: true });
const files = {};
for (const f of FILES) { const out = join(dest, basename(f)); copyFileSync(join(root, f), out); files[basename(f)] = sha(out); }
writeFileSync(manifestPath, JSON.stringify({ name: 'cmo-design-system', version, files }, null, 2) + '\n');
console.log(`CMO DS ${version} copiado en ${dest} (${FILES.length} ficheros). Revise el diff antes de publicar.`);
