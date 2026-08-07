/* =========================================================================
   HAN CROCO — Bereich 6: Differential- und Integralrechnung
   -------------------------------------------------------------------------
   100 Sets zu 8 Aufgaben. Acht Ableitungen in einer Minute sind 7,5 Sekunden
   je Aufgabe, und ein gutes Drittel davon geht fürs Lesen drauf. Deshalb ist
   die Schreibweise überall dieselbe und so knapp wie möglich:

       f(x)=x^3-4x^2 → f'(x)=▢       erste Ableitung
       f(x)=x^3-4x^2 → f''(x)=▢      zweite Ableitung
       f'(x)=6x → f(x)=▢             rückwärts
       ∫ x^2 dx                      Stammfunktion
       ∫₁² 2x dx                     bestimmtes Integral

   Vier Festlegungen tragen den Bereich:

   1. HOCHZAHLEN STEHEN MIT DACH, nicht als Hochstellung: `x^3`, nicht `x³`.
      Der Nutzer tippt seine Antwort mit der ^-Taste; stünde in der Aufgabe
      etwas anderes als in der Antwort, übte er zwei Schreibweisen statt
      einer. Ab `x⁵` gäbe es ohnehin keine Hochstellung mehr, die
      mathe-term.js lesen könnte.

   2. JEDE MUSTERLÖSUNG MUSS DURCH mathe-term.js GEHEN. Das schließt Formen
      aus, die der Termrechner nicht kennt — vor allem Brüche mit
      mehrgliedrigem Nenner. `-1/(x+1)^2` wäre die richtige Ableitung von
      `1/(x+1)`, aber durch eine Summe kann der Rechner nicht teilen. Also
      entsteht diese Aufgabe gar nicht erst: Die Quotientenregel bleibt auf
      Nenner beschränkt, die ein einzelnes Glied sind.

   3. KEIN √x. Die Ableitung `1/(2√x)` ist keine Tippaufgabe. Die
      Potenzregel wird stattdessen mit negativen ganzen Exponenten geübt,
      einmal als `x^(-3)` und einmal als `1/x^3` — zwei Schreibweisen
      derselben Sache, und beide muss man lesen können.

   4. RÜCKWÄRTS WIRD AUS DER LÖSUNG ERZEUGT, nicht aus der Aufgabe. Für
      „welche Funktion hat die Ableitung 6x?" baut der Erzeuger zuerst
      `3x^2` und leitet dann ab. So sind alle Koeffizienten ganz, und die
      Musterlösung ist keine Rückrechnung, die schiefgehen könnte. Dasselbe
      gilt für Stammfunktionen und bestimmte Integrale: Erst steht die
      Stammfunktion, dann entsteht der Integrand daraus.

   Produkte stehen mit Leerzeichen statt mit Malpunkt: `x e^x`, nicht
   `x·e^x`. Der Termrechner wirft Leerzeichen weg, der Malpunkt hätte
   dagegen eine eigene Taste gebraucht.
   ========================================================================= */

import { erzeugerAnmelden, spanne } from './mathe-erzeuger.js';

/* --- Kleine Rechenhelfer -------------------------------------------------- */

const ggt = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };

/** Ganzzahlige Potenz. `Math.pow` liefert bei 3^5 auch 243, aber über
 *  Fließkomma — hier soll ausdrücklich ganz gerechnet werden. */
function pot(basis, hochzahl) {
  let w = 1;
  for (let i = 0; i < hochzahl; i++) w *= basis;
  return w;
}

/** Gekürzter Bruch als Zeichenkette: (12,8) → `3/2`, (6,3) → `2`. */
function bruchText(z, n) {
  if (n < 0) { z = -z; n = -n; }
  const g = ggt(z, n);
  z /= g; n /= g;
  return n === 1 ? String(z) : `${z}/${n}`;
}

/** Nenner eines gekürzten Bruchs — für die Frage „ist das noch ganz?". */
function nennerVon(z, n) {
  if (n < 0) { z = -z; n = -n; }
  return n / ggt(z, n);
}

const TIEF = '₀₁₂₃₄₅₆₇₈₉';
const HOCH = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const tiefZiffer = z => String(z).split('').map(c => TIEF[+c]).join('');
const hochZiffer = z => String(z).split('').map(c => HOCH[+c]).join('');

/* --- Terme aufschreiben ---------------------------------------------------
   Alles, was hier entsteht, muss `kanonisch()` aus mathe-term.js lesen
   können. Deshalb steht das Schreiben an einer Stelle und nicht verstreut
   in den Erzeugern.
   ------------------------------------------------------------------------- */

/** Vorfaktor vor einem Symbol: 1 → nichts, −1 → nur das Minus. */
const vorzahl = c => (c === 1 ? '' : c === -1 ? '-' : String(c));

/** Potenz von x. Negative Hochzahlen bekommen Klammern, sonst läse sich
 *  `2x^-3` wie eine Subtraktion. */
function potenzX(n) {
  if (n === 0) return '';
  if (n === 1) return 'x';
  return n < 0 ? `x^(${n})` : `x^${n}`;
}

/** Die vier Grundfunktionen als Text. */
const FUNTEXT = { exp: 'e^x', ln: 'ln x', sin: 'sin x', cos: 'cos x' };

/** Ein Summand ohne Vorzeichenlogik: c·x^n, c·sin x, c·e^x, c·ln x.
 *  `bruch` schreibt negative Potenzen als Bruch: x^(-3) → 1/x^3. */
function atomText(a) {
  if (a.k !== 'pot') return vorzahl(a.c) + FUNTEXT[a.k];
  if (a.n === 0) return String(a.c);
  if (a.bruch && a.n < 0) return `${a.c}/${potenzX(-a.n)}`;
  return vorzahl(a.c) + potenzX(a.n);
}

/** Eine Summe von Atomen. Das Vorzeichen steht vor dem Glied, nicht im
 *  Vorfaktor — sonst entstünde `3x^2+-8x`. */
function summeText(atome) {
  const echt = atome.filter(a => a.c !== 0);
  if (!echt.length) return '0';
  return echt.map((a, i) => {
    const kern = atomText({ ...a, c: Math.abs(a.c) });
    return (a.c < 0 ? '-' : i ? '+' : '') + kern;
  }).join('');
}

/** Ableitung einer Summe von Atomen — die ganze Differentialrechnung
 *  dieses Bereichs in acht Zeilen. */
