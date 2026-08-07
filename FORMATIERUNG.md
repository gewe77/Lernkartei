# Formatierungsrunde — Fassung 7.4

Vier Beobachtungen aus dem laufenden Betrieb, drei Bildschirmfotos. Diese
Datei hält fest, was gemessen wurde, was daran die Ursache war und wie es
jetzt abgesichert ist.

Grundsatz dieser Runde: **erst messen, dann ändern.** Jeder der vier Punkte
wurde vor der Korrektur in Zahlen ausgedrückt — sonst lässt sich hinterher
nicht sagen, ob etwas besser geworden ist oder nur anders.

---

## 1. Zahlenakrobat — die Ziffern saßen nicht mittig im Kreis

**Gemeldet:** „Beim Zahlenakrobat sind die Zahlen der Bereiche nicht mittig
im Kreis angeordnet."

**Gemessen** (`test/probe-form-1.mjs`, 1150 px, hell):

| Kreis | Versatz waagerecht | Versatz senkrecht | display | Schriftgröße |
|---|---|---|---|---|
| 1 … 6 | −13,4 px | −7,5 px | `block` | 13 px |
| ★ (Meisterklasse) | −11,0 px | −7,5 px | `block` | 13 px |

**Ursache.** Zwei Regeln im selben Stilblock:

```css
.ma-bereich span { display:block; font-size:13px; color:var(--txt3) }   /* 0-1-1 */
.ma-bereich-nr   { display:flex; align-items:center; justify-content:center }  /* 0-1-0 */
```

`.ma-bereich span` ist eine Klasse **plus** ein Elementname und wiegt damit
schwerer als die einzelne Klasse `.ma-bereich-nr`. Der Kreis wurde also zum
Block; `align-items` und `justify-content` haben in einem Block keine
Wirkung, und die Ziffer fiel in die linke obere Ecke. Dieselbe Regel
überschrieb auch Schriftgröße und Farbe.

Der ★ der Meisterklasse war dadurch praktisch unsichtbar: weiß auf Türkis,
in der Ecke, halb vom Kreisrand beschnitten.

**Ein zweiter Fund an derselben Stelle.** `.ma-bereich b{display:block}`
traf nicht nur den Kacheltitel, sondern auch die Zahl in der rechten
Standspalte. Statt

```
0 ★
0 von 100 begonnen
```

stand dort dreizeilig `0` / `★` / `0 von 100 begonnen`.

**Korrektur.** Die Regeln zielen jetzt auf den mittleren Block statt auf
jedes `span` in der Kachel. Der Zwischenblock hat dafür eine eigene Klasse
`.ma-bereich-txt` bekommen (vorher ein `style`-Attribut im HTML).

**Nachgemessen:** Versatz 0,0 / 0,0 px bei 1150, 390 und 360 px.

**Nebenbefund Telefon.** „0 von 100 begonnen" ist rund 119 px breit und
drückte auf einem 390-px-Gerät „Plus, minus, Einmaleins bis 100" auf drei
Zeilen. Unter 560 px steht dort jetzt `0/100` — die Standspalte schrumpft
gemessen von 119 px auf 33 px, der Titel passt wieder in eine Zeile.

---

## 2. Lernbox — die Knöpfe klebten an der Karteikarte

**Gemeldet:** „In der Lernbox fehlt der Abstand der Buttons zum Karteikarte."

**Gemessen:** Abstand Karteikarte → Knopfzeile = **0 px**, sowohl bei der
Frage („Antwort zeigen") als auch bei der Bewertung („Konnte ich").

**Ursache.** `.ueb-karte` hatte `margin-top:14px`, aber kein `margin-bottom`;
`#ueb-aktionen` bringt am Schreibtisch keinen eigenen Abstand mit.

**Korrektur.** `.ueb-karte{margin:14px 0}` — dasselbe Maß, das die Bühne des
Karteikastens (`.flip-buehne{margin:14px 0}`) längst hat.

**Rückschlag und Gegenmaßnahme.** Die Abnahmeprüfung `pruefung-mobil`
schlug danach an zwei Stellen an: bei geöffneter Bildschirmtastatur
(340 px Resthöhe) schob die zusätzliche Luft das Eingabefeld **2 px** unter
die Navileiste. In genau diesem Fall — `max-height:380px` — steht die
Aktionszeile ohnehin im Fluss und bringt 10 px eigenes Polster mit; dort
gilt jetzt `.ueb-karte{margin:6px 0 4px;padding:14px 16px}`. Ergebnis:
14 px Abstand zu den Knöpfen, aber 16 px weniger Gesamthöhe als zuvor.
`pruefung-mobil` ist wieder vollständig grün (108 von 108).

