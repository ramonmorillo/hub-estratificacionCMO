# Arquitectura de reutilización

## 1. Decisión: opción D híbrida (tokens + CSS por capas + Custom Element), distribuida como copia fijada

| Opción | Por qué se descarta o se elige |
|---|---|
| A. Paquete npm versionado | 8 de 10 apps no tienen dependencias npm en tiempo de ejecución; obligaría a introducir un empaquetador. Coste alto |
| B. Biblioteca de componentes (React) | Solo Coagulopatías usa React. Impondría un framework |
| C. Tokens + plantillas sincronizadas | Adecuada para los estilos, pero no resuelve la firma dinámica |
| **D. Híbrida** | **CSS (tokens y componentes en `@layer`) + un Custom Element nativo para la firma.** Funciona igual en vanilla y en React 19. Sin dependencias |

**Distribución:** la fuente canónica está en `hub-estratificacionCMO/cmo-design-system/` (SemVer en `VERSION`). Cada herramienta guarda una **copia fijada** en `vendor/cmo-ds/` mediante `tools/cmo-ds-sync.mjs`, que escribe `CMO-DS-VERSION.json` con el SHA-256 de cada fichero.

- Las apps **no enlazan** en caliente al hub. Por eso un cambio de diseño nunca altera una herramienta en producción sin un commit revisado en su propio repositorio.
- `--check` detecta ediciones manuales en la copia.

## 2. Integración en una herramienta (3 pasos, sin tocar la lógica)

```bash
node ../hub-estratificacionCMO/cmo-design-system/tools/cmo-ds-sync.mjs .
```

```html
<link rel="stylesheet" href="vendor/cmo-ds/cmo-tokens.css">
<link rel="stylesheet" href="vendor/cmo-ds/cmo-components.css">
<style>:root{--cmo-accent:#0b6f86}</style>
<script type="application/json" id="cmo-app-meta">{ … }</script>
<script type="module" src="vendor/cmo-ds/cmo-author-signature.js"></script>
…
<cmo-author-signature meta="cmo-app-meta"><p>Texto de respaldo sin JS</p></cmo-author-signature>
```

Las apps con *build* propio (Respiratorio, Pediatría, Oncología, Migraña) deben incluir `vendor/` en la copia a `dist/`. En React (Coagulopatías), `<cmo-author-signature>` se usa como un elemento JSX normal y los metadatos van en `index.html`.

## 3. Esquema `cmo-app-meta/1`

```json
{
  "schema": "cmo-app-meta/1",
  "id": "cmo-respiratorio",
  "name": "CMO-Respiratorio",
  "appVersion": "1.2.0",
  "algorithm": { "name": "CMO-Respiratorio", "version": "1.0", "source": "Adaptación del Modelo… (SEFH)" },
  "status": "released",
  "releaseDate": "AAAA-MM-DD",
  "clinicalReviewDate": null,
  "credits": [
    { "role": "Desarrollo digital", "name": "Dr. Ramón Morillo Verdugo" },
    { "role": "Modelo clínico", "name": "Grupo de trabajo SEFH (documento fuente)" }
  ],
  "model": "Basado en el modelo CMO: Capacidad, Motivación y Oportunidad.",
  "website": "https://ramonmorillo.es",
  "copyright": { "year": "2026", "holders": ["…titulares verificados…"] },
  "designSystem": "0.1.0"
}
```

Reglas:

- `releaseDate` solo se rellena en el commit de publicación, con la fecha real de esa publicación. Mientras `status` no sea `released`, la firma muestra «pendiente de publicación». Nunca se usa `new Date()`.
- `appVersion` (interfaz y código) y `algorithm.version` (clínica) son independientes. Un cambio visual sube `appVersion` en *minor* o *patch*, nunca `algorithm.version`.
- `credits` es una lista: se conservan todas las atribuciones legítimas.

## 4. Contenido legal

El hub incluye `legal.html` como plantilla de referencia (aviso legal, privacidad, cookies, condiciones de uso, transparencia y accesibilidad). Cada herramienta tendrá su propia página, con la misma estructura pero el contenido de **su** tratamiento real (ver CMO-LEGAL-COMPLIANCE). Lo pendiente se marca con `[PENDIENTE: …]`, y `tools/cmo-release-check.mjs` lo cuenta.

## 5. Pruebas

- `cmo-design-system/tests/signature.test.mjs`: modelo puro de la firma (7 casos).
- `tests/hub.e2e.mjs`: paridad funcional con la versión anterior del hub, teclado, privacidad, adaptación a pantallas, movimiento reducido y axe.
