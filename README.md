# HAN CROCO

Private Lernkartei für drei Konten. Statische Seite auf GitHub Pages,
Daten in Firebase Firestore, Anmeldung über Firebase Auth.

Der Name erinnert an den physischen Karteikasten, der dieser App vorausging.
Die laufende Programmversion steht auf dem Anmeldebildschirm, unten in der
Seitenleiste und in der Diagnose — bei Rückfragen ist sie die erste Angabe,
die weiterhilft. Dieser Stand ist **Version 6.1**.

Stufe 1 legte das Fundament: Anmeldung, Datenmodell, Security Rules,
Offline-Betrieb, Import des Altbestands — funktionsgleich zur
Vorgängerversion.

Stufe 6 (dieser Stand) schließt die andere Hälfte des Lernens: die
**Lernbox**. Bis Stufe 5 konnte HAN CROCO nur den *Erhalt* — FSRS bestimmt
den richtigen Zeitpunkt. Der *Erwerb* fehlte: Eine Karte, die man nicht
wusste, wurde bloß neu terminiert und kam in derselben Sitzung nie wieder.
Die Lernbox ist der Stapel, den man früher zur Seite gelegt hat. Siehe
„Lernbox" weiter unten.

Stufe 5 brachte die **KI-Sprachausgabe** über Google Chirp 3 HD
mit vorproduzierten Aufnahmen, einen **Karteneditor im Anki-Stil** mit
Auszeichnung, den Zusatzfeldern *Extra* und *Merker*, Schlagwörtern und
Vorschau — und damit erstmals eine Positivliste für Markup statt „alles wird
escaped". Siehe „Karten schreiben" und „Sprachausgabe" weiter unten.

Stufe 2 brachte den eigentlichen Zeitgewinn: **FSRS** als
Standard-Scheduler statt fester Fachintervalle, einen **Retention-Regler**,
einen **Klassik-Modus** als jederzeit umschaltbare Rückfallebene, ein
**Tagespensum** mit Deckel für neue Karten, und eine neue Oberfläche
(Seitenleiste/Bottom-Navigation, Startbildschirm mit Fortschrittsring) nach
`KONZEPT.md` §8. Bestehende Konten wechseln beim ersten Öffnen automatisch
auf FSRS — bereits vergebene Termine bleiben dabei unangetastet, siehe
„Migration Stufe 1 → Stufe 2" weiter unten.

Stufe 3 (dieser Stand) bringt die **Lernmodi**: Aufdecken, Tippen mit
Tippfehlertoleranz, Multiple Choice, Hören über die Sprachausgabe des
Browsers und **Lückentexte**. Modi werden **pro Kasten** eingestellt und
lassen sich kombinieren. Dazu kommen die **Abfragerichtungen** vorwärts,
rückwärts und beide. Alles Bestehende bleibt unverändert: Wer nichts
umstellt, lernt weiter wie bisher im Modus „Aufdecken".

Stufe 4 ist der Feinschliff: ein **Prüfungsplaner** je Kasten,
**Problemkarten**, die sich selbst aus dem Verkehr ziehen, ein
**Karten-Check** beim Anlegen, ein **Wochenbericht** und die
**Zeitauswertung** in der Statistik. Auch hier gilt: Ohne Zutun ändert sich
nichts — der Prüfungsplaner greift nur mit gesetztem Termin.

Version 4.2 kommt aus dem Betrieb: ein neuer **CSV-Import mit Vorschau**, eine
**Aufräumhilfe** für einen verunglückten Import, eine **persönliche Begrüßung**
und **Abzeichen**, die sich für alle drei Konten gemeinsam vorgeben lassen.
Siehe „CSV einlesen", „Aufräumen nach einem verunglückten Import",
„Persönliche Anrede" und „Abzeichen".

Version 4.3 (dieser Stand) bringt keine neuen Funktionen, sondern die Befunde
einer weiteren Prüfrunde: Die JSON-Sicherung enthält jetzt den **vollständigen**
Lernverlauf statt der letzten 70 Tage, ein fremder Import überschreibt den
**Streak** nicht mehr, eine laufende **Sitzung überlebt den Seitenwechsel**, und
eine Karte mit einem Abfragedatum aus der Zukunft (verstellte Uhr, Zeitzone,
geänderte Tagesgrenze) bleibt lernbar.

**Dateien**

| Datei | Zweck |
|---|---|
| `index.html` | die komplette App — HTML, CSS, JavaScript in einer Datei |
| `firebase-config.js` | Zugangsdaten des Firebase-Projekts, die einzige Datei mit projektspezifischen Werten — optional auch der gemeinsame Abzeichensatz |
| `firestore.rules` | Security Rules, in die Firebase-Konsole zu kopieren |
| `README.md` | diese Anleitung |

`index.html` und `firebase-config.js` müssen im selben Ordner liegen.
`firestore.rules` und `README.md` werden von der App nicht gelesen —
sie gehören trotzdem ins Repo, damit die Regeln nachvollziehbar bleiben.

---

## Schritt 0 — Altbestand sichern. Zuerst. Wirklich.

Die neue `index.html` ersetzt die alte App im Repo `gewe77/Lernkartei`.
Bevor du irgendetwas hochlädst:

1. https://gewe77.github.io/Lernkartei/ im **gewohnten Browser** öffnen —
   in dem, in dem du bisher gelernt hast.
2. Einstellungen → **JSON-Export** → Datei an einen sicheren Ort legen.
3. Zur Sicherheit zusätzlich den **Referenz-Dump** kopieren und in eine
   Textdatei sichern.

Die Altdaten liegen im `localStorage` deines Browsers, nicht auf dem Server.
Sie überstehen das Überschreiben der `index.html` problemlos — die App liest
sie später direkt von dort. Weg sind sie nur, wenn du Browserdaten löschst,
den Browser wechselst oder an einem anderen Gerät sitzt. Deshalb: erst
exportieren, dann umstellen.

---

## Schritt 1 — Firebase-Projekt anlegen

1. https://console.firebase.google.com öffnen, **Projekt hinzufügen**.
2. Name frei wählen, z. B. `lernkartei`.
3. Google Analytics: **aus**. Wird nicht gebraucht.

## Schritt 2 — Web-App registrieren und Konfiguration übertragen

1. Im Projekt auf das **Web-Symbol `</>`** klicken.
2. Spitzname z. B. `Lernkartei Web`. **Firebase Hosting nicht** ankreuzen —
   gehostet wird auf GitHub Pages.
3. Firebase zeigt einen Block `const firebaseConfig = { … }`.
4. Diese Werte in `firebase-config.js` eintragen — Feld für Feld, ohne die
   Anführungszeichen zu verlieren.

Später wiederfindbar unter *Zahnrad → Projekteinstellungen → Meine Apps*.

## Schritt 3 — Anmeldung einrichten

1. **Authentication → Get started**.
2. Sign-in method → **E-Mail/Passwort** aktivieren.
   „E-Mail-Link (passwortlose Anmeldung)" bleibt **aus**.
3. **Selbstregistrierung abschalten** — das ist der wichtige Teil:
   *Authentication → Settings → User actions* (deutsch: *Nutzeraktionen*) →
   den Haken bei **„Erstellen (Registrierung) aktivieren"** entfernen.
   Ohne diesen Schritt könnte sich jeder, der die Seite findet, selbst ein
   Konto anlegen. Die App bietet keine Registrierung an — aber die
   Firebase-Schnittstelle täte es ohne diese Einstellung sehr wohl.
4. **Users → Add user**: die drei Konten mit E-Mail und Startpasswort anlegen.

Die App hat bewusst keine Nutzerverwaltung. Konten entstehen und verschwinden
ausschließlich in der Konsole.

## Schritt 4 — Firestore anlegen

1. **Firestore Database → Datenbank erstellen**.
2. **Produktionsmodus** wählen (nicht Testmodus — der macht die Daten für
   30 Tage für alle lesbar).
3. Standort: **`eur3` oder `europe-west3` (Frankfurt)**.
   Der Standort lässt sich später **nicht** ändern.

## Schritt 5 — Security Rules veröffentlichen

1. **Firestore Database → Regeln**.
2. Den gesamten Inhalt von `firestore.rules` einfügen, vorhandenen Text ersetzen.
3. **Veröffentlichen**.

Ohne diesen Schritt lehnt Firestore im Produktionsmodus jeden Zugriff ab und
die App bleibt beim Laden hängen. Die Regeln erlauben jedem Konto genau den
eigenen Pfad `users/{uid}/…` und sonst nichts.

## Schritt 6 — Domain freigeben

**Authentication → Settings → Authorized domains → Domain hinzufügen:**

```
gewe77.github.io
```

Fehlt der Eintrag, scheitert die Anmeldung mit `auth/unauthorized-domain`.

