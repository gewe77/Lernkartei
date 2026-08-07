/* =========================================================================
   HAN CROCO — Bereich 3: Größen
   -------------------------------------------------------------------------
   100 Sets zu 16 Aufgaben, nach dem Vorbild „tempo60 Grössen“, aber in Euro
   und Cent. Drei Aufgabentypen tragen alles:

     Umwandeln     3 m 40 cm = ▢ cm        → 340
     Vergleichen   250 cm ▢ 3 m            → <
     Ergänzen      3 m + ▢ cm = 5 m        → 200

   Drei Festlegungen, die diesen Bereich von den beiden vorigen unterscheiden:

   1. JEDE ANTWORT IST EINE GANZE ZAHL. Geübt wird das Umrechnen, nicht das
      Bruchrechnen. Wo eine Umrechnung nicht aufgeht (90 s = ▢ min), fällt die
      Aufgabe aus dem Raum — nicht die Antwort auf 1,5 aufgerundet.

   2. INNERHALB EINES SETS MISCHT SICH DIE PRÜFART NICHT. Das Tastenfeld wird
      je Set aus den Antworten erzeugt; ein Set, das mal eine Zahl und mal ein
      `<` verlangt, bräuchte beide Tastenblöcke gleichzeitig. Vergleichssets
      stehen deshalb als eigene Blöcke da.

   3. DIE EINHEITEN STEHEN IN FAMILIEN. Alle Familien benutzen den Grundwert 1
      für ihre kleinste Einheit — ohne die Familienprüfung würde `3 m = ▢ ml`
      klaglos 3000 ausrechnen, weil mm und ml beide auf 1 stehen.
   ========================================================================= */

import { erzeugerAnmelden, spanne } from './mathe-erzeuger.js';

/* --- Die Einheiten ------------------------------------------------------- */

/* Jede Familie hat eine kleinste Einheit; alle übrigen sind ganzzahlige
   Vielfache davon. Damit ist jede Umrechnung eine Multiplikation oder eine
   Division, die aufgehen muss. */
const FAMILIEN = {

  geld:     { ct: 1, '€': 100 },

  laenge:   { mm: 1, cm: 10, dm: 100, m: 1000, km: 1000000 },

  hohlmass: { ml: 1, cl: 10, dl: 100, l: 1000, hl: 100000 },

  gewicht:  { mg: 1, g: 1000, kg: 1000000, t: 1000000000 },

  /* Die Zeit rechnet nicht dezimal: 60, 60, 24 statt 10, 10, 10. Sie ist der
     Stolperstein dieses Bereichs und braucht trotzdem keine Sonderregel —
     nur ihre eigenen Faktoren. Wer `1 h 20 min = 120 min` rechnet, hat still
     das Dezimalsystem unterstellt. */
  zeit:     { s: 1, min: 60, h: 3600, d: 86400 },

  /* Flächen springen um 100, nicht um 10: eine Kantenlänge mal zehn ist eine
     Fläche mal hundert. `1 m² = 10 dm²` ist der häufigste Fehler des ganzen
     Bereichs, und die Sets 80–100 sind gegen genau ihn gebaut. */
  flaeche:  { 'mm²': 1, 'cm²': 100, 'dm²': 10000, 'm²': 1000000,
              a: 100000000, ha: 10000000000, 'km²': 1000000000000 }
};

/** Flache Nachschlagetabellen: Einheit → Faktor und Einheit → Familie. */
const FAKTOR = {};
const FAMILIE = {};
Object.entries(FAMILIEN).forEach(([familie, liste]) =>
  Object.entries(liste).forEach(([einheit, faktor]) => {
    FAKTOR[einheit] = faktor;
    FAMILIE[einheit] = familie;
  }));

/** Alle Einheiten einer Regel müssen aus derselben Familie stammen. Ein
 *  Vertipper im Set (`dl` statt `dm`) rechnete sonst eine falsche
 *  Musterlösung aus, und eine falsche Musterlösung ist der schlimmste Fehler,
 *  den dieses Programm machen kann. */
function familiePruefen(...einheiten) {
  const alle = einheiten.filter(Boolean);
  alle.forEach(e => { if (!FAMILIE[e]) throw new Error('Unbekannte Einheit: ' + e); });
  const familien = new Set(alle.map(e => FAMILIE[e]));
  if (familien.size > 1) throw new Error('Einheiten aus mehreren Familien: ' + alle.join(' '));
}

/** Eine Größe als Text. `wert` steht in der kleinsten der angegebenen
 *  Einheiten: `groesseText(340, ['m','cm'])` → „3 m 40 cm“. Ist die Angabe
 *  glatt, fällt der leere Teil weg — „2 h“ statt „2 h 0 min“. */
function groesseText(wert, einheiten) {
  if (!Array.isArray(einheiten)) return `${wert} ${einheiten}`;
  const [gross, klein] = einheiten;
  const schritt = FAKTOR[gross] / FAKTOR[klein];
  const g = Math.floor(wert / schritt);
  const k = wert - g * schritt;
  if (g === 0) return `${k} ${klein}`;
  if (k === 0) return `${g} ${gross}`;
  return `${g} ${gross} ${k} ${klein}`;
}

