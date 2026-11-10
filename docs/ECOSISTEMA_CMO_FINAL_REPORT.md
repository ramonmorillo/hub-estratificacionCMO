# Ecosistema CMO–MAPEX · Informe final de la sesión (2026-11-10)

## Resumen ejecutivo

- **Auditadas funcionalmente: 10 de 10** herramientas del hub (más el hub), con recorrido real en navegador.
- **Núcleo común creado** (Design System 0.3.0): informe único, PDF local, flujo de 7 etapas, exportación/importación versionada. Sin lógica clínica ni dependencias.
- **Adaptadas por completo: 2 de 9** (Esclerosis Múltiple y Riesgo Cardiovascular). **Parche de seguridad: 5** (Pediatría, Oncohematología, Migraña, VIH, VHB-VHD). **Sin tocar: 3** (Coagulopatías, Inmunomediadas, Respiratorio).
- **El objetivo de la misión no está cumplido**: 7 herramientas siguen sin el circuito común. El alcance lo limitó el límite de uso de la sesión, no un bloqueo técnico; el procedimiento está validado dos veces y documentado.
- Ningún fichero de configuración clínica se ha modificado en ningún repositorio. Nada se ha fusionado ni desplegado.

## Herramientas modificadas y ramas

Todas en la rama `claude/zen-pasteur-u8tn7z` de su repositorio, sin PR abierto.

| Repositorio | Commit | Cambio |
|---|---|---|
| hub-estratificacionCMO | ver `git log` | Núcleo 0.3.0, pruebas, 5 documentos `ECOSISTEMA_CMO_*` |
| estratificacionEM | `8e2d957` | Flujo de 7 etapas sobre el núcleo (1.1.0, borrador) |
| cmoriesgocardiovascular | `ec336b4` | Núcleo + estado provisional + 5 defectos |
| cmopediatria | `e68c1d6` | XSS |
| cmoncologia | `76bb25f` | XSS |
| estratificacionmigrana | `670ba4d` | XSS |
| cmo-vih-app | `2ca6c06` | XSS |
| cmo-vhb-vhd | `7e51835` | XSS |

## Capacidades unificadas (EM y RCV)

Inicio con centro, profesional y seudónimo · estado pendiente y resultado provisional con alcance máximo · revisión con evidencia y aviso de negación · modificación profesional que conserva el resultado del modelo · necesidades confirmadas y potenciales · estado por intervención · informe único (copiar, PDF real, imprimir, texto) · JSON `cmo-export/1` y CSV seguro · importación validada · confirmación de operaciones destructivas y aviso al salir · 0 infracciones axe en las 7 etapas.

## Problemas corregidos

| Herramienta | Corrección |
|---|---|
| EM | XSS en comentarios de objetivos; CSV sin protección de fórmulas; «Prioridad 3» firme sin datos; propuestas del analizador aplicadas sin evidencia; informe con JSON incrustado |
| RCV | Variable dejada pendiente seguía puntuando; recursos borraban intervenciones; `TypeError` al reentrar; elevación perdida al volver; afirmación «sin alertas» no respaldada; «Prioridad 3» firme con 0/20; 42 campos sin nombre accesible |
| Pediatría, Oncohematología, Migraña, VIH, VHB-VHD | XSS por datos pegados, tecleados o importados |

## Reglas clínicas preservadas (evidencia)

- EM: `assets/js/model.js` idéntico (huella en pruebas); reglas del analizador idénticas a la 1.0.0 (diff y prueba frente a copia congelada).
- RCV: `config.js`, `cmo-engine.js`, `needs-mapper.js`, `interventions-catalog.js`, `heuristic-extraction.js`, `clinical-extraction-service.js` idénticos (huellas en pruebas).
- Parches XSS: solo ficheros de interfaz; baterías previas en verde (27, 43, 71, 50, 19).
- Lo nuevo que roza lo clínico es de **flujo** y está marcado para validación: modificación profesional en EM, criterio de «necesidad farmacoterapéutica» en EM, necesidades potenciales en RCV.

## Resultados de pruebas

Ver `ECOSISTEMA_CMO_TESTS.md`. Todas las baterías ejecutadas pasan: hub 23 + 11 e2e; EM 21 + 4 e2e; RCV 22 + 4 e2e; parches 28 / 44 / 72 / 51 / 20.

## Pendientes

**De validación profesional** (no decididos por el agente): lista en `ECOSISTEMA_CMO_PROGRESS.md`, «Decisiones que necesitan al autor», e incoherencias clínicas en `ECOSISTEMA_CMO_AUDIT.md` §5.

**Riesgo asistencial abierto, por prioridad:**
1. VIH y Oncohematología: hallazgos del texto que puntúan sin confirmación profesional.
2. VIH, Oncohematología, Migraña: una Prioridad 1 automática puede rebajarse sin justificación reforzada.
3. Importaciones sin validar (VIH rompe la app; Oncohematología muestra un resultado no recalculado; Migraña y VHB-VHD aceptan cualquier contenido).
4. Resultado firme sin datos (VHB-VHD, Coagulopatías, VIH, Migraña).
5. CSV sin protección de fórmulas (Pediatría, Oncohematología, Migraña, VIH, VHB-VHD).

**Técnicos:** adaptar las 7 herramientas restantes; CI en EM y RCV; convergencia opcional de Respiratorio al núcleo; comprobar en navegador el punto exacto de los parches de Migraña y VIH.

## Instrucciones de despliegue

No se ha desplegado nada: GitHub Pages publica la rama por defecto de cada repositorio y no se ha tocado ninguna.

1. Revisar y abrir un PR por repositorio desde `claude/zen-pasteur-u8tn7z`. Orden sugerido: los 5 parches XSS (pequeños e independientes) → hub → EM → RCV.
2. Antes de fusionar EM o RCV: `npm test` y `npm run test:e2e`; resolver las decisiones clínicas 1–2 de `ECOSISTEMA_CMO_PROGRESS.md`.
3. Commit de publicación (según `CMO-RELEASE-CHECKLIST.md`): EM → `status: "released"` y `releaseDate` real con 1.1.0; RCV → decidir versión en `APP_CONFIG.version`, `package.json` y `cmo-app-meta`; hub → decidir si el 0.3.0 se declara en `cmo-app-meta.designSystem` del propio hub.
4. Pediatría se publica desde `claude/awesome-cray-vilcvr` (no tiene `main`): el PR va contra esa rama. Pediatría, Oncohematología y Migraña incluyen ya `dist/` regenerado.
5. Tras publicar: comprobación manual en GitHub Pages, navegador corporativo, pegado en HCE y PDF en el visor institucional.
