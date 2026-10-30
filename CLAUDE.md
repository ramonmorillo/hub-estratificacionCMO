# CLAUDE.md — hub-estratificacionCMO

Repositorio del hub y fuente canónica del **CMO Design System** (`cmo-design-system/`).

## Reglas
- No modificar lógica clínica de ninguna herramienta: ver `docs/CMO-CLINICAL-SAFETY.md`.
- Las herramientas usan una copia fijada (`vendor/cmo-ds/`, vía `tools/cmo-ds-sync.mjs`); nunca se enlazan en caliente al hub.
- Fechas de versión: solo de `cmo-app-meta.releaseDate`, fijadas en el commit de publicación. Nunca `new Date()`.
- No inventar datos legales, autorías ni validaciones: usar `[PENDIENTE: …]`.
- Estilos nuevos: dentro de `@layer cmo.*`, con clases `.cmo-*`, sin `!important`; nada de fuentes ni scripts de terceros.

## Pruebas
- `node --test cmo-design-system/tests/signature.test.mjs`
- `AXE_PATH=<ruta axe.min.js> node tests/hub.e2e.mjs` (Playwright preinstalado; axe opcional)
- `node cmo-design-system/tools/cmo-release-check.mjs index.html legal.html`
