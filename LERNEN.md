# Das eigentliche Lernen — Vorschläge

Kein Code, keine Umsetzung. Diese Datei beschreibt, was in HAN CROCO fehlt,
was die Forschung dazu sagt, und fünf Wege, es einzubauen. Entscheiden musst
du.

Quellen am Ende, Stand August 2026.

---

## 1. Die Diagnose: Die App prüft, sie lehrt nicht

HAN CROCO kann eines sehr gut — den **richtigen Zeitpunkt** für die nächste
Abfrage bestimmen. FSRS ist dafür das beste verfügbare Verfahren, und die
Statistik, die Prüfungsplanung und die Problemkartenerkennung hängen sauber
daran.

Was die App überhaupt nicht kann: einer Karte **beim Hineingehen in den Kopf
helfen**. Das ist keine Lücke im Feinschliff, sondern eine fehlende Hälfte.
Lernen zerfällt in zwei Tätigkeiten:

| | **Erwerb** | **Erhalt** |
|---|---|---|
| Frage | Wie kommt es rein? | Wie bleibt es drin? |
| Dauer | Minuten, eine Sitzung | Monate, viele Sitzungen |
| In HAN CROCO | **fehlt** | FSRS, sehr gut |

Dein physischer Kasten hatte beides: den Umlauf *und* den Stapel, den du zur
Seite gelegt hast.

### Der Beleg im Code

`bewerten()` endet ausnahmslos mit `s.i++` — die Karte wird eine Position
weitergeschoben, **unabhängig von der Bewertung**. Eine mit „1 — nicht
gewusst" bewertete Karte kommt in derselben Sitzung kein einziges Mal wieder.
Sie ist genau so oft abgefragt worden wie eine, die du im Schlaf konntest:
einmal.

Das ist nicht bloß eine verpasste Gelegenheit. Es ist die Bedingung, die in
der bekanntesten Untersuchung dazu **am schlechtesten abgeschnitten hat**.

---

## 2. Dein Papierverfahren hat einen Namen — und die besten Zahlen im Feld

Was du beschrieben hast — Karte zur Seite legen, bis zum Beherrschen üben,
dann zurück in den Umlauf — heißt in der Forschung **successive relearning**:
innerhalb einer Sitzung bis zu einem *Kriterium* abrufen, und das über
mehrere, zeitlich verteilte Sitzungen wiederholen.

Die Zahlen dazu sind für dieses Feld ungewöhnlich deutlich:

- **Klausurleistung:** über 10 Prozentpunkte besser als die gewohnte
  Lernweise der Studierenden — rund eine ganze Note.
- **Behalten nach 24 Tagen:** 68 % gegenüber 26 %.
- **Effektstärken** von *d* = 1,82 bis 2,51 gegenüber reinem Ersteinprägen.
- Drei Wiederholsitzungen reichen; darüber flacht der Gewinn ab.

Und der Punkt, der HAN CROCO unmittelbar trifft — Karpicke und Roediger
haben genau die Frage untersucht, die dein `s.i++` beantwortet: *Was passiert,
wenn man eine Karte aus dem Verkehr zieht, sobald sie einmal saß?*

| Verfahren | Behalten nach einer Woche |
|---|---|
| Weiter abfragen, auch was schon saß | **44 %** |
| Nicht mehr lernen, aber weiter abfragen | 44 % |
| Geballt statt verteilt | 36 % |
| **Nach dem ersten Treffer ganz weglassen** | **21 %** |

Ihr Fazit: Wiederholtes **Abrufen** bereits gekonnter Inhalte steigert das
Behalten um über 100 %; wiederholtes **Ansehen** bringt gar nichts. Das
verbreitete „was sitzt, kann weg" ist der schlechteste der geprüften Wege.

Dein Bauchgefühl am Papierkasten war also nicht Nostalgie. Es war das
Verfahren mit der besten Beleglage — und die App macht derzeit das Gegenteil.

---

## 3. Ein Wort zum „Lerntyp" — und warum das eine gute Nachricht ist

Du schreibst, dein Lerntyp sei das Aufschreiben gewesen. Dazu gehört eine
unbequeme und eine erfreuliche Hälfte.

