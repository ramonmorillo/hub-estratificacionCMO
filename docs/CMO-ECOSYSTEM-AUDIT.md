# Auditoría del ecosistema CMO

Fecha de la auditoría: 2026-10-29 · Método: clonado de solo lectura de los 10 repositorios + hub, inspección selectiva (estructura, `package.json`, búsquedas dirigidas) y ejecución de las pruebas existentes. Se excluyeron `node_modules`, `dist/` y binarios.

## 1. Alcance verificado

- **Repositorios accesibles:** los 10 solicitados + `hub-estratificacionCMO` (todos públicos, `ramonmorillo/*`). Lectura completa; **escritura solo en este repo** (rama `claude/determined-thompson-my7j5j`).
- **Hosting:** GitHub Pages con dominio propio `ramonmorillo.es` (CNAME en `ramonmorillo.github.io`). El hub enlaza a `ramonmorillo.github.io/<repo>/`, que redirige al dominio.
- **Recursos de Claude Code disponibles:** skills genéricas (superpowers, artifact-*), sin skills específicas de design system ni accesibilidad. Playwright + Chromium preinstalados; `axe-core` 4.10.2 instalado solo en el área temporal para auditar (no forma parte del repo). Sin `CLAUDE.md` previo.
- **Conector PubMed:** fallo de conexión (no necesario para esta fase).

## 2. Inventario

| Herramienta | Tecnología | Versión declarada | Último cambio | Persistencia | Red externa | Exportación | Pruebas (línea base) | Docs legales |
|---|---|---|---|---|---|---|---|---|
| cmo-vih-app | JS vanilla, módulos ES, i18n es/en/pt | 3.0.0 (`package.json`), «v3 — September 2026» | 2026-09-16 | localStorage + IndexedDB | No (`fetch` solo i18n local) | Sí | 45/45 ✅ | LEGAL_NOTICE, PRIVACY, TERMS, AI_POLICY (en inglés) |
| cmorespiratorio | JS vanilla + build propio, CI | 1.2.0 (pie) | 2026-10-12 | localStorage + sessionStorage | No (el build bloquea `fetch`/XHR) | PDF, texto HCE | 46/46 ✅ | LEGAL, PRIVACY, AI_POLICY, checklist |
| cmoriesgocardiovascular | JS vanilla, módulos ES | 1.1.0 | 2026-09-10 | — | Endpoint de IA opcional, vacío por defecto | Sí | 7/7 ✅ | PRIVACY, AI_POLICY |
| estratificacionEM | JS vanilla | sin versión | 2026-09-10 | — | No | Sí | selfcheck ✅ | — |
| estratificacionmigrana | JS vanilla (subcarpeta `cmo-migrana-app`), build a raíz | 1.0.0; modelo «v1.0 — julio 2026» | 2026-09-10 | localStorage + sessionStorage | No | Sí | 67/67 ✅ | LEGAL, PRIVACY, AI_POLICY |
| cmoinmunomediadas | JS vanilla, módulos ES | «v1 · Septiembre 2026» | 2026-09-10 | localStorage | Endpoint de IA opcional, **comentado** | Sí | **sin pruebas** | PRIVACY, AI_POLICY |
| cmopediatria | JS vanilla + build | 1.1.0 | 2026-09-16 | localStorage | No (build lo verifica) | Sí | 23/23 ✅ | LEGAL, PRIVACY, AI_POLICY |
| cmoncologia | JS vanilla + build, Pages CI | 1.1.1 | 2026-09-16 | localStorage | No | JSON/CSV/PDF | 39/39 ✅ | LEGAL, PRIVACY |
| cmocoagulopatias | React + TypeScript + Vite, deploy CI | 1.0.0 | 2026-09-16 | — | No | Informe | 79/79 ✅ | — |
| cmo-vhb-vhd | JS vanilla | sin versión | 2026-09-10 | localStorage (`hbv_hdv_patients_v1`) | **CDN jsDelivr: `xlsx@0.18.5` sin SRI** | XLSX/JSON | **sin pruebas** | — |
| hub (este repo) | HTML único | sin versión (antes) → 1.0.0 | 2026-10-26 | — | **Cloudflare Web Analytics** | — | e2e nuevo 11/11 ✅ | nuevo `legal.html` |

