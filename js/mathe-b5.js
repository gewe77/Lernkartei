/* =========================================================================
   HAN CROCO — Bereich 5: Trigonometrie und Stochastik
   -------------------------------------------------------------------------
   100 Sets zu 10 Aufgaben. Beides eignet sich für das Geläufigkeitstraining,
   weil vieles davon reiner Abruf ist: Wer `sin 60°` nachschlagen muss, kommt
   in der Aufgabe darunter nicht weit.

   Drei Festlegungen tragen diesen Bereich:

   1. EXAKTE WERTE BLEIBEN EXAKT. Auf `sin 60°` heißt die Antwort `√3/2` und
      nicht `0,866` — sonst übt man das Falsche ein. Deshalb kommen nur die
      Winkel vor, deren Werte exakt hinschreibbar sind: die Vielfachen von
      30° und 45°. `tan 90°` gibt es nicht und darf gar nicht erst entstehen.

   2. WAHRSCHEINLICHKEITEN SIND GEKÜRZTE BRÜCHE. `11/36`, nicht `0,3056`.
      Der Termrechner (mathe-term.js) vergleicht kanonisiert, `1/6` und
      `6/36` gelten also beide — die Musterlösung steht trotzdem gekürzt da.

   3. DIE GÜNSTIGEN FÄLLE STEHEN ALS FORMEL. Der Erzeuger rechnet
      `P(Summe ≥ s)` aus einer Formel aus, die Gegenprüfung zählt dieselbe
      Wahrscheinlichkeit stattdessen über alle 36 Paare ab. Nur wenn beide
      Wege dasselbe liefern, stimmt die Musterlösung.

   Die Aufgabentexte sind knapp gehalten — sechs Sekunden je Aufgabe reichen
   nicht zum Lesen von Sätzen. Also `Würfel: P(6)` statt „Wie groß ist die
   Wahrscheinlichkeit, mit einem Würfel eine Sechs zu werfen?".
   ========================================================================= */

import { erzeugerAnmelden, spanne } from './mathe-erzeuger.js';

/* --- Kleine Rechenhelfer -------------------------------------------------- */

const ggt = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };

/** Gekürzter Bruch als Zeichenkette: 12/36 → `1/3`, 4/2 → `2`. */
function bruch(z, n) {
  if (n < 0) { z = -z; n = -n; }
  const g = ggt(z, n);
  z /= g; n /= g;
  return n === 1 ? String(z) : `${z}/${n}`;
}

/** Vielfaches von π: (1,6) → `π/6`, (3,2) → `3π/2`, (2,1) → `2π`, (0,n) → `0`. */
function piBruch(z, n) {
  if (z === 0) return '0';
  if (n < 0) { z = -z; n = -n; }
  const g = ggt(z, n);
  z /= g; n /= g;
  const kopf = z === 1 ? 'π' : z === -1 ? '-π' : `${z}π`;
  return n === 1 ? kopf : `${kopf}/${n}`;
}

/** Vorzeichenwechsel auf der Zeichenkette. `0` bleibt `0` — `-0` läse sich
 *  wie ein Tippfehler, obwohl der Termrechner es verstünde. */
const negiert = s => (s === '0' ? '0' : s.startsWith('-') ? s.slice(1) : '-' + s);

/** Zahl mit deutschem Komma: 3.5 → `3,5`. Ganze Zahlen bleiben ganz. */
const zahlText = v => String(Math.round(v * 100) / 100).replace('.', ',');

const hoch = (b, e) => { let w = 1; for (let i = 0; i < e; i++) w *= b; return w; };
const fakultaet = n => { let w = 1; for (let i = 2; i <= n; i++) w *= i; return w; };
/** Binomialkoeffizient multiplikativ — ohne den Umweg über große Fakultäten. */
function binom(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let w = 1;
  for (let i = 1; i <= k; i++) w = w * (n - k + i) / i;
  return Math.round(w);
}
const istPrim = z => { if (z < 2) return false; for (let d = 2; d * d <= z; d++) if (z % d === 0) return false; return true; };
const primAnzahl = n => { let c = 0; for (let z = 2; z <= n; z++) if (istPrim(z)) c++; return c; };

/* --- Die exakten Winkelwerte ---------------------------------------------- */

/* Nur der erste Quadrant steht in der Tabelle; alles andere entsteht durch
   Spiegeln und Vorzeichen. Eine Tabelle mit 51 Einträgen von Hand wäre die
   fehleranfälligere Lösung. */
const SIN_GRUND = { 0: '0', 30: '1/2', 45: '√2/2', 60: '√3/2', 90: '1' };
const TAN_GRUND = { 0: '0', 30: '√3/3', 45: '1', 60: '√3' };

function sinWert(grad) {
  const g = ((grad % 360) + 360) % 360;
  const oben = g <= 180;                                   // 1. und 2. Quadrant
  const bezug = g <= 90 ? g : g <= 180 ? 180 - g : g <= 270 ? g - 180 : 360 - g;
  const w = SIN_GRUND[bezug];
  if (w === undefined) return null;                        // kein Standardwinkel
  return oben ? w : negiert(w);
}

/** cos θ = sin(θ + 90°) — dieselbe Tabelle, um 90° verschoben. */
const cosWert = grad => sinWert(grad + 90);

function tanWert(grad) {
  const g = ((grad % 180) + 180) % 180;                    // Periode π
  if (g === 90) return null;                               // nicht erklärt
  const bezug = g <= 90 ? g : 180 - g;
  const w = TAN_GRUND[bezug];
  if (w === undefined) return null;
  return g <= 90 ? w : negiert(w);
}

const WERT_VON = { sin: sinWert, cos: cosWert, tan: tanWert };

/* --- Die Winkelgruppen ---------------------------------------------------- */

const GRUND     = [0, 30, 45, 60, 90];
const GRUND_180 = [0, 30, 45, 60, 90, 180];
const HALB      = [0, 30, 45, 60, 90, 120, 135, 150, 180];
const HALB_OHNE_0 = [30, 45, 60, 90, 120, 135, 150, 180];
const ZWEITE    = [180, 210, 225, 240, 270, 300, 315, 330, 360];
const DREISSIG  = [30, 60, 120, 150, 210, 240, 300, 330];
const VIERTEL   = [45, 90, 135, 180, 225, 270, 315, 360];
const VOLL      = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
const VOLL_OHNE_0 = VOLL.slice(1);
/* Winkel, die im Unterricht seltener vorkommen — sie zwingen dazu, den
   Umrechnungsweg wirklich zu gehen statt fünf Paare auswendig zu kennen. */
