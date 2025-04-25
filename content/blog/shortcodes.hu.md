+++
title = "Shortkódok"
description = "Tájékoztató a Daisy használatával elérhető shortkódokról."
date = "2025-04-25"
authors = ["Adrian Winterstein", "Seres Dániel"]

[taxonomies]
tags=['Documentation']
+++

A Daisy az alábbi [shortkódok](https://www.getzola.org/documentation/content/shortcodes/) beszúrását támogatja, amelyek később a Zola által feldolgozásra kerülnek a markdown-fájlokkal együtt.

## Kitűzők

A téma különböző formátumú üzenetek megjelenítését teszi lehetővé. Ezeknél az ikon opcionális. A formátumok a következők lehetnek: információközlés, sikeres kimenetről tájékoztatás, figyelmeztetés, hibáról tájékoztatás. Ezek megjelenítve:

{% badge_info(icon=true) %}Így néz ki az információközlés.{% end %}
{% badge_success(icon=true) %}Így néz ki a sikeres kimenetről tájékoztatás.{% end %}
{% badge_warning(icon=true) %}Így néz ki a figyelmeztetés.{% end %}
{% badge_error(icon=true) %}Így néz ki a hibáról tájékoztatás.{% end %}

Az egyes üzenetek markdownban a következő módon írhatók le:

```jinja2
{%/* badge_info(icon=true) */%}Így néz ki az információközlés.{%/* end */%}
{%/* badge_success(icon=true) */%}Így néz ki a sikeres kimenetről tájékoztatás.{%/* end */%}
{%/* badge_warning(icon=true) */%}Így néz ki a figyelmeztetés.{%/* end */%}
{%/* badge_error(icon=true) */%}Így néz ki a hibáról tájékoztatás.{%/* end */%}
```

Ezeken túl a használatban lévő színséma színei is rendelkezésre állnak. A fenti címsorban található témaválasztó segítségével előnézetet kaphatsz a színekről. Egy adott színsémához a következő színek társulnak:

{% badge_primary() %}Így néz ki egy szövegbuborék az elsődleges témaszínekkel.{% end %}
{% badge_secondary() %}Így néz ki egy szövegbuborék a másodlagos témaszínekkel.{% end %}
{% badge_accent() %}Így néz ki a hangsúlyos színezésű szövegbuborék.{% end %}
{% badge_neutral() %}Így néz ki a semleges színezésű szövegbuborék.{% end %}

Az egyes üzenetek markdownban a következő módon írhatók le:

```jinja2
{%/* badge_primary() */%}Így néz ki egy szövegbuborék az elsődleges témaszínekkel.{%/* end */%}
{%/* badge_secondary() */%}Így néz ki egy szövegbuborék a másodlagos témaszínekkel.{%/* end */%}
{%/* badge_accent() */%}Így néz ki a hangsúlyos színezésű szövegbuborék.{%/* end */%}
{%/* badge_neutral() */%}Így néz ki a semleges színezésű szövegbuborék.{%/* end */%}
```
