# Fassung 7.5 — die sieben Rückmeldungen

Sieben Punkte aus dem Betrieb, alle umgesetzt. Diese Datei hält fest, was
gemessen wurde, was die Ursache war und was es kostet.

---

## 1 · Nach „Tipp anzeigen" ließ sich nichts mehr eintippen

**Ursache, am Quelltext gefunden.** Die Lernbox kennt fünf Anzeigestufen
(Frage → erste Buchstaben → erstes Wort → ganze Antwort → zugedeckt). Das
Eingabefeld wurde aber nur auf der Stufe `frage` überhaupt gezeichnet:

```js
if (tippen && u.stufe === 'frage' && !u.urteil) { …Eingabefeld… }
```

und ebenso nur dort verdrahtet. Wer den Tipp nahm, verlor Feld, Fokus und
Enter-Auswertung in einem Zug — ausgerechnet die Krücke für den Fall, dass
man es *fast* weiß, nahm einem das Tippen weg. Der einzige Weg zurück war
Aufdecken, und damit war die Karte ohnehin gelaufen.

**Korrektur.** Die Tippstufen sind eine Anzeige-Eigenschaft, kein
Bedienzustand. Es gibt jetzt eine benannte Liste `TIPPBARE_STUFEN`
(`frage`, `buchstaben`, `wort`, `zugedeckt`) — überall dort steht das Feld,
hat den Fokus und wertet auf Enter aus.

**Gemessen:** Feld vorhanden, sichtbar und fokussiert auf allen drei
Tippstufen; eine nach dem zweiten Tipp getippte Antwort wird ausgewertet.

## 2 · Darstellung auf dem Pixel 10

Zwei Ursachen, beide unsichtbar am Schreibtisch — genau deshalb sind sie
sieben Runden lang durchgerutscht.

**a) Der Gestenstreifen am unteren Rand.** Die Navileiste rechnet ihn mit
(`padding: … env(safe-area-inset-bottom)`) und wird dadurch höher. Die feste
Aktionszeile der Lernbox stand aber auf einer starren `bottom: 78px` — sie
rutschte also um genau den Betrag des Streifens **unter** die Navileiste.
Am Schreibtisch ist `env(safe-area-inset-bottom)` gleich null, dort fällt es
nie auf. Betroffen waren außerdem der klebende Startknopf, die Meldungszeile
und die Seitenpolsterung.

**Gemessen** (412 px breit, Systemstreifen für die Messung auf 24 px gesetzt):

| | Abstand Aktionszeile → Navileiste |
|---|---|
| ohne Streifen | 9 px |
| mit 24 px Streifen, vorher | −15 px *(Überlappung)* |
| mit 24 px Streifen, jetzt | 9 px |

**b) `vh` auf Android-Chrome.** Dort ist `100vh` die Höhe **ohne**
Adresszeile. Die Laufansicht des Zahlenakrobaten maß `min(72vh, 620px)` —
bei ausgefahrener Adresszeile war sie damit höher als der sichtbare Bereich,
und der Tastenblock samt Bestätigungstaste stand unter der Bildkante.
Dasselbe galt für den Rahmen der App und für Dialoge.

**Korrektur.** `dvh` (dynamische Viewporthöhe) mit `vh` als Rückfallebene,
und die festen unteren Leisten rechnen mit
`calc(… + env(safe-area-inset-bottom))`.

**Gemessen** bei 412 × 915, 760 und 640 px: Die Bestätigungstaste liegt
immer über der Navileiste, die Aufgabe steht im Bild, die Seite scrollt
nicht (`scroll: 0`).

> Ehrlich dazugesagt: Der Prüfbrowser liefert für `env(safe-area-inset-bottom)`
> null und für `dvh` denselben Wert wie für `vh`. Geprüft wurde deshalb die
> **Rechnung** — mit nachgestelltem Streifen — und zusätzlich am Quelltext,
> dass die Einheiten überhaupt dastehen. Ob es auf deinem Gerät stimmt,
> siehst du am schnellsten selbst.

## 3 · Antwort abtippen, statt die Karte noch einmal umzudrehen

Sobald die Antwort sichtbar ist, steht darunter ein Feld „Antwort
abtippen …". Wer richtig abtippt, bekommt den Treffer gutgeschrieben und es
geht weiter.

Drei Entscheidungen, die dazugehören:

* **Ein Fehlversuch kostet nichts.** Die Antwort steht ja da; ein Tippfehler
  ist kein Gedächtnisfehler. Es kommt eine Rückmeldung („Fast — schau noch
  einmal genau hin"), die Karte bleibt stehen, es wird nichts gebucht.
* **Kein automatischer Fokus.** Auf dem Telefon schöbe die Bildschirmtastatur
  sonst die eben aufgedeckte Antwort aus dem Bild, bevor man sie gelesen hat.
* **Ab 120 Zeichen kein Feld.** Drei Sätze tippt niemand ab.

Groß- und Kleinschreibung, Umlaute und doppelte Leerzeichen sind egal — es
gilt dieselbe Normalisierung wie beim Abfragen.

**Was das kostet, offen gesagt:** Ein richtig abgetippter Treffer zählt
genauso wie „Konnte ich". Eine Karte kann die Lernbox damit auch verlassen,
ohne dass sie je frei erinnert wurde. Das war deine Entscheidung und sie ist
für das Einschleifen von Schreibweisen richtig — für reines Abfragen wäre
sie es nicht. Wenn sich das im Betrieb zu weich anfühlt, baue ich einen
Schalter „Abtippen zählt nicht" ein.

## 4 · Lernstand eines einzelnen Kastens zurücksetzen

Gab es nicht. Zurücksetzen ging nur über die Gefahrenzone — und die trifft
alles. Wer einen Kasten von vorn lernen wollte, musste ihn löschen und neu
einlesen und verlor dabei Notizen, Extras, Merker, Lautschrift und
Schlagwörter.

Am Kasten steht jetzt **„Zurücksetzen"**. Zurückgesetzt wird je Karte: Fach,
Termin, letzte Abfrage, Wiederholungen, Aussetzer, Zustand, Stabilität,
Schwierigkeit, Problemkennzeichnung, Lernzeit und der Übungsstand der
Lernbox. **Nicht angetastet:** Frage, Antwort, Notiz, Extra, Merker,
Lautschrift, Schlagwörter, Kartentyp und Format. Auch die Sitzungsstatistik
vergangener Tage bleibt — die hängt an Tagen, nicht an Karten.

Die Rückfrage nennt die Anzahl und sagt ausdrücklich, dass die Karten
bleiben. Geschrieben wird in Blöcken zu 400 Vorgängen wie überall sonst.

## 5 · Zahlenakrobat über die Tastatur

Im Lauf war die Tastatur längst vollständig — Ziffern, Komma, Minus,
Rücktaste, Enter, Escape. Sie hörte nur **mit der letzten Aufgabe auf**: Für
„Noch einmal", „Set 12" oder „Prüfung starten" musste die Hand zur Maus. In
einem Programm, das auf Zeit läuft, misst das die Handbewegung mit.

Jetzt gilt außerhalb eines Laufs, solange der Reiter offen ist:

| Taste | Wirkung |
|---|---|
| Enter | löst den Hauptknopf des Bildschirms aus |
| Escape | geht eine Ebene zurück (Abschluss → Raster → Übersicht) |

Der Hauptknopf wird **deklarativ** gesucht — der erste sichtbare, nicht
gesperrte `.btn.primary` der Seite. Damit bleibt die Tastatur richtig, auch
wenn eine Ansicht später einen anderen Knopf bekommt.

## 6 · Aufwärmen vor dem Testlauf

Vor jedem **Testlauf** kommen drei ungezählte Aufgaben aus demselben Set,
ohne Uhr. Erst mit der ersten gezählten Aufgabe beginnt die Zeitmessung.

Das ist keine Bequemlichkeit, sondern eine Korrektur: Das Par des
Zahlenakrobaten stammt aus tempo60, wo man das Set vorher geübt hat. Ein
Testlauf trifft einen kalt, und der Kaltstart geht voll in die Zeit. Das
Aufwärmen senkt die Messlatte nicht, es gleicht die Bedingungen an.

Vier Feinheiten:

* Die Aufwärmaufgaben werden **zusätzlich** gezogen (`setAufgaben` mit drei
  Aufgaben mehr, die letzten drei sind das Aufwärmen). Die gezählten
  Aufgaben bleiben dadurch **bitgleich** mit einem Lauf ohne Aufwärmen —
  sonst wären alte Bestzeiten wertlos. Gemessen: keine Überschneidung.
* Der **Übungsmodus** bekommt keines. Der ist selbst eines.
* Die **Meisterklasse** wärmt mit drei Aufgaben aus dem Set auf, mit dem es
  gleich losgeht; die Fünfzehn-Minuten-Uhr startet erst danach.
* **Überspringen** geht jederzeit, **abschalten** in den Einstellungen.

## 7 · Division mit Komma statt mit Rest

Die vier Sets 97–100 in Bereich 2 hießen „Teilen mit Rest" und antworteten
`53 : 7 = 7 R 4`. Sie heißen jetzt „Teilen mit Komma" und antworten
`72 : 5 = 14,4`.

**Nur aufgehende Divisionen.** Das Ergebnis muss sich mit höchstens zwei
Nachkommastellen exakt hinschreiben lassen; gerundet wird nicht. Zu `72 : 7`
gäbe es sonst mehrere vertretbare Antworten, und eine Prüfung, die zwei
Antworten gelten lässt, misst nichts mehr.

**Der Preis, offen benannt.** Damit kommen Teiler wie 3, 6, 7 und 9 nur noch
dort vor, wo es glatt aufgeht. Die vier Sets nennen ihre Teiler deshalb
ausdrücklich (2/4/5 · 8/16/25 · 20/40/50 · gemischt), statt sie aus einer
Spanne zu ziehen — sonst bestünden ganze Sets aus lauter ganzen Zahlen und
das Komma, um das es geht, käme gar nicht vor.

**Gemessen:** 11 bis 16 von 16 Aufgaben je Set haben ein Komma, keine hat
mehr als zwei Nachkommastellen, keine Aufgabe kommt doppelt vor.

**Was mitgeht:** Die Prüfart `rest` und die R-Taste sind ersatzlos
entfallen. Der Themenname der Meisterklasse heißt jetzt „Große Division und
Teilen mit Komma". **Bestzeiten und Sterne der vier Sets werden einmalig
geräumt** — sie stünden sonst für eine Aufgabenart, die es nicht mehr gibt.
Das passiert beim ersten Start, erkennbar an einer Umbaunummer im
gespeicherten Stand, und meldet sich mit einer Zeile.

---

## Nebenbei gefunden und behoben

Beim Vermessen auf 412 px fielen Dinge auf, die niemand gemeldet hat:

* **Selbst eingebrockt:** Der neue Knopf am Kasten sprengte die Kachel auf
  einem Telefon um gemessen 45 px. Die Werkzeugleiste darf jetzt umbrechen,
  und der Knopf heißt kurz „Zurücksetzen".
* Eingabefelder und Auswahllisten waren 37 bis 38 px hoch — unter dem
  Mindestmaß von 44 px, während der Knopf daneben 48 px hatte.
* Zeilen mit Kontrollkästchen waren so hoch wie ihr Text (27 bis 37 px),
  obwohl die ganze Zeile das Ziel ist.
* Der Löschknopf „×" war 34 px breit.
* Das Auswahlkästchen der Kartenliste war 13 × 13 px, jetzt 24 × 24.

Zwei Ausnahmen bleiben **bewusst** bestehen und stehen als solche in der
Prüfdatei: Das Setraster des Zahlenakrobaten ist zehnspaltig (hundert Sets
in Zehnerreihen) — auf 412 px sind das 34 px je Feld; mit 44 px passten nur
neun Spalten und die Zehnerordnung wäre hin. Und das Listenkästchen bleibt
bei 24 px, weil daneben mit „Bearbeiten" ein großes Ziel steht.

---

## Prüfstand

Der Prüfstand musste neu aufgebaut werden — der alte `test/`-Ordner ging mit
dem Arbeitsplatz verloren. Neu geschrieben: die Firebase-Attrappe
(`test/mock/`), das gemeinsame Gerüst (`test/basis.mjs`) und vier
Prüfdateien.

| Prüfdatei | Punkte | wofür |
|---|---|---|
| `pruefung-7-5.mjs` | 49 | die sieben Rückmeldungen |
| `pruefung-pixel.mjs` | 115 | 412 px, beide Farbschemata, drei Höhen, Tippflächen |
| `pruefung-regress.mjs` | 48 | Karteikasten, Lernbox, Editor, Sicherung, Statistik, alle sechs Bereiche, Meisterklasse |
| **Summe im Browser** | **212** | **0 offen** |
| `gegen-b2.mjs` | 20 | 2048 Musterlösungen aus Bereich 2 unabhängig nachgerechnet |
| `gegen-bereiche.mjs` | 7 | 600 Sets, 9048 Aufgaben: aufbaubar, eintippbar, eigene Lösung gilt |

Was der neue Prüfstand **nicht** kann: Er trägt die Befundprotokolle aus den
sieben vorigen Runden nicht mehr. `pruefung-stufe2` bis `-stufe7`,
`pruefung-mobil`, die XSS-Prüfungen und die Datenverlust-Protokolle sind
verloren, sofern du `han-croco-7-4-tests.zip` nicht noch findest.
