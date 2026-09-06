/* =========================================================================
   HAN CROCO — Mathematik, Set-Beschreibungen
   -------------------------------------------------------------------------
   600 Sets sind kein Datenbestand, sondern 600 Beschreibungen: Titel, Regel,
   Aufgabenzahl. Die Aufgaben selbst entstehen erst beim Start aus der Regel
   und einem Startwert (siehe mathe-erzeuger.js).

   Stufe 7, erste Auslieferung: Bereich 1 vollständig. Die übrigen fünf
   Bereiche stehen mit Namen und Umfang schon hier, damit Übersicht,
   Speicher und Statistik von Anfang an mit sechs Bereichen rechnen — sie
   werden in den folgenden Schritten gefüllt.
   ========================================================================= */

/* --- Bereich 1: Grundoperationen bis 100 --------------------------------- */

/* Die Blöcke folgen dem Konzept, Abschnitt 5. Jeder Block liefert so viele
   Sets, wie in der Tabelle stehen; die Summe muss 100 ergeben und wird von
   der Prüfliste nachgerechnet. */

const BLOECKE_1 = [

  /* 1–10 · Addition bis 20, ohne Übergang ------------------------------- */
  { von: 1, bis: 10, titel: i => [
      'Plus im Zahlenraum 5', 'Plus bis 10', 'Zehn und ein Einer',
      'Plus 1 und plus 2', 'Zehner und Einer', 'Plus im Zahlenraum 20',
      'Zwei Einer, kein Übergang', 'Volle Zehner addieren',
      'Zehner plus Einer bis 100', 'Plus ohne Übergang, gemischt'][i],
    regel: i => [
      { art: 'plus', a: [1, 5],  b: [1, 5] },
      { art: 'plus', a: [1, 9],  b: [1, 9], summeMax: 10 },
      { art: 'plus', a: [10, 10], b: [1, 9], tausche: true },
      { art: 'plus', a: [1, 18], b: [1, 2], summeMax: 20, uebergang: false },
      { art: 'plus', a: [10, 19], b: [1, 9], uebergang: false },
      { art: 'plus', a: [1, 19], b: [1, 9], summeMax: 20, uebergang: false },
      { art: 'plus', a: [2, 8],  b: [1, 7], summeMax: 9 },
      { art: 'plus', a: [10, 90], b: [10, 90], schritt: 10, summeMax: 100 },
      { art: 'plus', a: [20, 90], b: [1, 9], uebergang: false },
      { art: 'plus', a: [1, 89], b: [1, 9], summeMax: 99, uebergang: false }][i] },

  /* 11–22 · Addition mit Zehnerübergang (Schlüssel) ---------------------- */
  { von: 11, bis: 22, schluessel: true, titel: i => [
      'Über die Zehn: plus 2 und 3', 'Über die Zehn: plus 4 und 5',
      'Über die Zehn: plus 6 und 7', 'Über die Zehn: plus 8 und 9',
      'Übergang im Zahlenraum 20', 'Fast zehn, dann weiter',
      'Zweistellig plus Einer, mit Übergang', 'Über den Zehner bis 50',
      'Über den Zehner bis 100', 'Zweistellig plus zweistellig, mit Übergang',
      'Neun addieren — zehn und eins zurück', 'Übergang, alles gemischt'][i],
    regel: i => [
      { art: 'plus', a: [3, 9],  b: [2, 3],  uebergang: true, tausche: true },
      { art: 'plus', a: [3, 9],  b: [4, 5],  uebergang: true, tausche: true },
      { art: 'plus', a: [3, 9],  b: [6, 7],  uebergang: true, tausche: true },
      { art: 'plus', a: [2, 9],  b: [8, 9],  uebergang: true, tausche: true },
      { art: 'plus', a: [2, 9],  b: [2, 9],  uebergang: true },
      { art: 'plus', a: [7, 9],  b: [2, 9],  uebergang: true, tausche: true },
      { art: 'plus', a: [11, 49], b: [2, 9], uebergang: true },
      { art: 'plus', a: [11, 39], b: [3, 9], uebergang: true },
      { art: 'plus', a: [41, 89], b: [3, 9], uebergang: true },
      { art: 'plus', a: [12, 79], b: [12, 29], summeMax: 100, uebergang: true },
      { art: 'plus', a: [11, 89], b: [9, 9],  uebergang: true },
      { art: 'plus', a: [6, 89],  b: [4, 19], summeMax: 100, uebergang: true }][i] },

  /* 23–34 · Subtraktion bis 20 und bis 100 ------------------------------- */
  { von: 23, bis: 34, titel: i => [
      'Minus im Zahlenraum 10', 'Minus bis 20, kein Übergang',
      'Minus 1 und minus 2', 'Von der Zehn wegnehmen',
      'Minus mit Übergang bis 20', 'Zweistellig minus Einer',
      'Zweistellig minus Einer, mit Übergang', 'Volle Zehner abziehen',
      'Zweistellig minus zweistellig', 'Zweistellig minus zweistellig, mit Übergang',
      'Neun abziehen', 'Minus, alles gemischt'][i],
    regel: i => [
      { art: 'minus', a: [2, 10], b: [1, 9] },
      { art: 'minus', a: [11, 20], b: [1, 9], uebergang: false },
      { art: 'minus', a: [3, 99], b: [1, 2] },
      { art: 'minus', a: [10, 10], b: [1, 9] },
      { art: 'minus', a: [11, 20], b: [2, 9], uebergang: true },
      { art: 'minus', a: [21, 99], b: [1, 9], uebergang: false },
      { art: 'minus', a: [21, 99], b: [2, 9], uebergang: true },
      { art: 'minus', a: [20, 100], b: [10, 90], schritt: 10 },

      { art: 'minus', a: [30, 99], b: [11, 29], uebergang: false },
      { art: 'minus', a: [30, 99], b: [12, 29], uebergang: true },
      { art: 'minus', a: [10, 99], b: [9, 9] },
      { art: 'minus', a: [11, 100], b: [2, 39] }][i] },

  /* 35–44 · Ergänzen auf 10 und auf 100 (Schlüssel) ---------------------- */
  { von: 35, bis: 44, schluessel: true, titel: i => [
      'Ergänzen auf 10', 'Ergänzen auf 20', 'Ergänzen auf den nächsten Zehner',
      'Ergänzen auf 100 — volle Zehner', 'Ergänzen auf 100',
      'Ergänzen auf 50', 'Vermindern auf einen Zehner',
      'Vermindern auf 10', 'Wie viel fehlt bis 100?', 'Ergänzen, gemischt'][i],
    regel: i => [
      { art: 'ergaenzen', a: [1, 9],  ziel: 10 },
      { art: 'ergaenzen', a: [11, 19], ziel: 20 },
      { art: 'ergaenzen', a: [21, 89], naechsterZehner: true },
      { art: 'ergaenzen', a: [10, 90], ziel: 100, schritt: 10 },
      { art: 'ergaenzen', a: [1, 99],  ziel: 100 },
      { art: 'ergaenzen', a: [1, 49],  ziel: 50 },
      { art: 'vermindern', a: [21, 99], vorigerZehner: true },
      { art: 'vermindern', a: [11, 99], ziel: 10 },
      { art: 'ergaenzen', a: [51, 99], ziel: 100 },
      { art: 'gemischt', regeln: [
        { art: 'ergaenzen', a: [1, 9], ziel: 10 },
        { art: 'ergaenzen', a: [1, 99], ziel: 100 },
        { art: 'vermindern', a: [21, 99], vorigerZehner: true }] }][i] },

  /* 45–52 · Verdoppeln und Halbieren (Schlüssel) ------------------------- */
  { von: 45, bis: 52, schluessel: true, titel: i => [
      'Verdoppeln bis 10', 'Verdoppeln bis 20', 'Verdoppeln bis 50',
      'Halbieren bis 20', 'Halbieren bis 50', 'Halbieren bis 100',
      'Verdoppeln der Zehner', 'Verdoppeln und Halbieren gemischt'][i],
    regel: i => [
      { art: 'verdoppeln', a: [1, 10] },
      { art: 'verdoppeln', a: [1, 20] },
      { art: 'verdoppeln', a: [11, 50] },
      { art: 'halbieren',  a: [2, 20] },
      { art: 'halbieren',  a: [2, 50] },
      { art: 'halbieren',  a: [22, 100] },
      { art: 'verdoppeln', a: [5, 50] },
      { art: 'gemischt', regeln: [
        { art: 'verdoppeln', a: [1, 50] },
        { art: 'halbieren',  a: [2, 100] }] }][i] },

  /* 53–62 · Einmaleins mit 2, 5, 10 (Schlüssel) -------------------------- */
  { von: 53, bis: 62, schluessel: true, titel: i => [
      'Einmaleins mit 2', 'Einmaleins mit 10', 'Einmaleins mit 5',
      'Mit 2 und 10 gemischt', 'Mit 5 und 10 gemischt',
      'Geteilt durch 2', 'Geteilt durch 10', 'Geteilt durch 5',
      'Mal 2, mal 5, mal 10', 'Die Schlüsselreihen, alles gemischt'][i],
    regel: i => [
      { art: 'mal', a: [1, 10], b: 2,  tausche: true },
      { art: 'mal', a: [1, 10], b: 10, tausche: true },
      { art: 'mal', a: [1, 10], b: 5,  tausche: true },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [1, 10], b: 2, tausche: true },
        { art: 'mal', a: [1, 10], b: 10, tausche: true }] },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [1, 10], b: 5, tausche: true },
        { art: 'mal', a: [1, 10], b: 10, tausche: true }] },
      { art: 'geteilt', a: [1, 10], b: 2 },
      { art: 'geteilt', a: [1, 10], b: 10 },
      { art: 'geteilt', a: [1, 10], b: 5 },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [1, 10], b: 2, tausche: true },
        { art: 'mal', a: [1, 10], b: 5, tausche: true },
        { art: 'mal', a: [1, 10], b: 10, tausche: true }] },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [1, 10], b: 2, tausche: true },
        { art: 'mal', a: [1, 10], b: 5, tausche: true },
        { art: 'geteilt', a: [1, 10], b: 2 },
        { art: 'geteilt', a: [1, 10], b: 5 }] }][i] },

  /* 63–80 · Einmaleins mit 3, 4, 6, 7, 8, 9 ------------------------------ */
  { von: 63, bis: 80, titel: i => [
      'Einmaleins mit 3', 'Einmaleins mit 4', 'Einmaleins mit 6',
      'Einmaleins mit 7', 'Einmaleins mit 8', 'Einmaleins mit 9',
      'Mit 3 und 4 gemischt', 'Mit 6 und 7 gemischt', 'Mit 8 und 9 gemischt',
      'Die Quadratzahlen bis 100', 'Die schweren Aufgaben: 6 · 7, 7 · 8, 8 · 9',
      'Einmaleins mit 3 und 6', 'Einmaleins mit 4 und 8',
      'Mal 9 — zehnmal minus einmal', 'Das kleine Einmaleins, obere Hälfte',
      'Das kleine Einmaleins, untere Hälfte', 'Das kleine Einmaleins, Tauschaufgaben',
      'Das kleine Einmaleins, alles gemischt'][i],
    regel: i => [
      { art: 'mal', a: [1, 10], b: 3, tausche: true },
      { art: 'mal', a: [1, 10], b: 4, tausche: true },
      { art: 'mal', a: [1, 10], b: 6, tausche: true },
      { art: 'mal', a: [1, 10], b: 7, tausche: true },
      { art: 'mal', a: [1, 10], b: 8, tausche: true },
      { art: 'mal', a: [1, 10], b: 9, tausche: true },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [1, 10], b: 3, tausche: true },
        { art: 'mal', a: [1, 10], b: 4, tausche: true }] },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [1, 10], b: 6, tausche: true },
        { art: 'mal', a: [1, 10], b: 7, tausche: true }] },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [1, 10], b: 8, tausche: true },
        { art: 'mal', a: [1, 10], b: 9, tausche: true }] },
      { art: 'gemischt', regeln: [1,2,3,4,5,6,7,8,9,10].map(n =>
        ({ art: 'mal', a: n, b: n })) },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [6, 9], b: [6, 9], tausche: true },
        { art: 'mal', a: [4, 7], b: [7, 9], tausche: true }] },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [1, 10], b: 3, tausche: true },
        { art: 'mal', a: [1, 10], b: 6, tausche: true }] },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [1, 10], b: 4, tausche: true },
        { art: 'mal', a: [1, 10], b: 8, tausche: true }] },
      { art: 'mal', a: [2, 10], b: 9, tausche: true },
      { art: 'mal', a: [6, 10], b: [2, 10], tausche: true },
      { art: 'mal', a: [2, 5],  b: [2, 10], tausche: true },
      { art: 'mal', a: [2, 9],  b: [3, 9], tausche: true },
      { art: 'mal', a: [2, 10], b: [2, 10], tausche: true }][i] },

  /* 81–90 · Division im Zahlenraum 100 ----------------------------------- */
  { von: 81, bis: 90, titel: i => [
      'Geteilt durch 3', 'Geteilt durch 4', 'Geteilt durch 6',
      'Geteilt durch 7', 'Geteilt durch 8', 'Geteilt durch 9',
      'Durch 3 und 4 gemischt', 'Durch 6, 7, 8 gemischt',
      'Division mit Ergebnis über 10', 'Division, alles gemischt'][i],
    regel: i => [
      { art: 'geteilt', a: [1, 10], b: 3 },
      { art: 'geteilt', a: [1, 10], b: 4 },
      { art: 'geteilt', a: [1, 10], b: 6 },
      { art: 'geteilt', a: [1, 10], b: 7 },
      { art: 'geteilt', a: [1, 10], b: 8 },
      { art: 'geteilt', a: [1, 10], b: 9 },
      { art: 'gemischt', regeln: [
        { art: 'geteilt', a: [1, 10], b: 3 },
        { art: 'geteilt', a: [1, 10], b: 4 }] },
      { art: 'gemischt', regeln: [
        { art: 'geteilt', a: [1, 10], b: 6 },
        { art: 'geteilt', a: [1, 10], b: 7 },
        { art: 'geteilt', a: [1, 10], b: 8 }] },
      { art: 'geteilt', a: [11, 50], b: [2, 5], produktMax: 100 },
      { art: 'geteilt', a: [2, 10], b: [2, 10], tausche: true, produktMax: 100 }][i] },

  /* 91–96 · Umkehraufgaben und Platzhalter -------------------------------- */
  { von: 91, bis: 96, titel: i => [
      'Platzhalter: plus', 'Platzhalter: mal 2, 5, 10',
      'Platzhalter: kleines Einmaleins', 'Platzhalter am Anfang',
      'Platzhalter: geteilt', 'Platzhalter, alles gemischt'][i],
    regel: i => [
      { art: 'platzhalter', unterart: 'plus', a: [1, 89], b: [1, 9], summeMax: 100 },
      { art: 'gemischt', regeln: [2, 5, 10].map(n =>
        ({ art: 'platzhalter', unterart: 'mal', a: [2, 10], b: n })) },
      { art: 'platzhalter', unterart: 'mal', a: [2, 9], b: [2, 9] },
      { art: 'platzhalter', unterart: 'mal', a: [2, 9], b: [2, 9], tausche: true },
      { art: 'platzhalter', unterart: 'geteilt', a: [2, 10], b: [2, 10], produktMax: 100 },
      { art: 'gemischt', regeln: [
        { art: 'platzhalter', unterart: 'mal', a: [2, 9], b: [2, 9], tausche: true },
        { art: 'platzhalter', unterart: 'geteilt', a: [2, 10], b: [2, 10], produktMax: 100 },
        { art: 'platzhalter', unterart: 'plus', a: [11, 89], b: [2, 9], summeMax: 100 }] }][i] },

  /* 97–100 · Gemischt, alle vier Operationen ------------------------------ */
  { von: 97, bis: 100, titel: i => [
      'Plus und minus gemischt', 'Mal und geteilt gemischt',
      'Alle vier Operationen, leicht', 'Alle vier Operationen'][i],
    regel: i => [
      { art: 'gemischt', regeln: [
        { art: 'plus',  a: [11, 89], b: [2, 19], summeMax: 100 },
        { art: 'minus', a: [11, 100], b: [2, 19] }] },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [2, 10], b: [2, 10], tausche: true },
        { art: 'geteilt', a: [2, 10], b: [2, 10], produktMax: 100 }] },
      { art: 'gemischt', regeln: [
        { art: 'plus',  a: [1, 19], b: [1, 9], summeMax: 20 },
        { art: 'minus', a: [2, 20], b: [1, 9] },
        { art: 'mal', a: [1, 10], b: [2, 5], tausche: true },
        { art: 'geteilt', a: [1, 10], b: [2, 5] }] },
      { art: 'gemischt', regeln: [
        { art: 'plus',  a: [11, 89], b: [2, 19], summeMax: 100 },
        { art: 'minus', a: [11, 100], b: [2, 29] },
        { art: 'mal', a: [2, 10], b: [2, 10], tausche: true },
        { art: 'geteilt', a: [2, 10], b: [2, 10], produktMax: 100 }] }][i] }
];

