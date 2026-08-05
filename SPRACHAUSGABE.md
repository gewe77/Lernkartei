# KI-Sprachausgabe für HAN CROCO — Entscheidungsgrundlage

Kein Code, keine Umsetzung. Diese Datei legt die Wege nebeneinander, rechnet
die Kosten für **deinen** Bestand aus und benennt am Ende, was ich empfehlen
würde und warum. Entscheiden musst du.

Ausgangspunkt: Beim Schleifchenturnier läuft **ElevenLabs**. Der Vergleich ist
deshalb um ElevenLabs herum aufgebaut; die Alternativen stehen in Abschnitt 6,
weil sie an einer Stelle einen erheblichen Unterschied machen.

Preise und Tarife: Stand August 2026, Quellen am Ende.

---

## 1. Was die Browser-Stimme heute nicht kann

Der Hörmodus benutzt `speechSynthesis`, die eingebaute Stimme des Geräts.
Kostenlos, offline, kein Schlüssel — aber:

- **Auf jedem Gerät klingt es anders.** iPhone, Windows und Android bringen
  verschiedene Stimmen mit; auf manchen Linux-Browsern gibt es gar keine
  deutsche.
- **Einzelne Wörter werden schlecht ausgesprochen.** Genau der Normalfall bei
  Vokabelkarten — ohne Satzkontext rät die Stimme die Betonung.
- **Keine Steuerung.** Kein langsames Sprechen, keine zwei Stimmen, kein
  Buchstabieren.

Was eine echte TTS-Stimme daran ändert, steht in Abschnitt 10 — und das ist der
eigentliche Grund für den Aufwand, nicht „klingt hübscher".

---

## 2. Das eine Problem, das jede Bauweise lösen muss

HAN CROCO ist eine **statische Seite auf GitHub Pages**. Es gibt keinen Server,
der einen Schlüssel geheim halten könnte. Ein ElevenLabs-Schlüssel in
`index.html` oder `firebase-config.js` steht im öffentlichen Repository — und
er **ist** die Bezahlung.

Beim Firebase-`apiKey` ist das unbedenklich, weil er nur das Projekt benennt
und die Absicherung in den Security Rules steckt. Hier ist es umgekehrt.
ElevenLabs sagt das in der eigenen Dokumentation ausdrücklich:

> „Do not share it with others or expose it in any client-side code (browsers,
> apps)."

Immerhin: ElevenLabs-Schlüssel lassen sich **einschränken** — auf einzelne
Endpunkte (nur `text_to_speech`) und mit einem **eigenen Kreditlimit je
Schlüssel**. Das entschärft den schlimmsten Fall (jemand erzeugt auf deine
Rechnung Hörbücher), hebt die Empfehlung aber nicht auf.

Daraus ergeben sich drei Bauweisen.

---

## 3. Die drei Bauweisen im Überblick

| | **A · Vorproduzieren** | **B · Cloud Function** | **C · Schlüssel im Konto** |
|---|---|---|---|
| Wo entsteht das Audio | auf deinem Rechner, einmalig | in einer Firebase-Funktion | direkt im Browser |
| Schlüssel liegt | bei dir | als Secret in der Funktion | im Browser jedes Kontos |
| Sicherheit | sauber | sauber | vertretbar, nicht sauber |
| Ablage der Dateien | **Repo** oder Firebase Storage² | Firebase Storage² | — |
| Firebase-Tarif | **keiner nötig²** | **Blaze nötig** | Spark |
| Kosten fallen an | **einmal je Karte** | einmal je Karte¹ | **bei jeder Abfrage** |
| Wartezeit beim Lernen | keine | ~0,3 s beim ersten Mal | ~0,3 s jedes Mal |
| Offline | ja | ja¹ | nein |
| Neue Karte spricht | erst nach dem nächsten Lauf | sofort | sofort |
| Aufwand | ein Nachmittag | ein Tag | zwei Stunden |
| Regeländerung nötig | **keine²** | Storage-Regeln | keine |

¹ nur mit Zwischenspeicher — ohne den zahlst du jede Wiederholung erneut, und
das ist bei Karteikarten der teuerste Fehler, den man machen kann (siehe
Abschnitt 5).

