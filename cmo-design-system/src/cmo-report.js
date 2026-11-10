/*!
 * CMO Core — modelo único de informe (cmo-report/1) y exportación (cmo-export/1)
 * Núcleo transversal, independiente de la patología: no contiene variables, pesos,
 * umbrales ni intervenciones. Cada herramienta construye el informe con un adaptador
 * a partir del resultado de SU motor clínico; el texto para la historia clínica, la
 * vista de impresión y el PDF (cmo-pdf.js) se generan todos desde esta estructura.
 * Sin dependencias, sin red, sin acceso al DOM (utilizable en Node para pruebas).
 * Derivado de src/report.js de CMO Respiratorio 1.3.0.
 */
export const REPORT_SCHEMA = 'cmo-report/1';
export const EXPORT_SCHEMA = 'cmo-export/1';

/** Estados de registro de una intervención (etiquetas comunes a todo el ecosistema). */
export const INTERVENTION_STATUSES = Object.freeze({
  recommended: 'Recomendada por el modelo (sin registrar)',
  done: 'Realizada',
  planned: 'Planificada',
  not_applicable: 'No procede'
});

export const DEFAULT_DISCLAIMER = 'Herramienta de apoyo profesional: no diagnóstica, no prescriptiva, no sustitutiva del juicio clínico, no producto sanitario certificado y pendiente de validación asistencial.';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ESC[c]);

// Caracteres que algunas historias clínicas electrónicas no muestran correctamente.
export const toPlain = text => String(text ?? '')
  .replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/[‐‑]/g, '-')
  .replace(/α/g, 'alfa').replace(/β/g, 'beta').replace(/[“”«»]/g, '"').replace(/[‘’]/g, "'")
  .replace(/\t/g, ' ').trimEnd();

const pad = n => String(n).padStart(2, '0');
/** Fecha ISO (AAAA-MM-DD o completa) → DD/MM/AAAA[ HH:MM]. Devuelve '' si no es válida. */
export function formatDate(value, withTime = false) {
  if (!value) return '';
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  return withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}

