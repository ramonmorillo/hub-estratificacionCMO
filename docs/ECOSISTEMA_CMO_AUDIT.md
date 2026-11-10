# Ecosistema CMO–MAPEX · Auditoría funcional

Fecha: 2026-11-10 · Complementa (no sustituye) `CMO-ECOSYSTEM-AUDIT.md` (2026-10-29: inventario técnico, autoría, hallazgos H1–H11 y migración visual al Design System).
Esta auditoría evalúa el **circuito asistencial** de cada herramienta frente al patrón de CMO Respiratorio.

## 1. Método y límites

- Descubrimiento: catálogo del hub (`index.html`, 10 entradas `ramonmorillo.github.io/<repo>/`) → repositorio homónimo en `github.com/ramonmorillo`, comprobado por clonado y por el `id` de `cmo-app-meta`. Asociación inequívoca en los 10 casos.
- Por herramienta: pruebas existentes ejecutadas, lectura dirigida del código y **recorrido real en Chromium (Playwright)**: entrada manual → resultado → informe, y análisis de texto con frases negadas y texto vacío.
- No comprobado en ninguna: diálogo real de impresión, navegadores distintos de Chromium, lectores de pantalla, pegado en una HCE real.
- Las 10 herramientas tienen auditoría funcional completa (cuatro informes parciales se interrumpieron por límite de uso y se reanudaron).

## 2. Inventario y clasificación

| Herramienta (hub) | Repositorio | Rama publicada | Versión | Tipo | Arquitectura |
|---|---|---|---|---|---|
| CMO-Respiratorio | cmorespiratorio | main | 1.3.0 | Estratificación · **referencia** | JS vanilla, módulos ES, build a `dist/`, CI + e2e |
| CMO-Esclerosis Múltiple | estratificacionEM | main | 1.0.0 | Estratificación | JS vanilla, 2 módulos, pestañas |
| CMO-VHB/VHD | cmo-vhb-vhd | main | 1.0.0 | Estratificación + registro local de pacientes | Script clásico único (`app.js`), página única |
| CMO-Riesgo Cardiovascular | cmoriesgocardiovascular | main | 1.2.0 | Estratificación | Módulos ES, asistente de 7 pasos |
| CMO-Migraña | estratificacionmigrana | main | 2.1.0 | Estratificación | Módulos ES en `cmo-migrana-app/`, pantalla única |
| CMO-Coagulopatías | cmocoagulopatias | main | 1.1.0 | Estratificación | React + TypeScript + Vite, 5 pasos |
| CMO-Inmunomediadas | cmoinmunomediadas | claude/dazzling-wozniak-p1sx1g | 1.1.0 | Estratificación | Módulos ES, asistente de 7 pasos |
| CMO-VIH | cmo-vih-app | main | 3.1.0 | Estratificación + casos (IndexedDB), es/en/pt | Módulos ES |
| CMO-Pediatría | cmopediatria | claude/awesome-cray-vilcvr | 1.2.0 | Estratificación | Módulos ES, build a `dist/` |
| CMO-Oncohematología | cmoncologia | main | 1.2.0 | Estratificación | Módulos ES, build a `dist/`, Pages CI |

Fuera de alcance (no enlazados desde el hub; no inspeccionados ni modificados): `SIAF-CMO`, `neumoCMO`, `cmorcvtesis`, `estratificacionRCV`, `cmo-vih-app2`, `cmodelta`, `cmocomunifar`, `CMO-Scientific-Engine`, `adhefarmapexhub`, `dermapex`, `vihconectados` y el resto de la cuenta. Por nombre podrían ser plataformas de seguimiento, versiones previas o auxiliares; **no se ha verificado**.

## 3. Matriz de capacidades