## Schritt 7 — Dateien ins Repo

1. `index.html`, `firebase-config.js`, `firestore.rules`, `README.md` ins
   Repo `gewe77/Lernkartei` legen — die alte `index.html` wird ersetzt.
   Ab Stufe 5 kommen `audio/` (mit `manifest.json`) und `werkzeuge/` dazu.
2. **Settings → Pages**: Source *Deploy from a branch*, Branch `main`, Ordner `/ (root)`.
3. Ein bis zwei Minuten warten, dann https://gewe77.github.io/Lernkartei/ öffnen.

Kommt noch die alte Version: Seite mit `Strg`+`Umschalt`+`R` neu laden.
GitHub Pages und der Browser halten die alte Datei eine Weile fest.

## Schritt 8 — Anmelden und Altbestand übernehmen

1. Mit einem der drei Konten anmelden. Beim ersten Start legt die App einen
   Beispielkasten mit drei Karten an.
2. **Einstellungen → Altbestand übernehmen → Aus diesem Browser.**
   Die App findet die Daten der Vorgängerversion selbst, weil sie unter
   derselben Web-Adresse liegen. Es erscheint eine Übersicht mit der Zahl der
   gefundenen Kästen und Karten.
3. **Zusammenführen** wählen (Standard) und übernehmen.
4. Falls dort nichts gefunden wird — anderer Browser, anderes Gerät,
   Browserdaten gelöscht: **Aus JSON-Datei** und die Sicherung aus Schritt 0
   auswählen.
5. Danach: Statistik öffnen und prüfen, ob Kartenzahl und Fächerverteilung
   zum alten Stand passen.

Der Import ist beliebig oft wiederholbar. Beim Zusammenführen werden Karten,
die schon da sind, an ihrer Kennung erkannt und übersprungen — es entstehen
keine Dubletten.

---

## Bedienung

| Bereich | Inhalt |
|---|---|
| **Lernen** | Kästen auswählen, Umfang wählen, Sitzung starten |
| **Kästen** | anlegen, umbenennen, einfärben, **Lernmodi, Abfragerichtung und Prüfungstermin festlegen**, löschen, als CSV sichern |
| **Karten** | anlegen (Frage/Antwort oder **Lückentext**), bearbeiten, verschieben, löschen, Volltextsuche, **Filter** (fällig / neu / Problemkarten / ruhend) |
| **Statistik** | **Wochenbericht**, Fächerverteilung, 14 Tage Rückblick, 7 Tage Vorschau, **anstehende Prüfungen**, **Zeitfresser**, Streak, pro Kasten |
| **Einstellungen** | Konto, Darstellung, Lernmethode, Tagespensum, **Problemkarten-Grenze**, Intervalle, Import/Export, Diagnose |

**Tastatur während der Sitzung**

| Taste | Wirkung |
|---|---|
| `Leertaste` | Antwort aufdecken (nicht im Tipp- und Auswahlmodus) |
| `1` – `4` | bewerten |
| `A` – `D` | Vorgabe im Multiple-Choice-Modus wählen |
| `Enter` | im Tippmodus prüfen; danach den Bewertungsvorschlag übernehmen |
| `Esc` | Sitzung beenden, Fortschritt bleibt gespeichert |

---

## Lernmodi

Einzustellen unter **Kästen → Bearbeiten**, pro Kasten und beliebig
kombinierbar. Sind mehrere Modi aktiv, wechseln sie sich kartenweise ab —
dieselbe Karte wird also mal getippt, mal aufgedeckt abgefragt. Das ist
Absicht: Formatvielfalt festigt besser als immer dieselbe Abfrageform.

| Modus | Verhalten |
|---|---|
| **Aufdecken** | Der Grundmodus: Frage lesen, Antwort aufdecken, selbst mit 1–4 bewerten. |
| **Tippen** | Antwort eintippen, `Enter`. Die App wertet aus und schlägt eine Bewertung vor — entscheiden tust weiterhin du. Leer lassen und `Enter` zeigt die Antwort, ohne zu werten. |
| **Multiple Choice** | Vier Vorgaben, drei davon aus demselben Kasten. Nur bei Karten, die **noch nie** dran waren; danach greift automatisch Tippen bzw. Aufdecken. Hat der Kasten weniger als vier verschiedene Antworten, fällt der Modus still auf Aufdecken zurück. |
| **Hören** | Frage und Antwort werden vorgelesen, **Sprache je Seite** pro Kasten einstellbar. Ergänzt die anderen Modi. **Allein gewählt** bleibt die Frage verdeckt und wird nur gesprochen — der eigentliche Hörmodus. Der 🔊-Knopf wiederholt. |

**Tippfehlertoleranz.** Groß-/Kleinschreibung, Satzzeichen und doppelte
Leerzeichen sind egal. **Akzente und ß werden eingeebnet**: `hotel` zählt als
`hôtel`, `Strasse` als `Straße`, `cafe` als `café` — auf einer Handytastatur
tippt das sonst kaum jemand richtig. `a / b`, `a; b` und `a oder b` gelten
als gleichwertige Alternativen, Klammerzusätze sind optional.

Ein echter Vertipper — ein falsches Zeichen ab sechs Zeichen Länge, zwei ab
zwölf — führt zur Rückfrage *„Fast richtig — als gewusst werten?"* statt
gleich zu „nicht gewusst". Kurze Antworten bis fünf Zeichen bekommen keine
Toleranz; dort wäre jeder zweite Tippfehler schon ein anderes Wort.

Nach der Auswertung liegt die vorgeschlagene Bewertung auf `Enter` — aber
**nur bei richtig und fast richtig**. Bei einer falschen Antwort wird nichts
vorbelegt: Die 1 wirft eine reife Karte um Monate zurück, und wer gerade
getippt und `Enter` gedrückt hat, drückt gern noch einmal.

**Ohne Sprachausgabe.** Kann der Browser nicht sprechen, sagt das die
Diagnose in den Einstellungen und ein Hinweis beim Lernen; die Fragen werden
dann angezeigt statt vorgelesen, die App läuft normal weiter.

**Geschwisterabfragen werden zurückgestellt.** Die Lücken eines Satzes und
die beiden Richtungen einer Vokabel kommen nie in derselben Sitzung dran —
die erste verriete sonst die Antwort der übrigen (ein Lückentext zeigt die
anderen Lücken im Klartext). Sie erscheinen beim nächsten Mal; der
Abschlussbildschirm sagt, wie viele zurückgestellt wurden.

---

## Lückentexte

Kartentyp **Lückentext** im Karteneditor. Schreibweise:

```
Die Hauptstadt von {{c1::Japan}} ist {{c2::Tokio}}.
Das Wasserstoffatom hat {{c1::ein::Anzahl}} Elektron.
```

Der Knopf *Lücke aus Auswahl* markiert den ausgewählten Text als Lücke. Der
optionale dritte Teil (`::Anzahl`) erscheint als Hinweis in der Lücke.

**Jede Lücke wird eigenständig terminiert.** Aus einem Satz mit drei Lücken
werden drei Abfragen mit je eigenem Termin und eigenem Fach — genau die
Lücke, die noch sitzt, kommt dann seltener. Beim Bearbeiten bleiben die
Termine der unveränderten Lücken erhalten; wird eine Lücke gestrichen,
fragt die App vorher nach.

---

## Abfragerichtungen

Ebenfalls pro Kasten unter **Kästen → Bearbeiten**:

| Richtung | Bedeutung |
|---|---|
| **Vorwärts** | Frage → Antwort (Voreinstellung) |
| **Rückwärts** | Antwort → Frage |
| **Beide** | beides, als **zwei getrennt terminierte Karten** |

„Beide" ist bewusst kein Umschalter, der dieselbe Karte mal so, mal so
zeigt: Etwas aktiv produzieren zu können (deutsch → englisch) ist deutlich
schwerer als es wiederzuerkennen. Beide Richtungen brauchen deshalb eigene
Termine. Bedenke dabei: Auf Dauer verdoppelt das die tägliche
Wiederholungsmenge.

**Jede Änderung der Richtung wird vorher angekündigt**, weil sie tief in den
Bestand eingreift:

- *auf „beide"* — zu jeder Karte kommt eine zweite Abfrage dazu, sofort fällig.
- *weg von „beide"* — je Karte entfällt eine Abfrage. Der Lernstand der
  Richtung, die bleibt, wird **übernommen**.
- *vorwärts ↔ rückwärts* — es wird nichts gelöscht, aber jede Karte behält
  ihren Termin, obwohl die neue Frageform noch nie geübt wurde. Rechne mit
  einigen Durchfällern in der nächsten Sitzung.

Lückentexte sind davon ausgenommen — dort zählen die Lücken.

