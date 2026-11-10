# Ecosistema CMO–MAPEX · Progreso (leer primero)

Última actualización: 2026-11-10. Rama de trabajo en todos los repositorios tocados: `claude/zen-pasteur-u8tn7z`. Nada fusionado ni desplegado.

## Estado por herramienta

| Herramienta | Estado | Commit | Siguiente paso |
|---|---|---|---|
| Hub / núcleo 0.3.0 | Hecho | `42907e7` + docs | PR; decidir publicación 0.3.0 |
| EM | **Adaptación completa** (7 etapas, núcleo) | `8e2d957` | Revisión clínica de lo marcado; PR; commit de publicación 1.1.0 |
| RCV | **Adaptación completa** (núcleo + 5 defectos) | `ec336b4` | Ídem; decidir versión (hoy 1.2.0 sin subir) |
| Pediatría | Solo parche XSS | `e68c1d6` | Adaptar al núcleo (ya tiene estado pendiente: coste bajo) |
| Oncohematología | Solo parche XSS | `76bb25f` | **Prioritario**: propuestas «confirmed» puntúan sin revisión; importación confía en `result` |
| Migraña | Solo parche XSS | `670ba4d` | Importación sin validar; informe único |
| VIH | Solo parche XSS | `2ca6c06` | **Prioritario**: hallazgos puntúan sin confirmar; importación rompe la app |
| VHB-VHD | Solo parche XSS | `7e51835` | Importación sin validar ni confirmar; estado pendiente |
| Coagulopatías | Sin tocar | — | Requiere tipos para el núcleo (TS); negación y confirmación en lote |
| Inmunomediadas | Sin tocar | — | Borrado sin confirmación; informe único |
| Respiratorio | Referencia, sin tocar | — | Sin acceso de escritura en esta sesión; convergencia opcional |

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
- Límite de uso de la sesión alcanzado dos veces: de ahí el alcance (2 adaptaciones completas de 9).

## Decisiones que necesitan al autor (clínicas o de producto)

1. EM y RCV: ¿se acepta la modificación profesional (EM: en ambos sentidos con justificación ≥ 12 caracteres; RCV: solo elevación, como ya hacía)?
2. EM: ¿las variables de tratamiento que puntúan son «necesidades farmacoterapéuticas» (criterio tomado de Respiratorio)?
3. Reglas de extracción con falsos positivos por negación (EM, RCV, Coagulopatías, Inmunomediadas, Pediatría, VHB-VHD): ¿corregir las reglas o mantener solo el aviso?
4. VIH y Oncohematología: ¿se bloquea la puntuación de hallazgos sin confirmar? (cambia el comportamiento actual).
5. Rebajar una P1 automática (VIH, Oncohematología, Migraña lo permiten sin refuerzo).
6. Incoherencias clínicas de `ECOSISTEMA_CMO_AUDIT.md` §5.

## Cómo continuar con la siguiente herramienta

Procedimiento en `ECOSISTEMA_CMO_ARCHITECTURE.md` §6. Plantillas reales: `estratificacionEM/assets/js/assessment.js` (modelo de casillas) y `cmoriesgocardiovascular/assets/modules/assessment.js` (modelo de registros validados); pruebas e2e reutilizables en `tests/e2e/flow.e2e.mjs` de ambas.
Orden recomendado: Oncohematología y VIH (riesgo clínico) → Pediatría → Migraña → VHB-VHD → Inmunomediadas → Coagulopatías.
