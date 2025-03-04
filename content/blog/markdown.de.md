+++
title = "Markdown"
description = "Übersicht über das unterstüzte Mardown, die auch zeigt, wie es vom Theme gerendert wird."
date = "2025-03-30"
authors = ["Adrian Winterstein"]

[taxonomies]
tags=['documentation']
+++

In den Markdown-Dateien einer auf dem Daisy-Theme basierenden Webseite können alle auf dieser Seite beschriebenen Dinge verwendet werden.

## Überschriften

Alle sechs HTML Überschriften `<h1>` bis `<h6>` werden unterstützt:

```markdown
# H1
## H2
### H3
#### H4
##### H5
###### H6
```

# H1
## H2
### H3
#### H4
##### H5
###### H6

<br />

## Textformatierung

Hervorherbungen können so hinzugefügt werden:

```markdown
Text kann **fett**, *kursiv*, ***fett & kursiv***,
<u>unterstrichen</u>, ~durchgestrichen~ oder <mark>hervorgehoben</mark> sein.
```

Text kann **fett**, *kursiv*, ***fett & kursiv***,
<u>unterstrichen</u>, ~durchgestrichen~ oder <mark>hervorgehoben</mark> sein.

Es ist auch möglich tiefgestellte und hochgestellte Zeichen zu erzeugen:

```markdown
y = a<sub>0</sub> + a<sub>1</sub>x + a<sub>2</sub>x<sup>2</sup>
```

y = a<sub>0</sub> + a<sub>1</sub>x + a<sub>2</sub>x<sup>2</sup>

## Zitate

Zitate ohne Beleg können so erstellt werden:

```markdown
> Hier ist der **Text** des Zitats. \
> Und hier ist eine zweite Zeile.
```

> Hier ist der **Text** des Zitats. \
> Und hier ist eine zweite Zeile.

Und ein Beleg kann so hinzugefügt werden:

```markdown
> So long, and thanks for all the fish. \
> ― <cite>Douglas Adams, The Hitchhiker’s Guide to the Galaxy[^1]</cite>
```

Das Ziel des Beleglinks muss dann dort hinzugefügt werden, wo es erscheinen soll (zum Beispiel am Ende dieser Beispielseite):

```markdown
[^1]: The message, that was left by the dolphins when they departed earth in the Vierte book.
```

> So long, and thanks for all the fish. \
> ― <cite>Douglas Adams, The Hitchhiker’s Guide to the Galaxy[^1]</cite>

## Listen

### Geordnete Listen

```markdown
1. Erstes Element
2. Zweites Element
3. Drittes Element
```

1. Erstes Element
2. Zweites Element
3. Drittes Element

### Ungeordnete Listen

```markdown
* Erstes ungeordnetes Element
* Zweites ungeordnetes Element
  * Erstes verschachteltes Element
  * Zweites verschachteltes Element
* Drittes ungeordnetes Element
```

* Erstes ungeordnetes Element
* Zweites ungeordnetes Element
  * Erstes verschachteltes Element
  * Zweites verschachteltes Element
* Drittes ungeordnetes Element

## Tabellen

```markdown
| Erste Spalte       | Zweite Spalte       |
| ------------------ | ------------------- |
| Erste Zeile Links  | Erste Zeile Rechts  |
| Zweite Zeile Links | Zweite Zeile Rechts |
| Dritte Zeile Links | Dritte Zeile Rechts |
| Vierte Zeile Links | Vierte Zeile Rechts |
```

| Erste Spalte       | Zweite Spalte       |
| ------------------ | ------------------- |
| Erste Zeile Links  | Erste Zeile Rechts  |
| Zweite Zeile Links | Zweite Zeile Rechts |
| Dritte Zeile Links | Dritte Zeile Rechts |
| Vierte Zeile Links | Vierte Zeile Rechts |

<br />

Breite Tabellen können mit `<figure></figure>` umgeben werden, um horizontales Scrolling zu aktivieren:

```markdown
<figure>

| Erste Spalte | Zweite Spalte | Dritte Spalte | Vierte Spalte | Fünfte Spalte | Sechste Spalte | Siebte Spalte | Achte Spalte |
| ------------ | ------------- | ------------- | ------------- | ------------- | -------------- | --------------| ------------ |
| Erste        | Zweite        | Dritte        | Vierte        | Fünfte        | Sechste        | Siebte        | Achte        |

</figure>
```

<figure>

| Erste Spalte | Zweite Spalte | Dritte Spalte | Vierte Spalte | Fünfte Spalte | Sechste Spalte | Siebte Spalte | Achte Spalte |
| ------------ | ------------- | ------------- | ------------- | ------------- | -------------- | --------------| ------------ |
| Erste        | Zweite        | Dritte        | Vierte        | Fünfte        | Sechste        | Siebte        | Achte        |

</figure>

## Ausklappbarer Text

Ausklappbarer Text ist mit eingebettetem HTML in den Markdown-Dateien möglich:

```html
<details>
    <summary>Der Titel</summary>
    <p>Dies ist der ausklappbare Inhalt</p>
</details>
```

<details>
    <summary>Der Titel</summary>
    <p>Dies ist der ausklappbare Inhalt</p>
</details>

## Zusätzliche Elemente

### Abkürzungen

```html
<abbr title="Hypertext Markup Language">HTML</abbr>-Tags werden für Abkürzungen verwendet.
```

<abbr title="Hypertext Markup Language">HTML</abbr>-Tags werden für Abkürzungen verwendet.

### Tasten

```html
<kbd>Strg</kbd> + <kbd>Alt</kbd> + <kbd>Enf</kbd>
```

<kbd>Strg</kbd> + <kbd>Alt</kbd> + <kbd>Enf</kbd>

### Horizontale Linie

```markdown
---
```

---

<br />

Der Beleg von dem Zitat oben wurde am Ende des Seite eingefügt:

[^1]: The message, that was left by the dolphins when they departed earth in the Vierte book.
