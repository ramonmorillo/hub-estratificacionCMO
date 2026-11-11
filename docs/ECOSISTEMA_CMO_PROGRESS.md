# Ecosistema CMO–MAPEX · Progreso (leer primero)

Última actualización: 2026-11-10. Rama de trabajo en todos los repositorios tocados: `claude/zen-pasteur-u8tn7z`. Nada fusionado ni desplegado.

## Estado por herramienta

| Herramienta | Estado | Commit | Siguiente paso |
|---|---|---|---|
| Hub / núcleo 0.3.0 | Hecho; informe con etiquetas es/en/pt (`LABELS`, portugués sin revisar) | `2ab796c` | PR; decidir publicación 0.3.0 |
| EM | **Adaptación completa** (7 etapas, núcleo) | `8e2d957` | Revisión clínica de lo marcado; PR; commit de publicación 1.1.0 |
| RCV | **Adaptación completa** (núcleo + 5 defectos) | `ec336b4` | Ídem; decidir versión (hoy 1.2.0 sin subir) |
| Pediatría | **Adaptación** (informe único + PDF, actuaciones con estado, plan, necesidades, provisional con cota; página única con progreso) | `5108cbd` | Revisión clínica de lo marcado; PR contra `claude/awesome-cray-vilcvr` (no hay `main`); publicación 1.3.0 |
| Oncohematología | **Adaptación completa** (7 etapas, núcleo, decisión previa por propuesta, provisional) | `5af557b` | Revisión clínica de lo marcado; PR; commit de publicación 1.3.0 |
| Migraña | **Adaptación** (informe único + PDF, actuaciones con estado, plan, necesidades, provisional con cota, importación validada; página única) | `9325255` | Revisión clínica de lo marcado; PR; commit de publicación 2.2.0 |
| VIH | **Adaptación sustancial**: puerta de revisión, importación validada, provisional, etapa de seguimiento con estado de intervenciones, informe único y PDF en es/en/pt (conserva su asistente propio) | `1d229e7` | Validar el cambio de comportamiento; revisar el portugués; recorrido manual de las 16 variables y casos guardados |
| VHB-VHD | **Adaptación** (factores Sí/No/Pendiente, provisional, modificación profesional, informe único + PDF, actuaciones con estado, plan, copias de seguridad validadas; página única) | `a0be1c6` | Revisión clínica de lo marcado; PR; commit de publicación 1.1.0 |
| Coagulopatías | **Adaptación** (React/TS conservado; provisional con cota, elevación con motivo ≥12, actuaciones con estado, informe único + PDF, exportación sin HCE ni sugerencias, importación saneada; tipos `.d.ts` junto al núcleo) | `a57e4f1` | Revisión clínica; decidir si «confirmar todas las explícitas» se mantiene; PR; publicación (rama base `main`) |
| Inmunomediadas | **Adaptación** (asistente de 7 pasos propio conservado; provisional con cota, modificación profesional, actuaciones con estado, plan, informe único + PDF + JSON, importación validada, confirmación de borrado) | `b3e2db8` | Decidir hallazgos del motor (edad vacía = 1 punto; bloque demográfico 11 > 9; máximo 73 vs 71); PR; commit de publicación |
| Respiratorio | **Convergencia** (referencia del núcleo): texto HCE y PDF generados por el núcleo vía adaptador; diálogos accesibles; `clinical.js`/`extractor.js` intactos | `4329559` | Aprobar el cambio de formato del texto/PDF (mismos datos); PR; publicación |

## Decisiones tomadas (no repetir el análisis)

1. Núcleo = ficheros sin dependencias en `cmo-design-system/src/`, distribuidos con la copia fijada existente. Sin monorepo ni npm.
2. Dato ausente = pendiente → resultado provisional + alcance máximo **calculado con el motor de la herramienta**.
3. Reglas de extracción: no se tocan. Se añade evidencia y aviso de posible negación (`evidenceAt` del núcleo).
4. Sin almacenamiento persistente nuevo: EM usa solo `sessionStorage`; RCV sigue en memoria.
5. Informes bloqueados hasta finalizar (EM); modificar datos clínicos invalida la finalización.
6. `cmo-app-meta` en `draft` (EM) o versión sin subir (RCV: la versión vive en `config.js`, fichero clínico).
7. El indicador de pasos no es fijo (sticky): tapaba controles (WCAG 2.4.11 / 2.5.8).

## Bloqueos

- `cmorespiratorio`: el control de permisos de la sesión denegó añadirlo con escritura. Solo lectura.
- Límite de uso de la sesión alcanzado dos veces: de ahí el alcance (3 adaptaciones completas de 9).

## Decisiones que necesitan al autor (clínicas o de producto)

1. EM y RCV: ¿se acepta la modificación profesional (EM: en ambos sentidos con justificación ≥ 12 caracteres; RCV: solo elevación, como ya hacía)?
2. EM y Oncohematología: ¿las variables de tratamiento que puntúan son «necesidades farmacoterapéuticas» (criterio tomado de Respiratorio)?
3. Reglas de extracción con falsos positivos por negación (EM, RCV, Coagulopatías, Inmunomediadas, Pediatría, VHB-VHD): ¿corregir las reglas o mantener solo el aviso?
4. **Ya aplicado, pendiente de validación**: en VIH y Oncohematología los hallazgos del texto no puntúan hasta confirmarlos (cambia el comportamiento actual; lo exige la misión: «ningún dato inferido se incorporará sin confirmación»). Oncohematología admite ahora finalizar como provisional.
5. Rebajar una P1 automática (VIH, Oncohematología, Migraña lo permiten sin refuerzo): solo se avisa, no se ha endurecido.
6. VIH: portugués de los textos nuevos pendiente de revisión (`PT_REVIEW.md`); el JSON ya no incluye el texto pegado y el borrador del navegador tampoco.
7. Incoherencias clínicas de `ECOSISTEMA_CMO_AUDIT.md` §5.

## Cómo continuar con la siguiente herramienta

Procedimiento en `ECOSISTEMA_CMO_ARCHITECTURE.md` §6. Plantillas reales: `estratificacionEM/assets/js/assessment.js` (modelo de casillas) y `cmoriesgocardiovascular/assets/modules/assessment.js` (modelo de registros validados); pruebas e2e reutilizables en `tests/e2e/flow.e2e.mjs` de ambas.
Plantilla adicional: `cmoncologia/src/assessment.js` (modelo de campos con varios valores por variable y cota superior de pendientes) y `cmo-vih-app/assets/modules/review-gate.js` (puerta de revisión sobre un motor que no se puede tocar).
VIH: comportamiento validado por el autor. Pendiente: revisión clínica de los hallazgos documentados, PRs y commits de publicación (versión y fecha las fija el autor).