F = existente y funcional · D = existente con defectos · A = ausente · NA = no aplicable · PV = pendiente de validación.
EM «antes» = `main` (489df35); EM «rama» = `claude/zen-pasteur-u8tn7z` (ver §5 y `ECOSISTEMA_CMO_TESTS.md`).
Las demás columnas describen la rama publicada **antes** de esta sesión. Estado tras la sesión (rama `claude/zen-pasteur-u8tn7z`, sin fusionar):
- **RCV** y **Oncohematología**: adaptadas al núcleo; filas 5, 7–14 pasan a F y la 15 a F con pruebas nuevas; la fila 3 sigue D (reglas de extracción sin tocar; ahora con evidencia y decisión previa).
- **VIH**: puerta de revisión y seguridad, sin adaptar al flujo completo. Pasan a F las filas 4 (confirmar/descartar cada propuesta; nada puntúa sin confirmar), 5 (resultado provisional), 7 (modificación con justificación y visible en todas las salidas), 11 (importación validada) y 13 (XSS, CSV, texto libre fuera del JSON y del borrador). Siguen D: 8 y 9 (sin necesidades ni estado de intervenciones), 10 (sin PDF; constructores separados) y 3.
- **Pediatría**: adaptada (página única): pasan a F las filas 7 (ya existía y ahora figura en el informe), 8, 9, 10, 11, 13, 14 (progreso, nombres accesibles, 375 px) y 15; la 3 sigue D (reglas sin tocar) y la 12 D (sin borrador automático).
- **Migraña, VHB-VHD**: solo corregido el XSS (fila 13 sigue D por el resto de defectos).
Detalle en `ECOSISTEMA_CMO_FINAL_REPORT.md`.

| # | Capacidad | Resp. | EM antes | EM rama | VHB-VHD | RCV | Migraña | Coag. | Inmuno | VIH | Pediat. | Onco |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Inicio: centro, profesional, seudónimo, método, privacidad | F | D | F | D | F | D | D | D | D | D | D |
| 2 | Entrada manual estructurada y validada | F | D | F | D | D | D | D | D | D | D | D |
| 3 | Análisis de texto local con evidencia y control de negación | F | D | D¹ | D | D | D | D | D | D | D | D |
| 4 | Revisión profesional por propuesta (aceptar/corregir/descartar) | F | D | F | D | D | F | D | F | D | D | D |
| 5 | Dato ausente ≠ «No»; estado pendiente/provisional | F | A | F | A | D | D | D | D | D | F | D |
| 6 | Resultado: puntuación, nivel, contribuyentes, reglas, explicación | F | F | F | F | D | F | F | F | F | D | D |
| 7 | Modificación profesional justificada conservando el automático | F | A | F² | A | D | D | F | A | D | D | D |
| 8 | Necesidades (confirmadas / potenciales) | F | A | F² | A | D | A | A | D | A | A | A |
| 9 | Intervenciones con estado + plan de seguimiento | F | D | F | D | D | D | D | D | D | D | D |
| 10 | Informe: copiar, PDF real, imprimir, texto, datos estructurados, modelo único | F | D | F | D | D | D | D | D | D | D | D |
| 11 | Importación validada | F | A | F | D | A | D | D | A | D | D | D |
| 12 | Persistencia, borrado, confirmaciones, aviso al salir | F | D | F³ | D | A | D | A | D | D | D | D |
| 13 | Seguridad (XSS, CSV, red, identificadores) | F | D | F | D | F | D | D | F | D | D | D |
| 14 | Accesibilidad / progreso / responsive | F | D | F | D | D | D | D | D | D | D | D |
| 15 | Pruebas automatizadas | F (50 + 10 e2e) | D (6 casos + 4) | F | F (19) | F (11) | F (71) | F (83) | F (16) | D (50) | F (27) | F (43) |
| 16 | Documentación y versión | F | D | F | D | D | F | D | F | D | F | F |

¹ Las reglas de palabras clave de EM se conservan literalmente; se añade evidencia textual y aviso de posible negación, pero no se suprime ninguna propuesta (decisión clínica pendiente).
² Capacidad nueva de flujo, sin reglas clínicas nuevas; requiere validación profesional antes de uso asistencial.
³ Solo borrador de sesión (`sessionStorage`) y exportación/importación; sin almacenamiento persistente, como declaraba la herramienta.
⁴ Recuento de la migración visual (2026-10-30); no reejecutado en esta sesión.

## 4. Evidencia por herramienta (resumen; defectos con fichero:línea en la rama publicada)

