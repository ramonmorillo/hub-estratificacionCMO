# Lista de control previa a publicación

Marque cada punto con evidencia (comando + resultado) en la descripción del PR.

## Automático

- [ ] `node --test cmo-design-system/tests/signature.test.mjs` → 10/10
- [ ] `AXE_PATH=… node tests/hub.e2e.mjs` → todas las comprobaciones sin fallo, incluida axe
- [ ] `node cmo-design-system/tools/cmo-release-check.mjs index.html legal.html` → sin ERROR (con `--strict` → sin avisos)
- [ ] En las herramientas: batería existente idéntica a la línea base y `cmo-ds-sync.mjs . --check` correcto
- [ ] El diff no contiene ficheros clínicos (CMO-CLINICAL-SAFETY §2.3)

## Manual

- [ ] `cmo-app-meta`: `status: "released"` y `releaseDate` = fecha real de la publicación, en **todas** las páginas que la incluyan (hoy, `index.html` y `legal.html`)
- [ ] `CHANGELOG.md` actualizado; `algorithm.version` sin cambios salvo una decisión clínica documentada
- [ ] Marcadores `[PENDIENTE…]` resueltos o aceptados conscientemente por el titular
- [ ] Revisión visual a 375 y 1280 px; navegación completa con teclado; una pasada con lector de pantalla
- [ ] Sin credenciales en el diff (el token de Cloudflare es una clave pública de *beacon*, no un secreto)
- [ ] Sin afirmaciones de validación, aval institucional ni marcado CE no acreditadas

## Evidencia del hub (2026-10-29, rama `claude/determined-thompson-my7j5j`)

| Prueba | Resultado |
|---|---|
| Firma (unitarias) | 7/7 |
| e2e hub (11 comprobaciones, incluida axe-core 4.10.2 WCAG A/AA) | 11/11 |
| Prueba de mutación (URL y categoría alteradas) | Detectada (3 fallos esperados) |
| release-check | Apto con avisos: `status=draft` + marcadores [PENDIENTE] en `legal.html` |
| Lector de pantalla real | **No ejecutado** (no disponible en el entorno) |
| Navegadores distintos de Chromium | **No ejecutado** |
