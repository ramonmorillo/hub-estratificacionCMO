/*!
 * CMO Design System — <cmo-author-signature>  ·  v0.2.0
 *
 * Firma de autoría y versión a partir de metadatos CONTROLADOS (nunca de la
 * fecha del ordenador ni de la compilación). Lee un bloque JSON en línea:
 *
 *   <script type="application/json" id="cmo-app-meta">{ ... }</script>
 *   <cmo-author-signature meta="cmo-app-meta" variant="full|compact" [lang="es|en|pt"]></cmo-author-signature>
 *
 * Idioma: atributo lang propio o, si no existe, el de <html> (es por defecto).
 * Se vuelve a pintar cuando la aplicación cambia <html lang>. Cualquier texto
 * del esquema (name, model, credits[].role, credits[].name) admite un objeto
 * { es, en, pt }; si falta el idioma se usa el español.
 *
 * Sin red, sin almacenamiento, sin innerHTML con datos: solo textContent.
 * Esquema documentado en docs/CMO-COMPONENT-ARCHITECTURE.md §3.
 */

export const SIGNATURE_VERSION = '0.2.0';

const LABELS = {
  es: { line: 'CMO | Estratificación farmacoterapéutica', algorithm: 'Algoritmo', version: 'Versión',
    updated: 'Última actualización', review: 'Revisión clínica', pending: 'pendiente de publicación',
    model: 'Basado en el modelo CMO: Capacidad, Motivación y Oportunidad.', group: 'Autoría y versión' },
  en: { line: 'CMO | Pharmacotherapeutic stratification', algorithm: 'Algorithm', version: 'Version',
    updated: 'Last update', review: 'Clinical review', pending: 'pending release',
    model: 'Based on the CMO model: Capacity, Motivation and Opportunity.', group: 'Authorship and version' },
  pt: { line: 'CMO | Estratificação farmacoterapêutica', algorithm: 'Algoritmo', version: 'Versão',
    updated: 'Última atualização', review: 'Revisão clínica', pending: 'publicação pendente',
    model: 'Baseado no modelo CMO: Capacidade, Motivação e Oportunidade.', group: 'Autoria e versão' }
};

/** 'pt-BR' → 'pt', 'en-GB' → 'en'; cualquier otro valor → 'es'. */
export function resolveLang(lang) {
  const base = String(lang || '').toLowerCase().split('-')[0];
  return Object.hasOwn(LABELS, base) ? base : 'es';
}

const localize = (value, lang) =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value[lang] ?? value.es ?? Object.values(value)[0]) : value;

/** 'AAAA-MM-DD' → 'DD/MM/AAAA'. Sin objetos Date: evita desfases de zona horaria. */
export function formatIsoDate(iso) {
  const m = typeof iso === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [, y, mo, d] = m;
  if (+mo < 1 || +mo > 12 || +d < 1 || +d > 31) return null;
  return `${d}/${mo}/${y}`;
}
// En inglés se muestra ISO (AAAA-MM-DD): DD/MM sería ambiguo para lectores de EE. UU.
const formatDate = (iso, lang) => (formatIsoDate(iso) && lang === 'en' ? iso : formatIsoDate(iso));

/** Modelo puro (testeable) de la firma. Nunca inventa datos: lo ausente se omite o se marca pendiente. */
export function buildSignatureModel(meta = {}, lang = 'es') {
  const L = LABELS[resolveLang(lang)];
  const lg = resolveLang(lang);
  const issues = [];
  const rows = [];
  for (const c of Array.isArray(meta.credits) ? meta.credits : []) {
    const role = localize(c && c.role, lg), name = localize(c && c.name, lg);
    if (role && name) rows.push({ term: role, value: name });
  }
  if (meta.algorithm && meta.algorithm.name && meta.algorithm.version) {
    rows.push({ term: L.algorithm, value: `${localize(meta.algorithm.name, lg)} v${meta.algorithm.version}` });
  }
  if (meta.appVersion) rows.push({ term: L.version, value: String(meta.appVersion) });
  else issues.push('appVersion ausente');

  const released = meta.status === 'released' ? formatDate(meta.releaseDate, lg) : null;
  if (meta.status === 'released' && !released) issues.push('releaseDate inválida para status "released"');
  rows.push({ term: L.updated, value: released || L.pending, pending: !released });

  const review = formatDate(meta.clinicalReviewDate, lg);
  if (review) rows.push({ term: L.review, value: review });

  const cp = meta.copyright;
  const holders = cp && Array.isArray(cp.holders) ? cp.holders.map(h => localize(h, lg)).filter(Boolean) : [];
  const copyright = cp && cp.year && holders.length ? `© ${cp.year} – ${holders.join(', ')}` : null;

  return {
    line: L.line,
    group: L.group,
    product: localize(meta.name, lg) || null,
    model: localize(meta.model, lg) || L.model,
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
      this.render();
      if (!this.hasAttribute('lang') && typeof MutationObserver !== 'undefined') {
        this._observer = new MutationObserver(() => this.render());
        this._observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
      }
    }
    disconnectedCallback() { if (this._observer) this._observer.disconnect(); }
    render() {
      const lang = resolveLang(this.getAttribute('lang') || document.documentElement.lang);
      if (this._lang === lang) return;
      this._lang = lang;
      const src = document.getElementById(this.getAttribute('meta') || 'cmo-app-meta');
      let meta = {};
      try { meta = src ? JSON.parse(src.textContent) : {}; } catch (e) { console.warn('[cmo-author-signature] JSON de metadatos inválido', e); }
      const m = buildSignatureModel(meta, lang);
      if (m.issues.length) console.warn('[cmo-author-signature]', m.issues.join('; '));

      const root = el('div', 'cmo-signature' + (this.getAttribute('variant') === 'compact' ? ' cmo-signature--compact' : ''));
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', m.group);
      root.lang = lang;
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