**Línea base de regresión:** 306 pruebas automáticas + 1 autocomprobación, todas en verde el 2026-10-29 (Node 22.22.0).

Ninguna herramienta tiene autenticación, backend ni Supabase. Ninguna tiene fichero `LICENSE`. Ninguna tiene etiquetas git de versión.

## 3. Autoría declarada (literal, no inferida)

| Herramienta | Declaración visible |
|---|---|
| Pediatría | «Creada por Ramón Morillo Verdugo. Modelo basado en la Adaptación… SEFH». El aviso legal atribuye **la autoría científica del modelo al grupo de trabajo SEFH**. |
| Respiratorio | «Creada por Ramón Morillo Verdugo en julio de 2026»; modelo de publicación SEFH. |
| Coagulopatías | «Ramón Morillo Verdugo · 2026»; documento SEFH. |
| EM | «Herramienta desarrollada por Ramón Morillo Verdugo. Junio 2026»; documento de adaptación CMO-EM. |
| RCV | «Creada por Ramón Morillo · Septiembre de 2026». |
| VHB-VHD | «Creado por Ramón Morillo — Junio 2026». |
| VIH | «© 2026 Ramón Morillo-Verdugo» (en cadenas i18n). |
| Migraña | «Autor: Ramón Morillo-Verdugo». |
| Inmunomediadas | Solo «Basado en el Proyecto MAPEX · SEFH»; sin autor visible. |
| Oncología | Sin autor visible en el pie. |

Grafías divergentes: «Ramón Morillo», «Ramón Morillo Verdugo», «Ramón Morillo-Verdugo». Varias herramientas tienen commits de asistentes de IA (Claude, Codex).

## 4. Hallazgos y riesgos

| # | Hallazgo | Gravedad | Recomendación |
|---|---|---|---|
| H1 | La firma pedida («Desarrollo científico y digital») no coincide con lo que dicen los propios repos: el **modelo clínico** es de grupos de trabajo SEFH (dicho de forma expresa en Pediatría) | **Alta (atribución)** | La firma separa «Desarrollo digital» de «Modelo clínico: documento fuente». Confirmar caso a caso |
| H2 | Afirmaciones regulatorias: «No es un producto sanitario» (VHB-VHD) frente a «no es un producto sanitario **certificado**» (Pediatría, Respiratorio, VIH) | Alta | La primera es una conclusión regulatoria sin análisis documentado → cambiarla por la segunda formulación hasta tener una valoración MDR |
| H3 | `xlsx@0.18.5` cargado desde CDN sin integridad (SRI). Verificado: solo **escribe** XLSX (`book_new`, `json_to_sheet`, `writeFile`) y la importación es JSON, así que las vulnerabilidades conocidas de *parseo* de esa versión no se activan. El riesgo principal es de **cadena de suministro**: un script de terceros con acceso a los datos de pacientes guardados en localStorage | Media | Copia local fijada con SRI, o exportación CSV nativa |
| H4 | Cloudflare Web Analytics en el hub (y en la web profesional) sin política de privacidad | Media (legal) | Documentado en `legal.html` con [PENDIENTE]; requiere valoración jurídica |
| H5 | Fechas del hub incorrectas («Febrero 2026» de creación, cuando el primer commit es del 2026-03-24; «Septiembre-2026» de actualización, cuando el último cambio es del 2026-10-26) | Media (trazabilidad) | Sustituidas por metadatos controlados |
| H6 | Terminología de niveles distinta («Nivel 1–3» en VHB-VHD y Coagulopatías; «Prioridad 1–3» en el resto). El orden es coherente (1 = máximo) | Media (seguridad clínica) | El sistema de diseño **no** unifica etiquetas: el texto lo pone cada herramienta |
| H7 | Capa `cmo-visual.css` copiada a mano en 8 repos, con 8 variantes distintas (md5) y uso masivo de `!important` sobre los selectores de cada app | Media (mantenimiento) | Sustituirla progresivamente por la copia versionada del sistema de diseño (`@layer`, sin `!important`) |
| H8 | Sin licencia en ningún repo: por defecto, todos los derechos reservados | Media | Decisión del titular (ver CMO-LEGAL-COMPLIANCE) |
| H9 | Coagulopatías declara las dependencias como `"latest"`: builds no reproducibles (hoy instala React 19.3, Vite 8.3, TypeScript 7.0) | Media | Fijar versiones (`package-lock` + rangos exactos) |
| H10 | VHB-VHD e Inmunomediadas sin pruebas automatizadas | Media | Crear casos de referencia antes de cualquier cambio visual |
| H11 | Falso positivo descartado: el endpoint `mi-backend.ejemplo.org` de Inmunomediadas está **comentado**; sin configurar, la extracción es heurística local | — | Mantener vacío; documentar en la política de privacidad |

