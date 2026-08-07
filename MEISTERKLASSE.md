# Meisterklasse — Konzept

> **Stand 7. August 2026 — gebaut und ausgeliefert (Version 7.3,
> Formatierungsrunde in 7.4).**
> Umgesetzt nach deinen Entscheidungen: feste Aufgabenzahl mit
> 15-Minuten-Deckel, Bereiche 1–4 fest und 5/6 wahlweise dazu, jedes Mal neu
> gewürfelt (keine festen Formen).
>
> **Das Rauschen ist gemessen**, weil ohne feste Formen alles am Index hängt:
> Bei gleichbleibendem Können streut er über 250 gewürfelte Prüfungen um
> **± 1,9 Punkte, also 3,2 %**. Eine echte Verbesserung um zehn Prozent hebt
> sich mit +5,3 Punkten klar davon ab. Der Verzicht auf feste Formen kostet
> also nichts — das war vorher nicht sicher.

Eine Prüfung quer durch alles, aus dem Zufall gezogen, rund zehn Minuten
lang. Aus den Fehlern soll herausfallen, was noch nicht sitzt.

Die schwierige Frage steckt in deinem Satz: **„Problematisch ist, dass keine
Vergleichbarkeit vorhanden ist."** Das ist der Kern, und alles andere hängt
daran. Deshalb steht sie hier vorn.

---

## 1. Warum die Vergleichbarkeit verlorengeht

In den normalen Sets ist sie geschenkt: Set 55 hat im Testmodus **immer
dieselben 24 Aufgaben in derselben Reihenfolge**. Zwei Läufe messen dasselbe,
also darf man die Zeiten nebeneinanderlegen.

Sobald gewürfelt wird, fällt das weg — und zwar auf drei Ebenen:

| | Was schwankt | Beispiel |
|---|---|---|
| **1** | die **Mischung** | einmal viel Einmaleins, einmal viel Analysis |
| **2** | die **einzelne Aufgabe** | `2 · 5` gegen `17 · 13`, beides „großes Einmaleins" |
| **3** | der **Umfang** | wer schneller ist, schafft in zehn Minuten mehr |

Jede Ebene braucht eine eigene Antwort. Zusammen ergeben sie eine Prüfung,
die man ehrlich mit sich selbst vergleichen kann.

---

## 2. Ebene 1 — der Bauplan

Nicht „irgendwas aus 600 Sets", sondern ein **fester Bauplan**: Er legt fest,
wie viele Aufgaben aus welchem Thema kommen. Gewürfelt wird nur *welche*
Aufgabe aus dem Thema, nie *wie viele*.

Damit ist die Mischung in jedem Lauf gleich — und das ist die halbe Miete,
denn die Schwankung zwischen „viel Einmaleins" und „viel Analysis" ist die
mit Abstand größte.

Drei Baupläne, damit niemand Ableitungen bekommt, der bei den Zehnern steht:

| Bauplan | Bereiche | Aufgaben | mittleres Par | bei Par | realistisch |
|---|---|---|---|---|---|
| **Grundlagen** | 1–3 | 120 | 3,2 s | 6,4 min | **9,6 min** |
| **Sekundarstufe** | 1–4, Schwerpunkt 4 | 110 | 3,8 s | 7,0 min | **10,5 min** |
| **Alles** | 1–6 | 90 | 4,7 s | 7,0 min | **10,5 min** |

Die Aufgabenzahl ist so gewählt, dass ein Lauf bei realistischem Tempo (etwa
dem Anderthalbfachen der Sollzeit) **rund zehn Minuten** dauert —
nachgerechnet, nicht geschätzt. Wer auf Par rechnet, ist in sieben Minuten
durch; das ist dann aber auch Meisterklasse.

---

## 3. Ebene 2 — die Form

Innerhalb eines Themas bleibt eine Restschwankung: `2 · 5` und `17 · 13`
gehören beide zum großen Einmaleins, sind aber nicht gleich schwer.

Antwort: **Formen**. Eine Form ist ein fester Startwert. „Grundlagen, Form 7"
hat immer exakt dieselben 120 Aufgaben — genau wie ein einzelnes Set.

- **Innerhalb einer Form**: exakte Vergleichbarkeit. Dieselbe Prüfung noch
  einmal, in vier Wochen, ist eine echte Messung.
- **Zwischen Formen**: nicht exakt — dafür ist Abschnitt 4 da.

**Entschieden wurde dagegen** — es wird jedes Mal neu gewürfelt. Damit hängt
alles am Index, und deshalb wurde nachgemessen, ob er das trägt: Über 250
gewürfelte Prüfungen bei gleichbleibendem Können streut er um **3,2 %**, eine
Verbesserung um zehn Prozent zeigt sich als **+5,3 Punkte**. Das ist der
Unterschied zwischen Messen und Raten — und er fällt zugunsten des Würfelns
aus. Die Messung steht in `test/probe-mk-rauschen.mjs` und läuft als
Zusicherung in `test/gegen-meisterklasse.mjs` mit.

