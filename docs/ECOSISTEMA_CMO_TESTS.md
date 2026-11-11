# Ecosistema CMO–MAPEX · Pruebas

Todo lo que figura aquí se ejecutó el 2026-11-10 (Node 22, Chromium de Playwright, axe-core 4.10.2 instalado fuera de los repositorios). Datos siempre ficticios.

## 1. Resultados

| Repositorio (rama `claude/zen-pasteur-u8tn7z`) | Antes | Después | Qué cubre lo nuevo |
|---|---|---|---|
| Hub | 11 firma + 11 e2e + control de publicación | **23** unitarias (11 firma + 12 núcleo) · e2e 11/11 con axe 0 · «Apto» | Informe único (texto = HTML = PDF en secciones), provisional, validación, escape, CSV, sobre de exportación, importación hostil, PDF (estructura, xref, paginación), evidencia/negación, ausencia de red y almacenamiento |
| EM | 6 casos de autocomprobación + 4 | Autocomprobación + **21** unitarias · **4** e2e | Paridad con el motor (6 casos frontera en dos modos + todas las variables y opciones una a una), pendientes y peor escenario, excluyentes, modificación profesional, catálogo de intervenciones = original, informe, ida y vuelta de exportación, analizador = copia congelada 1.0.0, huella de `model.js` |
| RCV | 11 | **22** unitarias · **4** e2e | Fronteras 16/17 y 22/23, paridad por variable y opción, provisional con 0 datos, propuestas sin validar, embarazo, menor de 18, elevación, necesidades = `needs-mapper`, informe, importación manipulada, huellas de 6 ficheros clínicos |
| Pediatría | 27 | **38** unitarias · **6** e2e | Huellas (clinical.js sin VERSION, extractor.js), fronteras 16/17 y 30/31, paridad en 300 formularios, pendientes y cota, edad inválida, modificación con justificación reforzada, actuaciones, informe, saneado de importación, CSV |
| Oncohematología | 43 | **58** unitarias · **5** e2e | Huellas de 3 ficheros clínicos, paridad con el motor en 400 casos aleatorios, fronteras 15/16 y 27/28, pendientes y cota superior, modificación, informe, importación hostil y formato anterior, CSV, análisis con decisión previa |
| Migraña | 71 | **83** unitarias · **6** e2e | Huellas de `core.mjs`/`local-extractor.mjs`, fronteras 14/15 y 18/19, paridad en 300 casos, pendientes y cota, menor de 18, modificación, actuaciones, informe, importación hostil y formato anterior, CSV |
| VIH | 50 | **68** unitarias · **4** e2e | Huellas de motor/configuración/analizador, paridad con el motor en 300 casos, propuestas sin confirmar, modificación, importación, estado corrupto, exportaciones sin texto libre, borrador, un solo clic en «Analizar» |
| VHB-VHD | 19 | **30** unitarias · **5** e2e | Huellas de configuración y cálculo, umbrales, pendientes y cota, reglas de seguridad, modificación, informe, copia de seguridad hostil, registro anterior, CSV; e2e con axe 0, importación hostil, reinicio, extracción asistida, 375 px |
| Coagulopatías, Inmunomediadas, Respiratorio | 83 · 16 · 50+10 | Sin cambios (no modificados) | — |

## 2. Recorridos e2e (EM y RCV)

Cada batería e2e se repitió varias veces seguidas (EM y RCV 5; Oncohematología 5; VIH 4) sin fallos, tras corregir una carrera de la propia prueba en EM y RCV (leía el aviso antes de terminar la importación asíncrona).

- **Manual completo**: bloqueo sin centro/profesional → variables → provisional → finalizar → necesidades → estado de intervenciones → texto HCE → portapapeles (igual al texto) → PDF (cabecera `%PDF-1.4`, contenido) → `.txt` idéntico → impresión (mismo informe en el marco aislado) → JSON (`cmo-export/1`) → CSV → recarga/reinicio con confirmación → importación de fichero inválido rechazada → importación válida.
- **Análisis asistido**: texto vacío rechazado; evidencia literal; aviso de posible negación; nada puntúa sin decisión; lo no decidido y lo descartado quedan pendientes; el texto pegado no llega al borrador ni al informe.
- **Reglas del modelo vistas en interfaz**: EM 18 puntos → Prioridad 1, criterios excluyentes, embarazo → P1 automática; RCV embarazo → P1, elevación solo al alza con motivo.
- **Carga hostil**: `<img onerror>` en comentarios/objetivos no se ejecuta ni crea elementos; fichero manipulado (RCV) se recalcula con el motor.
- **Móvil 375 px**: desbordamiento horizontal 0 en todas las etapas; tres estados manejables con teclado (EM).
- **Accesibilidad**: axe WCAG 2.0/2.1/2.2 A y AA = 0 infracciones en las 7 etapas de EM y de RCV (RCV partía de 42 campos sin nombre accesible).
- **Red**: 0 peticiones a terceros en todo el recorrido.

