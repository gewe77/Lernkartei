/* =========================================================================
   HAN CROCO — Meisterklasse
   -------------------------------------------------------------------------
   Eine Prüfung quer durch alles: gewürfelt, rund zehn Minuten, und danach
   steht da, was noch nicht sitzt.

   Das schwierige daran ist nicht das Würfeln, sondern die VERGLEICHBARKEIT.
   Zwei gewürfelte Prüfungen messen nicht dasselbe — die Zeiten
   nebeneinanderzulegen wäre Zahlenaberglaube. Zwei Vorkehrungen dagegen:

   1. DER BAUPLAN legt fest, wie viele Aufgaben aus welchem Thema kommen.
      Gewürfelt wird nur, WELCHE Aufgabe aus dem Thema — nie, wie viele.
      Damit fällt die größte Schwankung weg: die Mischung.

   2. DER INDEX misst gegen ein Par, das mit den Aufgaben mitreist. Das Par
      steht im Programm längst: 60 Sekunden geteilt durch die Aufgabenzahl
      des Sets ist die Sollzeit je Aufgabe. Index 100 heißt: quer durch
      alles genau das Tempo, das ein Stern verlangt, und nichts falsch.

           Summe der Par-Zeiten aller RICHTIG gelösten Aufgaben
   Index = ──────────────────────────────────────────────────── · 100
                       gebrauchte Gesamtzeit

   Fehler brauchen deshalb keine künstliche Strafe: Eine falsche Aufgabe
   steuert null zum Zähler bei, ihre Zeit aber zum Nenner.
   ========================================================================= */

import { BEREICHE, setVon } from './mathe-sets.js';
import { raumBauen, zufallVon, mischenMit } from './mathe-erzeuger.js';

/* --- Die Themen ----------------------------------------------------------
   Gröber als Sets, feiner als Bereiche. Ein Set gehört zu genau einem
   Thema; die Grenzen folgen den Blöcken aus MATHEMATIK.md.
   ------------------------------------------------------------------------- */

const T = (id, name, bereich, von, bis, extra) =>
  ({ id, name, bereich, bereiche: [[von, bis]].concat(extra || []) });

export const THEMEN = [
  /* Bereich 1 — Grundoperationen bis 100 */
  T('grund-plusminus', 'Plus und Minus bis 100',   'grundoperationen',  1, 34, [[97, 100]]),
  T('grund-ergaenzen', 'Ergänzen auf 10 und 100',  'grundoperationen', 35, 44),
  T('grund-doppelt',   'Verdoppeln und Halbieren', 'grundoperationen', 45, 52),
  T('grund-einmaleins','Kleines Einmaleins',       'grundoperationen', 53, 80),
  T('grund-division',  'Division bis 100',         'grundoperationen', 81, 90),
  T('grund-platzhalter','Platzhalter und Umkehr',  'grundoperationen', 91, 96),

  /* Bereich 2 — Zahlenraum 10 000 */
  T('zt-plusminus',  'Plus und Minus bis 10 000',    'zehntausend',  1, 26),
  T('zt-ergaenzen',  'Ergänzen im Tausenderraum',    'zehntausend', 27, 48),
  T('zt-einmaleins', 'Großes Einmaleins',            'zehntausend', 49, 74),
  T('zt-quadrat',    'Quadratzahlen',                'zehntausend', 75, 82),
  T('zt-division',   'Große Division, Teilen mit Rest','zehntausend', 83, 100),

  /* Bereich 3 — Größen */
  T('gr-laenge',  'Längen und Flächen',    'groessen',  7, 28, [[80, 100]]),
  T('gr-gewicht', 'Gewichte und Hohlmaße', 'groessen', 29, 59),
  T('gr-zeit',    'Zeit und Geld',         'groessen', 60, 79, [[1, 6]]),

  /* Bereich 4 — Sekundarstufe */
  T('sek-potenz',   'Zehnerpotenzen, negative Zahlen', 'sekundarstufe',  1, 30),
  T('sek-bruch',    'Brüche, Komma, Prozent',          'sekundarstufe', 31, 70),
  T('sek-wurzel',   'Quadratzahlen und Wurzeln',       'sekundarstufe', 71, 85),
  T('sek-term',     'Terme und Gleichungen',           'sekundarstufe', 86, 100),

  /* Bereich 5 — Trigonometrie und Stochastik (wahlweise) */
  T('trig-winkel', 'Winkel und exakte Werte',     'trigstoch',  1, 58),
  T('trig-stoch',  'Wahrscheinlichkeit, Lagemaße','trigstoch', 59, 100),

  /* Bereich 6 — Analysis (wahlweise) */
  T('ana-ableiten',  'Ableiten',    'analysis',  1, 76),
  T('ana-integrieren','Integrieren','analysis', 77, 100)
];

