/* =========================================================================
   HAN CROCO — Bereich 4: Sekundarstufe
   -------------------------------------------------------------------------
   100 Sets zu 12 Aufgaben. Der Teil, der im Unterricht tatsächlich
   weiterhilft: Zehnerpotenzen, Vorzeichen, Bruch–Komma–Prozent, Prozent im
   Kopf, Quadratzahlen und Wurzeln bis 625 — und zum Schluss die erste
   Unbekannte.

   Vier Festlegungen tragen diesen Bereich:

   1. GERECHNET WIRD MIT ZIFFERNFOLGE UND STELLENZAHL, nicht mit Fließkomma.
      `0,07 · 1000` verschiebt das Komma um drei Stellen; als Zahlenrechnung
      wäre es 0.07 * 1000 = 70.00000000000001, und die Musterlösung stünde
      falsch da. Jede Kommazahl ist hier ein Paar (Ziffern, Nachkommastellen),
      und alles Rechnen darauf ist Ganzzahlarithmetik.

   2. DAS MINUSZEICHEN HAT ZWEI GESTALTEN. Im Aufgabentext steht das
      typografische „−" (U+2212), damit `−3 · (−4)` gesetzt aussieht. In der
      ANTWORT steht das ASCII-„-", denn die Antwort wird mit der Tastatur-
      eingabe verglichen, und eine Tastatur liefert ein gewöhnliches Minus.

   3. ANTWORTEN SIND GANZE ZAHLEN, WO ES GEHT. Das Komma trägt der Faktor,
      nicht das Ergebnis. Wo eine Kommazahl die Aufgabe IST (`7 : 100`) oder
      wo ein Bruch verlangt wird (`40 % als Bruch`), steht das Set auf
      `pruefart: 'term'` und wird über mathe-term.js verglichen — dort gilt
      `2/5` genauso wie `0,4`.

   4. INNERHALB EINES SETS MISCHT SICH DIE ANTWORTFORM NICHT. Das Tastenfeld
      entsteht je Set aus den Antworten; ein Set, das mal eine ganze Zahl und
      mal einen Bruch verlangt, bräuchte zwei Tastenblöcke zugleich. Die
      Umformungen stehen deshalb als getrennte Blöcke da: „→ Prozent" ist
      eine Zahl, „→ Komma" und „→ Bruch" sind Terme.
   ========================================================================= */

import { erzeugerAnmelden, spanne, raumBauen } from './mathe-erzeuger.js';

/* --- Zahlen als Text ----------------------------------------------------- */

/** Hochgestellte Ziffern für `10³`. Index ist der Exponent. */
const HOCH = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶'];

/** Zehnerpotenz als Zahl: 3 → 1000. Iterativ, damit kein Math.pow-Rundungs-
 *  rest entsteht — 10^7 wäre sonst nicht mehr bitgenau darstellbar. */
function zehnHoch(e) { let w = 1; for (let i = 0; i < e; i++) w *= 10; return w; }

/** Kürzt abschließende Nullen gegen Nachkommastellen: (700, 2) → [7, 0].
 *  Danach gilt: die Zahl ist genau dann ganz, wenn `stellen <= 0` ist. */
function kuerzen(ziffern, stellen) {
  while (stellen > 0 && ziffern % 10 === 0) { ziffern /= 10; stellen--; }
  return [ziffern, stellen];
}

/**
 * Eine Zahl aus Ziffernfolge und Nachkommastellen.
 * `minus` ist das Vorzeichen: im Aufgabentext das typografische „−",
 * in der Antwort das ASCII-„-", das die Tastatur liefert.
 */
function zahlText(ziffern, stellen, minus) {
  [ziffern, stellen] = kuerzen(ziffern, stellen);
  const vz = ziffern < 0 ? minus : '';
  let s = String(Math.abs(ziffern));
  if (stellen <= 0) return vz + s + '0'.repeat(-stellen);
  while (s.length <= stellen) s = '0' + s;                 // 7 → 0,07
  return vz + s.slice(0, s.length - stellen) + ',' + s.slice(s.length - stellen);
}

const textZahl    = (z, stellen = 0) => zahlText(z, stellen, '−');
const antwortZahl = (z, stellen = 0) => zahlText(z, stellen, '-');

/** Ganze Zahl im Aufgabentext: -7 → „−7". */
const gz = v => (v < 0 ? '−' + Math.abs(v) : String(v));
/** Dieselbe Zahl geklammert, wenn sie negativ ist: -7 → „(−7)".
 *  Ohne die Klammer stünde `5 + −3` da, und das schreibt niemand so. */
const kl = v => (v < 0 ? '(−' + Math.abs(v) + ')' : String(v));
/** Antwort: immer ASCII-Minus. String(-7) liefert genau das. */
const az = v => String(v);

/** Ein Vielfaches von x: 3 → „3x", 1 → „x". Niemand schreibt `1x`, und wer
 *  es liest, sucht den Fehler an der falschen Stelle. */
const xMal = k => (k === 1 ? 'x' : `${k}x`);

/** Größter gemeinsamer Teiler — für das Kürzen der Bruchantworten. */
function ggt(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }

/** Die Werte einer Spanne, jeder mit `vielfach` malgenommen. Bereich 2 macht
 *  Vielfache über einen Filter (`if (a % schritt) continue`); das geht hier
 *  nicht, weil `spanne` lange Bereiche auf 150 Werte eindampft und von denen
 *  kaum einer den Filter überlebte. Multiplizieren behält jeden Wert. */
const vielfache = (bereich, saat, vielfach) =>
  spanne(bereich, saat).map(v => v * (vielfach || 1)).filter(v => v >= 1);

/** Niemand tippt siebenstellig: Die Oberfläche nimmt höchstens sieben
 *  Zeichen an. Was länger wäre, darf gar nicht erst als Aufgabe entstehen. */
const tippbar = a => a.length <= 7;


