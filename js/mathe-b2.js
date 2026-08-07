/* =========================================================================
   HAN CROCO — Bereich 2: Zahlenraum 10 000
   -------------------------------------------------------------------------
   Die direkte Fortsetzung von Bereich 1, nach dem Vorbild „tempo60 10’000“.
   Hier liegt auch das große Einmaleins (11er, 12er, 15er, 25er-Reihe und die
   Quadratzahlen bis 25 · 25) — in Bereich 1 wäre es falsch aufgehoben, denn
   17 · 13 = 221 verlässt den Zahlenraum 100.

   Neu gegenüber Bereich 1: Die Sets haben unterschiedlich viele Aufgaben
   (12, 16, 20 oder 24) bei gleichbleibenden 60 Sekunden — genau wie im
   Vorbild. Die Minute ist fest, die Aufgabenzahl ist die Stellschraube.
   ========================================================================= */

import { erzeugerAnmelden, spanne } from './mathe-erzeuger.js';

erzeugerAnmelden({

  /** Quadratzahlen: `17²`. Die Anker des großen Einmaleins. */
  quadrat(r, saat) {
    return spanne(r.a, saat).map(a => ({ t: `${a}²`, a: String(a * a) }));
  },

  /** Nachbarquadrate: `19 · 21` — zwei Schritte um ein Quadrat herum.
   *  Der Kniff ist `20² − 1`, und genau der soll sich einschleifen. */
  nachbarquadrat(r, saat) {
    const raum = [];
    for (const m of spanne(r.a, saat)) {
      const d = r.abstand || 1;
      if (m - d < 2) continue;
      raum.push({ t: `${m - d} · ${m + d}`, a: String((m - d) * (m + d)) });
    }
    return raum;
  },

  /** Vorübung zum Teilen mit Rest: die größte Zahl der Reihe unterhalb einer
   *  Schranke. `7er-Reihe ≤ 50` → 49. Wer das sofort sieht, hat den Rest
   *  geschenkt. */
  naechstKleiner(r, saat) {
    const raum = [];
    for (const teiler of spanne(r.b, saat + 1)) {
      if (teiler < 2) continue;
      for (const grenze of spanne(r.a, saat)) {
        if (grenze % teiler === 0) continue;      // sonst wäre nichts zu tun
        raum.push({ t: `${teiler}er-Reihe ≤ ${grenze}`,
                    a: String(Math.floor(grenze / teiler) * teiler) });
      }
    }
    return raum;
  },

  /** Teilen mit Rest: `53 : 7` → `7 R 4`. Zwei Zahlen in einer Antwort,
   *  getrennt durch die R-Taste. */
  restTeilen(r, saat) {
    const raum = [];
    for (const teiler of spanne(r.b, saat + 1)) {
      if (teiler < 2) continue;
      for (const a of spanne(r.a, saat)) {
        const rest = a % teiler;
        if (rest === 0) continue;                 // ohne Rest ist es keine Restaufgabe
        raum.push({ t: `${a} : ${teiler}`, a: `${Math.floor(a / teiler)} R ${rest}` });
      }
    }
    return raum;
  }
});

/* --- Die 100 Sets -------------------------------------------------------- */