### CMO-EM (`main`, inspección directa)
- Pestañas libres sin orden; sin centro ni farmacéutico; casilla sin marcar = «No» (sin estado pendiente).
- **XSS**: comentarios de objetivos insertados con `innerHTML` sin escapar (`assets/js/app.js`, `renderGoals`).
- CSV con comillas sin doblar y sin neutralizar fórmulas; «Copiar» sin confirmación ni gestión de error; «PDF» = `window.print()` de toda la página.
- Extractor por subcadena: «no fumador» → propone «Hábito tabáquico»; «15 años de evolución» → «Edad inferior a 16 años»; «Aplicar» incorpora sin mostrar evidencia.
- El informe vuelca `JSON.stringify` de las puntuaciones por dimensión; el JSON exportado no tiene esquema ni versión; las casillas de AF dual no llegan al informe.

### CMO-VHB/VHD
- Sin centro, farmacéutico ni elección de método; sin estado pendiente (casilla vacía = 0 puntos; la barra de «progreso» es el % de factores marcados).
- «Aplicar al formulario» vuelca todas las propuestas y desmarca lo marcado a mano (`app.js:405-409`); la evidencia mostrada es el patrón, no el fragmento; «VIH negativo» → coinfección.
- **XSS almacenado** al importar un backup (`app.js:464-469`, entrada sin validar en `1045-1057`); la importación sustituye todos los registros sin confirmar; un backup malformado deja un error persistente.
- «Nueva estratificación» deja la puntuación en vivo obsoleta; no se puede borrar un paciente; CSV sin protección de fórmulas; identificador local y notas en claro en `localStorage`.
- Sin modificación profesional, necesidades ni estado de intervenciones; sin PDF real ni descarga de texto.

### CMO-Riesgo Cardiovascular
- Mejor alineada con el patrón (7 pasos, hospital y farmacéutico obligatorios, revisión por variable, escape sistemático).
- Con 0/20 variables validadas muestra «PRIORIDAD 3» sin marca de provisional.
- Variable confirmada en revisión que luego se vacía sigue puntuando (`assets/app.js:185-188`); marcar un recurso borra las intervenciones seleccionadas (`256-264`); volver a Inicio y reentrar deja pasos 5–7 desbloqueados con `result=null` → `TypeError` (`97, 254`); la elevación profesional se pierde al re-renderizar (`167`).
- Extractor sin negación ni género («Niega HTA» → riesgo; «fumadora» no detectada). El informe afirma «Sin alertas adicionales detectadas» aunque `alerts` nunca se rellena (`export-layer.js:35`).
- Sin PDF real, JSON/CSV, importación ni persistencia; 22 etiquetas del paso 4 sin asociar; stepper sin `aria-current`.

### CMO-Migraña
- Revisión por propuesta correcta (confirmar/corregir/rechazar/deshacer); extractor rotulado «sin IA» con fragmento y regla.
- **XSS almacenado**: justificación de la modificación sin escapar (`src/main.js:76`), explotable tecleando o importando.
- Importación por `prompt()` con `JSON.parse` sin validar ni `try/catch` (acepta «Prioridad final: 9»).
- La modificación puede bajar a P3 una Prioridad 1 automática y guarda `reinforcedWarningAccepted:true` sin mostrar aviso; el informe TXT omite modificación, prioridad calculada y estado provisional.
- Un caso borrado reaparece al teclear; se crea un caso vacío en cada carga; CSV con `\"` y sin neutralizar fórmulas.
- Sin necesidades, estado de intervenciones, copiar ni PDF real; tres constructores de exportación distintos.

### CMO-Coagulopatías
- Informe, impresión y copia salen de `buildReportData` (modelo único parcial: el JSON sale del estado bruto e **incluye el texto clínico pegado**).
- Sin respuestas muestra «PRIORIDAD 3, 0 puntos» sin aviso (`scoring.ts:4`).
- Negación incompleta («Niega ansiedad» → Sí; `hce.ts:12, 45-68`) y «Confirmar todas las explícitas» incorpora los falsos positivos de golpe (`App.tsx:10`).
- `isValidEvaluation` no valida `professional.priority` ni la patología (`evaluation.ts:25-26`) → «PRIORIDAD 0».
- Sin persistencia ni aviso al salir (pérdida total al recargar); estado de intervenciones binario; sin PDF real ni descarga de texto.

