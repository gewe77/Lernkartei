/* =========================================================================
   HAN CROCO — Mathematik, Termrechner
   -------------------------------------------------------------------------
   Der heikelste Teil des Vorhabens: `3x²` lässt sich auf ein Dutzend Arten
   schreiben, und keine davon darf als Fehler zählen.

   Kein Computeralgebrasystem. Was hier steht, ist ein enger Rechner für
   genau die Formen, die in den Bereichen 4 bis 6 vorkommen:

     Zahlen und Brüche      7   3/4   0,25   -2/3
     Potenzen von x         3x^2   3x²   x³/3   (1/3)x^3   -2x^-3
     Wurzeln                √3/2   √2/2   2√3   √9 → 3
     Kreiszahl              π/6   2π   π
     Funktionen             e^(2x)   sin(3x)   cos x   tan x   ln|x|
     Integrationskonstante  x³/3 + C     (erlaubt, nicht verlangt)

   Vergleichen heißt: BEIDE Seiten durch dieselbe Kanonisierung schicken und
   die Ergebnisse vergleichen. Das ist kürzer und sicherer als zwei getrennte
   Wege — aber es hat eine Schwachstelle: Ein Fehler in der Kanonisierung
   könnte zwei verschiedene Dinge gleich machen. Deshalb prüft die Prüfliste
   nicht nur, was gleich sein MUSS, sondern ausdrücklich auch, was
   verschieden bleiben muss.

   Wichtigste Regel: Was der Rechner nicht versteht, ist KEIN Fehler.
   `kanonisch()` liefert dann null, und die Oberfläche sagt „Schreibweise
   nicht erkannt“, statt einen Fehler zu zählen. Eine Notationsmarotte darf
   nie einen Lauf kosten.
   ========================================================================= */

/* --- Brüche -------------------------------------------------------------- */

function ggt(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }

/** Bruch als [Zähler, Nenner], gekürzt, Nenner immer positiv. */
export function br(z, n = 1) {
  if (!Number.isFinite(z) || !Number.isFinite(n) || n === 0) return null;
  if (!Number.isInteger(z) || !Number.isInteger(n)) {
    // Dezimalzahlen in Brüche: 0,25 → 1/4. Drei Nachkommastellen reichen für
    // alles, was hier vorkommt; mehr wäre ohnehin keine Kopfrechnung.
    const f = 1000000;
    const zz = Math.round(z * f), nn = Math.round(n * f);
    if (!Number.isSafeInteger(zz) || !Number.isSafeInteger(nn) || nn === 0) return null;
    return br(zz, nn);
  }
  const g = ggt(z, n);
  const s = n < 0 ? -1 : 1;
  return [s * z / g, s * n / g];
}
const brPlus  = (a, b) => br(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const brMal   = (a, b) => br(a[0] * b[0], a[1] * b[1]);
const brDurch = (a, b) => (b[0] === 0 ? null : br(a[0] * b[1], a[1] * b[0]));
const brNull  = a => a[0] === 0;
const brEins  = a => a[0] === a[1];
const brGanz  = a => (a[1] === 1 ? a[0] : null);

/* --- Zerlegen in Wortteile ---------------------------------------------- */

const FUNKTIONEN = ['sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'wurzel'];

function teilen(text) {
  const s = String(text)
    .replace(/\s+/g, '')
    .replace(/[·×∙*]/g, '*')
    .replace(/[−–—]/g, '-')
    .replace(/[÷]/g, '/')
    .replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4')
    .replace(/½/g, '(1/2)').replace(/⅓/g, '(1/3)').replace(/¼/g, '(1/4)')
    .replace(/⅔/g, '(2/3)').replace(/¾/g, '(3/4)')
    .replace(/,/g, '.')
    .replace(/√/g, 'sqrt')
    .replace(/π/gi, 'pi')
    .replace(/\[|\{/g, '(').replace(/\]|\}/g, ')');

  const teile = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s[i + 1] || ''))) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const roh = s.slice(i, j);
      if ((roh.match(/\./g) || []).length > 1) return null;
      teile.push({ art: 'zahl', wert: Number(roh) });
      i = j; continue;
    }
    if (/[a-z]/i.test(c)) {
      let j = i;
      while (j < s.length && /[a-z]/i.test(s[j])) j++;
      let wort = s.slice(i, j);
      /* Buchstaben ohne Trenner: „2xe" ist keine Funktion, sondern x mal e.
         Deshalb erst auf Funktionsnamen prüfen, dann Buchstabe für
         Buchstabe zerlegen. */
      while (wort.length) {
        const f = FUNKTIONEN.find(n => wort.toLowerCase().startsWith(n));
        if (f) { teile.push({ art: 'fun', wert: f }); wort = wort.slice(f.length); continue; }
        if (wort.toLowerCase().startsWith('pi')) { teile.push({ art: 'name', wert: 'pi' }); wort = wort.slice(2); continue; }
        const b = wort[0];
        if (!/[xeC]/.test(b)) return null;          // andere Buchstaben gibt es hier nicht
        teile.push({ art: 'name', wert: b === 'C' ? 'C' : b.toLowerCase() });
        wort = wort.slice(1);
      }
      i = j; continue;
    }
    if ('+-*/^()|'.includes(c)) { teile.push({ art: 'op', wert: c }); i++; continue; }
    return null;                                     // unbekanntes Zeichen
  }
  return teile;
}

