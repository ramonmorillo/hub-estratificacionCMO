# Plan de extensión por repositorio

Orden de menor a mayor riesgo y complejidad. Cada fila es **una rama y un PR** en su propio repositorio, que solo se abre con autorización expresa del titular.

| Fase | Herramienta | Por qué en este orden | Prerrequisitos específicos | Complejidad |
|---|---|---|---|---|
| 0 ✅ | Hub | Sin lógica clínica | — | Baja |
| 1 | **CMO-Respiratorio** (piloto clínico) | La más madura: CI, e2e, pruebas de interfaz y documentación legal. Detectará cualquier regresión del DOM | Incluir `vendor/` en `scripts/build.js`; el build bloquea `fetch`, pero el sistema de diseño no lo usa | Media |
| 2 | Pediatría, Oncohematología, Migraña | Misma arquitectura de build que Respiratorio | Migraña: copiar a la raíz de Pages (`build-pages.mjs`) | Media |
| 3 | EM, RCV | Pocas líneas; pruebas existentes | EM: añadir versión | Baja |
| 4 | VIH | i18n es/en/pt: las etiquetas de la firma se traducen en los JSON de i18n (pendiente de extender el componente) | Extender la firma con `lang` | Media |
| 5 | Coagulopatías | React + TypeScript | Fijar dependencias (H9) antes de nada | Media |
| 6 | Inmunomediadas, VHB-VHD | **Sin pruebas** | Casos de referencia (CMO-CLINICAL-SAFETY §2.2); VHB-VHD: retirar el CDN (H3) y la frase regulatoria (H2) | Media-alta |

## Pasos por herramienta (lista corta)

1. Rama `design/cmo-ds-0.1.0` y línea base de pruebas.
2. `cmo-ds-sync.mjs` y añadir `<link>` y la firma **adicionales**. La capa `cmo-visual.css` antigua se retira en el mismo PR solo si no rompe el diseño; si no, se retira en un PR posterior.
3. Pie: `<cmo-author-signature>` + enlaces legales; página `legal.html` específica.
4. `cmo-app-meta` con `appVersion` (bump *minor*), `algorithm.version` **sin cambios** y `status: "draft"`.
5. Pruebas antes y después (deben ser idénticas), axe, capturas a 375 y 1280 px.
6. PR revisado; al fusionar, poner `status: "released"` y la fecha real, en un commit de publicación.

## Siguiente paso concreto

Autorizar la rama `design/cmo-ds-0.1.0` en `ramonmorillo/cmorespiratorio` para el piloto clínico.