### CMO-Pediatría
- Estado pendiente bien resuelto (Pendiente/Sí/No, provisional/definitiva, diálogo de pendientes); revisión confirmar/descartar sin «corregir».
- **XSS con texto pegado**: `src/app.js:223` inserta el fragmento de evidencia sin escapar (ejecutado).
- Negación con ventana de 20 caracteres sin límite de frase (`src/extractor.js:31,78`): «Sin sonda. Posible mala adherencia» → adherencia = No; «Familia numerosa no» → Sí.
- Edad negativa rompe el cálculo (`src/clinical.js:110,126`); CSV sin doblar comillas ni neutralizar fórmulas (`374-379`); la importación acepta `values` arbitrarios y los puntúa como «No» (`src/storage.js:51`).
- La lista de casos guardados muestra la prioridad sin la modificación profesional (`src/app.js:321`); sin borrador ni aviso al salir; sin necesidades, estado de intervenciones, copiar ni PDF real; cada formato se construye aparte.

### CMO-Oncohematología
- Extractor más elaborado (distingue «niega», «no consta», posible, histórico, discordante), pero **las variables no críticas «confirmed» se incorporan y puntúan sin revisión** (`src/assessment-state.js` ≈8-11): «Toma 8 medicamentos» sumó 3 puntos sin confirmar. No hay botón de descartar.
- **XSS almacenado** en justificación, motivos e identificador de la lista (`src/app.js:25,28`), también por JSON importado.
- La importación confía en el `result` guardado sin recalcular (`src/app.js:27`, `src/storage.js:10`): un fichero manipulado mostró «1/96» junto a un cálculo en vivo de 19.
- El borrador activo se pierde al recargar (`src/app.js:31,37`); se puede bajar un P1 automático a P3 con 15 caracteres (`src/clinical.js:52`); CSV sin neutralizar fórmulas (`src/storage.js:11`).
- No admite cierre provisional (no se puede finalizar con pendientes); sin necesidades, estado de intervenciones, copiar, texto ni PDF real.

### CMO-Inmunomediadas
- Asistente de 7 pasos con `aria-current`; revisión por variable correcta (nada puntúa sin confirmar); escape sistemático (XSS no ejecutado).
- «Desconocida» cuenta como confirmada (`data-layer.js:103,125`) y el paso 5 no avisa de resultado provisional (el informe sí).
- Extractor: negación de frase completa con falsos negativos de «alta confianza» premarcados para confirmación en lote («No tolera metotrexato por reacción adversa» → Reacciones adversas = No; `heuristic-extraction.js:15,25-28`, `ui.js:176`); ignora temporalidad («Ingreso hace 5 años» → ingreso en 2 meses = Sí).
- Aceptar edad o tipo de EI extraídos no actualiza el contexto del cálculo (`data-layer.js:88-97`); edad negativa aceptada.
- Borrado de caso sin confirmación (`app.js:269-273`); sin borrador ni aviso al salir; toast «copiado» aunque la copia falle (`app.js:333`).
- Sin modificación profesional, importación, PDF real, JSON/CSV ni estado de intervenciones; desbordamiento a 375 px en el paso 6.

### CMO-VIH
- **Los hallazgos del texto puntúan de inmediato sin confirmación** (`app.js:131-139`; el motor ignora `clinicianConfirmed`): «Antecedente de deterioro cognitivo no confirmado» sumó +2 y generó alerta.
- **XSS almacenado ejecutado**: evidencia del texto pegado en `innerHTML` (`ui.js:58,171`) y etiqueta del paciente en la ventana de impresión (`export-layer.js:92-94,110`).
- Importación sin validar valores: `{"viralLoad":"banana"}` lanza `TypeError` (`cmo-engine.js:39`), se persiste y deja la app en blanco hasta borrar `localStorage` (`data-layer.js:253-262`).
- La modificación profesional no exige motivo, permite bajar a P3 una P1 automática por embarazo y no figura en resumen, copia, CSV ni impresión (`app.js:175-182`).
- El primer clic en «Analizar» tras escribir se pierde por re-render (`app.js:109-112,407`); CSV sin neutralizar fórmulas; la narrativa clínica queda en claro en `localStorage` (`data-layer.js:74`).
- Con 0 datos: «Prioridad 3 — Baja, cada 12 meses» sin marca de provisional. Sin necesidades, estado de intervenciones ni PDF real; cada formato tiene su propio constructor. Sin pruebas del motor. `APP_VERSION` «v3 — September 2026» frente a 3.1.0.