/* --- Normalform ----------------------------------------------------------
   Eine Summe ist eine Abbildung „Produktschlüssel → Koeffizient".
   Der Schlüssel ist die sortierte Liste der nicht-zahligen Faktoren,
   z. B. `x^2`, `pi`, `sin(3*x)`, `sqrt(3)`. Der leere Schlüssel ist die
   reine Zahl.
   ------------------------------------------------------------------------- */

const SUMME_LEER = () => new Map();
const summeZahl = b => { const m = new Map(); if (!brNull(b)) m.set('', b); return m; };
const summeAtom = (schl, b) => { const m = new Map(); if (!brNull(b)) m.set(schl, b); return m; };

function summePlus(a, b) {
  const m = new Map(a);
  for (const [k, v] of b) {
    const alt = m.get(k);
    const neu = alt ? brPlus(alt, v) : v;
    if (!neu) return null;
    if (brNull(neu)) m.delete(k); else m.set(k, neu);
  }
  return m;
}
const summeMinus = (a, b) => summePlus(a, summeSkalar(b, br(-1)));
function summeSkalar(a, f) {
  const m = new Map();
  for (const [k, v] of a) { const n = brMal(v, f); if (!n) return null; if (!brNull(n)) m.set(k, n); }
  return m;
}

/* Trennzeichen für Produktschlüssel. Sie dürfen NICHT in einem Atomnamen
   vorkommen — und Atomnamen enthalten den kanonisierten Ausdruck ihres
   Arguments, also Sterne, Pluszeichen, Klammern und Dachzeichen. Vorher
   standen hier `*` und `^`; damit zerbrach `sin(1*x)` beim Zerlegen in seine
   Teile, und `sin(cos x)` wurde mit `cos(sin x)` verwechselt — eine falsche
   Antwort hätte als richtig gegolten. Steuerzeichen kommen in keiner
   Eingabe vor, weil `teilen()` alles Unbekannte ablehnt. */
const F_TRENN = '\u0001';    // zwischen zwei Faktoren
const E_TRENN = '\u0002';    // zwischen Basis und Exponent
const S_TRENN = '\u0003';    // zwischen zwei Summanden
const FLUCHT  = '\u0004';    // Fluchtzeichen

/* Ein Atomname trägt den kanonisierten Ausdruck seines Arguments in sich —
   `sin(…)` enthält also selbst wieder Trennzeichen. Würde man den Schlüssel
   danach zerlegen, zerbräche der Name, und `sin(cos x)` wäre nicht mehr von
   `cos(sin x)` zu unterscheiden. Beim EINBETTEN werden die Trennzeichen
   deshalb maskiert; das ist umkehrbar und verschachtelt sich sauber. */
