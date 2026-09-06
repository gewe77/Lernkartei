# HAN CROCO

Eine private Lernkartei für drei Konten, als statische Seite auf GitHub
Pages, mit Firebase (Anmeldung + Firestore) als einzigem Server.

> **Diese README ist neu geschrieben.** Der Arbeitsplatz, auf dem die
> ausführliche Fassung lag, wurde abgeräumt; erhalten geblieben sind
> `index.html`, `js/` und die Konzeptdokumente. Was hier steht, ist aus dem
> Programm selbst rekonstruiert. Die alte Fassung steckt in
> `han-croco-7-4.zip`, falls du sie noch hast — sie ist ausführlicher,
> besonders bei Einrichtung, Sprachausgabe und Datenmodell.

## Beim Auspacken — bitte zuerst lesen

Dieses Paket enthält **keine** Datei, die deine eigene Einrichtung
überschreiben kann. Drei Dateien gehören dir und stehen deshalb nur als
Beispiel bzw. gar nicht darin:

| Datei | im Paket | warum |
|---|---|---|
| `firebase-config.js` | **nein**, nur `firebase-config.BEISPIEL.js` | enthält deine Zugangsdaten |
| `audio/manifest.json` | **nein** | listet deine vorproduzierten Aufnahmen |
| `firestore.rules` | **nein**, nur `firestore.rules.BEISPIEL` | ist in der Firebase-Konsole veröffentlicht |

**Beim allerersten Einrichten** einmal kopieren:

```bash
cp firebase-config.BEISPIEL.js firebase-config.js
cp firestore.rules.BEISPIEL   firestore.rules
```

und `firebase-config.js` ausfüllen. Danach kannst du jedes weitere Paket
gefahrlos darüber auspacken.

**Falls doch einmal etwas überschrieben wurde:**

```bash
git restore firebase-config.js audio/manifest.json firestore.rules
# schon eingecheckt? dann aus dem Stand davor:
git restore --source=HEAD~1 -- firebase-config.js audio/manifest.json firestore.rules
```

Ohne Git: Die Werte für `firebase-config.js` stehen in der Firebase-Konsole
unter *Projekteinstellungen → Meine Apps → Web-App → Konfiguration*. Und das
Audio-Verzeichnis lässt sich aus dem Ordner neu aufbauen, ohne dass etwas neu
erzeugt oder bezahlt wird:

```bash
node werkzeuge/manifest-neu.mjs
```

Solange noch nichts gepusht ist, liefert die laufende Seite die alten Dateien
übrigens weiter aus — `https://<konto>.github.io/<repo>/firebase-config.js`
im Browser öffnen und die Werte abschreiben, ist oft der schnellste Weg.

---

## Dateien

| Datei | wofür |
|---|---|
| `index.html` | die ganze App: Oberfläche, Karteikasten, Lernbox, Kästen, Karten, Statistik, Einstellungen |
| `firebase-config.BEISPIEL.js` | Vorlage — einmal nach `firebase-config.js` kopieren und ausfüllen |
| `firestore.rules.BEISPIEL` | die Sicherheitsregeln, in der Firebase-Konsole zu veröffentlichen |
| `js/mathe*.js` | der Zahlenakrobat: Oberfläche, Aufgabenerzeuger, Termrechner, Meisterklasse und sechs Bereiche zu je hundert Sets |
| `audio/` | vorproduzierte Aussprache-Aufnahmen samt `manifest.json` |
| `werkzeuge/sprache-erzeugen.mjs` | erzeugt diese Aufnahmen auf deinem Rechner (Google Chirp 3) |
| `werkzeuge/manifest-neu.mjs` | baut `audio/manifest.json` aus dem Ordner neu auf, ohne etwas zu erzeugen |
| `werkzeuge/packen.sh` | baut das Auslieferungspaket und weigert sich, deine Dateien mit einzupacken |
| `test/` | Prüfstand, läuft mit Node und Playwright gegen eine Firebase-Attrappe |

Die `js/`-Module werden zur Laufzeit nachgeladen, jedes einzeln und in
try/catch. Fehlt oder klemmt eines, fehlt genau ein Bereich — nicht die App.

## Einrichten

1. Firebase-Projekt anlegen, Web-App registrieren.
2. Anmeldung: **E-Mail/Passwort** einschalten, die drei Konten anlegen.
3. Firestore anlegen, `firestore.rules` veröffentlichen.
4. Die eigene Domain (`…github.io`) unter *Authentication → Settings →
   Authorized domains* freigeben.
