# CMO Design System v0.1.0

Fuente: `cmo-design-system/src/` · Sin dependencias, sin fuentes web y sin peticiones de red.

## 1. Principios

1. **No invasivo:** todo vive en `@layer cmo.*` y en clases `.cmo-*`. Los estilos propios de cada app (sin capa) siempre prevalecen. Prohibido usar `!important`, salvo en las utilidades de accesibilidad.
2. **El color nunca es el único canal:** los niveles añaden marcadores ●●●/●●○/●○○ y texto; los filtros, `aria-pressed` y ✓.
3. **La marca no es semántica:** la tríada C·M·O y los acentos de submarca **nunca** se usan en resultados clínicos.
4. **El texto clínico lo pone la herramienta:** el componente de nivel no contiene etiquetas («Nivel 1» o «Prioridad 1» las decide cada app; ver auditoría, H6).

## 2. Tokens (`cmo-tokens.css`) y contraste verificado

| Token | Valor | Contraste sobre blanco / papel |
|---|---|---|
| `--cmo-ink` | #14203a | 16,2 / 15,0 |
| `--cmo-ink-muted` | #4b5568 | 7,5 / 6,9 |
| `--cmo-c` Capacidad | #2d48b8 | 7,7 / 7,1 |
| `--cmo-m` Motivación | #743aa0 | 7,4 / 6,8 |
| `--cmo-o` Oportunidad | #0d6680 | 6,5 / 6,0 |
| `--cmo-focus` | #1f3aa8 | 9,4 / 8,7 |
| `--cmo-control-border` | #7b8495 | ≥ 3:1 (criterio 1.4.11) |
| `--cmo-level-1` sobre su fondo | #a3241a / #fbecea | 6,5 |
| `--cmo-level-2` sobre su fondo | #93500a / #fdf1e2 | 5,6 |
| `--cmo-level-3` sobre su fondo | #1e6b45 / #e8f3ec | 5,7 |

Tipografía: títulos con serifa del sistema (Iowan / Charter / Palatino / Georgia) y texto en sans del sistema. Las cifras usan `tabular-nums`. Espaciado con base de 4 px (`--cmo-space-1…8`). Radios de 6 y 10 px; 999 px solo en chips.

## 3. Acentos de submarca (todos ≥ 4,5:1 sobre blanco)

VIH #b02a4a · Respiratorio #0b6f86 · RCV #b3261e · EM #4f46a8 · Migraña #6b3fa0 · Inmunomediadas #8a5a00 · Pediatría #1d7a5a · Oncohematología #7a2f8f · Coagulopatías #a0371f · VHB/VHD #8d6a00.

## 4. Componentes

| Necesidad | Clase / elemento | Notas |
|---|---|---|
| Ámbito | `.cmo-scope` (en `body` o en un contenedor) | Activa la base tipográfica y el foco |
| Cabecera y marca | `.cmo-brandbar`, `.cmo-brand(__mark/__name/__tagline)` | |
| Navegación | `.cmo-nav` + `aria-current="page"` | |
| Firma gráfica | `.cmo-strata` (decorativa, `aria-hidden`) | |
| Títulos | `.cmo-title`, `.cmo-h2`, `.cmo-h3`, `.cmo-eyebrow`, `.cmo-lead` | |
| Botones | `.cmo-btn`, `--secondary`, `--ghost` | Altura mínima de 44 px |
| Formularios | `.cmo-field/.cmo-label/.cmo-input/.cmo-select/.cmo-textarea/.cmo-hint/.cmo-error-text` | Errores con `aria-invalid` + texto con ⚠ |
| Filtros | `.cmo-chips` > `button.cmo-chip[aria-pressed]` | |
| Tarjetas | `.cmo-card`, `.cmo-card--tool`, `__kicker/__text/__action` | Toda la tarjeta es clicable con un solo enlace |
| Alertas | `.cmo-alert`, `--warn`, `--error`, `__title` | |
| Nivel de estratificación | `<span class="cmo-level" data-level="1">Texto de la app</span>` | Orden: 1 = máximo |
| Puntuación | `.cmo-score` + `__value` + `<meter>` | El valor numérico siempre es visible |
| Explicación / ayuda | `<details class="cmo-explain">` | Nativo, accesible por teclado |
| Resumen del paciente | `<dl class="cmo-summary">` | Solo datos seudonimizados |
| Vacío / carga | `.cmo-empty`, `.cmo-loading` | La animación se desactiva con movimiento reducido |
| Modal | `<dialog class="cmo-modal">` | Foco y Esc nativos |
| Pie / legal | `.cmo-footer`, `.cmo-legal-links`, `.cmo-disclaimer` | |
| Autoría y versión | `<cmo-author-signature>` | Ver CMO-COMPONENT-ARCHITECTURE §3 |
| Exportación | `.cmo-btn--secondary` + `@media print` del sistema | La lógica de exportación sigue siendo de cada app |

## 5. Accesibilidad (objetivo WCAG 2.2 AA)

Enlace de salto, foco de 3 px con 2 px de separación, objetivos ≥ 44 px (≥ 36 px en chips, por encima del mínimo de 24 px del 2.5.8), soporte de `forced-colors`, `prefers-reduced-motion`, enlaces externos anunciados («se abre en una pestaña nueva») y contador con `role="status"`.

Verificado en el hub con axe-core 4.10.2: 0 infracciones (ver CMO-RELEASE-CHECKLIST). Pendiente: prueba manual con lector de pantalla (NVDA/VoiceOver), que no se ha podido hacer en este entorno.