const einbetten = t => String(t).replace(/[\u0001\u0002\u0003\u0004]/g,
  c => FLUCHT + String.fromCharCode(c.charCodeAt(0) + 0x40));

/** Produktschlüssel: „x²·π" — sortiert, damit x·π und π·x gleich sind. */
function schluesselMal(a, b) {
  const teil = s => (s ? s.split(F_TRENN) : []);
  const zaehl = new Map();
  const nimm = s => teil(s).forEach(f => {
    const i = f.lastIndexOf(E_TRENN);
    const basis = i < 0 ? f : f.slice(0, i);
    const roh = i < 0 ? '1' : f.slice(i + 1);
    const exp = roh.includes('/') ? Number(roh.split('/')[0]) / Number(roh.split('/')[1]) : Number(roh);
    zaehl.set(basis, (zaehl.get(basis) || 0) + exp);
  });
  nimm(a); nimm(b);
  const teile = [];
  for (const [basis, exp] of [...zaehl].sort((p, q) => p[0] < q[0] ? -1 : 1)) {
    if (exp === 0) continue;
    teile.push(exp === 1 ? basis : basis + E_TRENN + exp);
  }
  return teile.join(F_TRENN);
}

function summeMal(a, b) {
  const m = new Map();
  for (const [ka, va] of a) for (const [kb, vb] of b) {
    const k = schluesselMal(ka, kb);
    const v = brMal(va, vb);
    if (!v) return null;
    const alt = m.get(k);
    const neu = alt ? brPlus(alt, v) : v;
    if (!neu) return null;
    if (brNull(neu)) m.delete(k); else m.set(k, neu);
  }
  return m;
}

/** Teilen ist nur durch ein EINZELNES Glied erlaubt — mehr kommt in diesen
 *  Aufgaben nicht vor, und alles andere wäre geraten. */
function summeDurch(a, b) {
  if (b.size !== 1) return null;
  const [kb, vb] = [...b][0];
  if (brNull(vb)) return null;
  const kehr = schluesselKehr(kb);
  const m = new Map();
  for (const [ka, va] of a) {
    const v = brDurch(va, vb);
    if (!v) return null;
    const k = schluesselMal(ka, kehr);
    m.set(k, brPlus(m.get(k) || br(0), v));
  }
  for (const [k, v] of [...m]) if (brNull(v)) m.delete(k);
  return m;
}

function schluesselKehr(s) {
  if (!s) return '';
  return s.split(F_TRENN).map(f => {
    const i = f.lastIndexOf(E_TRENN);
    return i < 0 ? f + E_TRENN + '-1' : f.slice(0, i) + E_TRENN + (-Number(f.slice(i + 1)));
  }).join(F_TRENN);
}

/* Über dieser Grenze wird nicht mehr gerechnet, sondern abgelehnt. `x^99999`
   brauchte 155 ms, `x^9999999` über zehn Sekunden, und mit dreißig Ziffern
   stand der Reiter. Niemand rechnet so etwas im Kopf — die Eingabe gilt
   deshalb als „Schreibweise nicht erkannt", nicht als Fehler. */
const HOCH_MAX = 64;

function summeHoch(a, n) {
  if (!Number.isInteger(n)) return null;
  if (Math.abs(n) > HOCH_MAX) return null;
  if (n === 0) return summeZahl(br(1));
  if (n < 0) return summeDurch(summeZahl(br(1)), summeHoch(a, -n));
  let r = summeZahl(br(1));
  for (let i = 0; i < n; i++) { r = summeMal(r, a); if (!r) return null; }
  return r;
}

/* --- Zerteiler (recursive descent) --------------------------------------- */