² **Korrektur gegenüber der ersten Fassung dieser Datei.** Cloud Storage for
Firebase verlangt seit September 2024 den **Blaze-Tarif**; Spark-Projekte
bekommen 402/403-Fehler. Dein Projekt hat einen Bucket im neuen Format
(`lernkarteikarten.firebasestorage.app`), ist also betroffen. Bauweise A
braucht Firebase Storage aber gar nicht — siehe unten.

### A · Vorproduzieren

Ein Skript auf deinem Rechner liest den Kartenbestand, erzeugt je Karte und
Seite eine MP3 und legt sie ab. Die App spielt nur noch ab; fehlt eine Datei,
greift die heutige Browser-Stimme als Rückfall.

**Wohin mit den Dateien — und hier liegt der Unterschied:**

*Variante A1 — ins Repository.* Die MP3-Dateien kommen unter `audio/` in
dasselbe Repository, das GitHub Pages ausliefert. Die App lädt sie über einen
relativen Pfad: `audio/<kartenId>-v.mp3`.

```
2.000 Karten × 2 Seiten × ~15 KB  ≈  60 MB
```

Dein Repository ist heute 4,8 MB groß; GitHub wird erst ab etwa 1 GB
ungemütlich. **Kein Firebase Storage, kein Blaze-Tarif, keine
Storage-Regeln, keine laufenden Kosten.** Der Browser speichert die Dateien
ohnehin zwischen.

*Variante A2 — in Firebase Storage.* Sauberer getrennt und je Konto
abschirmbar, verlangt aber den Blaze-Tarif (siehe Fußnote ²).

*Dafür (beide):* Der Schlüssel verlässt deinen Rechner nie. Kein Warten beim
Lernen. Funktioniert offline.

*Dagegen:* Nach einem größeren Kartenzugang musst du das Skript von Hand
anstoßen. Bei einem Bestand, der in Schüben über CSV wächst, fällt das kaum
ins Gewicht — die Diagnose könnte „N Karten ohne Sprachdatei" melden.

*Zu bedenken bei A1:* Die Audiodateien liegen öffentlich im Repository. Wer
die Adresse kennt, kann sie abspielen und damit den Karteninhalt hören. Bei
Vokabeln und Prüfungsstoff ist das unerheblich — bei etwas Vertraulichem wäre
es A2.

### B · Cloud Function

Eine kleine Firebase-Funktion nimmt den Text, prüft über Firebase Auth, dass
eines der drei Konten fragt, ruft ElevenLabs mit dem Schlüssel auf und legt das
Ergebnis in Storage ab. Der Browser sieht den Schlüssel nie.

*Dafür:* Alles automatisch, auch für frisch angelegte Karten. Ein Zähler je
Konto ist leicht einzubauen.

*Dagegen:* **Cloud Functions verlangen den Blaze-Tarif.** Der hat ein
großzügiges kostenloses Kontingent, verlangt aber eine hinterlegte
Zahlungsmethode. Bisher läuft dein ganzes Projekt im Spark-Tarif ohne jedes
Kostenrisiko — das aufzugeben ist die eigentliche Entscheidung hier, nicht die
Technik.

### C · Schlüssel im Konto

Ein Feld in den Einstellungen, der Wert landet im privaten
Firestore-Dokument des Kontos. Mit einem auf `text_to_speech` eingeschränkten
Schlüssel und einem Kreditlimit von etwa 10.000 pro Monat.

*Dafür:* In zwei Stunden gebaut, keine Tarifänderung, jeder zahlt seinen
eigenen Verbrauch.

*Dagegen:* Der Schlüssel liegt im Browser — genau das, wovon ElevenLabs
abrät. Und alle drei Personen müssten sich je ein Konto anlegen; erfahrungsgemäß
ist das der Punkt, an dem so etwas liegen bleibt.

*Wofür es taugt:* als Versuchsaufbau von einer Stunde, um überhaupt zu hören,
ob die Stimmen den Unterschied wert sind. Nicht als Dauerlösung.

---

## 4. Welches ElevenLabs-Modell?

