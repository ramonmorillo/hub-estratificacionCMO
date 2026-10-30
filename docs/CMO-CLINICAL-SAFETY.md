# Seguridad clínica del rediseño

## 1. Límites no negociables

El rediseño solo puede tocar: hojas de estilo, marcado de presentación (clases, landmarks, atributos ARIA), cabecera y pie, firma, favicon y páginas legales.

Está **prohibido** modificar: los ficheros listados en la auditoría (§5), las claves de almacenamiento, los esquemas de exportación, los textos de niveles o prioridades, las opciones de los formularios clínicos (`value` y puntuaciones) ni el orden de evaluación.

## 2. Protocolo por herramienta

1. **Antes:** ejecutar la batería existente y guardar la salida (línea base del 2026-10-29: 306 pruebas en verde + autocomprobación de EM).
2. **Casos de referencia:** VHB-VHD e Inmunomediadas no tienen pruebas. Antes de rediseñarlas hay que crear al menos 6 casos reproducibles por herramienta (frontera de cada umbral + reglas especiales), registrando la puntuación y el nivel.
3. **Diff controlado:** el diff no debe incluir ninguno de los ficheros clínicos. Comprobación:

   ```bash
   git diff --name-only main | grep -E 'engine|config|clinical|extractor|model|core|domain|data/|assessment|scoring' && echo "REVISIÓN CLÍNICA OBLIGATORIA"
   ```

4. **Después:** ejecutar la misma batería, que debe dar resultados idénticos, más una prueba e2e de paridad DOM-resultado (patrón de `tests/hub.e2e.mjs`: la misma entrada en la versión anterior y en la nueva debe dar la misma salida).
5. **Datos persistidos:** abrir la versión nueva con un localStorage o IndexedDB generado por la anterior y verificar que carga sin migraciones.

## 3. Semántica de niveles

El orden es 1 = máximo en todas las herramientas, pero las etiquetas varían («Nivel» / «Prioridad») y **no implican equivalencia de gravedad entre enfermedades**. `.cmo-level` aplica color y marcadores a partir de `data-level`; el texto siempre lo aporta la herramienta. No se debe comparar visualmente entre herramientas, por ejemplo en el hub.

## 4. Resultado del piloto (hub)

El hub no contiene lógica clínica. La paridad funcional con la versión anterior (`9369b30`) está verificada automáticamente: el catálogo, las URLs, 9 términos de búsqueda y 9 filtros dan resultados idénticos. Una prueba de mutación confirma que la batería detecta cambios de URL y de categoría.