function zerteilen(teile) {
  let p = 0;
  const schau = () => teile[p];
  const istOp = z => schau()?.art === 'op' && schau().wert === z;

  function ausdruck() {
    let links = produkt();
    if (!links) return null;
    while (istOp('+') || istOp('-')) {
      const op = teile[p++].wert;
      const rechts = produkt();
      if (!rechts) return null;
      links = op === '+' ? summePlus(links, rechts) : summeMinus(links, rechts);
      if (!links) return null;
    }
    return links;
  }

  /* Das Argument einer klammerlosen Funktion reicht bis zum nächsten + oder −
     bzw. bis zur schließenden Klammer — aber nicht über ein / hinaus, damit
     `tan x/2` als (tan x)/2 gelesen wird. */
  function produktOhneKlammer() {
    let links = vorzeichen();
    if (!links) return null;
    for (;;) {
      const n = schau();
      if (istOp('*')) { p++; const r = vorzeichen(); if (!r) return null;
        links = summeMal(links, r); if (!links) return null; continue; }
      if (n && (n.art === 'zahl' || n.art === 'name' || n.art === 'fun')) {
        const r = vorzeichen(); if (!r) return null;
        links = summeMal(links, r); if (!links) return null; continue;
      }
      return links;
    }
  }

  function produkt() {
    let links = vorzeichen();
    if (!links) return null;
    for (;;) {
      if (istOp('*') || istOp('/')) {
        const op = teile[p++].wert;
        const rechts = vorzeichen();
        if (!rechts) return null;
        links = op === '*' ? summeMal(links, rechts) : summeDurch(links, rechts);
        if (!links) return null;
        continue;
      }
      // Unsichtbares Mal: 3x, 2(x+1), x sin(x)
      const n = schau();
      if (n && (n.art === 'zahl' || n.art === 'name' || n.art === 'fun' ||
                (n.art === 'op' && n.wert === '('))) {
        const rechts = vorzeichen();
        if (!rechts) return null;
        links = summeMal(links, rechts);
        if (!links) return null;
        continue;
      }
      return links;
    }
  }

  /* Das Vorzeichen bindet LOCKERER als die Potenz: `-x^2` ist `-(x^2)`,
     nicht `(-x)^2`. Vorher stand es andersherum — dabei kanonisierte `-x^2`
     zu `+x^2`, und eine falsche Antwort wäre als richtig durchgegangen.
     Gefunden beim Bau von Bereich 6. */
  function potenz() {
    const basis = grundwert();
    if (!basis) return null;
    if (!istOp('^')) return basis;
    p++;
    const exp = vorzeichen();
    if (!exp) return null;
    if (exp.size > 1) return null;
    const [k, v] = exp.size ? [...exp][0] : ['', br(0)];
    if (k !== '') return exponentAufAtom(basis, exp);
    const ganz = brGanz(v);
    if (ganz === null) return null;
    return summeHoch(basis, ganz);
  }

  /* e hoch etwas Nicht-Zahligem wird zu einem eigenen Atom: e^(2x). */
  function exponentAufAtom(basis, exp) {
    if (basis.size !== 1) return null;
    const [kb, vb] = [...basis][0];
    if (kb !== 'e' || !brEins(vb)) return null;
    return summeAtom(`exp(${einbetten(zeichnen(exp))})`, br(1));
  }

  function vorzeichen() {
    if (istOp('-')) { p++; const w = vorzeichen(); return w ? summeSkalar(w, br(-1)) : null; }
    if (istOp('+')) { p++; return vorzeichen(); }
    return potenz();
  }

  function grundwert() {
    const z = schau();
    if (!z) return null;
    if (z.art === 'zahl') { p++; return summeZahl(br(z.wert)); }
    if (z.art === 'name') {
      p++;
      if (z.wert === 'pi') return summeAtom('pi', br(1));
      if (z.wert === 'x')  return summeAtom('x', br(1));
      if (z.wert === 'e')  return summeAtom('e', br(1));
      if (z.wert === 'C')  return summeAtom('C', br(1));
      return null;
    }
    if (z.art === 'fun') {
      p++;
      const name = z.wert === 'wurzel' ? 'sqrt' : z.wert;
      let arg;
      if (istOp('(')) { p++; arg = ausdruck(); if (!arg || !istOp(')')) return null; p++; }
      else if (name === 'ln' && istOp('|')) { p++; arg = ausdruck(); if (!arg || !istOp('|')) return null; p++; }
      else {
        /* Funktion ohne Klammer: `sin 3x` meint sin(3x), nicht sin(3)·x.
           Vorher wurde nur die nächste Potenz genommen — die App schreibt
           ihre eigenen Lösungen aber ohne Klammer („7cos x"), lud also zu
           einer Schreibweise ein, die sie selbst als Fehler wertete.
           Ausnahme: die Wurzel bindet eng (√3/2 ist (√3)/2). */
        arg = name === 'sqrt' ? potenz() : produktOhneKlammer();
      }
      if (!arg) return null;
      if (name === 'sqrt') return wurzelAuflösen(arg);
      return summeAtom(`${name}(${einbetten(zeichnen(arg))})`, br(1));
    }
    if (z.art === 'op' && z.wert === '(') {
      p++;
      const a = ausdruck();
      if (!a || !istOp(')')) return null;
      p++;
      return a;
    }
    if (z.art === 'op' && z.wert === '|') {          // Betragsstriche ohne ln
      p++;
      const a = ausdruck();
      if (!a || !istOp('|')) return null;
      p++;
      return a;
    }
    return null;
  }

  const ergebnis = ausdruck();
  return p === teile.length ? rationalisieren(ergebnis) : null;
}