| Modell | Sprachen | Kredite je Zeichen | Verzögerung | Wofür |
|---|---|---|---|---|
| **Flash v2.5** | 32, inkl. Deutsch | **0,5** | ~75 ms | Vokabeln, einzelne Begriffe |
| **Multilingual v2** | 29, inkl. Deutsch | 1,0 | höher | Sätze, längere Definitionen |
| **v3** | 70+ | 1,0 | höher | ausdrucksstark, hier unnötig |

*(Turbo v2.5 ist abgekündigt, Flash v2.5 ist der Nachfolger.)*

**Flash v2.5 kostet die Hälfte** und reicht für Karteikarten aus: Der
Qualitätsunterschied zeigt sich bei Emotion und Satzmelodie, nicht bei „to run"
oder „Mitochondrium". Bei langen Antwortkarten wäre Multilingual v2 die bessere
Wahl — man könnte das je Kasten einstellen, so wie heute schon die Sprache.

---

## 5. Was es kostet — für deinen Bestand

ElevenLabs-Tarife (monatlich, jährliche Zahlung günstiger):

| Tarif | Preis | Kredite/Monat | entspricht Flash v2.5 |
|---|---|---|---|
| Free | 0 $ | 10.000 | 20.000 Zeichen |
| Starter | 6 $ | 30.000 | 60.000 Zeichen |
| Creator | 22 $ | 100.000 | **200.000 Zeichen** |
| Pro | 99 $ | 500.000 | 1.000.000 Zeichen |

Überschreitung wird nachberechnet, beim Creator-Tarif mit 0,30 $ je 1.000
Zeichen — das ist teuer, man bleibt besser im Kontingent.

**Die Rechnung.** Nimm im Schnitt 40 Zeichen je Kartenseite, beide Seiten
gesprochen:

| Bestand | Zeichen gesamt | Kredite (Flash) | reicht dafür |
|---|---|---|---|
| 500 Karten | 40.000 | 20.000 | **Starter, ein Monat** (6 $) |
| 2.000 Karten | 160.000 | 80.000 | **Creator, ein Monat** (22 $) |
| 5.000 Karten | 400.000 | 200.000 | Creator, zwei Monate (44 $) |

**Und danach?** Laufend kommen vielleicht 50 neue Karten im Monat dazu:

```
50 Karten × 2 Seiten × 40 Zeichen = 4.000 Zeichen = 2.000 Kredite
```

Das passt fünffach in den **kostenlosen** Tarif (10.000 Kredite).

> **Der Plan, der sich daraus ergibt:** Einen Monat Creator buchen (22 $), den
> gesamten Bestand vorproduzieren, danach auf Free zurückgehen. Ab dann
> kostenlos, solange nicht Tausende Karten auf einmal dazukommen.

Das gilt **nur mit Bauweise A oder B samt Zwischenspeicher**. Ohne Speicherung
zahlst du jede Wiederholung neu: Eine Karte kommt über die Jahre gut zwanzigmal
dran — aus 22 $ würden 440 $.

*Randnotiz:* Der kostenlose Tarif hat keine kommerzielle Lizenz. Für privates
Lernen in drei Konten ist das unerheblich, sollte aber bekannt sein.

---

## 6. Der ehrliche Vergleich mit den Alternativen

Preise je Million Zeichen:

| Anbieter | Preis | Kostenlos je Monat | Dein Bestand (160.000 Zeichen) |
|---|---|---|---|
| **Google Chirp 3 HD** | 30 $ | **1 Mio. Zeichen** | **0 €** |
| Google Neural2 | 16 $ | 1 Mio. Zeichen | 0 € |
| Google Standard | 4 $ | 4 Mio. Zeichen | 0 € |
| OpenAI `gpt-4o-mini-tts` | ~15 $ | 5 $ Startguthaben | ~2,40 $ einmalig → **faktisch 0 €** |
| **ElevenLabs Flash v2.5** | ~50 $ | 20.000 Zeichen | **22 $ einmalig** (ein Monat Creator) |
| ElevenLabs Multilingual v2 | ~100 $ | 10.000 Zeichen | 44 $ einmalig |

Das muss man aussprechen: **Google Cloud Text-to-Speech wäre für deinen Bestand
schlicht kostenlos**, dauerhaft, und läuft im selben Google-Projekt wie
Firebase — ein Konto weniger, eine Abrechnung weniger. Chirp 3 HD ist nicht auf
ElevenLabs-Niveau, aber weit über der Browser-Stimme.