export const themaVon = id => THEMEN.find(t => t.id === id) || null;

/** Die Sets eines Themas. */
export function setsZuThema(thema) {
  const b = BEREICHE.find(x => x.id === thema.bereich);
  if (!b) return [];
  return b.sets.filter(s => thema.bereiche.some(([v, n]) => s.nr >= v && s.nr <= n));
}

/* --- Der Bauplan ---------------------------------------------------------
   Feste Grundlage (Bereiche 1 bis 4), Bereiche 5 und 6 wahlweise dazu.
   Je Thema gleich viele Aufgaben — nur so trägt die Diagnose gleich weit.
   ------------------------------------------------------------------------- */

export const GRUNDBEREICHE = ['grundoperationen', 'zehntausend', 'groessen', 'sekundarstufe'];
export const WAHLBEREICHE  = ['trigstoch', 'analysis'];

/** Sollzeit je Aufgabe: 60 Sekunden durch die Aufgabenzahl des Sets. Das ist
 *  dieselbe Meßlatte, an der auch der Stern hängt. */
export const parVon = set => 60 / (set?.aufgaben || 24);

/**
 * Wie viele Aufgaben je Thema, damit ein Lauf bei realistischem Tempo
 * (dem Anderthalbfachen der Sollzeit) rund zehn Minuten dauert.
 * Gerechnet, nicht geschätzt — und nach unten auf 4 begrenzt, weil unter
 * vier Aufgaben je Thema die Diagnose nichts mehr hergibt.
 */
export function aufgabenJeThema(themen, zielSekunden = 600, faktor = 1.5) {
  if (!themen.length) return 0;
  const parSumme = themen.reduce((n, t) => {
    const sets = setsZuThema(t);
    const mittel = sets.length
      ? sets.reduce((a, s) => a + parVon(s), 0) / sets.length : 3;
    return n + mittel;
  }, 0);
  const je = zielSekunden / (faktor * parSumme);
  return Math.max(4, Math.min(10, Math.round(je)));
}

/** Die Themen eines Bauplans. `wahl` ist eine Liste aus WAHLBEREICHE. */
export function bauplanThemen(wahl = []) {
  const erlaubt = new Set(GRUNDBEREICHE.concat(wahl.filter(b => WAHLBEREICHE.includes(b))));
  return THEMEN.filter(t => erlaubt.has(t.bereich) && setsZuThema(t).length);
}

/* --- Die Ziehung ---------------------------------------------------------
   Themenweise, damit der Tastenblock nicht bei jeder Aufgabe wechselt: Die
   Aufgaben eines Themas kommen zusammenhängend, die REIHENFOLGE DER THEMEN
   wird gewürfelt. Innerhalb eines Themas wird aus möglichst VIELEN
   verschiedenen Sets gezogen — sechsmal dasselbe Set wäre keine Stichprobe.
   ------------------------------------------------------------------------- */

