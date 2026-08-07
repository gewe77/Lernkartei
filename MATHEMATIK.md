# Stufe 7 — Mathematik: Konzept

> **Stand 6. August 2026 — vollständig gebaut und ausgeliefert
> (Version 7.2).** Alle zehn Schritte sind fertig: 600 Sets in sechs
> Bereichen, Punktering mit Bestzeit-Schatten, Ziffernblock und Termblock,
> Statistik und Abzeichen. Der Reiter heißt **Zahlenakrobat** —
> „Kopfrechnen auf Zeit". Die Dateien und Speicherpfade heißen weiter
> `mathe`; ein umbenannter Firestore-Pfad wäre ein Datenumzug für einen
> Namen.
>
> In der anschließenden Prüfrunde wurden **39 Befunde** bestätigt und
> behoben, darunter vier Fälle von Datenverlust. Einzelheiten in
> `claude/STUFE-7-PRUEFUNG.md`.

**Fassung 3.** Neu gegenüber Fassung 2: **tempo60 10’000** kommt als eigener
Bereich dazu, die Zeitanzeige wird zum **Punktering nach dem Original**, und
das große Einmaleins zieht dorthin um, wo es hingehört.

Entschieden ist bisher: eigenes Modul `js/mathe.js`, Euro und Cent, Sets frei
wählbar mit Vorschlag, Antworten über einen eigenen Termblock, Optik von
HAN CROCO — nur die Rückmeldesprache kommt vom Vorbild.

---

## 1. Was tempo60 tatsächlich ist

Drei Produkte, nicht eines:

| | **Grundoperationen** | **Grössen** | **10’000** |
|---|---|---|---|
| Sets | 100 | 100 | 100 |
| Aufgaben je Set | 24 | 16 | **12, 16, 20 oder 24** |
| Zahlenraum | bis 100 | Einheiten | **bis 10’000** |
| Ziel | ein Set in **60 s fehlerfrei** | dasselbe | dasselbe |

**Zwei Betriebsarten, und das ist der Kern:**

- **Übungsmodus** — ohne Zeitdruck, Reihenfolge bei jedem Start neu gemischt.
- **Testmodus** — 60 Sekunden, und die **Reihenfolge bleibt immer gleich**.
  Nur so sind zwei Läufe desselben Sets überhaupt vergleichbar.

**Fehler beenden den Lauf nicht.** Eine falsche Antwort wird rot, die Aufgabe
muss noch einmal gelöst werden. Man kommt also immer durch — man braucht nur
länger.

Manche Sets sind als **Schlüsselrechnungen** ausgezeichnet — Verdoppeln,
Mal 5, Mal 10. Das sind die, die alles andere tragen.

**Der wichtigste Fund aus 10’000:** Dort haben die Sets *unterschiedlich
viele* Aufgaben — 12, 16, 20 oder 24 — bei gleichbleibenden 60 Sekunden. Das
Vorbild macht also genau das, was ich in Fassung 2 vorgeschlagen hatte: **Die
Minute ist fest, die Aufgabenzahl ist die Stellschraube.** Damit wird sie
hier zur Eigenschaft **des Sets**, nicht des Bereichs.

---

## 2. Warum das kein Karteikasten ist

| | **Karteikasten** | **Rechentraining** |
|---|---|---|
| Inhalt | von Hand geschrieben | **aus Regeln erzeugt** |
| Ziel | Behalten über Monate | **Geläufigkeit in Sekunden** |
| Maß | „gewusst / nicht gewusst" | **Zeit und Fehlerzahl** |
| Steuerung | FSRS terminiert jede Karte | **Kriterium: 60 s fehlerfrei** |
| Einheit | die einzelne Karte | **das Set** |

7 · 8 braucht keinen Terminplan. Es braucht Wiederholung, bis die Antwort
ohne Rechnen da ist — das ist **Automatisierung**, nicht Erinnern.

Geteilt werden Konten, Speicher, Design, Tagesziel, Streak, Statistikseite.
Getrennt bleibt alles andere.

---

## 3. Der Modulschnitt

`index.html` hat **8.519 Zeilen, 428 KB**. Mathematik käme in diesem Umfang
mit geschätzt **3.500 bis 4.500 Zeilen** dazu. In einer Datei wären das über
12.000 Zeilen — jetzt ist der Schnitt fällig.