const BLOECKE = [

  /* 1–8 · reine Zehner, Hunderter, Tausender, ohne Übergang -------------- */
  { von: 1, bis: 8, aufgaben: 24, titel: i => [
      'Volle Zehner addieren', 'Volle Hunderter addieren', 'Volle Tausender addieren',
      'Volle Zehner subtrahieren', 'Volle Hunderter subtrahieren',
      'Volle Tausender subtrahieren', 'Hunderter und Tausender gemischt',
      'Zehner, Hunderter, Tausender'][i],
    regel: i => [
      { art: 'plus', a: [10, 990], b: [10, 990], schritt: 10, summeMax: 10000, uebergang: false },
      { art: 'plus', a: [100, 9900], b: [100, 9900], schritt: 100, summeMax: 10000, uebergang: false },
      { art: 'plus', a: [1000, 9000], b: [1000, 9000], schritt: 1000, summeMax: 10000 },
      { art: 'minus', a: [20, 1000], b: [10, 990], schritt: 10 },
      { art: 'minus', a: [200, 10000], b: [100, 9900], schritt: 100 },
      { art: 'minus', a: [2000, 10000], b: [1000, 9000], schritt: 1000 },
      { art: 'gemischt', regeln: [
        { art: 'plus', a: [100, 9900], b: [100, 900], schritt: 100, summeMax: 10000 },
        { art: 'minus', a: [1100, 9900], b: [100, 900], schritt: 100 }] },
      { art: 'gemischt', regeln: [
        { art: 'plus', a: [10, 990], b: [10, 90], schritt: 10, summeMax: 10000 },
        { art: 'plus', a: [1000, 9000], b: [100, 900], schritt: 100, summeMax: 10000 },
        { art: 'minus', a: [2000, 9000], b: [100, 900], schritt: 100 }] }][i] },

  /* 9–16 · dieselben mit Übergang ---------------------------------------- */
  { von: 9, bis: 16, aufgaben: 24, schluessel: true, titel: i => [
      'Zehner mit Übergang', 'Hunderter mit Übergang',
      'Über den vollen Hunderter', 'Über den vollen Tausender',
      'Zehner abziehen mit Übergang', 'Hunderter abziehen mit Übergang',
      'Neunhundert addieren', 'Übergang, alles gemischt'][i],
    regel: i => [
      { art: 'plus', a: [10, 990], b: [10, 990], schritt: 10, summeMax: 10000,
        uebergang: true, uebergangStelle: 100 },
      { art: 'plus', a: [100, 9900], b: [100, 900], schritt: 100, summeMax: 10000 },
      { art: 'plus', a: [110, 9900], b: [110, 900], schritt: 10, summeMax: 10000,
        uebergang: true, uebergangStelle: 100 },
      { art: 'plus', a: [1100, 8900], b: [200, 900], schritt: 100, summeMax: 10000 },
      { art: 'minus', a: [110, 1000], b: [20, 90], schritt: 10, uebergang: true, uebergangStelle: 100 },
      { art: 'minus', a: [1100, 10000], b: [200, 900], schritt: 100 },
      { art: 'plus', a: [1100, 9000], b: [900, 900], schritt: 100, summeMax: 10000 },
      { art: 'gemischt', regeln: [
        { art: 'plus', a: [110, 990], b: [110, 990], schritt: 10, summeMax: 10000,
          uebergang: true, uebergangStelle: 100 },
        { art: 'minus', a: [1100, 9900], b: [200, 900], schritt: 100 }] }][i] },

  /* 17–26 · gemischte Zahlen --------------------------------------------- */
  { von: 17, bis: 26, aufgaben: 20, titel: i => [
      'Vierstellig plus Zehner', 'Vierstellig plus Hunderter',
      'Vierstellig plus zweistellig', 'Vierstellig plus dreistellig',
      'Vierstellig minus Zehner', 'Vierstellig minus Hunderter',
      'Vierstellig minus zweistellig', 'Vierstellig minus dreistellig',
      'Gemischt plus', 'Gemischt plus und minus'][i],
    regel: i => [
      { art: 'plus', a: [1001, 9899], b: [10, 90], schritt: 1, summeMax: 10000 },
      { art: 'plus', a: [1001, 8999], b: [100, 900], summeMax: 10000 },
      { art: 'plus', a: [1001, 9899], b: [11, 99], summeMax: 10000 },
      { art: 'plus', a: [1001, 8999], b: [101, 899], summeMax: 10000 },
      { art: 'minus', a: [1001, 9999], b: [10, 90] },
      { art: 'minus', a: [1001, 9999], b: [100, 900] },
      { art: 'minus', a: [1001, 9999], b: [11, 99] },
      { art: 'minus', a: [1101, 9999], b: [101, 899] },
      { art: 'gemischt', regeln: [
        { art: 'plus', a: [1001, 8999], b: [101, 899], summeMax: 10000 },
        { art: 'plus', a: [1001, 9899], b: [11, 99], summeMax: 10000 }] },
      { art: 'gemischt', regeln: [
        { art: 'plus', a: [1001, 8999], b: [101, 899], summeMax: 10000 },
        { art: 'minus', a: [1101, 9999], b: [101, 899] }] }][i] },

  /* 27–34 · ergänzen und vermindern -------------------------------------- */
  { von: 27, bis: 34, aufgaben: 20, titel: i => [
      'Auf den nächsten Hunderter ergänzen', 'Auf den nächsten Tausender ergänzen',
      'Um Zehner ergänzen', 'Um Hunderter ergänzen',
      'Auf einen Hunderter vermindern', 'Auf einen Tausender vermindern',
      'Um Hunderter vermindern', 'Ergänzen und Vermindern gemischt'][i],
    regel: i => [
      { art: 'ergaenzen', a: [1001, 9899], ziel: [1100, 9900], zielSchritt: 100 },
      { art: 'ergaenzen', a: [1001, 8999], ziel: [2000, 9000], zielSchritt: 1000 },
      { art: 'ergaenzen', a: [1010, 9900], ziel: [1100, 9990], zielSchritt: 10 },
      { art: 'ergaenzen', a: [1100, 9800], ziel: [1200, 9900], zielSchritt: 100 },
      { art: 'vermindern', a: [1101, 9999], ziel: [1000, 9900], zielSchritt: 100 },
      { art: 'vermindern', a: [1001, 9999], ziel: [1000, 9000], zielSchritt: 1000 },
      { art: 'vermindern', a: [1200, 9900], ziel: [1100, 9800], zielSchritt: 100 },
      { art: 'gemischt', regeln: [
        { art: 'ergaenzen', a: [1001, 9899], ziel: [1100, 9900], zielSchritt: 100 },
        { art: 'vermindern', a: [1101, 9999], ziel: [1000, 9900], zielSchritt: 100 }] }][i] },

  /* 35–40 · auf Tausend und Zehntausend ---------------------------------- */
  { von: 35, bis: 40, aufgaben: 20, schluessel: true, titel: i => [
      'Ergänzen auf 1000 — volle Hunderter', 'Ergänzen auf 1000 — volle Zehner',
      'Ergänzen auf 1000', 'Ergänzen auf 10 000 — volle Tausender',
      'Ergänzen auf 10 000 — volle Hunderter', 'Ergänzen auf 10 000'][i],
    regel: i => [
      { art: 'ergaenzen', a: [100, 900], ziel: 1000, schritt: 100 },
      { art: 'ergaenzen', a: [10, 990], ziel: 1000, schritt: 10 },
      { art: 'ergaenzen', a: [1, 999], ziel: 1000 },
      { art: 'ergaenzen', a: [1000, 9000], ziel: 10000, schritt: 1000 },
      { art: 'ergaenzen', a: [100, 9900], ziel: 10000, schritt: 100 },
      { art: 'ergaenzen', a: [10, 9990], ziel: 10000, schritt: 10 }][i] },

  /* 41–48 · Verdoppeln und Halbieren ------------------------------------- */
  { von: 41, bis: 48, aufgaben: 24, schluessel: true, titel: i => [
      'Verdoppeln bis 500', 'Verdoppeln bis 5000', 'Verdoppeln voller Hunderter',
      'Halbieren bis 500', 'Halbieren bis 5000', 'Halbieren voller Hunderter',
      'Vierfaches bilden', 'Verdoppeln und Halbieren gemischt'][i],
    regel: i => [
      { art: 'verdoppeln', a: [50, 500] },
      { art: 'verdoppeln', a: [500, 5000] },
      { art: 'verdoppeln', a: [100, 4900] },
      { art: 'halbieren', a: [100, 1000] },
      { art: 'halbieren', a: [1000, 10000] },
      { art: 'halbieren', a: [200, 9800] },
      { art: 'mal', a: [4, 4], b: [25, 999], tausche: true },
      { art: 'gemischt', regeln: [
        { art: 'verdoppeln', a: [50, 5000] },
        { art: 'halbieren', a: [100, 10000] }] }][i] },

  /* 49–56 · Zehner-Einmaleins -------------------------------------------- */
  { von: 49, bis: 56, aufgaben: 24, schluessel: true, titel: i => [
      'Zehner mal Einer', 'Einer mal Zehner', 'Zehner mal Zehner',
      'Geteilt durch einen Zehner', 'Zehner-Einmaleins gemischt',
      'Mal 20, mal 30, mal 40', 'Mal 50 — die Hälfte von hundert',
      'Zehner-Einmaleins und Division'][i],
    regel: i => [
      { art: 'mal', a: [10, 90], b: [2, 9], schrittA: 10 },
      { art: 'mal', a: [2, 9], b: [10, 90] },
      { art: 'mal', a: [10, 90], b: [10, 90] },
      { art: 'geteilt', a: [2, 9], b: [10, 90] },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [10, 90], b: [2, 9] },
        { art: 'mal', a: [10, 90], b: [10, 90] }] },
      { art: 'mal', a: [20, 40], b: [2, 9], tausche: true },
      { art: 'mal', a: [50, 50], b: [2, 99], tausche: true },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [10, 90], b: [2, 9], tausche: true },
        { art: 'geteilt', a: [2, 9], b: [10, 90] }] }][i] },

  /* 57–64 · Hunderter- und Tausender-Einmaleins --------------------------- */
  { von: 57, bis: 64, aufgaben: 24, titel: i => [
      'Hunderter mal Einer', 'Tausender mal Einer', 'Geteilt durch einen Hunderter',
      'Geteilt durch einen Tausender', 'Hunderter mal Zehner',
      'Mal 100 und mal 1000', 'Durch 100 und durch 1000',
      'Hunderter- und Tausender-Einmaleins gemischt'][i],
    regel: i => [
      { art: 'mal', a: [100, 900], b: [2, 9], tausche: true },
      { art: 'mal', a: [1000, 5000], b: [1, 2], tausche: true },
      { art: 'geteilt', a: [2, 9], b: [100, 900] },
      { art: 'geteilt', a: [1, 9], b: [1000, 1000] },
      { art: 'mal', a: [100, 500], b: [10, 20] },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [2, 99], b: [100, 100], tausche: true },
        { art: 'mal', a: [2, 9], b: [1000, 1000], tausche: true }] },
      { art: 'gemischt', regeln: [
        { art: 'geteilt', a: [2, 99], b: [100, 100] },
        { art: 'geteilt', a: [2, 9], b: [1000, 1000] }] },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [100, 900], b: [2, 9], tausche: true },
        { art: 'geteilt', a: [2, 9], b: [100, 900] }] }][i] },

  /* 65–74 · das große Einmaleins ------------------------------------------ */
  { von: 65, bis: 74, aufgaben: 20, schluessel: true, titel: i => [
      'Die 11er-Reihe', 'Die 12er-Reihe', 'Die 15er-Reihe', 'Die 25er-Reihe',
      'Zerlegen: mal 10 plus Rest', 'Faktoren 11 bis 19',
      'Faktoren 20 bis 25', 'Über die Hundert: mal 25',
      'Nachbarquadrate', 'Das große Einmaleins gemischt'][i],
    regel: i => [
      { art: 'mal', a: [11, 11], b: [2, 20], tausche: true },
      { art: 'mal', a: [12, 12], b: [2, 20], tausche: true },
      { art: 'mal', a: [15, 15], b: [2, 20], tausche: true },
      { art: 'mal', a: [25, 25], b: [2, 20], tausche: true },
      { art: 'mal', a: [11, 19], b: [3, 9], tausche: true },
      { art: 'mal', a: [11, 19], b: [11, 19] },
      { art: 'mal', a: [20, 25], b: [11, 25] },
      { art: 'mal', a: [25, 25], b: [4, 40], tausche: true },
      { art: 'nachbarquadrat', a: [11, 24], abstand: 1 },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [11, 25], b: [11, 25] },
        { art: 'mal', a: [11, 25], b: [3, 9], tausche: true }] }][i] },

  /* 75–82 · Quadratzahlen -------------------------------------------------- */
  { von: 75, bis: 82, aufgaben: 20, schluessel: true, titel: i => [
      'Quadratzahlen bis 15', 'Quadratzahlen 16 bis 20', 'Quadratzahlen 21 bis 25',
      'Quadratzahlen 10 bis 25', 'Nachbarquadrate mit Abstand 2',
      'Quadrate der Zehner', 'Quadrate und ihre Wurzeln',
      'Quadratzahlen, alles gemischt'][i],
    regel: i => [
      { art: 'quadrat', a: [10, 18] },
      { art: 'quadrat', a: [15, 22] },
      { art: 'quadrat', a: [18, 25] },
      { art: 'quadrat', a: [10, 25] },
      { art: 'nachbarquadrat', a: [12, 25], abstand: 2 },
      { art: 'quadrat', a: [10, 90] },
      { art: 'gemischt', regeln: [
        { art: 'quadrat', a: [10, 25] },
        { art: 'geteilt', a: [10, 25], b: [10, 25] }] },
      { art: 'gemischt', regeln: [
        { art: 'quadrat', a: [10, 25] },
        { art: 'nachbarquadrat', a: [11, 24], abstand: 1 }] }][i] },

  /* 83–88 · zwei- und dreistellige Multiplikation ------------------------- */
  { von: 83, bis: 88, aufgaben: 12, titel: i => [
      'Zweistellig mal einstellig', 'Zweistellig mal zweistellig',
      'Dreistellig mal einstellig', 'Mal 125 und mal 250',
      'Zweistellig mal Zehner', 'Große Multiplikation gemischt'][i],
    regel: i => [
      { art: 'mal', a: [21, 99], b: [3, 9], produktMax: 10000, tausche: true },
      { art: 'mal', a: [21, 99], b: [11, 99], produktMax: 10000 },
      { art: 'mal', a: [101, 999], b: [2, 9], produktMax: 10000, tausche: true },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [125, 125], b: [2, 40], tausche: true },
        { art: 'mal', a: [250, 250], b: [2, 20], tausche: true }] },
      { art: 'mal', a: [11, 99], b: [10, 90], produktMax: 10000 },
      { art: 'gemischt', regeln: [
        { art: 'mal', a: [21, 99], b: [11, 99], produktMax: 10000 },
        { art: 'mal', a: [101, 999], b: [2, 9], produktMax: 10000 }] }][i] },

  /* 89–92 · Division drei- und vierstelliger Zahlen ----------------------- */
  { von: 89, bis: 92, aufgaben: 12, titel: i => [
      'Dreistellig geteilt durch einstellig', 'Dreistellig geteilt durch zweistellig',
      'Vierstellig geteilt durch zweistellig', 'Große Division gemischt'][i],
    regel: i => [
      { art: 'geteilt', a: [21, 99], b: [3, 9] },
      { art: 'geteilt', a: [11, 40], b: [11, 25] },
      { art: 'geteilt', a: [41, 99], b: [11, 99], produktMax: 10000 },
      { art: 'gemischt', regeln: [
        { art: 'geteilt', a: [21, 99], b: [3, 9] },
        { art: 'geteilt', a: [11, 40], b: [11, 25] }] }][i] },

  /* 93–96 · nächstkleinere Zahl einer Reihe -------------------------------- */
  { von: 93, bis: 96, aufgaben: 16, titel: i => [
      'Nächstkleinere Zahl: Reihen 2 bis 5', 'Nächstkleinere Zahl: Reihen 6 bis 9',
      'Nächstkleinere Zahl bis 100', 'Nächstkleinere Zahl, gemischt'][i],
    regel: i => [
      { art: 'naechstKleiner', a: [10, 60], b: [2, 5] },
      { art: 'naechstKleiner', a: [20, 80], b: [6, 9] },
      { art: 'naechstKleiner', a: [40, 100], b: [3, 9] },
      { art: 'naechstKleiner', a: [10, 100], b: [2, 12] }][i] },

  /* 97–100 · Teilen mit Rest ---------------------------------------------- */
  { von: 97, bis: 100, aufgaben: 16, pruefart: 'rest', titel: i => [
      'Teilen mit Rest: Reihen 2 bis 5', 'Teilen mit Rest: Reihen 6 bis 9',
      'Teilen mit Rest bis 100', 'Teilen mit Rest, gemischt'][i],
    regel: i => [
      { art: 'restTeilen', a: [7, 60], b: [2, 5] },
      { art: 'restTeilen', a: [13, 80], b: [6, 9] },
      { art: 'restTeilen', a: [20, 100], b: [3, 9] },
      { art: 'restTeilen', a: [10, 100], b: [2, 12] }][i] }
];

const VORAUSSETZUNG = nr =>
  nr >= 65 && nr <= 74 ? 49          // großes Einmaleins ← Zehner-Einmaleins
  : nr >= 75 && nr <= 82 ? 65        // Quadratzahlen     ← 11er-Reihe
  : nr >= 83 && nr <= 92 ? 69        // große Rechnungen  ← Zerlegen
  : nr >= 97 ? 93                    // Teilen mit Rest   ← nächstkleinere Zahl
  : nr >= 9 && nr <= 16 ? 35         // Übergang          ← Ergänzen auf 1000
  : null;

export const SETS_B2 = (() => {
  const sets = [];
  BLOECKE.forEach(block => {
    for (let nr = block.von; nr <= block.bis; nr++) {
      const i = nr - block.von;
      sets.push({
        nr,
        titel: block.titel(i),
        aufgaben: block.aufgaben,
        pruefart: block.pruefart || 'zahl',
        schluessel: !!block.schluessel,
        voraussetzung: VORAUSSETZUNG(nr),
        regel: block.regel(i)
      });
    }
  });
  return sets;
})();