---

## 4. Ebene 3 — der Index

Jetzt kommt der Teil, der das Problem wirklich löst.

**Die Zeit allein taugt nicht als Maß**, sobald die Aufgaben verschieden
sind. Was man braucht, ist ein Maßstab, der **mit den Aufgaben mitreist** —
so wie beim Golf nicht Schläge verglichen werden, sondern Schläge gegen Par.

Und dieses Par gibt es hier schon: **Jedes Set hat eine Sollzeit je Aufgabe,
nämlich 60 Sekunden geteilt durch die Aufgabenzahl.**

| Bereich | Aufgaben/Set | Par je Aufgabe |
|---|---|---|
| 1 Grundoperationen | 24 | 2,5 s |
| 2 Zahlenraum 10 000 | 12–24 | 2,5–5,0 s |
| 3 Größen | 16 | 3,8 s |
| 4 Sekundarstufe | 12 | 5,0 s |
| 5 Trigonometrie/Stochastik | 10 | 6,0 s |
| 6 Analysis | 8 | 7,5 s |

Daraus wird ein einziger Wert:

```
        Summe der Par-Zeiten aller RICHTIG gelösten Aufgaben
Index = ──────────────────────────────────────────────────── · 100
                    gesamte gebrauchte Zeit
```

**Index 100 heißt: Du hast quer durch alles genau das Tempo gehalten, das
ein Stern verlangt — und dabei nichts falsch gemacht.**

Das ist die Antwort auf deine Frage. Der Index ist vergleichbar, egal was
gezogen wurde, weil das Par mit der Ziehung mitwandert. Zieht die Prüfung
schwere Aufgaben, steigt auch das Par.

Drei Eigenschaften, die ihn brauchbar machen:

- **Fehler brauchen keine künstliche Strafe.** Eine falsche Aufgabe steuert
  null zum Zähler bei, ihre Zeit aber zum Nenner. Sie kostet also doppelt —
  von selbst und im richtigen Verhältnis.
- **Er benutzt denselben Maßstab wie der Rest des Programms.** Kein zweites
  Bewertungssystem, das man erst verstehen muss.
- **Er ist ehrlich schwer.** Index 100 quer durch alle Bereiche bedeutet:
  jedes Set wäre einen Stern wert. Das ist ein Ziel für Jahre, kein
  Nachmittag.

Angezeigt werden trotzdem beide Zahlen — die **Zeit** (vergleichbar
innerhalb der Form) und der **Index** (vergleichbar überall). Wer „Form 7
noch einmal" macht, sieht beides nebeneinander.

---

## 5. Zeit oder Aufgabenzahl?

Du hast „Umfang 10 Minuten?" gefragt. Ich würde es andersherum machen:
**feste Aufgabenzahl, gemessene Zeit** — aus einem Grund, der mit der
Diagnose zu tun hat.

Bei fester Zeit sieht der Langsame **weniger Aufgaben**, und zwar
ausgerechnet aus den Themen, die hinten liegen. Die Diagnose wäre genau dort
am dünnsten, wo sie am nötigsten ist. Bei fester Aufgabenzahl bekommt jeder
dieselbe Abdeckung.

Damit niemand endlos festhängt: **Deckel bei 15 Minuten.** Wer dann nicht
fertig ist, bekommt ein Teilergebnis — der Index ist auch aus einer halben
Prüfung berechenbar, die Diagnose entsprechend gekennzeichnet.

---

## 6. Die Diagnose — was noch nicht sitzt

Jede Aufgabe weiß, woher sie kommt: Bereich, Set, Regelart. Daraus lassen
sich die Ergebnisse zu **Themen** bündeln — gröber als Sets, feiner als
Bereiche. Etwa achtzehn:

```
Bereich 1   Plus und Minus bis 100 · Ergänzen · Verdoppeln/Halbieren ·
            Kleines Einmaleins · Division · Platzhalter
Bereich 2   Zehner/Hunderter/Tausender · Ergänzen im Tausenderraum ·
            Großes Einmaleins · Quadratzahlen · Teilen mit Rest
Bereich 3   Umwandeln · Vergleichen · Ergänzen von Größen
Bereich 4   Zehnerpotenzen · Negative Zahlen · Brüche/Prozent · Terme
Bereich 5   Winkel und Werte · Wahrscheinlichkeit
Bereich 6   Ableiten · Integrieren
```

**Nicht nur die Fehler zählen.** Wer `7 · 8` richtig, aber in sechs Sekunden
rechnet, hat es nicht automatisiert — und genau das ist die frühe Warnung,
lange bevor Fehler auftauchen. Deshalb zwei Größen je Thema:

| Einstufung | Bedingung |
|---|---|
| **sitzt** | keine Fehler und im Schnitt ≤ 1,3 × Par |
| **wackelt** | ein Fehler, oder im Schnitt > 1,3 × Par |
| **fehlt noch** | zwei oder mehr Fehler, oder > 2 × Par |

Das Ergebnis ist kein Zeugnis, sondern ein **Übungsplan**: drei bis fünf
Sets, die als Nächstes dran sind, mit Knopf zum direkten Start. Ausgewählt
werden die Schlüsselsets der schwächsten Themen — die, die alles andere
tragen.

### Was ich dazu ehrlich sagen muss

Hundert Aufgaben auf achtzehn Themen sind **fünf bis sechs je Thema**. Das
ist für eine belastbare Aussage zu wenig. Aus einem Fehler bei sechs
Aufgaben eine Diagnose zu machen, wäre Zahlenaberglaube.

Zwei Dinge dagegen:

1. **Die Themen sind grob genug**, dass sich mehrere Sets darin sammeln —
   und der Bauplan zieht die Aufgaben aus verschiedenen Sets des Themas,
   nicht sechsmal aus demselben.
2. **Es wird über Prüfungen hinweg gesammelt.** Nach drei Läufen sind es
   fünfzehn bis achtzehn Aufgaben je Thema, und das trägt. Der Bildschirm
   sagt das auch: *„Nach einer Prüfung ist das ein Hinweis. Nach dreien eine
   Diagnose."*

---

## 7. Ablauf und Bildschirm

```
Meisterklasse
  Bauplan:  ( Grundlagen )  ( Sekundarstufe )  ( Alles )
  Form:     7        [ andere Form ]   [ Form 7 wiederholen ]

  120 Aufgaben · etwa 10 Minuten · Deckel 15 Minuten
  Deine beste: Index 84 (Form 3, vor zwei Wochen)

                        [ Prüfung starten ]
```

Während der Prüfung derselbe Bildschirm wie sonst — Punktering,
Ziffernblock, Termblock. Zwei Unterschiede:

- **Falsche Aufgaben kommen nicht wieder.** Eine Prüfung misst, sie übt
  nicht. Der Ring färbt den Punkt rot und geht weiter.
- **Der Ring zeigt den Fortschritt**, nicht die Zeit. Bei 120 Punkten wird
  aus dem Kranz ein feiner Ring; die verbleibende Zeit steht klein in der
  Mitte.

Danach: Index, Zeit, Trefferquote, die Themenübersicht und der Übungsplan.

---

## 8. Speicher

```
users/{uid}/mathe/meisterklasse
{ laeufe: [ { bauplan, form, datum, index, sekunden, richtig, gesamt,
              themen: { einmaleins: {n, fehler, sekunden}, … } } ],
  beste: { grundlagen: {index, form, datum}, … } }
```

Ein Dokument, ein Schreibvorgang je Prüfung. Die letzten **zwanzig Läufe**
werden behalten — bei rund 400 Byte je Lauf sind das 8 KB, weit unter der
Grenze. Für die gesammelte Diagnose reichen die letzten fünf.

---

## 9. Aufwand

| | Schritt | Aufwand |
|---|---|---|
| 1 | Themenzuordnung für alle 600 Sets, Baupläne, Ziehung mit festem Startwert | 1 |
| 2 | Prüfungslauf (Ring auf Fortschritt, kein Wiedervorlegen, Deckel) | 0,5 |
| 3 | Index, Auswertung, Themenübersicht, Übungsplan | 1 |
| 4 | Speicher, Verlauf, Bestwerte je Bauplan | 0,5 |
| 5 | Prüfungen: Ziehung deterministisch, Bauplan-Treue, Index-Rechnung, Diagnose | 1 |
| | **zusammen** | **4** |

Die Prüfliste bekommt eine eigene Sorte Prüfung: **Der Index muss gegen
gestellte Läufe nachgerechnet werden** — hundert erfundene Antwortmuster mit
bekanntem Sollwert. Eine Kennzahl, die falsch rechnet, wäre schlimmer als
keine.

---

## 10. Was zu entscheiden ist

1. **Feste Aufgabenzahl mit Zeitdeckel** (Empfehlung, wegen der Diagnose) —
   oder doch feste zehn Minuten?
2. **Drei Baupläne** wie oben — oder soll man die Bereiche frei ankreuzen?
   (Frei ist flexibler, macht aber den Vergleich zwischen zwei Läufen
   kaputt, sobald die Auswahl wechselt.)
3. **Formen** mit fester Nummer, wie vorgeschlagen — oder lieber immer neu
   würfeln und sich ganz auf den Index verlassen?
4. **Soll die Meisterklasse in die Sterne einzahlen?** Vorschlag: nein, aber
   ein eigenes Abzeichen ab Index 60, 80 und 100. Die Sterne gehören den
   Sets.

Zu 1 bis 3 hätte ich gern deine Wahl, dann fange ich an.
