# HAN CROCO — Vorschläge

Zwei Teile: **A** die KI-Sprachausgabe, **B** was die App sonst noch besser
machen würde. Stand: Version 4.3.

**Zur Sprachausgabe gibt es inzwischen eine ausführlichere Fassung:**
`SPRACHAUSGABE.md` rechnet die Tarife für ElevenLabs (das beim
Schleifchenturnier läuft) auf deinen Bestand um und nennt fünf Punkte, die vor
dem Bauen zu entscheiden sind. Teil A hier ist die Kurzfassung.

---

# Teil A — KI-Sprachausgabe

## Was heute da ist

Der Hörmodus benutzt die **Web Speech API** des Browsers: `speechSynthesis`
mit der Stimme, die das Gerät gerade mitbringt. Das kostet nichts, funktioniert
offline und braucht keinen Schlüssel — hat aber drei Nachteile, die im Alltag
auffallen:

- **Die Stimme ist auf jedem Gerät eine andere.** Auf dem iPhone klingt die
  Karte anders als auf dem Windows-Rechner, auf manchen Linux-Browsern gibt es
  gar keine deutsche Stimme.
- **Die Aussprache ist mittelmäßig**, gerade bei Fremdsprachen und bei
  einzelnen Wörtern ohne Satzkontext — genau der Fall bei Vokabelkarten.
- **Sie ist nicht steuerbar.** Kein Flüstern, kein langsames Buchstabieren,
  keine zwei Sprachen in einem Satz.

## Das eine Problem, das jede Lösung lösen muss

HAN CROCO ist eine **statische Seite auf GitHub Pages**. Es gibt keinen Server,
der einen API-Schlüssel geheim halten könnte. Ein Schlüssel in `index.html`
oder in `firebase-config.js` steht im öffentlichen Repository — jeder kann ihn
auslesen und auf deine Rechnung Sprache erzeugen.

*Anmerkung:* Beim Firebase-`apiKey` ist das unbedenklich, weil er nur das
Projekt benennt und die Absicherung in den Security Rules steckt. Bei einem
TTS-Schlüssel ist es das Gegenteil: Er **ist** die Bezahlung.

Daraus ergeben sich genau drei gangbare Wege.

---

## Weg 1 — Audio vorher erzeugen, in der App nur abspielen  ★ Empfehlung

**Idee:** Die Sprachdateien entstehen **nicht** im Browser, sondern einmalig auf
deinem Rechner. Ein kleines Skript liest den Kartenbestand (aus der
JSON-Sicherung oder direkt aus Firestore), erzeugt je Karte eine MP3, lädt sie
in **Firebase Storage** und trägt die Adresse an der Karte ein. Die App spielt
nur noch ab.

```
karte.audioFrage   = "gs://…/audio/<kartenId>-v.mp3"
karte.audioAntwort = "gs://…/audio/<kartenId>-r.mp3"
```

**Warum das der beste Weg ist**

| | |
|---|---|
| Schlüssel | bleibt auf deinem Rechner, kommt nie in den Browser |
| Kosten | einmalig je Karte, nicht je Abfrage — und eine Karte wird 20-mal gefragt |
| Offline | ja, sobald die Datei einmal geladen ist (Firebase Storage kann zwischenspeichern) |
| Wartezeit beim Lernen | keine — die Datei liegt schon da |
| Firebase-Tarif | Storage geht im **kostenlosen Spark-Tarif** |
| Alle drei Konten | jedes Konto bekommt seine eigenen Dateien, Regeln wie bei den Karten |

**Was zu bauen ist**

1. Ein Node-Skript `sprache-erzeugen.mjs` (läuft bei dir, nicht im Web):
   liest die Karten, überspringt alles, wofür schon eine Datei existiert,
   ruft die TTS-Schnittstelle auf, lädt hoch, schreibt die Adresse zurück.
2. In der App: `spracheAusgeben()` prüft, ob eine Audio-Adresse vorliegt →
   `new Audio(url).play()`, sonst wie bisher `speechSynthesis`.
   **Der Rückfall bleibt** — eine neu angelegte Karte hat noch keine Datei.
3. In `firestore.rules` und den Storage-Regeln: derselbe Zuschnitt wie bei den
   Karten (`users/{uid}/…`). Das ist die einzige Stelle, die eine
   Regeländerung braucht — und sie ist klein.
4. In der Diagnose: „N Karten ohne Sprachdatei" mit dem Hinweis, das Skript
   wieder laufen zu lassen.

**Aufwand:** ein Nachmittag für Skript und Abspielweg, plus die Storage-Regeln.

**Der Haken:** Du musst das Skript nach größeren Kartenzugängen von Hand
anstoßen. Für einen Bestand, der in Schüben wächst (CSV-Import), passt das gut.

---