**Die unbequeme:** Lerntypen im Sinne von „ich bin visuell / auditiv /
kinästhetisch" halten der Prüfung nicht stand. Eine Metaanalyse von 2024
findet zwar einen kleinen Effekt fürs Anpassen des Unterrichts an den
angeblichen Typ (*g* = 0,31), aber die entscheidende Bedingung — dass *jeder*
Typ von *seinem* Zuschnitt profitiert — zeigt sich nur in 26 % der Messungen.
Die Autoren halten das ausdrücklich für „zu klein und zu selten", um es zu
empfehlen. Auch die viel zitierte EEG-Studie von 2024, nach der Handschrift
das Gehirn stärker vernetzt als Tippen, trägt weniger, als ihr Titel
verspricht: In einem Fachkommentar wird ihr vorgehalten, dass darin
**überhaupt nichts gelernt wurde**, dass mehr Vernetzung nicht gleich besseres
Behalten ist und dass die Tippbedingung mit *einem Zeigefinger* künstlich
benachteiligt war.

**Die erfreuliche:** Dein Verfahren war trotzdem richtig — nur aus einem
anderen Grund. Es wirkt nicht, weil du ein Schreibtyp bist, sondern weil
Aufschreiben **Erzeugen** ist. Du musst die Antwort aus dem Gedächtnis
herstellen, statt sie wiederzuerkennen. Das ist derselbe Mechanismus, der
Abfragen so wirksam macht, nur mit einer zusätzlichen Hürde.

Und genau deshalb ist das die gute Nachricht: **Wäre es ein Typ, könnte die
App nichts tun. Weil es Erzeugen ist, lässt es sich nachbauen** — mit
Tastatur, und ebenso mit Stift und Zettel neben dem Bildschirm.

---

## 4. Die Vorschläge

### A · Der Übungsstapel ★ Hauptvorschlag

**Was:** Eine Karte, die du mit 1 oder 2 bewertest, verlässt die Sitzung
nicht mehr. Sie wandert in einen Übungsstapel und kommt **später in derselben
Sitzung** wieder — nicht sofort, sondern nach ein paar anderen Karten. Erst
wenn du sie *zweimal mit Abstand* gekonnt hast, ist sie für heute erledigt.

Das ist dein Zur-Seite-Legen, nur dass die App die Buchführung übernimmt.

**Warum genau so:**

- *Nicht sofort wiederholen.* Eine Karte unmittelbar noch einmal zu fragen,
  prüft das Kurzzeitgedächtnis und sonst nichts. Der Abstand von ein paar
  Karten ist der billigste wirksame Bestandteil des ganzen Vorschlags.
- *Zwei Treffer, nicht einer.* Genau der Unterschied zwischen 44 % und 21 %
  in der Tabelle oben.
- *Ein Kriterium, keine feste Zahl von Durchgängen.* Eine schwere Karte
  braucht fünf Anläufe, eine mittlere zwei. Die Forschung zu successive
  relearning arbeitet durchgängig mit Kriterien, nicht mit Zeitvorgaben.

**Der wichtigste Entwurfspunkt:** FSRS bekommt die **erste** Bewertung, nicht
die letzte. Wer eine Karte erst nach vier Anläufen kann, hat sie *nicht*
gekonnt — würde die App am Ende „gewusst" melden, hielte der Scheduler sie
für leichter, als sie ist, und der Termin rutschte zu weit nach hinten. Der
Übungsstapel liegt also **über** dem Scheduler und fasst ihn nicht an.

**Aufwand:** ein Nachmittag. `sitzung` führt bereits eine Kartenliste und
einen Zeiger; es kommen eine Warteschlange und ein Zähler je Karte dazu.
FSRS, Statistik und Problemkartenerkennung bleiben unberührt.