```
index.html            bleibt unverändert
js/mathe.js           die Oberfläche und das Laufwerk
js/mathe-sets.js      die 600 Set-Beschreibungen (reine Daten)
js/mathe-erzeuger.js  die Aufgabenerzeuger je Art
js/mathe-term.js      Termblock, Normalisierung, Vergleich
```

Statt `mathe.js` in die Innereien von `index.html` greifen zu lassen, bekommt
es beim Start eine **Werkzeugkiste** gereicht:

```js
import { matheStarten } from './js/mathe.js';

matheStarten({
  $, $$, esc, toast, modal, frage, verdrahten,   // Oberfläche
  heute, zahl, mischen,                           // Helfer
  S, FB, db, schreibe, colMathe,                  // Daten
  seiteZeigen, streakPflegen                      // Einbindung
});
```

Damit ist die Grenze **explizit und einzeilig nachlesbar**. Kein Umbau am
Bestehenden, kein Bauwerkzeug, kein Übersetzungsschritt — ES-Module laufen
auf GitHub Pages ohne alles. Der Testaufbau kopiert statt einer Datei einen
Ordner; das ist eine Zeile.

`mathe-term.js` steht bewusst allein: Es ist das einzige Stück mit echter
Algorithmik und muss ohne Browser prüfbar sein.

---

## 4. Die sechs Bereiche

| | Bereich | Sets | Aufg./Set | Antwort |
|---|---|---|---|---|
| 1 | Grundoperationen bis 100 | 100 | 24 | Zahl |
| 2 | **Zahlenraum 10’000** | 100 | **12–24 je Set** | Zahl, Rest |
| 3 | Größen | 100 | 16 | Zahl, Einheit, `< = >` |
| 4 | Sekundarstufe | 100 | 12 | Zahl, Bruch, einfacher Term |
| 5 | Trigonometrie und Stochastik | 100 | 10 | Bruch, Wurzel, π |
| 6 | Differential- und Integralrechnung | 100 | 8 | Term |

**Die 60 Sekunden bleiben überall gleich.** Was sich ändert, ist die Zahl der
Aufgaben, die hineinpasst — von 24 (2,5 s je Aufgabe) bis 8 (7,5 s). Ein
Stern heißt damit in jedem Bereich dasselbe: *ein Set in einer Minute,
fehlerfrei.* Eine Ableitung in 2,5 Sekunden zu verlangen wäre albern; acht
Ableitungen in 60 Sekunden sind sportlich, aber erreichbar.

**Nach oben verstellbar**, wie besprochen: Wird ein Bereich zu leicht, kann
die Aufgabenzahl erhöht werden — nie gesenkt. Damit die Zeiten vergleichbar
bleiben, wird die Aufgabenzahl **beim Bestwert mitgespeichert**
(`beste: { n: 24, s: 47 }`) und nur Gleiches mit Gleichem verglichen.

600 Sets sind kein Datenbestand, sondern 600 **Beschreibungen** — die
Aufgaben entstehen beim Start aus einer Regel und einem Startwert.

---

## 5. Bereich 1 — Grundoperationen bis 100

100 Sets zu 24 Aufgaben. Reiner Zahlenraum 100, wie im Vorbild.

| Sets | Block | Schlüssel |
|---|---|---|
| 1–10 | Addition bis 20, ohne Übergang | |
| 11–22 | Addition mit Zehnerübergang | ★ |
| 23–34 | Subtraktion bis 20 und bis 100 | |
| 35–44 | Ergänzen auf 10 und auf 100 | ★ |
| 45–52 | Verdoppeln und Halbieren | ★ |
| 53–62 | Einmaleins mit 2, 5, 10 | ★ |
| 63–80 | Einmaleins mit 3, 4, 6, 7, 8, 9 | |
| 81–90 | Division im Zahlenraum 100 | |
| 91–96 | Umkehraufgaben und Platzhalter (`7 · ▢ = 56`) | |
| 97–100 | Gemischt, alle vier Operationen | |

**Was sich gegenüber Fassung 2 geändert hat:** Das große Einmaleins
(`17 · 13 = 221`) stand hier — in einem Bereich, der „bis 100" heißt. Das war
schief. Es zieht in Bereich 2, wo Ergebnisse über 100 hingehören. Dein Wunsch,
Multiplikation und Division bis zum Faktor 25 zu erweitern, ist damit nicht
gestrichen, sondern richtig einsortiert.

Eine Set-Beschreibung sieht so aus:

```js
{ nr: 55, titel: 'Einmaleins mit 5', schluessel: true, aufgaben: 24,
  regel: { art: 'mal', a: [1, 10], b: [5, 5], tausche: true } }
```

**Erzeugt wird mit festem Startwert.** Der Testmodus verlangt eine
gleichbleibende Reihenfolge — sonst vergleicht man zwei verschiedene Sets
miteinander und die Zeiten sagen nichts. Also: Zufallsgenerator mit dem
Startwert `nr`, damit Set 55 heute dieselben 24 Aufgaben hat wie in vier
Wochen. Im Übungsmodus wird der Startwert gewürfelt.

---

## 6. Bereich 2 — Zahlenraum 10’000 *(neu)*

100 Sets zu 12 bis 24 Aufgaben, je nach Schwere des Blocks. Das ist die
direkte Fortsetzung von Bereich 1 und deckt zugleich das große Einmaleins ab.

| Sets | Block | Aufg. | Beispiel |
|---|---|---|---|
| 1–8 | Reine Zehner, Hunderter, Tausender, ohne Übergang | 24 | `3400 + 2500` |
| 9–16 | dieselben mit Übergang | 24 | `2700 + 800` |
| 17–26 | Gemischte Zahlen, ohne und mit Übergang | 20 | `3472 + 1650` |
| 27–34 | Um Zehner/Hunderter/Tausender ergänzen und vermindern | 20 | `4380 + ▢ = 4700` |
| 35–40 | Auf Tausend und Zehntausend ergänzen | 20 | `6250 + ▢ = 10000` |
| 41–48 | Verdoppeln und Halbieren | 24 | `2 · 1750`, `4600 : 2` |
| 49–56 | Zehner-Einmaleins und Division dazu | 24 | `70 · 8`, `560 : 70` |
| 57–64 | Hunderter- und Tausender-Einmaleins, Division dazu | 24 | `400 · 9`, `3600 : 400` |
| **65–74** | **11er-, 12er-, 15er-, 25er-Reihe** | 20 | `15 · 13`, `25 · 16` |
| **75–82** | **Quadratzahlen 10 × 10 bis 25 × 25** | 20 | `17²`, `24²` |
| 83–88 | Multiplikation mit zwei- und dreistelligen Zahlen | 12 | `23 · 14`, `125 · 8` |
| 89–92 | Division drei- und vierstelliger Zahlen | 12 | `391 : 17`, `4608 : 24` |
| 93–96 | Nächstkleinere Zahl einer Reihe | 16 | „größte Zahl unter 50, die durch 7 teilbar ist" |
| 97–100 | Teilen mit Rest | 16 | `53 : 7 = 7 R 4` |

### Das große Einmaleins — die Kniffe

`17 · 13`, `24 · 8`, `25 · 16`. In wenigen Sekunden geht das nur mit
Zerlegung, und genau die soll sich einschleifen:

| Kniff | Beispiel |
|---|---|
| Zerlegen in Zehner und Rest | `17 · 13 = 17 · 10 + 17 · 3 = 170 + 51 = 221` |
| Nachbarquadrate | `19 · 21 = 20² − 1 = 399` |
| Verdoppeln und halbieren | `24 · 8 = 12 · 16 = 6 · 32 = 192` |
| Über die Hundert | `25 · 16 = 100 · 4 = 400` |
| Quadratzahlen als Anker | `25² = 625` |

Die Sets 65–82 sind deshalb nach Kniff gegliedert, nicht nach Reihe. Wer die
17er-Reihe stur auswendig lernt, hat nichts gewonnen; wer `· 10 + Rest`
gelernt hat, kann auch `23 · 14`.

**Teilen mit Rest** braucht eine eigene Eingabe: zwei Felder (Ergebnis und
Rest), mit `⏎` dazwischen. Der Block 93–96 ist die Vorübung dazu — wer die
nächstkleinere Zahl einer Reihe sofort nennt, hat den Rest geschenkt.

---

## 7. Bereich 3 — Größen

100 Sets zu 16 Aufgaben, aufgeteilt wie beim Vorbild, aber in **Euro und
Cent**.

| Sets | Bereich | Einheiten |
|---|---|---|
| 1–6 | Geld | ct, € |
| 7–28 | Längen | mm, cm, dm, m, km |
| 29–48 | Hohlmaße | ml, cl, dl, l, hl |
| 49–59 | Gewichte | mg, g, kg, t |
| 60–79 | Zeit | s, min, h, d |
| 80–100 | Flächen | mm², cm², dm², m², a, ha, km² |

