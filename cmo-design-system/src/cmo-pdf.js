/*!
 * CMO Core — generador PDF mínimo, local y sin dependencias (PDF 1.4, Helvetica con WinAnsiEncoding).
 * Genera el PDF desde la estructura única cmo-report/1 (cmo-report.js): mismas secciones que el
 * texto para historia clínica y la impresión. Sin red, sin DOM (utilizable en Node para pruebas).
 * Motor de maquetación derivado de src/pdf.js de CMO Respiratorio 1.3.0.
 * Las métricas proceden de las tablas AFM estándar de Helvetica (códigos 32–255, Windows-1252).
 */
import { reportSections, reportHeader, resultLine, footerLines, labelsFor } from './cmo-report.js';

const HELVETICA=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,761,556,0,222,556,333,1000,556,556,333,1000,667,333,1000,0,611,0,0,222,222,333,333,350,556,1000,333,1000,500,333,944,0,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500];
const HELVETICA_BOLD=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,761,556,0,278,556,500,1000,556,556,333,1000,667,333,1000,0,611,0,0,278,278,500,500,350,556,1000,333,1000,556,333,944,0,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556];
const CP1252_EXTRA = {'€':0x80,'‚':0x82,'ƒ':0x83,'„':0x84,'…':0x85,'†':0x86,'‡':0x87,'ˆ':0x88,'‰':0x89,'Š':0x8a,'‹':0x8b,'Œ':0x8c,'Ž':0x8e,'‘':0x91,'’':0x92,'“':0x93,'”':0x94,'•':0x95,'–':0x96,'—':0x97,'˜':0x98,'™':0x99,'š':0x9a,'›':0x9b,'œ':0x9c,'ž':0x9e,'Ÿ':0x9f};
const SUBSTITUTIONS = {'≥':'>=','≤':'<=','α':'alfa','β':'beta','‐':'-','‑':'-',' ':' ','\t':' '};
const PAGE = {width: 595.28, height: 841.89, left: 50, right: 50, top: 50, bottom: 64};
// Colores de identidad «Estratos» (tinta y cobalto); los de nivel reproducen --cmo-level-*.
const COLORS = {ink: [0.08, 0.13, 0.23], muted: [0.29, 0.33, 0.41], accent: [0.12, 0.23, 0.66], soft: [0.93, 0.95, 0.98], warn: [0.99, 0.95, 0.89], warnInk: [0.58, 0.31, 0.04], line: [0.87, 0.86, 0.82], white: [1, 1, 1]};
const LEVELS = {1: {ink: [0.64, 0.14, 0.1], bg: [0.98, 0.93, 0.92]}, 2: {ink: [0.58, 0.31, 0.04], bg: [0.99, 0.95, 0.89]}, 3: {ink: [0.12, 0.42, 0.27], bg: [0.91, 0.95, 0.93]}};

/** Convierte texto Unicode a códigos WinAnsi; los caracteres no representables se sustituyen de forma explícita. */
export function toWinAnsi(text) {
  const codes = [];
  for (const raw of String(text ?? '')) {
    const ch = SUBSTITUTIONS[raw] ?? raw;
    for (const c of ch) {
      const cp = c.codePointAt(0);
      if (cp >= 32 && cp <= 126) codes.push(cp);
      else if (cp >= 160 && cp <= 255) codes.push(cp);
      else if (CP1252_EXTRA[c]) codes.push(CP1252_EXTRA[c]);
      else if (cp === 10 || cp === 13) codes.push(32);
      else codes.push(63); // '?'
    }
  }
  return codes;
}

export function textWidth(text, size, bold = false) {
  const table = bold ? HELVETICA_BOLD : HELVETICA;
  return toWinAnsi(text).reduce((sum, code) => sum + (table[code - 32] || 556), 0) * size / 1000;
}

/** Divide un texto en líneas que no superan el ancho disponible (corta palabras excesivamente largas). */
export function wrapText(text, size, maxWidth, bold = false) {
  const lines = [];
  for (const paragraph of String(text ?? '').split('\n')) {
    let line = '';
    for (let word of paragraph.split(/\s+/).filter(Boolean)) {
      while (textWidth(word, size, bold) > maxWidth) {
        let cut = word.length - 1;
        while (cut > 1 && textWidth(word.slice(0, cut), size, bold) > maxWidth) cut--;
        if (line) { lines.push(line); line = ''; }
        lines.push(word.slice(0, cut));
        word = word.slice(cut);
      }
      const candidate = line ? `${line} ${word}` : word;
      if (textWidth(candidate, size, bold) <= maxWidth) line = candidate;
      else { lines.push(line); line = word; }
    }
    lines.push(line);
  }
  return lines;
}