## Weg 2 — Firebase Cloud Function als Türsteher

**Idee:** Eine kleine Cloud Function nimmt den Text entgegen, prüft über
Firebase Auth, dass eines der drei Konten fragt, ruft den TTS-Anbieter mit dem
Schlüssel auf (der als Secret in der Function liegt) und gibt die Audiodaten
zurück. Der Browser sieht den Schlüssel nie.

**Dafür**

- Auch neue Karten werden sofort gesprochen, ohne dass du etwas anstößt.
- Der Schlüssel ist sauber verwahrt und lässt sich jederzeit tauschen.
- Ein Zähler je Konto ist leicht einzubauen („höchstens 500 Abrufe/Tag").

**Dagegen**

- **Cloud Functions erfordern den Blaze-Tarif.** Der hat zwar ein großzügiges
  kostenloses Kontingent, verlangt aber eine hinterlegte Zahlungsmethode. Für
  drei Privatkonten ist das die eigentliche Hürde — bisher läuft alles im
  Spark-Tarif ohne jedes Kostenrisiko.
- Ohne Zwischenspeicher zahlst du **bei jeder Abfrage** neu. Eine Karte, die
  über die Jahre 20-mal drankommt, kostet dann das Zwanzigfache.
  → Deshalb: unbedingt mit Speicherung in Firebase Storage kombinieren, also
  faktisch Weg 1, nur automatisch. Dann ist es der beste Weg von allen — aber
  eben mit Blaze.
- Ohne Netz keine Sprache (bis die Datei einmal da war).

**Aufwand:** ein Tag, davon die Hälfte Firebase-Einrichtung.

---

## Weg 3 — Jedes Konto trägt seinen eigenen Schlüssel ein

**Idee:** In den Einstellungen ein Feld „Schlüssel für die Sprachausgabe". Der
Wert landet im privaten Firestore-Dokument des Kontos, nie im Repository. Die
App ruft den Anbieter direkt aus dem Browser auf.

**Dafür**

- Kein Server, keine Tarifänderung, in zwei Stunden gebaut.
- Jeder zahlt seinen eigenen Verbrauch und setzt sein eigenes Limit.

**Dagegen**

- Der Schlüssel liegt im Browser und geht bei jedem Abruf über die Leitung.
  Für drei private Konten mit einem Ausgabenlimit von 5 €/Monat ist das
  vertretbar — sauber ist es nicht.
- Drei Personen müssen sich je ein Konto beim Anbieter anlegen. Das ist in der
  Praxis der Punkt, an dem so etwas liegen bleibt.
- Wieder: ohne Zwischenspeicher zahlt jeder jede Wiederholung erneut.

**Fazit:** brauchbar als Versuchsaufbau, um zu hören, ob die Stimmen den
Unterschied überhaupt wert sind. Nicht als Dauerlösung.

---

## Welcher Anbieter?

Preise Stand August 2026, je **eine Million Zeichen**:

| Anbieter | Preis | Kostenlos je Monat | Bemerkung |
|---|---|---|---|
| **Google Cloud, Standard** | 4 $ | **4 Mio. Zeichen** | robotisch, aber gratis |
| **Google Cloud, Neural2** | 16 $ | **1 Mio. Zeichen** | gut, viele deutsche Stimmen |
| **Google Cloud, Chirp 3 HD** | 30 $ | **1 Mio. Zeichen** | derzeit die beste Google-Qualität |
| **OpenAI, tts-1** | 15 $ | — (5 $ Startguthaben) | sehr natürlich, wenige Stimmen |
| **OpenAI, gpt-4o-mini-tts** | ~15 $ | — | steuerbar über Anweisungen („langsam, deutlich") |
| **ElevenLabs, Flash/Turbo** | 50 $ | — | Spitzenqualität, Preis fürs Produzieren gedacht |
| **ElevenLabs, Multilingual** | 100 $ | — | dito |

**Rechnung für deinen Fall.** Nimm 2.000 Karten, beide Seiten gesprochen,
im Schnitt 40 Zeichen je Seite:

```
2.000 × 2 × 40 Zeichen = 160.000 Zeichen  (einmalig, mit Zwischenspeicher)
```

- Google Neural2 oder Chirp 3 HD: **0 €** — das liegt vollständig im
  kostenlosen Monatskontingent, und zwar sechsfach.
- OpenAI tts-1: rund **2,40 $**, einmalig.
- ElevenLabs Multilingual: rund **16 $**, einmalig.

Ohne Zwischenspeicher, also bei jedem Abruf neu, wird daraus über die Jahre
das Zwanzigfache — deshalb steht die Speicherung oben so weit vorn.

**Empfehlung: Google Cloud Text-to-Speech, Chirp 3 HD.**
Nicht weil es das beste Produkt am Markt wäre — ElevenLabs klingt besser —,
sondern weil es drei Dinge zusammenbringt, die hier zählen: Es läuft im
**selben Google-Projekt wie Firebase** (ein Konto weniger, eine Abrechnung
weniger), es hat ein **wiederkehrendes kostenloses Kontingent**, das deinen
gesamten Bestand um ein Vielfaches überschreitet, und es bietet **viele
deutsche und englische Stimmen**, sodass Frage- und Antwortseite verschieden
klingen können.

Wenn dir die Qualität nicht reicht: OpenAI `gpt-4o-mini-tts` ist der nächste
Schritt und erlaubt zusätzlich Anweisungen wie *„sprich langsam und deutlich,
wie für einen Sprachschüler"* — für Vokabeln ist das mehr wert als eine noch
schönere Stimme.

---

## Was die Sprachausgabe didaktisch bringen sollte

Nicht nur „hübscher vorlesen". Drei Dinge, die mit einer echten TTS-Stimme
gehen und mit der Browser-Stimme nicht:

1. **Verschiedene Stimmen für Frage und Antwort.** Bei einem
   Englisch-Deutsch-Kasten liest eine englische Stimme die englische Seite und
   eine deutsche die deutsche. Heute versucht eine Stimme beides — das ist der
   häufigste Grund, warum der Hörmodus unbrauchbar wirkt.
   *(Die Felder `sprache` und `spracheAntwort` gibt es je Kasten bereits.)*
2. **Langsam-Taste.** Zweiter Klick auf 🔊 spielt dieselbe Datei mit
   `playbackRate = 0.75` — kostet nichts extra, hilft beim Nachsprechen enorm.
3. **Diktat-Modus.** Ein neuer Lernmodus: Die Karte wird nur vorgelesen, die
   Antwort wird getippt. Das ist die härteste und wirksamste Abfrageform für
   Sprachen und passt in die vorhandene Modus-Mechanik (`MODI_ALLE`) hinein.

---

# Teil B — Was die App sonst besser machen würde

Sortiert nach dem, was ich für den größten Gewinn je Aufwand halte. Die
Einschätzungen sind meine; die Reihenfolge ist eine Meinung, keine Messung.

## Hoher Nutzen, kleiner Aufwand

**1. Schlagwörter sichtbar machen.**
Das Feld `tags` steckt schon im Datenmodell, wird beim Import mitgeführt und
sogar **von der Suche durchsucht** — aber es gibt keine Stelle, an der man es
befüllen kann. Ein Eingabefeld im Karteneditor, eine Zeile Filter über der
Kartenliste, und aus dem CSV-Dialog eine weitere zuordenbare Spalte. Das ist
die billigste noch offene Verbesserung im ganzen Projekt.

**2. Papierkorb für gelöschte Karten.**
Löschen ist die einzige Handlung, die sich nicht rückgängig machen lässt — und
die Rückfrage ist die einzige Bremse. Ein Feld `geloeschtAm` statt echtem
Löschen, ein Filter „Papierkorb" in der Kartenliste, automatisches Aufräumen
nach 30 Tagen. Danach ist keine Handlung in der App mehr endgültig.

**3. Urlaubs- und Krankheitsmodus.**
Wer zwei Wochen ausfällt, kommt zu 400 überfälligen Karten zurück, und der
Streak ist weg. Ein Schalter „Pause bis TT.MM." würde die Termine
mitverschieben statt sie auflaufen zu lassen, und den Streak einfrieren. Das
ist der Punkt, an dem Lernsysteme im echten Leben abgebrochen werden.

**4. Ein Wort zur Sicherung, das nicht ignoriert wird.**
Alle 30 Tage ein Hinweis auf dem Startbildschirm: „Letzte Sicherung vor 6
Wochen — jetzt herunterladen?", mit dem Knopf direkt daneben. Firestore
schützt nicht gegen einen versehentlich gelöschten Kasten.

## Hoher Nutzen, mittlerer Aufwand

**5. Bilder auf Karten.**
`KONZEPT.md` §7 nennt **Dual Coding** ausdrücklich als eine der drei belegt
wirksamen Maßnahmen — „Bild *und* Text auf derselben Karte". Als einziger
Punkt aus §7 ist er bis heute nicht umgesetzt. Umsetzung über Firebase
Storage, dasselbe Muster wie bei den Sprachdateien; ein Bildfeld im Editor,
Anzeige über der Frage. Für Anatomie, Karten, Grafiken, Formeln wäre das der
größte inhaltliche Sprung.

**6. Als App installierbar machen (PWA).**
Heute ist HAN CROCO eine Webseite im Browser-Tab. Ein `manifest.json` und ein
kleiner Service Worker machen daraus ein Symbol auf dem Startbildschirm, ohne
Adressleiste, mit eigenem Startbild — und lösen nebenbei ein echtes Problem:
Beim allerersten Start braucht die App Netz, weil Firebase-SDK und ts-fsrs von
fremden Servern kommen. Ein Service Worker legt beides ab, danach startet sie
auch im Flugzeug. Für ein Werkzeug, das täglich auf dem Handy benutzt wird,
ist das der spürbarste Unterschied im Alltag.

**7. FSRS-Parameter aus den eigenen Daten optimieren.**
`KONZEPT.md` §4.1 sieht das ab etwa 1.000 Wiederholungen vor und verschiebt es
ausdrücklich. Der Zeitpunkt rückt näher: `ts-fsrs` bringt die Optimierung mit,
die Daten dafür (`reviews`, `history`) werden bereits geschrieben. Erwartbarer
Gewinn: 10–20 % weniger Wiederholungen bei gleicher Behaltensleistung. Wichtig
dabei: einmal rechnen, das Ergebnis zeigen, den Nutzer entscheiden lassen —
und einen Weg zurück anbieten.

**8. Karten aus einem Text vorschlagen lassen.**
Der größte Zeitfresser ist nicht das Lernen, sondern das Anlegen. Ein Feld
„Text einfügen" und ein Sprachmodell macht daraus Frage-Antwort-Paare, die man
vor der Übernahme durchsieht und einzeln abhakt. Technisch dasselbe Problem
wie bei der Sprachausgabe (der Schlüssel), also derselbe Weg — und deshalb
sinnvollerweise **danach**, wenn der Weg einmal steht.
Wichtig: nie ungeprüft übernehmen. Eine falsche Karte, 20-mal wiederholt, ist
teurer als zehn Karten, die man selbst tippt.

## Nützlich, aber nicht dringend

**9. Der Tagesziel-Ring soll die gemessene Zeit einrechnen.**
Offene Empfehlung aus der Stufe-4-Prüfung: Heute führt der Ring Minuten *oder*
Karten getrennt. Mit `gemesseneSekundenJeKarte()` ließe sich beides in eine
ehrliche Zahl bringen („noch etwa 7 Minuten").

**10. Statistik nach Quellkarten statt nach Abfragen.**
Wer 200 Vokabeln in beide Richtungen lernt, sieht heute 400. Beide Zahlen sind
richtig, aber „200 Karten, 400 Abfragen" wäre verständlicher.

**11. Abfragemodus an die Reife der Karte koppeln.**
Offene Empfehlung aus der Stufe-3-Prüfung: Tippen, solange die Stabilität klein
ist, Aufdecken danach. Nicht übernommen worden, weil KONZEPT §7 ausdrücklich
Formatvielfalt fordert. Bleibt eine Option, falls die Terminierung im Alltag
unruhig wirkt.

**12. Druckansicht.**
Eine Seite, die einen Kasten als Karteikarten zum Ausschneiden ausgibt — für
die Prüfungsvorbereitung am Küchentisch, ohne Bildschirm. Passt zum Namen.

**13. Zwei Kleinigkeiten aus der letzten Prüfrunde.**
Der Streak wächst um 2, wenn eine Sitzung über 04:00 Uhr hinausläuft, und der
Tagesdeckel für neue Karten beginnt dabei von vorn. Beides ist streng genommen
richtig (es sind zwei Lerntage), wirkt aber merkwürdig. Falls es stört: die
Sitzung könnte ihren Lerntag beim Start festhalten.

---

## Was ich nicht vorschlagen würde

- **Karten mit anderen teilen.** Das Datenmodell ist bewusst streng je Konto
  geschnitten (`KONZEPT.md` §3: keine Querzugriffe). Ein gemeinsamer
  Kartenbestand bricht die Security Rules auf — den einen Punkt, an dem ein
  Fehler alle drei Konten aussperrt.
- **Eine Lerntyp-Auswahl.** `KONZEPT.md` §7 lehnt sie mit Begründung ab, und
  die Begründung stimmt: In kontrollierten Studien hat sich die Annahme nicht
  bestätigt.
- **Noch mehr Statistik.** Es gibt bereits Wochenbericht, Zeitfresser,
  Fächerverteilung, Prüfungsplaner und Abzeichen. Mehr Zahlen machen die App
  nicht besser, sondern nur langsamer zu lesen.

---

## Wenn ich drei Dinge auswählen müsste

1. **Sprachausgabe nach Weg 1** mit Google Chirp 3 HD, verschiedene Stimmen für
   Frage und Antwort, dazu die Langsam-Taste. Kostet nichts und macht den
   Hörmodus zum ersten Mal wirklich brauchbar.
2. **Als App installierbar machen (PWA).** Ein Tag Arbeit, spürbar jeden Tag.
3. **Schlagwörter und Papierkorb.** Zusammen ein halber Tag, und danach ist
   nichts in der App mehr unwiderruflich.
