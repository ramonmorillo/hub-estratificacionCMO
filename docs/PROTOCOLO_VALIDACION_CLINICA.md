# Protocolo de validación clínica de las herramientas CMO — borrador para el autor

Estado: **borrador metodológico**. No es un protocolo aprobado. Todo lo marcado `[PENDIENTE: …]` requiere decisión o dato del autor, del comité de ética/CEIm o de la unidad de protección de datos. No se proponen cifras como si estuvieran justificadas: las que aparecen son **puntos de partida a discutir**.

## 1. Qué se ha comprobado ya y qué no

| Aspecto | Estado | Evidencia |
|---|---|---|
| El software no altera el modelo clínico | Comprobado (técnico) | Huellas SHA-256 de los ficheros clínicos y paridad con los motores en las pruebas de cada repositorio |
| Cálculo correcto en las fronteras de los puntos de corte | Comprobado (técnico) | Pruebas de frontera por herramienta |
| Accesibilidad básica y ausencia de peticiones externas | Comprobado (técnico) | e2e con axe WCAG A/AA en CI |
| **El modelo reproduce la decisión de un farmacéutico experto** | **No evaluado** | — |
| **El extractor de texto propone valores correctos** | **No evaluado con casos reales** | Solo casos ficticios |
| **Utilidad y carga de trabajo en consulta** | **No evaluado** | — |
| Validez clínica del modelo SEFH en sí (puntos de corte, pesos) | **Fuera del alcance de este protocolo** | Corresponde al documento fuente SEFH |

Este protocolo cubre las tres filas «No evaluado» que dependen de la herramienta. No pretende validar el modelo SEFH.

## 2. Objetivos

**Primario.** Medir la concordancia entre la prioridad asignada por la herramienta y la asignada por farmacéuticos hospitalarios aplicando manualmente el modelo original (documento fuente SEFH de cada herramienta).

**Secundarios.**
1. Concordancia en la puntuación total y por bloque/dimensión.
2. Rendimiento del extractor local por variable (sensibilidad, valor predictivo positivo, falsos positivos por negación) frente a la revisión humana del mismo texto.
3. Efecto del resultado **provisional** (variables pendientes): cuántos casos quedan provisionales y con qué frecuencia cambia la prioridad al completarlos.
4. Frecuencia y motivos de la **modificación profesional**.
5. Tiempo de estratificación (herramienta frente a manual) y usabilidad percibida `[PENDIENTE: escala validada en español, a elegir]`.

## 3. Diseño

Estudio observacional, transversal, de concordancia entre métodos, por herramienta. Pilotos independientes por herramienta; no se agregan resultados entre herramientas con modelos distintos.

- **Método de referencia.** Estratificación manual con el modelo original por **dos farmacéuticos independientes y ciegos** a la herramienta; las discrepancias entre ellos se resuelven por consenso o por un tercer evaluador. Se registra también el acuerdo entre los dos (interevaluador), que es el techo realista de concordancia.
- **Método evaluado.** La herramienta, aplicada por un tercer farmacéutico (o por uno de los dos, en otro momento y tras un periodo de lavado `[PENDIENTE: duración]`), sobre los mismos casos.
- **Dos condiciones de uso**, registradas por separado: (a) entrada manual de todas las variables; (b) texto de historia clínica pegado, con revisión y confirmación de las propuestas.

## 4. Casos

- **Origen.** Pacientes reales atendidos en consultas externas, **seudonimizados antes** de salir de la historia clínica. Sin nombre, DNI, NHC, fechas de nacimiento completas, teléfonos ni direcciones.
- **Selección.** Consecutivos dentro de cada herramienta, con inclusión deliberada de casos cercanos a los puntos de corte (una puntuación por debajo y por encima de cada corte, según el `CLINICAL_RULES`/documento de cada herramienta) para no valorar solo los casos fáciles.
- **Tamaño.** Punto de partida para un piloto: 30 casos por herramienta, con al menos 10 por nivel de prioridad si hay casos disponibles. **No procede de un cálculo formal.** `[PENDIENTE: cálculo del tamaño muestral con un estadístico, según el kappa esperado y la precisión deseada del intervalo de confianza]`.
- **Exclusiones.** Casos fuera del ámbito declarado de cada herramienta (por ejemplo, edad fuera de rango), que se registran aparte.

## 5. Aspectos éticos y de protección de datos

- Aprobación o dictamen de exención del CEIm `[PENDIENTE: trámite y número de expediente]`.
- Base jurídica y valoración con la unidad de protección de datos del centro `[PENDIENTE]`. Los datos se seudonimizan en origen; la clave de correspondencia, si existe, queda en el centro y no se incorpora al registro de análisis.
- La herramienta no envía datos; aun así, **no se pegan en ella textos con datos identificativos**. El procedimiento de seudonimización del texto debe ser previo y verificado por una segunda persona.
- Los ficheros de análisis no contienen texto libre de historia clínica.

## 6. Procedimiento por caso