/** Voraussetzung: Wo hakt es wahrscheinlich, wenn dieses Set nicht gelingt?
 *  Die Angabe steuert nur einen Hinweis, nie eine Sperre. */
const VORAUSSETZUNG_1 = nr =>
  nr >= 63 && nr <= 80 ? 55        // kleines Einmaleins  ← Einmaleins mit 5
  : nr >= 81 && nr <= 90 ? 63      // Division            ← Einmaleins mit 3
  : nr >= 91 && nr <= 96 ? 63      // Platzhalter         ← Einmaleins mit 3
  : nr >= 11 && nr <= 22 ? 35      // Übergang            ← Ergänzen auf 10
  : nr >= 97 ? 55
  : null;

function setsBereich1() {
  const sets = [];
  BLOECKE_1.forEach(block => {
    for (let nr = block.von; nr <= block.bis; nr++) {
      const i = nr - block.von;
      const regel = block.regel(i);
      sets.push({
        nr,
        titel: block.titel(i),
        aufgaben: 24,
        schluessel: !!block.schluessel,
        voraussetzung: VORAUSSETZUNG_1(nr),
        regel
      });
    }
  });
  return sets;
}

/* --- Die sechs Bereiche -------------------------------------------------- */

/* Jeder Bereich ab 2 wohnt in einer eigenen Datei und meldet beim Laden
   seine Regelarten selbst an. Sechshundert Sets in einer Datei wären das
   Gegenteil dessen, wofür der Modulschnitt gedacht war. */