function atomeAbleiten(atome) {
  const heraus = [];
  atome.forEach(a => {
    if (a.k === 'sin') heraus.push({ k: 'cos', c: a.c });
    else if (a.k === 'cos') heraus.push({ k: 'sin', c: -a.c });
    else if (a.k === 'exp') heraus.push({ k: 'exp', c: a.c });
    else if (a.k === 'ln') heraus.push({ k: 'pot', c: a.c, n: -1, bruch: true });
    else if (a.n !== 0) heraus.push({ k: 'pot', c: a.c * a.n, n: a.n - 1, bruch: a.bruch });
  });
  return heraus.filter(a => a.c !== 0);
}

const mehrfachAbleiten = (atome, mal) => {
  let w = atome;
  for (let i = 0; i < mal; i++) w = atomeAbleiten(w);
  return w;
};

/** Striche an f: 0 → `f`, 1 → `f'`, 2 → `f''`. */
const strich = k => "'".repeat(k);

/** Die Aufgabenzeile einer Ableitung. Der Platzhalter steht dort, wo die
 *  Oberfläche das Eingabefeld einsetzt. */
const ablZeile = (gegeben, vonStrich, nachStrich) =>
  `f${strich(vonStrich)}(x)=${gegeben} → f${strich(nachStrich)}(x)=▢`;

/** Innere lineare Funktion ax+b: (2,0) → `2x`, (1,3) → `x+3`, (3,-2) → `3x-2`. */
function innen(a, b) {
  const kopf = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  if (b === 0) return kopf;
  return kopf + (b < 0 ? `-${-b}` : `+${b}`);
}

/** Klammer nur, wo sie gebraucht wird: `∫ x^2 dx`, aber `∫ (x^2-4x) dx`. */
const klammer = (text, noetig) => (noetig ? `(${text})` : text);

/** Ein Produktglied c·x^n·F(x) — für Produkt- und Quotientenregel.
 *  `e^x sin x` ist dabei eine einzige Funktion, kein verschachteltes
 *  Produkt: Anders käme die Vorzeichenlogik durcheinander. */
const PRODTEXT = { ...FUNTEXT, expsin: 'e^x sin x', expcos: 'e^x cos x', '': '' };

function prodText(t) {
  const kopf = t.n === 0 ? vorzahl(t.c) : vorzahl(t.c) + potenzX(t.n);
  const fun = PRODTEXT[t.f || ''];
  if (!fun) return kopf === '' ? '1' : (t.n === 0 ? String(t.c) : kopf);
  return kopf ? `${kopf} ${fun}` : fun;
}

function prodSumme(liste) {
  const echt = liste.filter(t => t.c !== 0);
  if (!echt.length) return '0';
  return echt.map((t, i) => {
    const kern = prodText({ ...t, c: Math.abs(t.c) });
    return (t.c < 0 ? '-' : i ? '+' : '') + kern;
  }).join('');
}

/* --- Der Aufgabenraum der Polynome ----------------------------------------
   Aus einer Liste von Gliedbeschreibungen `[{c:[1,3], n:[3,3]}, …]` wird
   das Kreuzprodukt aller Vorfaktoren und Hochzahlen. Zwei Glieder mit
   derselben Hochzahl fliegen raus — sie wären zusammenzufassen, und dann
   stünde in der Aufgabe eine Rechnung, die vor dem Ableiten kommt.
   ------------------------------------------------------------------------- */

function kombinationen(glieder, saat) {
  let listen = [[]];
  (glieder || []).forEach((g, k) => {
    const cs = spanne(g.c ?? [1, 1], saat + 2 * k + 1).filter(c => c !== 0);
    const ns = spanne(g.n, saat + 2 * k + 2);
    const neu = [];
    listen.forEach(vor => cs.forEach(c => ns.forEach(n => {
      if (vor.some(a => a.n === n)) return;
      neu.push(vor.concat([{ k: 'pot', c, n, bruch: !!g.bruch }]));
    })));
    listen = neu;
  });
  return listen;
}

/* --- Die Regelarten dieses Bereichs --------------------------------------- */