1. Seudonimizar el caso y asignar un código de estudio.
2. Evaluadores A y B estratifican manualmente (hoja del modelo original) y registran puntuación por bloque, prioridad, variables que no han podido valorar y tiempo.
3. Se resuelven discrepancias A–B (consenso/tercero) y se fija la **referencia**.
4. Evaluador C usa la herramienta en las condiciones (a) y/o (b), registra: puntuación, prioridad, variables pendientes, número de propuestas aceptadas/corregidas/descartadas, si aplica modificación profesional (nivel y motivo), tiempo.
5. Se descarga el informe JSON de la herramienta (sin texto libre) como registro objetivo y se anota la **versión exacta** de la herramienta.

**Congelación de versión.** Antes de empezar se fija la versión de cada herramienta evaluada (versiones publicadas el 2026-11-11: EM 1.1.0, Riesgo Cardiovascular 1.3.0, Oncohematología 1.3.0, VIH 3.2.0, Pediatría 1.3.0, Migraña 2.2.0, VHB-VHD 1.1.0, Inmunomediadas 1.2.0, Coagulopatías 1.2.0, Respiratorio 1.4.0). Cualquier cambio de código durante el estudio se documenta y, si toca el cálculo, invalida el periodo.

## 7. Análisis

| Pregunta | Medida | Notas |
|---|---|---|
| Acuerdo en prioridad (ordinal, 3 niveles) | Kappa ponderado (lineal), % de acuerdo, matriz de confusión con IC 95 % | Se informa también el kappa entre A y B |
| Acuerdo en puntuación total | CCI (acuerdo absoluto) y gráfico de Bland-Altman | Los límites de acuerdo se interpretan clínicamente, no solo estadísticamente |
| Extractor, por variable | Sensibilidad, especificidad, VPP, con IC 95 % | Referencia: variables fijadas por el consenso A–B a partir del mismo texto |
| Falsos positivos por negación | Casos con valor propuesto positivo y texto negado | Alimenta la decisión pendiente sobre las reglas de negación |
| Provisional | % de casos provisionales; cambio de prioridad al completar | Valora si la cota superior orienta bien |
| Modificación profesional | Frecuencia, dirección (elevar/reducir) y motivos codificados | Los motivos se codifican a categorías, no se exporta texto libre |
| Tiempo | Mediana y rango intercuartílico; comparación pareada | |

**Discordancias.** Toda discordancia de prioridad se clasifica por dos revisores en: (1) error de entrada del usuario, (2) ambigüedad del modelo o del documento fuente, (3) diferencia de interpretación entre evaluadores, (4) posible defecto de la herramienta, (5) otra. Las de tipo 4 se reproducen con el informe JSON y abren una incidencia con el caso mínimo.

## 8. Seguridad del paciente y criterios de parada

- La discordancia **hacia una prioridad menos intensiva que la referencia** se revisa caso a caso, porque es la que puede reducir la atención. Se informa por separado.
- Si se encuentra un defecto de la herramienta que cambie la prioridad en la dirección menos intensiva, se suspende su uso asistencial hasta corregirlo `[PENDIENTE: responsable y procedimiento de suspensión]`.
- Hasta que existan resultados, las herramientas se usan como apoyo, con el aviso ya incluido en ellas (no diagnósticas, no prescriptivas, no sustitutivas del juicio clínico).

## 9. Criterios de interpretación

No se fijan umbrales de «aprobado/suspenso» en este borrador. Propuesta de método: el autor define **antes** de analizar el kappa ponderado mínimo aceptable y los límites de acuerdo clínicamente tolerables, tomando como techo el acuerdo entre A y B. `[PENDIENTE: umbrales de aceptación, fijados por el autor antes de ver los datos]`.

## 10. Comunicación de resultados

Se sugiere informar según GRRAS (estudios de fiabilidad y acuerdo) y, para el extractor, según STARD (precisión diagnóstica). `[PENDIENTE: valorar la guía EQUATOR más adecuada al diseño final]`. Los resultados por herramienta, incluidos los desfavorables, se publican en la guía de uso del hub como estado de validación de cada herramienta (sustituyendo al marcador actual).

## 11. Cronograma y responsables

`[PENDIENTE: fechas, centros participantes, evaluadores A/B/C, responsable de datos y de la custodia de la clave de seudonimización]`.

## 12. Limitaciones previstas

- Un solo centro o pocos centros: generalización limitada.
- Los evaluadores conocen el objetivo del estudio y la herramienta no puede ocultarse al evaluador C.
- Con 30 casos por herramienta los intervalos de confianza serán amplios; el piloto sirve para detectar problemas, no para demostrar equivalencia.
- La referencia es el propio modelo aplicado a mano: mide si la herramienta lo implementa y lo usa bien, no si el modelo es clínicamente óptimo.

## Anexos

- `docs/validacion/plantilla-registro-casos.csv`: registro por caso (referencia y herramienta).
- `docs/validacion/plantilla-registro-extractor.csv`: registro por variable del extractor.
- `docs/validacion/checklist-por-herramienta.md`: lista de comprobación previa a cada sesión de evaluación.