export function ziehen(themen, jeThema, startwert) {
  const rnd = zufallVon(startwert);
  const bloecke = [];
  const raumSpeicher = new Map();
  /* Keine Aufgabe zweimal in DERSELBEN Prüfung — auch nicht über
     Themengrenzen hinweg. Zwei Themen können auf dasselbe Set zugreifen. */
  const gesehen = new Set();

  for (const thema of themen) {
    const sets = setsZuThema(thema);
    if (!sets.length) continue;
    /* Reihum durch die gemischten Sets: Bei sechs Aufgaben und 28 Sets sind
       das sechs verschiedene, bei sechs Aufgaben und vier Sets zwei Runden. */
    const reihe = mischenMit(sets, rnd);
    const aufgaben = [];
    for (let i = 0; i < jeThema; i++) {
      const set = reihe[i % reihe.length];
      /* Den Aufgabenraum je Set nur EINMAL bauen. Ohne diesen Zwischenspeicher
         entstünde er für jede der gut hundert Aufgaben neu — bei Sets mit
         zwanzigtausend möglichen Aufgaben dauert eine Prüfung dann Sekunden
         statt Millisekunden. */
      let raum = raumSpeicher.get(set);
      if (!raum) {
        try { raum = raumBauen(set.regel); } catch (_) { raum = []; }
        raumSpeicher.set(set, raum);
      }
      if (!raum.length) continue;
      let a = null;
      for (let versuch = 0; versuch < 12 && !a; versuch++) {
        const k = raum[Math.floor(rnd() * raum.length)];
        if (k && !gesehen.has(k.t)) a = k;
      }
      if (!a) continue;
      gesehen.add(a.t);
      aufgaben.push({
        t: a.t, a: a.a,
        pruefart: set.pruefart || 'zahl',
        bereich: thema.bereich, setNr: set.nr, thema: thema.id,
        par: parVon(set)
      });
    }
    /* Ein Block ist (Thema × Prüfart), nicht nur das Thema: Manche Themen
       reichen über Sets mit verschiedenen Antwortarten — „Große Division,
       Teilen mit Rest" etwa über Zahl UND Rest, „Brüche, Komma, Prozent"
       über drei. Innerhalb eines Blocks bleibt der Tastenblock damit
       garantiert stehen. Für die Diagnose zählt weiter das Thema. */
    const nachArt = new Map();
    aufgaben.forEach(a => {
      const l = nachArt.get(a.pruefart) || [];
      l.push(a); nachArt.set(a.pruefart, l);
    });
    for (const [pruefart, liste] of nachArt) bloecke.push({ thema, pruefart, aufgaben: liste });
  }

  return mischenMit(bloecke, rnd);
}

/* --- Der Index -----------------------------------------------------------
   Eine Kennzahl, die falsch rechnet, wäre schlimmer als keine. Deshalb
   steht sie hier für sich, ohne Oberfläche, und wird gegen gestellte Läufe
   nachgerechnet.
   ------------------------------------------------------------------------- */

/**
 * @param {Array<{par:number, richtig:boolean, sekunden:number}>} antworten
 * @returns {{index:number, parSumme:number, sekunden:number,
 *            richtig:number, gesamt:number, quote:number}}
 */
export function indexRechnen(antworten) {
  const gesamt = antworten.length;
  let parSumme = 0, sekunden = 0, richtig = 0;
  for (const x of antworten) {
    const s = Math.max(0, Number(x.sekunden) || 0);
    sekunden += s;
    if (x.richtig) { richtig++; parSumme += Math.max(0, Number(x.par) || 0); }
  }
  /* Ohne verbrauchte Zeit gibt es keinen Index — nicht „unendlich". Und
     nach oben gedeckelt: Ein Mensch kommt nicht über etwa 300; alles darüber
     ist eine klemmende Taste oder ein Prüflauf, und ein solcher Wert stünde
     sonst für immer als „Bestleistung" da. */
  const index = sekunden > 0 ? Math.min(1000, (parSumme / sekunden) * 100) : 0;
  return {
    index: Math.round(index * 10) / 10,
    parSumme: Math.round(parSumme * 10) / 10,
    sekunden: Math.round(sekunden * 10) / 10,
    richtig, gesamt,
    quote: gesamt ? Math.round((richtig / gesamt) * 1000) / 10 : 0
  };
}

/* --- Die Diagnose --------------------------------------------------------
   Nicht nur die Fehler zählen: Wer `7 · 8` richtig, aber in sechs Sekunden
   rechnet, hat es nicht automatisiert — das ist die frühe Warnung, lange
   bevor Fehler auftauchen.
   ------------------------------------------------------------------------- */

export const EINSTUFUNG = {
  sitzt:  { rang: 0, name: 'sitzt',      farbe: 'var(--bewertung-3)' },
  wackelt:{ rang: 1, name: 'wackelt',    farbe: 'var(--faellig)' },
  fehlt:  { rang: 2, name: 'fehlt noch', farbe: 'var(--bewertung-1)' }
};

/**
 * Verdichtet die Antworten eines Laufs auf Themen. Nur diese Verdichtung
 * wird gespeichert — die einzelnen Aufgaben eines Laufs braucht später
 * niemand mehr, und hundert Einträge je Prüfung wären reine Ballast.
 * @param {Array<{thema:string, par:number, richtig:boolean, sekunden:number}>} antworten
 */
