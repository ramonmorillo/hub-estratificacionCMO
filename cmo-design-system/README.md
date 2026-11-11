# CMO Design System

Identidad visual compartida de las herramientas de estratificación CMO. Versión en `VERSION` (SemVer).

- `src/cmo-tokens.css`, `src/cmo-components.css`: estilos en `@layer cmo.*`, clases `.cmo-*`, sin `!important`.
- `src/cmo-author-signature.js`: `<cmo-author-signature>`, la firma de autoría y versión a partir de metadatos `cmo-app-meta/1`.
- `src/cmo-report.js`, `src/cmo-pdf.js`, `src/cmo-flow.js`, `src/cmo-flow.css`: **núcleo del flujo asistencial común** (informe único, PDF, etapas). Sin lógica clínica; ver `../docs/ECOSISTEMA_CMO_ARCHITECTURE.md`.
- `assets/`: sello «Estratos» y favicon.
- `tools/cmo-ds-sync.mjs`: copia fijada en una herramienta (`--check` verifica la integridad).
- `tools/cmo-release-check.mjs`: control previo a publicación.
- `tools/cmo-parity.mjs`: arnés de paridad clínica antes/después para cada migración (validarlo con una mutación).

Documentación: `../docs/CMO-DESIGN-SYSTEM.md` y `../docs/CMO-COMPONENT-ARCHITECTURE.md`.
Pruebas: `node --test cmo-design-system/tests/*.mjs` (desde la raíz del hub).