## 5. Incoherencias clínicas observadas (NO corregidas; para revisión profesional)

| Herramienta | Observación |
|---|---|
| EM | El modelo no distingue «No» de «sin dato» (casillas). La rama añade el estado pendiente en la interfaz sin tocar el motor. |
| EM | Reglas del extractor: «15 años»… «12 años» como subcadena para «< 16 años»; «alto riesgo»/«ismp» para medicamentos de alto riesgo; sin negación. |
| VHB-VHD | El tipo «VHB-VHD» no puntúa, pero existe el factor «Coinfección por VIH y/o VHD» (+3) que el extractor activa con «vhd»/«delta» y la entrada manual no. |
| VHB-VHD | «Cirrosis descompensada» (+2) se puede marcar sin «Cirrosis» (+4). Nivel 3: «cada 12 meses y luego anual». Etiqueta de nivel con rango que no corresponde cuando actúa una regla de seguridad (ya en ramonmorillo/cmo-vhb-vhd#15). |
| RCV | Con 0/20 variables se emite «Prioridad 3» firme, aunque `CLINICAL_MODEL.md` dice que ausencia ≠ negativo. 11 de 20 variables no generan necesidad. El extractor propone «HTA no controlada» ante cualquier mención de HTA. `CLINICAL_MODEL.md` declara la matriz pendiente de validación documental. |
| Migraña | `THRESHOLDS.totalMax` = 39 pero el máximo alcanzable es 38; `clinicas.max` = 10, alcanzable 9. `menor_18` muestra alerta pediátrica y aun así «Prioridad final» adulta. `paciente_naive` obligatoria pero no puntúa. `core.mjs:2`: fuente «pendiente de verificación literal». |
| Coagulopatías | Edad solo ofrece 1 o 2 puntos (sin 0). «Calidad de vida» (variable adicional) suma al total sin cambiar los cortes. Hemofilia A al máximo = 57 puntos con cortes 19/27. Periodicidad P1 «cada mes». |
| Pediatría | 20 ítems puntuables frente a las «18 variables» del texto fuente (el repo lo marca pendiente de validación). Edad 2–3 años se clasifica como «Preescolar (3-5)». Edad > 18 da 0 puntos y permite resultado «Definitivo». |
| Oncohematología | Los máximos de las 26 variables suman 97 pero se muestra «/96» (reconocido en `AUDITORIA.md:18`). HADS: subescala exactamente 10 puntúa 0 (`clinical.js:23`). Método «hads» sin valores puntúa 0 y no queda pendiente. Edad 0–18 puntúa 4 y además fuerza P1. |
| Inmunomediadas | Edad vacía suma +1; bloque demográfico 11 frente a máximo declarado 9; total alcanzable 73 frente a «/71» (abierto desde 2026-10-30). El extractor ignora temporalidad y valor («DAS28 2,1 en remisión» → actividad moderada/alta = Sí). |
| VIH | Un único término de comorbilidad produce «menos de 2 comorbilidades» (afirma lo que el texto no dice; `ai-module.js:64-67`). Temporalidad solo comprobada en depresión. `comorbidityGoals` usa umbrales fijos (HbA1c 8, TA 145/90) que el propio código reconoce sobreajustados (`ai-module.js:189-192`). |

## 6. Conclusiones para la planificación

1. La identidad visual ya es común (DS 0.2.0); la divergencia actual es **funcional**: informe, estado pendiente, revisión, modificación profesional y registro de intervenciones.
2. Tres defectos se repiten y son transversales: (a) dato ausente tratado como negativo o resultado firme sin datos; (b) XSS por `innerHTML` con datos importados, pegados o tecleados (EM, VHB-VHD, Migraña, Pediatría, Oncohematología, VIH); (c) informes construidos por varias rutas y «PDF» = imprimir la página.
3. Riesgo clínico prioritario (propuestas que puntúan sin confirmación profesional): **VIH** y **Oncohematología**; y confirmación en lote de falsos positivos/negativos en **Coagulopatías** e **Inmunomediadas**.
4. Los tres defectos transversales se resuelven con un núcleo pequeño y sin dependencias (informe único, PDF, flujo) y un adaptador por herramienta: ver `ECOSISTEMA_CMO_ARCHITECTURE.md`.
