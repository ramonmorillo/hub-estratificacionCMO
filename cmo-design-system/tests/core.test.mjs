// Pruebas del núcleo transversal (cmo-report.js, cmo-pdf.js). Sin navegador.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createReport, validateReport, reportToText, reportToHtml, reportSections, exportEnvelope, parseEnvelope, csvCell, toCsv, formatDate, escapeHtml, REPORT_SCHEMA, EXPORT_SCHEMA } from '../src/cmo-report.js';
import { reportToPdf, wrapText, toWinAnsi } from '../src/cmo-pdf.js';

const base = () => ({
  title: 'Atención farmacéutica — Modelo CMO (ficticio)',
  tool: { name: 'CMO-Prueba', version: '9.9.9' },
  model: { name: 'Modelo ficticio', version: '1.0', source: 'Fuente ficticia.' },
  evaluationDate: '2026-11-10T09:30:00', status: 'final',
  hospital: 'Hospital Ficticio', pharmacist: 'Farmacéutica Ficticia', patientId: 'CASO-001',
  context: [{ label: 'Diagnóstico', value: 'Ficticio' }],
  stratification: { score: 12, maxScore: 52, subtotals: [{ label: 'Clínica', points: 7, max: 22 }], calculatedLevel: 'Prioridad 2', finalLevel: 'Prioridad 1', levelCode: 1,
    rules: ['Embarazo: prioridad automática'], override: { level: 'Prioridad 1', motive: 'Criterio clínico', justification: 'Justificación ficticia suficiente' }, pending: [] },
  factors: [{ dimension: 'Clínica', label: 'Variable A', detail: 'Sí', points: 2 }],
  needs: { confirmed: [{ dimension: 'Tratamiento', label: 'Falta de adherencia' }], potential: [{ dimension: 'Social', label: 'Hábito tabáquico', detail: 'pendiente' }] },
  interventions: { done: [{ group: 'Seguimiento', label: 'Validar tratamiento' }], planned: [{ group: 'Educación', label: 'Material' }], recommended: [], notApplicableCount: 1 },
  plan: { periodicity: 'Cada 3 meses', nextReview: '2027-02-10', notes: 'Nota', goals: [{ label: 'Objetivo', status: 'Pendiente' }] },
  warnings: ['Advertencia ficticia']
});

test('createReport normaliza y valida', () => {
  const r = createReport(base());
  assert.equal(r.schema, REPORT_SCHEMA);
  assert.equal(r.statusLabel, 'Definitiva');
  assert.deepEqual(validateReport(r), []);
  assert.equal(createReport({}).status, 'provisional', 'por defecto, provisional');
  assert.ok(validateReport(createReport({})).length >= 3);
});

test('un informe definitivo con pendientes o un override sin justificación no es válido', () => {
  const a = base(); a.stratification.pending = ['Variable X'];
  assert.ok(validateReport(createReport(a)).some(e => /pendientes/.test(e)));
  const b = base(); b.stratification.override.justification = '';
  assert.ok(validateReport(createReport(b)).some(e => /justificación/.test(e)));
  const c = base(); c.patientId = '12345678Z';
  assert.ok(validateReport(createReport(c)).some(e => /DNI/.test(e)));
});

test('texto, HTML y PDF salen de las mismas secciones', () => {
  const r = createReport(base());
  const text = reportToText(r), html = reportToHtml(r);
  for (const s of reportSections(r)) {
    assert.ok(text.includes(s.title.toUpperCase()), `texto: ${s.title}`);
    assert.ok(html.includes(escapeHtml(s.title)), `html: ${s.title}`);
  }
  assert.match(text, /RESULTADO DE ESTRATIFICACIÓN: PRIORIDAD 1$/m);
  assert.match(text, /Resultado calculado por el modelo: Prioridad 2/, 'el resultado automático se conserva');
  assert.match(text, /Modificación por criterio profesional: Prioridad 1\. Motivo: Criterio clínico\. Justificación:/);
  assert.match(text, /Potenciales, pendientes de evaluación:/);
  assert.match(text, /Fecha de evaluación: 10\/11\/2026 09:30/);
  assert.ok(!/<[a-z]/i.test(text), 'el texto para HCE no contiene HTML');
});

test('provisional: se rotula en el resultado y lista las variables pendientes', () => {
  const b = base(); b.status = 'provisional'; b.stratification.pending = ['Variable X', 'Variable Y'];
  const text = reportToText(createReport(b));
  assert.match(text, /PRIORIDAD 1 \(PROVISIONAL\)/);
  assert.match(text, /Variables pendientes de valoración: Variable X; Variable Y/);
});

test('las secciones vacías se omiten', () => {
  const b = base(); b.needs = {}; b.warnings = []; b.context = [];
  const titles = reportSections(createReport(b)).map(s => s.title);
  assert.ok(!titles.includes('Necesidades farmacoterapéuticas identificadas'));
  assert.ok(!titles.includes('Advertencias y limitaciones'));
});