erzeugerAnmelden({

  /** Potenz-, Summen- und Faktorregel — und die zweite Ableitung, die
   *  dieselbe Regel nur zweimal anwendet.
   *
   *  `richtung: 'rueck'` dreht die Aufgabe um: Gezeigt wird die Ableitung,
   *  gesucht ist die Funktion. Damit die Antwort eindeutig bleibt, darf
   *  kein konstantes Glied vorkommen — sonst wäre jede Zahl richtig. */
  ablSumme(r, saat) {
    const raum = [];
    const ordnung = r.ordnung || 1;
    const rueck = r.richtung === 'rueck';
    kombinationen(r.glieder, saat).forEach(atome => {
      if (rueck) {
        /* Alle Hochzahlen mindestens so groß wie die Ordnung: Sonst hätte
           die gesuchte Funktion ein konstantes Glied verloren. */
        if (atome.some(a => a.n < ordnung)) return;
        const frage = mehrfachAbleiten(atome, ordnung);
        const antwort = mehrfachAbleiten(atome, ordnung - 1);
        if (!frage.length || !antwort.length) return;
        raum.push({ t: ablZeile(summeText(frage), ordnung, ordnung - 1),
                    a: summeText(antwort) });
      } else {
        raum.push({ t: ablZeile(summeText(atome), 0, ordnung),
                    a: summeText(mehrfachAbleiten(atome, ordnung)) });
      }
    });
    return raum;
  },

  /** sin, cos, e^x und ln x — mit Vorfaktor und wahlweise einem
   *  Polynomglied dazu, damit die Summenregel mitgeübt wird. */
  ablGrund(r, saat) {
    const raum = [];
    const ordnung = r.ordnung || 1;
    const cs = spanne(r.c ?? [1, 1], saat).filter(c => c !== 0);
    const zusatz = r.zusatz
      ? spanne(r.zusatz.c ?? [1, 1], saat + 3).filter(c => c !== 0)
          .flatMap(c => spanne(r.zusatz.n, saat + 4)
            .filter(n => n >= 1).map(n => ({ k: 'pot', c, n })))
      : [null];
    (r.funktionen || ['sin']).forEach(f => cs.forEach(c => zusatz.forEach(z => {
      const atome = z ? [{ k: f, c }, z] : [{ k: f, c }];
      raum.push({ t: ablZeile(summeText(atome), 0, ordnung),
                  a: summeText(mehrfachAbleiten(atome, ordnung)) });
    })));
    return raum;
  },

  /** Kettenregel, äußere Ableitung mal innere. Die innere Funktion ist
   *  linear (ax+b) oder x^2 — alles andere sprengt die Zeit.
   *
   *  `ln(ax)` ist der Sonderfall, auf den es ankommt: Die Ableitung ist
   *  `1/x`, ganz gleich wie groß a ist. Wer stattdessen `a/x` schreibt,
   *  hat die Kettenregel angewandt, aber nicht zu Ende gedacht. */
  ablKette(r, saat) {
    const raum = [];
    const as = spanne(r.a ?? [2, 4], saat).filter(a => a !== 0);
    const bs = spanne(r.b ?? [0, 0], saat + 1);
    const cs = spanne(r.c ?? [1, 1], saat + 2).filter(c => c !== 0);
    const ns = spanne(r.n ?? [2, 3], saat + 3).filter(n => n >= 2);

    const linear = (form, a, b, c) => {
      if (a === 1 && b === 0) return null;             // ohne innere Funktion
      const inn = innen(a, b);
      /* Zwei Formen schließt mathe-term.js aus, beide beim e:
         · `e^(2x+1)` — eine Summe im Exponenten lässt sich nicht zu einem
           Atom zusammenziehen, deshalb muss b hier null sein.
         · `-e^(-2x)` — ein Minus unmittelbar vor der Potenzbasis zieht der
           Termrechner in die Basis hinein. Bei Vorfaktor −1 entstünde
           genau das, also entfällt der Fall. */
      if (form === 'exp')
        return b === 0 && c * a !== -1
          ? [`${vorzahl(c)}e^(${inn})`, `${vorzahl(c * a)}e^(${inn})`] : null;
      if (form === 'sin')
        return [`${vorzahl(c)}sin(${inn})`, `${vorzahl(c * a)}cos(${inn})`];
      if (form === 'cos')
        return [`${vorzahl(c)}cos(${inn})`, `${vorzahl(-c * a)}sin(${inn})`];
      if (form === 'ln')
        return b === 0 && a > 0 ? [`${vorzahl(c)}ln(${inn})`, `${c}/x`] : null;
      return null;
    };

    (r.formen || ['exp']).forEach(form => cs.forEach(c => {
      if (form === 'potenz') {
        as.forEach(a => bs.forEach(b => ns.forEach(n => {
          if (a === 1 && b === 0) return;
          const inn = innen(a, b);
          const rest = n - 1 === 1 ? `(${inn})` : `(${inn})^${n - 1}`;
          raum.push({ t: ablZeile(`${vorzahl(c)}(${inn})^${n}`, 0, 1),
                      a: `${vorzahl(c * a * n)}${rest}` });
        })));
        return;
      }
      if (form === 'expQuad' || form === 'sinQuad' || form === 'cosQuad') {
        const kern = form.slice(0, 3);
        const aussen = kern === 'exp' ? `e^(x^2)` : `${kern}(x^2)`;
        const abl = kern === 'exp' ? `e^(x^2)`
                  : kern === 'sin' ? 'cos(x^2)' : 'sin(x^2)';
        const faktor = kern === 'cos' ? -2 * c : 2 * c;
        raum.push({ t: ablZeile(`${vorzahl(c)}${aussen}`, 0, 1),
                    a: `${vorzahl(faktor)}x ${abl}` });
        return;
      }
      as.forEach(a => bs.forEach(b => {
        const paar = linear(form, a, b, c);
        if (paar) raum.push({ t: ablZeile(paar[0], 0, 1), a: paar[1] });
      }));
    }));
    return raum;
  },

  /** Produktregel in den Formen, deren Ergebnis kurz bleibt:
   *  x^n mal e^x, ln x, sin x, cos x — und e^x mal sin x. */
  ablProdukt(r, saat) {
    const raum = [];
    const cs = spanne(r.c ?? [1, 1], saat).filter(c => c !== 0);
    const ns = spanne(r.n ?? [1, 1], saat + 1).filter(n => n >= 1);

    (r.formen || ['xExp']).forEach(form => cs.forEach(c => {
      if (form === 'expSin' || form === 'expCos') {
        const erst = form === 'expSin' ? 'expsin' : 'expcos';
        const zweit = form === 'expSin' ? 'expcos' : 'expsin';
        const vorzeichen = form === 'expSin' ? c : -c;
        raum.push({ t: ablZeile(prodText({ c, n: 0, f: erst }), 0, 1),
                    a: prodSumme([{ c, n: 0, f: erst }, { c: vorzeichen, n: 0, f: zweit }]) });
        return;
      }
      ns.forEach(n => {
        let f, abl;
        if (form === 'xExp') {
          f = { c, n, f: 'exp' };
          abl = [{ c: c * n, n: n - 1, f: 'exp' }, { c, n, f: 'exp' }];
        } else if (form === 'xLn') {
          f = { c, n, f: 'ln' };
          abl = [{ c: c * n, n: n - 1, f: 'ln' }, { c, n: n - 1, f: '' }];
        } else if (form === 'xSin') {
          f = { c, n, f: 'sin' };
          abl = [{ c: c * n, n: n - 1, f: 'sin' }, { c, n, f: 'cos' }];
        } else if (form === 'xCos') {
          f = { c, n, f: 'cos' };
          abl = [{ c: c * n, n: n - 1, f: 'cos' }, { c: -c, n, f: 'sin' }];
        } else return;
        raum.push({ t: ablZeile(prodText(f), 0, 1), a: prodSumme(abl) });
      });
    }));
    return raum;
  },

  /** Quotientenregel — aber nur dort, wo der Nenner ein einzelnes Glied
   *  bleibt. `(ax+b)/x` wird zu `-b/x^2`, und das ist tippbar. Wäre der
   *  Nenner eine Summe, hieße die Ableitung `…/(x+1)^2`, und weder der
   *  Termrechner noch der Daumen kämen damit zurecht. */
  ablQuotient(r, saat) {
    const raum = [];
    const as = spanne(r.a ?? [1, 1], saat).filter(a => a !== 0);
    const bs = spanne(r.b ?? [1, 1], saat + 1).filter(b => b !== 0);
    const ns = spanne(r.n ?? [1, 1], saat + 2).filter(n => n >= 1);

    (r.formen || ['linDurchX']).forEach(form => {
      if (form === 'linDurchX') {
        as.forEach(a => bs.forEach(b => raum.push({
          t: ablZeile(`(${innen(a, b)})/x`, 0, 1),
          a: `${-b}/x^2` })));
      } else if (form === 'quadDurchX') {
        as.forEach(a => bs.forEach(b => raum.push({
          /* (ax^2+b)/x = ax + b/x, also f' = a − b/x^2. */
          t: ablZeile(`(${vorzahl(a)}x^2${b < 0 ? '-' + -b : '+' + b})/x`, 0, 1),
          a: summeText([{ k: 'pot', c: a, n: 0 }, { k: 'pot', c: -b, n: -2, bruch: true }]) })));
      } else if (form === 'linDurchQuad') {
        bs.forEach(b => raum.push({
          /* (x+b)/x^2 = 1/x + b/x^2, also f' = −1/x^2 − 2b/x^3. */
          t: ablZeile(`(${innen(1, b)})/x^2`, 0, 1),
          a: summeText([{ k: 'pot', c: -1, n: -2, bruch: true },
                        { k: 'pot', c: -2 * b, n: -3, bruch: true }]) }));
      } else if (form === 'expDurchX') {
        ns.forEach(n => raum.push({
          t: ablZeile(`e^x/${potenzX(n)}`, 0, 1),
          a: `(${innen(1, -n)})e^x/${potenzX(n + 1)}` }));
      } else if (form === 'lnDurchX') {
        ns.forEach(n => raum.push({
          t: ablZeile(`ln x/${potenzX(n)}`, 0, 1),
          a: `(1-${vorzahl(n)}ln x)/${potenzX(n + 1)}` }));
      } else if (form === 'xDurchExp') {
        ns.forEach(n => raum.push({
          t: ablZeile(`${potenzX(n)}/e^x`, 0, 1),
          a: `(${prodSumme([{ c: n, n: n - 1, f: '' }, { c: -1, n, f: '' }])})/e^x` }));
      }
    });
    return raum;
  },

  /** Stammfunktionen. Der Integrand entsteht aus der Stammfunktion, nicht
   *  umgekehrt — dann sind die Vorfaktoren immer ganz. Das `+C` steht in
   *  der Musterlösung; verlangt wird es nicht, mathe-term.js lässt beides
   *  gelten. */
  intStamm(r, saat) {
    const raum = [];
    const cs = spanne(r.c ?? [1, 1], saat).filter(c => c !== 0);
    const ns = spanne(r.n ?? [1, 3], saat + 1);
    const as = spanne(r.a ?? [2, 4], saat + 2).filter(a => a >= 2);
    const nimm = (integrand, stamm, mehrgliedrig) =>
      raum.push({ t: `∫ ${klammer(integrand, mehrgliedrig)} dx`, a: `${stamm}+C` });

    (r.formen || ['potenz']).forEach(form => {
      if (form === 'potenz') {
        cs.forEach(c => ns.forEach(n => {
          if (n < 0) return;
          /* Der Vorfaktor c/(n+1) steht gekürzt da: `3x^4/2`, nicht
             `6x^4/4`. Ungekürzt wäre die Musterlösung zwar richtig, aber
             sie brächte eine Nachlässigkeit bei, die später Punkte kostet. */
          const g = ggt(c, n + 1);
          const z = c / g, nenner = (n + 1) / g;
          if (r.teilbar === true && nenner !== 1) return;
          if (r.teilbar === false && nenner === 1) return;
          const stamm = nenner === 1
            ? `${vorzahl(z)}${potenzX(n + 1)}`
            : `${vorzahl(z)}${potenzX(n + 1)}/${nenner}`;
          nimm(atomText({ k: 'pot', c, n }), stamm, c < 0);
        }));
      } else if (form === 'kehr') {
        cs.forEach(c => nimm(`${c}/x`, `${vorzahl(c)}ln|x|`, c < 0));
      } else if (form === 'negPot') {
        cs.forEach(c => ns.forEach(n => {
          if (n < 2) return;
          const g = ggt(c, n - 1);
          const z = c / g, nenner = (n - 1) / g;
          if (r.teilbar === true && nenner !== 1) return;
          if (r.teilbar === false && nenner === 1) return;
          const stamm = nenner === 1
            ? `-${z}/${potenzX(n - 1)}`
            : `-${z}/(${nenner}${potenzX(n - 1)})`;
          nimm(`${c}/${potenzX(n)}`, stamm, false);
        }));
      } else if (form === 'exp') {
        cs.forEach(c => nimm(`${vorzahl(c)}e^x`, `${vorzahl(c)}e^x`, c < 0));
      } else if (form === 'sin') {
        cs.forEach(c => nimm(`${vorzahl(c)}sin x`, `${vorzahl(-c)}cos x`, c < 0));
      } else if (form === 'cos') {
        cs.forEach(c => nimm(`${vorzahl(c)}cos x`, `${vorzahl(c)}sin x`, c < 0));
      } else if (form === 'expKette') {
        as.forEach(a => nimm(`e^(${a}x)`, `e^(${a}x)/${a}`, false));
      } else if (form === 'sinKette') {
        as.forEach(a => nimm(`sin(${a}x)`, `-cos(${a}x)/${a}`, false));
      } else if (form === 'cosKette') {
        as.forEach(a => nimm(`cos(${a}x)`, `sin(${a}x)/${a}`, false));
      } else if (form === 'polynom') {
        kombinationen(r.glieder, saat + 5).forEach(atome => {
          if (atome.some(a => a.n < 1)) return;
          const integrand = atomeAbleiten(atome);
          if (!integrand.length) return;
          nimm(summeText(integrand), summeText(atome),
               integrand.length > 1 || integrand[0].c < 0);
        });
      }
    });
    return raum;
  },

  /** Bestimmtes Integral. Auch hier steht die Stammfunktion zuerst; der
   *  Wert ist dann F(v) − F(u) und bei ganzen Grenzen selbst ganz.
   *  Die Formen `bruch` und `kehr` liefern absichtlich Brüche — sie
   *  gehören in Sets mit Prüfart `term`, nicht `zahl`. */
  intBestimmt(r, saat) {
    const raum = [];
    const us = spanne(r.u ?? [0, 1], saat);
    const vs = spanne(r.v ?? [1, 3], saat + 1);
    const cs = spanne(r.c ?? [1, 1], saat + 2).filter(c => c !== 0);
    const ns = spanne(r.n ?? [2, 3], saat + 3);
    const wertMax = r.wertMax ?? 150;
    const grenzen = (u, v) => `∫${tiefZiffer(u)}${hochZiffer(v)}`;

    if (r.form === 'bruch' || r.form === 'kehr') {
      cs.forEach(c => ns.forEach(n => us.forEach(u => vs.forEach(v => {
        if (v <= u) return;
        let z, nn, integrand;
        if (r.form === 'bruch') {
          if (n < 0) return;
          z = c * (pot(v, n + 1) - pot(u, n + 1));
          nn = n + 1;
          integrand = atomText({ k: 'pot', c, n });
        } else {
          if (n < 2 || u < 1) return;
          /* ∫ c·x^(−n) dx = −c/((n−1)x^(n−1)); der Wert ist die Differenz
             der beiden Kehrwerte. */
          z = c * (pot(v, n - 1) - pot(u, n - 1));
          nn = (n - 1) * pot(u, n - 1) * pot(v, n - 1);
          integrand = `${c}/${potenzX(n)}`;
        }
        if (z <= 0 || nn <= 0) return;
        if (nennerVon(z, nn) === 1) return;             // ganze Zahl gehört zu `zahl`
        if (nennerVon(z, nn) > 12) return;              // kein Bruch zum Nachdenken
        raum.push({ t: `${grenzen(u, v)} ${integrand} dx`, a: bruchText(z, nn) });
      }))));
      return raum;
    }

    kombinationen(r.glieder, saat + 4).forEach(atome => {
      if (atome.some(a => a.n < 1)) return;
      const integrand = atomeAbleiten(atome);
      if (!integrand.length) return;
      const wertAn = x => atome.reduce((s, a) => s + a.c * pot(x, a.n), 0);
      us.forEach(u => vs.forEach(v => {
        if (v <= u) return;
        const wert = wertAn(v) - wertAn(u);
        if (wert <= 0 || wert > wertMax) return;
        raum.push({
          t: `${grenzen(u, v)} ${klammer(summeText(integrand),
                integrand.length > 1 || integrand[0].c < 0)} dx`,
          a: String(wert) });
      }));
    });
    return raum;
  }
});