**Sprache je Seite.** Für den Hörmodus lassen sich Frage- und Antwortseite
getrennt einstellen. In einem Vokabelkasten Englisch/Deutsch liest sonst
eine englische Stimme die deutschen Wörter — im Hörmodus ausgerechnet das,
worauf es ankommt.

**Abfragen abgleichen.** Nach einem Import oder wenn etwas nicht zu stimmen
scheint, prüft *Einstellungen → Diagnose → Abfragen abgleichen*, ob jede
Karte genau die Abfragen hat, die ihr Kasten vorsieht, und stellt das her.
Der Aufruf ist gefahrlos wiederholbar.

---

## Prüfungstermin

**Kästen → Bearbeiten → Prüfungstermin.** Ist ein Termin gesetzt, passiert
zweierlei:

1. **Einmalig beim Setzen** werden alle Fälligkeiten, die hinter dem Termin
   lägen, in die Tage davor vorgezogen — verteilt über bis zu eine Woche,
   damit sich nichts auf einen Tag türmt. Ohne diesen Schritt käme gerade
   der gut sitzende Teil des Bestands bis zur Prüfung kein einziges Mal dran.
2. **Bei jeder Bewertung** wird derselbe Deckel angelegt. In den letzten
   beiden Tagen greift er nicht mehr — die Karte war ja gerade dran.

Auf dem Startbildschirm steht dann, wie viele Abfragen bis zum Termin
anfallen, wie viel das pro Tag bedeutet und ob das zu schaffen ist. Die
Schätzung rechnet mit den **tatsächlich gemessenen Sekunden pro Karte**
(sobald genug Messungen vorliegen) und berücksichtigt, dass eine Karte in
drei Wochen mehrfach drankommt — nicht nur einmal.

„Kaum zu schaffen" erscheint auch dann, wenn es rechnerisch unmöglich ist:
mehr Lücken an einer Karte als Tage übrig, mehr Abfragen pro Tag als es
Karten gibt, oder mehr neue Karten als der Tagesdeckel bis dahin durchlässt.

Solange ein Termin gesetzt ist, zählt vor der Prüfung auch Liegengebliebenes
zum Umfang „Nur heute" — ein verpasster Tag darf die vorgezogenen Karten
nicht bis nach der Prüfung aus dem Blick nehmen.

**Nach der Prüfung** meldet der Startbildschirm den abgelaufenen Termin mit
einem Knopf zum Entfernen. Bleibt er stehen, werden die Termine weiter
vorgezogen.

---

## Problemkarten

Eine Karte, die immer wieder durchfällt, kostet unverhältnismäßig viel Zeit
und bringt nichts. Ab **7 Aussetzern** (einstellbar, 3–20) wird sie deshalb
automatisch ausgesetzt und landet unter *Karten → Problemkarten*.

- Gezählt wird **seit dem letzten Wiederaufnehmen**, nicht über die ganze
  Lebenszeit der Karte.
- Ausgelöst wird das nur durch einen **neuen** Aussetzer — eine gute
  Bewertung setzt nie eine Karte aus, egal wie oft sie früher durchfiel.
- Ruhen gilt für **alle Abfragen** einer Karte.

Im Karteneditor steht dann, was erfahrungsgemäß hilft: die Frage eindeutiger
stellen, eine zu lange Antwort aufteilen, eine Eselsbrücke in die Notiz
schreiben, oder prüfen, ob sich die Karte mit einer anderen verwechselt.
*Wieder aufnehmen* hebt Kennzeichnung und Ruhen auf; *Zurücksetzen*
zusätzlich den Lernstand — sinnvoll, wenn die Karte umformuliert wurde.
Mehrere Karten gleichzeitig gehen über die Auswahlkästchen in der Liste.

Die Grenze wirkt **rückwirkend**: Wer sie senkt, bekommt vorher gesagt, wie
viele Karten dadurch betroffen wären.

---

## Karten-Check

Beim Speichern prüft die App die Antwort auf zwei Muster, die viel Zeit
kosten und schlecht behalten werden:

- **mehr als 28 Wörter** — bei langen Antworten bleibt beim Abfragen unklar,
  wie viel genau gefragt ist;
- **getarnte Aufzählungen** — mehrere kurze Zeilen, Zeilen mit
  Aufzählungszeichen, oder eine Zeile der Form `Einleitung: a, b, c`.

Der Hinweis erscheint **nach** dem Speichern und blockiert nichts; er kommt
auch nicht wieder, wenn nur die Notiz geändert wurde. Bei einer Aufzählung
bietet er an, die Karte **in einen Lückentext umzuwandeln** — jeder Punkt
wird dann einzeln abgefragt und einzeln terminiert. Eine Einleitungszeile mit
Doppelpunkt bleibt dabei stehen und wird nicht selbst zur Lücke. Die
ursprüngliche Antwort bleibt im Feld „Erläuterung" erhalten.

Zwei Sätze auf zwei Zeilen gelten bewusst **nicht** als Aufzählung — daraus
Lücken zu machen hieße, ganze Sätze wörtlich abzufragen.

---

## Wochenbericht und Zeitauswertung

Die Statistik zeigt:

- **Die Woche im Rückblick** — Abfragen, Minuten, Sekunden je Abfrage und
  gelernte Tage, jeweils im Vergleich zur Vorwoche, mit Balken je Wochentag
  und dem besten Tag.
- **Zeitfresser** — die Karten mit der höchsten durchschnittlichen
  Bearbeitungszeit, ab zwei gemessenen Abfragen. Wer hier viel Zeit lässt,
  hat meist eine zu umfangreiche oder unklare Karte.
- **Pro Kasten** — zusätzlich Ø Zeit je Karte und Minuten der laufenden Woche.