/** Die Werte einer Spanne, jeder mit `vielfach` malgenommen. Bereich 2 macht
 *  Vielfache über einen Filter (`if (a % schritt) continue`); das geht hier
 *  nicht, weil `spanne` lange Bereiche auf 150 zufällige Werte eindampft und
 *  von denen kaum einer den Filter überlebte. Multiplizieren behält jeden
 *  Wert und hält die Spannen zugleich kurz genug, dass gar nicht erst
 *  eingedampft wird. */
const vielfache = (bereich, saat, vielfach) =>
  spanne(bereich, saat).map(v => v * (vielfach || 1)).filter(v => v >= 1);


erzeugerAnmelden({

  /** Umwandeln: `3 m 40 cm = ▢ cm`, `5000 mm = ▢ m`.
   *  `von` ist eine Einheit oder ein Paar [groß, klein] für die
   *  zusammengesetzte Angabe, `nach` die Einheit der Antwort. Geht die
   *  Umrechnung nicht auf, fällt die Aufgabe weg. */
  groesseUmwandeln(r, saat) {
    const paar = Array.isArray(r.von);
    const gross = paar ? r.von[0] : r.von;
    const klein = paar ? r.von[1] : r.von;
    familiePruefen(gross, klein, r.nach);
    const schritt = FAKTOR[gross] / FAKTOR[klein];
    const fKlein = FAKTOR[klein], fNach = FAKTOR[r.nach];
    const raum = [];
    for (const a of vielfache(r.a, saat, r.vielfach)) {
      for (const b of (paar ? vielfache(r.b, saat + 1, r.vielfachKlein) : [0])) {
        /* „3 m 140 cm“ gibt es nicht: Der kleine Teil muss unter dem großen
           Schritt bleiben, sonst wäre die Angabe nicht zu Ende umgewandelt. */
        if (paar && b >= schritt) continue;
        const wert = a * schritt + b;
        const basis = wert * fKlein;
        if (basis % fNach) continue;
        raum.push({ t: `${groesseText(wert, r.von)} = ▢ ${r.nach}`, a: String(basis / fNach) });
      }
    }
    return raum;
  },

  /** Vergleichen: `250 cm ▢ 3 m` → `<`.
   *  Gebaut wird um den Gleichstand herum: Zu jeder rechten Größe steht der
   *  linke Wert fest, der genau gleich viel ist, und `abstand` verschiebt ihn
   *  nach unten und nach oben. Nur so ist der Aufgabenraum ausgewogen — würfelte
   *  man beide Seiten frei, wären neun von zehn Aufgaben `<` und die Antwort
   *  ließe sich raten. `abstand` zählt in der kleinsten linken Einheit. */
  groesseVergleichen(r, saat) {
    const paar = Array.isArray(r.li);
    const gross = paar ? r.li[0] : r.li;
    const klein = paar ? r.li[1] : r.li;
    familiePruefen(gross, klein, r.re);
    const fKlein = FAKTOR[klein], fRe = FAKTOR[r.re];
    const abstaende = r.abstand || [-1, 0, 1];
    const raum = [];
    for (const b of vielfache(r.b, saat + 1, r.vielfachRe)) {
      const rechtsBasis = b * fRe;
      // Ohne glatten Gleichstand ließe sich die linke Seite nicht ganzzahlig
      // schreiben — dann gäbe es zu dieser rechten Größe keine `=`-Aufgabe.
      if (rechtsBasis % fKlein) continue;
      const gleich = rechtsBasis / fKlein;
      for (const d of abstaende) {
        const wert = gleich + d;
        if (wert < 1) continue;
        raum.push({ t: `${groesseText(wert, r.li)} ▢ ${b} ${r.re}`,
                    a: d < 0 ? '<' : d > 0 ? '>' : '=' });
      }
    }
    return raum;
  },

  /** Ergänzen: `3 m + ▢ cm = 5 m` → 200, `3 m 40 cm + ▢ cm = 4 m` → 60.
   *  `naechste` setzt das Ziel auf die nächste volle große Einheit — das ist
   *  die Rechnung, die beim Umgang mit Größen tatsächlich gebraucht wird, und
   *  das genaue Gegenstück zum `naechsterZehner` aus Bereich 1.
   *  `unterart: 'minus'` dreht die Aufgabe um: `5 m − ▢ cm = 3 m`. */
  groesseErgaenzen(r, saat) {
    const paar = Array.isArray(r.von);
    const gross = paar ? r.von[0] : r.von;
    const klein = paar ? r.von[1] : r.von;
    familiePruefen(gross, klein, r.nach, r.zielEinheit);
    if (r.naechste && !paar)
      throw new Error('naechste braucht eine zusammengesetzte Größe: ' + gross);
    const schritt = FAKTOR[gross] / FAKTOR[klein];
    const zielE = r.zielEinheit || gross;
    const fKlein = FAKTOR[klein], fZiel = FAKTOR[zielE], fNach = FAKTOR[r.nach];
    const minus = r.unterart === 'minus';
    const ziele = r.naechste ? null : vielfache(r.ziel, saat + 2, r.vielfachZiel);
    const raum = [];
    for (const a of vielfache(r.a, saat, r.vielfach)) {
      for (const b of (paar ? vielfache(r.b, saat + 1, r.vielfachKlein) : [0])) {
        if (paar && b >= schritt) continue;
        const wert = a * schritt + b;
        const linksBasis = wert * fKlein;
        for (const z of (ziele || [a + 1])) {
          const diff = minus ? linksBasis - z * fZiel : z * fZiel - linksBasis;
          if (diff <= 0) continue;              // eine Lücke muss es geben
          if (diff % fNach) continue;
          if (r.hoechstens != null && diff / fNach > r.hoechstens) continue;
          raum.push({
            t: `${groesseText(wert, r.von)} ${minus ? '−' : '+'} ▢ ${r.nach} = ${z} ${zielE}`,
            a: String(diff / fNach)
          });
        }
      }
    }
    return raum;
  }
});