erzeugerAnmelden({

  /**
   * Zehnerpotenzen: `0,07 · 1000` → 70, `4200 : 100` → 42.
   *
   *   a         Ziffernfolge der gezeigten Zahl (ohne Komma)
   *   vielfach  jede Ziffernfolge malgenommen — so entstehen glatte Zahlen
   *   stellen   Nachkommastellen der gezeigten Zahl
   *   op        'mal' oder 'geteilt'
   *   hoch      Spanne der Exponenten (1 = zehn, 3 = tausend)
   *   ganz      true (Vorgabe): nur ganzzahlige Ergebnisse
   *             false: nur Ergebnisse mit Komma — dafür gibt es eigene Sets
   *   form      'rechnen' (Vorgabe) · 'faktor' (`7 · ▢ = 7000`)
   *             · 'potenz' (`10³`)
   */
  sekZehnerpotenz(r, saat) {
    const raum = [];
    const form = r.form || 'rechnen';
    const op = r.op || 'mal';
    const stellen = r.stellen || 0;
    const zeichen = op === 'mal' ? '·' : ':';
    for (const e of spanne(r.hoch, saat + 1)) {
      if (e < 1 || e > 6) continue;
      const potenz = zehnHoch(e);
      if (form === 'potenz') { raum.push({ t: `10${HOCH[e]}`, a: String(potenz) }); continue; }
      for (const z of vielfache(r.a, saat, r.vielfach)) {
        /* Multiplizieren verschiebt das Komma nach links, Teilen nach
           rechts — die Ziffernfolge selbst bleibt dieselbe. Genau das ist
           die Einsicht, die dieser Block einschleifen soll. */
        const neuStellen = op === 'mal' ? stellen - e : stellen + e;
        const [, restStellen] = kuerzen(z, neuStellen);
        const ganzErgebnis = restStellen <= 0;
        if (r.ganz === false ? ganzErgebnis : !ganzErgebnis) continue;
        const links = textZahl(z, stellen);
        const ergebnis = textZahl(z, neuStellen);
        const antwort = form === 'faktor' ? String(potenz) : antwortZahl(z, neuStellen);
        if (!tippbar(antwort)) continue;
        raum.push(form === 'faktor'
          ? { t: `${links} ${zeichen} ▢ = ${ergebnis}`, a: antwort }
          : { t: `${links} ${zeichen} ${String(potenz)}`, a: antwort });
      }
    }
    return raum;
  },

  /**
   * Negative Zahlen: `−7 + 12` → 5, `−3 · (−4)` → 12.
   *
   *   op        'plus' · 'minus' · 'mal' · 'geteilt'
   *   a, b      Spannen der BETRÄGE, nie der vorzeichenbehafteten Zahlen
   *   vzA, vzB  Vorzeichen der beiden GEZEIGTEN Zahlen (1 oder -1)
   *   ergebnis  'negativ' oder 'positiv' — filtert nach dem Ergebnis
   *
   * Bei `geteilt` steht vzA am Dividenden und vzB am Divisor; der Quotient
   * ergibt sich daraus. So beschreibt die Regel, was auf dem Bildschirm
   * steht, und nicht, was herauskommt.
   */
  sekNegativ(r, saat) {
    const raum = [];
    const op = r.op || 'plus';
    const va = r.vzA === -1 ? -1 : 1;
    const vb = r.vzB === -1 ? -1 : 1;
    const passt = w => !r.ergebnis || (r.ergebnis === 'negativ' ? w < 0 : w > 0);
    for (const ba of spanne(r.a, saat)) for (const bb of spanne(r.b, saat + 1)) {
      if (ba < 1 || bb < 1) continue;                    // die Null trägt kein Vorzeichen
      const a = va * ba, b = vb * bb;
      if (op === 'plus') {
        if (!passt(a + b)) continue;
        raum.push({ t: `${gz(a)} + ${kl(b)}`, a: az(a + b) });
      } else if (op === 'minus') {
        if (!passt(a - b)) continue;
        raum.push({ t: `${gz(a)} − ${kl(b)}`, a: az(a - b) });
      } else if (op === 'mal') {
        if (r.produktMax != null && ba * bb > r.produktMax) continue;
        if (!passt(a * b)) continue;
        raum.push({ t: `${gz(a)} · ${kl(b)}`, a: az(a * b) });
      } else if (op === 'geteilt') {
        const dividend = va * ba * bb;                   // Vorzeichen: vzA
        const quotient = va * vb * ba;                   // Vorzeichen: vzA · vzB
        if (!passt(quotient)) continue;
        raum.push({ t: `${gz(dividend)} : ${kl(b)}`, a: az(quotient) });
      }
    }
    return raum;
  },

  /**
   * Bruch ↔ Komma ↔ Prozent: `3/4 = ▢ %` → 75, `40 % als Bruch` → 2/5.
   *
   *   nenner    erlaubte Nenner, z. B. [2, 4, 10]
   *   a         Spanne der Zähler (nur echte Brüche: Zähler < Nenner)
   *   von       'bruch' · 'dezimal' · 'prozent'  — was dasteht
   *   nach      'prozent' · 'dezimal' · 'bruch'  — was gefragt ist
   *
   * Was nicht aufgeht, fällt aus dem Raum: `1/8 = ▢ %` wäre 12,5 und stünde
   * in einem Set voller ganzer Zahlen wie ein Fehler da. Und `1/3` hat gar
   * keine Kommadarstellung — der Nenner 3 kommt hier deshalb nicht vor.
   */
  sekUmformen(r, saat) {
    const raum = [];
    const nach = r.nach || 'prozent';
    for (const n of (r.nenner || [2, 4, 10])) {
      for (const z of spanne(r.a, saat)) {
        if (z < 1 || z >= n) continue;                   // nur echte Brüche
        if ((100 * z) % n) continue;                     // Prozentwert nicht ganz
        if ((1000 * z) % n) continue;                    // mehr als drei Kommastellen
        const p = 100 * z / n;
        const tausendstel = 1000 * z / n;
        const g = ggt(z, n);
        const bruch = `${z / g}/${n / g}`;
        const dezText = textZahl(tausendstel, 3);
        const dezAntwort = antwortZahl(tausendstel, 3);
        const antwort = nach === 'prozent' ? String(p) : nach === 'dezimal' ? dezAntwort : bruch;
        if (!tippbar(antwort)) continue;
        const links = r.von === 'dezimal' ? dezText
                    : r.von === 'prozent' ? `${p} %`
                    : `${z}/${n}`;
        raum.push(nach === 'prozent' ? { t: `${links} = ▢ %`, a: antwort }
                : nach === 'dezimal' ? { t: `${links} als Dezimalzahl`, a: antwort }
                : { t: `${links} als Bruch`, a: antwort });
      }
    }
    return raum;
  },

  /**
   * Prozentrechnen im Kopf. Drei Fragerichtungen, alle mit ganzzahliger
   * Antwort:
   *
   *   'anteil'  `15 % von 60`        → 9    (Prozentwert gesucht)
   *   'satz'    `9 von 60 = ▢ %`     → 15   (Prozentsatz gesucht)
   *   'grund'   `15 % von ▢ = 9`     → 60   (Grundwert gesucht)
   *
   *   saetze    die vorkommenden Prozentsätze
   *   a         Spanne der Grundwerte, mit `vielfach` malgenommen
   */
  sekProzent(r, saat) {
    const raum = [];
    const form = r.form || 'anteil';
    for (const p of (r.saetze || [10, 25, 50])) {
      if (p < 1) continue;
      for (const g of vielfache(r.a, saat, r.vielfach)) {
        if ((g * p) % 100) continue;                     // Prozentwert nicht ganz
        const w = g * p / 100;
        if (w < 1) continue;
        if (!tippbar(String(g)) || !tippbar(String(w))) continue;
        if (form === 'anteil') raum.push({ t: `${p} % von ${g}`, a: String(w) });
        else if (form === 'grund') {
          if (p === 100) continue;                       // `100 % von ▢ = 9` ist keine Aufgabe
          raum.push({ t: `${p} % von ▢ = ${w}`, a: String(g) });
        } else if (form === 'satz') {
          if (w >= g) continue;                          // „60 von 60" fragt nichts
          raum.push({ t: `${w} von ${g} = ▢ %`, a: String(p) });
        }
      }
    }
    return raum;
  },

  /** Quadratzahlen: `17²` → 289. Die Anker des ganzen Wurzelblocks. */
  sekQuadrat(r, saat) {
    return spanne(r.a, saat).filter(a => a >= 1)
      .map(a => ({ t: `${a}²`, a: String(a * a) }));
  },

  /**
   * Wurzeln bis 625: `√361` → 19.
   *
   *   a, b   Spannen der WURZELN, nicht der Radikanden. Damit ist jeder
   *          Radikand von Bauart her eine Quadratzahl und die Antwort ganz —
   *          `√360` kann gar nicht erst entstehen.
   *   form   'wurzel' (Vorgabe) · 'platzhalter' (`▢² = 361`)
   *          · 'produkt' (`√4 · √25`)
   */
  sekWurzel(r, saat) {
    const raum = [];
    const form = r.form || 'wurzel';
    if (form === 'produkt') {
      for (const a of spanne(r.a, saat)) for (const b of spanne(r.b, saat + 1)) {
        if (a < 1 || b < 1) continue;
        if (r.produktMax != null && a * b > r.produktMax) continue;
        raum.push({ t: `√${a * a} · √${b * b}`, a: String(a * b) });
      }
      return raum;
    }
    for (const a of spanne(r.a, saat)) {
      if (a < 1) continue;
      raum.push(form === 'platzhalter'
        ? { t: `▢² = ${a * a}`, a: String(a) }
        : { t: `√${a * a}`, a: String(a) });
    }
    return raum;
  },

  /**
   * Terme mit einer Unbekannten. Gefragt ist immer x, und x ist immer ganz —
   * die Gleichung wird AUS der Lösung gebaut, nicht die Lösung aus der
   * Gleichung. Anders ließe sich nicht zusichern, dass jede Aufgabe aufgeht.
   *
   *   form     'plus'    `x + 7 = 12`
   *            'minus'   `x − 4 = 9`
   *            'mal'     `3x = 24`
   *            'geteilt' `x : 3 = 7`
   *            'malPlus' `2x + 5 = 17`
   *            'malMinus'`4x − 3 = 21`
   *            'klammer' `2(x + 3) = 16`
   *            'beidseitig' `5x + 2 = 3x + 12`
   *   x        Spanne der BETRÄGE der Lösung
   *   negativ  true: die Lösung liegt unter null
   *   a, b, c  Faktor, Summand, zweiter Faktor
   */
  sekGleichung(r, saat) {
    const raum = [];
    const form = r.form || 'mal';
    const vz = r.negativ ? -1 : 1;
    const nimm = (t, x) => { if (tippbar(az(x))) raum.push({ t, a: az(x) }); };
    for (const betrag of spanne(r.x, saat)) {
      if (betrag < 1) continue;
      const x = vz * betrag;
      if (form === 'plus' || form === 'minus') {
        for (const b of spanne(r.b, saat + 1)) {
          if (b < 1) continue;
          if (form === 'plus') nimm(`x + ${b} = ${gz(x + b)}`, x);
          else nimm(`x − ${b} = ${gz(x - b)}`, x);
        }
        continue;
      }
      for (const a of spanne(r.a, saat + 1)) {
        if (a < 2) continue;                             // `1x = 7` ist keine Gleichung
        if (form === 'mal') { nimm(`${xMal(a)} = ${gz(a * x)}`, x); continue; }
        if (form === 'geteilt') {
          if (betrag % a) continue;                      // sonst ginge die Division nicht auf
          nimm(`x : ${a} = ${gz(x / a)}`, x);
          continue;
        }
        if (form === 'beidseitig') {
          for (const c of spanne(r.c, saat + 2)) {
            if (c < 1 || c >= a) continue;               // gleiche Faktoren hätten keine Lösung
            for (const b of spanne(r.b, saat + 3)) {
              if (b < 1) continue;
              nimm(`${xMal(a)} + ${b} = ${xMal(c)} + ${gz((a - c) * x + b)}`, x);
            }
          }
          continue;
        }
        for (const b of spanne(r.b, saat + 3)) {
          if (b < 1) continue;
          if (form === 'malPlus')   nimm(`${xMal(a)} + ${b} = ${gz(a * x + b)}`, x);
          if (form === 'malMinus')  nimm(`${xMal(a)} − ${b} = ${gz(a * x - b)}`, x);
          if (form === 'klammer')   nimm(`${a}(x + ${b}) = ${gz(a * (x + b))}`, x);
          if (form === 'klammerMinus') nimm(`${a}(x − ${b}) = ${gz(a * (x - b))}`, x);
        }
      }
    }
    return raum;
  }
});

