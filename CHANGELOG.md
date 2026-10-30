# Changelog — Hub de Estratificación CMO

Formato SemVer. Las versiones anteriores a 1.0.0 no estaban numeradas y se identifican por su commit.

## 1.0.0 — sin publicar (pendiente de fecha real de publicación)
- Nueva identidad «CMO Design System» 0.1.0 (sustituye a la paleta de referencia SEFH del commit `1b329fa`).
- Firma de autoría y versión basada en metadatos controlados. Se retiran las fechas «Febrero 2026» y «Septiembre-2026», que no coincidían con el historial.
- Nueva página `legal.html` (aviso legal, privacidad, cookies, condiciones, transparencia y accesibilidad), con pendientes marcados.
- Accesibilidad: enlace de salto, chips con `aria-pressed` y ✓, enlaces externos anunciados, búsqueda `type=search`, 0 infracciones axe.
- `cmo-parity.mjs`: pasos `PICK@`, `TYPE@`, `EACH@` (con `EACHDENS`, `EACHSKIP`) y `DLG` para asistentes con campos obligatorios y confirmación fila a fila (fase 6).
- Sin cambios en el catálogo: mismas 10 herramientas, URLs, categorías y lógica de búsqueda (verificado en `tests/hub.e2e.mjs`).

## Anteriores (sin versión)
- `9369b30` (2026-10-26) Rediseño con la paleta de referencia SEFH. · `786301d` (2026-10-16) Cloudflare Web Analytics. · Primer commit: 2026-03-24.
