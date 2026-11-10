# Ecosistema CMO–MAPEX · Pruebas

Todo lo que figura aquí se ejecutó el 2026-11-10 (Node 22, Chromium de Playwright, axe-core 4.10.2 instalado fuera de los repositorios). Datos siempre ficticios.

## 1. Resultados

| Repositorio (rama `claude/zen-pasteur-u8tn7z`) | Antes | Después | Qué cubre lo nuevo |
|---|---|---|---|
| Hub | 11 firma + 11 e2e + control de publicación | **23** unitarias (11 firma + 12 núcleo) · e2e 11/11 con axe 0 · «Apto» | Informe único (texto = HTML = PDF en secciones), provisional, validación, escape, CSV, sobre de exportación, importación hostil, PDF (estructura, xref, paginación), evidencia/negación, ausencia de red y almacenamiento |
| EM | 6 casos de autocomprobación + 4 | Autocomprobación + **21** unitarias · **4** e2e | Paridad con el motor (6 casos frontera en dos modos + todas las variables y opciones una a una), pendientes y peor escenario, excluyentes, modificación profesional, catálogo de intervenciones = original, informe, ida y vuelta de exportación, analizador = copia congelada 1.0.0, huella de `model.js` |
| RCV | 11 | **22** unitarias · **4** e2e | Fronteras 16/17 y 22/23, paridad por variable y opción, provisional con 0 datos, propuestas sin validar, embarazo, menor de 18, elevación, necesidades = `needs-mapper`, informe, importación manipulada, huellas de 6 ficheros clínicos |
| Pediatría | 27 | 28 | Regresión XSS |
| Oncohematología | 43 | 44 | Regresión XSS |
| Migraña | 71 | 72 | Regresión XSS |
| VIH | 50 | 51 | Regresión XSS |
| VHB-VHD | 19 | 20 | Regresión XSS |
| Coagulopatías, Inmunomediadas, Respiratorio | 83 · 16 · 50+10 | Sin cambios (no modificados) | — |

## 2. Recorridos e2e (EM y RCV)

Cada batería se repitió 5 veces seguidas sin fallos tras corregir una carrera de la propia prueba (leía el aviso antes de terminar la importación asíncrona).

- **Manual completo**: bloqueo sin centro/profesional → variables → provisional → finalizar → necesidades → estado de intervenciones → texto HCE → portapapeles (igual al texto) → PDF (cabecera `%PDF-1.4`, contenido) → `.txt` idéntico → impresión (mismo informe en el marco aislado) → JSON (`cmo-export/1`) → CSV → recarga/reinicio con confirmación → importación de fichero inválido rechazada → importación válida.
- **Análisis asistido**: texto vacío rechazado; evidencia literal; aviso de posible negación; nada puntúa sin decisión; lo no decidido y lo descartado quedan pendientes; el texto pegado no llega al borrador ni al informe.
- **Reglas del modelo vistas en interfaz**: EM 18 puntos → Prioridad 1, criterios excluyentes, embarazo → P1 automática; RCV embarazo → P1, elevación solo al alza con motivo.
- **Carga hostil**: `<img onerror>` en comentarios/objetivos no se ejecuta ni crea elementos; fichero manipulado (RCV) se recalcula con el motor.
- **Móvil 375 px**: desbordamiento horizontal 0 en todas las etapas; tres estados manejables con teclado (EM).
- **Accesibilidad**: axe WCAG 2.0/2.1/2.2 A y AA = 0 infracciones en las 7 etapas de EM y de RCV (RCV partía de 42 campos sin nombre accesible).
- **Red**: 0 peticiones a terceros en todo el recorrido.

## 3. Validación de las propias pruebas (mutaciones)

| Mutación | Resultado |
|---|---|
| EM: el adaptador trata «No» como criterio activo | 8 pruebas fallan |
| EM: el peor escenario deja de calcularse | 3 fallan |
| RCV: el adaptador acepta registros sin validar | 1 falla |
| EM/RCV: cualquier cambio en ficheros clínicos | Falla la prueba de huella SHA-256 |

## 4. Comprobación en navegador de los parches XSS

Texto con `<img onerror>` pegado en las áreas de texto visibles y análisis lanzado: **Pediatría** (donde la auditoría lo había ejecutado), **Oncohematología** y **VHB-VHD**: no se ejecuta ni crea elementos, sin errores. **Migraña** y **VIH**: la app carga sin errores, pero el punto exacto corregido (justificación de la modificación; evidencia y ventana de impresión) **no se volvió a ejercitar en navegador**; queda cubierto por la prueba estática de regresión y por la lectura del diff.

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
