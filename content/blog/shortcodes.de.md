+++
title = "Shortcodes"
description = "Informationen über die vom Daisy-Theme unterstützten Shortcodes."
date = "2025-03-30"
authors = ["Adrian Winterstein"]

[taxonomies]
tags=['documentation']
+++

Das Daisy-Theme enthält einige  [Shortcodes](https://www.getzola.org/documentation/content/shortcodes/), die in den Markdown-Dateien für Zola verwendet werden können.

## Badges

Die folgenden Badges für Info-, Erfolgs-, Warnungs- oder Fehlermeldungen mit optionalem Icon existieren im Theme:

{% badge_info(icon=true) %}Das ist ein Info-Text.{% end %}
{% badge_success(icon=true) %}Das ist ein Erfolgs-Text.{% end %}
{% badge_warning(icon=true) %}Das ist ein Warnungs-Text.{% end %}
{% badge_error(icon=true) %}Das ist ein Fehler-Text.{% end %}

So können sie im Markdown verwendet werden:

```jinja2
{%/* badge_info(icon=true) */%}Das ist ein Info-Text.{%/* end */%}
{%/* badge_success(icon=true) */%}Das ist ein Erfolgs-Text.{%/* end */%}
{%/* badge_warning(icon=true) */%}Das ist ein Warnungs-Text.{%/* end */%}
{%/* badge_error(icon=true) */%}Das ist ein Fehler-Text.{%/* end */%}
```

Zusätzlich gibt es noch Badges in den Hauptfarben des jeweils gewählten Farbschemas:

{% badge_primary() %}Das ist eine Badge mit der primären Farbe des Farbscemas.{% end %}
{% badge_secondary() %}Das ist eine Badge mit der sekundären Farbe des Farbschemas.{% end %}
{% badge_accent() %}Das ist eine Badge mit der Akzentfarbe des Farbschemas.{% end %}
{% badge_neutral() %}Das ist eine Badge mit der neutralen Farbe des Farbschemas.{% end %}

So können sie im Markdown verwendet werden:

```jinja2
{%/* badge_primary() */%}Das ist eine Badge mit der primären Farbe des Farbschemas.{%/* end */%}
{%/* badge_secondary() */%}Das ist eine Badge mit der sekundären Farbe des Farbschemas.{%/* end */%}
{%/* badge_accent() */%}Das ist eine Badge mit der Akzentfarbe des Farbschemas.{%/* end */%}
{%/* badge_neutral() */%}Das ist eine Badge mit der neutralen Farbe des Farbschemas.{%/* end */%}
```