/* --- Die 100 Sets --------------------------------------------------------- */

const BLOECKE = [

  /* 1–14 · Potenzregel ----------------------------------------------------
     Der tragende Block. Alles Weitere ist diese eine Regel in Gesellschaft
     anderer — deshalb kommen hier auch die negativen Hochzahlen vor, und
     zwar in beiden Schreibweisen. */
  { von: 1, bis: 14, schluessel: true, titel: i => [
      'Potenzregel: x hoch 2 bis 9',
      'Potenzregel bis x hoch 12',
      'Konstante und lineare Funktion',
      'Vorfaktor mal Potenz',
      'Große Vorfaktoren',
      'Negative Vorfaktoren',
      'Hohe Potenzen mit Vorfaktor',
      'Negative Hochzahlen',
      'Negative Hochzahlen mit Vorfaktor',
      'Kehrwerte: 1 durch x hoch n',
      'Brüche mit Vorfaktor',
      'Potenz und Kehrwert gemischt',
      'Alle Hochzahlen gemischt',
      'Potenzregel, alles gemischt'][i],
    regel: i => [
      { art: 'ablSumme', glieder: [{ n: [2, 9] }] },
      { art: 'ablSumme', glieder: [{ n: [5, 12] }] },
      { art: 'gemischt', regeln: [
        { art: 'ablSumme', glieder: [{ c: [2, 9], n: [1, 1] }] },
        { art: 'ablSumme', glieder: [{ c: [2, 9], n: [0, 0] }] }] },
      { art: 'ablSumme', glieder: [{ c: [2, 6], n: [2, 5] }] },
      { art: 'ablSumme', glieder: [{ c: [7, 12], n: [2, 4] }] },
      { art: 'ablSumme', glieder: [{ c: [-7, -2], n: [2, 5] }] },
      { art: 'ablSumme', glieder: [{ c: [2, 5], n: [6, 10] }] },
      { art: 'ablSumme', glieder: [{ n: [-9, -2] }] },
      { art: 'ablSumme', glieder: [{ c: [2, 5], n: [-5, -2] }] },
      { art: 'ablSumme', glieder: [{ n: [-8, -1], bruch: true }] },
      { art: 'ablSumme', glieder: [{ c: [2, 6], n: [-4, -1], bruch: true }] },
      { art: 'gemischt', regeln: [
        { art: 'ablSumme', glieder: [{ c: [2, 5], n: [2, 5] }] },
        { art: 'ablSumme', glieder: [{ c: [2, 5], n: [-4, -1], bruch: true }] }] },
      { art: 'gemischt', regeln: [
        { art: 'ablSumme', glieder: [{ n: [2, 9] }] },
        { art: 'ablSumme', glieder: [{ n: [-6, -2] }] },
        { art: 'ablSumme', glieder: [{ c: [2, 4], n: [1, 1] }] }] },
      { art: 'gemischt', regeln: [
        { art: 'ablSumme', glieder: [{ c: [2, 6], n: [2, 6] }] },
        { art: 'ablSumme', glieder: [{ c: [2, 4], n: [-4, -2], bruch: true }] },
        { art: 'ablSumme', glieder: [{ c: [-5, -2], n: [2, 4] }] }] }][i] },

  /* 15–26 · Summen- und Faktorregel ---------------------------------------
     Der zweite tragende Block, und der erste mit der Rückrichtung: Wer
     `6x` sieht und `3x^2` schreibt, hat die Brücke zur Stammfunktion
     schon halb gebaut. */
  { von: 15, bis: 26, schluessel: true, titel: i => [
      'Zwei Glieder: x hoch 3 und x hoch 2',
      'Summe zweier Potenzen',
      'Differenz zweier Potenzen',
      'Polynom mit drei Gliedern',
      'Polynom mit konstantem Glied',
      'Faktorregel: Vielfache einer Potenz',
      'Rückwärts: Welche Funktion hat diese Ableitung?',
      'Rückwärts mit Vorfaktor',
      'Rückwärts mit zwei Gliedern',
      'Vorwärts und rückwärts gemischt',
      'Polynome vierten Grades',
      'Summen- und Faktorregel, alles gemischt'][i],
    regel: i => [
      { art: 'ablSumme', glieder: [{ c: [1, 3], n: [3, 3] }, { c: [-6, -2], n: [2, 2] }] },
      { art: 'ablSumme', glieder: [{ c: [1, 4], n: [2, 5] }, { c: [2, 7], n: [1, 1] }] },
      { art: 'ablSumme', glieder: [{ c: [1, 4], n: [2, 5] }, { c: [-7, -2], n: [1, 1] }] },
      { art: 'ablSumme', glieder: [{ c: [1, 3], n: [3, 4] }, { c: [-5, -2], n: [2, 2] },
                                   { c: [2, 6], n: [1, 1] }] },
      { art: 'ablSumme', glieder: [{ c: [1, 2], n: [2, 3] }, { c: [-5, -2], n: [1, 1] },
                                   { c: [1, 5], n: [0, 0] }] },
      { art: 'ablSumme', glieder: [{ c: [2, 12], n: [3, 3] }] },
      { art: 'ablSumme', richtung: 'rueck', glieder: [{ c: [1, 4], n: [2, 6] }] },
      { art: 'ablSumme', richtung: 'rueck', glieder: [{ c: [2, 7], n: [2, 5] }] },
      { art: 'ablSumme', richtung: 'rueck',
        glieder: [{ c: [1, 3], n: [3, 4] }, { c: [-4, -2], n: [1, 2] }] },
      { art: 'gemischt', regeln: [
        { art: 'ablSumme', glieder: [{ c: [1, 3], n: [3, 3] }, { c: [-5, -2], n: [1, 2] }] },
        { art: 'ablSumme', richtung: 'rueck',
          glieder: [{ c: [1, 3], n: [2, 4] }, { c: [-4, -2], n: [1, 1] }] }] },
      { art: 'ablSumme', glieder: [{ c: [1, 3], n: [4, 4] }, { c: [-4, -2], n: [3, 3] },
                                   { c: [2, 6], n: [1, 2] }] },
      { art: 'gemischt', regeln: [
        { art: 'ablSumme', glieder: [{ c: [1, 4], n: [3, 5] }, { c: [-6, -2], n: [2, 2] }] },
        { art: 'ablSumme', glieder: [{ c: [2, 5], n: [2, 3] }, { c: [2, 7], n: [1, 1] },
                                     { c: [1, 6], n: [0, 0] }] },
        { art: 'ablSumme', richtung: 'rueck', glieder: [{ c: [1, 4], n: [2, 5] }] }] }][i] },

  /* 27–36 · Zweite Ableitung ----------------------------------------------
     Nichts Neues, nur zweimal dasselbe. Wer hier hängenbleibt, hat meist
     das erste Ergebnis falsch abgeschrieben, nicht falsch gerechnet. */
  { von: 27, bis: 36, titel: i => [
      'Zweite Ableitung einer Potenz',
      'Zweite Ableitung mit Vorfaktor',
      'Zweite Ableitung: zwei Glieder',
      'Zweite Ableitung: drei Glieder',
      'Zweite Ableitung vierten Grades',
      'Zweite Ableitung negativer Hochzahlen',
      'Rückwärts von der zweiten Ableitung',
      'Erste und zweite Ableitung gemischt',
      'Zweite Ableitung vorwärts und rückwärts',
      'Zweite Ableitung, alles gemischt'][i],
    regel: i => [
      { art: 'ablSumme', ordnung: 2, glieder: [{ n: [2, 9] }] },
      { art: 'ablSumme', ordnung: 2, glieder: [{ c: [2, 6], n: [2, 5] }] },
      { art: 'ablSumme', ordnung: 2,
        glieder: [{ c: [1, 3], n: [3, 3] }, { c: [-6, -2], n: [2, 2] }] },
      { art: 'ablSumme', ordnung: 2,
        glieder: [{ c: [1, 3], n: [3, 4] }, { c: [-5, -2], n: [2, 2] }, { c: [2, 6], n: [1, 1] }] },
      { art: 'ablSumme', ordnung: 2,
        glieder: [{ c: [1, 3], n: [4, 5] }, { c: [-4, -2], n: [2, 3] }] },
      { art: 'ablSumme', ordnung: 2, glieder: [{ c: [1, 3], n: [-5, -2] }] },
      { art: 'ablSumme', ordnung: 2, richtung: 'rueck', glieder: [{ c: [1, 4], n: [3, 6] }] },
      { art: 'gemischt', regeln: [
        { art: 'ablSumme', glieder: [{ c: [1, 4], n: [3, 4] }, { c: [-5, -2], n: [2, 2] }] },
        { art: 'ablSumme', ordnung: 2,
          glieder: [{ c: [1, 4], n: [3, 4] }, { c: [-5, -2], n: [2, 2] }] }] },
      { art: 'gemischt', regeln: [
        { art: 'ablSumme', ordnung: 2, glieder: [{ c: [1, 4], n: [3, 5] }] },
        { art: 'ablSumme', ordnung: 2, richtung: 'rueck', glieder: [{ c: [2, 5], n: [3, 5] }] }] },
      { art: 'gemischt', regeln: [
        { art: 'ablSumme', ordnung: 2, glieder: [{ c: [2, 5], n: [3, 5] }] },
        { art: 'ablSumme', ordnung: 2, glieder: [{ c: [1, 3], n: [-4, -2] }] },
        { art: 'ablSumme', ordnung: 2, richtung: 'rueck', glieder: [{ c: [1, 3], n: [4, 6] }] }] }][i] },

  /* 37–48 · sin, cos, e hoch x, ln x -------------------------------------- */
  { von: 37, bis: 48, titel: i => [
      'Ableitung von sin x und cos x',
      'sin und cos mit Vorfaktor',
      'Ableitung von e hoch x',
      'Ableitung von ln x',
      'Negative Vorfaktoren bei sin, cos und e hoch x',
      'Die vier Grundfunktionen gemischt',
      'Potenz plus sin oder cos',
      'Potenz plus e hoch x',
      'Potenz plus ln x',
      'Zweite Ableitung von sin und cos',
      'Zweite Ableitung von e hoch x und ln x',
      'Grundfunktionen, alles gemischt'][i],
    regel: i => [
      { art: 'ablGrund', funktionen: ['sin', 'cos'], c: [1, 4] },
      { art: 'ablGrund', funktionen: ['sin', 'cos'], c: [2, 9] },
      { art: 'ablGrund', funktionen: ['exp'], c: [1, 9] },
      { art: 'ablGrund', funktionen: ['ln'], c: [1, 9] },
      { art: 'ablGrund', funktionen: ['sin', 'cos', 'exp'], c: [-8, -2] },
      { art: 'ablGrund', funktionen: ['sin', 'cos', 'exp', 'ln'], c: [1, 5] },
      { art: 'ablGrund', funktionen: ['sin', 'cos'], c: [1, 3],
        zusatz: { c: [2, 5], n: [2, 3] } },
      { art: 'ablGrund', funktionen: ['exp'], c: [1, 3], zusatz: { c: [2, 6], n: [1, 3] } },
      { art: 'ablGrund', funktionen: ['ln'], c: [2, 6], zusatz: { c: [2, 5], n: [1, 2] } },
      { art: 'ablGrund', ordnung: 2, funktionen: ['sin', 'cos'], c: [1, 6] },
      { art: 'ablGrund', ordnung: 2, funktionen: ['exp', 'ln'], c: [1, 6] },
      { art: 'gemischt', regeln: [
        { art: 'ablGrund', funktionen: ['sin', 'cos', 'exp', 'ln'], c: [2, 6] },
        { art: 'ablGrund', funktionen: ['exp', 'ln'], c: [1, 3], zusatz: { c: [2, 4], n: [1, 2] } },
        { art: 'ablGrund', ordnung: 2, funktionen: ['sin', 'cos'], c: [2, 5] }] }][i] },

  /* 49–60 · Kettenregel ---------------------------------------------------- */
  { von: 49, bis: 60, titel: i => [
      'Kettenregel: e hoch ax',
      'Kettenregel: sin(ax)',
      'Kettenregel: cos(ax)',
      'e hoch minus ax',
      'sin und cos mit innerer Klammer',
      'Kettenregel: ln(ax)',
      'Potenz einer Klammer',
      'Klammer mit Vorfaktor hoch n',
      'Kettenregel mit äußerem Vorfaktor',
      'Innere Funktion x hoch 2',
      'Kettenregel gemischt',
      'Kettenregel, alles gemischt'][i],
    regel: i => [
      { art: 'ablKette', formen: ['exp'], a: [2, 9] },
      { art: 'ablKette', formen: ['sin'], a: [2, 9] },
      { art: 'ablKette', formen: ['cos'], a: [2, 9] },
      { art: 'ablKette', formen: ['exp'], a: [-9, -2] },
      { art: 'ablKette', formen: ['sin', 'cos'], a: [2, 4], b: [1, 4] },
      { art: 'ablKette', formen: ['ln'], a: [2, 9], c: [1, 4] },
      { art: 'ablKette', formen: ['potenz'], a: [1, 1], b: [1, 6], n: [2, 4] },
      { art: 'ablKette', formen: ['potenz'], a: [2, 4], b: [-3, 3], n: [2, 3] },
      { art: 'ablKette', formen: ['exp', 'sin', 'cos'], a: [2, 4], c: [2, 5] },
      { art: 'ablKette', formen: ['expQuad', 'sinQuad', 'cosQuad'], c: [1, 4] },
      { art: 'gemischt', regeln: [
        { art: 'ablKette', formen: ['exp', 'sin'], a: [2, 6] },
        { art: 'ablKette', formen: ['cos'], a: [2, 4], b: [1, 3] },
        { art: 'ablKette', formen: ['potenz'], a: [1, 2], b: [1, 4], n: [2, 3] }] },
      { art: 'gemischt', regeln: [
        { art: 'ablKette', formen: ['exp', 'sin', 'cos'], a: [2, 5] },
        { art: 'ablKette', formen: ['ln'], a: [2, 6], c: [1, 3] },
        { art: 'ablKette', formen: ['potenz'], a: [2, 3], b: [1, 3], n: [2, 3] },
        { art: 'ablKette', formen: ['expQuad', 'sinQuad'], c: [1, 3] }] }][i] },

  /* 61–70 · Produktregel --------------------------------------------------- */
  { von: 61, bis: 70, titel: i => [
      'Produktregel: x mal e hoch x',
      'Produktregel: x hoch n mal e hoch x',
      'Produktregel: x mal sin x',
      'Produktregel: x mal cos x',
      'Produktregel: x mal ln x',
      'Produktregel: x hoch n mal ln x',
      'Produktregel: e hoch x mal sin x',
      'Produktregel mit Vorfaktor',
      'Produktregel gemischt',
      'Produktregel, alles gemischt'][i],
    regel: i => [
      { art: 'ablProdukt', formen: ['xExp'], c: [1, 3], n: [1, 4] },
      { art: 'ablProdukt', formen: ['xExp'], c: [2, 4], n: [2, 6] },
      { art: 'ablProdukt', formen: ['xSin'], c: [1, 4], n: [1, 2] },
      { art: 'ablProdukt', formen: ['xCos'], c: [1, 4], n: [1, 2] },
      { art: 'ablProdukt', formen: ['xLn'], c: [1, 8], n: [1, 1] },
      { art: 'ablProdukt', formen: ['xLn'], c: [1, 3], n: [2, 4] },
      { art: 'ablProdukt', formen: ['expSin', 'expCos'], c: [1, 5] },
      { art: 'ablProdukt', formen: ['xExp', 'xSin', 'xCos'], c: [2, 5], n: [1, 2] },
      { art: 'gemischt', regeln: [
        { art: 'ablProdukt', formen: ['xExp', 'xLn'], c: [1, 3], n: [1, 3] },
        { art: 'ablProdukt', formen: ['xSin', 'xCos'], c: [1, 3], n: [1, 2] }] },
      { art: 'gemischt', regeln: [
        { art: 'ablProdukt', formen: ['xExp'], c: [1, 4], n: [1, 3] },
        { art: 'ablProdukt', formen: ['xLn'], c: [1, 4], n: [1, 3] },
        { art: 'ablProdukt', formen: ['expSin', 'expCos'], c: [1, 4] }] }][i] },

  /* 71–76 · Quotientenregel ------------------------------------------------ */
  { von: 71, bis: 76, titel: i => [
      'Quotientenregel: Klammer durch x',
      'Quotientenregel mit Vorfaktor',
      'Quotientenregel: x hoch 2 plus Zahl durch x',
      'Quotientenregel: Klammer durch x hoch 2',
      'Quotientenregel mit e hoch x und ln x',
      'Quotientenregel, alles gemischt'][i],
    regel: i => [
      { art: 'ablQuotient', formen: ['linDurchX'], a: [1, 1], b: [-9, 9] },
      { art: 'ablQuotient', formen: ['linDurchX'], a: [2, 5], b: [-6, 6] },
      { art: 'ablQuotient', formen: ['quadDurchX'], a: [1, 3], b: [-8, 8] },
      { art: 'ablQuotient', formen: ['linDurchQuad'], b: [-9, 9] },
      { art: 'ablQuotient', formen: ['expDurchX', 'lnDurchX', 'xDurchExp'], n: [1, 3] },
      { art: 'gemischt', regeln: [
        { art: 'ablQuotient', formen: ['linDurchX'], a: [1, 3], b: [-5, 5] },
        { art: 'ablQuotient', formen: ['quadDurchX'], a: [1, 2], b: [-5, 5] },
        { art: 'ablQuotient', formen: ['expDurchX', 'lnDurchX'], n: [1, 2] }] }][i] },

  /* 77–88 · Stammfunktionen ------------------------------------------------ */
  { von: 77, bis: 88, titel: i => [
      'Stammfunktion einer Potenz',
      'Stammfunktion mit glattem Vorfaktor',
      'Stammfunktion mit Bruch im Vorfaktor',
      'Stammfunktion von 1 durch x',
      'Stammfunktion von e hoch x',
      'Stammfunktion von sin und cos',
      'Stammfunktion negativer Hochzahlen',
      'Stammfunktion mit glattem Bruch',
      'Stammfunktion einer Summe',
      'Stammfunktion mit innerer Funktion',
      'Stammfunktion von Polynomen',
      'Stammfunktionen, alles gemischt'][i],
    regel: i => [
      { art: 'intStamm', formen: ['potenz'], c: [1, 1], n: [0, 8] },
      { art: 'intStamm', formen: ['potenz'], teilbar: true, c: [2, 12], n: [1, 5] },
      { art: 'intStamm', formen: ['potenz'], teilbar: false, c: [2, 9], n: [1, 5] },
      { art: 'intStamm', formen: ['kehr'], c: [1, 9] },
      { art: 'intStamm', formen: ['exp'], c: [1, 9] },
      { art: 'intStamm', formen: ['sin', 'cos'], c: [1, 6] },
      { art: 'intStamm', formen: ['negPot'], c: [1, 1], n: [2, 9] },
      { art: 'intStamm', formen: ['negPot'], teilbar: true, c: [2, 8], n: [2, 6] },
      { art: 'intStamm', formen: ['polynom'],
        glieder: [{ c: [1, 3], n: [2, 4] }, { c: [1, 4], n: [1, 1] }] },
      { art: 'intStamm', formen: ['expKette', 'sinKette', 'cosKette'], a: [2, 6] },
      { art: 'intStamm', formen: ['polynom'],
        glieder: [{ c: [1, 3], n: [3, 4] }, { c: [-3, -1], n: [2, 2] }, { c: [1, 4], n: [1, 1] }] },
      { art: 'gemischt', regeln: [
        { art: 'intStamm', formen: ['potenz'], c: [1, 6], n: [1, 4] },
        { art: 'intStamm', formen: ['kehr', 'exp'], c: [2, 6] },
        { art: 'intStamm', formen: ['sin', 'cos'], c: [1, 4] },
        { art: 'intStamm', formen: ['negPot'], c: [1, 1], n: [2, 5] }] }][i] },

  /* 89–96 · Bestimmtes Integral, ganze Werte ------------------------------- */
  { von: 89, bis: 96, pruefart: 'zahl', titel: i => [
      'Bestimmtes Integral von 2x',
      'Integral mit unterer Grenze 0',
      'Fläche unter der Parabel',
      'Integral von 1 bis 2',
      'Integral einer Summe',
      'Integral eines Polynoms',
      'Integral mit größeren Grenzen',
      'Integral einer Konstanten'][i],
    regel: i => [
      { art: 'intBestimmt', glieder: [{ c: [1, 4], n: [2, 2] }], u: [0, 2], v: [1, 5] },
      { art: 'intBestimmt', glieder: [{ c: [1, 5], n: [2, 3] }], u: [0, 0], v: [1, 3] },
      { art: 'intBestimmt', glieder: [{ c: [1, 3], n: [3, 3] }], u: [0, 1], v: [1, 3] },
      { art: 'intBestimmt', glieder: [{ c: [1, 8], n: [2, 4] }], u: [1, 1], v: [2, 2] },
      { art: 'intBestimmt',
        glieder: [{ c: [1, 3], n: [2, 2] }, { c: [1, 4], n: [1, 1] }], u: [0, 1], v: [1, 3] },
      { art: 'intBestimmt',
        glieder: [{ c: [1, 2], n: [3, 3] }, { c: [1, 3], n: [2, 2] }, { c: [1, 3], n: [1, 1] }],
        u: [0, 1], v: [1, 2] },
      { art: 'intBestimmt', glieder: [{ c: [1, 2], n: [2, 2] }], u: [1, 3], v: [4, 6] },
      { art: 'intBestimmt', glieder: [{ c: [2, 9], n: [1, 1] }], u: [0, 2], v: [3, 6] }][i] },

  /* 97–98 · Bestimmtes Integral mit Bruchwert ------------------------------ */
  { von: 97, bis: 98, pruefart: 'term', titel: i => [
      'Integral mit Bruch als Ergebnis',
      'Integral von 1 durch x hoch n'][i],
    regel: i => [
      { art: 'intBestimmt', form: 'bruch', c: [1, 3], n: [2, 4], u: [0, 1], v: [1, 2] },
      { art: 'intBestimmt', form: 'kehr', c: [1, 4], n: [2, 3], u: [1, 2], v: [2, 4] }][i] },

  /* 99–100 · Bestimmtes Integral, alles gemischt --------------------------- */
  { von: 99, bis: 100, pruefart: 'zahl', titel: i => [
      'Bestimmte Integrale gemischt',
      'Bestimmtes Integral, alles gemischt'][i],
    regel: i => [
      { art: 'gemischt', regeln: [
        { art: 'intBestimmt', glieder: [{ c: [1, 3], n: [2, 3] }], u: [0, 1], v: [1, 3] },
        { art: 'intBestimmt', glieder: [{ c: [2, 6], n: [1, 1] }], u: [0, 2], v: [3, 5] }] },
      { art: 'gemischt', regeln: [
        { art: 'intBestimmt', glieder: [{ c: [1, 4], n: [2, 4] }], u: [0, 1], v: [1, 2] },
        { art: 'intBestimmt',
          glieder: [{ c: [1, 2], n: [2, 2] }, { c: [1, 3], n: [1, 1] }], u: [0, 1], v: [1, 3] },
        { art: 'intBestimmt', glieder: [{ c: [2, 8], n: [1, 1] }], u: [1, 2], v: [3, 5] }] }][i] }
];

