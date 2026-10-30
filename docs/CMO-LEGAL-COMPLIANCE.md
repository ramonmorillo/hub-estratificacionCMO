# Matriz normativa (evaluación documental inicial, no certificación)

Leyenda: **V** aplicable y verificada · **P** aplicable, pendiente de adaptación · **J** requiere valoración jurídica o regulatoria · **N/A** no aplicable (con justificación).

## 1. Tratamiento real de datos por herramienta (verificado en el código)

| Herramienta | Datos de salud en el navegador | Persistencia | Envío a terceros | Riesgos específicos |
|---|---|---|---|---|
| Hub | No | Ninguna | Solo alojamiento en GitHub Pages (analítica de Cloudflare retirada el 2026-10-30) | — |
| VIH | Sí (casos seudonimizados) | localStorage + IndexedDB | No | Texto clínico pegado: verificar que no se persiste |
| Respiratorio | Sí | localStorage (sin cifrar; está documentado) | No (el build lo impide) | Equipos compartidos |
| RCV | Sí (en memoria) | No | Solo si se configura un endpoint (vacío por defecto) | Si se activa, habrá encargado del tratamiento y transferencia |
| EM | Sí (en memoria) | No | No | — |
| Migraña | Sí | localStorage / sessionStorage | No | — |
| Inmunomediadas | Sí | localStorage | Solo si se configura un endpoint (comentado) | Igual que RCV |
| Pediatría | Sí (menores) | localStorage | No | Datos de menores: categoría reforzada |
| Oncohematología | Sí | localStorage | No | — |
| Coagulopatías | Sí (en memoria) | No | No | — |
| VHB-VHD | Sí | localStorage | Carga un script de jsDelivr | Cadena de suministro (auditoría, H3) |

En todas las herramientas, el **desarrollador no recibe datos**. Cuando un centro las use con pacientes reales, el responsable del tratamiento será el centro (art. 4.7 del RGPD), que deberá valorar la base jurídica (art. 9.2.h), la seguridad del puesto y la conservación. Las políticas de cada herramienta deben decirlo así; la de Respiratorio ya lo hace.

## 2. Matriz

| Norma | Hub | Herramientas clínicas | Justificación / acción |
|---|---|---|---|
| RGPD / LOPDGDD: transparencia del sitio | **P** | **P** (hay PRIVACY en 6 de 10) | Hub: `legal.html` creada. Faltan VHB-VHD, EM, Coagulopatías y el hub de cada una |
| RGPD: responsable del tratamiento clínico | N/A (no trata datos de salud) | **J** | Depende del despliegue (centro frente a uso individual) |
| RGPD: transferencias internacionales (GitHub, Cloudflare, jsDelivr) | **J** | **J** | Verificar el marco de adecuación o las garantías de cada proveedor |
| LSSI-CE art. 10 (identificación del prestador) | **J** | **J** | Aplicabilidad dudosa en un sitio personal sin actividad económica; NIF y domicilio [PENDIENTE] |
| LSSI-CE art. 22.2 (cookies y similares) | **J** | **V** sin cookies; localStorage funcional exento como «estrictamente necesario» → **J** confirmar | El hub no crea cookies (verificado con Playwright); Cloudflare: [PENDIENTE] |
| MDR 2017/745 + MDCG 2019-11 rev.1 | N/A (catálogo de enlaces, sin cálculo) | **J** | Herramientas que estratifican pacientes concretos para orientar la intensidad de la atención farmacéutica: la finalidad prevista podría encajar en la regla 11. **No se afirma ni que sea ni que no sea producto sanitario.** Retirar «No es un producto sanitario» (VHB-VHD) |
| AI Act 2024/1689 | N/A | **N/A con justificación** en el estado por defecto | Las reglas son deterministas y la extracción es heurística local (expresiones regulares), sin modelos de IA. Si se activa un endpoint de IA en RCV o Inmunomediadas → **J** |
| Accesibilidad (RD 1112/2018) | N/A (sector privado) | N/A | Se mantiene WCAG 2.2 AA como objetivo de diseño voluntario |
| Propiedad intelectual (TRLPI) | **P** | **J** | Ninguna licencia. Los modelos clínicos son obras de SEFH y sus autores: verificar autorización de reproducción (Pediatría lo justifica por práctica habitual; no consta autorización expresa) |

## 3. Pendientes que debe aportar el titular (bloquean la versión `--strict`)

1. ~~Correo de contacto~~: resuelto (ralejandro.morillo.sspa@juntadeandalucia.es, indicado por el titular).
2. ~~NIF y domicilio~~: el titular decide no publicarlos.
3. Licencia del código (p. ej. una licencia de código abierto) y de los contenidos, por separado de los materiales SEFH.
4. ~~Cloudflare Web Analytics~~: retirado del hub.
5. Por cada herramienta: documento fuente exacto, autores del modelo y autorización de uso, si existe.
6. Valoración regulatoria MDR de la finalidad prevista de cada herramienta.