const escapePdf = codes => codes.map(c => c === 40 || c === 41 || c === 92 ? `\\${String.fromCharCode(c)}` : c > 126 ? `\\${c.toString(8).padStart(3, '0')}` : String.fromCharCode(c)).join('');
const rgb = ([r, g, b], op) => `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} ${op}`;

class Layout {
  constructor(runningTitle) { this.pages = []; this.runningTitle = runningTitle; this.newPage(); }
  get width() { return PAGE.width - PAGE.left - PAGE.right; }
  newPage() {
    this.ops = [];
    this.pages.push(this.ops);
    this.y = PAGE.height - PAGE.top;
    if (this.pages.length > 1) {
      this.textAt(this.runningTitle, PAGE.left, PAGE.height - 34, 8, false, COLORS.muted);
      this.rule(PAGE.height - 40);
      this.y = PAGE.height - 58;
    }
  }
  ensure(height) { if (this.y - height < PAGE.bottom) this.newPage(); }
  textAt(text, x, y, size, bold = false, color = COLORS.ink) {
    this.ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${rgb(color, 'rg')} ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdf(toWinAnsi(text))}) Tj ET`);
  }
  rect(x, y, w, h, color) { this.ops.push(`${rgb(color, 'rg')} ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`); }
  rule(y, color = COLORS.line) { this.ops.push(`${rgb(color, 'RG')} 0.6 w ${PAGE.left} ${y.toFixed(2)} m ${PAGE.width - PAGE.right} ${y.toFixed(2)} l S`); }
  /** Párrafo con sangría francesa opcional; nunca deja una línea por debajo del margen inferior. */
  paragraph(text, {size = 9.5, bold = false, color = COLORS.ink, indent = 0, hanging = '', gap = 2} = {}) {
    const lead = size * 1.35;
    const hangWidth = hanging ? textWidth(`${hanging} `, size, bold) : 0;
    const lines = wrapText(text, size, this.width - indent - hangWidth, bold);
    lines.forEach((line, i) => {
      this.ensure(lead);
      this.y -= lead;
      if (i === 0 && hanging) this.textAt(hanging, PAGE.left + indent, this.y, size, bold, color);
      this.textAt(line, PAGE.left + indent + hangWidth, this.y, size, bold, color);
    });
    this.y -= gap;
  }
  heading(text) {
    this.ensure(46); // evita títulos huérfanos al pie de página
    this.y -= 14;
    this.textAt(text.toUpperCase(), PAGE.left, this.y - 11, 10.5, true, COLORS.accent);
    this.y -= 16;
    this.rule(this.y, COLORS.accent);
    this.y -= 2;
  }
  keyValue(key, value) {
    const size = 9.5, keyWidth = 172, lead = size * 1.35;
    const keys = wrapText(key, size, keyWidth - 8, true);
    const lines = wrapText(value || '—', size, this.width - keyWidth);
    for (let i = 0; i < Math.max(keys.length, lines.length); i++) {
      this.ensure(lead);
      this.y -= lead;
      if (keys[i]) this.textAt(keys[i], PAGE.left, this.y, size, true, COLORS.muted);
      if (lines[i]) this.textAt(lines[i], PAGE.left + keyWidth, this.y, size);
    }
  }
  box(lines, {fill, color, size = 9.5, boldFirst = true}) {
    const lead = size * 1.4;
    const wrapped = lines.flatMap((l, i) => wrapText(l, i === 0 && boldFirst ? size + 3 : size, this.width - 24, i === 0 && boldFirst).map(t => ({t, first: i === 0})));
    const height = wrapped.length * lead + (boldFirst ? 18 : 14);
    if (height < PAGE.height - PAGE.top - PAGE.bottom) this.ensure(height + 8);
    this.y -= 8;
    this.rect(PAGE.left, this.y - height, this.width, height, fill);
    let y = this.y - 8;
    wrapped.forEach(({t, first}) => {
      const s = first && boldFirst ? size + 3 : size;
      y -= first && boldFirst ? lead + 3 : lead;
      this.textAt(t, PAGE.left + 12, y, s, first && boldFirst, color);
    });
    this.y -= height;
  }
}


/** Genera el PDF del informe a partir de la estructura única cmo-report/1. Devuelve Uint8Array. */
export function reportToPdf(r) {
  const T = labelsFor(r.locale);
  const toolLabel = `${r.tool.name}${r.tool.version ? ` v${r.tool.version}` : ''}`;
  const header = reportHeader(r);
  const dateText = header.find(([k]) => k === T.hDate)?.[1] || '';
  const L = new Layout(`${r.title} · ${r.patientId ? `${T.patient} ${r.patientId} · ` : ''}${dateText}`);
  L.rect(0, PAGE.height - 92, PAGE.width, 92, COLORS.ink);
  // Franja de estratos C·M·O (identidad; nunca codifica resultados)
  [[0.18, 0.28, 0.72, 0, 0.5], [0.45, 0.23, 0.63, 0.52, 0.28], [0.05, 0.4, 0.5, 0.82, 0.18]].forEach(([cr, cg, cb, x, w]) => L.rect(PAGE.left + x * 160, PAGE.height - 30, w * 160, 3, [cr, cg, cb]));
  L.textAt(r.title, PAGE.left, PAGE.height - 54, 15, true, COLORS.white);
  L.textAt(`${T.kind} · ${toolLabel}`, PAGE.left, PAGE.height - 72, 9, false, COLORS.white);
  L.y = PAGE.height - 104;
  header.forEach(([k, v]) => L.keyValue(k, v));

  const s = r.stratification;
  const level = LEVELS[s.levelCode] || {ink: COLORS.accent, bg: COLORS.soft};
  const score = s.score === null ? '' : `Puntuación total ${s.score}${s.maxScore === null ? '' : `/${s.maxScore}`} · `;
  L.box([resultLine(r), `${score}Resultado calculado por el modelo: ${s.calculatedLevel}`,
    ...(s.override ? [`Modificado por criterio profesional a ${s.override.level}`] : [])], {fill: level.bg, color: level.ink});

  reportSections(r).forEach(section => {
    L.heading(section.title);
    section.lines.forEach(l => {
      if (l.kind === 'kv') L.keyValue(l.key, l.text);
      else if (l.kind === 'sub') { L.ensure(40); L.paragraph(l.text, {bold: true, size: 9.5, gap: 1}); }
      else if (l.kind === 'warn') L.paragraph(l.text, {hanging: '!', indent: 4, color: COLORS.warnInk});
      else L.paragraph(l.text, {hanging: '•', indent: 6, size: 9.5});
    });
  });

  const [generated, disclaimer] = footerLines(r);
  L.y -= 6;
  L.box([T.notice, disclaimer], {fill: COLORS.warn, color: COLORS.warnInk, size: 8.5});
  L.paragraph(generated, {size: 8, color: COLORS.muted});

  const total = L.pages.length;
  L.pages.forEach((ops, index) => {
    L.ops = ops;
    L.rule(PAGE.bottom - 18);
    L.textAt(`${toolLabel} · ${T.support}`, PAGE.left, PAGE.bottom - 32, 7.5, false, COLORS.muted);
    const label = T.page(index + 1, total);
    L.textAt(label, PAGE.width - PAGE.right - textWidth(label, 7.5), PAGE.bottom - 32, 7.5, false, COLORS.muted);
  });
  return buildPdf(L.pages, r.title, r.tool.name);
}

function buildPdf(pages, title, producer) {
  const objects = [];
  const add = body => { objects.push(body); return objects.length; };
  const catalog = add(null), pagesId = add(null);
  const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const kids = pages.map(ops => {
    const stream = ops.join('\n');
    const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    return add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${content} 0 R >>`);
  });
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map(k => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;
  const info = add(`<< /Title (${escapePdf(toWinAnsi(title))}) /Producer (${escapePdf(toWinAnsi(producer))}) >>`);
  let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const offsets = objects.map((body, index) => { const offset = out.length; out += `${index + 1} 0 obj\n${body}\nendobj\n`; return offset; });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new Uint8Array(out.length);
  for (let k = 0; k < out.length; k++) bytes[k] = out.charCodeAt(k) & 0xff;
  return bytes;
}