test('el HTML escapa cualquier dato introducido por el usuario', () => {
  const b = base(); b.pharmacist = '<img src=x onerror=alert(1)>'; b.plan.notes = '"><script>alert(1)</script>';
  const html = reportToHtml(createReport(b));
  assert.ok(!/<img|<script/i.test(html));
  assert.ok(html.includes('&lt;img'));
});

test('CSV: comillas y neutralización de fórmulas', () => {
  assert.equal(csvCell('=HYPERLINK("x")'), `"'=HYPERLINK(""x"")"`);
  assert.equal(csvCell('+1'), `"'+1"`);
  assert.equal(csvCell('a;b'), '"a;b"');
  assert.equal(toCsv([['a', 1]], { bom: false }), '"a";"1"\r\n');
});

test('sobre de exportación e importación validada', () => {
  const env = exportEnvelope({ app: { id: 'cmo-prueba', name: 'CMO-Prueba', version: '9.9.9' }, exportedAt: '2026-11-10T10:00:00Z', dataSchema: 'cmo-prueba-case/1', data: { a: 1 }, report: createReport(base()) });
  assert.equal(env.schema, EXPORT_SCHEMA);
  const ok = parseEnvelope(JSON.stringify(env), { appId: 'cmo-prueba' });
  assert.equal(ok.ok, true);
  assert.equal(parseEnvelope(JSON.stringify(env), { appId: 'otra' }).ok, false);
  assert.equal(parseEnvelope('{"schema":"x"}').ok, false);
  assert.equal(parseEnvelope('no json').ok, false);
  assert.equal(parseEnvelope('').ok, false);
  assert.equal(parseEnvelope('[1]').ok, false);
  assert.equal(parseEnvelope('x'.repeat(50), { maxBytes: 10 }).ok, false);
});

test('fechas', () => {
  assert.equal(formatDate('2026-11-10'), '10/11/2026');
  assert.equal(formatDate('no-fecha'), '');
  assert.equal(formatDate(''), '');
});

test('PDF: estructura válida, texto del informe y paginación', () => {
  const b = base();
  b.factors = Array.from({ length: 90 }, (_, i) => ({ dimension: 'Clínica', label: `Variable ficticia número ${i + 1} con un texto suficientemente largo para forzar el ajuste de línea`, points: 1 }));
  const bytes = reportToPdf(createReport(b));
  const pdf = Buffer.from(bytes).toString('latin1');
  assert.ok(pdf.startsWith('%PDF-1.4'));
  assert.ok(pdf.trimEnd().endsWith('%%EOF'));
  const pages = Number(pdf.match(/\/Count (\d+)/)[1]);
  assert.ok(pages >= 2, 'varias páginas');
  assert.ok(pdf.includes(`gina 1 de ${pages}`));
  assert.ok(pdf.includes('PRIORIDAD 1') || pdf.includes('Prioridad 1'));
  assert.ok(pdf.includes('CASO-001'));
  const xref = Number(pdf.match(/startxref\n(\d+)/)[1]);
  assert.equal(pdf.slice(xref, xref + 4), 'xref', 'la tabla xref está donde indica startxref');
  assert.deepEqual(toWinAnsi('≥ñ€'), [62, 61, 241, 128]);
  assert.ok(wrapText('palabra '.repeat(40), 10, 200).length > 1);
});

test('el núcleo no contiene red, almacenamiento ni fechas implícitas', () => {
  for (const f of ['cmo-report.js', 'cmo-pdf.js', 'cmo-flow.js']) {
    const src = readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8');
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB|https?:\/\//.test(src), `${f}: sin red ni almacenamiento`);
    assert.ok(!/eval\s*\(|new Function|innerHTML/.test(src), `${f}: sin eval ni innerHTML`);
  }
  assert.ok(!/new Date\(\)|Date\.now\(\)/.test(readFileSync(new URL('../src/cmo-report.js', import.meta.url), 'utf8')), 'cmo-report.js es determinista');
});

test('evidenceAt: fragmento literal y aviso de posible negación', async () => {
  const { evidenceAt } = await import('../src/cmo-report.js');
  const t = 'Paciente estable. No fumador desde 2010. Fumador pasivo.';
  const i = t.indexOf('fumador');
  const ev = evidenceAt(t, i, 7);
  assert.equal(ev.match, 'fumador'); assert.equal(ev.negated, true);
  assert.equal(evidenceAt(t, t.indexOf('Fumador pasivo'), 7).negated, false, 'la negación no cruza el punto');
  assert.equal(evidenceAt('VIH negativo', 0, 3).negated, true);
  assert.equal(evidenceAt('Niega HTA', 6, 3).negated, true);
  assert.equal(evidenceAt('HTA mal controlada', 0, 3).negated, false);
});
