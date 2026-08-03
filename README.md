# Lernkartei 2 — Stufe 1

Private Lernkartei für drei Konten. Statische Seite auf GitHub Pages,
Daten in Firebase Firestore, Anmeldung über Firebase Auth.

Diese Stufe ist das Fundament: Anmeldung, Datenmodell, Security Rules,
Offline-Betrieb und der Import des Altbestands. Der Funktionsumfang
entspricht der Vorgängerversion. FSRS, Retention-Regler und die neue
Oberfläche kommen in Stufe 2 und sind hier bewusst nicht angefasst.

**Dateien**

| Datei | Zweck |
|---|---|
| `index.html` | die komplette App — HTML, CSS, JavaScript in einer Datei |
| `firebase-config.js` | Zugangsdaten des Firebase-Projekts, die einzige Datei mit projektspezifischen Werten |
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
| **Kästen** | anlegen, umbenennen, einfärben, löschen, als CSV sichern |
| **Karten** | anlegen, bearbeiten, verschieben, löschen, Volltextsuche |
| **Statistik** | Fächerverteilung, 14 Tage Rückblick, 7 Tage Vorschau, Streak, pro Kasten |
| **Einstellungen** | Konto, Darstellung, Intervalle, Import/Export, Diagnose |

**Tastatur während der Sitzung**

| Taste | Wirkung |
|---|---|
| `Leertaste` | Antwort aufdecken |
| `1` – `4` | bewerten |
| `Esc` | Sitzung beenden, Fortschritt bleibt gespeichert |

**Bewertung und Intervalle**

| Bewertung | Fach | nächster Termin |
|---|---|---|
| 1 — nicht gewusst | zurück auf 1 | Intervall von Fach 1 |
| 2 — schwer | bleibt | Intervall des aktuellen Fachs |
| 3 — gewusst | +1 | Intervall des neuen Fachs |
| 4 — sehr leicht | +2 | Intervall des neuen Fachs |

Voreinstellung der zwölf Fächer, in Tagen:
`1 · 3 · 7 · 14 · 21 · 30 · 45 · 60 · 90 · 120 · 180 · 365`.
In den Einstellungen frei änderbar; ein Fach darf kein kürzeres Intervall
haben als das davor.

**Umfang der Sitzung**

*Nur heute fällig* nimmt Karten, deren Termin genau heute ist.
*Alle fälligen* nimmt zusätzlich alles Überfällige. Neben beiden Optionen
steht die jeweilige Kartenzahl, damit nichts unbemerkt liegen bleibt.

**Tagesgrenze**

Ein Lerntag beginnt um **04:00 Uhr**, nicht um Mitternacht. Wer um halb zwei
nachts lernt, arbeitet noch den Vortag ab. Änderbar über
`TAGESGRENZE_STUNDE` in `firebase-config.js`.

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
  ├─ decks/{deckId}          { name, farbe, richtung, pruefungsdatum,
  │                            createdAt, archiviert }
  ├─ cards/{cardId}          { deckId, frage, antwort, notiz, tags[], typ,
  │                            fach, stability, difficulty, due, lastReview,
  │                            reps, lapses, state, suspendiert, createdAt }
  └─ reviews/{YYYY-MM-DD}    { datum, anzahl, sekunden,
                               bewertungen{1..4}, proDeck{deckId:anzahl} }