Umgekehrt gilt: Weil Bauweise A die Kosten **einmalig** macht, schrumpft der
Unterschied auf **22 € gegen 0 €**. Bei einem Werkzeug, das du über Jahre
täglich benutzt, ist das kein Argument mehr — dann darf die Stimme entscheiden.

Zu OpenAI gibt es einen Sonderfall, der eine eigene Betrachtung verdient — der
nächste Abschnitt.

---

## 7. OpenAI im Detail

### Zuerst das Missverständnis, das teuer werden kann

**Ein ChatGPT-Plus-Abo enthält keinen API-Zugang und kein API-Guthaben.**

Das sind zwei getrennte Produkte mit getrennten Konten und getrennten
Rechnungen:

| | ChatGPT Plus | OpenAI API |
|---|---|---|
| Wo | `chatgpt.com` | `platform.openai.com` |
| Preis | 20 $/Monat pauschal | nach Verbrauch, Prepaid |
| Wofür | Weboberfläche, App, Vorlesefunktion im Chat | Programmzugriff, MP3-Dateien |
| Für HAN CROCO | **nutzlos** | das, was du brauchst |

OpenAI schreibt das ausdrücklich: „API usage is separate and billed
independently." Die Vorlesefunktion in ChatGPT lässt sich weder exportieren
noch automatisieren — du kannst damit keine 4.000 MP3-Dateien erzeugen.

Dein Plus-Abo hilft hier also **nicht**. Es schadet aber auch nichts: Für die
API brauchst du nur ein zusätzliches Konto, kein zweites Abo.

### Was einzurichten wäre

1. Konto auf `platform.openai.com` (Anmeldung mit derselben Adresse möglich,
   Abrechnung bleibt getrennt)
2. Zahlungsmethode hinterlegen und Guthaben aufladen — **Prepaid ohne
   Mindestbetrag**, neue Konten bekommen **5 $ Startguthaben**
3. Einen Projekt-Schlüssel erzeugen (auf ein Projekt begrenzbar)
4. Ein **hartes Ausgabenlimit** setzen, etwa 5 $/Monat. Das ist bei OpenAI
   gut gelöst: Bei Erreichen wird abgeschaltet, nicht nachberechnet.

Schritt 4 ist der Grund, warum OpenAI beim Kostenrisiko besser dasteht als
ElevenLabs, wo Überschreitung mit 0,30 $ je 1.000 Zeichen nachberechnet wird.

### Wie ein Aufruf aussieht

```
POST https://api.openai.com/v1/audio/speech
Authorization: Bearer sk-…

{
  "model": "gpt-4o-mini-tts",
  "voice": "nova",
  "input": "to run — laufen, rennen",
  "instructions": "Sprich langsam und deutlich, wie ein Sprachlehrer.
                   Kurze Pause nach dem englischen Wort.",
  "response_format": "mp3",
  "speed": 0.9
}
```

Antwort ist direkt die MP3-Datei. In Bauweise A landet sie in Firebase Storage,
die Adresse kommt an die Karte. Grenze: 2.000 Token je Aufruf bei
`gpt-4o-mini-tts`, 4.096 Zeichen bei `tts-1` — für Karteikarten reichlich.

### Modelle und Kosten

| Modell | Preis je 1 Mio. Zeichen | Stimmen | Besonderheit |
|---|---|---|---|
| `tts-1` | 15 $ | 9 | schnell, solide |
| `tts-1-hd` | 30 $ | 9 | etwas sauberer |
| **`gpt-4o-mini-tts`** | ~15 $ (≈0,015 $/Min) | **13** | **`instructions`-Parameter** |

Für deinen Bestand (160.000 Zeichen):

```
tts-1  oder  gpt-4o-mini-tts  →  ~2,40 $     einmalig
tts-1-hd                      →  ~4,80 $     einmalig
```

**Das 5-$-Startguthaben deckt das ab.** Faktisch: 0 €, ohne je etwas
aufzuladen. Laufend kämen bei 50 neuen Karten im Monat rund 0,06 $ dazu.

### Der eine Vorteil, den nur OpenAI hat