**Drei Aufgabentypen**, wie im Vorbild:

```
Umwandeln     3 m 40 cm  =  ▢ cm
Vergleichen   250 cm  ▢  3 m            (<, =, >)
Ergänzen      3 m + ▢ cm = 5 m
```

Zeit ist der Sonderfall — sie rechnet nicht dezimal. `1 h 20 min = ▢ min`
braucht eine eigene Rechenregel, und genau daran scheitert man regelmäßig.

---

## 8. Bereich 4 — Sekundarstufe

100 Sets zu 12 Aufgaben. Der Teil, der im Unterricht tatsächlich weiterhilft.

| Sets | Block | Beispiel |
|---|---|---|
| 1–15 | Zehnerpotenzen | `0,07 · 1000`, `4200 : 100` |
| 16–30 | Negative Zahlen | `−7 + 12`, `−3 · (−4)` |
| 31–50 | Brüche ↔ Dezimal ↔ Prozent | `3/4 = ▢ %` |
| 51–70 | Prozentrechnen im Kopf | `15 % von 60` |
| 71–85 | Quadratzahlen und Wurzeln bis 625 | `√361` |
| 86–100 | Terme mit einer Unbekannten | `3x = 24`, `2x + 5 = 17` |

Der Wurzelblock geht bis **625**, damit er zu den Quadratzahlen aus Bereich 2
passt: Wer `25² = 625` als Anker hat, hat `√625` geschenkt.

---

## 9. Bereich 5 — Trigonometrie und Stochastik

100 Sets zu 10 Aufgaben. Beides eignet sich gut fürs Geläufigkeitstraining,
weil vieles davon **reiner Abruf** ist. Wer `sin 60°` nachschlagen muss,
kommt in der Aufgabe darunter nicht weit.

| Sets | Block | Beispiel |
|---|---|---|
| 1–12 | Grad ↔ Bogenmaß | `30° = ▢` → `π/6` |
| 13–30 | Exakte Werte sin, cos, tan | `sin 60°` → `√3/2` |
| 31–42 | Rechtwinkliges Dreieck, Pythagoras | `a=3, b=4, c=▢` |
| 43–50 | Beziehungen | `sin²x + cos²x`, `tan x = ▢` |
| 51–58 | Sinuskurve: Amplitude, Periode | `3·sin(2x)`: Periode ▢ |
| 59–68 | Fakultät und Binomialkoeffizient | `5!`, `(5 über 2)` |
| 69–80 | Laplace, Gegenwahrscheinlichkeit | `P(keine 6 bei 2 Würfen)` |
| 81–90 | Zwei Stufen, Baumdiagramm | `P(mind. eine 6 bei 2 Würfen)` |
| 91–100 | Lagemaße und Erwartungswert | `E(Würfel)` → `3,5` |

**Exakte Werte bleiben exakt.** Auf `sin 60°` wird `√3/2` verlangt, nicht
`0,866` — sonst übt man das Falsche. Das steht als Hinweiszeile über dem Set.

---

## 10. Bereich 6 — Differential- und Integralrechnung

100 Sets zu 8 Aufgaben. Grundlagen, keine Kurvendiskussion.

| Sets | Block | Beispiel |
|---|---|---|
| 1–14 | Potenzregel | `x⁵` → `5x⁴`; auch `x^(−2)`, `√x` |
| 15–26 | Summen- und Faktorregel | `x³ − 4x²` → `3x² − 8x` |
| 27–36 | **Zweite Ableitung** | `x³ − 4x²` → `6x − 8` |
| 37–48 | sin, cos, e^x, ln x | `ln x` → `1/x` |
| 49–60 | Kettenregel, einfach | `e^(2x)` → `2e^(2x)`, `sin(3x)` → `3cos(3x)` |
| 61–70 | Produktregel, einfach | `x·e^x` → `e^x + x·e^x` |
| 71–76 | Quotientenregel, einfach | |
| 77–88 | Stammfunktionen | `x²` → `x³/3 + C`, `1/x` → `ln\|x\| + C` |
| 89–100 | Bestimmtes Integral, kleine Zahlen | `∫₁² 2x dx` → `3` |

Zusätzlich in den Blöcken 15–36: **rückwärts** — „Welche Funktion hat die
Ableitung `6x`?" Das trainiert dieselbe Regel aus der anderen Richtung und
ist die Brücke zur Stammfunktion.