---

## 3 + 4. Karteikasten und Lernbox waren unterschiedlich ausgerichtet

**Gemeldet:** „Die Formatierung zwischen Lernbox und Karteikasten ist nicht
einheitlich (linksbündig bzw. zentriert)." und „Eine Bitte zu den
Antwortkarten im Karteikasten: bitte durchgehend linksbündig."

**Gemessen:**

| Fläche | `text-align` |
|---|---|
| Karteikasten, Frageseite | `center` |
| Karteikasten, Antwortseite | `center` |
| Lernbox, Frage | `start` |
| Lernbox, Antwort | `start` |

Eine zweizeilige Antwort begann dadurch 23 px vom linken Rand entfernt und
lief als Treppe.

**Korrektur.** `.flip-seite` läuft von `align-items:center;text-align:center`
auf `align-items:stretch;text-align:left`. Senkrecht wird weiter zentriert —
die Seite hat 230 px Mindesthöhe, eine kurze Antwort soll nicht oben kleben.

Drei Folgeänderungen, die dazugehören:

* `.flip-seite > .flip-mark{align-self:flex-start}` — ohne das würde die
  Merker-Pille als Flexkind auf volle Kartenbreite gezogen und wäre keine
  Pille mehr.
* `.flip-text ul, .flip-text ol` laufen von `display:inline-block` auf
  `display:block`. Der eingeschobene Kasten war der Trick, um eine Liste in
  einer **mittig** gesetzten Karte links auszurichten; auf einer
  linksbündigen Karte bliebe sie sonst so schmal wie ihr längster Eintrag.
* Der Knopf „Zudecken und selbst wiedergeben" stand als einziges Element in
  der Lernbox-Karte mittig und folgt jetzt der Ausrichtung der Karte.

**Nachgemessen:** alle vier Flächen linksbündig, Text beginnt am Innenrand
(Versatz 0 px gegenüber Polsterung + Rahmen), bei 1150 und 375 px, in allen
drei Abfragemodi (Aufdecken, Tippen, Auswahl).

---

## Was die breite Prüfung zusätzlich gefunden hat

Der Auftrag lautete „Prüfe bitte intensiv, insbesondere auch die
Formatierung" — also lief zusätzlich zu den vier Punkten eine Reihe über
alle sieben Reiter, vier Breiten (1150, 390, 375, 360 px) und beide
Farbschemata, dazu alle Dialoge.

### a) „14:60 min übrig" in der Meisterklasse

`zeitText()` rechnete Minuten und Sekunden getrennt:

```js
Math.floor(899.6 / 60)              // 14
Math.round(899.6 % 60)              // 60   ← 59,6 gerundet
```