### 4.1 Estado de los hallazgos (2026-10-30)

| # | Estado | Dónde |
|---|---|---|
| H2 | Resuelto: «No es un producto sanitario certificado» | ramonmorillo/cmo-vhb-vhd#11 (fusionado) |
| H3 | Resuelto: copia local fijada con SRI, sin CDN. **Decisión del autor (delegada): mantener `xlsx` 0.18.5** mientras la app solo escriba XLSX; criterios de revisión en `vendor/xlsx/README.md` | ramonmorillo/cmo-vhb-vhd#11 (fusionado), #16 |
| H7 | Resuelto: las 10 herramientas usan la copia fijada del DS; ninguna capa con `!important` nueva | Fases 1-6 |
| H9 | Resuelto: dependencias fijadas, lockfile y `npm ci` | ramonmorillo/cmocoagulopatias#7 (fusionado) |
| H10 | Resuelto: casos de referencia | ramonmorillo/cmoinmunomediadas#4, ramonmorillo/cmo-vhb-vhd#10 (fusionados) |
| Nuevo | Rótulos de «IA» en 5 apps que usan reglas locales. **Decisión del autor: corregir** | ramonmorillo/estratificacionEM#5, ramonmorillo/cmoriesgocardiovascular#5, ramonmorillo/cmo-vih-app#14, ramonmorillo/cmoinmunomediadas#6, ramonmorillo/cmo-vhb-vhd#13 |
| Nuevo | VHB-VHD: seudónimo = hash de 32 bits sin sal del identificador local (reversible). **Decisión delegada: seudónimo aleatorio reutilizado por paciente**; los registros existentes no se reescriben | ramonmorillo/cmo-vhb-vhd#14 |
| Nuevo | VHB-VHD: etiqueta de nivel incoherente con reglas de seguridad y errores del extractor. **El autor pide revisión clínica**: propuesta en borrador | ramonmorillo/cmo-vhb-vhd#15 |
| Nuevo | Inmunomediadas: edad vacía +1; bloque demográfico 11/9. **Lo revisa el autor** | Pruebas de ramonmorillo/cmoinmunomediadas#4 |
| H4 | Resuelto: se retira Cloudflare Web Analytics del hub; sin terceros salvo el alojamiento (GitHub Pages). Aviso legal y privacidad completos, sin `[PENDIENTE]` | Hub (PR posterior a #18) |
| H1, H5, H6, H8 | Sin cambios (H8: «todos los derechos reservados» declarado en el aviso legal) | — |

## 5. Funciones clínicas críticas que no deben tocarse

Ficheros que contienen variables, pesos, umbrales o reglas, y que quedan **fuera del alcance** del rediseño: `assets/modules/{cmo-engine,config,needs-mapper,interventions-catalog}.js` (VIH, RCV, Inmuno), `src/{clinical,extractor,assessment-state,workflow,report}.js` (Respiratorio, Pediatría, Oncología), `assets/js/model.js` (EM), `cmo-migrana-app/src/{core,local-extractor}.mjs` (Migraña), `src/{domain,data}/*` (Coagulopatías), bloque de reglas de `app.js` (VHB-VHD, líneas 1–90 aprox.). También las claves de almacenamiento y los esquemas de exportación (p. ej. `hbv_hdv_patients_v1`, `cmo-inmunomediadas-v1-*`, `DB_NAME` de VIH).