const FEIN      = [9, 10, 15, 20, 36, 72, 75, 105, 144, 160];

/* --- Die Beziehungen ------------------------------------------------------ */

/* Feste Paare aus Term und Wert. Sie lassen sich nicht sinnvoll aus einer
   Spanne erzeugen — es sind die Merksätze selbst. Die Gegenprüfung rechnet
   jedes Paar numerisch an mehreren Stellen nach. */
const BEZIEHUNGEN = {

  grundbeziehung: [
    ['sin²x + cos²x', '1'],
    ['cos²x + sin²x', '1'],
    ['sin²30° + cos²30°', '1'],
    ['sin²45° + cos²45°', '1'],
    ['sin²60° + cos²60°', '1'],
    ['2·(sin²x + cos²x)', '2'],
    ['3·(sin²x + cos²x)', '3'],
    ['1 − sin²x − cos²x', '0'],
    ['(sin²x + cos²x)²', '1'],
    ['sin²x + cos²x + 1', '2']
  ],

  symbolisch: [
    ['sin x : cos x', 'tan x'],
    ['sin(90° − x)', 'cos x'],
    ['cos(90° − x)', 'sin x'],
    ['sin(−x)', '-sin x'],
    ['cos(−x)', 'cos x'],
    ['tan(−x)', '-tan x'],
    ['sin(180° − x)', 'sin x'],
    ['cos(180° − x)', '-cos x'],
    ['tan(180° + x)', 'tan x'],
    ['sin(x + 360°)', 'sin x']
  ],

  aussenwinkel: [
    ['sin 390°', '1/2'],
    ['cos 450°', '0'],
    ['sin 720°', '0'],
    ['sin(−30°)', '-1/2'],
    ['cos(−60°)', '1/2'],
    ['tan 405°', '1'],
    ['sin 750°', '1/2'],
    ['cos(−90°)', '0'],
    ['sin 420°', '√3/2'],
    ['cos 540°', '-1']
  ],

  rechnen: [
    ['2·sin 30°', '1'],
    ['2·cos 60°', '1'],
    ['4·sin 30°', '2'],
    ['2·sin 45°', '√2'],
    ['2·cos 45°', '√2'],
    ['2·sin 60°', '√3'],
    ['3·sin 90°', '3'],
    ['sin 30° + cos 60°', '1'],
    ['sin 0° + cos 0°', '1'],
    ['sin 90° − cos 0°', '0']
  ],

  zusammengesetzt: [
    ['sin(30° + 60°)', '1'],
    ['cos(45° + 45°)', '0'],
    ['sin(90° − 30°)', '√3/2'],
    ['cos(180° − 60°)', '-1/2'],
    ['sin(180° + 30°)', '-1/2'],
    ['tan(45° + 135°)', '0'],
    ['cos(360° − 60°)', '1/2'],
    ['sin(2·30°)', '√3/2'],
    ['cos(2·60°)', '-1/2'],
    ['tan(180° − 45°)', '-1']
  ]
};

/* --- Beschriftungen ------------------------------------------------------- */

const KURVE_TEXT = { amplitude: 'Amplitude', periode: 'Periode', max: 'Maximum', min: 'Minimum' };
const LAGE_TEXT  = { mittel: 'Mittel', median: 'Median', modus: 'Modalwert', spanne: 'Spannweite' };
const FARBEN     = ['rot', 'blau', 'grün'];
const KARTEN_TEXT = { ass: 'Ass', koenig: 'König', zehn: 'Zehn', herz: 'Herz',
                      rot: 'rot', bild: 'Bild', 'kein ass': 'kein Ass' };

/** Anzahl der günstigen Fälle unter den Zahlen 1…n — als Formel, nicht als
 *  Abzählung. Die Gegenprüfung zählt ab; nur wenn beides übereinstimmt,
 *  stimmt die Musterlösung. */
function guenstige(code, n) {
  let m;
  if ((m = /^(\d+)$/.exec(code)))            return Number(m[1]) <= n ? 1 : null;
  if ((m = /^nicht (\d+)$/.exec(code)))      return Number(m[1]) <= n ? n - 1 : null;
  if ((m = /^(\d+) oder (\d+)$/.exec(code))) return Number(m[1]) <= n && Number(m[2]) <= n ? 2 : null;
  if (code === 'gerade')   return Math.floor(n / 2);
  if (code === 'ungerade') return n - Math.floor(n / 2);
  if (code === 'primzahl') return primAnzahl(n);
  if ((m = /^>=(\d+)$/.exec(code)))       return Math.max(0, n - Number(m[1]) + 1);
  if ((m = /^<=(\d+)$/.exec(code)))       return Math.min(n, Number(m[1]));
  if ((m = /^>(\d+)$/.exec(code)))        return Math.max(0, n - Number(m[1]));
  if ((m = /^<(\d+)$/.exec(code)))        return Math.max(0, Math.min(n, Number(m[1]) - 1));
  if ((m = /^teilbar (\d+)$/.exec(code))) return Math.floor(n / Number(m[1]));
  return null;
}

/** Aus dem Kürzel wird die Anzeige: `>=5` → `≥ 5`, `teilbar 4` → `durch 4 teilbar`. */
const ereignisText = code => code
  .replace(/^>=/, '≥ ').replace(/^<=/, '≤ ')
  .replace(/^>/, '> ').replace(/^</, '< ')
  .replace(/^primzahl$/, 'Primzahl')
  .replace(/^teilbar (\d+)$/, 'durch $1 teilbar');

/* --- Die Regelarten dieses Bereichs --------------------------------------- */