/* --- Die 100 Sets -------------------------------------------------------- */

/* Aufgeteilt nach dem Konzept, Abschnitt 7. Die Reihenfolge innerhalb einer
   Familie ist immer dieselbe: erst die Nachbarschritte einzeln (das sind die
   Schlüsselsets), dann die entfernteren, dann die zusammengesetzten Angaben,
   dann Vergleichen, zuletzt Ergänzen und ein gemischtes Set. Wer den
   Nachbarschritt sicher hat, kommt überall sonst durch. */

const BLOECKE = [

  /* ══ 1–6 · Geld ═══════════════════════════════════════════════════════ */

  { von: 1, bis: 2, schluessel: true, titel: i => [
      'Euro in Cent', 'Cent in Euro'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: '€', nach: 'ct', a: [1, 60] },
      { art: 'groesseUmwandeln', von: 'ct', nach: '€', a: [1, 60], vielfach: 100 }][i] },

  { von: 3, bis: 4, titel: i => [
      'Euro und Cent in Cent', 'Auf den vollen Euro ergänzen'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: ['€', 'ct'], nach: 'ct',
        a: [1, 12], b: [1, 19], vielfachKlein: 5 },
      { art: 'groesseErgaenzen', von: ['€', 'ct'], nach: 'ct',
        a: [1, 9], b: [1, 19], vielfachKlein: 5, naechste: true }][i] },

  { von: 5, bis: 5, pruefart: 'vergleich', titel: () => 'Cent und Euro vergleichen',
    regel: () => ({ art: 'groesseVergleichen', li: 'ct', re: '€',
                    b: [1, 15], abstand: [-100, -20, 0, 20, 100] }) },

  { von: 6, bis: 6, titel: () => 'Geld, alles gemischt',
    regel: () => ({ art: 'gemischt', regeln: [
      { art: 'groesseUmwandeln', von: '€', nach: 'ct', a: [1, 20] },
      { art: 'groesseUmwandeln', von: 'ct', nach: '€', a: [1, 20], vielfach: 100 },
      { art: 'groesseUmwandeln', von: ['€', 'ct'], nach: 'ct',
        a: [1, 9], b: [1, 19], vielfachKlein: 5 },
      { art: 'groesseErgaenzen', von: ['€', 'ct'], nach: 'ct',
        a: [1, 9], b: [1, 9], vielfachKlein: 10, naechste: true }] }) },

  /* ══ 7–28 · Längen ════════════════════════════════════════════════════ */

  { von: 7, bis: 10, schluessel: true, titel: i => [
      'Zentimeter in Millimeter', 'Millimeter in Zentimeter',
      'Meter in Zentimeter', 'Zentimeter in Meter'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'cm', nach: 'mm', a: [1, 120] },
      { art: 'groesseUmwandeln', von: 'mm', nach: 'cm', a: [1, 120], vielfach: 10 },
      { art: 'groesseUmwandeln', von: 'm', nach: 'cm', a: [1, 60] },
      { art: 'groesseUmwandeln', von: 'cm', nach: 'm', a: [1, 60], vielfach: 100 }][i] },

  { von: 11, bis: 13, titel: i => [
      'Meter in Dezimeter', 'Dezimeter in Zentimeter', 'Zentimeter in Dezimeter'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'm', nach: 'dm', a: [1, 90] },
      { art: 'groesseUmwandeln', von: 'dm', nach: 'cm', a: [1, 90] },
      { art: 'groesseUmwandeln', von: 'cm', nach: 'dm', a: [1, 90], vielfach: 10 }][i] },

  { von: 14, bis: 15, schluessel: true, titel: i => [
      'Kilometer in Meter', 'Meter in Kilometer'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'km', nach: 'm', a: [1, 40] },
      { art: 'groesseUmwandeln', von: 'm', nach: 'km', a: [1, 40], vielfach: 1000 }][i] },

  { von: 16, bis: 20, titel: i => [
      'Meter und Zentimeter', 'Meter und Dezimeter', 'Zentimeter und Millimeter',
      'Kilometer und Meter', 'Längen umwandeln, gemischt'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: ['m', 'cm'], nach: 'cm',
        a: [1, 12], b: [1, 19], vielfachKlein: 5 },
      { art: 'groesseUmwandeln', von: ['m', 'dm'], nach: 'dm', a: [1, 15], b: [1, 9] },
      { art: 'groesseUmwandeln', von: ['cm', 'mm'], nach: 'mm', a: [1, 25], b: [1, 9] },
      { art: 'groesseUmwandeln', von: ['km', 'm'], nach: 'm',
        a: [1, 9], b: [1, 19], vielfachKlein: 50 },
      { art: 'gemischt', regeln: [
        { art: 'groesseUmwandeln', von: 'm', nach: 'cm', a: [1, 20] },
        { art: 'groesseUmwandeln', von: 'cm', nach: 'm', a: [1, 20], vielfach: 100 },
        { art: 'groesseUmwandeln', von: ['m', 'cm'], nach: 'cm',
          a: [1, 9], b: [1, 9], vielfachKlein: 10 },
        { art: 'groesseUmwandeln', von: ['km', 'm'], nach: 'm',
          a: [1, 9], b: [1, 9], vielfachKlein: 100 }] }][i] },

  { von: 21, bis: 24, pruefart: 'vergleich', titel: i => [
      'Zentimeter und Meter vergleichen', 'Millimeter und Zentimeter vergleichen',
      'Meter und Kilometer vergleichen', 'Längen vergleichen, gemischt'][i],
    regel: i => [
      { art: 'groesseVergleichen', li: 'cm', re: 'm',
        b: [1, 12], abstand: [-100, -20, 0, 20, 100] },
      /* Rechts erst ab 2 cm: Bei 1 cm fällt die untere Abweichung unter null
         weg, und der Raum verliert genau dort eine `<`-Aufgabe, wo der feste
         Startwert des Testmodus sie ohnehin selten zieht. */
      { art: 'groesseVergleichen', li: 'mm', re: 'cm',
        b: [2, 30], abstand: [-15, -3, 0, 3, 15] },
      { art: 'groesseVergleichen', li: 'm', re: 'km',
        b: [1, 9], abstand: [-500, -50, 0, 50, 500] },
      { art: 'gemischt', regeln: [
        { art: 'groesseVergleichen', li: 'cm', re: 'm',
          b: [1, 8], abstand: [-50, -10, 0, 10, 50] },
        { art: 'groesseVergleichen', li: 'mm', re: 'cm',
          b: [1, 20], abstand: [-5, -1, 0, 1, 5] },
        { art: 'groesseVergleichen', li: 'dm', re: 'm',
          b: [1, 9], abstand: [-5, -1, 0, 1, 5] }] }][i] },

  { von: 25, bis: 28, titel: i => [
      'Auf den vollen Meter ergänzen', 'Auf den vollen Kilometer ergänzen',
      'Längen ergänzen in Zentimeter', 'Längen, alles gemischt'][i],
    regel: i => [
      { art: 'groesseErgaenzen', von: ['m', 'cm'], nach: 'cm',
        a: [1, 9], b: [1, 19], vielfachKlein: 5, naechste: true },
      { art: 'groesseErgaenzen', von: ['km', 'm'], nach: 'm',
        a: [1, 9], b: [1, 19], vielfachKlein: 50, naechste: true },
      { art: 'groesseErgaenzen', von: ['m', 'dm'], nach: 'cm',
        a: [1, 9], b: [1, 9], ziel: [2, 10] },
      { art: 'gemischt', regeln: [
        { art: 'groesseUmwandeln', von: 'm', nach: 'cm', a: [1, 15] },
        { art: 'groesseUmwandeln', von: ['km', 'm'], nach: 'm',
          a: [1, 9], b: [1, 9], vielfachKlein: 100 },
        { art: 'groesseErgaenzen', von: ['m', 'cm'], nach: 'cm',
          a: [1, 9], b: [1, 9], vielfachKlein: 10, naechste: true },
        { art: 'groesseErgaenzen', von: 'm', nach: 'cm', a: [1, 9], ziel: [2, 10] }] }][i] },

  /* ══ 29–48 · Hohlmaße ═════════════════════════════════════════════════ */

  { von: 29, bis: 32, schluessel: true, titel: i => [
      'Liter in Milliliter', 'Milliliter in Liter',
      'Liter in Deziliter', 'Deziliter in Liter'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'l', nach: 'ml', a: [1, 40] },
      { art: 'groesseUmwandeln', von: 'ml', nach: 'l', a: [1, 40], vielfach: 1000 },
      { art: 'groesseUmwandeln', von: 'l', nach: 'dl', a: [1, 60] },
      { art: 'groesseUmwandeln', von: 'dl', nach: 'l', a: [1, 60], vielfach: 10 }][i] },

  { von: 33, bis: 38, titel: i => [
      'Deziliter in Milliliter', 'Zentiliter in Milliliter', 'Milliliter in Zentiliter',
      'Deziliter in Zentiliter', 'Hektoliter in Liter', 'Liter in Hektoliter'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'dl', nach: 'ml', a: [1, 90] },
      { art: 'groesseUmwandeln', von: 'cl', nach: 'ml', a: [1, 120] },
      { art: 'groesseUmwandeln', von: 'ml', nach: 'cl', a: [1, 120], vielfach: 10 },
      { art: 'groesseUmwandeln', von: 'dl', nach: 'cl', a: [1, 90] },
      { art: 'groesseUmwandeln', von: 'hl', nach: 'l', a: [1, 40] },
      { art: 'groesseUmwandeln', von: 'l', nach: 'hl', a: [1, 40], vielfach: 100 }][i] },

  { von: 39, bis: 43, titel: i => [
      'Liter und Deziliter', 'Liter und Milliliter', 'Hektoliter und Liter',
      'Deziliter und Zentiliter', 'Hohlmaße umwandeln, gemischt'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: ['l', 'dl'], nach: 'dl', a: [1, 15], b: [1, 9] },
      { art: 'groesseUmwandeln', von: ['l', 'ml'], nach: 'ml',
        a: [1, 9], b: [1, 19], vielfachKlein: 50 },
      { art: 'groesseUmwandeln', von: ['hl', 'l'], nach: 'l',
        a: [1, 9], b: [1, 19], vielfachKlein: 5 },
      { art: 'groesseUmwandeln', von: ['dl', 'cl'], nach: 'cl', a: [1, 25], b: [1, 9] },
      { art: 'gemischt', regeln: [
        { art: 'groesseUmwandeln', von: 'l', nach: 'ml', a: [1, 20] },
        { art: 'groesseUmwandeln', von: 'l', nach: 'dl', a: [1, 20] },
        { art: 'groesseUmwandeln', von: 'dl', nach: 'l', a: [1, 20], vielfach: 10 },
        { art: 'groesseUmwandeln', von: ['l', 'dl'], nach: 'dl', a: [1, 9], b: [1, 9] }] }][i] },

  { von: 44, bis: 46, pruefart: 'vergleich', titel: i => [
      'Milliliter und Liter vergleichen', 'Deziliter und Liter vergleichen',
      'Zentiliter und Deziliter vergleichen'][i],
    regel: i => [
      { art: 'groesseVergleichen', li: 'ml', re: 'l',
        b: [1, 9], abstand: [-500, -50, 0, 50, 500] },
      { art: 'groesseVergleichen', li: 'dl', re: 'l',
        b: [1, 15], abstand: [-5, -1, 0, 1, 5] },
      { art: 'groesseVergleichen', li: 'cl', re: 'dl',
        b: [1, 30], abstand: [-5, -1, 0, 1, 5] }][i] },

  { von: 47, bis: 48, titel: i => [
      'Auf den vollen Liter ergänzen', 'Hohlmaße, alles gemischt'][i],
    regel: i => [
      { art: 'groesseErgaenzen', von: ['l', 'ml'], nach: 'ml',
        a: [1, 9], b: [1, 19], vielfachKlein: 50, naechste: true },
      { art: 'gemischt', regeln: [
        { art: 'groesseUmwandeln', von: 'dl', nach: 'ml', a: [1, 20] },
        { art: 'groesseUmwandeln', von: ['hl', 'l'], nach: 'l',
          a: [1, 9], b: [1, 9], vielfachKlein: 10 },
        { art: 'groesseErgaenzen', von: ['l', 'dl'], nach: 'dl',
          a: [1, 9], b: [1, 9], naechste: true },
        { art: 'groesseErgaenzen', von: 'l', nach: 'dl', a: [1, 9], ziel: [2, 10] }] }][i] },

  /* ══ 49–59 · Gewichte ═════════════════════════════════════════════════ */

  { von: 49, bis: 50, schluessel: true, titel: i => [
      'Kilogramm in Gramm', 'Gramm in Kilogramm'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'kg', nach: 'g', a: [1, 40] },
      { art: 'groesseUmwandeln', von: 'g', nach: 'kg', a: [1, 40], vielfach: 1000 }][i] },

  { von: 51, bis: 54, titel: i => [
      'Gramm in Milligramm', 'Milligramm in Gramm',
      'Tonnen in Kilogramm', 'Kilogramm in Tonnen'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'g', nach: 'mg', a: [1, 40] },
      { art: 'groesseUmwandeln', von: 'mg', nach: 'g', a: [1, 40], vielfach: 1000 },
      { art: 'groesseUmwandeln', von: 't', nach: 'kg', a: [1, 40] },
      { art: 'groesseUmwandeln', von: 'kg', nach: 't', a: [1, 40], vielfach: 1000 }][i] },

  { von: 55, bis: 56, titel: i => [
      'Kilogramm und Gramm', 'Tonnen und Kilogramm'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: ['kg', 'g'], nach: 'g',
        a: [1, 9], b: [1, 19], vielfachKlein: 50 },
      { art: 'groesseUmwandeln', von: ['t', 'kg'], nach: 'kg',
        a: [1, 9], b: [1, 19], vielfachKlein: 50 }][i] },

  { von: 57, bis: 57, pruefart: 'vergleich', titel: () => 'Gewichte vergleichen',
    regel: () => ({ art: 'gemischt', regeln: [
      { art: 'groesseVergleichen', li: 'g', re: 'kg',
        b: [1, 9], abstand: [-500, -50, 0, 50, 500] },
      { art: 'groesseVergleichen', li: 'kg', re: 't',
        b: [1, 9], abstand: [-500, -50, 0, 50, 500] }] }) },

  { von: 58, bis: 59, titel: i => [
      'Auf das volle Kilogramm ergänzen', 'Gewichte, alles gemischt'][i],
    regel: i => [
      { art: 'groesseErgaenzen', von: ['kg', 'g'], nach: 'g',
        a: [1, 9], b: [1, 19], vielfachKlein: 50, naechste: true },
      { art: 'gemischt', regeln: [
        { art: 'groesseUmwandeln', von: 'kg', nach: 'g', a: [1, 20] },
        { art: 'groesseUmwandeln', von: 'g', nach: 'kg', a: [1, 20], vielfach: 1000 },
        { art: 'groesseUmwandeln', von: ['t', 'kg'], nach: 'kg',
          a: [1, 9], b: [1, 9], vielfachKlein: 100 },
        { art: 'groesseErgaenzen', von: ['kg', 'g'], nach: 'g',
          a: [1, 9], b: [1, 9], vielfachKlein: 100, naechste: true }] }][i] },

  /* ══ 60–79 · Zeit ═════════════════════════════════════════════════════ */

  /* Der Sonderfall: 60, 60, 24. Die Nachbarschritte stehen deshalb alle vier
     als Schlüsselsets da — wer `1 h = 100 min` rechnet, verrechnet sich
     danach in jedem einzelnen zusammengesetzten Set. */
  { von: 60, bis: 63, schluessel: true, titel: i => [
      'Minuten in Sekunden', 'Sekunden in Minuten',
      'Stunden in Minuten', 'Minuten in Stunden'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'min', nach: 's', a: [1, 30] },
      { art: 'groesseUmwandeln', von: 's', nach: 'min', a: [1, 30], vielfach: 60 },
      { art: 'groesseUmwandeln', von: 'h', nach: 'min', a: [1, 24] },
      { art: 'groesseUmwandeln', von: 'min', nach: 'h', a: [1, 24], vielfach: 60 }][i] },

  { von: 64, bis: 64, titel: () => 'Stunden in Sekunden',
    regel: () => ({ art: 'groesseUmwandeln', von: 'h', nach: 's', a: [1, 20] }) },

  { von: 65, bis: 66, schluessel: true, titel: i => [
      'Tage in Stunden', 'Stunden in Tage'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'd', nach: 'h', a: [1, 30] },
      { art: 'groesseUmwandeln', von: 'h', nach: 'd', a: [1, 30], vielfach: 24 }][i] },

  { von: 67, bis: 71, titel: i => [
      'Stunden und Minuten', 'Minuten und Sekunden', 'Tage und Stunden',
      'Stunden und Minuten in Sekunden', 'Zeit umwandeln, gemischt'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: ['h', 'min'], nach: 'min',
        a: [1, 12], b: [1, 11], vielfachKlein: 5 },
      { art: 'groesseUmwandeln', von: ['min', 's'], nach: 's',
        a: [1, 15], b: [1, 11], vielfachKlein: 5 },
      { art: 'groesseUmwandeln', von: ['d', 'h'], nach: 'h', a: [1, 15], b: [1, 23] },
      { art: 'groesseUmwandeln', von: ['h', 'min'], nach: 's',
        a: [1, 9], b: [1, 11], vielfachKlein: 5 },
      { art: 'gemischt', regeln: [
        { art: 'groesseUmwandeln', von: 'h', nach: 'min', a: [1, 20] },
        { art: 'groesseUmwandeln', von: 'min', nach: 's', a: [1, 20] },
        { art: 'groesseUmwandeln', von: 'd', nach: 'h', a: [1, 20] },
        { art: 'groesseUmwandeln', von: ['h', 'min'], nach: 'min',
          a: [1, 9], b: [1, 5], vielfachKlein: 10 }] }][i] },

  { von: 72, bis: 75, pruefart: 'vergleich', titel: i => [
      'Minuten und Stunden vergleichen', 'Sekunden und Minuten vergleichen',
      'Stunden und Tage vergleichen', 'Zusammengesetzte Zeiten vergleichen'][i],
    regel: i => [
      { art: 'groesseVergleichen', li: 'min', re: 'h',
        b: [1, 9], abstand: [-30, -5, 0, 5, 30] },
      { art: 'groesseVergleichen', li: 's', re: 'min',
        b: [1, 15], abstand: [-30, -5, 0, 5, 30] },
      { art: 'groesseVergleichen', li: 'h', re: 'd',
        b: [1, 12], abstand: [-12, -2, 0, 2, 12] },
      { art: 'groesseVergleichen', li: ['h', 'min'], re: 'min',
        b: [1, 12], vielfachRe: 30, abstand: [-15, -5, 0, 5, 15] }][i] },

  { von: 76, bis: 79, titel: i => [
      'Auf die volle Minute ergänzen', 'Auf die volle Stunde ergänzen',
      'Auf den vollen Tag ergänzen', 'Zeit, alles gemischt'][i],
    regel: i => [
      { art: 'groesseErgaenzen', von: ['min', 's'], nach: 's',
        a: [1, 15], b: [1, 11], vielfachKlein: 5, naechste: true },
      { art: 'groesseErgaenzen', von: ['h', 'min'], nach: 'min',
        a: [1, 12], b: [1, 11], vielfachKlein: 5, naechste: true },
      { art: 'groesseErgaenzen', von: ['d', 'h'], nach: 'h',
        a: [1, 15], b: [1, 23], naechste: true },
      { art: 'gemischt', regeln: [
        { art: 'groesseUmwandeln', von: 'h', nach: 'min', a: [1, 15] },
        { art: 'groesseUmwandeln', von: ['d', 'h'], nach: 'h', a: [1, 9], b: [1, 9] },
        { art: 'groesseErgaenzen', von: ['h', 'min'], nach: 'min',
          a: [1, 9], b: [1, 5], vielfachKlein: 10, naechste: true },
        { art: 'groesseErgaenzen', von: 'h', nach: 'min', a: [1, 9], ziel: [2, 10] }] }][i] },

  /* ══ 80–100 · Flächen ═════════════════════════════════════════════════ */

  { von: 80, bis: 81, schluessel: true, titel: i => [
      'Quadratzentimeter in Quadratmillimeter', 'Quadratmillimeter in Quadratzentimeter'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'cm²', nach: 'mm²', a: [1, 60] },
      { art: 'groesseUmwandeln', von: 'mm²', nach: 'cm²', a: [1, 60], vielfach: 100 }][i] },

  { von: 82, bis: 83, titel: i => [
      'Quadratdezimeter in Quadratzentimeter', 'Quadratzentimeter in Quadratdezimeter'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'dm²', nach: 'cm²', a: [1, 60] },
      { art: 'groesseUmwandeln', von: 'cm²', nach: 'dm²', a: [1, 60], vielfach: 100 }][i] },

  { von: 84, bis: 85, schluessel: true, titel: i => [
      'Quadratmeter in Quadratdezimeter', 'Quadratdezimeter in Quadratmeter'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'm²', nach: 'dm²', a: [1, 60] },
      { art: 'groesseUmwandeln', von: 'dm²', nach: 'm²', a: [1, 60], vielfach: 100 }][i] },

  { von: 86, bis: 89, schluessel: true, titel: i => [
      'Ar in Quadratmeter', 'Quadratmeter in Ar', 'Hektar in Ar', 'Ar in Hektar'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'a', nach: 'm²', a: [1, 60] },
      { art: 'groesseUmwandeln', von: 'm²', nach: 'a', a: [1, 60], vielfach: 100 },
      { art: 'groesseUmwandeln', von: 'ha', nach: 'a', a: [1, 60] },
      { art: 'groesseUmwandeln', von: 'a', nach: 'ha', a: [1, 60], vielfach: 100 }][i] },

  { von: 90, bis: 91, titel: i => [
      'Quadratkilometer in Hektar', 'Hektar in Quadratkilometer'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: 'km²', nach: 'ha', a: [1, 60] },
      { art: 'groesseUmwandeln', von: 'ha', nach: 'km²', a: [1, 60], vielfach: 100 }][i] },

  { von: 92, bis: 95, titel: i => [
      'Quadratmeter und Quadratdezimeter', 'Quadratzentimeter und Quadratmillimeter',
      'Hektar und Ar', 'Flächen umwandeln, gemischt'][i],
    regel: i => [
      { art: 'groesseUmwandeln', von: ['m²', 'dm²'], nach: 'dm²',
        a: [1, 12], b: [1, 19], vielfachKlein: 5 },
      { art: 'groesseUmwandeln', von: ['cm²', 'mm²'], nach: 'mm²',
        a: [1, 12], b: [1, 19], vielfachKlein: 5 },
      { art: 'groesseUmwandeln', von: ['ha', 'a'], nach: 'a',
        a: [1, 12], b: [1, 19], vielfachKlein: 5 },
      { art: 'gemischt', regeln: [
        { art: 'groesseUmwandeln', von: 'm²', nach: 'dm²', a: [1, 20] },
        { art: 'groesseUmwandeln', von: 'dm²', nach: 'cm²', a: [1, 20] },
        { art: 'groesseUmwandeln', von: 'ha', nach: 'a', a: [1, 20] },
        { art: 'groesseUmwandeln', von: ['m²', 'dm²'], nach: 'dm²',
          a: [1, 9], b: [1, 9], vielfachKlein: 10 }] }][i] },

  { von: 96, bis: 98, pruefart: 'vergleich', titel: i => [
      'Quadratzentimeter und Quadratdezimeter vergleichen',
      'Quadratmeter und Ar vergleichen', 'Hektar und Quadratkilometer vergleichen'][i],
    regel: i => [
      { art: 'groesseVergleichen', li: 'cm²', re: 'dm²',
        b: [1, 12], abstand: [-50, -10, 0, 10, 50] },
      { art: 'groesseVergleichen', li: 'm²', re: 'a',
        b: [1, 12], abstand: [-50, -10, 0, 10, 50] },
      { art: 'groesseVergleichen', li: 'ha', re: 'km²',
        b: [1, 9], abstand: [-50, -10, 0, 10, 50] }][i] },

  { von: 99, bis: 100, titel: i => [
      'Auf den vollen Quadratmeter ergänzen', 'Flächen, alles gemischt'][i],
    regel: i => [
      { art: 'groesseErgaenzen', von: ['m²', 'dm²'], nach: 'dm²',
        a: [1, 9], b: [1, 19], vielfachKlein: 5, naechste: true },
      { art: 'gemischt', regeln: [
        { art: 'groesseUmwandeln', von: 'dm²', nach: 'cm²', a: [1, 15] },
        { art: 'groesseUmwandeln', von: 'm²', nach: 'a', a: [1, 15], vielfach: 100 },
        { art: 'groesseUmwandeln', von: ['ha', 'a'], nach: 'a',
          a: [1, 9], b: [1, 9], vielfachKlein: 10 },
        { art: 'groesseErgaenzen', von: ['m²', 'dm²'], nach: 'dm²',
          a: [1, 9], b: [1, 9], vielfachKlein: 10, naechste: true }] }][i] }
];