```

Die Karten liegen **flach** unter `cards/`, nicht in den Kästen verschachtelt —
so ist „alle fälligen Karten über alle Kästen" eine einzige Abfrage.

Die Felder tragen bereits die Namen aus `KONZEPT.md` §3. Stufe 1 rechnet noch
klassisch über `fach`, schreibt aber `stability`, `difficulty`, `reps`,
`lapses` und `state` mit. Wenn Stufe 2 auf FSRS umstellt, muss die dann
gefüllte Datenbank nicht noch einmal umgeschrieben werden.

Datumsangaben sind durchgehend ISO-Zeichenketten `YYYY-MM-DD`.

**Indizes** braucht Stufe 1 keine: die App lädt die Karten des Kontos in einem
Rutsch und filtert im Browser. Für Stufe 2 sind zusammengesetzte Indizes auf
`(deckId, due)` und `(due)` vorgesehen — Firestore bietet sie beim ersten
Bedarf selbst zum Anlegen an.

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

Abgesichert wird an drei anderen Stellen:

1. **Security Rules.** `users/{uid}/…` ist ausschließlich für das Konto mit
   genau dieser uid lesbar und schreibbar. Alles andere ist verboten. Die drei
   Konten sehen einander nicht — kein gemeinsamer Bestand, keine Querzugriffe.
2. **Keine Selbstregistrierung** (Schritt 3). Ohne Konto aus der Konsole kommt
   niemand hinein.
3. **Nur E-Mail/Passwort.** Die Regeln verlangen zusätzlich, dass die Anmeldung
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
- **Kasten als CSV** — `"Frage";"Antwort";"Kasten"`, Semikolon als Trenner,
  mit BOM, damit Excel die Umlaute richtig anzeigt.
- **CSV einlesen** — dasselbe Format. Eine Kopfzeile `Frage;Antwort;Kasten`
  wird erkannt und übersprungen. Kästen, die es noch nicht gibt, werden
  angelegt. Eine vierte Spalte wird als Notiz übernommen.
- **Zusammenführen oder Ersetzen** — beim JSON-Import gefragt, sobald schon
  Karten im Konto liegen. *Ersetzen* löscht vorher alles.

Eine Sicherung von Zeit zu Zeit ist trotz Firestore sinnvoll: gegen versehentlich
gelöschte Kästen hilft kein Cloud-Speicher.

---

## Fehlerbehebung

| Symptom | Ursache und Abhilfe |
|---|---|
| „In `firebase-config.js` stehen noch Platzhalter" | Schritt 2 nachholen. |
| „Die Datei `firebase-config.js` konnte nicht geladen werden" | Datei fehlt im Repo oder heißt anders. Groß-/Kleinschreibung beachten. |
| „Das Firebase-SDK konnte nicht geladen werden" | Beim ersten Start ohne Netz. Sonst: `SDK_VERSION` prüfen, aktuelle Nummer unter https://firebase.google.com/docs/web/setup. Auch Inhaltsblocker können `gstatic.com` sperren. |
| `auth/unauthorized-domain` | Schritt 6: `gewe77.github.io` freigeben. |
| `auth/operation-not-allowed` | Schritt 3: E-Mail/Passwort aktivieren. |
| App bleibt bei „Daten werden geladen" | Regeln nicht veröffentlicht (Schritt 5) oder Firestore-Datenbank nicht angelegt (Schritt 4). |
| „Firestore verweigert den Zugriff" | Dieselbe Ursache — Regeln aus `firestore.rules` veröffentlichen. |
| „Aus diesem Browser" findet nichts | Anderer Browser oder anderes Gerät als früher, oder Browserdaten gelöscht. Über die JSON-Datei importieren. |
| Alte Version wird noch angezeigt | Hart neu laden (`Strg`+`Umschalt`+`R`). GitHub Pages braucht nach dem Hochladen ein bis zwei Minuten. |
| Punkt bleibt orange | Änderungen warten auf Netz. Sie gehen nicht verloren; die App darf geschlossen werden, sobald der Punkt grün war. |

Der Abschnitt **Diagnose** in den Einstellungen zeigt Projekt-Kennung,
SDK-Version, Verbindungsstand, Bestand und ob im Browser noch Altdaten liegen.
Bei Rückfragen ist das die erste Anlaufstelle.

Meldet die Diagnose **„Karten ohne Kasten"**, gehören Karten zu einem Kasten,
den es nicht mehr gibt — etwa weil beim Löschen die Verbindung abbrach oder
zwei Geräte gleichzeitig etwas geändert haben. Solche Karten kämen in keiner
Sitzung mehr vor, würden aber weiter mitgezählt. Der Knopf **„In einen Kasten
einsammeln"** holt sie zurück.

---

## Bewusst noch nicht enthalten

Stufe 1 ist absichtlich funktionsgleich zur Vorgängerversion. Es fehlen
deshalb, weil sie zu Stufe 2 und später gehören:

- FSRS als Scheduler, Retention-Regler, Fach-Ableitung aus der Stabilität,
  Klassik-Modus als Umschalter, Tagespensum — **Stufe 2**, zusammen mit der
  neuen Oberfläche nach `KONZEPT.md` §8
- Tippen, Multiple Choice, Hörmodus, Cloze, Abfragerichtungen — **Stufe 3**
- Prüfungsplaner, Leech-Management, Karten-Check, Wochenbericht,
  Zeitauswertung — **Stufe 4**

Die Datenfelder dafür (`retention`, `neuProTag`, `zielMinuten`, `modi`,
`richtung`, `pruefungsdatum`, `typ`, `tags`) werden bereits geschrieben und
tragen sinnvolle Vorgaben. Die späteren Stufen können darauf aufsetzen, ohne
den Bestand anzufassen.
