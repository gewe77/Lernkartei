# Meisterklasse — wie sie rechnet

> Diese Datei ist eine Kurzfassung. Die ausführliche Herleitung samt
> Messreihen steht im Projekt unter `claude/MEISTERKLASSE.md`; die
> Originaldatei lag im abgeräumten Arbeitsplatz.

Eine Prüfung quer durch alles: gewürfelt, rund zehn Minuten, spätestens nach
fünfzehn ist Schluss. Danach steht da, was noch nicht sitzt.

## Der Index

```
        Summe der Par-Zeiten aller RICHTIG gelösten Aufgaben
Index = ──────────────────────────────────────────────────── · 100
                    gebrauchte Gesamtzeit
```

`Par = 60 / set.aufgaben` — dieselbe Meßlatte, an der auch der Stern hängt.
**Index 100 heißt: quer durch alles genau das Tempo, das ein Stern verlangt,
und nichts falsch.** Fehler brauchen keine künstliche Strafe: Eine falsche
Aufgabe steuert null zum Zähler bei, ihre Zeit aber zum Nenner.

**Nicht geschaffte Aufgaben kosten nichts** — der Index summiert nur über die
tatsächlich beantworteten. Er misst also Tempo und Treffsicherheit auf dem,
was man angefasst hat, nicht die Vollständigkeit.

### Wie der Index zu lesen ist

Der Bauplan ohne die Wahlbereiche: 18 Themen, 108 Aufgaben, Par-Summe
371 Sekunden (6,2 Minuten), im Mittel 3,43 s je Aufgabe.

| Trefferquote | dann brauchtest du je Aufgabe für Index 20 |
|---|---|
| 100 % | 17,2 s |
| 80 % | 13,7 s |
| 60 % | 10,3 s |
| 50 % | 8,6 s |

**Die Skala ist hart, und zwar messbar.** Ein Lauf braucht 369 Tastendrücke
für 108 Aufgaben — 3,4 je Aufgabe samt Bestätigung. Bei 0,35 s je Druck sind
das 129 Sekunden reine Eingabe, **35 % der gesamten Par-Summe**, ohne einen
einzigen Gedanken; auf dem Telefon eher 50 %. Am härtesten trifft es dort,
wo das Par am knappsten ist: „Plus und Minus bis 10 000" gibt 2,58 s, davon
sind 1,68 s Tippen.

Die realistische Obergrenze für einen Erwachsenen, der alles kann, liegt auf
diesem Bauplan bei etwa **Index 55 bis 75**, nicht bei 100. Index 100 ist
keine Zielmarke, sondern eine Rechengröße.

Seit Fassung 7.5 wärmt die Prüfung mit drei ungezählten Aufgaben auf. Das
nimmt einen Teil des Kaltstarts heraus, den das Par nicht kennt.

## Bauplan

22 Themen, alle 600 Sets genau einem zugeordnet. Bereiche 1–4 fest,
Trigonometrie und Analysis wahlweise dazu.

| Bauplan | Themen | Aufgaben |
|---|---|---|
| Basis (1–4) | 18 | 108 |
| + ein Wahlbereich | 20 | 100 |
| alles | 22 | 88 |

Gezogen wird blockweise nach **(Thema × Prüfart)**, die Blockreihenfolge
gewürfelt — der Tastenblock darf nicht mitten im Block wechseln. Innerhalb
eines Themas wird aus möglichst vielen verschiedenen Sets gezogen; keine
Aufgabe kommt in einer Prüfung zweimal vor.

**Das Rauschen ist gemessen:** Bei gleichbleibendem Können streut der Index
über 250 gewürfelte Prüfungen um ± 1,7 bis 2,3 Punkte (2,9 bis 4,4 %). Eine
echte Verbesserung um zehn Prozent hebt sich mit +5,3 Punkten klar davon ab.
Der Verzicht auf feste Prüfungsformen kostet also nichts.

## Diagnose

| Einstufung | Bedingung |
|---|---|
| sitzt | keine Fehler und ≤ 1,3 × Par |
| wackelt | ein Fehler, oder > 1,3 × Par |
| fehlt noch | ≥ 25 % Fehler, oder > 2 × Par |

Nicht nur Fehler zählen: Wer `7 · 8` richtig, aber in sechs Sekunden rechnet,
hat es nicht automatisiert. Darunter steht ein Übungsplan mit bis zu fünf
Schlüsselsets der schwächsten Themen, jedes mit einem Knopf, der es startet.

Belastbarkeit steht auf dem Bildschirm: *„Aus einer Prüfung — das ist ein
Hinweis, noch keine Diagnose."* Ab drei Läufen: *„das trägt."*

## Speicher

`users/{uid}/mathe/meisterklasse` — die letzten 20 Läufe, je Lauf nur die
Bilanz je Thema (n, Fehler, Sekunden, Par), rund 900 Byte. Für die Diagnose
zählen die letzten fünf.