Zur Ehrlichkeit: Dieser Bereich passt heute zu dir und in ein bis zwei Jahren
zur Älteren. Das ist in Ordnung — die Sets stehen bereit, wenn sie gebraucht
werden, und sie sind billig, weil sie erzeugt werden.

---

## 11. Der Bildschirm

```
┌───────────────────────────┐
│  Grundoperationen · Set 67│
│                           │
│        ●●●●●●○            │   Punktering: ein Punkt je Aufgabe
│      ●●        ○          │   voll = gelöst · grün = dran
│     ●            ○        │   rot = falsch, kommt wieder
│      ○○        ○○         │
│        ○○○○○○○            │
│                           │
│      15 · 13 =  ▮         │   Aufgabe unter dem Ring
├───────────────────────────┤
│  1   2   3   4   5        │
│  6   7   8   9   0        │   zwei Reihen zu fünf
│  🗑        ✓              │   löschen · bestätigen
└───────────────────────────┘
```

### Der Punktering — nach dem Original

Am Bildschirmfoto gemessen: **24 Punkte, exakt 15° auseinander, alle gleich
groß** — Durchmesser 36 px bei einem Ringradius von 163 px, also gut ein
Neuntel des Radius; sie berühren sich fast. Dahinter ein breiteres,
durchscheinendes Band. Ein Punkt grün. **Keine Ziffer auf dem Ring.**

Genau das wird nachgebaut, in unseren Farben:

| Punkt | Bedeutung |
|---|---|
| grau | noch offen |
| `--akzent` gefüllt | gelöst |
| **grün**, etwas größer | die Aufgabe, die gerade dran ist |
| **rot** | war falsch, kommt noch einmal |

Der Ring **ersetzt die Punktreihe** aus dem ersten Entwurf: ein Element statt
zwei, und man sieht auf einen Blick, wie viel noch kommt. Er passt sich der
Setgröße an — bei 12 Punkten wachsen sie mit, damit der Kranz immer gleich
dicht wirkt.

### Das Band ist der Bestzeit-Schatten

Im Original liegt hinter den Punkten ein breiteres Band. Ich würde ihm eine
Bedeutung geben, die es dort vermutlich nicht hat: Es zeigt, **wie weit der
eigene beste Lauf zu diesem Zeitpunkt war**.

Liegen die gefüllten Punkte vor der Bandkante, ist man gerade schneller als
je zuvor — sichtbar **ohne eine einzige Ziffer**. Damit bleibt der Bildschirm
ohne Uhr und hat trotzdem ein Ziel, und die Regel aus Abschnitt 13 ist
erfüllt: verglichen wird nur mit der eigenen früheren Zeit, nie mit einer
anderen Person.

Die Zeit selbst steht **erst am Ende** auf dem Bildschirm, zusammen mit der
bisherigen Bestzeit. Wer den Schatten nicht mag, schaltet ihn ab.

### Das Tastenfeld

Das Original hat eine Reihe `1 … 0` und darunter Papierkorb und eine breite
Bestätigen-Taste. Im Entwurf nachgemessen: Auf einem 390 px breiten Telefon
ergäbe eine Zehnerreihe **30 px breite Tasten** — deutlich unter den 48 px,
die Android als Mindestmaß nennt. Also:

- **schmal (Telefon): zwei Reihen zu fünf** — gemessen 67 × 56 px je Taste,
  und die Lesefolge 1…0 bleibt erhalten;
- **breit (ab 560 px): eine Reihe zu zehn**, wie im Original;
- darunter unverändert **Papierkorb schmal, Bestätigen breit** — weit weg von
  den Ziffern, damit der schnelle Anschlag nicht danebengreift.

**Die eingebaute Tastatur des Telefons bleibt außen vor.** Sie braucht eine
halbe Sekunde zum Erscheinen, verdeckt den halben Bildschirm und schiebt das
Layout. Die Prüfrunde zu Stufe 6 hat das gemessen: Bei offener Tastatur
blieben von 667 Pixeln 340 übrig, und die Bedienelemente lagen darunter.

Weitere Regeln aus Stufe 6:

- **Kein Layoutsprung** innerhalb eines Sets — sonst trifft der schnelle
  zweite Anschlag daneben.
- **Bestätigen mit ✓**, nicht automatisch bei passender Stellenzahl. Sonst
  wird aus einer geplanten 12 eine abgeschickte 1.
- **Der Doppeltipp-Schutz aus Stufe 6 gilt hier nicht** — hier ist schnelles
  Tippen der Zweck.

