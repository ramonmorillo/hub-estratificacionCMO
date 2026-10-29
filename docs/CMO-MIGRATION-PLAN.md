# Plan de extensión por repositorio

Orden de menor a mayor riesgo y complejidad. Cada fila es **una rama y un PR** en su propio repositorio, que solo se abre con autorización expresa del titular.

| Fase | Herramienta | Por qué en este orden | Prerrequisitos específicos | Complejidad |
|---|---|---|---|---|
| 0 ✅ | Hub | Sin lógica clínica | — | Baja |
| 1 🟡 | **CMO-Respiratorio** (piloto clínico; PR ramonmorillo/cmorespiratorio#8, CI en verde) | La más madura: CI, e2e, pruebas de interfaz y documentación legal. Detectará cualquier regresión del DOM | Hecho: copia en `src/cmo-ds/` (`--dest src/cmo-ds`), copia recursiva en `scripts/build.js` y control de red ampliado | Media |
| 2 🟡 | Pediatría (ramonmorillo/cmopediatria#6), Oncohematología (ramonmorillo/cmoncologia#6), Migraña (ramonmorillo/estratificacionmigrana#12) | Misma arquitectura de build que Respiratorio | Hecho; ver «Resultado de la fase 2» | Media |
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

## Resultado del piloto Respiratorio (2026-10-29)

| Comprobación | Antes | Después |
|---|---|---|
| Pruebas unitarias | 46/46 | 50/50 (+4 de `tests/cmo-ds.test.js`) |
| e2e (Chromium) | 10/10 | 10/10 |
| Texto HCE y PDF del caso P1 (37/59, Prioridad 1) | — | Idénticos; solo cambia la hora de la evaluación |
| axe WCAG A/AA (inicio, 375 y 1280 px) | 0 | 0 |
| Contorno de foco / borde de campos | 1,6:1 / 1,7:1 ❌ | 9,4:1 / ≥3:1 ✅ |
| Peticiones externas | 0 | 0 |
| Ficheros clínicos en el diff | — | Ninguno |

Decisiones pendientes del autor: (1) versión 1.2.0 → 1.3.0 (requiere editar `VERSION` en `src/clinical.js`, que se propaga a las exportaciones y al PDF, y el texto del pie que fija `interface.test.js`); (2) titular del © del código (hoy no se muestra ©); (3) si el banner de prioridad debe adoptar `.cmo-level`, lo que exige tocar `app.js` y una revisión clínica.

## Resultado de la fase 2 (2026-10-29)

Patrón común: copia fijada en `src/cmo-ds/` (Migraña: `cmo-migrana-app/src/cmo-ds/`) y `cmo-visual.css` reescrito o creado como tema «Estratos», cargado después de los estilos propios de la app. Firma desde `cmo-app-meta` y `tests/cmo-ds.test.*`. Ningún fichero clínico ni JS de aplicación modificado.

Sin e2e en estos repositorios, la seguridad clínica se verifica con `cmo-design-system/tools/cmo-parity.mjs`: misma semilla en ambas versiones y comparación del `textContent`, los valores y el `localStorage`. El arnés se validó en cada app con una mutación de umbral.

| | Pediatría | Oncohematología | Migraña |
|---|---|---|---|
| Pruebas unitarias antes → después | 23 → 27 ✅ | 39 → 43 ✅ | 67 → 71 ✅ |
| Paridad (25 semillas) | 25/25 | 25/25 (tras «Finalizar») | 25/25 (tras «Guardar») |
| Detección de la mutación de umbral | 7/25 | — (mismo arnés) | 10/25 |
| axe antes → después | `select-name`(20) + `scrollable-region`(1) → igual (previos, en `app.js`) | 0 → 0 | 0 → 0 |
| Desbordamiento a 375 px | 0 → 0 (corregida una regresión de 3 px durante el trabajo) | **58 → 0** | 0 → 0 |
| Foco / borde de campos | 1,6 / 1,9:1 → 9,4 / ≥3:1 | 1,6 / 2,1:1 → 9,4 / ≥3:1 | 1,6 / 2,4:1 → 9,4 / ≥3:1 |

Hallazgos:

- **Pediatría:** la única rama, y la que se publica, es `claude/awesome-cray-vilcvr`; no hay `main`. Además, el documento SEFH lo coordinan Ramón Morillo Verdugo y Maite Pozas del Río (`CLINICAL_RULES.md`), y ambos aparecen en la firma.
- **Oncohematología:** no tenía pie; se añade uno con enlaces a `LEGAL_NOTICE.md` y `PRIVACY.md`.
- **Migraña:** no declara el documento fuente ni los autores del modelo, así que la firma solo acredita el desarrollo digital y la versión del algoritmo (v1.0).

## Siguiente paso concreto

Revisar y fusionar los 4 PR clínicos. Después, fase 3 (EM y RCV) con el mismo procedimiento y arnés.
