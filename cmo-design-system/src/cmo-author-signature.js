/*!
 * CMO Design System — <cmo-author-signature>  ·  v0.1.0
 *
 * Firma de autoría y versión a partir de metadatos CONTROLADOS (nunca de la
 * fecha del ordenador ni de la compilación). Lee un bloque JSON en línea:
 *
 *   <script type="application/json" id="cmo-app-meta">{ ... }</script>
 *   <cmo-author-signature meta="cmo-app-meta" variant="full|compact"></cmo-author-signature>
 *
 * Sin red, sin almacenamiento, sin innerHTML con datos: solo textContent.
 * Esquema documentado en docs/CMO-COMPONENT-ARCHITECTURE.md §3.
 */

export const SIGNATURE_VERSION = '0.1.0';
const LINE = 'CMO | Estratificación farmacoterapéutica';
const MODEL_DEFAULT = 'Basado en el modelo CMO: Capacidad, Motivación y Oportunidad.';
const PENDING = 'pendiente de publicación';

/** 'AAAA-MM-DD' → 'DD/MM/AAAA'. Sin objetos Date: evita desfases de zona horaria. */
export function formatIsoDate(iso) {
  const m = typeof iso === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [, y, mo, d] = m;
  if (+mo < 1 || +mo > 12 || +d < 1 || +d > 31) return null;
  return `${d}/${mo}/${y}`;
}

/** Modelo puro (testeable) de la firma. Nunca inventa datos: lo ausente se omite o se marca pendiente. */
export function buildSignatureModel(meta = {}) {
  const issues = [];
  const rows = [];
  for (const c of Array.isArray(meta.credits) ? meta.credits : []) {
    if (c && c.role && c.name) rows.push({ term: c.role, value: c.name });
  }
  if (meta.algorithm && meta.algorithm.name && meta.algorithm.version) {
    rows.push({ term: 'Algoritmo', value: `${meta.algorithm.name} v${meta.algorithm.version}` });
  }
  if (meta.appVersion) rows.push({ term: 'Versión', value: String(meta.appVersion) });
  else issues.push('appVersion ausente');

  const released = meta.status === 'released' ? formatIsoDate(meta.releaseDate) : null;
  if (meta.status === 'released' && !released) issues.push('releaseDate inválida para status "released"');
  rows.push({ term: 'Última actualización', value: released || PENDING, pending: !released });

  const review = formatIsoDate(meta.clinicalReviewDate);
  if (review) rows.push({ term: 'Revisión clínica', value: review });

  const cp = meta.copyright;
  const holders = cp && Array.isArray(cp.holders) ? cp.holders.filter(Boolean) : [];
  const copyright = cp && cp.year && holders.length ? `© ${cp.year} – ${holders.join(', ')}` : null;

  return {
    line: LINE,
    product: meta.name || null,
    model: meta.model || MODEL_DEFAULT,
    rows,
    copyright,
    website: meta.website || null,
    issues
  };
}

const MARK = '<svg class="cmo-signature__mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect width="48" height="48" rx="11" fill="#14203a"/><rect x="11" y="13" width="26" height="5" rx="2.5" fill="#9aabff"/><rect x="11" y="21.5" width="18" height="5" rx="2.5" fill="#cfa6ee"/><rect x="11" y="30" width="10" height="5" rx="2.5" fill="#73cbe0"/></svg>';

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

if (typeof customElements !== 'undefined' && !customElements.get('cmo-author-signature')) {
  customElements.define('cmo-author-signature', class extends HTMLElement {
    connectedCallback() {
      const src = document.getElementById(this.getAttribute('meta') || 'cmo-app-meta');
      let meta = {};
      try { meta = src ? JSON.parse(src.textContent) : {}; } catch (e) { console.warn('[cmo-author-signature] JSON de metadatos inválido', e); }
      const m = buildSignatureModel(meta);
      if (m.issues.length) console.warn('[cmo-author-signature]', m.issues.join('; '));

      const root = el('div', 'cmo-signature' + (this.getAttribute('variant') === 'compact' ? ' cmo-signature--compact' : ''));
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', 'Autoría y versión');
      root.insertAdjacentHTML('afterbegin', MARK); // SVG estático, sin datos
      const head = el('div');
      head.append(el('p', 'cmo-signature__product', m.product ? `${m.line} · ${m.product}` : m.line));
      const dl = el('dl', 'cmo-signature__rows');
      for (const r of m.rows) {
        const w = el('div');
        w.append(el('dt', null, r.term), el('dd', r.pending ? 'cmo-signature__pending' : null, r.value));
        dl.append(w);
      }
      const body = el('div');
      body.append(dl, el('p', 'cmo-signature__rows', m.model));
      const tail = el('p', 'cmo-signature__rows');
      if (m.copyright) tail.append(m.copyright);
      if (m.website) {
        const a = el('a', null, m.website.replace(/^https?:\/\//, '').replace(/\/$/, ''));
        a.href = m.website;
        tail.append(m.copyright ? ' · ' : '', a);
      }
      if (tail.childNodes.length) body.append(tail);
      root.append(head, body);
      this.replaceChildren(root);
    }
  });
}