/* --- Die 100 Sets -------------------------------------------------------- */

const BLOECKE = [

  /* 1–10 · Zehnerpotenzen, ganzzahlig ------------------------------------- */
  { von: 1, bis: 10, schluessel: true, titel: i => [
      'Mal 10', 'Mal 100', 'Mal 1000',
      'Geteilt durch 10', 'Geteilt durch 100', 'Geteilt durch 1000',
      'Zehntel mal Zehnerpotenz', 'Hundertstel mal Zehnerpotenz',
      'Tausendstel mal Zehnerpotenz', 'Kommazahlen mal Zehnerpotenzen'][i],
    regel: i => [
      { art: 'sekZehnerpotenz', op: 'mal', hoch: 1, a: [2, 99] },
      { art: 'sekZehnerpotenz', op: 'mal', hoch: 2, a: [2, 99] },
      { art: 'sekZehnerpotenz', op: 'mal', hoch: 3, a: [2, 99] },
      { art: 'sekZehnerpotenz', op: 'geteilt', hoch: 1, a: [2, 999], vielfach: 10 },
      { art: 'sekZehnerpotenz', op: 'geteilt', hoch: 2, a: [2, 99], vielfach: 100 },
      { art: 'sekZehnerpotenz', op: 'geteilt', hoch: 3, a: [2, 99], vielfach: 1000 },
      { art: 'sekZehnerpotenz', op: 'mal', hoch: [1, 3], a: [1, 99], stellen: 1 },
      { art: 'sekZehnerpotenz', op: 'mal', hoch: [2, 4], a: [1, 99], stellen: 2 },
      { art: 'sekZehnerpotenz', op: 'mal', hoch: [3, 5], a: [1, 99], stellen: 3 },
      { art: 'gemischt', regeln: [
        { art: 'sekZehnerpotenz', op: 'mal', hoch: [1, 3], a: [1, 99], stellen: 1 },
        { art: 'sekZehnerpotenz', op: 'mal', hoch: [2, 4], a: [1, 99], stellen: 2 }] }][i] },

  /* 11 · das einzige Zehnerpotenz-Set mit Komma in der Antwort ------------ */
  { von: 11, bis: 11, pruefart: 'term', titel: () => 'Geteilt, bis hinters Komma',
    regel: () => ({ art: 'sekZehnerpotenz', op: 'geteilt', hoch: [1, 2], a: [1, 99], ganz: false }) },

  /* 12–15 · die Zehnerpotenz selbst ist gesucht ---------------------------- */
  { von: 12, bis: 15, titel: i => [
      'Welche Zehnerpotenz? — mal', 'Welche Zehnerpotenz? — geteilt',
      'Zehnerpotenzen erkennen', 'Zehnerpotenzen, alles gemischt'][i],
    regel: i => [
      { art: 'sekZehnerpotenz', form: 'faktor', op: 'mal', hoch: [1, 4], a: [2, 99] },
      { art: 'sekZehnerpotenz', form: 'faktor', op: 'geteilt', hoch: [1, 3], a: [2, 99], vielfach: 1000 },
      { art: 'gemischt', regeln: [
        { art: 'sekZehnerpotenz', form: 'potenz', hoch: [1, 6] },
        { art: 'sekZehnerpotenz', form: 'faktor', op: 'mal', hoch: [1, 4], a: [2, 9] }] },
      { art: 'gemischt', regeln: [
        { art: 'sekZehnerpotenz', op: 'mal', hoch: [1, 3], a: [2, 99] },
        { art: 'sekZehnerpotenz', op: 'geteilt', hoch: [1, 2], a: [2, 99], vielfach: 100 },
        { art: 'sekZehnerpotenz', op: 'mal', hoch: [2, 3], a: [1, 99], stellen: 2 }] }][i] },

  /* 16–23 · negative Zahlen: addieren und subtrahieren --------------------- */
  { von: 16, bis: 23, schluessel: true, titel: i => [
      'Negativ plus positiv', 'Positiv minus größer', 'Negativ minus positiv',
      'Minus eine negative Zahl', 'Negativ minus negativ',
      'Plus eine negative Zahl', 'Negativ plus negativ',
      'Addieren und Subtrahieren gemischt'][i],
    regel: i => [
      { art: 'sekNegativ', op: 'plus',  vzA: -1, vzB: 1, a: [1, 30], b: [1, 40] },
      { art: 'sekNegativ', op: 'minus', vzA: 1, vzB: 1, a: [1, 40], b: [1, 40], ergebnis: 'negativ' },
      { art: 'sekNegativ', op: 'minus', vzA: -1, vzB: 1, a: [1, 30], b: [1, 30] },
      { art: 'sekNegativ', op: 'minus', vzA: 1, vzB: -1, a: [1, 30], b: [1, 30] },
      { art: 'sekNegativ', op: 'minus', vzA: -1, vzB: -1, a: [1, 30], b: [1, 30] },
      { art: 'sekNegativ', op: 'plus',  vzA: 1, vzB: -1, a: [1, 30], b: [1, 40] },
      { art: 'sekNegativ', op: 'plus',  vzA: -1, vzB: -1, a: [1, 30], b: [1, 30] },
      { art: 'gemischt', regeln: [
        { art: 'sekNegativ', op: 'plus',  vzA: -1, vzB: 1, a: [1, 25], b: [1, 30] },
        { art: 'sekNegativ', op: 'minus', vzA: -1, vzB: 1, a: [1, 25], b: [1, 25] },
        { art: 'sekNegativ', op: 'minus', vzA: 1, vzB: -1, a: [1, 25], b: [1, 25] }] }][i] },

  /* 24–26 · die Vorzeichenregel beim Multiplizieren ------------------------ */
  { von: 24, bis: 26, schluessel: true, titel: i => [
      'Negativ mal positiv', 'Positiv mal negativ', 'Minus mal minus'][i],
    regel: i => [
      { art: 'sekNegativ', op: 'mal', vzA: -1, vzB: 1, a: [2, 12], b: [2, 12] },
      { art: 'sekNegativ', op: 'mal', vzA: 1, vzB: -1, a: [2, 12], b: [2, 12] },
      { art: 'sekNegativ', op: 'mal', vzA: -1, vzB: -1, a: [2, 12], b: [2, 12] }][i] },

  /* 27–30 · dieselben Regeln im Wechsel ------------------------------------ */
  { von: 27, bis: 30, titel: i => [
      'Vorzeichen beim Multiplizieren',
      'Negativ geteilt durch positiv', 'Vorzeichen beim Dividieren',
      'Negative Zahlen, alles gemischt'][i],
    regel: i => [
      { art: 'gemischt', regeln: [
        { art: 'sekNegativ', op: 'mal', vzA: -1, vzB: 1, a: [2, 10], b: [2, 10] },
        { art: 'sekNegativ', op: 'mal', vzA: 1, vzB: -1, a: [2, 10], b: [2, 10] },
        { art: 'sekNegativ', op: 'mal', vzA: -1, vzB: -1, a: [2, 10], b: [2, 10] }] },
      { art: 'sekNegativ', op: 'geteilt', vzA: -1, vzB: 1, a: [2, 12], b: [2, 10] },
      { art: 'gemischt', regeln: [
        { art: 'sekNegativ', op: 'geteilt', vzA: -1, vzB: 1, a: [2, 10], b: [2, 9] },
        { art: 'sekNegativ', op: 'geteilt', vzA: 1, vzB: -1, a: [2, 10], b: [2, 9] },
        { art: 'sekNegativ', op: 'geteilt', vzA: -1, vzB: -1, a: [2, 10], b: [2, 9] }] },
      { art: 'gemischt', regeln: [
        { art: 'sekNegativ', op: 'plus',  vzA: -1, vzB: 1, a: [1, 20], b: [1, 25] },
        { art: 'sekNegativ', op: 'minus', vzA: 1, vzB: -1, a: [1, 20], b: [1, 20] },
        { art: 'sekNegativ', op: 'mal',   vzA: -1, vzB: -1, a: [2, 9], b: [2, 9] },
        { art: 'sekNegativ', op: 'geteilt', vzA: -1, vzB: 1, a: [2, 9], b: [2, 9] }] }][i] },

  /* 31–35 · Brüche in Prozent — ganzzahlige Antwort ------------------------ */
  { von: 31, bis: 35, schluessel: true, titel: i => [
      'Halbe, Viertel, Zehntel in Prozent', 'Fünftel und Zwanzigstel in Prozent',
      'Fünfundzwanzigstel und Fünfzigstel', 'Hundertstel in Prozent',
      'Brüche in Prozent, gemischt'][i],
    regel: i => [
      { art: 'sekUmformen', von: 'bruch', nach: 'prozent', nenner: [2, 4, 10], a: [1, 9] },
      { art: 'sekUmformen', von: 'bruch', nach: 'prozent', nenner: [5, 20], a: [1, 19] },
      { art: 'sekUmformen', von: 'bruch', nach: 'prozent', nenner: [25, 50], a: [1, 49] },
      { art: 'sekUmformen', von: 'bruch', nach: 'prozent', nenner: [100], a: [1, 99] },
      { art: 'sekUmformen', von: 'bruch', nach: 'prozent',
        nenner: [2, 4, 5, 10, 20, 25, 50], a: [1, 49] }][i] },

  /* 36–39 · Brüche als Kommazahl — Antwort mit Komma ----------------------- */
  { von: 36, bis: 39, pruefart: 'term', titel: i => [
      'Halbe bis Fünftel als Kommazahl', 'Achtel und Zehntel als Kommazahl',
      'Zwanzigstel und Fünfundzwanzigstel als Kommazahl',
      'Brüche als Kommazahl, gemischt'][i],
    regel: i => [
      { art: 'sekUmformen', von: 'bruch', nach: 'dezimal', nenner: [2, 4, 5], a: [1, 4] },
      { art: 'sekUmformen', von: 'bruch', nach: 'dezimal', nenner: [8, 10], a: [1, 9] },
      { art: 'sekUmformen', von: 'bruch', nach: 'dezimal', nenner: [20, 25], a: [1, 24] },
      { art: 'sekUmformen', von: 'bruch', nach: 'dezimal',
        nenner: [2, 4, 5, 8, 10, 20, 25], a: [1, 24] }][i] },

  /* 40–42 · Kommazahlen in Prozent — ganzzahlige Antwort ------------------- */
  { von: 40, bis: 42, titel: i => [
      'Zehntel und Hundertstel in Prozent', 'Kommazahlen in Prozent',
      'Kommazahlen in Prozent, gemischt'][i],
    regel: i => [
      { art: 'sekUmformen', von: 'dezimal', nach: 'prozent', nenner: [10, 100], a: [1, 99] },
      { art: 'sekUmformen', von: 'dezimal', nach: 'prozent', nenner: [2, 4, 5, 20], a: [1, 19] },
      { art: 'sekUmformen', von: 'dezimal', nach: 'prozent',
        nenner: [2, 4, 5, 10, 20, 25, 50, 100], a: [1, 49] }][i] },

  /* 43–48 · Prozent und Kommazahl als Term --------------------------------- */
  { von: 43, bis: 48, pruefart: 'term', titel: i => [
      'Prozent als Kommazahl — volle Zehner', 'Prozent als Kommazahl',
      'Prozent als Bruch — die einfachen', 'Prozent als Bruch — Zwanzigstel und mehr',
      'Kommazahl als Bruch — Zehntel', 'Kommazahl als Bruch — Viertel und Fünftel'][i],
    regel: i => [
      { art: 'sekUmformen', von: 'prozent', nach: 'dezimal', nenner: [10, 20], a: [1, 19] },
      { art: 'sekUmformen', von: 'prozent', nach: 'dezimal',
        nenner: [4, 5, 20, 25, 50, 100], a: [1, 49] },
      { art: 'sekUmformen', von: 'prozent', nach: 'bruch', nenner: [2, 4, 5, 10], a: [1, 9] },
      { art: 'sekUmformen', von: 'prozent', nach: 'bruch', nenner: [20, 25, 50], a: [1, 49] },
      { art: 'sekUmformen', von: 'dezimal', nach: 'bruch', nenner: [10], a: [1, 9] },
      { art: 'sekUmformen', von: 'dezimal', nach: 'bruch', nenner: [4, 5, 20, 25], a: [1, 24] }][i] },

  /* 49 · alles, was auf eine ganze Zahl hinausläuft ------------------------ */
  { von: 49, bis: 49, titel: () => 'Bruch und Komma in Prozent',
    regel: () => ({ art: 'gemischt', regeln: [
      { art: 'sekUmformen', von: 'bruch', nach: 'prozent', nenner: [2, 4, 5, 10, 20, 25], a: [1, 24] },
      { art: 'sekUmformen', von: 'dezimal', nach: 'prozent', nenner: [4, 5, 10, 20, 100], a: [1, 19] }] }) },

  /* 50 · alles, was einen Term ergibt --------------------------------------- */
  { von: 50, bis: 50, pruefart: 'term', titel: () => 'Bruch, Komma, Prozent — alles gemischt',
    regel: () => ({ art: 'gemischt', regeln: [
      { art: 'sekUmformen', von: 'bruch', nach: 'dezimal', nenner: [2, 4, 5, 10, 20], a: [1, 19] },
      { art: 'sekUmformen', von: 'prozent', nach: 'bruch', nenner: [4, 5, 10, 20, 25], a: [1, 24] },
      { art: 'sekUmformen', von: 'dezimal', nach: 'bruch', nenner: [4, 5, 10], a: [1, 9] }] }) },

  /* 51–58 · die tragenden Prozentsätze ------------------------------------- */
  { von: 51, bis: 58, schluessel: true, titel: i => [
      '10 Prozent im Kopf', '50 Prozent — die Hälfte', '25 Prozent — ein Viertel',
      '20 Prozent — ein Fünftel', '5 Prozent — die Hälfte von zehn',
      '1 Prozent — durch hundert', '75 Prozent — drei Viertel',
      '15 Prozent — zehn plus fünf'][i],
    regel: i => [
      { art: 'sekProzent', form: 'anteil', saetze: [10], a: [2, 99], vielfach: 10 },
      { art: 'sekProzent', form: 'anteil', saetze: [50], a: [2, 99], vielfach: 2 },
      { art: 'sekProzent', form: 'anteil', saetze: [25], a: [2, 99], vielfach: 4 },
      { art: 'sekProzent', form: 'anteil', saetze: [20], a: [2, 99], vielfach: 5 },
      { art: 'sekProzent', form: 'anteil', saetze: [5], a: [2, 49], vielfach: 20 },
      { art: 'sekProzent', form: 'anteil', saetze: [1], a: [2, 99], vielfach: 100 },
      { art: 'sekProzent', form: 'anteil', saetze: [75], a: [2, 49], vielfach: 4 },
      { art: 'sekProzent', form: 'anteil', saetze: [15], a: [2, 49], vielfach: 20 }][i] },

  /* 59–62 · die übrigen Sätze ---------------------------------------------- */
  { von: 59, bis: 62, titel: i => [
      '30 und 40 Prozent', '60, 70 und 80 Prozent', 'Mehr als hundert Prozent',
      'Prozentsätze gemischt'][i],
    regel: i => [
      { art: 'sekProzent', form: 'anteil', saetze: [30, 40], a: [2, 99], vielfach: 10 },
      { art: 'sekProzent', form: 'anteil', saetze: [60, 70, 80], a: [2, 99], vielfach: 10 },
      { art: 'sekProzent', form: 'anteil', saetze: [110, 120, 125, 150, 200], a: [2, 25], vielfach: 20 },
      { art: 'sekProzent', form: 'anteil',
        saetze: [5, 10, 15, 20, 25, 50, 75], a: [2, 49], vielfach: 20 }][i] },

  /* 63–65 · der Prozentsatz ist gesucht ------------------------------------ */
  { von: 63, bis: 65, titel: i => [
      'Wie viel Prozent? Hälfte und Viertel', 'Wie viel Prozent? Zehntel',
      'Wie viel Prozent? gemischt'][i],
    regel: i => [
      { art: 'sekProzent', form: 'satz', saetze: [25, 50, 75], a: [2, 49], vielfach: 4 },
      { art: 'sekProzent', form: 'satz', saetze: [10, 20, 30, 40, 50, 60, 70, 80, 90],
        a: [2, 49], vielfach: 10 },
      { art: 'sekProzent', form: 'satz', saetze: [5, 10, 20, 25, 40, 50, 60, 75, 80],
        a: [2, 25], vielfach: 20 }][i] },

  /* 66–68 · der Grundwert ist gesucht -------------------------------------- */
  { von: 66, bis: 68, titel: i => [
      'Grundwert gesucht: 10 und 50 Prozent', 'Grundwert gesucht: 20 und 25 Prozent',
      'Grundwert gesucht, gemischt'][i],
    regel: i => [
      { art: 'sekProzent', form: 'grund', saetze: [10, 50], a: [2, 49], vielfach: 10 },
      { art: 'sekProzent', form: 'grund', saetze: [20, 25], a: [2, 49], vielfach: 20 },
      { art: 'sekProzent', form: 'grund', saetze: [5, 10, 20, 25, 50, 75],
        a: [2, 25], vielfach: 20 }][i] },

  /* 69–70 · alle drei Fragerichtungen im Wechsel --------------------------- */
  { von: 69, bis: 70, titel: i => [
      'Prozentwert und Prozentsatz', 'Prozentrechnen, alles gemischt'][i],
    regel: i => [
      { art: 'gemischt', regeln: [
        { art: 'sekProzent', form: 'anteil', saetze: [10, 20, 25, 50], a: [2, 49], vielfach: 20 },
        { art: 'sekProzent', form: 'satz', saetze: [10, 25, 50, 75], a: [2, 49], vielfach: 20 }] },
      { art: 'gemischt', regeln: [
        { art: 'sekProzent', form: 'anteil', saetze: [5, 10, 25, 50], a: [2, 40], vielfach: 20 },
        { art: 'sekProzent', form: 'satz', saetze: [20, 25, 40, 75], a: [2, 40], vielfach: 20 },
        { art: 'sekProzent', form: 'grund', saetze: [10, 20, 50], a: [2, 40], vielfach: 20 }] }][i] },

  /* 71–74 · Quadratzahlen bis 625 ------------------------------------------ */
  { von: 71, bis: 74, schluessel: true, titel: i => [
      'Quadratzahlen bis 12', 'Quadratzahlen 13 bis 20', 'Quadratzahlen 19 bis 25',
      'Quadratzahlen bis 25, gemischt'][i],
    regel: i => [
      { art: 'sekQuadrat', a: [2, 12] },
      { art: 'sekQuadrat', a: [13, 20] },
      { art: 'sekQuadrat', a: [19, 25] },
      { art: 'sekQuadrat', a: [2, 25] }][i] },

  /* 75–79 · Wurzeln bis 625 ------------------------------------------------ */
  { von: 75, bis: 79, schluessel: true, titel: i => [
      'Wurzeln bis 100', 'Wurzeln bis 225', 'Wurzeln bis 400', 'Wurzeln bis 625',
      'Wurzeln bis 625, gemischt'][i],
    regel: i => [
      { art: 'sekWurzel', a: [2, 10] },
      { art: 'sekWurzel', a: [2, 15] },
      { art: 'sekWurzel', a: [11, 20] },
      { art: 'sekWurzel', a: [16, 25] },
      { art: 'sekWurzel', a: [2, 25] }][i] },

  /* 80–85 · die Umkehrung und der Wechsel ---------------------------------- */
  { von: 80, bis: 85, titel: i => [
      'Welche Zahl quadriert? bis 400', 'Welche Zahl quadriert? bis 625',
      'Wurzel aus einem Produkt', 'Quadrat und Wurzel: kleine Zahlen',
      'Quadrat und Wurzel: große Zahlen', 'Quadratzahlen und Wurzeln, alles gemischt'][i],
    regel: i => [
      { art: 'sekWurzel', form: 'platzhalter', a: [2, 20] },
      { art: 'sekWurzel', form: 'platzhalter', a: [12, 25] },
      { art: 'sekWurzel', form: 'produkt', a: [2, 9], b: [2, 9], produktMax: 60 },
      { art: 'gemischt', regeln: [
        { art: 'sekQuadrat', a: [2, 12] },
        { art: 'sekWurzel', a: [2, 12] }] },
      { art: 'gemischt', regeln: [
        { art: 'sekQuadrat', a: [13, 25] },
        { art: 'sekWurzel', a: [13, 25] }] },
      { art: 'gemischt', regeln: [
        { art: 'sekQuadrat', a: [2, 25] },
        { art: 'sekWurzel', a: [2, 25] },
        { art: 'sekWurzel', form: 'platzhalter', a: [2, 25] }] }][i] },

  /* 86–90 · ein Schritt bis zur Lösung ------------------------------------- */
  { von: 86, bis: 90, schluessel: true, titel: i => [
      'x plus eine Zahl', 'x minus eine Zahl', 'Ein Vielfaches von x',
      'x geteilt durch eine Zahl', 'Ein Schritt, gemischt'][i],
    regel: i => [
      { art: 'sekGleichung', form: 'plus', x: [2, 20], b: [1, 20] },
      { art: 'sekGleichung', form: 'minus', x: [2, 20], b: [1, 20] },
      { art: 'sekGleichung', form: 'mal', a: [2, 9], x: [2, 12] },
      { art: 'sekGleichung', form: 'geteilt', a: [2, 9], x: [4, 60] },
      { art: 'gemischt', regeln: [
        { art: 'sekGleichung', form: 'plus', x: [2, 15], b: [1, 15] },
        { art: 'sekGleichung', form: 'minus', x: [2, 15], b: [1, 15] },
        { art: 'sekGleichung', form: 'mal', a: [2, 9], x: [2, 12] }] }][i] },

  /* 91–94 · zwei Schritte bis zur Lösung ----------------------------------- */
  { von: 91, bis: 94, titel: i => [
      'Mal und plus', 'Mal und minus', 'Zwei Schritte, gemischt',
      'Zwei Schritte mit größeren Faktoren'][i],
    regel: i => [
      { art: 'sekGleichung', form: 'malPlus', a: [2, 5], b: [1, 12], x: [2, 12] },
      { art: 'sekGleichung', form: 'malMinus', a: [2, 5], b: [1, 12], x: [2, 12] },
      { art: 'gemischt', regeln: [
        { art: 'sekGleichung', form: 'malPlus', a: [2, 5], b: [1, 10], x: [2, 10] },
        { art: 'sekGleichung', form: 'malMinus', a: [2, 5], b: [1, 10], x: [2, 10] }] },
      { art: 'sekGleichung', form: 'malPlus', a: [6, 9], b: [2, 20], x: [2, 9] }][i] },

  /* 95–96 · die Lösung liegt unter null ------------------------------------ */
  { von: 95, bis: 96, titel: i => [
      'Lösung unter null: plus', 'Lösung unter null: Vielfaches'][i],
    regel: i => [
      { art: 'sekGleichung', form: 'plus', x: [2, 20], b: [1, 20], negativ: true },
      { art: 'sekGleichung', form: 'mal', a: [2, 9], x: [2, 12], negativ: true }][i] },

  /* 97–100 · Klammer, beide Seiten, alles ---------------------------------- */
  { von: 97, bis: 100, titel: i => [
      'Klammer auflösen', 'x auf beiden Seiten', 'Gleichungen gemischt',
      'Terme mit x, alles gemischt'][i],
    regel: i => [
      { art: 'gemischt', regeln: [
        { art: 'sekGleichung', form: 'klammer', a: [2, 6], b: [1, 9], x: [2, 12] },
        { art: 'sekGleichung', form: 'klammerMinus', a: [2, 6], b: [1, 9], x: [3, 12] }] },
      { art: 'sekGleichung', form: 'beidseitig', a: [4, 7], c: [1, 3], b: [1, 9], x: [2, 9] },
      { art: 'gemischt', regeln: [
        { art: 'sekGleichung', form: 'malPlus', a: [2, 5], b: [1, 9], x: [2, 10] },
        { art: 'sekGleichung', form: 'klammer', a: [2, 5], b: [1, 9], x: [2, 10] },
        { art: 'sekGleichung', form: 'beidseitig', a: [4, 6], c: [1, 3], b: [1, 9], x: [2, 9] }] },
      { art: 'gemischt', regeln: [
        { art: 'sekGleichung', form: 'plus', x: [2, 12], b: [1, 12] },
        { art: 'sekGleichung', form: 'mal', a: [2, 9], x: [2, 10] },
        { art: 'sekGleichung', form: 'malMinus', a: [2, 5], b: [1, 9], x: [2, 10] },
        { art: 'sekGleichung', form: 'klammer', a: [2, 5], b: [1, 9], x: [2, 10] }] }][i] }
];

