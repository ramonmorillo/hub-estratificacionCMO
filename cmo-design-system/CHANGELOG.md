# Changelog — CMO Design System

## 0.3.0 — sin publicar
- **Núcleo transversal del flujo asistencial** (opt-in; aditivo y compatible con 0.2.0):
  - `src/cmo-report.js`: modelo único de informe `cmo-report/1` (texto para HCE, HTML de impresión), sobre de exportación `cmo-export/1`, importación validada y CSV con protección frente a fórmulas.
  - `src/cmo-pdf.js`: PDF 1.4 local y sin dependencias a partir de `cmo-report/1` (motor derivado de CMO Respiratorio 1.3.0).
  - `src/cmo-flow.js` + `src/cmo-flow.css`: navegación por 7 etapas, avisos, confirmación de operaciones destructivas, aviso al salir, copia, descarga e impresión aislada; componentes `.cmo-stepper`, `.cmo-stage`, `.cmo-status`, `.cmo-tristate`, `.cmo-review`, `.cmo-toast`, `.cmo-report`.
- `tools/cmo-ds-sync.mjs` copia también estos ficheros. Las herramientas con la copia 0.2.0 no cambian hasta que se sincronicen.
- Pruebas: `tests/core.test.mjs`.

## 0.2.0 — sin publicar
- `<cmo-author-signature>` multilingüe (es/en/pt): etiquetas propias, `lang` del elemento o de `<html>` (pt-BR → pt) y repintado al cambiar `<html lang>`. Textos del esquema localizables con `{ es, en, pt }`; si falta el idioma, se usa el español.
- En inglés las fechas se muestran en ISO (AAAA-MM-DD) para evitar la ambigüedad DD/MM.
- Compatible con 0.1.0: los metadatos existentes se muestran igual en español.

## 0.1.0 — sin publicar
- Primera versión: tokens «Estratos», componentes base, `<cmo-author-signature>`, sello y favicon, herramientas de sincronización y control de publicación.
- Token `--cmo-brand-soft` (#eef1fb), añadido durante el piloto Respiratorio.
- `tools/cmo-parity.mjs`: arnés de paridad usado en la fase 2.