erzeugerAnmelden({

  /** Grad und Bogenmaß ineinander: `30° = ▢` → `π/6`, `π/6 = ▢°` → `30`. */
  trigBogen(r, saat) {
    const raum = [];
    for (const grad of r.winkel) {
      const bogen = piBruch(grad, 180);
      if (r.richtung === 'grad') {
        if (grad === 0) continue;                 // `0 = ▢°` läse sich wie ein Fehler
        raum.push({ t: `${bogen} = ▢°`, a: String(grad) });
      } else {
        raum.push({ t: `${grad}° = ▢`, a: bogen });
      }
    }
    return raum;
  },

  /** Exakte Werte: `sin 60°` → `√3/2`. Mit `form: 'quotient'` stattdessen
   *  `sin 60° : cos 60°` → `√3` — dieselbe Tabelle, andere Frage.
   *  Wo der Wert nicht erklärt ist (tan 90°), entsteht keine Aufgabe. */
  trigWert(r, saat) {
    const raum = [];
    for (const fun of r.funktionen) for (const grad of r.winkel) {
      if (r.form === 'quotient') {
        const w = tanWert(grad);
        if (w === null) continue;
        raum.push({ t: `sin ${grad}° : cos ${grad}°`, a: w });
      } else {
        const w = WERT_VON[fun](grad);
        if (w === null) continue;
        raum.push({ t: `${fun} ${grad}°`, a: w });
      }
    }
    return raum;
  },

  /** Die Umkehrung: `sin ▢° = 1/2` → `30`. Nur im ersten Quadranten, sonst
   *  gäbe es zwei richtige Antworten. */
  trigWinkelGesucht(r, saat) {
    const raum = [];
    for (const fun of r.funktionen) for (const grad of r.winkel) {
      if (grad < 0 || grad > 90) continue;
      const w = WERT_VON[fun](grad);
      if (w === null) continue;
      raum.push({ t: `${fun} ▢° = ${w}`, a: String(grad) });
    }
    return raum;
  },

  /** Pythagoras — ausschließlich mit pythagoreischen Tripeln und deren
   *  Vielfachen, damit die gesuchte Seite ganzzahlig ist. Wurzelziehen im
   *  Kopf ist eine andere Übung und steht in Bereich 4. */
  trigPythagoras(r, saat) {
    const raum = [];
    for (const [a0, b0, c0] of r.tripel) for (const k of spanne(r.faktor, saat)) {
      const a = a0 * k, b = b0 * k, c = c0 * k;
      if (r.gesucht === 'c')      raum.push({ t: `a=${a}, b=${b}, c=▢`, a: String(c) });
      else if (r.gesucht === 'a') raum.push({ t: `b=${b}, c=${c}, a=▢`, a: String(a) });
      else                        raum.push({ t: `a=${a}, c=${c}, b=▢`, a: String(b) });
    }
    return raum;
  },

  /** Pythagoras in Figuren: Diagonale im Rechteck und im Quadrat, Höhe im
   *  gleichseitigen Dreieck. Die beiden letzten enden auf einer Wurzel. */
  trigFigur(r, saat) {
    const raum = [];
    if (r.figur === 'rechteck') {
      for (const [a0, b0, c0] of r.tripel) for (const k of spanne(r.faktor, saat))
        raum.push({ t: `Rechteck ${a0 * k}×${b0 * k}: Diagonale`, a: String(c0 * k) });
    } else if (r.figur === 'quadrat') {
      for (const a of spanne(r.a, saat))
        raum.push({ t: `Quadrat a=${a}: Diagonale`, a: a === 1 ? '√2' : `${a}√2` });
    } else {
      for (const a of spanne(r.a, saat)) {
        if (a % 2) continue;                      // sonst stünde ein Bruch vor der Wurzel
        const h = a / 2;
        raum.push({ t: `Gleichseitig a=${a}: Höhe`, a: h === 1 ? '√3' : `${h}√3` });
      }
    }
    return raum;
  },

  /** Die Merksätze selbst — sin²x + cos²x, die Spiegelungen, das Rechnen mit
   *  exakten Werten. */
  trigBeziehung(r, saat) {
    return (BEZIEHUNGEN[r.gruppe] || []).map(([t, a]) => ({ t, a }));
  },

  /** Sinuskurve: Amplitude, Periode, größter und kleinster Wert.
   *  Der Vorfaktor steht auch dann da, wenn er für die Frage gleichgültig
   *  ist — wer die Periode von `3·sin(2x)` sucht, muss die 3 übergehen. */
  trigKurve(r, saat) {
    const raum = [];
    const kons = r.c == null ? [null] : spanne(r.c, saat + 2);
    for (const a of spanne(r.a, saat)) for (const b of spanne(r.b, saat + 1)) for (const c of kons) {
      if ((r.groesse === 'max' || r.groesse === 'min') && c === null) continue;
      if (r.groesse === 'min' && c < a) continue;          // kein negatives Ergebnis
      const innen = b === 1 ? 'x' : r.bBruch ? `x/${b}` : `${b}x`;
      const kopf = (a === 1 ? '' : `${a}·`) + `${r.fun}(${innen})` + (c === null ? '' : ` + ${c}`);
      let antwort;
      if (r.groesse === 'amplitude')  antwort = String(a);
      else if (r.groesse === 'max')   antwort = String(a + c);
      else if (r.groesse === 'min')   antwort = String(c - a);
      else {
        const voll = r.fun === 'tan' ? 1 : 2;              // tan hat die Periode π
        antwort = r.bBruch ? piBruch(voll * b, 1) : piBruch(voll, b);
      }
      raum.push({ t: `${kopf}: ${KURVE_TEXT[r.groesse]}`, a: antwort });
    }
    return raum;
  },

  /** Fakultät: `5!` → 120, `6!/4!` → 30, `4 Bücher: Reihenfolgen` → 24. */
  stochFakultaet(r, saat) {
    const raum = [];
    for (const n of spanne(r.n, saat)) {
      if (r.form === 'reihenfolgen') {
        raum.push({ t: `${n} Bücher: Reihenfolgen`, a: String(fakultaet(n)) });
      } else if (r.form === 'kuerzen') {
        for (const d of spanne(r.d, saat + 1)) {
          if (n - d < 1) continue;
          raum.push({ t: `${n}!/${n - d}!`, a: String(fakultaet(n) / fakultaet(n - d)) });
        }
      } else {
        raum.push({ t: `${n}!`, a: String(fakultaet(n)) });
      }
    }
    return raum;
  },

  /** Binomialkoeffizient: `C(5;2)` → 10. `kRand` nimmt die vier Randfälle,
   *  `kAlle` eine ganze Zeile des Pascalschen Dreiecks, `kSpiegel` die
   *  Werte von hinten — dort sitzt die Symmetrie C(n;k) = C(n;n−k). */
  stochBinom(r, saat) {
    const raum = [];
    for (const n of spanne(r.n, saat)) {
      let ks;
      if (r.kRand)         ks = [0, 1, n - 1, n];
      else if (r.kAlle)    ks = Array.from({ length: n + 1 }, (_, i) => i);
      else if (r.kSpiegel) ks = spanne(r.kSpiegel, saat + 1).map(k => n - k);
      else                 ks = spanne(r.k, saat + 1);
      for (const k of ks) {
        if (k < 0 || k > n) continue;
        raum.push({ t: `C(${n};${k})`, a: String(binom(n, k)) });
      }
    }
    return raum;
  },

  /** Einstufiger Laplace-Versuch über den Zahlen 1…n: Würfel, Glücksrad,
   *  Zahlenkarten. Ereignisse mit Wahrscheinlichkeit 0 oder 1 fallen raus —
   *  sie sind keine Übung, sondern eine Fangfrage. */
  stochLaplace(r, saat) {
    const raum = [];
    for (const n of r.seiten) {
      const kopf = r.form === 'rad' ? `Rad ${n} Felder`
                 : r.form === 'zahlen' ? `Zahlen 1–${n}`
                 : n === 6 ? 'Würfel' : `${n}er-Würfel`;
      for (const code of r.ereignisse) {
        const g = guenstige(code, n);
        if (g === null || g <= 0 || g >= n) continue;
        raum.push({ t: `${kopf}: P(${ereignisText(code)})`, a: bruch(g, n) });
      }
    }
    return raum;
  },

  /** Urne mit zwei oder drei Farben, ein Zug. */
  stochUrne(r, saat) {
    const raum = [];
    const gruene = r.gruen ? spanne(r.gruen, saat + 2) : [null];
    for (const rot of spanne(r.rot, saat)) for (const blau of spanne(r.blau, saat + 1)) for (const gruen of gruene) {
      const urne = gruen === null ? [rot, blau] : [rot, blau, gruen];
      const gesamt = urne.reduce((s, x) => s + x, 0);
      const kopf = 'Urne ' + urne.map((z, i) => `${z} ${FARBEN[i]}`).join(', ');
      urne.forEach((anzahl, i) => {
        if (anzahl <= 0 || anzahl >= gesamt) return;
        raum.push({ t: `${kopf}: P(${FARBEN[i]})`, a: bruch(anzahl, gesamt) });
        if (r.gegen) raum.push({ t: `${kopf}: P(nicht ${FARBEN[i]})`, a: bruch(gesamt - anzahl, gesamt) });
      });
    }
    return raum;
  },

  /** Kartenblatt mit 32 oder 52 Karten: vier Farben zu je einem Achtel bzw.
   *  einem Dreizehntel, vier Asse, zwölf Bilder. */
  stochKarten(r, saat) {
    const raum = [];
    for (const blatt of r.blaetter) {
      for (const code of r.ereignisse) {
        const g = code === 'ass' || code === 'koenig' || code === 'zehn' ? 4
                : code === 'herz' ? blatt / 4
                : code === 'rot' ? blatt / 2
                : code === 'bild' ? 12
                : code === 'kein ass' ? blatt - 4 : null;
        if (g === null || g <= 0 || g >= blatt) continue;
        raum.push({ t: `${blatt} Karten: P(${KARTEN_TEXT[code]})`, a: bruch(g, blatt) });
      }
    }
    return raum;
  },

  /** Gegenwahrscheinlichkeit als reine Rechnung: `P(A)=3/8: P(nicht A)`. */
  stochGegen(r, saat) {
    const raum = [];
    for (const n of spanne(r.n, saat)) for (const z of spanne(r.z, saat + 1)) {
      if (z >= n || ggt(z, n) !== 1) continue;             // nur gekürzte Angaben
      raum.push({ t: `P(A)=${z}/${n}: P(nicht A)`, a: bruch(n - z, n) });
    }
    return raum;
  },

  /** Zweistufige Versuche — Pfadregel und Gegenereignis. Die Zähler stehen
   *  als Formel da (5^k, 6^k − 5^k, C(n;k), a(a−1)); die Gegenprüfung zählt
   *  die Ergebnisse stattdessen einzeln ab. */
  stochZwei(r, saat) {
    const raum = [];
    const wuerfe = spanne(r.wuerfe || 2, saat);
    if (r.form === 'zweimal')
      for (const k of wuerfe) for (const z of spanne(r.z, saat + 1))
        raum.push({ t: `${k} Würfe: P(${k}× ${z})`, a: bruch(1, hoch(6, k)) });

    if (r.form === 'keine')
      for (const k of wuerfe) for (const z of spanne(r.z, saat + 1))
        raum.push({ t: `${k} Würfe: P(keine ${z})`, a: bruch(hoch(5, k), hoch(6, k)) });

    if (r.form === 'mind')
      for (const k of wuerfe) for (const z of spanne(r.z, saat + 1))
        raum.push({ t: `${k} Würfe: P(mind. eine ${z})`,
                    a: bruch(hoch(6, k) - hoch(5, k), hoch(6, k)) });

    if (r.form === 'gleich') {
      raum.push({ t: '2 Würfe: P(zwei gleiche)',  a: bruch(6, 36) });
      raum.push({ t: '2 Würfe: P(verschieden)',   a: bruch(30, 36) });
      raum.push({ t: '3 Würfe: P(drei gleiche)',  a: bruch(6, 216) });
    }

    if (r.form === 'summe')
      for (const s of spanne(r.s, saat))
        raum.push({ t: `2 Würfel: P(Summe ${s})`, a: bruch(6 - Math.abs(s - 7), 36) });

    if (r.form === 'summeMin')
      for (const s of spanne(r.s, saat)) {
        let g = 0;
        for (let k = s; k <= 12; k++) g += 6 - Math.abs(k - 7);
        raum.push({ t: `2 Würfel: P(Summe ≥ ${s})`, a: bruch(g, 36) });
      }

    if (r.form === 'muenzeGenau')
      for (const n of spanne(r.n, saat)) for (let k = 0; k <= n; k++)
        raum.push({ t: `${n} Münzwürfe: P(genau ${k}× Kopf)`, a: bruch(binom(n, k), hoch(2, n)) });

    if (r.form === 'muenzeMind')
      for (const n of spanne(r.n, saat))
        raum.push({ t: `${n} Münzwürfe: P(mind. 1× Kopf)`, a: bruch(hoch(2, n) - 1, hoch(2, n)) });

    if (r.form === 'muenzeKein')
      for (const n of spanne(r.n, saat))
        raum.push({ t: `${n} Münzwürfe: P(kein Kopf)`, a: bruch(1, hoch(2, n)) });

    if (r.form === 'urneZwei')
      for (const rot of spanne(r.rot, saat)) for (const blau of spanne(r.blau, saat + 1)) {
        const g = rot + blau;
        const kopf = `${rot}r ${blau}b, ${r.zurueck ? 'mit' : 'ohne'} Z.`;
        if (r.wahl === 'je') {
          raum.push({ t: `${kopf}: P(je einmal)`,
                      a: bruch(2 * rot * blau, r.zurueck ? g * g : g * (g - 1)) });
        } else if (r.zurueck) {
          raum.push({ t: `${kopf}: P(2× rot)`,  a: bruch(rot * rot, g * g) });
          raum.push({ t: `${kopf}: P(2× blau)`, a: bruch(blau * blau, g * g) });
        } else {
          if (rot >= 2)  raum.push({ t: `${kopf}: P(2× rot)`,  a: bruch(rot * (rot - 1), g * (g - 1)) });
          if (blau >= 2) raum.push({ t: `${kopf}: P(2× blau)`, a: bruch(blau * (blau - 1), g * (g - 1)) });
        }
      }
    return raum;
  },

  /** Lagemaße einer kurzen Reihe. Die Werte entstehen aus einem Grundwert
   *  und einem festen Muster von Abständen — dadurch ist das Ergebnis
   *  vorhersagbar glatt, die Reihe aber jedes Mal eine andere. */
  stochLage(r, saat) {
    const raum = [];
    for (const a of spanne(r.a, saat)) {
      const werte = r.muster.map(d => a + d);
      raum.push({ t: `${LAGE_TEXT[r.groesse]}: ${werte.join(', ')}`,
                  a: zahlText(lageWert(r.groesse, werte)) });
    }
    return raum;
  },

  /** Erwartungswert: Würfel, Augensumme mehrerer Würfel, einfaches Spiel. */
  stochErwartung(r, saat) {
    const raum = [];
    if (r.form === 'wuerfel')
      for (const s of r.seiten)
        raum.push({ t: s === 6 ? 'E(Würfel)' : `E(${s}er-Würfel)`, a: zahlText((s + 1) / 2) });

    if (r.form === 'summe')
      for (const k of spanne(r.anzahl, saat))
        raum.push({ t: `E(${k} Würfel)`, a: zahlText(k * 7 / 2) });

    if (r.form === 'spiel')
      for (const n of spanne(r.n, saat)) for (const z of spanne(r.z, saat + 1)) for (const g of spanne(r.g, saat + 2)) {
        if (z >= n || ggt(z, n) !== 1) continue;
        if ((g * z) % n) continue;                         // nur glatte Ergebnisse
        raum.push({ t: `p=${bruch(z, n)}, Gewinn ${g}: E`, a: zahlText(g * z / n) });
      }
    return raum;
  }
});