export const BEREICHE = [
  { id: 'grundoperationen', nr: 1, name: 'Grundoperationen',
    kurz: 'Plus, minus, Einmaleins bis 100', sets: setsBereich1() },
  { id: 'zehntausend', nr: 2, name: 'Zahlenraum 10 000',
    kurz: 'Großes Einmaleins, Quadratzahlen, Teilen mit Komma', sets: [] },
  { id: 'groessen', nr: 3, name: 'Größen',
    kurz: 'Umwandeln, Vergleichen, Ergänzen', sets: [] },
  { id: 'sekundarstufe', nr: 4, name: 'Sekundarstufe',
    kurz: 'Potenzen, Brüche, Prozent, Terme', sets: [] },
  { id: 'trigstoch', nr: 5, name: 'Trigonometrie und Stochastik',
    kurz: 'Winkel, Wahrscheinlichkeit, Lagemaße', sets: [] },
  { id: 'analysis', nr: 6, name: 'Differential- und Integralrechnung',
    kurz: 'Ableiten und Integrieren', sets: [] }
];

/* Die Bereiche 2 bis 6 werden EINZELN und NACHTRÄGLICH geladen. Mit festen
   Importen oben in der Datei hätte eine einzige fehlende oder kaputte
   Bereichsdatei alle sechs Bereiche mitgenommen und den Reiter verschwinden
   lassen — auch die fünf heilen. So fehlt im schlimmsten Fall einer. */