Der `instructions`-Parameter sagt der Stimme, **wie** sie sprechen soll — nicht
nur was. Für eine Lernkartei ist das genau die richtige Stellschraube:

> „Sprich langsam und überdeutlich, wie für einen Anfänger. Betone die
> zweite Silbe."

Weder Google noch ElevenLabs bieten das in dieser Form. Kombiniert mit dem
`speed`-Parameter (0,25 bis 4,0) hättest du die Langsam-Taste aus Abschnitt 10
serverseitig statt über `playbackRate`.

### Der eine Nachteil, der es hier meistens erledigt

OpenAI schreibt in der eigenen Dokumentation, die Stimmen seien
**„optimized for English"**. Über 80 Sprachen funktionieren technisch — aber
nicht-englische klingen nach *einem Amerikaner, der Deutsch spricht*.

Im OpenAI-Forum berichten Nutzer das durchgängig für Niederländisch,
Italienisch und Hebräisch; dort wird für andere Sprachen ausdrücklich auf
ElevenLabs verwiesen. Ein Community-Beitrag bringt die Ursache auf den Punkt:
die Modelle wurden überwiegend von nordamerikanischen Sprechern trainiert.

**Für eine Vokabelkartei ist das der schlimmstmögliche Fehler.** Beim Hören
lernst du die Aussprache mit — und dann eben die falsche. Eine schlechte
Aussprache, die man sich über Monate einschleift, bekommt man schwer wieder
weg. Da ist die heutige Browser-Stimme fast ehrlicher, weil ihr niemand
vertraut.

### Wann OpenAI trotzdem die richtige Wahl ist

Zwei Fälle, und sie sind nicht klein:

- **Englische Karten.** Hier ist OpenAI in seinem Element und klingt
  hervorragend — besser als Google Neural2, auf ElevenLabs-Niveau.
- **Deutsche Sachkarten** (Biologie, BWL, Prüfungswissen). Da lernst du
  Inhalt, nicht Aussprache. Ein leichter Akzent ist lästig, aber unschädlich —
  und der `instructions`-Parameter gleicht das mehr als aus, weil du
  Fachbegriffe langsam und betont vorlesen lassen kannst.

**Nicht geeignet für:** Französisch, Spanisch, Italienisch, Latein — überall,
wo die Aussprache Teil des Lernstoffs ist.

### Zusammengefasst

| | |
|---|---|
| Plus-Abo nutzbar | **nein**, getrenntes API-Konto nötig |
| Kosten für deinen Bestand | ~2,40 $ — vom Startguthaben gedeckt |
| Kostenrisiko | gering, hartes Ausgabenlimit möglich |
| Englisch | sehr gut |
| Deutsch | brauchbar, amerikanisch gefärbt |
| Andere Sprachen | **problematisch** |
| Alleinstellung | `instructions` — Sprechweise steuerbar |

---

---

## 8. Google Chirp 3 HD im Detail

### Was das ist

Chirp 3 HD ist Googles neueste Stimmengeneration, vorgestellt 2025 und
inzwischen der Nachfolger von WaveNet und Neural2. Die Stimmen sind nach
Himmelskörpern benannt und über alle Sprachen hinweg gleich — du wählst also
erst die Stimme, dann die Sprache.

**Der entscheidende Unterschied zu OpenAI:** Chirp-3-Stimmen sind je Sprache
eigenständig trainiert. `de-DE-Chirp3-HD-Kore` ist eine **deutsche** Stimme,
kein englisches Modell, das Deutsch vorliest. Das Akzentproblem aus Abschnitt 7
gibt es hier nicht.

### Stimmen

Rund 30 Stimmen, verfügbar in über 30 Sprachen, Deutsch (`de-DE`) inbegriffen.
Das Namensschema ist `<sprache>-Chirp3-HD-<Stimme>`:

```
de-DE-Chirp3-HD-Kore        en-GB-Chirp3-HD-Kore        fr-FR-Chirp3-HD-Kore
```