**Der Haken:** Sitzungen werden länger und fühlen sich zäher an — man kommt
langsamer durch den Stapel. Das ist kein Nebeneffekt, sondern der Zweck
(„wünschenswerte Erschwernis"), aber es sollte einstellbar sein und beim
Einschalten erklärt werden.

---

### B · Aufdecken in Stufen ★ Dein Verfahren, digital

**Was:** Für Karten im Übungsstapel wird die Antwort nicht mehr auf einen
Schlag umgedreht, sondern **stufenweise**:

```
1. Frage steht da.        Du versuchst die Antwort — im Kopf, getippt
                          oder auf Papier.
2. Erste Stufe:           die ersten Buchstaben je Wort.
                          „G______ n___ M__________"
3. Zweite Stufe:          das erste Wort vollständig.
4. Ganze Antwort.
5. Wieder zu.             Jetzt vollständig erzeugen.
```

Das ist die formalisierte Fassung deines Umdrehens: ein, zwei Wörter
aufschreiben — umdrehen — mehr aufschreiben. Als **Cover-Copy-Compare** ist
es seit Jahrzehnten untersucht und gilt als „wirksam über Fertigkeiten,
Lernende und Situationen hinweg"; das übliche Kriterium sind dort drei
fehlerfreie Wiedergaben hintereinander.

**Die Entwurfsentscheidung, auf die es ankommt:** Die App verlangt **nicht**,
dass du tippst. Sie stellt die Stufen bereit und führt Buch über das
Kriterium — ob du dabei in die Tastatur greifst, auf einen Zettel schreibst
oder es dir vorsagst, bleibt dir überlassen. Damit bleibt dein Papierweg
möglich, statt ersetzt zu werden.

**Aufwand:** ein Tag. Der Modus `tippen` liefert bereits Eingabefeld und
Auswertung mit Tippfehlertoleranz; die Stufen sind reine Textverarbeitung auf
`antwortText(k)`.

**Passt zu:** Vokabeln, Formeln, Definitionen, Jahreszahlen — allem, was eine
kurze, wörtliche Antwort hat. Bei langen Fließtextantworten wird die
Stufenanzeige unübersichtlich; dort greift eher Vorschlag D.

---

### C · Erst raten, dann aufdecken ★★

**Was:** Bei einer Karte, die noch nie dran war, gibt es die Antwort erst
nach einem Versuch. Auch nach einem falschen.

**Warum:** Der Versuch selbst bereitet das Gedächtnis vor — der
**Pretesting-Effekt**. Bemerkenswert daran ist, dass es sogar dann hilft,
wenn der Versuch scheitert.

**Der ehrliche Vorbehalt:** Der Effekt ist gut belegt für Material, bei dem
sich etwas erschließen lässt, und deutlich schwächer bei **willkürlichen
Zuordnungen**. Bei einer Vokabel wie „Chassis → Fahrgestell" gibt es nichts
zu erraten; da kostet der erzwungene Versuch nur Zeit. Bei „Was besagt der
Energieerhaltungssatz?" ist er wertvoll.

Daher: nicht global einschalten, sondern **je Kasten**. Die App weiß nicht,
welcher Kasten willkürliche Paare enthält — du schon.

**Aufwand:** zwei Stunden. Der Modus `mc` erzwingt bereits eine Antwort vor
dem Aufdecken; hier ist es dieselbe Mechanik ohne Vorgaben.

---

### D · Die Warum-Frage bei Problemkarten ★★

**Was:** Wenn eine Karte zur Problemkarte wird, fragt die App nicht nur
„formuliere sie um", sondern stellt eine von drei Fragen und schreibt deine
Antwort ins **Extra**-Feld:

- *Warum ist das so?* (bei Sachwissen)
- *Womit verwechselst du es?* (bei Verwechslungen)
- *Woran willst du dich erinnern?* (bei willkürlichen Paaren)

**Warum:** **Elaborative Interrogation** und **Selbsterklärung** stehen bei
Dunlosky in der mittleren Nutzenklasse — nicht so stark wie Abfragen und
Verteilen, aber deutlich über allem, was man sonst so macht. Sie wirken
besonders dort, wo Vorwissen vorhanden ist, und sie brauchen kaum Übung.

**Warum ausgerechnet bei Problemkarten:** Diese Frage bei *jeder* Karte zu
stellen wäre lästig und würde den Durchsatz halbieren. Bei einer Karte, die
siebenmal durchgefallen ist, ist sie hingegen genau die richtige Diagnose —
und du beantwortest sie ohnehin im Kopf, wenn du überlegst, warum es nicht
klappt.

**Aufwand:** zwei Stunden. Die Problemkartenerkennung und das Extra-Feld gibt
es beide schon; es fehlt nur der Dialog dazwischen.

---

### E · Verwechslungen nebeneinanderstellen ★★

**Was:** Problemkarten sind oft keine schweren Karten, sondern **verwechselte
Paare**. Die App kann den wahrscheinlichsten Verwechslungspartner benennen
und beide einmal nebeneinander zeigen: *„Das hier ist X, das andere ist Y —
der Unterschied ist Z."*

**Warum:** Zwei Dinge zu unterscheiden lernt man nicht dadurch, dass man
jedes für sich hundertmal ansieht, sondern indem man sie **gegenüberstellt**.
Das ist der Mechanismus hinter dem verschränkten Üben, das bei Dunlosky
ebenfalls in der mittleren Klasse steht.

**Der elegante Teil:** Die Maschinerie ist schon da. `mcOptionenBauen`
sucht bereits Distraktoren aus demselben Kasten mit derselben
Abfragerichtung — das sind per Konstruktion die verwechselbarsten Karten.

**Aufwand:** ein halber Tag.

---

## 5. Was ich nicht bauen würde

**Keine Lerntyp-Auswahl.** `KONZEPT.md` §7 hat sie schon abgelehnt; die
Beleglage aus Abschnitt 3 gibt dem recht. Der Aufwand ginge in eine
Unterscheidung, die es so nicht gibt.

**Keine Hilfen zum Markieren, Zusammenfassen oder Wiederlesen.** Dunlosky
stuft alle drei in die **niedrigste** Nutzenklasse ein. Sie fühlen sich
produktiv an und sind es nicht — genau deshalb sind sie so beliebt.

**Keine eingebaute Eselsbrücken-Werkstatt (Schlüsselwortmethode).** Ebenfalls
niedrige Nutzenklasse: Der Trainingsaufwand steht in keinem Verhältnis, und
die Brücken halten oft kürzer als das Gelernte. Wer sich eine ausdenkt, kann
sie in die Notiz schreiben — das genügt.

**Keine Belohnungsmechanik obendrauf.** Der Streak und die Abzeichen decken
das ab. Mehr davon lenkt vom Lernen auf das Sammeln.

---

## 6. Was ich empfehlen würde

**A und B zusammen, als eine Stufe 6.** Sie gehören zusammen: A schafft den
Übungsstapel, B sagt, was darin passiert. Einzeln ist A nur „die Karte kommt
nochmal" — nützlich, aber ohne das Werkzeug, mit dem du sie tatsächlich in
den Kopf bekommst.

Danach **D und E** als kleiner Nachschlag, weil beide auf Vorhandenem
aufsetzen und zusammen einen Nachmittag kosten.

**C nur, wenn du Sachkästen hast.** Bei reinen Vokabelkästen bringt es nichts.

Reihenfolge und Aufwand:

| | Vorschlag | Aufwand | Beleglage |
|---|---|---|---|
| 1 | **A · Übungsstapel** | ein Nachmittag | sehr stark |
| 2 | **B · Aufdecken in Stufen** | ein Tag | stark |
| 3 | D · Warum-Frage | zwei Stunden | mittel |
| 4 | E · Verwechslungen | ein halber Tag | mittel |
| 5 | C · Erst raten | zwei Stunden | mittel, materialabhängig |

---

## 7. Was vorher zu entscheiden ist

1. **Kriterium:** zwei oder drei richtige Abrufe, bis eine Karte den
   Übungsstapel verlässt? (Die Forschung nimmt meist drei; zwei ist der
   verträglichere Einstieg.)
2. **Auslöser:** Soll nur „1 — nicht gewusst" in den Übungsstapel führen,
   oder auch „2 — schwer gewusst"? Letzteres trifft deinen beschriebenen Fall
   genauer („nur zum Teil bekannt").
3. **Abstand:** Nach wie vielen anderen Karten kommt eine Übungskarte wieder?
   (Vorschlag: mindestens drei, sonst ans Ende des Stapels.)
4. **Tippen oder frei:** Soll das stufenweise Aufdecken eine Eingabe
   verlangen, oder genügt der Selbstbericht „hab ich"? Papier bleibt in
   beiden Fällen möglich — die Frage ist nur, ob die App mitlesen darf.
5. **Je Kasten oder global?** Der Übungsstapel passt zu Prüfungsstoff besser
   als zu einer entspannten Vokabelrunde.

Sag mir zu 1 bis 3 deine Wahl, dann baue ich es — mit denselben
Abnahmeprüfungen wie bisher.

---

## Quellen

- [Rawson & Dunlosky (2022): Successive Relearning](https://journals.sagepub.com/doi/full/10.1177/09637214221100484)
  — Kriterium plus Verteilung, Effektstärken, Klausurergebnisse
- [Karpicke & Roediger (2007): Repeated retrieval is the key to long-term retention](https://learninglab.psych.purdue.edu/downloads/2007/2007_Karpicke_Roediger_JML.pdf)
  — die 44-%-gegen-21-%-Tabelle
- [Dunlosky et al. (2013): Strengthening the Student Toolbox](https://www.aft.org/ae/fall2013/dunlosky)
  — Nutzenklassen der zehn Techniken
- [Cover-Copy-Compare, Verfahren und Beleglage](https://www.interventioncentral.org/academic-interventions/writing/how-master-spelling-or-sight-words-cover-copy-compare)
- [Metaanalyse Lernstile (2024)](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1428732/full)
  — *g* = 0,31, aber nur 26 % mit der nötigen Überkreuzung
- [Fachkommentar zur Handschrift-EEG-Studie](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1517235/full)
  — warum die Studie nicht trägt, was ihr Titel behauptet
- [Richland, Kornell & Kao: The Pretesting Effect](https://learninglab.uchicago.edu/Pre-Testing_files/RichlandKornellKao.pdf)
- [Kornell & Vaughn: How Retrieval Attempts Affect Learning](https://sites.williams.edu/nk2/files/2011/08/Kornell.Vaughn.2016.pdf)