Die Restzeit der Meisterklasse stand damit **jede Minute für eine halbe
Sekunde** auf einem Wert, den es nicht gibt: 14:60, 13:60, 12:60 … Betroffen
waren auch Bestzeiten über einer Minute (119,6 s → „1:60 min").

Jetzt wird erst gerundet, dann geteilt. Die Zehntelanzeige ist mitgeprüft:
59,96 s heißt „1:00 min" und nicht „60,0 s".

### b) Einzahl und Mehrzahl

An vier Stellen stand die Mehrzahl auch bei der Eins:

| Ort | vorher | jetzt |
|---|---|---|
| Startbildschirm, Kennzahl | „1 Tage Streak" | „1 Tag Streak" |
| Abschluss einer Sitzung | „1 Tage Streak" | „1 Tag Streak" |
| Statistik | „1 Tage in Folge" | „1 Tag in Folge" |
| Kastenkachel | „1 Karten" | „1 Karte" |
| Abschluss | „1 von 1 Karten bewertet" | „1 von 1 Karte bewertet" |
| CSV-Dialog | „(1 Karten)" | „(1 Karte)" |

Für die Abzeichen gab es die Unterscheidung längst
(`ABZEICHEN_EINHEIT`) — die Kennzahlen hatten sie nur nie bekommen.

### c) Abgeschnittene Wörter in den Bewertungsbalken

Die Balken auf der Abschlussseite kürzten den Namen mit
`t.slice(0, 6) + '.'`. Auf dem Bildschirm stand:

```
1 Nicht .     3 Gewuss.
2 Schwer.     4 Sehr l.
```

Die Namen stehen jetzt ganz da; die Beschriftungsspalte ist dafür von 62 px
auf 96 px gewachsen (auf dem Telefon 88 px bei 12 px Schrift). Gemessen
wird, dass kein Wort mehr über seinen Kasten hinausläuft.

### d) Was ausdrücklich in Ordnung war

Die Statistiktabelle ist auf einem Telefon breiter als der Bildschirm — das
ist Absicht (`.box{overflow-x:auto}`), sie bekommt einen eigenen Schieber.
Die Prüfung war anfangs zu grob und hat das als Fehler gemeldet; sie
unterscheidet jetzt zwischen „ragt heraus" und „liegt in einem schiebbaren
Kasten" und prüft zusätzlich, dass ein solcher Kasten wirklich schiebbar
ist.

---

## Zwei Prüfdateien, die gar nicht mehr liefen

Beim Nachfahren der Prüfbatterie fiel auf, dass zwei Prüfdateien seit
Längerem abstürzten, statt Ergebnisse zu liefern. Beide Fehler liegen in
der Prüfdatei, nicht im Produkt; beide wurden gegen die ausgelieferte
Fassung 7.3 gegengeprüft und sind älter als diese Runde.

**`pruefung-stufe5-sprache.mjs`** schneidet Teile aus
`werkzeuge/sprache-erzeugen.mjs` heraus, um wirklich den ausgelieferten
Code zu prüfen. Der Schnitt lief zeilenweise — seit `const GRENZE` eine
mehrzeilige Prüfung bekommen hat, entstand daraus ungültiges JavaScript
(`GRENZE: (() => {,`) und die Datei starb beim Import. Der Schnitt versteht
jetzt mehrzeilige Anweisungen; außerdem fehlten die Hilfsfunktionen
`nurText`, `entitaeten`, `aufraeumen` und der Import von `rename`. Drei
Zusicherungen zur Befehlszeile beschrieben noch das alte, kaputte Verhalten
(`--grenze 0` sollte still zu 100000 werden) — das Werkzeug wurde seither
nachgebessert, die Prüfung zieht nach.

**`pruefung-stufe5-datenverlust.mjs`** klickte auf die Navigation, während
noch ein Dialog offen war; `#modal-bg` fing den Klick ab und der Lauf
lief in einen Zeitablauf. Der Wechsel schließt jetzt vorher.

Beide Dateien sind **Befundprotokolle**, keine Ampeln: Ihre „✗"-Zeilen sind
absichtlich festgehaltene Feststellungen (`DATENVERLUST-BEFUND: …`) über die
Sprachausgabe und den Karteneditor. Die Zahlen sind vor und nach dieser
Runde identisch (67 bestanden, 17 Befunde) — diese Runde hat dort nichts
verändert, weder zum Guten noch zum Schlechten. Die Befunde stehen weiter
offen und wären eine eigene Runde wert.

---

## Prüfstand

| Prüfdatei | Punkte |
|---|---|
| `run` | 130 |
| `regress` | 33 |
| `pruefung-stufe2` | 34 |
| `pruefung-stufe3` | 110 |
| `pruefung-stufe4` | 79 |
| `pruefung-stufe5` | 97 |
| `pruefung-stufe5-nachpruefung` | 42 |
| `pruefung-stufe6` | 41 |
| `pruefung-stufe7` | 163 |
| `pruefung-4-1` | 55 |
| `pruefung-4-2` | 104 |
| `pruefung-mobil` | 108 |
| **`pruefung-form`** *(neu)* | **54** |
| **Summe** | **1050, 0 offen** |

Dazu ohne Browser: `gegen-b2` 11, `gegen-b3` 25, `gegen-b4` 194.466,
`gegen-b5` 15.274, `gegen-b6` 25.834, `gegen-meisterklasse` 58 — alle ohne
Fehler.

Die drei Sonderprüfungen dieser Runde bleiben als Beleg liegen:

| Datei | Umfang | Zweck |
|---|---|---|
| `probe-form-1.mjs` | 26 | die vier gemeldeten Punkte, vorher und nachher gemessen |
| `probe-form-2.mjs` | 333 | 7 Reiter × 4 Breiten × 2 Farbschemata, alle Modi |
| `probe-form-3.mjs` | 281 | jeder Dialog bei vier Breiten in hell und dunkel |

`schau-form.mjs` und `schau-form2.mjs` machen die Bildschirmfotos zum
Nachsehen (`test/shots-form/`).

### Eine Falle beim Prüfen des Farbschemas

Die erste Fassung von `probe-form-2` stellte das Farbschema über
`document.documentElement.dataset.theme`. Die App ruft `themaAnwenden()`
aber bei jedem Schreiben der Einstellungen neu auf und setzte den Wert auf
den gespeicherten zurück — die halbe „dunkel"-Runde lief in Wahrheit hell.
Umgestellt auf die echte Einstellung, mit einer Zusicherung, dass das
gewünschte Schema danach wirklich aktiv ist.