| | Stimmen |
|---|---|
| **weiblich** | Achernar, Aoede, Autonoe, Callirrhoe, Despina, Erinome, Gacrux, Kore, Laomedeia, Leda, Pulcherrima, Sulafat, Vindemiatrix, Zephyr |
| **männlich** | Achird, Algenib, Algieba, Alnilam, Charon, Enceladus, Fenrir, Iapetus, Orus, Puck, Rasalgethi, Sadachbia, Sadaltager, Schedar, Umbriel, Zubenelgenubi |

Dass dieselbe Stimme in jeder Sprache verfügbar ist, passt hier gut: Du könntest
je Kasten **eine Stimme für die Frageseite und eine für die Antwortseite**
festlegen — etwa Kore für Englisch, Charon für Deutsch — und dieses Paar über
alle Kästen durchhalten. Das Ohr gewöhnt sich daran und weiß nach zwei Tagen
schon am Klang, welche Seite gerade dran ist.

### Was sich steuern lässt — und hier wird es interessant

**1. Tempo.** `speaking_rate` von 0,25 bis 2,0. Deine Langsam-Taste, ohne
Qualitätsverlust durch nachträgliches Verlangsamen im Browser.

**2. Pausen.** Markup direkt im Text:

```
"to run  [pause short]  laufen, rennen"
```

**3. Aussprache nach IPA.** Du kannst die Aussprache eines Wortes
**phonetisch vorgeben** — in IPA oder X-SAMPA. Wenn eine Stimme „Chassis"
oder „Photosynthese" falsch betont, korrigierst du das exakt, statt zu hoffen.

Punkt 3 ist für eine Vokabelkartei die stärkste Einzelfunktion im ganzen
Vergleich. Weder ElevenLabs noch OpenAI bieten so etwas. Für einen Karteikasten,
in dem Aussprache **Lernstoff** ist und nicht Beiwerk, ist das genau das
richtige Werkzeug — man könnte ein optionales Feld `lautschrift` an der Karte
vorsehen und es, wenn gefüllt, an die Sprachausgabe durchreichen.

*Einschränkung:* SSML ist bei Chirp 3 nur eingeschränkt und als Vorschau
verfügbar, bei Streaming-Anfragen gar nicht. Für vorproduzierte Dateien
(Bauweise A) spielt das keine Rolle.

### Kosten

| Modell | Preis je 1 Mio. Zeichen | Kostenlos je Monat |
|---|---|---|
| Standard | 4 $ | 4 Mio. Zeichen |
| Neural2 | 16 $ | 1 Mio. Zeichen |
| **Chirp 3 HD** | **30 $** | **1 Mio. Zeichen** |
| Studio | 160 $ | 1 Mio. Zeichen |

Das Freikontingent **erneuert sich jeden Monat**. Dein Bestand:

```
160.000 Zeichen  von  1.000.000 kostenlosen  →  0 €
```

Du könntest den gesamten Bestand **sechsmal** neu vertonen und wärst noch im
Freikontingent. Laufend (50 neue Karten/Monat, 4.000 Zeichen) bewegst du dich
bei 0,4 % davon. Realistisch: **dauerhaft 0 €**, nicht „erstmal 0 €".

### Der Haken, den man kennen muss

**Google verlangt eine hinterlegte Zahlungsmethode, auch für das
Freikontingent.** Ohne aktivierte Abrechnung lässt sich die Text-to-Speech-API
nicht einschalten. Bezahlt wird erst ab Zeichen 1.000.001 — aber die Karte muss
hinterlegt sein.

Damit steht Google beim *Kostenrisiko* schlechter da als gedacht und ungefähr
gleichauf mit dem, was ich bei Bauweise B als Haupteinwand genannt habe.

**Der Ausweg, falls dir das wichtig ist:** Lege die Text-to-Speech-API in einem
**eigenen Google-Cloud-Projekt** an, nicht in `lernkarteikarten`. Dann bleibt
dein Firebase-Projekt unangetastet auf Spark. Das TTS-Projekt braucht die
Zahlungsmethode, dein Kartenkasten nicht. Bei Bauweise A1 (Dateien im
Repository) berühren sich die beiden ohnehin nie.

*Nebenbei:* Neukunden bei Google Cloud bekommen 300 $ Startguthaben für
90 Tage. Auch das deckt den Fall ab.

### Wie ein Aufruf aussieht