/** Mittel, Median, Modalwert, Spannweite einer Reihe. */
function lageWert(groesse, werte) {
  if (groesse === 'mittel') return werte.reduce((s, w) => s + w, 0) / werte.length;
  if (groesse === 'spanne') return Math.max(...werte) - Math.min(...werte);
  if (groesse === 'modus') {
    const zaehl = new Map();
    werte.forEach(w => zaehl.set(w, (zaehl.get(w) || 0) + 1));
    let beste = werte[0], oft = 0;
    for (const [w, c] of zaehl) if (c > oft) { oft = c; beste = w; }
    return beste;
  }
  const s = werte.slice().sort((p, q) => p - q);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/* --- Die 100 Sets --------------------------------------------------------- */

const BLOECKE = [

  /* 1–7 · Grad in Bogenmaß (Schlüssel) ------------------------------------ */
  { von: 1, bis: 7, pruefart: 'term', schluessel: true, titel: i => [
      'Grundwinkel in Bogenmaß', 'Bogenmaß bis 180°', 'Bogenmaß von 180° bis 360°',
      'Vielfache von 30° in Bogenmaß', 'Vielfache von 45° in Bogenmaß',
      'Bogenmaß im ganzen Kreis', 'Ungewohnte Winkel in Bogenmaß'][i],
    regel: i => [
      { art: 'trigBogen', richtung: 'bogen', winkel: GRUND_180 },
      { art: 'trigBogen', richtung: 'bogen', winkel: HALB },
      { art: 'trigBogen', richtung: 'bogen', winkel: ZWEITE },
      { art: 'trigBogen', richtung: 'bogen', winkel: DREISSIG },
      { art: 'trigBogen', richtung: 'bogen', winkel: VIERTEL },
      { art: 'trigBogen', richtung: 'bogen', winkel: VOLL },
      { art: 'trigBogen', richtung: 'bogen', winkel: FEIN }][i] },

  /* 8–12 · Bogenmaß in Grad (Schlüssel) ----------------------------------- */
  { von: 8, bis: 12, pruefart: 'zahl', schluessel: true, titel: i => [
      'Grundwinkel aus dem Bogenmaß', 'Bogenmaß bis π in Grad',
      'Bogenmaß über π in Grad', 'Bogenmaß im ganzen Kreis in Grad',
      'Ungewohnte Bogenmaße in Grad'][i],
    regel: i => [
      { art: 'trigBogen', richtung: 'grad', winkel: [30, 45, 60, 90, 180] },
      { art: 'trigBogen', richtung: 'grad', winkel: HALB_OHNE_0 },
      { art: 'trigBogen', richtung: 'grad', winkel: ZWEITE },
      { art: 'trigBogen', richtung: 'grad', winkel: VOLL_OHNE_0 },
      { art: 'trigBogen', richtung: 'grad', winkel: FEIN }][i] },

  /* 13–27 · die exakten Werte (Schlüssel) --------------------------------- */
  { von: 13, bis: 27, pruefart: 'term', schluessel: true, titel: i => [
      'Sinus im ersten Quadranten', 'Kosinus im ersten Quadranten',
      'Tangens im ersten Quadranten', 'Sinus und Kosinus bis 90°',
      'Sinus bis 180°', 'Kosinus bis 180°', 'Tangens bis 180°',
      'Sinus von 180° bis 360°', 'Kosinus von 180° bis 360°',
      'Tangens von 180° bis 360°', 'Sinus im ganzen Kreis',
      'Kosinus im ganzen Kreis', 'Tangens im ganzen Kreis',
      'Sinus und Kosinus im ganzen Kreis', 'Sinus, Kosinus und Tangens gemischt'][i],
    regel: i => [
      { art: 'trigWert', funktionen: ['sin'], winkel: GRUND },
      { art: 'trigWert', funktionen: ['cos'], winkel: GRUND },
      { art: 'trigWert', funktionen: ['tan'], winkel: GRUND },
      { art: 'trigWert', funktionen: ['sin', 'cos'], winkel: GRUND },
      { art: 'trigWert', funktionen: ['sin'], winkel: HALB },
      { art: 'trigWert', funktionen: ['cos'], winkel: HALB },
      { art: 'trigWert', funktionen: ['tan'], winkel: HALB },
      { art: 'trigWert', funktionen: ['sin'], winkel: ZWEITE },
      { art: 'trigWert', funktionen: ['cos'], winkel: ZWEITE },
      { art: 'trigWert', funktionen: ['tan'], winkel: ZWEITE },
      { art: 'trigWert', funktionen: ['sin'], winkel: VOLL },
      { art: 'trigWert', funktionen: ['cos'], winkel: VOLL },
      { art: 'trigWert', funktionen: ['tan'], winkel: VOLL },
      { art: 'trigWert', funktionen: ['sin', 'cos'], winkel: VOLL },
      { art: 'trigWert', funktionen: ['sin', 'cos', 'tan'], winkel: VOLL }][i] },

  /* 28–30 · die Umkehrung (Schlüssel) ------------------------------------- */
  { von: 28, bis: 30, pruefart: 'zahl', schluessel: true, titel: i => [
      'Welcher Winkel? Sinus', 'Welcher Winkel? Kosinus',
      'Welcher Winkel? Alle drei'][i],
    regel: i => [
      { art: 'trigWinkelGesucht', funktionen: ['sin'], winkel: GRUND },
      { art: 'trigWinkelGesucht', funktionen: ['cos'], winkel: GRUND },
      { art: 'trigWinkelGesucht', funktionen: ['sin', 'cos', 'tan'], winkel: GRUND }][i] },

  /* 31–40 · Pythagoras ---------------------------------------------------- */
  { von: 31, bis: 40, pruefart: 'zahl', titel: i => [
      'Hypotenuse im 3-4-5-Dreieck', 'Hypotenuse im 5-12-13-Dreieck',
      'Hypotenuse: 8-15-17 und 7-24-25', 'Hypotenuse in allen Grundtripeln',
      'Kathete im 3-4-5-Dreieck', 'Kathete im 5-12-13-Dreieck',
      'Kathete: 8-15-17 und 20-21-29', 'Kathete in allen Grundtripeln',
      'Diagonale im Rechteck', 'Pythagoras gemischt'][i],
    regel: i => [
      { art: 'trigPythagoras', gesucht: 'c', tripel: [[3, 4, 5]], faktor: [1, 10] },
      { art: 'trigPythagoras', gesucht: 'c', tripel: [[5, 12, 13]], faktor: [1, 8] },
      { art: 'trigPythagoras', gesucht: 'c', tripel: [[8, 15, 17], [7, 24, 25]], faktor: [1, 5] },
      { art: 'trigPythagoras', gesucht: 'c',
        tripel: [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]], faktor: [1, 3] },
      { art: 'gemischt', regeln: [
        { art: 'trigPythagoras', gesucht: 'a', tripel: [[3, 4, 5]], faktor: [1, 10] },
        { art: 'trigPythagoras', gesucht: 'b', tripel: [[3, 4, 5]], faktor: [1, 10] }] },
      { art: 'gemischt', regeln: [
        { art: 'trigPythagoras', gesucht: 'a', tripel: [[5, 12, 13]], faktor: [1, 8] },
        { art: 'trigPythagoras', gesucht: 'b', tripel: [[5, 12, 13]], faktor: [1, 8] }] },
      { art: 'gemischt', regeln: [
        { art: 'trigPythagoras', gesucht: 'a', tripel: [[8, 15, 17], [20, 21, 29]], faktor: [1, 4] },
        { art: 'trigPythagoras', gesucht: 'b', tripel: [[8, 15, 17], [20, 21, 29]], faktor: [1, 4] }] },
      { art: 'gemischt', regeln: [
        { art: 'trigPythagoras', gesucht: 'a',
          tripel: [[3, 4, 5], [5, 12, 13], [7, 24, 25]], faktor: [1, 3] },
        { art: 'trigPythagoras', gesucht: 'b',
          tripel: [[8, 15, 17], [20, 21, 29]], faktor: [1, 3] }] },
      { art: 'trigFigur', figur: 'rechteck',
        tripel: [[3, 4, 5], [5, 12, 13], [8, 15, 17]], faktor: [1, 4] },
      { art: 'gemischt', regeln: [
        { art: 'trigPythagoras', gesucht: 'c', tripel: [[3, 4, 5], [5, 12, 13]], faktor: [1, 4] },
        { art: 'trigPythagoras', gesucht: 'a', tripel: [[8, 15, 17], [7, 24, 25]], faktor: [1, 3] },
        { art: 'trigFigur', figur: 'rechteck', tripel: [[20, 21, 29]], faktor: [1, 3] }] }][i] },

  /* 41–42 · Pythagoras mit Wurzel ----------------------------------------- */
  { von: 41, bis: 42, pruefart: 'term', titel: i => [
      'Diagonale im Quadrat', 'Höhe im gleichseitigen Dreieck'][i],
    regel: i => [
      { art: 'trigFigur', figur: 'quadrat', a: [2, 12] },
      { art: 'trigFigur', figur: 'gleichseitig', a: [2, 20] }][i] },

  /* 43 · die Grundbeziehung ----------------------------------------------- */
  { von: 43, bis: 43, pruefart: 'zahl', titel: () => 'Sinus und Kosinus im Quadrat',
    regel: () => ({ art: 'trigBeziehung', gruppe: 'grundbeziehung' }) },

  /* 44–50 · Beziehungen --------------------------------------------------- */
  { von: 44, bis: 50, pruefart: 'term', titel: i => [
      'Tangens als Quotient', 'Beziehungen zwischen sin, cos und tan',
      'Winkel jenseits von 0° und 360°', 'Rechnen mit Winkelwerten',
      'Zusammengesetzte Winkel', 'Beziehungen gemischt', 'Winkelwerte gemischt'][i],
    regel: i => [
      { art: 'trigWert', form: 'quotient', funktionen: ['tan'],
        winkel: [0, 30, 45, 60, 120, 135, 150, 180, 210, 225, 300, 315] },
      { art: 'trigBeziehung', gruppe: 'symbolisch' },
      { art: 'trigBeziehung', gruppe: 'aussenwinkel' },
      { art: 'trigBeziehung', gruppe: 'rechnen' },
      { art: 'trigBeziehung', gruppe: 'zusammengesetzt' },
      { art: 'gemischt', regeln: [
        { art: 'trigBeziehung', gruppe: 'grundbeziehung' },
        { art: 'trigBeziehung', gruppe: 'symbolisch' }] },
      { art: 'gemischt', regeln: [
        { art: 'trigBeziehung', gruppe: 'rechnen' },
        { art: 'trigBeziehung', gruppe: 'aussenwinkel' },
        { art: 'trigBeziehung', gruppe: 'zusammengesetzt' }] }][i] },

  /* 51–52 · Amplitude ----------------------------------------------------- */
  { von: 51, bis: 52, pruefart: 'zahl', titel: i => [
      'Amplitude ablesen', 'Amplitude mit Verschiebung'][i],
    regel: i => [
      { art: 'trigKurve', groesse: 'amplitude', fun: 'sin', a: [2, 9], b: [1, 4] },
      { art: 'trigKurve', groesse: 'amplitude', fun: 'cos', a: [2, 9], b: [1, 3], c: [1, 5] }][i] },

  /* 53–56 · Periode ------------------------------------------------------- */
  { von: 53, bis: 56, pruefart: 'term', titel: i => [
      'Periode von sin(bx)', 'Periode von cos(bx)',
      'Periode von sin(x/k)', 'Periode des Tangens'][i],
    regel: i => [
      { art: 'trigKurve', groesse: 'periode', fun: 'sin', a: [1, 1], b: [1, 6] },
      { art: 'trigKurve', groesse: 'periode', fun: 'cos', a: [2, 4], b: [1, 6] },
      { art: 'trigKurve', groesse: 'periode', fun: 'sin', a: [1, 3], b: [2, 5], bBruch: true },
      { art: 'trigKurve', groesse: 'periode', fun: 'tan', a: [1, 3], b: [1, 6] }][i] },

  /* 57–58 · größter und kleinster Wert ------------------------------------ */
  { von: 57, bis: 58, pruefart: 'zahl', titel: i => [
      'Größter Wert der Kurve', 'Kleinster Wert der Kurve'][i],
    regel: i => [
      { art: 'trigKurve', groesse: 'max', fun: 'sin', a: [1, 5], b: [1, 3], c: [1, 6] },
      { art: 'trigKurve', groesse: 'min', fun: 'cos', a: [1, 5], b: [1, 3], c: [1, 6] }][i] },

  /* 59–68 · Fakultät und Binomialkoeffizient ------------------------------ */
  { von: 59, bis: 68, pruefart: 'zahl', titel: i => [
      'Fakultät bis 6!', 'Reihenfolgen zählen', 'Fakultäten kürzen',
      'Binomialkoeffizient: die Randfälle', 'Zwei aus n wählen',
      'Drei aus n wählen', 'Binomialkoeffizient bis n = 8',
      'Symmetrie im Pascalschen Dreieck', 'Binomialkoeffizient gemischt',
      'Fakultät und Binomialkoeffizient'][i],
    regel: i => [
      { art: 'stochFakultaet', form: 'fakultaet', n: [0, 6] },
      { art: 'stochFakultaet', form: 'reihenfolgen', n: [2, 8] },
      { art: 'stochFakultaet', form: 'kuerzen', n: [3, 9], d: [1, 2] },
      { art: 'stochBinom', n: [3, 10], kRand: true },
      { art: 'stochBinom', n: [3, 12], k: [2, 2] },
      { art: 'stochBinom', n: [4, 10], k: [3, 3] },
      { art: 'stochBinom', n: [4, 8], kAlle: true },
      { art: 'stochBinom', n: [6, 10], kSpiegel: [2, 3] },
      { art: 'gemischt', regeln: [
        { art: 'stochBinom', n: [3, 12], k: [2, 2] },
        { art: 'stochBinom', n: [4, 10], k: [3, 3] },
        { art: 'stochBinom', n: [6, 10], kSpiegel: [2, 3] }] },
      { art: 'gemischt', regeln: [
        { art: 'stochFakultaet', form: 'fakultaet', n: [0, 7] },
        { art: 'stochFakultaet', form: 'kuerzen', n: [4, 8], d: [1, 2] },
        { art: 'stochBinom', n: [4, 9], k: [2, 3] }] }][i] },

  /* 69–80 · Laplace und Gegenereignis (Schlüssel) ------------------------- */
  { von: 69, bis: 80, pruefart: 'term', schluessel: true, titel: i => [
      'Würfel: einfache Ereignisse', 'Würfel: Gegenereignis', 'Glücksrad',
      'Zahlen ziehen', 'Würfel mit mehr Seiten', 'Urne mit zwei Farben',
      'Urne: Gegenereignis', 'Urne mit drei Farben', 'Skatblatt mit 32 Karten',
      'Karten: 32er- und 52er-Blatt', 'Gegenwahrscheinlichkeit',
      'Laplace gemischt'][i],
    regel: i => [
      { art: 'stochLaplace', form: 'wuerfel', seiten: [6],
        ereignisse: ['1', '2', '3', '4', '5', '6', 'gerade', 'ungerade', 'primzahl', 'teilbar 3'] },
      { art: 'stochLaplace', form: 'wuerfel', seiten: [6],
        ereignisse: ['nicht 1', 'nicht 2', 'nicht 3', 'nicht 4', 'nicht 5', 'nicht 6',
                     '>4', '<3', '>=5', '<=2'] },
      { art: 'stochLaplace', form: 'rad', seiten: [6, 8, 10, 12],
        ereignisse: ['3', 'gerade', '>=5', 'teilbar 4'] },
      { art: 'stochLaplace', form: 'zahlen', seiten: [20, 30],
        ereignisse: ['teilbar 4', 'teilbar 5', 'primzahl', 'gerade', '>=15', '<=5'] },
      { art: 'stochLaplace', form: 'wuerfel', seiten: [8, 10, 12, 20],
        ereignisse: ['1', 'gerade', '>=5', 'teilbar 4'] },
      { art: 'stochUrne', rot: [1, 5], blau: [2, 6] },
      { art: 'stochUrne', rot: [2, 4], blau: [3, 5], gegen: true },
      { art: 'stochUrne', rot: [1, 3], blau: [2, 4], gruen: [3, 5] },
      { art: 'stochKarten', blaetter: [32],
        ereignisse: ['ass', 'koenig', 'zehn', 'herz', 'rot', 'bild', 'kein ass'] },
      { art: 'stochKarten', blaetter: [32, 52],
        ereignisse: ['ass', 'koenig', 'zehn', 'herz', 'rot', 'bild', 'kein ass'] },
      { art: 'stochGegen', n: [3, 12], z: [1, 11] },
      { art: 'gemischt', regeln: [
        { art: 'stochLaplace', form: 'wuerfel', seiten: [6],
          ereignisse: ['6', 'gerade', 'primzahl', 'nicht 6', '>4'] },
        { art: 'stochUrne', rot: [2, 4], blau: [3, 5] },
        { art: 'stochKarten', blaetter: [32], ereignisse: ['ass', 'herz', 'bild'] }] }][i] },

  /* 81–90 · zwei Stufen --------------------------------------------------- */
  { von: 81, bis: 90, pruefart: 'term', titel: i => [
      'Mehrmals dieselbe Zahl', 'Zwei und drei Würfe: kein Treffer',
      'Mindestens ein Treffer', 'Augensumme bei zwei Würfeln',
      'Münzwürfe: genau k mal Kopf', 'Münzwürfe: mindestens einmal Kopf',
      'Urne mit Zurücklegen', 'Urne ohne Zurücklegen', 'Je einmal ziehen',
      'Zwei Stufen gemischt'][i],
    regel: i => [
      { art: 'gemischt', regeln: [
        { art: 'stochZwei', form: 'zweimal', z: [1, 6], wuerfe: [2, 3] },
        { art: 'stochZwei', form: 'gleich' }] },
      { art: 'stochZwei', form: 'keine', z: [1, 6], wuerfe: [2, 3] },
      { art: 'stochZwei', form: 'mind', z: [1, 6], wuerfe: [2, 3] },
      { art: 'gemischt', regeln: [
        { art: 'stochZwei', form: 'summe', s: [2, 12] },
        { art: 'stochZwei', form: 'summeMin', s: [8, 12] }] },
      { art: 'stochZwei', form: 'muenzeGenau', n: [2, 4] },
      { art: 'gemischt', regeln: [
        { art: 'stochZwei', form: 'muenzeMind', n: [2, 6] },
        { art: 'stochZwei', form: 'muenzeKein', n: [2, 6] }] },
      { art: 'stochZwei', form: 'urneZwei', zurueck: true, rot: [2, 4], blau: [3, 5] },
      { art: 'stochZwei', form: 'urneZwei', zurueck: false, rot: [2, 4], blau: [3, 5] },
      { art: 'gemischt', regeln: [
        { art: 'stochZwei', form: 'urneZwei', zurueck: true, wahl: 'je', rot: [2, 4], blau: [3, 5] },
        { art: 'stochZwei', form: 'urneZwei', zurueck: false, wahl: 'je', rot: [2, 4], blau: [3, 5] }] },
      { art: 'gemischt', regeln: [
        { art: 'stochZwei', form: 'mind', z: [1, 6], wuerfe: [2, 2] },
        { art: 'stochZwei', form: 'summe', s: [5, 9] },
        { art: 'stochZwei', form: 'muenzeGenau', n: [3, 3] },
        { art: 'stochZwei', form: 'urneZwei', zurueck: false, rot: [2, 3], blau: [3, 4] }] }][i] },

  /* 91–100 · Lagemaße und Erwartungswert ---------------------------------- */
  { von: 91, bis: 100, pruefart: 'zahl', titel: i => [
      'Arithmetisches Mittel', 'Mittel von vier Werten',
      'Median bei ungerader Anzahl', 'Median bei gerader Anzahl',
      'Modalwert', 'Spannweite', 'Erwartungswert beim Würfel',
      'Erwartungswert einfacher Spiele', 'Mittel und Median gemischt',
      'Lagemaße und Erwartungswert'][i],
    regel: i => [
      /* Die Abstände sind absichtlich unsymmetrisch: Bei `2, 5, 8` wären
         Mittel und Median dieselbe Zahl, und wer den Median bildet, käme
         beim Mittel unbemerkt durch. */
      { art: 'stochLage', groesse: 'mittel', muster: [0, 1, 5], a: [1, 20] },
      { art: 'gemischt', regeln: [
        { art: 'stochLage', groesse: 'mittel', muster: [0, 1, 2, 5], a: [1, 20] },
        { art: 'stochLage', groesse: 'mittel', muster: [0, 2, 3, 7], a: [1, 20] }] },
      { art: 'stochLage', groesse: 'median', muster: [4, 0, 1], a: [1, 20] },
      { art: 'stochLage', groesse: 'median', muster: [1, 4, 0, 2], a: [1, 20] },
      { art: 'stochLage', groesse: 'modus', muster: [0, 2, 0, 5], a: [1, 20] },
      { art: 'gemischt', regeln: [
        { art: 'stochLage', groesse: 'spanne', muster: [0, 7, 3], a: [1, 15] },
        { art: 'stochLage', groesse: 'spanne', muster: [2, 0, 11], a: [1, 15] },
        { art: 'stochLage', groesse: 'spanne', muster: [0, 9, 4], a: [1, 15] }] },
      { art: 'gemischt', regeln: [
        { art: 'stochErwartung', form: 'wuerfel', seiten: [4, 6, 8, 10, 12, 20] },
        { art: 'stochErwartung', form: 'summe', anzahl: [2, 4] }] },
      { art: 'stochErwartung', form: 'spiel', n: [2, 6], z: [1, 5], g: [4, 24] },
      { art: 'gemischt', regeln: [
        { art: 'stochLage', groesse: 'mittel', muster: [0, 1, 5], a: [1, 15] },
        { art: 'stochLage', groesse: 'median', muster: [4, 0, 1], a: [1, 15] }] },
      { art: 'gemischt', regeln: [
        { art: 'stochLage', groesse: 'modus', muster: [0, 2, 0, 5], a: [1, 12] },
        { art: 'stochLage', groesse: 'spanne', muster: [0, 7, 3], a: [1, 12] },
        { art: 'stochErwartung', form: 'wuerfel', seiten: [4, 6, 8, 10, 12, 20] }] }][i] }
];

