# Ecosistema CMO–MAPEX · Arquitectura funcional común

Objetivo: misma experiencia y mismo informe en todas las herramientas, **sin tocar ningún algoritmo clínico**. Patrón de referencia: CMO Respiratorio 1.3.0.

## 1. Decisión

Extender el mecanismo que ya existe y está probado —copia **fijada** del CMO Design System en cada herramienta (`cmo-ds-sync.mjs` + manifiesto SHA-256)— con un núcleo funcional pequeño, sin dependencias. No hay monorepositorio, framework, paquete npm ni enlace en caliente: cada herramienta sigue siendo un sitio estático autónomo y cada actualización del núcleo es un diff revisable.

Alternativas descartadas: (a) paquete npm compartido → exige build y registro en 7 herramientas que hoy no los tienen; (b) reescribir todas sobre el código de Respiratorio → pérdida de funciones propias y riesgo clínico alto; (c) cargar el núcleo desde el hub → dependencia en tiempo de ejecución y cambio simultáneo sin revisión.

## 2. Tres capas

| Capa | Dónde vive | Contenido | Quién la cambia |
|---|---|---|---|
| **Núcleo transversal** | Hub: `cmo-design-system/src/` → copia fijada en cada herramienta | `cmo-report.js` (informe único `cmo-report/1`, texto HCE, HTML de impresión, exportación `cmo-export/1`, importación validada, CSV seguro) · `cmo-pdf.js` (PDF local) · `cmo-flow.js` + `cmo-flow.css` (7 etapas, avisos, confirmaciones, aviso al salir, copiar, descargar, imprimir) · tokens, componentes y firma | Solo en el hub; versión SemVer |
| **Configuración clínica** | Cada herramienta (ficheros de `CMO-ECOSYSTEM-AUDIT.md` §5) | Variables, pesos, umbrales, prioridades, excepciones, intervenciones, referencias, reglas del analizador de texto | Nadie sin validación clínica. Protegida por pruebas de caracterización y, en EM, por huella SHA-256 |
| **Adaptador** | Cada herramienta (p. ej. EM: `assets/js/assessment.js`) | Traduce el resultado del motor propio a `cmo-report/1`; gestiona pendientes, modificación profesional, estado de intervenciones y esquema del caso | El mantenedor de la herramienta |

Reglas del núcleo (comprobadas en `tests/core.test.mjs`): sin red, sin almacenamiento, sin `eval` ni `innerHTML`, sin fechas implícitas en el informe; las etiquetas de nivel («Prioridad 1», «Nivel 2») las aporta siempre la herramienta; ninguna constante clínica.

## 3. Circuito común de 7 etapas

| Etapa | Contenido común | Qué aporta la herramienta |
|---|---|---|
| 1 Inicio | Centro, farmacéutico/a (obligatorios), seudónimo opcional, método de entrada, privacidad y finalidad | Textos del modelo |
| 2 Historia clínica | Entrada estructurada por dimensiones; **Sí / No / Pendiente** | Variables y opciones |
| 3 Revisión | Tabla de variables, pendientes, origen (manual / análisis asistido confirmado) | — |
| 4 Estratificación | Puntuación, nivel calculado y final, reglas especiales, pendientes y alcance máximo, modificación profesional justificada, finalizar | Motor |
| 5 Necesidades | Confirmadas (lo que puntúa) y potenciales (lo pendiente), por dimensión | Qué dimensión es farmacoterapéutica |
| 6 Intervenciones | Estado por intervención: recomendada / realizada / planificada / no procede; plan y próxima valoración | Catálogo y periodicidad |
| 7 Informe | Copiar, PDF, imprimir, .txt, JSON, CSV, importar, reiniciar | Adaptador a `cmo-report/1` |

Principios de comportamiento: nada inferido se incorpora sin decisión explícita; un dato ausente nunca es «No» (queda pendiente → resultado provisional); el resultado automático se conserva siempre; modificar un dato clínico tras finalizar invalida el informe; el texto clínico pegado no se guarda ni se exporta.

## 4. Informe único `cmo-report/1`