/* `1/√3` und `√3/3` sind dieselbe Zahl — ohne diesen Schritt wären es zwei
   verschiedene Antworten, und `tan 30°` hätte je nach Schreibweise gestimmt
   oder nicht. Wurzeln wandern deshalb aus dem Nenner nach oben. */
function rationalisieren(summe) {
  if (!summe) return summe;
  const m = new Map();
  for (const [k, v] of summe) {
    let koeff = v;
    const teile = k ? k.split(F_TRENN) : [];
    const neu = [];
    for (const f of teile) {
      const t = f.match(new RegExp('^sqrt\\((\\d+)\\)' + E_TRENN + '-(\\d+)$'));
      if (!t) { neu.push(f); continue; }
      const n = Number(t[1]), e = Number(t[2]);
      // √n^-e  =  √n^(e mod 2) / n^ceil(e/2)
      koeff = brDurch(koeff, br(Math.pow(n, Math.ceil(e / 2))));
      if (!koeff) return summe;
      if (e % 2 === 1) neu.push(`sqrt(${n})`);
    }
    const schl = neu.sort().join(F_TRENN);
    const alt2 = m.get(schl);
    const summe2 = alt2 ? brPlus(alt2, koeff) : koeff;
    if (!summe2) return summe;
    if (brNull(summe2)) m.delete(schl); else m.set(schl, summe2);
  }
  return m;
}

/** √9 → 3, √12 → 2√3, √x bleibt Atom. Ohne das Herausziehen wären √12 und
 *  2√3 zwei verschiedene Antworten, obwohl sie dieselbe Zahl sind. */
function wurzelAuflösen(arg) {
  if (arg.size === 1) {
    const [k, v] = [...arg][0];
    if (k === '' && v[1] === 1 && v[0] > 0) {
      let n = v[0], vorne = 1;
      for (let d = 2; d * d <= n; d++) while (n % (d * d) === 0) { n /= d * d; vorne *= d; }
      return n === 1 ? summeZahl(br(vorne)) : summeAtom(`sqrt(${n})`, br(vorne));
    }
  }
  return summeAtom(`sqrt(${einbetten(zeichnen(arg))})`, br(1));
}

/* --- Ausgabe ------------------------------------------------------------- */

function zeichnen(summe) {
  if (!summe || !summe.size) return '0';
  const teile = [...summe].sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  return teile.map(([k, v]) => {
    const koeff = v[1] === 1 ? String(v[0]) : `${v[0]}/${v[1]}`;
    return k ? koeff + F_TRENN + k : koeff;
  }).join(S_TRENN);
}