/** Celda CSV segura: comillas dobladas y neutralización de fórmulas (=, +, -, @, tabulador, retorno). */
export function csvCell(value) {
  let s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
/** Filas (arrays) → CSV con separador «;» y BOM opcional para hojas de cálculo en español. */
export const toCsv = (rows, { separator = ';', bom = true } = {}) =>
  (bom ? '﻿' : '') + rows.map(r => r.map(csvCell).join(separator)).join('\r\n') + '\r\n';

// ---------- Apoyo a la revisión de propuestas del análisis de texto ----------
// Indicios de negación, antecedente o descarte cerca de una coincidencia. Solo sirven para AVISAR al
// profesional: no deciden nada ni sustituyen a las reglas de extracción de cada herramienta.
const NEG_BEFORE = /(?:^|[\s,;(])(?:no|sin|niega|niegan|nunca|ni|ex|exfumador|exfumadora|ausencia de|descarta|descartado|descartada|se descarta|antecedente de|antecedentes de|historia de|previo|previa)\s+(?:[\wáéíóúüñ]+\s+){0,3}$/;
const NEG_AFTER = /^\s*(?:negativ[oa]s?|descartad[oa]s?|ausentes?|: ?no\b|\(no\))/;

/** Fragmento literal alrededor de una coincidencia: {before, match, after, negated}. */
export function evidenceAt(original, index, length) {
  original = String(original ?? '');
  const start = Math.max(0, index - 45), end = Math.min(original.length, index + length + 45);
  const clean = s => s.replace(/\s+/g, ' ');
  const before = original.slice(start, index), after = original.slice(index + length, end);
  const sentenceBefore = before.split(/[.\n;]/).pop() || '';
  return {
    before: (start > 0 ? '…' : '') + clean(before), match: clean(original.slice(index, index + length)), after: clean(after) + (end < original.length ? '…' : ''),
    negated: NEG_BEFORE.test(sentenceBefore.toLowerCase()) || NEG_AFTER.test(after.toLowerCase())
  };
}
export const NEGATION_NOTE = 'Posible negación, antecedente o descarte en el texto: compruebe el sentido antes de aceptar.';

const text = (v, max = 4000) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
const list = v => (Array.isArray(v) ? v : []);
const item = i => ({ group: text(i?.group, 200), label: text(i?.label, 600) });
const need = n => ({ dimension: text(n?.dimension, 200), label: text(n?.label, 400), detail: text(n?.detail, 400) });

/**
 * Normaliza la entrada de un adaptador a la estructura cmo-report/1.
 * Las etiquetas de nivel («Prioridad 1», «Nivel 2»…) las aporta SIEMPRE la herramienta.
 */
export function createReport(input = {}) {
  const s = input.stratification || {};
  const i = input.interventions || {};
  const p = input.plan || {};
  const status = input.status === 'final' ? 'final' : 'provisional';
  return {
    schema: REPORT_SCHEMA,
    title: text(input.title, 200),
    tool: { name: text(input.tool?.name, 120), version: text(input.tool?.version, 40) },
    model: { name: text(input.model?.name, 300), version: text(input.model?.version, 80), source: text(input.model?.source, 600) },
    evaluationDate: text(input.evaluationDate, 40),
    status,
    statusLabel: status === 'final' ? 'Definitiva' : 'Provisional',
    hospital: text(input.hospital, 200),
    pharmacist: text(input.pharmacist, 200),
    patientId: text(input.patientId, 60),
    context: list(input.context).map(c => ({ label: text(c?.label, 200), value: text(c?.value, 600) })).filter(c => c.label && c.value),
    stratification: {
      score: Number.isFinite(s.score) ? s.score : null,
      maxScore: Number.isFinite(s.maxScore) ? s.maxScore : null,
      subtotals: list(s.subtotals).map(x => ({ label: text(x?.label, 120), points: Number(x?.points) || 0, max: Number.isFinite(x?.max) ? x.max : null })),
      calculatedLevel: text(s.calculatedLevel, 80),
      finalLevel: text(s.finalLevel || s.calculatedLevel, 80),
      levelCode: [1, 2, 3].includes(s.levelCode) ? s.levelCode : null,
      rules: list(s.rules).map(r => text(r, 400)).filter(Boolean),
      explanation: text(s.explanation, 1200),
      override: s.override && text(s.override.level) ? { level: text(s.override.level, 80), motive: text(s.override.motive, 200), justification: text(s.override.justification, 1200) } : null,
      pending: list(s.pending).map(x => text(x, 300)).filter(Boolean),
      assistedCount: Number(s.assistedCount) || 0
    },
    factors: list(input.factors).map(f => ({ dimension: text(f?.dimension, 200), label: text(f?.label, 400), detail: text(f?.detail, 400), points: Number.isFinite(f?.points) ? f.points : null })),
    needs: { confirmed: list(input.needs?.confirmed).map(need), potential: list(input.needs?.potential).map(need) },
    interventions: {
      done: list(i.done).map(item), planned: list(i.planned).map(item), recommended: list(i.recommended).map(item),
      notApplicableCount: Number(i.notApplicableCount) || 0
    },
    plan: {
      periodicity: text(p.periodicity, 600), nextReview: text(p.nextReview, 40), notes: text(p.notes, 2000),
      goals: list(p.goals).map(g => ({ label: text(g?.label, 400), status: text(g?.status, 80), detail: text(g?.detail, 600) })).filter(g => g.label)
    },
    warnings: list(input.warnings).map(w => text(w, 800)).filter(Boolean),
    disclaimer: text(input.disclaimer, 800) || DEFAULT_DISCLAIMER
  };
}

/** Comprobaciones mínimas de coherencia antes de exportar. Devuelve la lista de errores (vacía si es válido). */
export function validateReport(r) {
  const errors = [];
  if (r?.schema !== REPORT_SCHEMA) errors.push('Esquema de informe desconocido.');
  if (!r?.title) errors.push('Falta el título del informe.');
  if (!r?.tool?.name) errors.push('Falta el nombre de la herramienta.');
  if (!r?.stratification?.finalLevel) errors.push('Falta el nivel o prioridad resultante.');
  if (r?.stratification?.override && !r.stratification.override.justification) errors.push('La modificación profesional requiere justificación.');
  if (r?.status === 'final' && r?.stratification?.pending?.length) errors.push('Un informe definitivo no puede tener variables pendientes.');
  if (/\b\d{8}[A-Za-z]\b/.test(r?.patientId || '')) errors.push('El identificador parece un DNI: use un código seudonimizado.');
  return errors;
}

const STRATIFICATION_TITLE = 'Valoración CMO (estratificación)';
const scoreLabel = s => (s.score === null ? '' : `${s.score}${s.maxScore === null ? '' : `/${s.maxScore}`}`);
const subtotalsLabel = s => s.subtotals.map(x => `${x.label} ${x.points}${x.max === null ? '' : `/${x.max}`}`).join('; ');
const toolLabel = r => `${r.tool.name}${r.tool.version ? ` v${r.tool.version}` : ''}`;
const dateLabel = r => formatDate(r.evaluationDate, /T/.test(r.evaluationDate)) || r.evaluationDate;
const points = f => (f.points === null ? '' : ` (${f.points} p)`);
const provisional = r => (r.status === 'final' ? '' : ' (provisional)');

/**
 * Secciones del informe, en el orden común del ecosistema. Es la única fuente para
 * texto, impresión y PDF: cada sección es {title, lines:[{text, kind}]} y se omite si está vacía.
 * kind: 'kv' (clave: valor), 'item' (viñeta), 'sub' (subtítulo), 'warn' (advertencia), 'p' (párrafo).
 */
export function reportSections(r) {
  const s = r.stratification;
  const sections = [];
  const add = (title, lines) => { const rows = lines.filter(Boolean); if (rows.length) sections.push({ title, lines: rows }); };
  const kv = (k, v) => v && { kind: 'kv', key: k, text: v };
  const it = t => t && { kind: 'item', text: t };
  const sub = t => t && { kind: 'sub', text: t };

  add('Situación clínica y farmacoterapéutica relevante', r.context.map(c => kv(c.label, c.value)));
  add(STRATIFICATION_TITLE, [
    kv('Modelo', [r.model.name, r.model.version && `versión ${r.model.version}`].filter(Boolean).join(' · ')),
    kv('Puntuación total', scoreLabel(s) && `${scoreLabel(s)}${s.subtotals.length ? ` (${subtotalsLabel(s)})` : ''}`),
    kv('Resultado calculado por el modelo', s.calculatedLevel),
    ...s.rules.map(rule => kv('Regla especial', rule)),
    kv('Origen de los datos', s.assistedCount ? `${s.assistedCount} variable(s) incorporada(s) desde el análisis asistido del texto, confirmada(s) por el profesional` : ''),
    s.override && kv('Modificación por criterio profesional', `${s.override.level}${s.override.motive ? `. Motivo: ${s.override.motive}` : ''}. Justificación: ${s.override.justification}`),
    kv('Variables pendientes de valoración', s.pending.join('; '))
  ]);
  add('Variables que contribuyen al resultado', r.factors.map(f => it(`${f.dimension ? `${f.dimension}: ` : ''}${f.label}${f.detail ? ` — ${f.detail}` : ''}${points(f)}`)));
  add('Necesidades farmacoterapéuticas identificadas', [
    ...r.needs.confirmed.map(n => it(`${n.dimension ? `${n.dimension}: ` : ''}${n.label}${n.detail ? ` — ${n.detail}` : ''}`)),
    r.needs.potential.length && sub('Potenciales, pendientes de evaluación:'),
    ...r.needs.potential.map(n => it(`${n.dimension ? `${n.dimension}: ` : ''}${n.label}${n.detail ? ` — ${n.detail}` : ''}`))
  ]);
  const i = r.interventions;
  const block = (title, items) => (items.length ? [sub(title), ...items.map(x => it(`${x.group ? `${x.group}: ` : ''}${x.label}`))] : []);
  add('Intervenciones farmacéuticas', [
    ...block('Realizadas en esta consulta:', i.done),
    ...block('Planificadas / pendientes:', i.planned),
    ...block(`Recomendadas por el modelo para ${s.finalLevel} (no registradas como realizadas):`, i.recommended)
  ]);
  add('Plan de atención y seguimiento', [
    it(r.plan.periodicity),
    kv('Próxima valoración prevista', formatDate(r.plan.nextReview) || r.plan.nextReview),
    ...(r.plan.goals.length ? [sub('Objetivos:'), ...r.plan.goals.map(g => it(`${g.label}${g.status ? ` [${g.status}]` : ''}${g.detail ? ` — ${g.detail}` : ''}`))] : []),
    kv('Observaciones', r.plan.notes)
  ]);
  add('Advertencias y limitaciones', r.warnings.map(w => ({ kind: 'warn', text: w })));
  return sections;
}

/** Cabecera común (apartados 1–4 del informe). */
export function reportHeader(r) {
  return [
    ['Fecha de evaluación', dateLabel(r)],
    ['Identificador del paciente (seudonimizado)', r.patientId],
    ['Farmacéutico/a responsable', r.pharmacist],
    ['Hospital o centro', r.hospital],
    ['Valoración', r.statusLabel]
  ].filter(([, v]) => v);
}

export const resultLine = r => `Resultado de estratificación: ${r.stratification.finalLevel}${provisional(r)}`;
export const footerLines = r => [
  `Generado con ${toolLabel(r)}.${r.model.source ? ` ${r.model.source}` : ''}`,
  r.disclaimer
];

/** Texto plano para pegar en la historia clínica: sin HTML, tablas ni emojis; omite apartados sin contenido. */
export function reportToText(r) {
  const out = [r.title.toUpperCase()];
  reportHeader(r).forEach(([k, v]) => out.push(`${k}: ${v}`));
  const line = l => (l.kind === 'kv' ? `- ${l.key}: ${l.text}` : l.kind === 'sub' ? l.text : l.kind === 'item' ? `  - ${l.text}` : `- ${l.text}`);
  // El resultado va siempre inmediatamente después de la valoración, exista o no la sección de contexto.
  let placed = false;
  for (const section of reportSections(r)) {
    out.push('', section.title.toUpperCase(), ...section.lines.map(line));
    if (section.title === STRATIFICATION_TITLE) { out.push('', resultLine(r).toUpperCase()); placed = true; }
  }
  if (!placed) out.push('', resultLine(r).toUpperCase());
  out.push('', ...footerLines(r));
  return out.map(toPlain).join('\n').replace(/\n{3,}/g, '\n\n');
}

/** Fragmento HTML (escapado) para la vista previa y la impresión. Mismo contenido que el texto y el PDF. */
export function reportToHtml(r) {
  const e = escapeHtml;
  const line = l => (l.kind === 'kv' ? `<li><strong>${e(l.key)}:</strong> ${e(l.text)}</li>`
    : l.kind === 'sub' ? `</ul><p class="cmo-report__sub">${e(l.text)}</p><ul>`
    : `<li${l.kind === 'warn' ? ' class="cmo-report__warn"' : ''}>${e(l.text)}</li>`);
  const sections = reportSections(r).map(s => `<section><h2>${e(s.title)}</h2><ul>${s.lines.map(line).join('')}</ul></section>`.replace(/<ul><\/ul>/g, ''));
  return `<article class="cmo-report" data-level="${r.stratification.levelCode ?? ''}">`
    + `<header><h1>${e(r.title)}</h1><p class="cmo-report__tool">Informe de atención farmacéutica · ${e(toolLabel(r))}</p>`
    + `<dl>${reportHeader(r).map(([k, v]) => `<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('')}</dl></header>`
    + `<p class="cmo-report__result">${e(resultLine(r))}</p>`
    + sections.join('')
    + `<footer>${footerLines(r).map(f => `<p>${e(f)}</p>`).join('')}</footer></article>`;
}

/**
 * Sobre de exportación estructurada. `data` son los datos estructurados CONFIRMADOS de la
 * herramienta (su propio esquema, con versión); nunca texto clínico libre sin revisar.
 * `exportedAt` lo aporta quien llama (ISO 8601) para que el núcleo sea determinista.
 */
export function exportEnvelope({ app, exportedAt, report, data, dataSchema }) {
  return {
    schema: EXPORT_SCHEMA,
    app: { id: text(app?.id, 80), name: text(app?.name, 120), version: text(app?.version, 40) },
    exportedAt: text(exportedAt, 40),
    dataSchema: text(dataSchema, 80),
    data: data ?? null,
    report: report ?? null
  };
}

/** Lectura segura de un sobre importado. No ejecuta nada ni confía en el contenido: solo valida la forma. */
export function parseEnvelope(raw, { appId, maxBytes = 1_000_000 } = {}) {
  if (typeof raw !== 'string' || !raw.trim()) return { ok: false, error: 'El fichero está vacío.' };
  if (raw.length > maxBytes) return { ok: false, error: 'El fichero es demasiado grande.' };
  let value;
  try { value = JSON.parse(raw); } catch { return { ok: false, error: 'El fichero no es un JSON válido.' }; }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'Formato no reconocido.' };
  if (value.schema !== EXPORT_SCHEMA) return { ok: false, error: `Esquema no compatible (se esperaba ${EXPORT_SCHEMA}).` };
  if (appId && value.app?.id !== appId) return { ok: false, error: 'El fichero procede de otra herramienta CMO.' };
  if (!value.data || typeof value.data !== 'object') return { ok: false, error: 'El fichero no contiene datos estructurados.' };
  return { ok: true, value };
}