Gemessen wird ab Stufe 4; ältere Wiederholungen fließen nicht in die
Durchschnitte ein (sonst stünde dort dauerhaft „0 s"). Für Tage vor Stufe 4
wird die Zeit je Kasten aus dem Tagesanteil geschätzt. Die Messung deckelt
bei drei Minuten je Karte und startet nach einer Unterbrechung neu — ein
Telefonat mitten in der Sitzung zählt nicht als Lernzeit.

**Bewertung und Terminierung**

Die Bewertungsskala 1–4 ist in beiden Modi gleich, die Terminierung dahinter
unterscheidet sich (Einstellungen → Lernmethode):

- **FSRS-Modus (Standard).** Jede Karte hat eine eigene, aus ihrer
  Vergessenskurve berechnete „Stabilität". 1 = nicht gewusst, 2 = schwer,
  3 = gewusst, 4 = sehr leicht fließen direkt als Bewertung in `ts-fsrs`
  (`Rating.Again/Hard/Good/Easy`) ein; der nächste Termin ergibt sich aus
  Stabilität, Schwierigkeit und der gewünschten Behaltensleistung
  (Retention-Regler, siehe unten). Neue Karten durchlaufen einen kurzen,
  gleichentags abschließbaren Lernschritt (10 Minuten), bevor sie einen
  mehrtägigen Termin bekommen.
- **Klassik-Modus.** Feste Fachintervalle wie in der Vorgängerversion:

  | Bewertung | Fach | nächster Termin |
  |---|---|---|
  | 1 — nicht gewusst | zurück auf 1 | Intervall von Fach 1 |
  | 2 — schwer | bleibt | Intervall des aktuellen Fachs |
  | 3 — gewusst | +1 | Intervall des neuen Fachs |
  | 4 — sehr leicht | +2 | Intervall des neuen Fachs |

  Voreinstellung der zwölf Fächer, in Tagen:
  `1 · 3 · 7 · 14 · 21 · 30 · 45 · 60 · 90 · 120 · 180 · 365`.
  In den Einstellungen frei änderbar; ein Fach darf kein kürzeres Intervall
  haben als das davor. Diese Tabelle wirkt **nur** im Klassik-Modus.

Das Umschalten zwischen beiden Modi verwirft keine Daten — Termine und
Bewertungsverlauf bleiben erhalten, nur die künftige Terminierung ändert sich.

**Fach-Anzeige.** Auch im FSRS-Modus zeigt jede Karte weiterhin ein Fach
1–12 (Karteikarten-Metapher bleibt vertraut) — dort aber als reine Ableitung
aus der Stabilität: Fach = Anzahl der festen Schwellen
`1/3/7/14/21/30/45/60/90/120/180/365` Tage, die überschritten sind, plus 1.
Diese Schwellen sind fix und unabhängig von den (nur im Klassik-Modus
wirksamen) Intervallen in den Einstellungen.

**Retention-Regler.** Einstellungen → Lernmethode, 80–95 %, Voreinstellung
88 %. Höher = seltener vergessen, aber mehr Wiederholungen; darüber steht
laufend eine Abschätzung „≈ X Wiederholungen/Tag" für den aktuellen
Kartenbestand, ab 93 % zusätzlich ein Warnhinweis.

**Tagespensum.** Einstellungen → Tagespensum: ein Tagesziel in Minuten oder
Karten (für den Fortschrittsring auf dem Startbildschirm) und ein Deckel für
neue Karten pro Tag (5–50, Voreinstellung 20). Der Deckel begrenzt nur
**neue** Karten — bereits fällige/wiederkehrende Karten sind nie betroffen.

**Umfang der Sitzung**

*Nur heute fällig* nimmt Karten, deren Termin heute ist — **und alles, was
noch nie dran war**, auch wenn es schon älter ist. Eine neue Karte hat kein
Intervall verpasst; ohne diese Ausnahme wäre sie am Tag nach dem Anlegen aus
diesem Umfang verschwunden.

*Alle fälligen* nimmt zusätzlich alles Überfällige. Neben beiden Optionen
steht die jeweilige Kartenzahl. Ist heute planmäßig nichts dran, liegen aber
überfällige Karten herum, bietet der Startknopf sie direkt an — man muss den
Umfang nicht selbst umstellen.

**Tagesgrenze**

Ein Lerntag beginnt um **04:00 Uhr**, nicht um Mitternacht. Wer um halb zwei
nachts lernt, arbeitet noch den Vortag ab. Änderbar über
`TAGESGRENZE_STUNDE` in `firebase-config.js`.

---

## Karten schreiben (Stufe 5)

Der Karteneditor ist am Anki-Eingabefenster orientiert. Fünf Felder, eine
Werkzeugleiste, Schlagwörter — und ein Umschalter **Bearbeiten / Vorschau**.

| Feld | Wo es auftaucht |
|---|---|
| **Frage** | Vorderseite |
| **Antwort** | Rückseite |
| **Extra** | unter der Antwort, abgesetzt — Beispielsatz, Herleitung, Merkhilfe |
| **Merker** | oben auf **beiden** Seiten, als farbige Marke |
| **Notiz** | nur für dich, klein unter der Antwort |

**Merker statt Extra — wann was?** Der Merker steht schon auf der
Vorderseite. Das ist genau dann richtig, wenn die Information beim
*Beantworten* hilft („unregelmäßig", „Akkusativ", „Kapitel 3"). Extra steht
erst hinten und gehört zu allem, was die Antwort *erklärt* — sonst verrät es
die Lösung.

**Formatieren.** Fett, kursiv, unterstrichen, durchgestrichen, hoch- und
tiefgestellt, Aufzählung, Nummerierung, Trennlinie, Textfarbe, Marker.
`Strg`+`B`, `Strg`+`I` und `Strg`+`U` gehen direkt. Der Knopf `</>` an jedem
Feld zeigt den HTML-Quelltext und lässt ihn von Hand bearbeiten.

Eingefügter Text aus Word, einer Webseite oder Anki wird beim Einfügen
sofort auf das Erlaubte eingedampft — Schriftarten, Größen und Farbtöne aus
der Quelle verschwinden also, der Text und seine Auszeichnung bleiben.

**Vorschau.** Zeigt Vorder- und Rückseite so, wie sie beim Lernen aussehen —
durch dieselben Anzeigefunktionen, nicht durch eine Nachbildung. Bei
Lückentexten wird die erste Lücke stellvertretend gezeigt.

**Schlagwörter.** Eingeben und `Enter` oder Komma drücken. Die Suche auf der
Kartenseite findet sie mit. Höchstens 30 je Karte. Aus einem Anki-Export
werden auch leerzeichengetrennte Schlagwörter übernommen.

**Kartentyp wechseln.** Beim Umschalten zwischen *Frage und Antwort* und
*Lückentext* wird der Text übernommen, solange das Zielfeld noch leer ist —
überschrieben wird nie. Extra und Merker bleiben an der Karte, auch wenn der
Lückentext-Modus sie nicht anzeigt.

**Größe.** Eine Karte darf höchstens 200.000 Zeichen über alle Felder
haben. Das ist absichtlich weit unter der Firestore-Grenze von 1 MB je
Dokument: Lernstand, Feldnamen und die Rückwärtskopie kommen noch obendrauf.
Wer darüber liegt, bekommt eine Meldung — vorher schrieb die App klaglos
darüber hinaus, der Server lehnte ab, und danach zeigte die Kartenliste
dauerhaft etwas anderes an, als gespeichert war.

**Lautschrift.** Unter „Aussprache vorgeben" lässt sich je Seite eine
IPA-Lautschrift hinterlegen. Sie wird an die KI-Stimme durchgereicht und
erzwingt dort die Aussprache — nur nötig, wenn ein Wort falsch betont wird.

**Lückentexte bleiben unformatiert.** Eine Auszeichnung mitten in
`{{c1::…}}` würde die Lücke zerschneiden; die Lösung stünde dann offen in der
Abfrage. Der Lückentext-Modus hat deshalb weiterhin einfache Textfelder.

### Was mit dem Markup passiert

Bis Stufe 4 galt: Jeder Kartentext wird beim Anzeigen escaped. Das war die
Absicherung gegen fremdes Markup. Mit dem neuen Editor gilt stattdessen eine
**Positivliste** — durchgelassen wird nur, was darauf steht:

`b strong i em u s strike del sub sup mark code br hr p div ul ol li`
sowie `span` mit `style` und `font` mit `color`.

Bei `style` wiederum nur `color`, `background-color`, `font-weight`,
`font-style` und `text-decoration`, und auch dort nichts mit Klammern —
das schließt `url()` und Verwandtes aus. Kein `script`, kein `iframe`, kein
`img`, kein `href`, kein `on…`-Attribut.

Alles andere verliert sein Element, **behält aber seinen Text**. Wer ein
`<article>` einfügt, verliert die Hülle, nicht den Inhalt.

Gefiltert wird an **zwei** Stellen: beim Speichern und beim Anzeigen.
Doppelt, weil ein Datensatz auch aus einem Import oder von einem anderen
Gerät stammen kann, ohne je durch diesen Editor gelaufen zu sein.

Jede Karte trägt ein Feld `format`. `text` heißt „Klartext, wird escaped"
(alles vor Stufe 5 und alles Importierte), `html` heißt „läuft durch die
Positivliste". Eine alte Karte mit `a < b` im Text bleibt damit lesbar,
statt beim ersten Anzeigen zu zerbrechen. Ein Import aus einem fremden
Programm gilt grundsätzlich als Klartext.

---

## Sprachausgabe

Zwei Wege, in dieser Reihenfolge:

1. **Vorproduzierte Aufnahmen** (Google Chirp 3 HD). Ein Skript auf deinem
   Rechner erzeugt sie einmalig und legt sie unter `audio/` ins Repository.
   Die App spielt nur ab.
2. **Stimme des Browsers** als Rückfall — für alles, was noch keine Aufnahme
   hat. Eine gerade angelegte Karte spricht also sofort, wenn auch
   mittelmäßig.

**Warum vorproduzieren?** Der Zugangsschlüssel bliebe sonst im Browser und
damit im öffentlichen Repository. So verlässt er deinen Rechner nie, die
Kosten fallen einmal je Karte statt bei jeder Abfrage an, es entsteht keine
Wartezeit beim Lernen, und es funktioniert offline.

**Was es kostet.** Chirp 3 HD kostet 30 $ je Million Zeichen, die ersten
1 Million Zeichen im Monat sind frei — und das Kontingent erneuert sich.
Ein Bestand von 2.000 Karten liegt bei rund 160.000 Zeichen, passt also
sechsfach hinein. Realistisch: dauerhaft 0 €.

**Für den ersten Massenlauf** nimm `--aus sicherung.json` (siehe unten).
Dieser Weg liest die Texte aus einer JSON-Sicherung und kostet **keinen
einzigen Firestore-Schreibvorgang**. Der Weg über die Sammelliste ist für
den laufenden Betrieb gedacht, nicht für den Umstieg: Beim ersten Kontakt
mit einem großen Bestand meldet die App für jede Kartenseite einmal an, und
das Tageskontingent des kostenlosen Firebase-Tarifs (20.000 Schreibvorgänge,
**projektweit** für alle drei Konten) ist damit schneller erreicht, als man
denkt.

Google verlangt allerdings eine hinterlegte Zahlungsmethode, auch für das
Freikontingent. Wer das Kartenprojekt davon freihalten will, legt die
Text-to-Speech-API in einem **eigenen** Google-Cloud-Projekt an — die
MP3-Dateien landen ohnehin im Repository und nicht bei Firebase.

### Einstellungen

Unter **Einstellungen → Sprachausgabe**:

- Aufnahmen verwenden (an/aus)
- Sprechtempo 0,5× bis 1,5× — zum Nachsprechen sind 0,75× bis 0,85× angenehm
- **Stimme je Sprache.** Die Sprache kommt vom Kasten, die Stimme von hier.
  Zwei verschiedene Stimmen für Frage- und Antwortsprache machen den
  Hörmodus deutlich klarer; die Stimmennamen sind in allen Sprachen dieselben.

### Die gemeinsame Sammelliste — und was sie preisgibt

Die Karten der drei Konten liegen getrennt unter `users/{uid}/cards`. Dort
kommt ein Vorproduktions-Skript nicht ohne Weiteres heran. Statt die
Kartenbestände zu öffnen, meldet die App nur, **was** gesprochen werden soll:
Text, Sprache, Stimme — in die gemeinsame Sammlung `audioBedarf`.

**Das heißt: Kartentexte sind für die anderen beiden Konten lesbar.** Für
Vokabeln und Prüfungsstoff ist das unerheblich, aber es soll niemanden
überraschen. Nicht in der Liste stehen Lernstand, Termine, Statistik und
jede Zuordnung zwischen Text und Karte — die Dokument-Kennung ist ein Hash
des Textes, ein Konto ist nirgends vermerkt.

Wer das nicht möchte, nimmt in den Einstellungen den Haken „Fehlende
Aufnahmen in die gemeinsame Liste eintragen" heraus. Die eigenen Karten
sprechen dann mit der Browserstimme.

Ein Eintrag ist **inhaltlich** unveränderlich: Die Security Rules erlauben
`create` und eine inhaltsgleiche Wiedervorlage, aber kein Umschreiben und
kein Löschen. Sonst könnte ein Konto den Text eines anderen überschreiben
und damit steuern, was das Skript an Google schickt. Ebenso ist nur `get`
erlaubt, nicht `list` — sonst ließe sich der gesamte Textbestand aller
Konten in einer einzigen Abfrage herunterladen.

Jedes Gerät merkt sich in seinem Browser, was es schon gemeldet hat. Ohne
das würde in jeder Sitzung erneut für jede noch nicht vertonte Kartenseite
geschrieben.

**Was die Regeln nicht können:** Sie begrenzen nicht die *Menge*. Ein
angemeldetes Konto kann beliebig viele Einträge anlegen, und das
Tageskontingent gilt projektweit. Wer das ausschließen will, aktiviert
`istErlaubtesKonto()` in `firestore.rules` und trägt die drei UIDs ein.

### Aufnahmen erzeugen

Einmalig einrichten:

1. Google Cloud → **Cloud Text-to-Speech API** aktivieren, Abrechnung an.
2. Dienstkonto anlegen, Schlüssel als JSON herunterladen.
   Rollen: *Cloud Text-to-Speech-Nutzer* und *Cloud Datastore-Nutzer*.
3. `cd werkzeuge && npm install`

Dann bei Bedarf:

```
export GOOGLE_APPLICATION_CREDENTIALS=/pfad/zum/dienstkonto.json
node werkzeuge/sprache-erzeugen.mjs --probe     # nur zeigen, was anfiele
node werkzeuge/sprache-erzeugen.mjs             # erzeugen
git add audio && git commit -m "Sprachdateien" && git push
```

Weitere Schalter: `--aus sicherung.json` (aus einer JSON-Sicherung statt aus
der Sammelliste — der Weg für den ersten Massenlauf), `--grenze 500`,
`--behalten` (Sammelliste nicht aufräumen).

Der Dateiname ist ein Hash über Sprache, Stimme und Text — **nicht** über die
Karten-ID. Dadurch teilen sich alle Konten dieselbe Aufnahme, sobald sie
dieselbe Vokabel haben, und eine umbenannte oder verschobene Karte behält
ihre Aufnahme. Wer die Stimme für eine Sprache wechselt, braucht für diese
Sprache neue Aufnahmen.

Die Dateien in `audio/` liegen öffentlich im Repository. Wer die Adresse
kennt, kann sie abspielen und damit den Kartentext hören.

---

## Lernbox

Die App hat zwei Bereiche, und sie tun Verschiedenes:

| | **Karteikasten** | **Lernbox** |
|---|---|---|
| Frage | Sitzt es noch? | Wie kommt es rein? |
| Rhythmus | schnell, viele Karten | langsam, wenige Karten |
| Ergebnis | ein neuer Termin | eine Karte, die sitzt |

Bis Stufe 5 gab es nur den Karteikasten. Eine Karte, die man nicht wusste,
bekam einen neuen Termin und kam in derselben Sitzung **kein einziges Mal**
wieder — sie wurde genau so oft abgefragt wie eine, die im Schlaf saß.

Das ist nicht bloß eine verpasste Gelegenheit. Karpicke und Roediger haben
genau diese Bedingung gemessen — eine Karte aus dem Verkehr ziehen, sobald
sie einmal saß — und sie schnitt von allen geprüften Verfahren **am
schlechtesten** ab:

| Verfahren | Behalten nach einer Woche |
|---|---|
| Weiter abfragen, auch was schon saß | **44 %** |
| Geballt statt verteilt | 36 % |
| **Nach dem ersten Treffer weglassen** | **21 %** |

### Wie die Lernbox arbeitet

Karten, die nicht saßen, wandern hinein. Dort werden sie **als Stapel**
durchlaufen: Karte 1, 2, 3, wieder 1, wieder 2 … Erst nach zwei Treffern
**mit Abstand** geht eine Karte in den Umlauf zurück.

Der Abstand ist der Wirkstoff, nicht die Wiederholung. Eine Karte fünfmal
hintereinander zu fragen misst nur das Kurzzeitgedächtnis. Deshalb liegen
zwischen zwei Anläufen derselben Karte immer andere.

Ein Fehlversuch setzt den Zählstand auf **null** zurück, nicht um eins —
sonst wäre es kein Kriterium.

### Stufenweises Aufdecken

Statt die Antwort auf einen Schlag umzudrehen, gibt es sie in Stufen:

```
1. Frage.                Du versuchst die Antwort.
2. Tipp:                 „A__________“ — Wortlängen und erste Buchstaben.
3. Noch ein Tipp:        das erste Wort vollständig.
4. Ganze Antwort.
5. Zudecken.             Jetzt vollständig selbst erzeugen.
```

Das ist die formalisierte Fassung des Umdrehens am Papierkasten: ein, zwei
Wörter aufschreiben — umdrehen — mehr aufschreiben. Als
**Cover-Copy-Compare** ist das Verfahren seit Jahrzehnten untersucht.

**Die App verlangt nicht, dass du tippst.** Sie stellt die Stufen bereit und
führt Buch über das Kriterium — ob du dabei zur Tastatur greifst, auf einen
Zettel schreibst oder es dir vorsagst, bleibt dir überlassen. Wer die
automatische Auswertung möchte, schaltet in den Einstellungen
*„Antwort eintippen"* ein; dann gilt dieselbe Tippfehlertoleranz wie im
Karteikasten.

### Was hineinkommt

- **Karten mit 1 („nicht gewusst") und 2 („schwer gewusst").** Ob die 2
  mitzählt, ist einstellbar.
- **Neue Karten, bevor sie terminiert werden.** Ohne das bekommt eine frisch
  angelegte Karte einen einzigen Blick und danach einen Termin — sie wird
  terminiert, bevor sie gelernt wurde. Eingeführte Karten zählen auf dasselbe
  Tagespensum wie im Karteikasten.
- Über *„Kann ich schon"* geht eine Karte jederzeit ohne Üben in den Umlauf.

Am Ende einer Karteikasten-Sitzung wird die Lernbox angeboten. Der wirksamste
Zeitpunkt ist gleich im Anschluss: innerhalb derselben Sitzung mit Abstand
abzurufen ist genau der Teil, der beim bloßen Neuterminieren fehlt.

### Was die Lernbox NICHT anfasst

**Den Terminplan.** FSRS bekommt beim Bewerten die **erste** Bewertung — die
ehrliche. Wer eine Karte erst im vierten Anlauf kann, hat sie nicht gekonnt;
würde die Lernbox am Ende „gewusst" melden, hielte der Scheduler sie für
leichter als sie ist und der Termin rutschte zu weit nach hinten. Die Lernbox
liegt **über** dem Scheduler.

**Die Abfragezahlen.** Übungsdurchgänge sind keine Abfragen. Sie zählen in
einem eigenen Feld und erscheinen weder in `anzahl` noch in der
Bewertungsverteilung — sonst zeigte die Statistik nach einer Übungsrunde
dreimal so viele „Abfragen" wie tatsächlich terminwirksam stattgefunden
haben. Die **Zeit** zählt dagegen sehr wohl als Lernzeit und geht in den
Tagesring ein.

### Einstellungen

Unter **Einstellungen → Lernbox**: an/aus, Treffer bis zum Umlauf (1–5),
Karten dazwischen (0–10), Auslöser (nur 1 / auch 2), neue Karten einführen,
Antwort eintippen.

Eine Übungsrunde umfasst höchstens zwölf Karten. Was darüber liegt, bleibt
für die nächste Runde liegen — am besten an einem anderen Tag, das ist der
wirksamere Abstand.

**Der Deckel.** Es liegen höchstens 30 Karten gleichzeitig in der Lernbox.
Ist sie voll, wandert nichts mehr hinein — die Karten werden dann ganz normal
neu terminiert, gehen also nicht verloren. Gemessen wächst die Box sonst ab
etwa 30 bewerteten Karten je Sitzung um rund vier Karten am Tag, und eine
Box, die nie leer wird, hilft niemandem.

**Ein angefangener Stand gilt nur für den laufenden Tag.** Ein Treffer von
vorgestern ist kein Treffer „mit Abstand", sondern einer aus einer anderen
Sitzung. Am nächsten Tag beginnt die Karte deshalb wieder bei null.

**Erwartete Nebenwirkung:** Es fühlt sich zäher an als vorher — gemessen
knapp doppelt so viele Tippvorgänge je Sitzung. Das ist der Zweck. Wer nur
schnell durch den Stapel will, schaltet die Lernbox ab oder stellt das
Kriterium auf einen Treffer.

**Am Telefon:** Die Urteilsknöpfe sitzen fest am unteren Rand, im
Daumenbereich. Ein zweiter Tipp auf dieselbe Stelle innerhalb von 400 ms wird
verworfen — beim Doppeltippen landete er sonst auf dem Knopf, der gerade
nachgerückt ist. Bei offener Bildschirmtastatur weicht die Navigationsleiste,
damit die Bedienelemente sichtbar bleiben.

**Tastatur am Rechner:** <kbd>Leertaste</kbd> aufdecken, <kbd>T</kbd> Tipp,
<kbd>J</kbd> konnte ich, <kbd>N</kbd> konnte ich nicht, <kbd>Z</kbd> zudecken.

---

## Offline

Firestore legt eine vollständige Kopie im Browser ab
(`persistentLocalCache`, mehrere Tabs gleichzeitig erlaubt). Ohne Netz
funktioniert alles weiter: lernen, bewerten, Karten anlegen und ändern.
Die Änderungen gehen raus, sobald wieder Verbindung besteht.

Der Punkt oben rechts zeigt den Stand:

| Punkt | Bedeutung |
|---|---|
| grün *Synchronisiert* | alles bei Firestore angekommen |
| orange *Wird gespeichert …* | Änderungen sind unterwegs |
| grau *Offline* | kein Netz, alles wird lokal gesammelt |

Nur die **Anmeldung selbst** braucht Internet. Wer angemeldet bleibt, kommt
auch offline in die App.

---

## Datenmodell

```
users/{uid}
  ├─ settings/app            { intervalle[12], theme, streak, lastLearnDate,
  │                            retention, neuProTag, zielMinuten, klassikModus,
  │                            modi[] }              ← die letzten fünf für Stufe 2
  ├─ decks/{deckId}          { name, farbe, modi[], richtung,
  │                            sprache, spracheAntwort,
  │                            pruefungsdatum, createdAt, archiviert }
  ├─ cards/{cardId}          { deckId, frage, antwort, notiz, tags[], typ,
  │                            uebung, uebungFertig,             ← Stufe 6
  │                            extra, mark, format,              ← Stufe 5
  │                            lautschrift, lautschriftAntwort,  ← Stufe 5
  │                            quelleId, variante,
  │                            fach, stability, difficulty, due, lastReview,
  │                            reps, lapses, state, suspendiert,
  │                            leech, leechBasis, zeitGesamt, zeitReps,
  │                            createdAt }
  └─ reviews/{YYYY-MM-DD}    { datum, anzahl, neu, sekunden,
                               bewertungen{1..4}, proDeck{deckId:anzahl},
                               sekundenProDeck{deckId:sekunden},
                               uebungen, uebungSekunden }        ← Stufe 6

audioBedarf/{hash}           { text, sprache, stimme, lautschrift, gemeldetAm }
```

`audioBedarf` ist der einzige **gemeinsame** Bereich (Stufe 5) und liegt
bewusst außerhalb von `users/`. Näheres unter „Sprachausgabe".

Die Karten liegen **flach** unter `cards/`, nicht in den Kästen verschachtelt —
so ist „alle fälligen Karten über alle Kästen" eine einzige Abfrage.

Die Felder tragen die Namen aus `KONZEPT.md` §3. `stability`, `difficulty`,
`reps`, `lapses` und `state` werden von beiden Scheduler-Modi geschrieben —
im Klassik-Modus rechnet `stability` das Intervall des Fachs in Tagen nach,
im FSRS-Modus ist es die tatsächliche, gemessene Stabilität. `fach` wird in
beiden Modi mitgeschrieben (im FSRS-Modus als Spiegel der Stabilität, siehe
„Fach-Anzeige" oben), damit ein späteres Umschalten in den Klassik-Modus
nicht auf einem veralteten Wert aufsetzt.

Datumsangaben sind durchgehend ISO-Zeichenketten `YYYY-MM-DD`.

**Abfragen einer Karte (Stufe 3).** Eine Karte kann mehrere eigenständig
terminierte Abfragen erzeugen — je Cloze-Lücke eine, bei „beide Richtungen"
zwei. Technisch ist jede Abfrage ein eigenes Kartendokument:

- `quelleId` = `null` → **Quellkarte**, sie trägt den Inhalt.
- `quelleId` = Kennung der Quellkarte → **abgeleitete Abfrage**. Sie
  spiegelt den Inhalt und hat einen eigenen Termin.
- `variante`: `v` (vorwärts), `r` (rückwärts), `c1`, `c2`, … (Lücke N).

Bearbeitet, verschoben und gelöscht wird immer die ganze Familie: Wer eine
abgeleitete Abfrage zum Bearbeiten öffnet, landet automatisch auf der
Quellkarte. „Ruhen lassen" gilt für alle Abfragen einer Karte.

Karten aus Stufe 1 und 2 haben diese Felder nicht — sie gelten als
Quellkarten in Vorwärtsrichtung, es ist also nichts zu tun.

Die **CSV-Ausgabe** enthält nur Quellkarten, sonst stünde derselbe Inhalt
mehrfach in der Datei. Sie ist bewusst das einfache Austauschformat:
Lückentext-Markierungen bleiben darin als Text erhalten, die Aufteilung in
einzelne Lücken geht beim Wiedereinlesen aber verloren. Für vollständige
Sicherungen ist die JSON-Datei gedacht.

**Migration Stufe 1 → Stufe 2.** Konten, die vor Stufe 2 angelegt wurden
(`settings/app.version < 3`), wechseln beim ersten Öffnen automatisch und
einmalig auf `klassikModus:false` (FSRS) und `version:3` — mit einem kurzen
Hinweis in der App. Termine und Bewertungsverlauf bereits gelernter Karten
bleiben dabei unverändert; nur künftige Bewertungen laufen ab dann über
FSRS. Wer beim Klassik-Modus bleiben möchte, schaltet in den Einstellungen
einfach zurück.

**Indizes** braucht die App weiterhin keine: Sie lädt die Karten des Kontos
in einem Rutsch und filtert im Browser. Für größere Bestände sind
zusammengesetzte Indizes auf `(deckId, due)` und `(due)` vorbereitet —
Firestore bietet sie bei Bedarf selbst zum Anlegen an.

**Aus der alten App umgesetzt wird so:**

| alt | neu |
|---|---|
| `fach` | `fach`, zusätzlich `stability` = Intervall dieses Fachs in Tagen |
| `faellig` | `due` |
| `history[]` | `reps` = Anzahl Einträge, `lapses` = Anzahl Bewertungen `1`, `lastReview` = letztes Datum |
| Kasten (`lk:boxes`) | `decks/{deckId}` |
| `lk:intervals` | `settings/app.intervalle` |
| `lk:meta.streak` | `settings/app.streak` |

Der Verlauf je Karte wird nicht mitgenommen — an seine Stelle treten
`reps`/`lapses` und die Tagesdokumente unter `reviews/`. Termine und Fächer
bleiben dabei unverändert; nach dem Import läuft alles am selben Tag weiter
wie vorher.

---

## Sicherheit

**Der `apiKey` in `firebase-config.js` ist kein Geheimnis.** Er steht bei jeder
Firebase-Web-App im Quelltext und identifiziert nur das Projekt. Ihn
„verstecken" zu wollen bringt nichts und wäre bei einer statischen Seite auch
nicht möglich.

Abgesichert wird an vier anderen Stellen:

1. **Security Rules.** `users/{uid}/…` ist ausschließlich für das Konto mit
   genau dieser uid lesbar und schreibbar. Alles andere ist verboten. Die drei
   Konten sehen einander nicht — mit **einer** ausdrücklichen Ausnahme seit
   Stufe 5: der Sammlung `audioBedarf`, in der die Texte stehen, für die noch
   eine Sprachaufnahme fehlt. Sie ist für alle drei Konten lesbar, erlaubt
   aber nur `create` (kein `update`, kein `delete`), begrenzt die Feldnamen
   und die Textlänge und enthält weder Konto noch Karten-Kennung. Siehe
   „Sprachausgabe".
2. **Keine Selbstregistrierung** (Schritt 3). Ohne Konto aus der Konsole kommt
   niemand hinein.
3. **Positivliste für Markup** (seit Stufe 5). Kartentexte dürfen Auszeichnung
   enthalten; durchgelassen wird nur, was auf der Liste steht, und gefiltert
   wird sowohl beim Speichern als auch beim Anzeigen. Einzelheiten unter
   „Was mit dem Markup passiert". Die Abnahmeprüfung fährt 14 Angriffsmuster
   dagegen und hängt das Ergebnis anschließend in die laufende Seite — ein
   durchgerutschtes Skript würde also tatsächlich zünden und auffallen.
4. **Nur E-Mail/Passwort.** Die Regeln verlangen zusätzlich, dass die Anmeldung
   über den Passwort-Provider erfolgt ist. Anonyme Anmeldungen greifen selbst
   dann nicht, wenn sie versehentlich aktiviert werden.

Wer es noch enger will: in `firestore.rules` ist eine `istErlaubtesKonto()`
vorbereitet, die zusätzlich auf genau drei uids einschränkt. Die uids stehen in
*Authentication → Users*.

**Kosten.** Der kostenlose Firebase-Tarif (Spark) ist für drei Personen
reichlich bemessen — die App lädt den Kartenbestand einmal je Sitzung und
schreibt pro bewerteter Karte zwei kleine Dokumente. Die aktuellen
Tageskontingente stehen unter
https://firebase.google.com/pricing. Eine Zahlungsmethode ist für Spark nicht
hinterlegt; bei erschöpftem Kontingent verweigert Firestore den Dienst bis zum
nächsten Tag, statt Kosten zu verursachen.

---

## Sichern und Wiederherstellen

- **Alles als JSON sichern** — vollständige Sicherung inklusive Einstellungen
  und Tagesstatistik. Diese Datei lässt sich über *JSON einspielen* wieder
  einlesen, auch in ein anderes Konto.
- **Karten als CSV** — `"Frage";"Antwort";"Kasten"` mit Kopfzeile, Semikolon
  als Trenner, mit BOM, damit Excel die Umlaute richtig anzeigt. Die Kopfzeile
  ist wichtig: Nur mit ihr erkennt der Import beim Wiedereinlesen, dass die
  dritte Spalte der Kasten ist.
- **CSV einlesen** — siehe den eigenen Abschnitt weiter unten.
- **Zusammenführen oder Ersetzen** — beim JSON-Import gefragt, sobald schon
  Karten im Konto liegen. *Ersetzen* löscht vorher alles.

Die JSON-Sicherung enthält auch die persönlichen Einstellungen: Anzeigename,
Abzeichensatz, Retention, Tagespensum, Problemkarten-Grenze und Intervalle. Beim
Einspielen fragt ein Haken, ob sie mit übernommen werden sollen — bei einer
Sicherung aus dem eigenen Konto ist er gesetzt, bei einer aus einem fremden
Konto nicht.

Eine Sicherung von Zeit zu Zeit ist trotz Firestore sinnvoll: gegen versehentlich
gelöschte Kästen hilft kein Cloud-Speicher.

---

## CSV einlesen

*Einstellungen → Sichern und Wiederherstellen → CSV einlesen.*

Nichts wird geschrieben, bevor der Vorschau-Dialog bestätigt ist. Er zeigt die
ersten Zeilen der Datei so, wie die App sie versteht, und darüber vier
Einstellungen:

| Feld | Was es bedeutet |
|---|---|
| **Trennzeichen** | Womit die Spalten getrennt sind: Semikolon, Komma oder Tabulator. Die App rät und liegt meist richtig — stimmt die Vorschau nicht, hier umstellen. |
| **Erste Zeile ist eine Überschrift** | Angehakt, wenn in Zeile 1 Spaltennamen stehen (`Frage;Antwort`). Dann wird sie nicht zur Karte. |
| **Frage / Antwort / Notiz** | Welche Spalte was ist. Frage und Antwort dürfen nicht dieselbe Spalte sein. Notiz kann auch „— keine —“ bleiben. |
| **Wohin?** | *In einen neuen Kasten* (voreingestellt, Name aus dem Dateinamen), *in einen vorhandenen Kasten*, oder *Kastenname steht in einer Spalte*. |

Unter der Vorschau steht in einem Kasten, was passieren wird — „180 Karten in
den neuen Kasten ‚Vokabeln'". Diese Ankündigung stimmt: Steht dort eine Zahl,
kommt genau diese Zahl heraus.

**Worauf zu achten ist**

- *Kastenname steht in einer Spalte* nur wählen, wenn dort wirklich Kästen
  stehen. Sind es Notizen oder Schlagwörter, entsteht aus jeder Zeile ein
  eigener Kasten. Ab sechs Kästen warnt die Bilanz von selbst.
- Karten, die im Zielkasten schon stehen (gleiche Frage), werden übersprungen.
  Der Haken *„Karten überspringen, die dort schon stehen"* lässt sich abwählen.
- Erscheinen in der Vorschau statt Umlauten Fragezeichen, ist die Datei nicht
  UTF-8. In Excel als *CSV UTF-8* speichern. Windows-1252 und UTF-16 erkennt
  die App selbst — der Hinweis erscheint nur, wenn auch das nicht half.
- Meldet die Bilanz, dass ein Anführungszeichen fehlt, steckt in der Datei ein
  `"`, das nie geschlossen wird. Alles danach landete sonst in einer einzigen
  Karte.
- Nach dem Import steht in der Kartenliste ein Knopf **„Import
  zurücknehmen"**. Er entfernt genau die gerade eingelesenen Karten samt der
  dabei angelegten Kästen — aber nur die unberührten: Was inzwischen
  verschoben, bearbeitet oder gelernt wurde, bleibt stehen und wird in der
  Rückfrage genannt. Nach dem Neuladen der Seite ist der Knopf weg.

**Format des eigenen Exports**

```
"Frage";"Antwort";"Kasten"
"to run";"laufen";"Englisch"
"Mitochondrium";"Kraftwerk der Zelle";"Biologie"
```

---

## Aufräumen nach einem verunglückten Import

Sind aus einem Import viele Kästen mit je einer Karte geworden, meldet das
*Einstellungen → Diagnose*:

> **40 Kästen enthalten nur eine einzige Karte.** Das sieht nach einem
> verunglückten Import aus.

Der Knopf **„Karten in einen Kasten zusammenführen"** erledigt den Rest: Zielkasten
wählen (auch ein neuer), bestätigen — die Karten wandern samt Fach, Terminen
und Lernstand hinüber, die leer gewordenen Kästen verschwinden. Ein neu
angelegter Zielkasten übernimmt Abfragerichtung, Modi und Sprachen der
Herkunftskästen; bei einem vorhandenen Kasten mit abweichender Richtung warnt
der Dialog vorher, wie viele Abfragen dabei entfallen.

Von Hand geht es genauso: *Karten → Alle N auswählen → Verschieben*, danach
*Diagnose → Leere Kästen entfernen*. Die Auswahl gilt immer nur für den
gerade eingestellten Ausschnitt; ein Wechsel von Kasten oder Filter verwirft
sie, damit „Löschen" nie Karten trifft, die man nicht vor Augen hat.

---

## Persönliche Anrede

Der Startbildschirm begrüßt mit dem Namen und passend zur Tageszeit — „Bereit
für eine Abendschicht, GW?". Der Name steht unter *Einstellungen → Konto →
Anzeigename*; ohne Eintrag verwendet die App den vorderen Teil der
E-Mail-Adresse.

Die Begrüßung wechselt täglich, aber nicht innerhalb eines Tages: Sie hängt am
Datum und am Tagesabschnitt, nicht am Zufall. Liegt ein Rückstand von mehr als
20 überfälligen Karten vor, spricht sie ihn an, statt Feierabend zu melden.

---

## Abzeichen

Abzeichen erscheinen auf dem Startbildschirm (das zuletzt erreichte und das
nächste Ziel) und vollständig in der Statistik. Es gibt vier Arten:

| Art | Gezählt wird |
|---|---|
| `streak` | Tage in Folge gelernt |
| `wiederholungen` | Abfragen insgesamt |
| `karten` | Karten insgesamt |
| `fach` | Karten im höchsten Fach (12) |

Eingebaut sind dreizehn Abzeichen von „🌱 Angefangen" (3 Tage) bis
„🏆 Ein ganzes Jahr" (365 Tage). Unter *Einstellungen → Abzeichen* lassen sie
sich ändern, löschen und ergänzen — Symbol, Name, Art, Schwelle und Farbe.

**Ein gemeinsamer Satz für alle drei Konten.** Die einzige Datei, die sich alle
Konten teilen, ist `firebase-config.js` — sie wird von allen aus demselben
Repository geladen. Genau dort kann ein gemeinsamer Abzeichensatz stehen:

1. In einem Konto die Abzeichen so einrichten, wie sie überall gelten sollen.
2. *Einstellungen → Abzeichen → „Textblock für alle Konten"* → **Kopieren**.
3. Auf GitHub die Datei `firebase-config.js` öffnen, auf den Stift klicken,
   den Block ganz unten einfügen (einen vorhandenen `export const ABZEICHEN`
   vorher löschen) und **Commit changes** drücken.
4. Nach ein bis zwei Minuten sehen alle Konten die neuen Abzeichen.

Solange dieser Eintrag in der Datei steht, hat er Vorrang: Die Konten zeigen
ihn an, ihr eigener Satz bleibt gespeichert, wirkt aber nicht. Die
Abzeichen-Verwaltung sagt das dann auch. Rückgängig: den Block wieder aus der
Datei entfernen. Die Security Rules sind davon nicht betroffen — an
`firestore.rules` muss dafür nichts geändert werden.

---

## Fehlerbehebung

| Symptom | Ursache und Abhilfe |
|---|---|
| „In `firebase-config.js` stehen noch Platzhalter" | Schritt 2 nachholen. |
| „Die Datei `firebase-config.js` konnte nicht geladen werden" | Datei fehlt im Repo oder heißt anders. Groß-/Kleinschreibung beachten. |
| „Das Firebase-SDK konnte nicht geladen werden" | Beim ersten Start ohne Netz. Sonst: `SDK_VERSION` prüfen, aktuelle Nummer unter https://firebase.google.com/docs/web/setup. Auch Inhaltsblocker können `gstatic.com` sperren. |
| „Die FSRS-Bibliothek (ts-fsrs) konnte nicht geladen werden" | Beim ersten Start ohne Netz, oder ein Inhaltsblocker sperrt `unpkg.com`. Nach dem ersten erfolgreichen Laden bleibt sie offline nutzbar wie das Firebase-SDK. |
| `auth/unauthorized-domain` | Schritt 6: `gewe77.github.io` freigeben. |
| `auth/operation-not-allowed` | Schritt 3: E-Mail/Passwort aktivieren. |
| App bleibt bei „Daten werden geladen" | Regeln nicht veröffentlicht (Schritt 5) oder Firestore-Datenbank nicht angelegt (Schritt 4). |
| „Firestore verweigert den Zugriff" | Dieselbe Ursache — Regeln aus `firestore.rules` veröffentlichen. |
| „Aus diesem Browser" findet nichts | Anderer Browser oder anderes Gerät als früher, oder Browserdaten gelöscht. Über die JSON-Datei importieren. |
| Alte Version wird noch angezeigt | Hart neu laden (`Strg`+`Umschalt`+`R`). GitHub Pages braucht nach dem Hochladen ein bis zwei Minuten. |
| Punkt bleibt orange | Änderungen warten auf Netz. Sie gehen nicht verloren; die App darf geschlossen werden, sobald der Punkt grün war. |
| Es wird nichts vorgelesen | Der Browser bietet keine Sprachausgabe an (Diagnose prüfen), oder es fehlt eine Stimme für die eingestellte Sprache des Kastens. Auf dem Handy hilft oft, das Gerät nicht stummzuschalten. |
| Eine Karte kam heute schon dran, die andere Richtung fehlt | Geschwisterabfragen werden absichtlich zurückgestellt, damit sie sich nicht gegenseitig verraten. Sie kommen in der nächsten Sitzung. |
| Eine Karte ist plötzlich verschwunden | Vermutlich als Problemkarte ausgesetzt (7× nicht gewusst). *Karten → Problemkarten.* |
| Der Prüfungstermin bewirkt nichts | Er liegt in der Vergangenheit — dann bleibt er wirkungslos. Beim Speichern erscheint dazu ein Hinweis. |
| Nach der Prüfung kommen zu viele Karten | Der Termin steht noch am Kasten und zieht weiter Fälligkeiten vor. Der Startbildschirm bietet „Termin entfernen“ an. |
| „Ø Zeit“ ist leer oder klein | Gemessen wird erst seit Stufe 4 und erst ab zwei Abfragen je Karte. |
| Multiple Choice erscheint nie | Der Modus greift nur bei Karten, die noch nie dran waren, und braucht mindestens vier verschiedene Antworten im selben Kasten. |
| Eine Sitzung war weg, nachdem ich auf „Karten" getippt habe | Seit 4.3 nicht mehr: Die Sitzung wird geparkt, ein Punkt am Lern-Knopf zeigt das an, und ein Tipp darauf setzt sie fort. Beim Neuladen der Seite beginnt sie neu. |
| Bei einem Lückentext werden nicht alle Lücken abgefragt | Je Karte sind höchstens 20 Lücken möglich. Der Karteneditor nennt die überzähligen. Besser die Karte aufteilen. |
| Der Streak steht nach einem Import falsch | Streak und Lerndatum kommen nur mit dem Haken „Einstellungen übernehmen" mit. Beim Zusammenführen gewinnt der höhere Stand. |
| Eine Rückwärtskarte fehlt | *Einstellungen → Diagnose → Abfragen abgleichen.* Das kommt nach einem Import vor, bei dem der Kasten schon auf „beide Richtungen" stand. |
| Aus einer CSV-Datei wurden viele Kästen statt vieler Karten | *Einstellungen → Diagnose → „Karten in einen Kasten zusammenführen"*. Beim nächsten Import unter „Wohin?" *In einen neuen Kasten* stehen lassen. |
| In der CSV-Vorschau stehen Fragezeichen statt Umlauten | Die Datei ist weder UTF-8 noch Windows-1252. In Excel als *CSV UTF-8* speichern, in Google Sheets über *Datei → Herunterladen → CSV*. |
| Der Startknopf nennt weniger Karten als „fällig" | Neue Karten sind auf 20 pro Tag gedeckelt (*Einstellungen → Tagespensum*), damit die Wiederholungen später nicht auf einmal anfallen. Der Grund steht unter der Begrüßung. |
| Änderungen an den Abzeichen wirken nicht | In `firebase-config.js` steht ein gemeinsamer `ABZEICHEN`-Block. Er hat Vorrang — siehe „Abzeichen". |
| Der Import hat das Falsche angelegt | In der Kartenliste steht direkt danach „Import zurücknehmen". Nach dem Neuladen der Seite hilft nur noch Löschen von Hand. |

Der Abschnitt **Diagnose** in den Einstellungen zeigt Projekt-Kennung,
SDK-Version, Verbindungsstand, Bestand und ob im Browser noch Altdaten liegen.
Bei Rückfragen ist das die erste Anlaufstelle.

Meldet die Diagnose **„Karten ohne Kasten"**, gehören Karten zu einem Kasten,
den es nicht mehr gibt — etwa weil beim Löschen die Verbindung abbrach oder
zwei Geräte gleichzeitig etwas geändert haben. Solche Karten kämen in keiner
Sitzung mehr vor, würden aber weiter mitgezählt. Der Knopf **„In einen Kasten
einsammeln"** holt sie zurück.

---

## Bewusst nicht enthalten

Alle vier Stufen aus `KONZEPT.md` sind umgesetzt. Nicht gebaut wurde, was
dort unter „Nicht-Ziele" steht: geteilte Kästen zwischen Konten,
Gamification mit Ranglisten, Grammatiktrainer, fertige Vokabelpakete,
Serverkomponenten und eine Nutzerverwaltung in der App.

Ebenfalls nicht enthalten: Bilder auf Karten (das Feld `typ` sieht `bild`
nicht mehr vor) und eine automatische Parameter-Optimierung für FSRS — die
lohnt laut `KONZEPT.md` §4.1 erst ab etwa 1.000 Wiederholungen und wäre eine
eigene Ausbaustufe.
