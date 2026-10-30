# Estrategia de marca — CMO Design System · Ramón Morillo

## 1. Arquitectura de marca

- **Marca madre:** «CMO · Estratificación farmacoterapéutica». Se identifica por el sello «Estratos» y por la tríada cromática C·M·O.
- **Submarcas:** «CMO-<Área>» (CMO-VIH, CMO-Respiratorio…). Se mantienen los nombres actuales del hub. Cada submarca tiene **un único** color de acento (`--cmo-accent`), que solo se usa en la identidad: franja de la cabecera, etiqueta de área y borde de la tarjeta.
- **Firma de autor:** componente `<cmo-author-signature>`. Es discreta, va en el pie y en «Acerca de», y se genera a partir de metadatos controlados.
- **Relación con SEFH/MAPEX:** solo se citan y enlazan sus documentos. No se usan sus logotipos ni se imitan sus colores. *Nota:* el hub anterior (commit `1b329fa`) se rediseñó con la «paleta de referencia SEFH» (teal, magenta, oliva, azul). Este sistema la sustituye para no confundirse con la identidad institucional.

## 2. Tres direcciones creativas

| | A. «Estratos» (elegida) | B. «Laboratorio nocturno» | C. «Clínica modular» |
|---|---|---|---|
| Idea | Papel claro y tinta azul noche. Títulos con serifa académica. El sello son tres capas decrecientes (estratos) con los colores C·M·O | Evoluciona la capa actual: fondo oscuro degradado, retícula, tarjetas flotantes | SaaS neutro: blanco, una tipografía sans y un solo azul |
| Legibilidad clínica | Alta (texto oscuro sobre claro, se imprime bien) | Media: paneles translúcidos, se imprime mal | Alta |
| Originalidad / autoría | Alta: la metáfora de la estratificación es propia del modelo | Media: ya existe y es genérica del «tech» | Baja: no se distingue |
| Accesibilidad | Todos los ratios ≥ 4,5:1 verificados | Contraste variable sobre degradados | Buena |
| Coste de implantación | Bajo: tokens + clases nuevas, sin `!important` | Ya existe, pero frágil (8 variantes) | Bajo |

**Por qué se elige A:** es la única que reúne identidad de autor y lectura clínica e impresión fiables. La metáfora visual (estratos = niveles de atención) procede del propio modelo, lo que la hace reconocible sin recursos decorativos.

## 3. Sello y favicon

`cmo-design-system/assets/cmo-mark.svg` y `favicon.svg` son diseños originales: un cuadrado redondeado en tinta `#14203a` con tres barras de longitud decreciente (Capacidad, Motivación y Oportunidad, en tonos claros de la tríada). Se lee a 16 px. No deriva de ningún logotipo de terceros.

Pendiente del titular: decidir si quiere un sello personal tipográfico adicional (p. ej. monograma «RMV»). No se ha creado para no imponer una firma personal sin validarla.

## 4. Voz

Precisa, sobria y en segunda persona de cortesía en los textos legales. No se usan superlativos ni expresiones como «validado», «certificado» o «basado en IA» si no hay evidencia que las respalde.
