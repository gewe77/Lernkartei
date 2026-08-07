/* =========================================================================
   HAN CROCO — Zahlenakrobat (Stufe 7)
   -------------------------------------------------------------------------
   Der erste Teil des Programms, der als eigenes Modul lebt. Er greift nicht
   in index.html hinein, sondern bekommt beim Start eine WERKZEUGKISTE
   gereicht — damit steht die Grenze zwischen beiden an genau einer Stelle
   und ist in einem Blick nachlesbar.

   Was hier drin steckt:
     · Übersicht der sechs Bereiche
     · Raster aus 100 Setfeldern je Bereich
     · Punktering mit Bestzeit-Schatten (Konzept, Abschnitt 11)
     · Ziffernblock, Übungs- und Testmodus, Fehlerbehandlung
     · Speicher: ein Dokument je Bereich, ein Schreibvorgang je Lauf

   Was hier bewusst NICHT drin steckt: alles, was der Karteikasten macht.
   Rechentraining misst Zeit und Fehlerzahl, nicht „gewusst/nicht gewusst“ —
   deshalb kein FSRS, keine Karten, keine Termine.
   ========================================================================= */

import { BEREICHE, bereichVon, setVon, bereicheLaden } from './mathe-sets.js';
import { setAufgaben, antwortStimmt, tastenFuer } from './mathe-erzeuger.js';
import { termStimmt, kanonisch, termTasten } from './mathe-term.js';
import * as MK from './mathe-meister.js';

/* Ringmaße. Sie stammen aus dem vermessenen Vorbild: 24 Punkte im Abstand
   von genau 15°, Punktdurchmesser 0,110 des Ringradius — die Punkte
   berühren sich fast. Siehe MATHEMATIK.md, Abschnitt 11. */
const RING_R = 46;
const RING_U = 2 * Math.PI * RING_R;
const ZIEL_SEKUNDEN = 60;

/* Ab dieser Abwesenheit gilt ein Lauf als unterbrochen und zählt nicht als
   Bestzeit. Kurzes Wegschalten (Benachrichtigung) bleibt folgenlos. */
const UNTERBRECHUNG_MS = 3000;

/* Kürzeste wertbare Zeit. Ein Lauf in 0,0 s ist kein Rechnen, sondern ein
   Fehler in den Daten — und er wäre nie wieder zu unterbieten. */
const MIN_ZEIT = 1;

/* Was bei Darstellungsaufgaben verlangt ist — sonst rät man an der Form
   herum, statt zu rechnen. */
const FORM_HINWEIS = {
  dezimal: 'Antwort als Kommazahl, nicht als Bruch.',
  bruch:   'Antwort als gekürzter Bruch mit /.',
  prozent: 'Antwort als ganze Zahl ohne Prozentzeichen.',
  rest:    'Antwort als „Ergebnis R Rest“ — die R-Taste trennt.'
};

