# audio/

Vorproduzierte Sprachaufnahmen (Google Chirp 3 HD).

Erzeugt von `werkzeuge/sprache-erzeugen.mjs`, **nicht von Hand pflegen**.

- `<schluessel>.mp3` — eine Aufnahme. Der Dateiname ist ein SHA-256 über
  Sprache, Stimme und Text (auf 40 Zeichen gekürzt). Dadurch teilen sich alle
  Konten dieselbe Datei, sobald sie dieselbe Vokabel haben, und eine
  verschobene Karte behält ihre Aufnahme.
- `manifest.json` — Verzeichnis der vorhandenen Dateien. Ohne diese Liste
  müsste die App jede Wiedergabe blind versuchen und für jede fehlende
  Aufnahme einen 404 erzeugen.

Fehlt eine Aufnahme, spricht die Karte mit der Stimme des Browsers weiter.
Der Ordner darf also jederzeit leer sein.

**Hinweis zur Sichtbarkeit:** Die Dateien liegen öffentlich im Repository.
Wer die Adresse kennt, kann sie abspielen und damit den Kartentext hören.
Für Vokabeln und Prüfungsstoff ist das unerheblich — für Vertrauliches wäre
es der falsche Ort.