const QUELLEN = [
  ['zehntausend',   './mathe-b2.js', 'SETS_B2'],
  ['groessen',      './mathe-b3.js', 'SETS_B3'],
  ['sekundarstufe', './mathe-b4.js', 'SETS_B4'],
  ['trigstoch',     './mathe-b5.js', 'SETS_B5'],
  ['analysis',      './mathe-b6.js', 'SETS_B6']
];

let ladeLauf = null;
export function bereicheLaden() {
  if (ladeLauf) return ladeLauf;
  ladeLauf = Promise.all(QUELLEN.map(async ([id, pfad, name]) => {
    try {
      const modul = await import(pfad);
      const b = bereichVon(id);
      if (b && Array.isArray(modul[name])) b.sets = modul[name];
    } catch (e) {
      console.warn('[Mathematik] Bereich nicht geladen:', id, e?.message || e);
    }
  })).then(() => BEREICHE);
  return ladeLauf;
}

/** Aufgabenzahl eines Sets — je Set, nicht je Bereich. tempo60 10’000 macht
 *  es genauso: Die Minute ist fest, die Aufgabenzahl ist die Stellschraube. */
export const aufgabenJeSet = (bereichId, nr) => setVon(bereichId, nr)?.aufgaben || 24;

export const bereichVon = id => BEREICHE.find(b => b.id === id) || null;
export const setVon = (id, nr) => bereichVon(id)?.sets.find(s => s.nr === Number(nr)) || null;