### Der Block wird je Set erzeugt

Der Kniff, der die Termeingabe auf dem Telefon möglich macht: **Weil die
Aufgaben erzeugt werden, ist das Antwortalphabet vorher bekannt.** Ein Set
über Ableitungen von Polynomen braucht `x`, `^`, `²`, Ziffern, `+`, `−` —
kein `sin`, kein `π`, keine Klammern.

Feste Regel: **höchstens 20 Tasten**. Wo mehr nötig wären, wird das Set
geteilt.

| Bereich | Zusätzlich zu 0–9, 🗑, ✓ |
|---|---|
| 1 Grundoperationen | `−` |
| 2 Zahlenraum 10’000 | `−` · bei „Teilen mit Rest" ein zweites Feld |
| 3 Größen | `,` · Einheitenreihe · bzw. `<` `=` `>` |
| 4 Sekundarstufe | `,` `−` `/` `x` `²` `√` `%` |
| 5 Trigonometrie/Stochastik | `,` `−` `/` `√` `π` |
| 6 Analysis | `x` `^` `²` `³` `+` `−` `·` `/` `(` `)` · je nach Set `e` `ln` `sin` `cos` `√` `C` |

Bereich 6 ist der einzige, bei dem der Rechner spürbar bequemer bleibt — das
sollte man wissen, bevor man ihn auf dem Telefon anfängt.

---

## 12. Wie Terme verglichen werden

Der heikelste Teil des Vorhabens. `3x²` kann man auf ein Dutzend Arten
schreiben, und keine davon darf als Fehler zählen.

**Es wird kein Computeralgebrasystem gebaut.** Stattdessen zwei Dinge:

**Erstens** liefert der Erzeuger zu jeder Aufgabe die Antwort nicht als Text,
sondern als **Struktur**:

```js
// f(x) = x³ − 4x²   →   f'(x) = 3x² − 8x
{ summanden: [ { k: [3, 1], basis: 'x', exp: [2, 1] },
               { k: [-8, 1], basis: 'x', exp: [1, 1] } ] }
//        ↑ Koeffizient als Bruch [Zähler, Nenner]
```

**Zweitens** überführt ein Normalisierer die Eingabe in dieselbe Struktur:

1. Leerzeichen weg; `·` `×` `*` vereinheitlicht; `−` `–` → `-`;
   `²` → `^2`; `,` → `.`
2. Implizite Multiplikation ausschreiben: `3x` → `3*x`, `2(x+1)` → `2*(x+1)`
3. `1*x` → `x`, `x^1` → `x`
4. In Summanden zerlegen, Koeffizienten als **Brüche** rechnen, nach
   Exponent absteigend sortieren
5. `+ C` abtrennen und merken

Dadurch sind `x³/3`, `(1/3)x³` und `1/3·x³` **dieselbe** Antwort — weil der
Koeffizient beide Male der Bruch 1/3 ist. `0,333x³` ist es nicht, und das ist
richtig so.

**Drei Regeln, die Ärger vermeiden:**

- **Unverständliche Eingaben zählen nicht als Fehler.** Wenn der
  Normalisierer nicht parsen kann, erscheint „Schreibweise nicht erkannt",
  die Aufgabe bleibt stehen, die Uhr läuft weiter. Eine Notationsmarotte
  darf nie einen Lauf kosten.
- **`+ C` ist erlaubt, aber nicht verlangt.**
- **Jedes Set nennt seine Schreibweise** in einer Zeile vor dem Start:
  „Potenzen mit ^ oder ², Brüche mit /, +C darf entfallen."

Und einmalig vor dem ersten Lauf in Bereich 5 oder 6 eine **Schreibprobe** —
vier Aufgaben ohne Uhr, bei denen nur die Notation geübt wird.

`mathe-term.js` ist damit ein reines Rechenstück ohne Browser und bekommt
eine eigene Prüfliste — Ziel sind 150 bis 200 Prüfungen allein für den
Normalisierer, samt der Fälle, die *nicht* akzeptiert werden dürfen.

---

## 13. Setfolge: frei, mit Vorschlag

Alle 100 Sets eines Bereichs sind jederzeit anwählbar. Beim Öffnen schlägt
das Programm eines vor:

> **Weiter bei Set 67** — 15er-Reihe