export function themenBilanz(antworten) {
  const o = {};
  for (const x of antworten || []) {
    if (!x?.thema) continue;
    const e = o[x.thema] || (o[x.thema] = { n: 0, fehler: 0, sekunden: 0, par: 0 });
    e.n++;
    if (!x.richtig) e.fehler++;
    e.sekunden += Math.max(0, Number(x.sekunden) || 0);
    e.par += Math.max(0, Number(x.par) || 0);
  }
  Object.values(o).forEach(e => {
    e.sekunden = Math.round(e.sekunden * 10) / 10;
    e.par = Math.round(e.par * 10) / 10;
  });
  return o;
}

/**
 * Fasst mehrere Läufe zu einer Diagnose je Thema zusammen.
 * @param {Array<Object>} bilanzen — je Lauf das Ergebnis von themenBilanz()
 */
export function diagnose(bilanzen) {
  const je = new Map();
  for (const bilanz of bilanzen || []) {
    for (const [id, x] of Object.entries(bilanz || {})) {
      const e = je.get(id) || { n: 0, fehler: 0, sekunden: 0, par: 0 };
      e.n += Number(x.n) || 0;
      e.fehler += Number(x.fehler) || 0;
      e.sekunden += Math.max(0, Number(x.sekunden) || 0);
      e.par += Math.max(0, Number(x.par) || 0);
      je.set(id, e);
    }
  }

  const heraus = [];
  for (const [id, e] of je) {
    const thema = themaVon(id);
    if (!thema) continue;
    const verhaeltnis = e.par > 0 ? e.sekunden / e.par : 0;
    /* Die Fehlerschwelle wächst mit der Zahl der Aufgaben: Ein Fehler bei
       sechs Aufgaben wiegt schwerer als einer bei achtzehn. */
    const fehlerAnteil = e.n ? e.fehler / e.n : 0;
    const stufe = (fehlerAnteil >= 0.25 || verhaeltnis > 2) ? 'fehlt'
                : (fehlerAnteil > 0 || verhaeltnis > 1.3)   ? 'wackelt'
                : 'sitzt';
    heraus.push({
      thema, id, n: e.n, fehler: e.fehler, stufe,
      verhaeltnis: Math.round(verhaeltnis * 100) / 100,
      sekundenJeAufgabe: e.n ? Math.round((e.sekunden / e.n) * 10) / 10 : 0
    });
  }
  /* Das Schwächste zuerst, bei gleicher Stufe das Langsamere. */
  return heraus.sort((a, b) =>
    EINSTUFUNG[b.stufe].rang - EINSTUFUNG[a.stufe].rang || b.verhaeltnis - a.verhaeltnis);
}

/**
 * Der Übungsplan: die Schlüsselsets der schwächsten Themen. Schlüsselsets
 * tragen alles andere — sie zuerst zu festigen bringt am meisten.
 */
export function uebungsplan(diagnoseListe, hoechstens = 5) {
  const plan = [];
  for (const d of diagnoseListe) {
    if (d.stufe === 'sitzt' || plan.length >= hoechstens) break;
    const sets = setsZuThema(d.thema);
    if (!sets.length) continue;
    const schluessel = sets.filter(s => s.schluessel);
    const wahl = (schluessel.length ? schluessel : sets)[0];
    plan.push({ thema: d.thema, stufe: d.stufe, bereich: d.thema.bereich,
                setNr: wahl.nr, titel: wahl.titel });
  }
  return plan;
}

/** Wie belastbar ist die Diagnose? Ein Lauf ist ein Hinweis, drei sind eine
 *  Diagnose — das gehört auf den Bildschirm, nicht in eine Fußnote. */
export function belastbarkeit(anzahlLaeufe) {
  if (anzahlLaeufe >= 3) return { stufe: 'diagnose', text: 'Aus ' + anzahlLaeufe + ' Prüfungen — das trägt.' };
  if (anzahlLaeufe === 2) return { stufe: 'hinweis', text: 'Aus zwei Prüfungen. Nach der dritten wird es belastbar.' };
  return { stufe: 'hinweis', text: 'Aus einer Prüfung — das ist ein Hinweis, noch keine Diagnose.' };
}