5. `cp firebase-config.BEISPIEL.js firebase-config.js` und die Werte aus der
   Firebase-Konsole eintragen.
6. Alles ins Repository, GitHub Pages einschalten.

Der `apiKey` in `firebase-config.js` ist **kein Geheimnis** — er benennt das
Projekt, er berechtigt zu nichts. Den Zugriff regeln allein die
Sicherheitsregeln.

## Bedienung

Sieben Reiter:

**Karteikasten** — die Abfrage. Fällige Karten, gemischt über die gewählten
Kästen, Bewertung 1 bis 4. Leertaste deckt auf, 1–4 bewerten, Escape
beendet. Drei Abfragemodi je Kasten: Aufdecken, Tippen, Auswahl (und Hören,
wenn Aufnahmen da sind).

**Lernbox** — das Üben. Karten, die nicht sitzen, kommen hierher und werden
mehrfach mit Abstand wiederholt, bis sie das Kriterium erfüllen. Fünf
Anzeigestufen: Frage → erste Buchstaben → erstes Wort → ganze Antwort →
zugedeckt. Auf jeder Stufe außer der letzten lässt sich tippen; bei
sichtbarer Antwort lässt sie sich **abtippen** (ab 7.5).

**Zahlenakrobat** — Kopfrechnen auf Zeit. Sechs Bereiche zu hundert Sets,
jedes Set in 60 Sekunden fehlerfrei zu schaffen. Testmodus mit fester
Aufgabenfolge (vergleichbar) und Übungsmodus ohne Uhr. Vor jedem Testlauf
drei ungezählte Aufgaben zum Aufwärmen (abschaltbar). Vollständig über die
Tastatur bedienbar: Ziffern, Rücktaste, Enter, Escape — auch zwischen den
Bildschirmen.

**Meisterklasse** — eine Prüfung quer durch alles, rund zehn Minuten,
spätestens nach fünfzehn Schluss. Vergleichbar über einen Index gegen ein
mitreisendes Par. Danach steht da, was noch nicht sitzt. Einzelheiten in
`MEISTERKLASSE.md`.

**Kästen** — anlegen, bearbeiten, als CSV sichern, **Lernstand
zurücksetzen** (ab 7.5) und löschen.

**Karten** — Volltextsuche, Editor mit Auszeichnung, Lückentexte, beide
Abfragerichtungen, Massenbearbeitung.

**Statistik** — Bestand je Fach, Fälligkeiten, Serie, Wochenrückblick,
Abzeichen.

**Einstellungen** — Erscheinungsbild, Lernmethode (FSRS oder klassisch),
Tagespensum, Lernbox, Zahlenakrobat, Sprachausgabe, Intervalle je Fach,
Abzeichen, Sichern und Wiederherstellen, Diagnose.

## Sichern

*Einstellungen → Sichern und Wiederherstellen.* **JSON** ist die vollständige
Sicherung: Karten, Kästen, Lernstand, Einstellungen, Statistik. **CSV** ist
kein Backup — drei Spalten, mehr nicht.

## Auf dem Telefon

Die App ist für 360 bis 412 px gebaut und dort vermessen. Die Navigation
liegt unten, die Bedienelemente im Daumenbereich, die festen Leisten rechnen
den Gestenstreifen mit (`env(safe-area-inset-bottom)`), und die Höhen sind
in `dvh` gerechnet — sonst schöbe die einklappbare Adresszeile von
Android-Chrome den Inhalt unter die Bildkante.

## Prüfstand

```
node test/gegen-bereiche.mjs     # 600 Sets, 9048 Aufgaben, ohne Browser
node test/gegen-b2.mjs           # Bereich 2 unabhängig nachgerechnet
node test/pruefung-7-5.mjs       # die sieben Rückmeldungen
node test/pruefung-pixel.mjs     # 412 px, Farbschemata, Tippflächen
node test/pruefung-regress.mjs   # die tragenden Wege der App
```

Voraussetzung: `cd test && npm install`. Die Prüfungen laufen gegen eine
Firebase-Attrappe unter `test/mock/` — kein echtes Projekt, keine Kosten,
keine Netzverbindung nötig.

## Was bewusst fehlt

Geteilte Kästen zwischen Konten, Ranglisten, Grammatiktrainer, fertige
Vokabelpakete, Serverkomponenten, Nutzerverwaltung in der App, Bilder auf
Karten und die automatische FSRS-Parameteroptimierung.