```
POST https://texttospeech.googleapis.com/v1/text:synthesize

{
  "input":  { "text": "to run [pause short] laufen, rennen" },
  "voice":  { "languageCode": "de-DE", "name": "de-DE-Chirp3-HD-Kore" },
  "audioConfig": { "audioEncoding": "MP3", "speakingRate": 0.9 }
}
```

Zurück kommt die MP3 als Base64 im JSON. Anmeldung über ein
Dienstkonto-Schlüsselpaar (JSON-Datei), das beim Vorproduzieren auf deinem
Rechner liegt und nie in die App gelangt.

### Zusammengefasst

| | |
|---|---|
| Kosten für deinen Bestand | **0 €**, sechsfach im Freikontingent |
| Laufende Kosten | 0 €, Kontingent erneuert sich monatlich |
| Zahlungsmethode nötig | **ja**, auch fürs Freikontingent |
| Deutsch | **echte deutsche Stimmen**, kein Akzentproblem |
| Fremdsprachen | über 30 Sprachen, jeweils muttersprachlich |
| Qualität | sehr gut, knapp unter ElevenLabs |
| Alleinstellung | **Aussprache per IPA vorgebbar**, Pausen-Markup, Tempo |
| Passt zum Projekt | gleicher Google-Account wie Firebase |

---

## 9. Meine Empfehlung

**Ich habe sie geändert.** In der ersten Fassung stand hier ElevenLabs. Zwei
Erkenntnisse aus der Detailprüfung haben das Bild verschoben, und ich halte es
für richtig, das offen zu schreiben statt die alte Empfehlung stehen zu lassen.

**Jetzt: Bauweise A1 (Dateien im Repository) mit Google Chirp 3 HD.**

### Was sich geändert hat

**Erstens:** Mein Hauptargument für ElevenLabs war, dass Bauweise A ohne
hinterlegte Zahlungsmethode auskommt. Das stimmt so nicht. Für den Bestand
bräuchtest du einen Monat Creator — also ohnehin eine Zahlung. Und Firebase
Storage verlangt inzwischen Blaze. Der vermeintliche Vorteil war keiner.

**Zweitens:** Chirp 3 HD kann die **Aussprache per IPA vorgeben**. Für einen
Karteikasten, in dem Aussprache Lernstoff ist, ist das die nützlichste
Einzelfunktion im ganzen Vergleich — und sie fehlt bei ElevenLabs.

### Die Begründung

1. **Bauweise A1**, weil die MP3-Dateien einfach ins Repository gehören, das
   du ohnehin schon ausrollst. Kein Firebase Storage, kein Blaze, keine
   Storage-Regeln, keine neue Fehlerquelle. 60 MB in einem 4,8-MB-Repository
   sind kein Problem.
2. **Chirp 3 HD**, weil es dauerhaft 0 € kostet (dein Bestand passt sechsfach
   ins monatliche Freikontingent), echte deutsche und fremdsprachliche Stimmen
   hat und mit IPA, Pausen-Markup und Tempo genau die drei Regler bietet, die
   eine Lernkartei braucht.
3. **Gleicher Google-Account wie Firebase** — ein Anbieter weniger. Und wenn
   du dein Kartenprojekt vom Abrechnungsthema freihalten willst, legst du die
   TTS-API in einem eigenen Cloud-Projekt an.

### Wann ich trotzdem bei ElevenLabs bliebe

Wenn dir **Stimmqualität über alles geht**. ElevenLabs klingt hörbar besser,
und du kennst die Schnittstelle bereits. 22 € einmalig sind kein ernsthaftes
Gegenargument. Das ist eine legitime Wahl, keine schlechtere — sie gewichtet
Klang höher als Steuerbarkeit.

### Wann OpenAI

Nur bei Kästen, die überwiegend **Englisch oder deutsches Sachwissen**
enthalten. Dann ist es sogar sehr gut und praktisch kostenlos. Sobald
Französisch, Spanisch oder Italienisch dazukommen, fällt es wegen des Akzents
aus.

**Was ich nicht empfehlen würde:** Bauweise C als Dauerlösung, Bauweise B ohne
Zwischenspeicher, und OpenAI für romanische Sprachen.

---

## 10. Wofür sich der Aufwand lohnt — didaktisch