`createReport(entrada)` normaliza; `reportSections()` es la única fuente de las secciones, que consumen `reportToText` (HCE), `reportToHtml` (vista previa e impresión) y `reportToPdf`. Orden: cabecera (fecha, seudónimo, profesional, centro, estado) → situación relevante → valoración CMO (modelo, puntuación, resultado calculado, reglas, modificación, pendientes) → **resultado** → variables que contribuyen → necesidades (confirmadas / potenciales) → intervenciones (realizadas / planificadas / recomendadas) → plan y objetivos → advertencias → pie (herramienta, fuente, aviso). Las secciones vacías se omiten.

`validateReport()` impide exportar un definitivo con pendientes, una modificación sin justificación o un identificador con forma de DNI.

Exportación estructurada: sobre `cmo-export/1` = `{schema, app{id,name,version}, exportedAt, dataSchema, data, report}`. `data` usa el esquema propio y versionado de cada herramienta (EM: `cmo-em-case/1`). `parseEnvelope()` valida tamaño, JSON, esquema y aplicación de origen; después cada adaptador sanea campo a campo (lo desconocido se descarta).

## 5. Componentes reutilizados de CMO Respiratorio

| Componente de Respiratorio | Destino | Estado |
|---|---|---|
| `src/pdf.js` (motor de maquetación, métricas Helvetica, WinAnsi) | `cmo-pdf.js` | Extraído; `reportToPdf` generalizado a `cmo-report/1` |
| `src/report.js` (estructura única, `toPlain`, `formatDate`, texto HCE) | `cmo-report.js` | Generalizado (sin patologías ni dimensiones propias) |
| Stepper de 7 pasos, `data-go/next/back`, diálogo de pendientes, aviso al salir, toast | `cmo-flow.js` / `cmo-flow.css` | Reimplementado como componente común accesible |
| `src/storage.js` (borrador en `sessionStorage`) | Patrón replicado en el adaptador de EM | No extraído: depende del esquema de cada caso |
| `src/workflow.js`, `clinical.js`, `extractor.js` | — | **No reutilizables**: son configuración clínica respiratoria |

Respiratorio no se ha modificado. Puede converger al núcleo más adelante (sustituir `src/pdf.js` y `src/report.js` por la copia fijada) con sus 10 pruebas e2e como red de seguridad; no es necesario para el resto del plan.

## 6. Cómo adaptar una herramienta (procedimiento validado en EM)

1. Rama de trabajo; ejecutar y guardar la batería existente.
2. `node cmo-design-system/tools/cmo-ds-sync.mjs <herramienta> --dest <ruta cmo-ds>`.
3. Fijar la configuración clínica: huella SHA-256 o pruebas de caracterización de los ficheros clínicos; si se mueven reglas del analizador, copia congelada + prueba de igualdad de propuestas.
4. Escribir el adaptador (puro, probable en Node): respuestas ↔ entrada del motor, pendientes, peor escenario **calculado con el motor**, modificación profesional, catálogo de intervenciones con identificadores estables, `buildReportInput`, `serializeCase` / `normalizeCase`.
5. Reorganizar la interfaz en las 7 etapas con `createStepper`; sustituir informes y exportaciones por los del núcleo.
6. Pruebas: paridad variable a variable con el motor, casos frontera existentes, informe, importación hostil, e2e (manual, asistido, 375 px, sin terceros) con axe; validar la batería con al menos una mutación.
7. `cmo-app-meta` en `status: "draft"` y CHANGELOG; la versión y la fecha se fijan en el commit de publicación (`CMO-RELEASE-CHECKLIST.md`).

## 6b. Idiomas del informe

`createReport({locale})` admite `es` (predeterminado), `en` y `pt` (`LABELS` en `cmo-report.js`; el PDF y la impresión usan el mismo idioma). El portugués está pendiente de revisión profesional. Las etiquetas de estado de intervención están también en `LABELS[locale].statuses`.

## 7. Limitación conocida del Design System

Los componentes viven en `@layer cmo.*`; los estilos sin capa de cada herramienta (p. ej. `button {…}`, `input {width:100%}`) los vencen. Cada herramienta necesita unas pocas reglas de restitución en su `cmo-visual.css` (EM: ~25 líneas). Es el precio de no romper los estilos propios; no se usa `!important`.
