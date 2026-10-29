# CMO Design System

Identidad visual compartida de las herramientas de estratificación CMO. Versión en `VERSION` (SemVer).

- `src/cmo-tokens.css`, `src/cmo-components.css`: estilos en `@layer cmo.*`, clases `.cmo-*`, sin `!important`.
- `src/cmo-author-signature.js`: `<cmo-author-signature>`, la firma de autoría y versión a partir de metadatos `cmo-app-meta/1`.
- `assets/`: sello «Estratos» y favicon.
- `tools/cmo-ds-sync.mjs`: copia fijada en una herramienta (`--check` verifica la integridad).
- `tools/cmo-release-check.mjs`: control previo a publicación.

Documentación: `../docs/CMO-DESIGN-SYSTEM.md` y `../docs/CMO-COMPONENT-ARCHITECTURE.md`.
Pruebas: `node --test tests/signature.test.mjs`.