/** Voraussetzung: Wo hakt es wahrscheinlich, wenn dieses Set nicht gelingt?
 *  Die Angabe steuert nur einen Hinweis, nie eine Sperre. */
const VORAUSSETZUNG = nr =>
    nr >= 91 ? 69                      // Lagemaße       ← Laplace
  : nr >= 81 ? 69                      // zwei Stufen    ← Laplace
  : nr >= 69 ? null
  : nr >= 59 ? null
  : nr >= 51 && nr <= 58 ? 1           // Sinuskurve     ← Grad in Bogenmaß
  : nr >= 43 && nr <= 50 ? 13          // Beziehungen    ← exakte Werte
  : nr >= 31 && nr <= 42 ? null
  : nr >= 28 && nr <= 30 ? 13          // Umkehrung      ← exakte Werte
  : nr >= 13 && nr <= 27 ? null
  : nr >= 8 && nr <= 12 ? 1            // Rückrichtung   ← Grad in Bogenmaß
  : null;

export const SETS_B5 = (() => {
  const sets = [];
  BLOECKE.forEach(block => {
    for (let nr = block.von; nr <= block.bis; nr++) {
      const i = nr - block.von;
      sets.push({
        nr,
        titel: block.titel(i),
        aufgaben: 10,
        pruefart: block.pruefart || 'zahl',
        schluessel: !!block.schluessel,
        voraussetzung: VORAUSSETZUNG(nr),
        regel: block.regel(i)
      });
    }
  });
  return sets;
})();