export function matheStarten(w) {
  const { $, $$, esc, toast, frage, verdrahten, heute, zahl, S, FB, schreibe } = w;

  /* ---------------------------------------------------------------------
     Zustand
     --------------------------------------------------------------------- */

  let daten = null;             // { bereichId: { sets: {}, aktuell } }
  let geladen = false;
  let ladefehler = false;       // Stand konnte nicht geholt werden
  let ladeLauf = null;
  let letzterVersuch = 0;
  let ansicht = { bereich: null, modus: 'test' };
  let lauf = null;
  let ringTakt = null;          // requestAnimationFrame / setInterval
  let mkWahl = [];              // gewählte Zusatzbereiche der Meisterklasse
  let ringIntervall = null;

  const ziel = () => $('#seite-mathe');

  /* ---------------------------------------------------------------------
     Aussehen — das Modul bringt sein eigenes CSS mit, damit der Schnitt
     sauber bleibt und index.html nichts von Mathematik wissen muss.
     --------------------------------------------------------------------- */

  function stilEinhaengen() {
    if (document.getElementById('mathe-stil')) return;
    const st = document.createElement('style');
    st.id = 'mathe-stil';
    st.textContent = `
.ma-bereiche{display:grid;gap:12px;margin-top:16px}
.ma-bereich{display:flex;gap:14px;align-items:center;width:100%;text-align:left;
  border:1px solid var(--border);background:var(--bg2);border-radius:var(--radius);
  padding:14px 16px;font:inherit;color:var(--txt);cursor:pointer}
.ma-bereich:hover{border-color:var(--border2)}
.ma-bereich[disabled]{opacity:.55;cursor:default}
.ma-meister{margin-top:8px;border-color:var(--akzent);background:var(--akzent-bg)}
.ma-meister .ma-bereich-nr{background:var(--akzent);color:#fff}
.mk-themen{display:grid;gap:4px}
.mk-thema{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;
  background:var(--bg3);font-size:13.5px}
.mk-thema.sitzt{background:var(--bewertung-3-bg)}
.mk-thema.wackelt{background:var(--faellig-bg)}
.mk-thema.fehlt{background:var(--bewertung-1-bg)}
.mk-marke{flex:none;font-size:11.5px;font-weight:700;color:var(--txt2)}
.mk-thema.sitzt .mk-marke{color:var(--bewertung-3)}
.mk-thema.wackelt .mk-marke{color:var(--faellig)}
.mk-thema.fehlt .mk-marke{color:var(--bewertung-1)}
/* Die Regeln müssen auf den MITTLEREN Block zielen, nicht auf jedes span in
   der Kachel. ".ma-bereich span" (Gewicht 0-1-1) schlug sonst
   ".ma-bereich-nr" (0-1-0): Der Kreis wurde zum Block, align-items und
   justify-content liefen ins Leere und die Ziffer saß gemessen 13,4 px links
   und 7,5 px über der Mitte — dazu in 13 px statt der vorgesehenen Größe.
   Ebenso zerriss ".ma-bereich b{display:block}" die rechte Spalte in drei
   Zeilen: „0“, „★“, „0 von 100 begonnen“. */
.ma-bereich-txt{flex:1;min-width:0}
.ma-bereich-txt b{display:block;font-size:15px}
.ma-bereich-txt > span{display:block;font-size:13px;color:var(--txt3)}
.ma-bereich-nr{flex:none;width:34px;height:34px;border-radius:50%;background:var(--bg3);
  display:flex;align-items:center;justify-content:center;
  font-size:15px;font-weight:700;line-height:1;color:var(--txt2)}
.ma-bereich-stand{flex:none;text-align:right;font-size:13px;line-height:1.4;
  color:var(--txt2);font-variant-numeric:tabular-nums}
.ma-bereich-stand b{font-size:15px}
/* „0 von 100 begonnen“ ist auf einem 390 px breiten Telefon rund 130 px
   breit und drückt „Plus, minus, Einmaleins bis 100“ auf drei Zeilen. Dort
   steht dieselbe Zahl kurz. */
.ma-stand-kurz{display:none}
@media (max-width:560px){
  .ma-stand-lang{display:none}
  .ma-stand-kurz{display:inline}
}

.ma-raster{display:grid;grid-template-columns:repeat(10,1fr);gap:5px;max-width:420px;margin:14px 0}
.ma-feld{aspect-ratio:1;border:1px solid var(--border);background:var(--bg3);border-radius:7px;
  font:inherit;font-size:11px;font-weight:600;color:var(--txt3);cursor:pointer;padding:0;
  display:flex;align-items:center;justify-content:center;position:relative;touch-action:manipulation}
.ma-feld:hover{border-color:var(--border2)}
.ma-feld.begonnen{background:var(--faellig-bg);border-color:var(--faellig);color:var(--txt2)}
.ma-feld.sauber{background:var(--bewertung-3-bg);border-color:var(--bewertung-3);color:var(--txt2)}
.ma-feld.stern::after{content:"★";position:absolute;top:-3px;right:-1px;font-size:10px;
  color:var(--bewertung-3)}
.ma-feld.vorschlag{outline:2px solid var(--akzent);outline-offset:1px}
.ma-legende{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:var(--txt3);margin:8px 0 2px}
.ma-legende i{width:11px;height:11px;border-radius:3px;display:inline-block;vertical-align:-1px;
  margin-right:5px;border:1px solid var(--border)}

.ma-lauf{display:flex;flex-direction:column;align-items:center;gap:16px;padding-top:6px;
  justify-content:center;min-height:min(72vh,620px)}
@media (max-height:820px){ .ma-lauf{min-height:0;gap:12px} }
.ma-ring{position:relative;width:210px;height:210px;flex:none}
.ma-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.ma-ring .ma-schatten{fill:none;stroke:var(--akzent);stroke-width:15;opacity:.24;
  stroke-linecap:round}
.ma-ring circle.ma-p{fill:var(--bg3);opacity:.8}
.ma-ring circle.ma-p.fertig{fill:var(--akzent);opacity:1}
.ma-ring circle.ma-p.falsch{fill:var(--bewertung-1);opacity:1}
.ma-ring circle.ma-p.offen.dran{fill:var(--bewertung-3);opacity:1}
.ma-ring-mitte{position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;pointer-events:none;text-align:center}
.ma-ring-mitte b{font-size:21px;font-variant-numeric:tabular-nums;color:var(--txt2)}
.ma-ring-mitte span{font-size:11px;color:var(--txt3)}

.ma-aufgabe{font-size:32px;font-weight:700;font-variant-numeric:tabular-nums;
  display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;min-height:60px}
.ma-feldchen{min-width:76px;height:54px;border:2px solid var(--akzent);border-radius:12px;
  display:flex;align-items:center;justify-content:center;font-size:28px;padding:0 10px;
  background:var(--bg)}
.ma-feldchen.leer{border-style:dashed;border-color:var(--border2)}

.ma-tasten{width:100%;max-width:430px;display:flex;flex-direction:column;gap:7px;
  margin-top:2px}
.ma-zeile{display:flex;gap:6px}
.ma-taste{flex:1;min-height:54px;border:1px solid var(--border);background:var(--bg2);
  color:var(--txt);border-radius:11px;font:inherit;font-size:21px;font-weight:600;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  touch-action:manipulation;-webkit-user-select:none;user-select:none}
.ma-taste:active{background:var(--bg3)}
.ma-taste.weg{flex:0 0 88px;font-size:18px;color:var(--txt2)}
.ma-taste.ok{background:var(--akzent);border-color:var(--akzent);color:#fff}
.ma-taste.gross{min-height:72px;font-size:30px}
@media (min-width:640px){ .ma-tasten{max-width:560px} }

.ma-kopf{display:flex;justify-content:space-between;align-items:center;gap:10px;width:100%}
.ma-schluessel{color:var(--faellig);font-weight:700}
.ma-abschluss{text-align:center;padding:10px 0 4px}
.ma-zeit{font-size:44px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1.05}
@media (prefers-reduced-motion: reduce){ .ma-ring circle{transition:none} }
/* Auf flachen Bildschirmen (Telefon hochkant) müssen Ring, Aufgabe und
   Tastenfeld zusammen auf eine Bildschirmhöhe passen — sonst muss man
   mitten im Lauf rollen, und das kostet mehr Zeit als jede Rechnung. */
@media (max-height:820px){ .ma-ring{width:168px;height:168px}
  .ma-aufgabe{font-size:28px;min-height:52px} .ma-taste{min-height:50px} }
@media (max-height:660px){ .ma-ring{width:132px;height:132px} }
`;
    document.head.appendChild(st);
  }

  /* ---------------------------------------------------------------------
     Speicher — ein Dokument je Bereich, ein Schreibvorgang je Lauf
     --------------------------------------------------------------------- */

  const leererStand = () => {
    const o = {};
    BEREICHE.forEach(b => { o[b.id] = { sets: {}, aktuell: 1 }; });
    o.meisterklasse = { laeufe: [] };
    return o;
  };

  /** Läufe der Meisterklasse auf Form bringen. Werte aus Firestore kommen
   *  von außen — auch aus einer alten oder von Hand veränderten Sicherung. */
  function meisterNormalisieren(roh) {
    const liste = Array.isArray(roh?.laeufe) ? roh.laeufe : [];
    return { laeufe: liste.slice(-20).map(l => ({
      datum: typeof l?.datum === 'string' ? l.datum.slice(0, 10) : null,
      wahl: Array.isArray(l?.wahl) ? l.wahl.filter(x => MK.WAHLBEREICHE.includes(x)) : [],
      index: zahl(l?.index, 0, 1000, 0),
      sekunden: zahl(l?.sekunden, 0, 86400, 0),
      richtig: zahl(l?.richtig, 0, 9999, 0),
      gesamt: zahl(l?.gesamt, 0, 9999, 0),
      abgebrochen: !!l?.abgebrochen,
      themen: themenNormalisieren(l?.themen)
    })).filter(l => l.gesamt > 0) };
  }
  function themenNormalisieren(roh) {
    const o = {};
    Object.entries(roh || {}).forEach(([id, e]) => {
      if (!MK.themaVon(id)) return;
      o[id] = { n: zahl(e?.n, 0, 9999, 0), fehler: zahl(e?.fehler, 0, 9999, 0),
                sekunden: Math.max(0, Math.min(86400, Number(e?.sekunden) || 0)),
                par: Math.max(0, Math.min(86400, Number(e?.par) || 0)) };
    });
    return o;
  }

  function standNormalisieren(roh) {
    const sets = {};
    const q = roh?.sets && typeof roh.sets === 'object' ? roh.sets : {};
    Object.keys(q).forEach(k => {
      const e = q[k] || {};
      /* Werte aus Firestore kommen von außen — auch aus einer alten oder
         von Hand veränderten Sicherung. Eine Bestzeit von −12 s wäre nie
         wieder zu unterbieten, und der Schatten liefe aus dem Ring. */
      const rohS = Number(e.beste?.s);
      const n = zahl(e.beste?.n, 1, 200, 24);
      const zeitenRoh = Array.isArray(e.beste?.zeiten)
        ? e.beste.zeiten.map(Number).filter(x => Number.isFinite(x) && x >= 0 && x <= 86400)
        : [];
      const zeiten = zeitenRoh.length === n
        ? zeitenRoh.slice().sort((a, b) => a - b)     // muss aufsteigend sein
        : [];
      const beste = Number.isFinite(rohS) && rohS >= MIN_ZEIT && rohS <= 86400
        ? { n, s: rohS, zeiten } : null;
      sets[String(k)] = {
        versuche: zahl(e.versuche, 0, 99999, 0),
        fehlerGesamt: zahl(e.fehlerGesamt, 0, 999999, 0),
        sauber: !!e.sauber,
        stern: !!e.stern,
        beste,
        zuletzt: typeof e.zuletzt === 'string' ? e.zuletzt.slice(0, 10) : null
      };
    });
    return { sets, aktuell: zahl(roh?.aktuell, 1, 100, 1) };
  }

  function datenLaden() {
    if (geladen) return Promise.resolve(daten);
    if (ladeLauf) return ladeLauf;
    // Nach einem Fehlschlag nicht bei jedem Neuzeichnen wieder anklopfen.
    if (Date.now() - letzterVersuch < 10000 && daten) return Promise.resolve(daten);
    letzterVersuch = Date.now();
    ladeLauf = (async () => {
      const stand = leererStand();
      try {
        const snap = await FB.getDocs(w.colMathe());
        snap.docs.forEach(d => {
          if (d.id === 'meisterklasse') stand.meisterklasse = meisterNormalisieren(d.data());
          else if (stand[d.id]) stand[d.id] = standNormalisieren(d.data());
        });
        geladen = true; ladefehler = false;
      } catch (e) {
        /* Ohne Netz und ohne Zwischenspeicher bleibt der Stand leer. Rechnen
           geht trotzdem — aber es darf DANN NICHTS GESCHRIEBEN WERDEN:
           `merge` mit einem leeren Ausgangsstand hätte Stern, Bestzeit und
           Versuchszähler überschrieben. Ein einziger Lauf ohne Netz hätte
           die Arbeit von Wochen gelöscht. */
        ladefehler = true;
        console.warn('[Zahlenakrobat] Stand nicht geladen', e);
      }
      daten = stand;
      ladeLauf = null;
      return daten;
    })();
    return ladeLauf;
  }

  const standVon = (bereichId, nr) =>
    daten?.[bereichId]?.sets?.[String(nr)] || null;

  function standSichern(bereichId, nr, eintrag) {
    if (ladefehler || !geladen) {
      toast('Ohne Verbindung zum Stand — dieser Lauf wird nicht gewertet.', 'fehler');
      return;
    }
    if (!daten) daten = leererStand();
    const b = daten[bereichId] || (daten[bereichId] = { sets: {}, aktuell: 1 });
    b.sets[String(nr)] = eintrag;
    b.aktuell = naechstesSet(bereichId);
    schreibe(FB.setDoc(FB.doc(w.colMathe(), bereichId),
      { sets: { [String(nr)]: eintrag }, aktuell: b.aktuell }, { merge: true }),
      'Mathematik');
  }

  /* ---------------------------------------------------------------------
     Vorschlag: das erste Set ohne Stern. Gesperrt ist nichts.
     --------------------------------------------------------------------- */

  function naechstesSet(bereichId) {
    const b = bereichVon(bereichId);
    if (!b?.sets.length) return 1;
    for (const s of b.sets) if (!standVon(bereichId, s.nr)?.stern) return s.nr;
    return b.sets[b.sets.length - 1].nr;
  }

  /** Hakt es an diesem Set? Dann auf die Voraussetzung hinweisen — als
   *  Hinweis, nie als Sperre. */
  function stockendeVoraussetzung(bereichId, nr) {
    const e = standVon(bereichId, nr);
    if (!e || e.stern || e.versuche < 5) return null;
    const s = setVon(bereichId, nr);
    if (!s?.voraussetzung) return null;
    return setVon(bereichId, s.voraussetzung);
  }

  /* ---------------------------------------------------------------------
     Ansicht 1 — die sechs Bereiche
     --------------------------------------------------------------------- */

  /* Ansprache wie im Karteikasten und in der Lernbox — an Datum und
     Tagesabschnitt gebunden, nicht gewürfelt, sonst spränge der Text bei
     jeder Firestore-Aktualisierung um. */
  const BEGRUESSUNG = {
    start: ['Rechnen wir{N}?', 'Kopfrechnen{N}?', 'Ein Set{N}?'],
    dabei: ['Weiter geht’s{N}', 'Wo warst du stehengeblieben{N}?', 'Noch ein Set{N}?'],
    stark: ['{S} Sterne{N}', 'Das läuft{N}', 'Schon {S} Sterne{N}']
  };

  function begruessung() {
    const name = w.anzeigeName?.() || '';
    const anrede = name ? ', ' + name : '';
    const sterne = sterneGesamt();
    const lage = sterne >= 15 ? 'stark' : sterne > 0 ? 'dabei' : 'start';
    const kandidaten = BEGRUESSUNG[lage];
    const i = (w.textHash?.(heute() + ':' + lage) ?? 0) % kandidaten.length;
    return kandidaten[i].replace('{N}', anrede).replace('{S}', String(sterne));
  }

  /** Sterne über alle Bereiche — Grundlage der Mathematik-Abzeichen. */
  function sterneGesamt() {
    if (!daten) return 0;
    return BEREICHE.reduce((n, b) =>
      n + Object.values(daten[b.id]?.sets || {}).filter(e => e?.stern).length, 0);
  }

  function malUebersicht() {
    const z = ziel();
    z.innerHTML = `
      <h1 style="margin:0">${esc(begruessung())}</h1>
      <p class="dash-unter" style="margin-top:2px">Zahlenakrobat — Kopfrechnen auf Zeit.</p>
      <p class="mini" style="margin-top:4px">Jedes Set ist in
        <strong>60 Sekunden fehlerfrei</strong> zu schaffen — das ist das Ziel, nicht die
        Bedingung. Im Übungsmodus läuft keine Uhr.</p>
      <div class="ma-bereiche">
        ${BEREICHE.map(b => bereichKachel(b)).join('')}
      </div>
      ${meisterKachelHtml()}`;
    verdrahten(z);
  }

  /** Die Meisterklasse steht unter den sechs Bereichen — sie ist keiner,
   *  sondern eine Prüfung quer durch alle. */
  function meisterKachelHtml() {
    const stand = daten?.meisterklasse;
    const beste = Math.max(0, ...(stand?.laeufe || []).map(l => Number(l.index) || 0));
    const n = (stand?.laeufe || []).length;
    return `
      <button class="ma-bereich ma-meister" data-tu="matheMeister">
        <span class="ma-bereich-nr">★</span>
        <span class="ma-bereich-txt">
          <b>Meisterklasse</b>
          <span>Eine Prüfung quer durch alles — und danach steht da, was noch fehlt</span>
        </span>
        ${n ? `<span class="ma-bereich-stand"><b>${beste.toFixed(0)}</b> Index<br>
          <span class="mini">${n} ${n === 1 ? 'Prüfung' : 'Prüfungen'}</span></span>` : ''}
        <!-- „n Prüfungen“ ist kurz genug, dafür braucht es keine Handyfassung. -->
      </button>`;
  }

  function bereichKachel(b) {
    const fertig = !!b.sets.length;
    const sterne = fertig ? b.sets.filter(s => standVon(b.id, s.nr)?.stern).length : 0;
    const angefasst = fertig ? b.sets.filter(s => standVon(b.id, s.nr)?.versuche).length : 0;
    return `
      <button class="ma-bereich" ${fertig ? `data-tu="matheBereich" data-id="${esc(b.id)}"` : 'disabled'}>
        <span class="ma-bereich-nr">${b.nr}</span>
        <span class="ma-bereich-txt">
          <b>${esc(b.name)}</b>
          <span>${fertig ? esc(b.kurz) : 'kommt in einem der nächsten Schritte'}</span>
        </span>
        ${fertig ? `<span class="ma-bereich-stand"><b>${sterne}</b> ★<br>
          <span class="mini ma-stand-lang">${angefasst} von ${b.sets.length} begonnen</span
          ><span class="mini ma-stand-kurz">${angefasst}/${b.sets.length}</span></span>` : ''}
      </button>`;
  }

  /* ---------------------------------------------------------------------
     Ansicht 2 — das Raster aus 100 Setfeldern
     --------------------------------------------------------------------- */

  function malRaster() {
    const b = bereichVon(ansicht.bereich);
    if (!b) { ansicht.bereich = null; return malUebersicht(); }
    const z = ziel();
    const naechste = naechstesSet(b.id);
    const s = setVon(b.id, naechste);
    const hemmt = stockendeVoraussetzung(b.id, naechste);
    const sterne = b.sets.filter(x => standVon(b.id, x.nr)?.stern).length;

    z.innerHTML = `
      <div class="spread">
        <h1 style="margin:0">${esc(b.name)}</h1>
        <button class="btn" data-tu="matheZurueck">Alle Bereiche</button>
      </div>
      <p class="mini" style="margin-top:4px">${esc(b.kurz)} · ${b.sets.length} Sets ·
        <strong>${sterne} ★</strong></p>

      <div class="hinweis mt">
        <strong>Weiter bei Set ${naechste}</strong> — ${esc(s?.titel || '')}
        ${s?.schluessel ? ' <span class="ma-schluessel" title="Schlüsselrechnung">★</span>' : ''}
        ${hemmt ? `<br><span class="mini">Set ${naechste} hakt. Vielleicht erst
          Set ${hemmt.nr} („${esc(hemmt.titel)}“) festigen.</span>` : ''}
        <div class="row mt">
          <button class="btn primary" data-tu="matheStarten" data-id="${naechste}">Losrechnen</button>
          <label class="mini" style="display:flex;align-items:center;gap:6px">
            <input type="checkbox" id="ma-uebung" ${ansicht.modus === 'uebung' ? 'checked' : ''}
              data-tu="matheModus"> Übungsmodus (ohne Uhr)
          </label>
        </div>
      </div>

      <div class="ma-legende mt">
        <span><i style="background:var(--bg3)"></i>unbearbeitet</span>
        <span><i style="background:var(--faellig-bg);border-color:var(--faellig)"></i>begonnen</span>
        <span><i style="background:var(--bewertung-3-bg);border-color:var(--bewertung-3)"></i>fehlerfrei</span>
        <span>★ unter 60 Sekunden</span>
      </div>
      <div class="ma-raster">${b.sets.map(x => setFeld(b.id, x, naechste)).join('')}</div>
      <p class="mini">Jedes Set ist jederzeit anwählbar — das Raster zeigt nur, was schon
        geschafft ist.</p>`;
    verdrahten(z);
  }

  function setFeld(bereichId, s, vorschlag) {
    const e = standVon(bereichId, s.nr);
    const klassen = ['ma-feld'];
    if (e?.sauber) klassen.push('sauber');
    else if (e?.versuche) klassen.push('begonnen');
    if (e?.stern) klassen.push('stern');
    if (s.nr === vorschlag) klassen.push('vorschlag');
    const zeit = e?.beste ? ` · beste Zeit ${zeitText(e.beste.s)}` : '';
    return `<button class="${klassen.join(' ')}" data-tu="matheStarten" data-id="${s.nr}"
      title="Set ${s.nr}: ${esc(s.titel)}${zeit}">${s.nr}</button>`;
  }

  /* ---------------------------------------------------------------------
     Ansicht 2b — die Meisterklasse
     --------------------------------------------------------------------- */

  const MK_DECKEL_MS = 15 * 60 * 1000;

  function malMeister() {
    const z = ziel();
    const themen = MK.bauplanThemen(mkWahl);
    const je = MK.aufgabenJeThema(themen);
    const gesamt = themen.length * je;
    const stand = daten?.meisterklasse || { laeufe: [] };
    const laeufe = (stand.laeufe || []).slice().reverse();
    const beste = laeufe.length ? Math.max(...laeufe.map(l => Number(l.index) || 0)) : null;
    const bilanzen = laeufe.slice(0, 5).map(l => l.themen || {});
    const dia = bilanzen.length ? MK.diagnose(bilanzen) : [];

    z.innerHTML = `
      <div class="spread">
        <h1 style="margin:0">Meisterklasse</h1>
        <button class="btn" data-tu="matheZurueck">Alle Bereiche</button>
      </div>
      <p class="mini" style="margin-top:4px">Eine Prüfung quer durch alles. Jedes Mal neu
        gewürfelt — vergleichbar bleibt sie über den <strong>Index</strong>.</p>

      <div class="box mt">
        <h2 style="margin:0 0 6px">Was geprüft wird</h2>
        <p class="mini" style="margin:0 0 10px">Fest dabei sind die Bereiche 1 bis 4.
          Was du kannst, darfst du dazunehmen:</p>
        <div class="row">
          ${MK.WAHLBEREICHE.map(id => {
            const b = BEREICHE.find(x => x.id === id);
            const an = mkWahl.includes(id);
            return `<label class="karo" style="flex:1 1 240px">
              <input type="checkbox" data-tu="matheMkWahl" data-id="${esc(id)}" ${an ? 'checked' : ''}>
              <span>${esc(b?.name || id)}</span></label>`;
          }).join('')}
        </div>
        <p class="mini mt">${themen.length} Themen · <strong>${gesamt} Aufgaben</strong> ·
          etwa 10 Minuten · spätestens nach 15 Minuten ist Schluss</p>
        <div class="row mt">
          <button class="btn primary gross" data-tu="matheMkStarten">Prüfung starten</button>
          ${beste != null ? `<span class="mini">Beste bisher: <strong>Index
            ${beste.toFixed(0)}</strong></span>` : ''}
        </div>
      </div>

      ${laeufe.length ? `
        <div class="box">
          <h2 style="margin:0 0 8px">Bisherige Prüfungen</h2>
          <table class="daten"><thead><tr><th>Datum</th>
            <th style="text-align:right">Index</th><th style="text-align:right">richtig</th>
            <th style="text-align:right">Zeit</th></tr></thead><tbody>
            ${laeufe.slice(0, 8).map(l => `<tr>
              <td>${esc(l.datum || '—')}</td>
              <td style="text-align:right"><strong>${(Number(l.index) || 0).toFixed(0)}</strong></td>
              <td style="text-align:right">${l.richtig}/${l.gesamt}</td>
              <td style="text-align:right">${esc(zeitText(l.sekunden))}</td></tr>`).join('')}
          </tbody></table>
        </div>` : ''}

      ${dia.length ? diagnoseHtml(dia, bilanzen.length) : ''}`;
    verdrahten(z);
  }

  function diagnoseHtml(dia, anzahlLaeufe) {
    const b = MK.belastbarkeit(anzahlLaeufe);
    const plan = MK.uebungsplan(dia);
    return `
      <div class="box">
        <h2 style="margin:0 0 4px">Was noch nicht sitzt</h2>
        <p class="mini" style="margin:0 0 10px">${esc(b.text)}</p>
        <div class="mk-themen">
          ${dia.filter(d => d.stufe !== 'sitzt').map(d => `<div class="mk-thema ${esc(d.stufe)}">
            <span style="flex:1">${esc(d.thema.name)}</span>
            <span class="mini">${d.fehler ? d.fehler + (d.fehler === 1 ? ' Fehler · ' : ' Fehler · ') : ''}${
              d.verhaeltnis.toFixed(1)} × Soll</span>
            <span class="mk-marke">${esc(MK.EINSTUFUNG[d.stufe].name)}</span>
          </div>`).join('')}
          ${(() => {
            /* Die Themen, die sitzen, in EINE Zeile. Achtzehn Zeilen, von
               denen sechzehn „sitzt" sagen, begraben genau das, worum es
               geht — und das ist das, was nicht sitzt. */
            const gut = dia.filter(d => d.stufe === 'sitzt');
            if (!gut.length) return '';
            return `<div class="mk-thema sitzt">
              <span style="flex:1">${gut.length === dia.length
                ? 'Alles sitzt — quer durch alle Themen'
                : gut.length + (gut.length === 1 ? ' Thema sitzt' : ' Themen sitzen')
                  + ': ' + esc(gut.map(d => d.thema.name).join(' · '))}</span>
              <span class="mk-marke">sitzt</span></div>`;
          })()}
        </div>
        ${plan.length ? `
          <h3 style="margin:16px 0 6px">Das würde ich als Nächstes üben</h3>
          <div class="row">
            ${plan.map(p => `<button class="btn klein" data-tu="matheMkUeben"
              data-id="${esc(p.bereich + ':' + p.setNr)}">${esc(p.thema.name)} —
              Set ${p.setNr}</button>`).join('')}
          </div>
          <p class="mini mt">Ausgewählt sind die <strong>Schlüsselsets</strong> der
            schwächsten Themen — die tragen alles andere.</p>` : ''}
      </div>`;
  }

  function meisterStarten() {
    const themen = MK.bauplanThemen(mkWahl);
    const je = MK.aufgabenJeThema(themen);
    const startwert = Math.floor(Math.random() * 1e9) + 1;
    let bloecke;
    try { bloecke = MK.ziehen(themen, je, startwert); }
    catch (e) { console.error(e); return toast('Die Prüfung ließ sich nicht aufbauen.', 'fehler'); }
    const aufgaben = bloecke.flatMap(b => b.aufgaben);
    if (!aufgaben.length) return toast('Keine Aufgaben gefunden.', 'fehler');

    lauf = {
      meister: true, wahl: mkWahl.slice(), bloecke,
      bereichId: 'meisterklasse', nr: 0, modus: 'test',
      set: { titel: 'Meisterklasse', aufgaben: aufgaben.length },
      pruefart: aufgaben[0].pruefart,
      aufgaben,
      zustand: aufgaben.map(() => 'offen'),
      offen: aufgaben.map((_, i) => i),
      eingabe: '',
      start: Date.now(),
      zeiten: [], antworten: [],
      letzteAntwortZeit: Date.now(),
      fehler: 0, schatten: null, unterbrochen: false,
      aktiv: true, ende: null
    };
    malLauf();
    mkUhrStarten();
  }

  /* Der Deckel: Nach fünfzehn Minuten ist Schluss, egal wo man steht. Der
     Index ist auch aus einer halben Prüfung berechenbar; die Diagnose wird
     entsprechend gekennzeichnet. */
  let mkUhr = null;
  function mkUhrStarten() {
    clearInterval(mkUhr);
    const takt = () => {
      if (!lauf?.meister || !lauf.aktiv) return mkUhrStoppen();
      const rest = MK_DECKEL_MS - (Date.now() - lauf.start);
      const el = $('#ma-restzeit');
      if (el) el.textContent = rest > 0 ? zeitText(rest / 1000) + ' übrig' : '';
      if (rest <= 0) { lauf.abgelaufen = true; laufBeenden(); }
    };
    /* Einmal sofort, sonst stünde die erste Sekunde lang „Aufgaben" da. */
    takt();
    mkUhr = setInterval(takt, 1000);
  }
  function mkUhrStoppen() { clearInterval(mkUhr); mkUhr = null; }

  /* ---------------------------------------------------------------------
     Ansicht 3 — der Lauf
     --------------------------------------------------------------------- */

  function laufStarten(nr) {
    const bereichId = ansicht.bereich;
    const s = setVon(bereichId, nr);
    if (!s) return toast('Dieses Set gibt es nicht.');
    const modus = ansicht.modus === 'uebung' ? 'uebung' : 'test';
    /* Testmodus: fester Startwert, also immer dieselben Aufgaben in
       derselben Reihenfolge — sonst wären zwei Läufe nicht vergleichbar.
       Übungsmodus: gewürfelt, damit man nicht die Folge auswendig lernt. */
    const startwert = modus === 'test'
      ? s.nr
      : (s.nr * 1000 + Math.floor(Math.random() * 997) + 1);

    let aufgaben;
    try { aufgaben = setAufgaben(s.regel, s.aufgaben, startwert); }
    catch (e) { console.error(e); return toast('Dieses Set lässt sich nicht aufbauen.', 'fehler'); }

    const e = standVon(bereichId, nr);
    const schatten = modus === 'test' && e?.beste?.zeiten?.length === aufgaben.length
      ? e.beste.zeiten : null;

    lauf = {
      bereichId, nr, modus, set: s, aufgaben, pruefart: s.pruefart || 'zahl',
      zustand: aufgaben.map(() => 'offen'),
      offen: aufgaben.map((_, i) => i),
      eingabe: '',
      start: Date.now(),
      zeiten: [],
      fehler: 0,
      schatten,
      unterbrochen: false,
      aktiv: true,
      ende: null
    };
    malLauf();
  }

  function malLauf() {
    const z = ziel();
    const l = lauf;
    /* Bei der Meisterklasse wechseln die Prüfarten mitten im Lauf. Der
       Tastenblock richtet sich deshalb nach dem laufenden THEMENBLOCK —
       darum kommen die Aufgaben eines Themas auch zusammenhängend, und nur
       die Reihenfolge der Themen wird gewürfelt. */
    const block = l.meister ? mkBlockVon(l, l.offen[0]) : null;
    const tasten = tastenListe(block ? block.aufgaben : l.aufgaben,
      block ? block.aufgaben[0].pruefart : l.pruefart);
    l.tastenSchluessel = block ? block.thema.id + ':' + block.pruefart : '';
    z.innerHTML = `
      <div class="ma-kopf">
        <div>${l.meister
          ? `<strong>Meisterklasse</strong> <span class="mini" id="ma-thema">${
              esc(l.bloecke[0]?.thema.name || '')}</span>`
          : `<strong>Set ${l.nr}</strong> <span class="mini">${esc(l.set.titel)}</span>`}</div>
        <button class="btn" data-tu="matheAbbrechen">Abbrechen</button>
      </div>
      <div class="ma-lauf">
        ${ringHtml(l.meister ? l.bloecke.length : l.aufgaben.length)}
        <div class="ma-aufgabe" id="ma-aufgabe"></div>
        ${tastenHtml(tasten)}
        ${FORM_HINWEIS[block ? block.pruefart : l.pruefart] ? `<p class="mini" style="margin:0">
          ${esc(FORM_HINWEIS[block ? block.pruefart : l.pruefart])}</p>` : ''}
        <p class="mini" style="margin:0">${l.modus === 'test'
          ? (l.schatten ? 'Der Schatten zeigt, wie weit dein bester Lauf hier war.'
                        : 'Erster Testlauf — ab jetzt gibt es eine Bestzeit zum Jagen.')
          : 'Übungsmodus: keine Uhr, keine Wertung.'}</p>
      </div>`;
    verdrahten(z);
    ringZeichnen();
    aufgabeZeichnen();
    ringTaktStarten();
  }

  function ringHtml(n) {
    const teilung = RING_U / n;
    const rp = Math.max(3.2, Math.min(7, teilung * 0.42));
    let punkte = '';
    for (let i = 0; i < n; i++) {
      const phi = (i / n) * 2 * Math.PI;
      punkte += `<circle class="ma-p" data-i="${i}"
        cx="${(50 + RING_R * Math.cos(phi)).toFixed(3)}"
        cy="${(50 + RING_R * Math.sin(phi)).toFixed(3)}" r="${rp.toFixed(2)}"></circle>`;
    }
    return `<div class="ma-ring" id="ma-ring" data-rp="${rp.toFixed(2)}">
      <svg viewBox="-5 -5 110 110" aria-hidden="true">
        <circle class="ma-schatten" cx="50" cy="50" r="${RING_R}"
          stroke-dasharray="${RING_U.toFixed(2)}" stroke-dashoffset="${RING_U.toFixed(2)}"></circle>
        <g id="ma-punkte">${punkte}</g>
      </svg>
      <div class="ma-ring-mitte"><b id="ma-zaehler">0/${n}</b>
        <span id="ma-restzeit">Aufgaben</span></div>
    </div>`;
  }

  /**
   * Welche Tasten ein Set braucht — je Set erzeugt, nicht fest verdrahtet.
   * Weil die Aufgaben erzeugt werden, ist das Antwortalphabet vorher bekannt:
   * Ein Ableitungsset braucht kein π, ein Winkelset kein x. So bleibt der
   * Block auch auf dem Telefon groß genug für den Daumen.
   * Feste Grenze: höchstens 20 Tasten.
   */
  function tastenListe(aufgaben, pruefart) {
    const antworten = aufgaben.map(a => a.a);
    if (pruefart === 'vergleich') return { zeichen: ['<', '=', '>'], gross: true };
    if (pruefart === 'term' || pruefart === 'dezimal' || pruefart === 'bruch'
        || pruefart === 'prozent') {
      const zusatz = termTasten(antworten);
      const alle = ['1','2','3','4','5','6','7','8','9','0'].concat(zusatz);
      if (alle.length > 20) console.warn('[Zahlenakrobat] Tastenblock zu groß:', alle.length);
      return { zeichen: alle };
    }
    const t = tastenFuer(aufgaben);
    const zusatz = t.extra.slice();
    if (pruefart === 'rest' && !zusatz.includes('R')) zusatz.push('R');
    return { zeichen: t.ziffern.slice(1).concat(['0']).concat(zusatz) };
  }

  function tastenHtml(liste) {
    const zeilen = [];
    const alle = liste.zeichen;
    /* Fünf Tasten je Reihe sind auf 375 px Breite die Grenze: darunter fällt
       die Taste unter das Mindestmaß von 48 px. Bei 21 Tasten standen sieben
       nebeneinander und die kleinste war 44 px breit. */
    const jeZeile = liste.gross ? alle.length
      : window.innerWidth >= 640 ? Math.min(10, alle.length)
      : Math.min(5, Math.max(3, Math.ceil(alle.length / Math.ceil(alle.length / 5))));
    for (let i = 0; i < alle.length; i += jeZeile) zeilen.push(alle.slice(i, i + jeZeile));
    const knopf = z =>
      `<button class="ma-taste${liste.gross ? ' gross' : ''}" data-tu="matheZiffer"
        data-id="${esc(z)}">${esc(z)}</button>`;
    return `<div class="ma-tasten">
      ${zeilen.map(r => `<div class="ma-zeile">${r.map(knopf).join('')}</div>`).join('')}
      <div class="ma-zeile">
        <button class="ma-taste weg" data-tu="matheWeg" aria-label="löschen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg>
        </button>
        <button class="ma-taste ok" data-tu="matheOk" aria-label="bestätigen">✓</button>
      </div></div>`;
  }

  /* --- Ring und Aufgabe zeichnen ---------------------------------------- */

  /** Zu welchem Themenblock gehört die Aufgabe mit diesem Index? */
  function mkBlockVon(l, index) {
    if (!l?.meister || index === undefined) return null;
    let n = 0;
    for (const b of l.bloecke) {
      if (index < n + b.aufgaben.length) return b;
      n += b.aufgaben.length;
    }
    return l.bloecke[l.bloecke.length - 1] || null;
  }

  function ringZeichnen() {
    const l = lauf;
    if (!l) return;
    const g = $('#ma-punkte');
    if (!g) return;
    const rp = Number($('#ma-ring')?.dataset.rp) || 5;
    const kinder = g.children;
    const fertig = l.zustand.filter(x => x === 'fertig').length;

    if (l.meister) {
      /* Ein Punkt je THEMA, nicht je Aufgabe: Bei über hundert Aufgaben
         wären die Punkte 1,1 px groß und überlappten. So bleibt der Ring
         lesbar — und er zeigt genau das, worüber hinterher geredet wird. */
      let n = 0, laufend = -1;
      const dran = l.offen[0];
      for (let bi = 0; bi < l.bloecke.length; bi++) {
        const b = l.bloecke[bi];
        const von = n, bis = n + b.aufgaben.length;
        n = bis;
        const zust = l.zustand.slice(von, bis);
        const offen = zust.filter(x => x === 'offen').length;
        const falsch = zust.filter(x => x === 'falsch').length;
        const c = kinder[bi];
        if (!c) continue;
        if (dran !== undefined && dran >= von && dran < bis) laufend = bi;
        const klasse = offen === zust.length ? 'offen'
                     : offen > 0 ? 'offen'
                     : falsch ? 'falsch' : 'fertig';
        c.setAttribute('class', 'ma-p ' + klasse + (laufend === bi ? ' dran' : ''));
        c.setAttribute('r', (laufend === bi ? rp * 1.3 : rp).toFixed(2));
      }
      const zael = $('#ma-zaehler');
      if (zael) zael.textContent = (fertig + l.zustand.filter(x => x === 'falsch').length)
        + '/' + l.aufgaben.length;
      const th = $('#ma-thema');
      const b = mkBlockVon(l, dran);
      if (th && b) th.textContent = b.thema.name;
      return;
    }

    const dran = l.offen[0];
    for (let i = 0; i < kinder.length; i++) {
      const c = kinder[i];
      const ist = l.zustand[i];
      c.setAttribute('class', 'ma-p ' + ist + (i === dran ? ' dran' : ''));
      c.setAttribute('r', (i === dran ? rp * 1.3 : rp).toFixed(2));
    }
    const zael = $('#ma-zaehler');
    if (zael) zael.textContent = fertig + '/' + l.aufgaben.length;
    schattenZeichnen();
  }

  /** Der Bestzeit-Schatten: Wie weit war der eigene beste Lauf zu diesem
   *  Zeitpunkt? Zwischen zwei Antworten wird linear weitergeschätzt, damit
   *  das Band gleitet statt zu springen. */
  function schattenZeichnen() {
    const el = document.querySelector('.ma-schatten');
    if (!el) return;
    const l = lauf;
    if (!l?.schatten) { el.style.opacity = 0; return; }
    el.style.opacity = '';
    const t = (Date.now() - l.start) / 1000;
    const z = l.schatten;
    let k = 0;
    while (k < z.length && z[k] <= t) k++;
    let anteil = k / z.length;
    if (k < z.length) {
      const vorher = k === 0 ? 0 : z[k - 1];
      const spanne = Math.max(0.001, z[k] - vorher);
      anteil = (k + Math.min(1, (t - vorher) / spanne)) / z.length;
    }
    el.setAttribute('stroke-dashoffset', (RING_U * (1 - Math.min(1, anteil))).toFixed(1));
  }

  /**
   * Zeichnet die laufende Aufgabe. Zwei Bauarten kommen vor:
   *   `17 · 13`     → Text, dann „=“, dann das Eingabefeld
   *   `7 + ▢ = 10`  → das Eingabefeld steht an der Stelle des ▢
   * Der zweite Fall ist der Grund, warum das Feld nicht fest im HTML steht:
   * Bei Platzhalteraufgaben gehört es mitten in die Zeile, sonst stünde da
   * ein zweites Gleichheitszeichen und die Aufgabe läse sich falsch.
   */
  function aufgabeZeichnen() {
    const l = lauf;
    const wurzel = $('#ma-aufgabe');
    if (!l || !wurzel) return;
    const i = l.offen[0];
    if (i === undefined) return;
    const text = String(l.aufgaben[i].t);
    const feld = `<span class="ma-feldchen${l.eingabe ? '' : ' leer'}" id="ma-eingabe"`
      + ` role="textbox" aria-label="Antwort">${esc(l.eingabe) || '&nbsp;'}</span>`;
    wurzel.innerHTML = text.includes('▢')
      ? esc(text).replace('▢', feld)
      : `${esc(text)} <span>=</span> ${feld}`;
  }

  function ringTaktStarten() {
    ringTaktStoppen();
    if (!lauf?.schatten) return;
    const sparsam = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (sparsam) { ringIntervall = setInterval(schattenZeichnen, 1000); return; }
    const schritt = () => {
      if (!lauf?.aktiv) return;
      schattenZeichnen();
      ringTakt = requestAnimationFrame(schritt);
    };
    ringTakt = requestAnimationFrame(schritt);
  }

  function ringTaktStoppen() {
    if (ringTakt) cancelAnimationFrame(ringTakt);
    if (ringIntervall) clearInterval(ringIntervall);
    ringTakt = ringIntervall = null;
  }

  /* --- Antworten -------------------------------------------------------- */

  function zifferTippen(z) {
    const l = lauf;
    if (!l?.aktiv) return;
    const art = l.aufgaben[l.offen[0]]?.pruefart || l.pruefart;
    const lang = ['term', 'dezimal', 'bruch', 'prozent'].includes(art);
    const grenze = lang ? 32 : art === 'rest' ? 10 : 7;
    if (l.eingabe.length >= grenze) return;
    if (art === 'vergleich') { l.eingabe = z; aufgabeZeichnen(); return; }
    if (z === ',' && !lang && l.eingabe.includes(',')) return;
    if (z === '−' && !lang && l.eingabe) return;   // Vorzeichen nur vorne
    if (z === 'R' && l.eingabe.includes('R')) return;
    l.eingabe += z;
    aufgabeZeichnen();
  }

  function wegTippen() {
    const l = lauf;
    if (!l?.aktiv) return;
    l.eingabe = l.eingabe.slice(0, -1);
    aufgabeZeichnen();
  }

  function bestaetigen() {
    const l = lauf;
    if (!l?.aktiv) return;
    /* Eine leere Bestätigung zählt NICHT als Fehler. Sonst kostete ein
       Fehlgriff auf die große Taste einen Fehler, ohne dass jemand
       gerechnet hätte. */
    if (!l.eingabe) return;

    const i = l.offen[0];
    const urteil = antwortPruefen(l.eingabe, l.aufgaben[i].a,
      l.aufgaben[i].pruefart || l.pruefart);
    /* `null` heißt: nicht verstanden. Das ist ausdrücklich KEIN Fehler —
       eine Notationsmarotte darf nie einen Lauf kosten. Die Aufgabe bleibt
       stehen, die Uhr läuft weiter. */
    if (urteil === null) {
      l.eingabe = '';
      aufgabeZeichnen();
      toast('Schreibweise nicht erkannt — noch einmal.');
      return;
    }
    const richtig = urteil;
    l.eingabe = '';

    /* Zeit für DIESE Aufgabe — die Grundlage des Index. */
    const jetzt = Date.now();
    const sekunden = Math.max(0, (jetzt - (l.letzteAntwortZeit || l.start)) / 1000);
    l.letzteAntwortZeit = jetzt;

    if (richtig) {
      // Eine zuvor falsch beantwortete Aufgabe bleibt als „falsch“ markiert,
      // bis sie sitzt — jetzt sitzt sie.
      l.zustand[i] = 'fertig';
      l.offen.shift();
      l.zeiten.push((jetzt - l.start) / 1000);
    } else {
      l.zustand[i] = 'falsch';
      l.fehler++;
      l.offen.shift();
      /* In der Meisterklasse kommt eine falsche Aufgabe NICHT wieder: Eine
         Prüfung misst, sie übt nicht. Nur so bleibt die Aufgabenzahl fest —
         und nur dann ist die Abdeckung je Thema für alle gleich. */
      if (!l.meister) l.offen.push(i);
    }

    if (l.meister) {
      const auf = l.aufgaben[i];
      l.antworten.push({ thema: auf.thema, par: auf.par, richtig, sekunden });
    }

    if (!l.offen.length) return laufBeenden();
    /* Wechselt das Thema, wechselt der Tastenblock — dann muss der ganze
       Bildschirm neu, sonst stünden die alten Tasten da. */
    if (l.meister) {
      const b = mkBlockVon(l, l.offen[0]);
      /* Beim Themenwechsel wird der ganze Bildschirm neu gebaut — dann muss
         auch die Uhr wieder in das NEUE Anzeigefeld schreiben. */
      if (b && b.thema.id + ':' + b.pruefart !== l.tastenSchluessel) {
        malLauf(); mkUhrStarten(); return;
      }
    }
    ringZeichnen();
    aufgabeZeichnen();
  }

  /** Vergleicht Eingabe und Musterlösung — je nach Prüfart auf anderem Weg.
   *  Liefert true, false oder null („nicht verstanden"). */
  function antwortPruefen(eingabe, erwartet, pruefart) {
    const e = String(eingabe || '').trim();
    if (!e) return null;
    if (pruefart === 'vergleich') return e === String(erwartet).trim();
    if (pruefart === 'term') return termStimmt(e, erwartet);
    /* „1/2 als Dezimalzahl" nahm vorher „1/2" an — die Frage abzuschreiben
       genügte für einen Stern. Bei Darstellungsaufgaben zählt deshalb nicht
       nur der Wert, sondern auch die Form. */
    if (pruefart === 'dezimal') {
      if (e.includes('/')) return null;             // Bruch getippt statt Kommazahl
      return termStimmt(e, erwartet);
    }
    if (pruefart === 'bruch') {
      if (!e.includes('/')) return null;            // Kommazahl getippt statt Bruch
      return termStimmt(e, erwartet);
    }
    if (pruefart === 'prozent') {
      if (e.includes('/') || e.includes(',')) return null;
      return termStimmt(e, erwartet);
    }
    if (pruefart === 'rest') {
      const norm = x => String(x).toUpperCase().replace(/\s+/g, '')
        .replace(/[−–—]/g, '-').replace(/REST/g, 'R');
      if (!/R/.test(norm(e))) return null;          // ohne Rest ist es keine Antwort
      return norm(e) === norm(erwartet);
    }
    return antwortStimmt(e, erwartet);
  }

  function laufBeenden() {
    const l = lauf;
    ringTaktStoppen();
    l.aktiv = false;
    const dauer = (Date.now() - l.start) / 1000;
    l.ende = { dauer, sauber: l.fehler === 0 };

    if (l.meister) return meisterBeenden(l, dauer);

    if (l.modus === 'test') {
      const alt = standVon(l.bereichId, l.nr);
      const n = l.aufgaben.length;
      const wertbar = !l.unterbrochen;
      const bisher = alt?.beste && alt.beste.n === n ? alt.beste : null;
      const gemessen = Math.max(MIN_ZEIT, Math.round(dauer * 10) / 10);
      const besser = wertbar && dauer >= MIN_ZEIT && (!bisher || gemessen < bisher.s);
      const neueBeste = besser
        ? { n, s: gemessen, zeiten: l.zeiten.map(x => Math.round(Math.max(0, x) * 10) / 10) }
        : (alt?.beste || null);

      l.ende.bestzeitNeu = besser;
      l.ende.beste = neueBeste;
      l.ende.stern = l.fehler === 0 && dauer <= ZIEL_SEKUNDEN && wertbar;

      standSichern(l.bereichId, l.nr, {
        versuche: (alt?.versuche || 0) + 1,
        fehlerGesamt: (alt?.fehlerGesamt || 0) + l.fehler,
        sauber: !!alt?.sauber || l.fehler === 0,
        stern: !!alt?.stern || l.ende.stern,
        beste: neueBeste,
        zuletzt: heute()
      });
      tagesStatistik(dauer);
      /* Jeder abgeschlossene Testlauf hält den Streak, nicht nur ein Stern —
         genauso wie eine Übungsrunde in der Lernbox. Rechnen ist Lernen. */
      w.streakPflegen();
    } else {
      // Der Übungsmodus zählt als Lernzeit, aber nicht als Versuch.
      tagesStatistik(dauer);
    }
    malAbschluss();
  }

  /** Auswertung der Meisterklasse: Index, Bilanz je Thema, Speicher. */
  function meisterBeenden(l, dauer) {
    mkUhrStoppen();
    const erg = MK.indexRechnen(l.antworten);
    const bilanz = MK.themenBilanz(l.antworten);
    l.ende = { ...l.ende, ...erg, abgelaufen: !!l.abgelaufen, themen: bilanz };

    if (ladefehler || !geladen) {
      toast('Ohne Verbindung zum Stand — diese Prüfung wird nicht gewertet.', 'fehler');
    } else {
      const stand = daten.meisterklasse || (daten.meisterklasse = { laeufe: [] });
      const eintrag = {
        datum: heute(), wahl: l.wahl, index: erg.index, sekunden: erg.sekunden,
        richtig: erg.richtig, gesamt: erg.gesamt, abgebrochen: !!l.abgelaufen,
        themen: bilanz
      };
      /* Die letzten zwanzig reichen: Für die Diagnose zählen die letzten
         fünf, für den Verlauf will niemand hundert Zeilen sehen. */
      stand.laeufe = stand.laeufe.concat([eintrag]).slice(-20);
      schreibe(FB.setDoc(FB.doc(w.colMathe(), 'meisterklasse'),
        { laeufe: stand.laeufe }, { merge: false }), 'Meisterklasse');
      tagesStatistik(dauer);
      w.streakPflegen();
    }
    malMeisterAbschluss();
  }

  function malMeisterAbschluss() {
    const l = lauf, e = l.ende;
    const stand = daten?.meisterklasse || { laeufe: [] };
    const vorher = (stand.laeufe || []).slice(0, -1);
    const bisher = vorher.length ? Math.max(...vorher.map(x => Number(x.index) || 0)) : null;
    const bilanzen = (stand.laeufe || []).slice(-5).map(x => x.themen || {});
    const dia = MK.diagnose(bilanzen);

    ziel().innerHTML = `
      <div class="ma-kopf">
        <div><strong>Meisterklasse</strong></div>
        <button class="btn" data-tu="matheMeister">Zur Übersicht</button>
      </div>
      <div class="ma-abschluss">
        <div class="ma-zeit">${e.index.toFixed(0)}</div>
        <p class="mini" style="margin-top:2px">Index${
          bisher != null ? ` · beste bisher ${bisher.toFixed(0)}` : ''}${
          e.index > (bisher ?? -1) && vorher.length ? ' — <strong>neue Bestleistung</strong>' : ''}</p>
        <p style="margin-top:10px">${e.richtig} von ${e.gesamt} richtig ·
          ${esc(zeitText(e.sekunden))}${e.abgelaufen
            ? ' · <strong>Zeit abgelaufen</strong> — der Rest wurde nicht geprüft' : ''}</p>
        <p class="mini">Index 100 hieße: quer durch alles genau das Tempo, das ein Stern
          verlangt, und nichts falsch.</p>
        <div class="row mt" style="justify-content:center">
          <button class="btn primary" data-tu="matheMkStarten">Noch einmal</button>
          <button class="btn" data-tu="matheMeister">Übersicht</button>
        </div>
      </div>
      ${dia.length ? diagnoseHtml(dia, bilanzen.length) : ''}`;
    verdrahten(ziel());
  }

  /** Zeit zählt als Lernzeit (Tagesring, Streak), Läufe zählen NICHT als
   *  Abfragen — sonst stünde die Statistik des Karteikastens voller
   *  Rechenaufgaben. Ein Schreibvorgang je Lauf, nicht je Aufgabe. */
  function tagesStatistik(sekunden) {
    const tag = heute();
    const s = Math.max(0, Math.round(sekunden));
    schreibe(FB.setDoc(FB.doc(w.colReviews(), tag), {
      datum: tag,
      matheLaeufe: FB.increment(1),
      matheSekunden: FB.increment(s),
      sekunden: FB.increment(s)
    }, { merge: true }), 'Mathematik-Statistik');
    S.heutigeSekunden = (S.heutigeSekunden || 0) + s;
    S.reviewsGeladen = false;
  }

  function malAbschluss() {
    const l = lauf;
    const z = ziel();
    const e = l.ende;
    const beste = e.beste;
    const uebung = l.modus === 'uebung';
    const naechste = naechstesSet(l.bereichId);

    z.innerHTML = `
      <div class="ma-kopf">
        <div><strong>Set ${l.nr}</strong> <span class="mini">${esc(l.set.titel)}</span></div>
        <button class="btn" data-tu="matheZumRaster">Zum Raster</button>
      </div>
      <div class="ma-abschluss">
        <div style="font-size:40px;line-height:1">${e.stern ? '★' : e.sauber ? '✓' : '↻'}</div>
        <div class="ma-zeit">${zeitText(e.dauer)}</div>
        <p class="mini" style="margin-top:2px">
          ${uebung ? 'Übungsmodus — nicht gewertet.'
            : l.unterbrochen ? 'Unterbrochen — die Zeit zählt nicht als Bestzeit.'
            : e.bestzeitNeu ? '<strong>Neue Bestzeit.</strong>'
            : beste ? `Bestzeit: ${zeitText(beste.s)}` : ''}
        </p>
        <p style="margin-top:10px">
          ${e.sauber ? 'Fehlerfrei.' : `${l.fehler} ${l.fehler === 1 ? 'Fehler' : 'Fehler'} —
            jede falsche Aufgabe kam noch einmal.`}
          ${e.stern ? ' Unter 60 Sekunden: Stern.' : ''}
        </p>
        ${!uebung && !e.stern ? `<p class="mini">Für den Stern: fehlerfrei und unter
          ${ZIEL_SEKUNDEN} Sekunden.</p>` : ''}
        <div class="row mt" style="justify-content:center">
          <button class="btn primary" data-tu="matheStarten" data-id="${l.nr}">Noch einmal</button>
          ${naechste !== l.nr
            ? `<button class="btn" data-tu="matheStarten" data-id="${naechste}">Set ${naechste}</button>`
            : ''}
          <button class="btn" data-tu="matheZumRaster">Raster</button>
        </div>
      </div>`;
    verdrahten(z);
  }

  function zeitText(s) {
    const v = Math.max(0, Number(s) || 0);
    /* Erst runden, dann aufteilen. Vorher lief die Restzeit der
       Meisterklasse jede Minute für eine halbe Sekunde auf „14:60 min“:
       Math.floor(899,6/60) ist 14 und Math.round(899,6 % 60) ist 60.
       Dasselbe gilt für die Zehntelanzeige — 59,96 s soll „1:00 min“
       heißen und nicht „60,0 s“. */
    const zehntel = Math.round(v * 10) / 10;
    if (zehntel < 60) return zehntel.toFixed(1).replace('.', ',') + ' s';
    const ganz = Math.round(v);
    return Math.floor(ganz / 60) + ':' + String(ganz % 60).padStart(2, '0') + ' min';
  }

  /* ---------------------------------------------------------------------
     Aktionen — sie hängen sich in dieselbe Tabelle wie der Rest des
     Programms, damit `verdrahten()` unverändert funktioniert.
     --------------------------------------------------------------------- */

  Object.assign(w.AKTION, {
    matheBereich(id) { ansicht.bereich = id; malen(); },
    matheZurueck()   { ansicht.bereich = null; lauf = null; malen(); },
    matheZumRaster() { lauf = null; malen(); },
    matheModus(_, el) { ansicht.modus = el?.checked ? 'uebung' : 'test'; },
    matheStarten(nr) { laufStarten(Number(nr)); },
    matheMeister()   { lauf = null; ansicht.bereich = 'meisterklasse'; malen(); },
    matheMkStarten() { meisterStarten(); },
    matheMkWahl(id, el) {
      if (el?.checked) { if (!mkWahl.includes(id)) mkWahl.push(id); }
      else mkWahl = mkWahl.filter(x => x !== id);
      malMeister();
    },
    matheMkUeben(id) {
      const [bereich, nr] = String(id).split(':');
      lauf = null; ansicht.bereich = bereich; ansicht.modus = 'test';
      malen();
      laufStarten(Number(nr));
    },
    matheZiffer(z)   { zifferTippen(String(z)); },
    matheWeg()       { wegTippen(); },
    matheOk()        { bestaetigen(); },
    async matheAbbrechen() {
      if (!lauf?.aktiv) { lauf = null; return malen(); }
      if (!await frage('Lauf abbrechen?',
        'Der angefangene Lauf wird verworfen. Bestzeiten bleiben, wie sie sind.',
        'Verwerfen', 'gefahr')) return;
      ringTaktStoppen();
      mkUhrStoppen();
      const warMeister = lauf.meister;
      lauf = null;
      if (warMeister) ansicht.bereich = 'meisterklasse';
      malen();
    }
  });

  /* ---------------------------------------------------------------------
     Tastatur — am Rechner wird getippt, nicht geklickt
     --------------------------------------------------------------------- */

  function taste(e) {
    if (!lauf?.aktiv) return false;
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (/^[0-9]$/.test(e.key)) { zifferTippen(e.key); return true; }
    if (e.key === ',' || e.key === '.') { zifferTippen(','); return true; }
    if (e.key === '-') { zifferTippen('−'); return true; }
    /* Nur Zeichen durchlassen, die auf dem Block dieses Sets liegen. Vorher
       schrieb ein Fehlgriff auf `/` oder `*` — beide liegen auf dem
       Ziffernblock direkt neben den Zahlen — ein Zeichen ins Feld, das dort
       nichts zu suchen hatte, und kostete beim Bestätigen einen Fehler. */
    if (e.key.length === 1 && '+*/^()|<>=xXrRsScCtTlLeEnNπ√,'.includes(e.key)) {
      const z = e.key === 'X' ? 'x' : (e.key === 'r' || e.key === 'R') ? 'R' : e.key;
      const b = lauf.meister ? mkBlockVon(lauf, lauf.offen[0]) : null;
      const erlaubt = new Set(tastenListe(b ? b.aufgaben : lauf.aufgaben,
        b ? b.pruefart : lauf.pruefart).zeichen);
      if (erlaubt.has(z)) { zifferTippen(z); return true; }
      // Buchstaben einer Mehrzeichentaste (sin, cos, ln) einzeln zulassen
      const mehr = [...erlaubt].filter(t => t.length > 1);
      if (mehr.some(t => t.includes(e.key.toLowerCase()))) { zifferTippen(e.key.toLowerCase()); return true; }
      return true;                                  // schlucken, nicht weiterreichen
    }
    if (e.key === 'Backspace') { wegTippen(); return true; }
    if (e.key === 'Enter') { bestaetigen(); return true; }
    if (e.key === 'Escape') { w.AKTION.matheAbbrechen()?.catch?.(() => {}); return true; }
    return false;
  }

  /* Wegschalten mitten im Testlauf: Die Uhr läuft weiter (sie misst
     Wanduhrzeit), aber der Lauf zählt nicht mehr als Bestzeit. Sonst wäre
     ein Anruf entweder eine Strafe oder — beim Anhalten der Uhr — eine
     Einladung zum Nachdenken in der Pause. */
  let wegSeit = 0;
  document.addEventListener('visibilitychange', () => {
    if (!lauf?.aktiv || lauf.modus !== 'test') return;
    if (document.visibilityState === 'hidden') { wegSeit = Date.now(); return; }
    if (wegSeit && Date.now() - wegSeit > UNTERBRECHUNG_MS) lauf.unterbrochen = true;
    wegSeit = 0;
  });

  /* ---------------------------------------------------------------------
     Der Einstiegspunkt für index.html
     --------------------------------------------------------------------- */

  let bereicheDa = false;

  function malen() {
    stilEinhaengen();
    if (!ziel()) return;
    if (!bereicheDa) {
      bereicheDa = true;
      bereicheLaden().then(() => { if (S.seite === 'mathe') malen(); });
    }
    if (!daten) {
      ziel().innerHTML = '<p class="mini">Stand wird geladen …</p>';
      datenLaden().then(() => { if (S.seite === 'mathe') malen(); });
      return;
    }
    datenLaden();                       // still nachladen, falls beim ersten Mal nichts kam
    if (lauf?.aktiv) return malLauf();
    if (lauf?.ende) return lauf.meister ? malMeisterAbschluss() : malAbschluss();
    if (ansicht.bereich === 'meisterklasse') return malMeister();
    if (ansicht.bereich) return malRaster();
    malUebersicht();
  }

  stilEinhaengen();

  return {
    malen,
    taste,
    aktiv: () => !!(lauf && (lauf.aktiv || lauf.ende)),
    laeuft: () => !!lauf?.aktiv,
    /* Fenster für die Abnahmeprüfungen — dieselbe Überlegung wie bei
       window.__T in index.html: nur reine Funktionen und der Zustand, den
       die Entwicklerkonsole ohnehin sähe. */
    __T: {
      setAufgaben, antwortStimmt, tastenFuer, BEREICHE, bereicheLaden,
      naechstesSet, standVon, zeitText, sterneGesamt, tastenListe, antwortPruefen,
      MK, meisterStarten, mkWahl: () => mkWahl, mkSetzen: w => { mkWahl = w; },
      lauf: () => lauf,
      ansicht: () => ansicht,
      daten: () => daten,
      neuLaden: () => { geladen = false; daten = null; letzterVersuch = 0; }
    }
  };
}