/* Die Voraussetzung zeigt auf das Set, das denselben Schritt einfacher übt.
   Sie läuft innerhalb jeder Familie von den Nachbarschritten über die
   zusammengesetzten Angaben zu Vergleichen und Ergänzen; Hohlmaße und
   Gewichte hängen zusätzlich an den Längen, weil sie denselben
   Tausenderschritt benutzen. */
const VORAUSSETZUNG = nr =>
    nr >= 3  && nr <= 6   ? 1     // Euro und Cent      ← Euro in Cent
  : nr >= 9  && nr <= 10  ? 7     // Meter und Zentimeter ← Zentimeter in Millimeter
  : nr >= 11 && nr <= 15  ? 9     // weitere Längenschritte ← Meter in Zentimeter
  : nr >= 16 && nr <= 20  ? 9     // zusammengesetzte Längen ← Meter in Zentimeter
  : nr >= 21 && nr <= 24  ? 16    // Längen vergleichen ← Meter und Zentimeter
  : nr >= 25 && nr <= 28  ? 16    // Längen ergänzen    ← Meter und Zentimeter
  : nr >= 29 && nr <= 30  ? 14    // Liter und Milliliter ← Kilometer in Meter
  : nr >= 31 && nr <= 38  ? 29    // weitere Hohlmaßschritte ← Liter in Milliliter
  : nr >= 39 && nr <= 43  ? 29    // zusammengesetzte Hohlmaße ← Liter in Milliliter
  : nr >= 44 && nr <= 48  ? 39    // vergleichen, ergänzen ← Liter und Deziliter
  : nr >= 49 && nr <= 50  ? 29    // Kilogramm und Gramm ← Liter in Milliliter
  : nr >= 51 && nr <= 56  ? 49    // weitere Gewichte   ← Kilogramm in Gramm
  : nr >= 57 && nr <= 59  ? 55    // vergleichen, ergänzen ← Kilogramm und Gramm
  : nr >= 62 && nr <= 66  ? 60    // Stunden und Tage   ← Minuten in Sekunden
  : nr >= 67 && nr <= 71  ? 62    // zusammengesetzte Zeiten ← Stunden in Minuten
  : nr >= 72 && nr <= 79  ? 67    // vergleichen, ergänzen ← Stunden und Minuten
  : nr >= 82 && nr <= 85  ? 80    // Quadratmeter       ← Quadratzentimeter
  : nr >= 86 && nr <= 91  ? 84    // Ar und Hektar      ← Quadratmeter in Quadratdezimeter
  : nr >= 92 && nr <= 95  ? 84    // zusammengesetzte Flächen ← Quadratmeter
  : nr >= 96 && nr <= 100 ? 92    // vergleichen, ergänzen ← Quadratmeter und Quadratdezimeter
  : null;                         // 1, 2, 7, 8, 60, 61, 80, 81: die Einstiege

export const SETS_B3 = (() => {
  const sets = [];
  BLOECKE.forEach(block => {
    for (let nr = block.von; nr <= block.bis; nr++) {
      const i = nr - block.von;
      sets.push({
        nr,
        titel: block.titel(i),
        aufgaben: 16,
        pruefart: block.pruefart || 'zahl',
        schluessel: !!block.schluessel,
        voraussetzung: VORAUSSETZUNG(nr),
        regel: block.regel(i)
      });
    }
  });
  return sets;
})();
