/*!
 * CMO Core — flujo asistencial común (navegador). Sin dependencias ni red.
 * Capacidades transversales, independientes de la patología: navegación por etapas con
 * indicador de progreso, avisos, confirmación de operaciones destructivas, protección
 * frente a la pérdida accidental de datos, copia al portapapeles, descarga e impresión.
 * No contiene lógica clínica. Patrón de referencia: CMO Respiratorio 1.3.0.
 */

/** Las 7 etapas del circuito común. Cada herramienta puede renombrarlas, no reordenarlas. */
export const STAGES = Object.freeze(['Inicio', 'Historia clínica', 'Revisión', 'Estratificación', 'Necesidades', 'Intervenciones', 'Informe']);

/**
 * Navegación por etapas.
 *   nav     contenedor con <button data-go="n">
 *   stages  elementos [data-stage="n"]
 *   canEnter(n, from) → true | 'mensaje de bloqueo'
 *   onEnter(n, from)  se llama después de mostrar la etapa
 */
export function createStepper({ nav, stages, initial = 1, canEnter = () => true, onEnter = () => {}, announce = () => {} }) {
  const list = [...stages];
  const buttons = [...nav.querySelectorAll('[data-go]')];
  let current = 0;
  let furthest = initial;
  const paint = () => {
    list.forEach(s => { const on = Number(s.dataset.stage) === current; s.hidden = !on; s.classList.toggle('is-active', on); });
    buttons.forEach(b => {
      const n = Number(b.dataset.go);
      b.classList.toggle('is-done', n < current);
      b.classList.toggle('is-reachable', n <= furthest);
      if (n === current) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    nav.dataset.current = String(current);
    nav.style.setProperty('--cmo-progress', String((current - 1) / Math.max(1, list.length - 1)));
  };
  const go = (n, { focus = true } = {}) => {
    n = Math.min(list.length, Math.max(1, Number(n) || 1));
    if (n === current) return true;
    const verdict = canEnter(n, current);
    if (verdict !== true) { if (verdict) toast(verdict, { type: 'warn' }); return false; }
    const from = current;
    current = n;
    furthest = Math.max(furthest, n);
    paint();
    onEnter(n, from);
    const stage = list.find(s => Number(s.dataset.stage) === n);
    if (focus && from && stage) {
      const heading = stage.querySelector('h2');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
      (stage.closest('main') || stage).scrollIntoView({ block: 'start' });
      announce(`Paso ${n} de ${list.length}: ${heading?.textContent || ''}`);
    }
    return true;
  };
  nav.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-next],[data-back]');
    if (b) go(b.dataset.next || b.dataset.back);
  });
  go(initial, { focus: false });
  return { go, get current() { return current; }, reset() { furthest = 1; current = 0; go(1, { focus: false }); } };
}

let toastTimer;
/** Aviso no bloqueante (role=status / alert). Un único elemento reutilizado. */
export function toast(message, { type = 'info', timeout = 6000 } = {}) {
  let el = document.querySelector('.cmo-toast');
  if (!el) { el = document.createElement('div'); el.className = 'cmo-toast'; document.body.append(el); }
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  el.dataset.type = type;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, timeout);
  return el;
}

/** Confirmación accesible (<dialog>) para operaciones destructivas. Devuelve Promise<boolean>. */
export function confirmDialog({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false }) {
  if (typeof HTMLDialogElement === 'undefined') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise(resolve => {
    const d = document.createElement('dialog');
    d.className = 'cmo-modal cmo-scope';
    const h = document.createElement('h2'); h.textContent = title; h.id = `cmo-dlg-${Date.now()}`;
    const p = document.createElement('p'); p.textContent = message;
    const actions = document.createElement('div'); actions.className = 'cmo-modal__actions';
    const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'cmo-btn cmo-btn--secondary'; cancel.textContent = cancelLabel; cancel.value = 'cancel';
    const ok = document.createElement('button'); ok.type = 'button'; ok.className = `cmo-btn${danger ? ' cmo-btn--danger' : ''}`; ok.textContent = confirmLabel; ok.value = 'ok';
    actions.append(cancel, ok); d.append(h, p, actions);
    d.setAttribute('aria-labelledby', h.id);
    const done = value => { d.close(); d.remove(); resolve(value); };
    cancel.addEventListener('click', () => done(false));
    ok.addEventListener('click', () => done(true));
    d.addEventListener('cancel', e => { e.preventDefault(); done(false); });
    document.body.append(d);
    d.showModal();
    cancel.focus();
  });
}

/** Aviso del navegador al salir si hay datos sin guardar. Devuelve la función para desactivarlo. */
export function guardUnsaved(isDirty) {
  const handler = e => { if (isDirty()) { e.preventDefault(); e.returnValue = ''; } };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}

/** Copia al portapapeles con alternativa para contextos sin API asíncrona. Devuelve Promise<boolean>. */
export async function copyText(text) {
  try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; } } catch { /* alternativa */ }
  const ta = document.createElement('textarea');
  ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.append(ta); ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove();
  return ok;
}

/** Descarga local de un contenido generado en el navegador (texto o bytes). */
export function download(filename, content, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.rel = 'noopener';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const PRINT_CSS = 'body{font:11pt/1.45 system-ui,Arial,sans-serif;color:#14203a;margin:16mm}h1{font-size:16pt;margin:0 0 2mm}h2{font-size:11pt;text-transform:uppercase;letter-spacing:.03em;color:#1f3aa8;border-bottom:1px solid #1f3aa8;margin:6mm 0 2mm;padding-bottom:1mm}dl{margin:3mm 0}dl div{display:flex;gap:4mm}dt{font-weight:700;min-width:62mm;color:#4b5568}dd{margin:0}ul{margin:0;padding-left:5mm}li{margin:.6mm 0}.cmo-report__result{font-size:13pt;font-weight:700;padding:3mm 4mm;border:1px solid #14203a;margin:4mm 0}.cmo-report__sub{font-weight:700;margin:2mm 0 1mm}.cmo-report__warn{color:#93500a}.cmo-report__tool,footer{font-size:9pt;color:#4b5568}footer{margin-top:6mm;border-top:1px solid #dedbd2;padding-top:2mm}section{break-inside:avoid-page}';

/** Imprime SOLO el informe (HTML ya escapado por cmo-report.js) mediante un iframe aislado. */
export function printHtml(html, title = 'Informe') {
  document.querySelector('iframe.cmo-print-frame')?.remove();
  const frame = document.createElement('iframe');
  frame.className = 'cmo-print-frame';
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden';
  frame.srcdoc = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title.replace(/[<>&]/g, '')}</title><style>${PRINT_CSS}</style></head><body>${html}</body></html>`;
  frame.addEventListener('load', () => {
    document.dispatchEvent(new CustomEvent('cmo:print', { detail: { title } }));
    try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch { window.print(); }
  }, { once: true });
  document.body.append(frame);
  return frame;
}

/** Nombre de fichero seguro a partir de piezas (sin identificadores directos: lo decide quien llama). */
export const safeFilename = (...parts) => parts.filter(Boolean).join('-').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
