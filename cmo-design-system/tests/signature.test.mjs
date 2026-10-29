import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSignatureModel, formatIsoDate } from '../src/cmo-author-signature.js';

test('formatea ISO a DD/MM/AAAA sin desfase horario', () => {
  assert.equal(formatIsoDate('2026-01-01'), '01/01/2026');
  assert.equal(formatIsoDate('2026-13-01'), null);
  assert.equal(formatIsoDate('01/01/2026'), null);
  assert.equal(formatIsoDate(undefined), null);
});

test('sin status "released" la fecha se muestra pendiente, nunca la fecha actual', () => {
  const m = buildSignatureModel({ appVersion: '1.0.0', releaseDate: '2026-10-29', status: 'draft' });
  const row = m.rows.find(r => r.term === 'Última actualización');
  assert.equal(row.value, 'pendiente de publicación');
  assert.equal(row.pending, true);
});

test('publicada: muestra la fecha controlada', () => {
  const m = buildSignatureModel({ appVersion: '1.0.0', releaseDate: '2026-11-02', status: 'released' });
  assert.equal(m.rows.find(r => r.term === 'Última actualización').value, '02/11/2026');
  assert.deepEqual(m.issues, []);
});

test('released con fecha inválida se notifica como incidencia', () => {
  const m = buildSignatureModel({ appVersion: '1.0.0', releaseDate: 'ayer', status: 'released' });
  assert.ok(m.issues.some(i => i.includes('releaseDate')));
});

test('conserva todas las atribuciones y separa algoritmo de versión de la app', () => {
  const m = buildSignatureModel({
    appVersion: '1.2.0', status: 'released', releaseDate: '2026-10-12',
    credits: [{ role: 'Desarrollo digital', name: 'A' }, { role: 'Modelo clínico', name: 'Grupo B' }],
    algorithm: { name: 'CMO-Respiratorio', version: '1.0' }
  });
  assert.deepEqual(m.rows.map(r => r.term), ['Desarrollo digital', 'Modelo clínico', 'Algoritmo', 'Versión', 'Última actualización']);
});

test('no inventa copyright si faltan titulares', () => {
  assert.equal(buildSignatureModel({ copyright: { year: '2026', holders: [] } }).copyright, null);
  assert.equal(buildSignatureModel({ copyright: { year: '2026', holders: ['X', 'Y'] } }).copyright, '© 2026 – X, Y');
});

test('metadatos vacíos: no falla y señala la versión ausente', () => {
  const m = buildSignatureModel();
  assert.ok(m.issues.includes('appVersion ausente'));
  assert.equal(m.product, null);
});

test('i18n: etiquetas propias en es/en/pt y normalización de lang (pt-BR → pt, desconocido → es)', async () => {
  const { resolveLang } = await import('../src/cmo-author-signature.js');
  assert.equal(resolveLang('pt-BR'), 'pt');
  assert.equal(resolveLang('en-GB'), 'en');
  assert.equal(resolveLang('fr'), 'es');
  assert.equal(resolveLang(''), 'es');
  const meta = { appVersion: '3.0.0', status: 'draft' };
  assert.equal(buildSignatureModel(meta, 'en').rows.find(r => r.term === 'Version').value, '3.0.0');
  assert.equal(buildSignatureModel(meta, 'pt').rows.find(r => r.term === 'Última atualização').value, 'publicação pendente');
  assert.match(buildSignatureModel(meta, 'en').line, /Pharmacotherapeutic stratification/);
});

test('i18n: créditos y modelo localizables, con retorno al español si falta el idioma', () => {
  const meta = { appVersion: '1.0.0', model: { es: 'Modelo CMO.', en: 'CMO model.' },
    credits: [{ role: { es: 'Concepto y autoría', en: 'Concept and authorship', pt: 'Conceito e autoria' }, name: 'X' }] };
  assert.equal(buildSignatureModel(meta, 'pt').rows[0].term, 'Conceito e autoria');
  assert.equal(buildSignatureModel(meta, 'pt').model, 'Modelo CMO.');
  assert.equal(buildSignatureModel(meta, 'en').model, 'CMO model.');
});

test('i18n: en inglés la fecha se muestra en ISO (evita la ambigüedad DD/MM frente a MM/DD)', () => {
  const meta = { appVersion: '1.0.0', status: 'released', releaseDate: '2026-11-02' };
  assert.equal(buildSignatureModel(meta, 'en').rows.find(r => r.term === 'Last update').value, '2026-11-02');
  assert.equal(buildSignatureModel(meta, 'es').rows.find(r => r.term === 'Última actualización').value, '02/11/2026');
});