/* --- Öffentliche Schnittstelle ------------------------------------------- */

/**
 * Kanonische Form eines Terms — oder null, wenn er nicht verstanden wurde.
 * `null` heißt ausdrücklich NICHT „falsch", sondern „nicht erkannt".
 */
export function kanonisch(text) {
  const roh = String(text ?? '').trim();
  if (!roh) return null;
  // Ein führendes „f'(x) =" oder „= " wegnehmen, das schreiben viele mit.
  /* Ein führendes „f'(x) =" wegnehmen — aber nur, wenn davor wirklich ein
     Bezeichner steht und keine Rechnung. `2x=3` ist eine Gleichung, keine
     Beschriftung, und wurde vorher zu `3` verkürzt. */
  const ohneKopf = roh.replace(/^\s*([A-Za-zΔ]'{0,2}(\([a-z]\))?)?\s*=\s*/, '');
  const teile = teilen(ohneKopf);
  if (!teile || !teile.length) return null;
  const summe = zerteilen(teile);
  if (!summe) return null;
  return zeichnen(summe);
}

/**
 * Vergleich zweier Terme. Die Integrationskonstante ist erlaubt, aber nicht
 * verlangt: `x^3/3` und `x^3/3 + C` gelten beide.
 * Liefert true/false — oder null, wenn die Eingabe nicht lesbar war.
 */
export function termStimmt(eingabe, erwartet) {
  const a = kanonisch(eingabe);
  if (a === null) return null;
  const b = kanonisch(erwartet);
  if (b === null) return false;
  if (a === b) return true;
  return ohneKonstante(a) === ohneKonstante(b);
}

/** Entfernt genau ein „+ C" aus der kanonischen Form. */
function ohneKonstante(kanon) {
  const cMuster = new RegExp('^-?\\d+(/\\d+)?' + F_TRENN + 'C$');
  return kanon.split(S_TRENN).filter(t => !cMuster.test(t) && t !== 'C').join(S_TRENN) || '0';
}

/** Welche Zusatztasten braucht ein Satz erwarteter Antworten?
 *  Weil die Aufgaben erzeugt werden, ist das Antwortalphabet vorher bekannt —
 *  der Block bleibt damit klein genug für den Daumen. */
export function termTasten(antworten) {
  const t = new Set();
  antworten.forEach(a => {
    const s = String(a);
    if (/[x]/.test(s)) t.add('x');
    if (/\^|²|³/.test(s)) t.add('^');
    if (/\//.test(s)) t.add('/');
    if (/√|sqrt/.test(s)) t.add('√');
    if (/π|pi/i.test(s)) t.add('π');
    if (/-|−/.test(s)) t.add('−');
    if (/,|\./.test(s)) t.add(',');
    if (/\(/.test(s)) { t.add('('); t.add(')'); }
    /* Ohne `+` ließe sich `e^x+x e^x` nicht eintippen, ohne `|` kein
       `ln|x|`. Beides fehlte — gefunden beim Bau von Bereich 6. */
    if (/\+/.test(s)) t.add('+');
    if (/\|/.test(s)) t.add('|');
    /* Ohne Wortgrenze: Zwischen Ziffer und Buchstabe gibt es keine, also
       fand `\bcos` in „7cos x" nichts — zwölf Sets in Bereich 6 waren damit
       unspielbar, weil die c-, o- und s-Taste fehlten. */
    if (/e\^/.test(s)) t.add('e');
    if (/ln/.test(s)) t.add('ln');
    if (/sin/.test(s)) t.add('sin');
    if (/cos/.test(s)) t.add('cos');
    if (/tan/.test(s)) t.add('tan');
    if (/C/.test(s)) t.add('C');
    if (/\s/.test(s.trim())) t.add('␣');
  });
  const folge = ['+', '−', ',', 'x', '^', '/', '(', ')', '|', '√', 'π', 'e', 'ln', 'sin', 'cos', 'tan', 'C'];
  return folge.filter(z => t.has(z));
}