Wenn nur „hübscher vorlesen" herauskommt, lohnt es sich nicht. Diese drei Dinge
gehen mit einer echten Stimme und mit der Browser-Stimme nicht:

**1. Verschiedene Stimmen für Frage und Antwort.**
In einem Englisch-Deutsch-Kasten liest eine englische Stimme die englische
Seite, eine deutsche die deutsche. Heute versucht eine Stimme beides — das ist
der häufigste Grund, warum der Hörmodus unbrauchbar wirkt. Die Felder
`sprache` und `spracheAntwort` gibt es je Kasten **bereits**; es fehlt nur die
Stimme dazu.

**2. Langsam-Taste.**
Zweiter Klick auf 🔊 spielt dieselbe Datei mit `playbackRate = 0.75`. Kostet
keinen einzigen Kredit extra und hilft beim Nachsprechen erheblich.

**3. Diktat-Modus.**
Ein neuer Lernmodus: Die Karte wird nur vorgelesen, die Antwort wird getippt —
ohne dass der Text zu sehen ist. Das ist die härteste und wirksamste
Abfrageform für Sprachen, und sie passt in die vorhandene Modus-Mechanik
(`MODI_ALLE`) hinein, ohne dass am Scheduler etwas geändert werden müsste.

Punkt 3 ist aus meiner Sicht der eigentliche Gewinn. Punkte 1 und 2 sind
Nebenprodukte, die fast nichts kosten.

---

## 11. Was zu entscheiden ist, bevor gebaut wird

1. **Bauweise** — A1 (Dateien im Repository, ★ Empfehlung), A2 (Firebase
   Storage, braucht Blaze), B oder erst C als Versuch?
2. **Anbieter** — Google Chirp 3 HD (dauerhaft 0 €, IPA-Steuerung,
   ★ Empfehlung), ElevenLabs (bester Klang, 22 € einmalig) oder OpenAI (nur
   Englisch und deutsches Sachwissen)?
3. **Welche Sprachen kommen in deinen Kästen wirklich vor?** Diese Frage
   entscheidet Punkt 2 fast allein — bei reinem Englisch/Deutsch ist OpenAI
   vorne, sobald Französisch oder Spanisch dabei ist, fällt es aus.
4. **Umfang** — nur Fremdsprachen-Kästen oder alle? Nur die Frageseite oder
   beide? Das bestimmt die Kosten unmittelbar.
5. **Stimmen** — je Kasten eine feste Stimme, oder eine für Deutsch und eine
   für jede Fremdsprache?
6. **Diktat-Modus** — gleich mit, oder erst wenn die Stimmen stehen?

Sag mir zu 1 bis 3 deine Wahl, dann baue ich es — mit denselben Abnahmetests
wie bisher, damit die Sprachausgabe nicht das erste Stück der App wird, das
niemand geprüft hat.

---

## Quellen

- [ElevenLabs — Preise und Tarife](https://comparedge.com/tools/elevenlabs/pricing)
- [ElevenLabs — Modelle und Sprachen](https://elevenlabs.io/docs/models)
- [ElevenLabs — Schlüssel einschränken](https://elevenlabs.io/docs/api-reference/authentication)
- [ElevenLabs — Kreditverbrauch und Nachberechnung](https://flexprice.io/blog/elevenlabs-pricing-breakdown)
- [Google Cloud Text-to-Speech — Preise und Freikontingent](https://cloud.google.com/text-to-speech/pricing)
- [Google — Chirp 3 HD, Stimmen und Steuerung](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd)
- [Google — Abrechnung muss aktiviert sein](https://discuss.google.dev/t/confusion-over-text-to-speech-fees/180199)
- [Firebase — Cloud Storage verlangt Blaze (seit Sept. 2024)](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024)
- [OpenAI TTS — Preise und Modelle](https://texttolab.com/blog/openai-tts-pricing)
- [OpenAI — ChatGPT Plus enthält keinen API-Zugang](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus)
- [OpenAI — TTS-Handbuch, „optimized for English"](https://developers.openai.com/api/docs/guides/text-to-speech)
- [OpenAI-Forum — amerikanischer Akzent in anderen Sprachen](https://community.openai.com/t/tts-voices-have-a-clear-us-accent/705394)
