+++
title = "Markdown"
description = "Áttekintő a tartalomszerkesztéshez használható markdownról és arról, hogy azt a téma hogyan jeleníti meg."
date = "2025-04-25"
authors = ["Adrian Winterstein", "Seres Dániel"]

[taxonomies]
tags=['Documentation']
+++

A Daisy az alábbi formázási lehetőségeket biztosítja a témát használó webhelyek számára. Ezek alkotják a markdown-fájlok szerkezetét.

## Címsorok

Mind a hat HTML-címsortípus támogatott `<h1>`-től `<h6>`-ig:

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

<br>

## Szövegformázás

Szövegrészleteket többféleképpen lehet kihangsúlyozni:

```markdown
A szöveg lehet **félkövér**, *dőlt*, ***félkövér & dőlt***,
<u>aláhúzott</u>, ~áthúzott~ vagy <mark>kiemelt</mark>.
```

A szöveg lehet **félkövér**, *dőlt*, ***félkövér & dőlt***,
<u>aláhúzott</u>, ~áthúzott~ vagy <mark>kiemelt</mark>.

Alsó és felső indexben is elhelyezhető szöveg:

```markdown
y = a<sub>0</sub> + a<sub>1</sub>x + a<sub>2</sub>x<sup>2</sup>
```

y = a<sub>0</sub> + a<sub>1</sub>x + a<sub>2</sub>x<sup>2</sup>

## Idézetblokkok

Idézetblokkokat egyrészt létre lehet hozni hivatkozás nélkül:

```markdown
> Itt jelenik meg az idézet **szövege**. \
> Ez pedig itt a második sor.
```

> Itt jelenik meg az idézet **szövege**. \
> Ez pedig itt a második sor.

Másrészt létre lehet hozni hivatkozással. Ennek módja a következő:

```markdown
> Viszlát, és kösz a halakat! \
> ― <cite>Douglas Adams, Galaxis útikalauz stopposoknak[^1]</cite>
```

A hivatkozott szöveget ezután oda kell beilleszteni, ahol az meg szeretnénk hogy jelenjen (például ennek a weboldalnak a végére):

```markdown
[^1]: Az üzenet, amt a delfinek hagytak, amikor elhagyták a Földet a könyvsorozat negyedik részének cselekményében.
```

> Viszlát, és kösz a halakat! \
> ― <cite>Douglas Adams, Galaxis útikalauz stopposoknak[^1]</cite>

## Listák

### Számozott lista

```markdown
1. Első elem
2. Második elem
3. Harmadik elem
```

1. Első elem
2. Második elem
3. Harmadik elem

### Listajeles felsorolás

```markdown
* Első listajeles elem
* Második listajeles elem
  * Első beágyazott elem
  * Második beágyazott elem
* Harmadik listajeles elem
```

* Első listajeles elem
* Második listajeles elem
  * Első beágyazott elem
  * Második beágyazott elem
* Harmadik listajeles elem

## Táblázatok

```markdown
| Első oszlop            | Második oszlop          |
| ---------------------- | ----------------------- |
| Első sor bal oldal     | Első sor jobb oldal     |
| Második sor bal oldal  | Második sor jobb oldal  |
| Harmadik sor bal oldal | Harmadik sor jobb oldal |
| Negyedik sor bal ondal | Negyedik sor jobb oldal |
```

| Első oszlop            | Második oszlop          |
| ---------------------- | ----------------------- |
| Első sor bal oldal     | Első sor jobb oldal     |
| Második sor bal oldal  | Második sor jobb oldal  |
| Harmadik sor bal oldal | Harmadik sor jobb oldal |
| Negyedik sor bal oldal | Negyedik sor jobb oldal |

<br>

A szélesebb táblázatokat `<figure></figure>` közé szúrva a táblázat megnyújtása vagy összenyomása helyett görgethető táblázat hozható létre:

```markdown
<figure>

| Első oszlop | Második oszlop | Harmadik oszlop | Negyedik oszlop | Ötödik oszlop | Hatodik oszlop | Hetedik oszlop | Nyolcadik oszlop |
| ----------- | -------------- | --------------- | --------------- | ------------- | -------------- | -------------- | ---------------- |
| Első cella  | Második cella  | Harmadik cella  | Negyedik cella  | Ötödik cella  | Hatodik cella  | Hetedik cella  | Nyolcadik cella  |

</figure>
```

<figure>

| Első oszlop | Második oszlop | Harmadik oszlop | Negyedik oszlop | Ötödik oszlop | Hatodik oszlop | Hetedik oszlop | Nyolcadik oszlop |
| ----------- | -------------- | --------------- | --------------- | ------------- | -------------- | -------------- | ---------------- |
| Első cella  | Második cella  | Harmadik cella  | Negyedik cella  | Ötödik cella  | Hatodik cella  | Hetedik cella  | Nyolcadik cella  |

</figure>

## Összecsukható szöveg

A megfelelő HTML-elemek használatával összecsukhatóvá tehető egy adott szövegrész:

```html
<details>
    <summary>A szövegrész címe</summary>
    <p>Ez pedig maga az összecsukható szövegrész.</p>
</details>
```

<details>
    <summary>A szövegrész címe</summary>
    <p>Ez pedig maga az összecsukható szövegrész.</p>
</details>

## További formázási lehetőségek

### Rövidítések

```html
<abbr title="Hypertext Markup Language">HTML</abbr>-címkék segítségével a rövidítésekhez magyarázatot lehet társítani.
```

<abbr title="Hypertext Markup Language">HTML</abbr>-címkék segítségével a rövidítésekhez magyarázatot lehet társítani.

### Billentyűzet

```html
<kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Del</kbd>
```

<kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Del</kbd>

### Vízszintes vonal

```markdown
---
```

---

<br>

Ide, a weboldal végére került a feljebb hivatkozott szöveg:

[^1]: Az üzenet, amit a delfinek hagytak, amikor elhagyták a Földet a könyvsorozat negyedik részének cselekményében.
