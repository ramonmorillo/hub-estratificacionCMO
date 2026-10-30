# Plan de extensión por repositorio

Orden de menor a mayor riesgo y complejidad. Cada fila es **una rama y un PR** en su propio repositorio, que solo se abre con autorización expresa del titular.

| Fase | Herramienta | Por qué en este orden | Prerrequisitos específicos | Complejidad |
|---|---|---|---|---|
| 0 ✅ | Hub | Sin lógica clínica | — | Baja |
| 1 ✅ | **CMO-Respiratorio** (piloto clínico; ramonmorillo/cmorespiratorio#8, fusionado el 2026-10-29) | La más madura: CI, e2e, pruebas de interfaz y documentación legal. Detectará cualquier regresión del DOM | Hecho: copia en `src/cmo-ds/` (`--dest src/cmo-ds`), copia recursiva en `scripts/build.js` y control de red ampliado | Media |
| 2 ✅ | Pediatría (ramonmorillo/cmopediatria#6), Oncohematología (ramonmorillo/cmoncologia#6), Migraña (ramonmorillo/estratificacionmigrana#12); fusionados el 2026-10-30 | Misma arquitectura de build que Respiratorio | Hecho; ver «Resultado de la fase 2» | Media |
| 3 ✅ | EM (ramonmorillo/estratificacionEM#4), RCV (ramonmorillo/cmoriesgocardiovascular#4); fusionados el 2026-10-30 | Pocas líneas; pruebas existentes | Hecho; ver «Resultado de la fase 3». EM sigue sin versión declarada | Baja |
| 4 ✅ | VIH (ramonmorillo/cmo-vih-app#13; fusionado el 2026-10-30) | i18n es/en/pt | Hecho con el sistema de diseño 0.2.0 (firma multilingüe); ver «Resultado de la fase 4» | Media |
| 5 🟡 | Coagulopatías (dependencias: ramonmorillo/cmocoagulopatias#7, fusionado; diseño: ramonmorillo/cmocoagulopatias#8, ya con base `main`) | React + TypeScript | Hecho; ver «Resultado de la fase 5» | Media |
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

## Resultado de la fase 3 (2026-10-29)

**Corrección del arnés.** En EM, la primera versión no detectaba la mutación de umbrales: con un 40 % de casillas marcadas, casi todos los casos activaban la prioridad automática (embarazo/lactancia → P1), que enmascara los umbrales. Ahora la densidad de relleno varía con la semilla (10-50 %), y se añadieron los pasos `FILL` (rellenar los campos que aparecen tras un clic) y la sonda `PROBE`. Con la versión corregida se repitió la validación de la fase 2:

| App | Paridad real | Detección de la mutación de umbral |
|---|---|---|
| EM | 40/40 | 9/40 |
| RCV | 40/40 (flujo «Estratificar a mano» → «Calcular») | 9/40 |
| Pediatría | 40/40 | 7/40 |
| Migraña | 150/150 | 11/150 |
| Oncohematología | 150/150 | **1/150**: sensibilidad baja. La garantía principal es que el diff no toca `clinical.js` y sus 39 pruebas unitarias pasan |

Otros resultados de la fase 3:

- **Pruebas:** EM, autocomprobación + 4/4; RCV, 7 → 11.
- **axe:** 0 → 0 en ambas.
- **Foco con teclado:** 1,6:1 → 9,4:1 en ambas.
- **RCV:** se corrigen dos defectos previos en móvil, los pasos 1-2 inalcanzables en la barra y un desbordamiento de 107 px a 320 px.

Hallazgos de transparencia que decide el autor, sin cambiar en los PR porque alteran texto visible:

- **EM:** la sección «Extracción automática con inteligencia artificial» funciona con coincidencia local de palabras clave.
- **RCV:** el botón «Usar IA para analizar texto» usa reglas locales mientras no se configure un endpoint.

## Resultado de la fase 4 (2026-10-29)

**Sistema de diseño 0.2.0.** `<cmo-author-signature>` pasa a ser multilingüe (es/en/pt):

- Usa el `lang` del propio elemento o, si no tiene, el de `<html>`, y se repinta cuando la app cambia de idioma.
- Los textos del esquema admiten `{ es, en, pt }`.
- En inglés, las fechas se muestran en formato ISO.
- Es compatible con 0.1.0, así que las apps de las fases 1-3 siguen con su copia 0.1.0 fijada hasta que se decida actualizarlas.

**VIH** (`cmo-vih-app#13`):

- Pruebas 45 → 50.
- Paridad 40/40 en el recorrido «Manual» → «Estratificar» → «Recalcular». Detecta la mutación de umbrales en 12/40 casos y cubre P1, P2 y P3.
- Firma verificada en es → pt-BR → en.
- La firma toma los créditos y el © literalmente de `data/i18n` (es la única app con © declarado).

**Arnés y auditoría axe tras el recorrido.** El arnés pasa ahora axe también sobre el estado final del recorrido. Se repitió en las 7 apps clínicas:

- **Ninguna regresión.** En VIH se detectaron y corrigieron **3 regresiones** durante el trabajo: el contraste del aviso de privacidad, el texto secundario de la tarjeta de nivel y el desplegable «Base científica».
- **VIH:** se corrige además un contraste previo de las insignias `.badge--*` (4 casos).
- **Infracciones previas sin cambios**, todas originadas en JS o HTML de la app y fuera del alcance visual:
  - RCV: `select-name`(21).
  - Pediatría: `select-name`(20).
  - EM: `label`(1) en `#reportText`.

**Transparencia sobre IA.** Ya son tres las apps que anuncian IA y funcionan con reglas locales: EM, RCV y VIH. Lo decide el autor.

## Resultado de la fase 5 (2026-10-30)

**PR #7, dependencias.** `"latest"` se sustituye por las versiones exactas que resolvía `latest` el 2026-10-30. Se añaden `package-lock.json` y `.gitignore`, y el workflow pasa de `npm install` a `npm ci` con caché. Pruebas 79/79 y build correcto con `npm ci`. No es posible conocer las versiones exactas del despliegue del 16/09, porque no había lockfile.

**PR #8, diseño** (encadenado sobre el #7):

- **Carga del tema.** En React, el tema debe cargarse después de `styles.css`. Se consigue con una sola línea de imports en `main.tsx`, verificando el orden en el CSS empaquetado. La firma va en `index.html`, fuera de `#root`.
- **Pruebas:** 79 → 83. La prueba nueva está en `tests/*.mjs`, para no exigir `@types/node` en `tsc -b`.
- **Paridad:** 40/40 hasta el resultado, con P1, P2 y P3. El arnés detecta la mutación de `PRIORITY_CUTS` en 8/40 casos. Se añadió al arnés la opción `RANDCLICK` para los botones de opción.
- **axe:** inicio 6 → 0 y resultado 8 → 0. Se corrigen contrastes previos del stepper, de la numeración de secciones y de la nota de guardado.
- **Foco:** pasa del contorno por defecto de 1 px a 3 px `#1f3aa8`.

## Siguiente paso concreto

Fusionar ramonmorillo/cmocoagulopatias#8. En todas las apps fusionadas, la firma muestra «pendiente de publicación» hasta un commit de publicación (`status: "released"` + fecha real), que depende de la decisión de versión de cada app. Queda la fase 6 (Inmunomediadas y VHB-VHD), que **no tiene pruebas**: antes del rediseño hay que crear casos de referencia y, en VHB-VHD, retirar el CDN de `xlsx` y la frase «No es un producto sanitario».