/** Voraussetzung: Wo hakt es wahrscheinlich, wenn dieses Set nicht gelingt?
 *  Die Angabe steuert nur einen Hinweis, nie eine Sperre. */
const VORAUSSETZUNG = nr =>
    nr >= 91 ? 88                      // zwei Schritte    ← Vielfaches von x
  : nr >= 86 ? null
  : nr >= 80 ? 71                      // Umkehrung        ← Quadratzahlen
  : nr >= 75 ? 71                      // Wurzeln          ← Quadratzahlen
  : nr >= 71 ? null
  : nr >= 63 ? 51                      // Satz und Grund   ← 10 % im Kopf
  : nr >= 51 ? 31                      // Prozentrechnen   ← Brüche in Prozent
  : nr >= 36 ? 31                      // Komma und Bruch  ← Brüche in Prozent
  : nr >= 31 ? null
  : nr >= 24 ? 16                      // Vorzeichenregel  ← Negativ plus positiv
  : nr >= 16 ? null
  : nr >= 11 ? 4                       // hinters Komma    ← Geteilt durch 10
  : null;

/* Darstellungsaufgaben: Wer „1/2 als Dezimalzahl“ mit „1/2“ beantwortet, hat
   nichts umgerechnet — die Frage abzuschreiben genügte vorher für einen
   Stern (gemessen: sieben Sets ließen sich so komplett lösen). Die Prüfart
   wird deshalb aus dem Aufgabentext abgeleitet: Was als Kommazahl verlangt
   ist, darf keinen Bruchstrich enthalten, und umgekehrt. */
function darstellungsArt(regel) {
  try {
    const probe = raumBauen(regel).map(a => a.t).join(' ');
    const komma = /als Dezimalzahl/.test(probe);
    const bruch = /als Bruch/.test(probe);
    /* Ein Set, das BEIDES verlangt, kann keine einheitliche Form fordern —
       dort bleibt es beim reinen Wertvergleich. */
    if (komma && bruch) return null;
    if (komma) return 'dezimal';
    if (bruch) return 'bruch';
  } catch (_) { /* dann bleibt es bei der eingetragenen Prüfart */ }
  return null;
}

export const SETS_B4 = (() => {
  const sets = [];
  BLOECKE.forEach(block => {
    for (let nr = block.von; nr <= block.bis; nr++) {
      const i = nr - block.von;
      const regel = block.regel(i);
      sets.push({
        nr,
        titel: block.titel(i),
        aufgaben: 12,
        pruefart: darstellungsArt(regel) || block.pruefart || 'zahl',
        schluessel: !!block.schluessel,
        voraussetzung: VORAUSSETZUNG(nr),
        regel
      });
    }
  });
  return sets;
})();