## 2b. Oncohematología y VIH

- **Oncohematología** (5 recorridos, axe 0 en las 7 etapas): manual completo con 28 puntos → P1; provisional → completar → definitivo; análisis asistido donde nada puntúa hasta decidir (aceptado entra, descartado y no decidido quedan pendientes, texto y evidencia ausentes del borrador); casos locales con borrado confirmado; recarga que **recupera el borrador** (antes se perdía); importación hostil (valores fuera de dominio, prioridad inventada, XSS, resultado falsificado, formato anterior) recalculada con el motor; 375 px sin desbordamiento; 0 peticiones a terceros.
- **VIH** (4 recorridos, axe 0 en revisión, estratificación provisional e informe): un solo clic en «Analizar»; propuestas sin confirmar no puntúan ni activan la prioridad automática; confirmar → P1; descartar; modificación sin justificación no se aplica, con justificación se aplica y avisa; las salidas (texto HCE, JSON, CSV) muestran estado y modificación y no contienen el texto pegado; importación con valor inválido descartada y aplicación operativa tras recargar con estado corrupto; 375 px; 0 peticiones a terceros.
- VIH incluye además: etapa de seguimiento (estado de intervenciones, plan), PDF descargado y el mismo informe en inglés.
- **No ejecutado en VIH**: recorrido manual completo con las 16 variables, cambio de idioma a en/pt más allá de la carga, casos guardados (IndexedDB).

- **Pediatría** (6 recorridos, axe 0): P1 por 31 puntos con estados de actuaciones y plan → informe (copiar = .txt idéntico, PDF, impresión, JSON, CSV); provisional con confirmación; edad negativa sin errores; análisis de texto donde nada puntúa hasta confirmar; importación hostil; lista de casos con la prioridad final; 375 px; 0 peticiones externas.

## 3. Validación de las propias pruebas (mutaciones)

| Mutación | Resultado |
|---|---|
| EM: el adaptador trata «No» como criterio activo | 8 pruebas fallan |
| EM: el peor escenario deja de calcularse | 3 fallan |
| RCV: el adaptador acepta registros sin validar | 1 falla |
| Pediatría: se acepta cualquier edad / se ignora la validación de la modificación | 1 prueba falla en cada caso |
| Oncohematología: el adaptador ignora los pendientes | 4 pruebas fallan |
| Oncohematología: se incorporan todas las propuestas, no solo las decididas | Falla el recorrido asistido |
| Oncohematología: la modificación profesional se ignora | 1 prueba falla |
| VIH: las propuestas sin confirmar vuelven a puntuar | 2 pruebas fallan |
| EM/RCV/Oncohematología/VIH: cualquier cambio en ficheros clínicos | Falla la prueba de huella SHA-256 |

## 4. Comprobación en navegador de los parches XSS (Pediatría, Migraña, VHB-VHD)

Texto con `<img onerror>` pegado y análisis lanzado: **VHB-VHD** (Pediatría tiene ahora su e2e propio): no se ejecuta ni crea elementos. **Migraña**: la app carga sin errores, pero el punto corregido (justificación de la modificación) **no se volvió a ejercitar en navegador**; queda cubierto por la prueba estática de regresión. Oncohematología y VIH tienen ahora recorridos e2e propios con carga hostil.

## 5. Limitaciones

- No comprobado: diálogo real de impresión, visores PDF institucionales, pegado en una HCE real, navegadores distintos de Chromium, lectores de pantalla.
- La paridad clínica de EM y RCV es exhaustiva variable a variable y en fronteras, no combinatoria; la garantía principal es que los ficheros clínicos son idénticos byte a byte.
- Los resultados esperados proceden de las pruebas y reglas ya presentes en cada repositorio; **no se han contrastado pesos ni umbrales con los documentos SEFH**.
- Sin CI en EM ni RCV: las baterías se ejecutan a mano (`npm test`, `npm run test:e2e`).

## 6. Cómo repetir

```bash
node --test cmo-design-system/tests/*.mjs                 # hub
npm test && AXE_PATH=<axe.min.js> npm run test:e2e        # EM y RCV
node cmo-design-system/tools/cmo-ds-sync.mjs <herramienta> --check --dest assets/cmo-ds
```