/** Voraussetzung: Wo hakt es wahrscheinlich, wenn dieses Set nicht gelingt?
 *  Die Angabe steuert nur einen Hinweis, nie eine Sperre. */
const VORAUSSETZUNG = nr =>
    nr >= 89 ? 77                      // bestimmtes Integral ← Stammfunktion
  : nr >= 77 ? 21                      // Stammfunktion       ← Rückwärtsableiten
  : nr >= 71 ? 61                      // Quotientenregel     ← Produktregel
  : nr >= 61 ? 49                      // Produktregel        ← Kettenregel
  : nr >= 49 ? 37                      // Kettenregel         ← Grundfunktionen
  : nr >= 37 ? 1                       // Grundfunktionen     ← Potenzregel
  : nr >= 27 ? 15                      // zweite Ableitung    ← Summenregel
  : nr >= 15 ? 4                       // Summenregel         ← Faktorregel
  : null;

export const SETS_B6 = (() => {
  const sets = [];
  BLOECKE.forEach(block => {
    for (let nr = block.von; nr <= block.bis; nr++) {
      const i = nr - block.von;
      sets.push({
        nr,
        titel: block.titel(i),
        aufgaben: 8,
        pruefart: block.pruefart || 'term',
        schluessel: !!block.schluessel,
        voraussetzung: VORAUSSETZUNG(nr),
        regel: block.regel(i)
      });
    }
  });
  return sets;
})();
