# Changelog — CMO Design System

## 0.2.0 — sin publicar
- `<cmo-author-signature>` multilingüe (es/en/pt): etiquetas propias, `lang` del elemento o de `<html>` (pt-BR → pt) y repintado al cambiar `<html lang>`. Textos del esquema localizables con `{ es, en, pt }`; si falta el idioma, se usa el español.
- En inglés las fechas se muestran en ISO (AAAA-MM-DD) para evitar la ambigüedad DD/MM.
- Compatible con 0.1.0: los metadatos existentes se muestran igual en español.

## 0.1.0 — sin publicar
- Primera versión: tokens «Estratos», componentes base, `<cmo-author-signature>`, sello y favicon, herramientas de sincronización y control de publicación.
- Token `--cmo-brand-soft` (#eef1fb), añadido durante el piloto Respiratorio.
- `tools/cmo-parity.mjs`: arnés de paridad usado en la fase 2.