Die Regel: das erste Set ohne Stern. Hat dieses Set bereits fünf Versuche
ohne Stern, kommt zusätzlich der Hinweis auf seine **Voraussetzung** — dafür
trägt jede Set-Beschreibung das Feld `voraussetzung`:

> Set 67 hakt. Vielleicht erst Set 55 („Einmaleins mit 5") festigen.

Kein Set ist gesperrt. Wer Set 100 anschauen will, darf.

---

## 14. Zeitdruck und Mathematikangst

Es gibt die verbreitete Behauptung, Rechnen auf Zeit erzeuge
Mathematikangst, besonders bei Mädchen. Die Sache ist differenzierter, und
weil hier zwei Mädchen betroffen sind, gehört sie hierher.

Eine Untersuchung von 2024 verglich Aufgaben mit **offenem** und mit
**verstecktem** Zeitlimit und fand **keinen signifikanten Unterschied** im
Angstniveau. Was Angst erzeugte, war die **Schwierigkeit** der Aufgaben, nicht
die Uhr. Was dagegen erwiesenermaßen demotiviert, ist der **öffentliche
Vergleich** von Zeiten; der Vergleich mit der **eigenen** früheren Zeit ist
unbedenklich und wirkt motivierend.

Daraus vier Gestaltungsregeln:

1. **Kein Vergleich zwischen den Konten.** Nie eine Bestenliste, nie „deine
   Schwester war schneller". Nur die eigene frühere Zeit — sichtbar als
   Schatten hinter den Punkten.
2. **Der Übungsmodus ist der Einstieg**, nicht der Test.
3. **Keine Uhr auf dem Bildschirm.** Sie läuft, wird aber erst am Ende
   genannt. Während des Laufs sagt nur der Schatten, wie man steht.
4. **Ein misslungener Lauf hat keine Folgen.** Kein Verlust, kein
   Rückschritt, keine rote Meldung.

Und, weil die Grundoperationen Grundschulstoff sind: Es darf sich nicht nach
Grundschule anfühlen. Keine Sterne mit Kulleraugen, kein „Super gemacht!".
Die Rückmeldung ist eine **Zeit** — das ist erwachsen und für sich
motivierend.

---

## 15. Daten und Speicherung

```
users/{uid}/mathe/grundoperationen
users/{uid}/mathe/zehntausend
users/{uid}/mathe/groessen
users/{uid}/mathe/sekundarstufe
users/{uid}/mathe/trigstoch
users/{uid}/mathe/analysis
```

Je Bereich **ein** Dokument mit einer Karte je Set — nicht 100 Dokumente:

```js
{ sets: {
    "67": { beste: { n: 20, s: 47 }, versuche: 6, fehler: 0,
            stern: true, zuletzt: "2026-08-06" },
    "68": { beste: null, versuche: 2, fehler: 3,
            stern: false, zuletzt: "2026-08-06" }
  },
  aktuell: 68 }
```

Bei rund 50 Byte je Eintrag sind das gut 5 KB je Bereich, weit unter der
Grenze von 1 MB, und es kostet einen Lesevorgang statt hundert. Sechs
Bereiche: sechs Lesevorgänge beim Öffnen des Reiters, und auch die nur einmal
je Sitzung.

**Geschrieben wird einmal je Lauf**, nicht je Aufgabe — sonst wären es bei
24 Aufgaben 24 Schreibvorgänge, und das Tageskontingent des kostenlosen
Firebase-Tarifs ist projektweit begrenzt. Die Prüfrunde zu Stufe 6 hat
gezeigt, wie schnell man dort ankommt.

Für den **Bestzeit-Schatten** braucht es einen Zusatz: nicht nur die
Gesamtzeit des besten Laufs, sondern die **Zeitpunkte der einzelnen
Antworten** — bei 24 Aufgaben 24 kleine Zahlen, rund 70 Byte. Das ist der
gesamte Preis dieser Anzeige.

In die Tagesstatistik kommen zwei Felder dazu: `matheLaeufe` und
`matheSekunden`. Die **Zeit zählt als Lernzeit** (Tagesring, Streak), die
Läufe zählen **nicht als Abfragen**.

**Die Fortschrittsanzeige** ist ein Raster aus 100 Feldern — grau
unbearbeitet, orange begonnen, grün fehlerfrei, mit Stern unter 60 Sekunden.
Es passt auf dem Telefon in einen Bildschirm (10 × 10 Felder à 30 px).

---

## 16. Aufwand und Reihenfolge

| | Schritt | Aufwand |
|---|---|---|
| 1 | Modulschnitt, Reiter, Werkzeugkiste, Speicher, Rasteranzeige | 1 |
| 2 | Ziffernblock, Punktering, Laufwerk (Übung + Test) | 1 |
| 3 | **Bereich 1** Grundoperationen bis 100 | 1 |
| 4 | **Bereich 2** Zahlenraum 10’000 samt großem Einmaleins | 1,5 |
| 5 | Termblock und Normalisierer, mit eigener Prüfliste | 1,5 |
| 6 | **Bereich 4** Sekundarstufe | 1 |
| 7 | **Bereich 6** Differential- und Integralrechnung | 1,5 |
| 8 | **Bereich 5** Trigonometrie und Stochastik | 1,5 |
| 9 | **Bereich 3** Größen | 1,5 |
| 10 | Statistik, Abzeichen, Abnahmeprüfungen | 1,5 |
| | **zusammen** | **13** |

Die **Größen stehen am Ende**: geringster Reiz für 14, 16 und 48 Jahre, und
zugleich der höchste Sonderfallaufwand (Zeit rechnet nicht dezimal, Flächen
springen um den Faktor 100).

**Ausgeliefert wird in drei Portionen:**

- **nach Schritt 4** — beide Zahlenbereiche vollständig, 200 Sets. Das ist
  für sich ein brauchbares Programm, und es braucht noch keinen Termblock.
- **nach Schritt 7** — Sekundarstufe und Analysis, also der Teil, der zum
  Alter passt. Hier zeigt sich, ob der Termblock trägt.
- **nach Schritt 10** — vollständig, geprüft.

Vor jeder Portion die übliche Prüfrunde. Für die neuen Bereiche kommt eine
Prüfungsart dazu, die es bisher nicht gab: **die fachliche Gegenprüfung.**
Jede erzeugte Aufgabe wird gegen eine unabhängige Rechnung geprüft — bei
Ableitungen numerisch über den Differenzenquotienten, bei Größen über eine
zweite Umrechnung, beim Teilen mit Rest über `a = q · b + r` mit `0 ≤ r < b`.
Eine falsche Musterlösung wäre der schlimmste Fehler, den dieses Programm
machen könnte.

---

## 17. Was noch offen bleibt

Nichts, was den Anfang blockiert. Drei Dinge kann ich vorher nicht wissen:

1. **Ob 8 Ableitungen in 60 Sekunden die richtige Eichung sind.** Das lässt
   sich nur an einem echten Lauf sehen. Die Zahl ist verstellbar.
2. **Ob die Schreibprobe reicht**, um den Termblock ohne Frust zu benutzen.
   Falls nicht, wäre die Auswahl aus vier Vorschlägen der Rückfallweg — nur
   für die Sets, bei denen es hakt.
3. **Ob der Bestzeit-Schatten hilft oder nervt.** Er ist abschaltbar, und
   beim allerersten Lauf eines Sets gibt es ihn ohnehin nicht.

Ich fange mit Schritt 1 bis 3 an.

---

## Quellen

- [tempo60 Grundoperationen — Handbuch](https://www.profaxonline.com/dech/manuals/tempo60/)
  — 100 Sets zu 24 Aufgaben, Übungs- und Testmodus, Fehlerbehandlung, Sterne
- [tempo60 Grössen — Handbuch](https://www.profaxonline.com/deat/manuals/t60units/)
  — 100 Sets zu 16 Aufgaben, Aufteilung der Größenbereiche
- tempo60 10’000 — Produktbeschreibung (vom Nutzer übermittelt): 100 Sets zu
  12, 16, 20 oder 24 Aufgaben, Themen des Zahlenraums bis 10’000
- [tempo60 Grundoperationen — Produktseite](https://www.profax.ch/produkt/tempo60-grundoperationen/)
- [tempo60 Grössen — Produktseite](https://www.profax.ch/produkt/tempo60-groessen/)
- [Education Week (2024): Do Timed Tasks Really Worsen Math Anxiety?](https://www.edweek.org/teaching-learning/do-timed-tasks-really-worsen-math-anxiety/2024/08)
  — kein signifikanter Unterschied zwischen offenem und verstecktem
  Zeitlimit; die Schwierigkeit erzeugt die Angst, nicht die Uhr
- Bildschirmfoto tempo60 (vom Nutzer), vermessen: 24 Punkte à 15°,
  Ø 36 px bei Ringradius 163 px, ein grüner Punkt, durchscheinendes Band
