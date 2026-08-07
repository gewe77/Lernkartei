/* =========================================================================
   HAN CROCO — Mathematik, Aufgabenerzeuger
   -------------------------------------------------------------------------
   Reines Rechenstück ohne Browser: Aus einer Regel und einem Startwert
   entstehen die Aufgaben eines Sets. Kein DOM, kein Firestore — damit die
   fachliche Gegenprüfung ohne Oberfläche laufen kann.

   Zwei Festlegungen tragen alles:

   1. ERZEUGT WIRD MIT FESTEM STARTWERT. Der Testmodus verlangt, dass Set 55
      heute dieselben 24 Aufgaben in derselben Reihenfolge hat wie in vier
      Wochen — sonst vergleicht man zwei verschiedene Sets miteinander und
      die Zeiten sagen nichts.

   2. DER AUFGABENRAUM WIRD AUFGEZÄHLT, nicht gewürfelt. Nur so lässt sich
      zusichern, dass in einem Set keine Aufgabe doppelt vorkommt. Wo der
      Raum kleiner ist als das Set (etwa „Einmaleins mit 5“: zehn Aufgaben,
      Set zu 24), wird er zyklisch wiederholt — mit größtmöglichem Abstand
      zwischen den Wiederholungen.
   ========================================================================= */

/** Zufallszahlen aus einem Startwert. mulberry32 — kurz, schnell, und über
 *  Browser und Node hinweg bitgleich, was die Prüfungen voraussetzen. */
export function zufallVon(startwert) {
  let a = (startwert >>> 0) || 1;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates mit gesätem Zufall. Verändert die Vorlage nicht. */
export function mischenMit(liste, rnd) {
  const a = liste.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* --- Kleine Helfer ------------------------------------------------------- */

/* Wie viele Werte eine Spanne höchstens beisteuert. Ohne diesen Deckel
   sprengt schon Bereich 2 jede Aufzählung: 1000…9999 mal 1000…9999 wären
   81 Millionen Paare. Mit 150 je Seite bleiben höchstens 22 500 — das
   rechnet der Browser in Millisekunden, und für ein Set zu 24 Aufgaben ist
   es weit mehr als genug. Welche 150 es sind, hängt an der SAAT der Regel,
   damit nicht alle Sets dieselben Zahlen zeigen. */
const SPANNE_MAX = 150;

const spanne = (b, saat = 1, schritt = 1) => {
  const [von, bis] = Array.isArray(b) ? b : [b, b];
  const s = Math.max(1, Math.round(schritt) || 1);
  const a = [];
  /* Der SCHRITT gehört hierher, nicht hinter den Deckel. Vorher wurden erst
     150 Werte aus 1000…9999 gezogen und dann auf Vielfache von 100 gefiltert
     — davon überlebten im Schnitt anderthalb. Zwölf Sets in Bereich 2
     starteten deshalb gar nicht („Dieses Set lässt sich nicht aufbauen"),
     achtzehn weitere hatten einen Aufgabenraum von ein bis drei Aufgaben.
     Gefunden beim Bau von Bereich 3. */
  const ersteres = Math.ceil(Math.min(von, bis) / s) * s;
  for (let i = ersteres; i <= Math.max(von, bis); i += s) a.push(i);
  if (a.length <= SPANNE_MAX) return a;
  return mischenMit(a, zufallVon(saat)).slice(0, SPANNE_MAX).sort((x, y) => x - y);
};

/** Saat einer Regel: gleiche Regel → gleiche Auswahl, andere Regel → andere. */
export function saatVon(regel) {
  const s = JSON.stringify(regel);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) || 1;
}

/* Übergang an einer wählbaren Stelle. Für den Zahlenraum 100 ist das die
   Zehnerstelle; im Zahlenraum 10 000 rechnet man mit vollen Zehnern, und
   dort gibt es an der Zehnerstelle GAR KEINEN Übergang mehr — dort ist der
   Hunderter die interessante Grenze. Ohne `uebergangStelle` blieben drei
   Sets in Bereich 2 leer, weil „Vielfache von 10“ und „Übergang an der
   Zehnerstelle“ einander ausschließen. */
const plusUebergang  = (a, b, st = 10) => (a % st) + (b % st) >= st;
const minusUebergang = (a, b, st = 10) => (a % st) < (b % st);

/** Filtert nach der Übergangsvorgabe. `null`/`undefined` heißt: beides. */
function uebergangPasst(wunsch, hat) {
  if (wunsch === null || wunsch === undefined) return true;
  return !!wunsch === !!hat;
}

/* --- Die Aufgabenräume je Regelart --------------------------------------- */

/* Jede Aufgabe ist { t, a }: Text und Antwort. Die Antwort steht als
   Zeichenkette da, weil sie mit der Eingabe verglichen wird und spätere
   Bereiche (Teilen mit Rest, Terme) keine reinen Zahlen liefern. */

const ERZEUGER = {

  plus(r, saat) {
    const raum = [];
    const s = r.schritt || 1;                    // nur Vielfache, z. B. volle Zehner
    for (const a of spanne(r.a, saat, s)) for (const b of spanne(r.b, saat + 1, s)) {
      if (a % s || b % s) continue;
      if (r.summeMax != null && a + b > r.summeMax) continue;
      if (r.summeMin != null && a + b < r.summeMin) continue;
      if (!uebergangPasst(r.uebergang, plusUebergang(a, b, r.uebergangStelle))) continue;
      raum.push({ t: `${a} + ${b}`, a: String(a + b) });
      /* `tausche` nimmt die vertauschte Aufgabe dazu. Für den Kopf sind
         8 + 3 und 3 + 8 nicht dasselbe: Beim zweiten muss erst umgestellt
         werden. Bei den engen Schlüsselblöcken verdoppelt das außerdem den
         Aufgabenraum — sonst stünden dort fünf Aufgaben für ein Set zu 24. */
      if (r.tausche && a !== b) raum.push({ t: `${b} + ${a}`, a: String(a + b) });
    }
    return raum;
  },

  minus(r, saat) {
    const raum = [];
    const s = r.schritt || 1;
    for (const a of spanne(r.a, saat, s)) for (const b of spanne(r.b, saat + 1, s)) {
      if (a % s || b % s) continue;
      if (b > a) continue;                       // im Zahlenraum 100 kein Minus unter null
      if (r.restMin != null && a - b < r.restMin) continue;
      if (!uebergangPasst(r.uebergang, minusUebergang(a, b, r.uebergangStelle))) continue;
      raum.push({ t: `${a} − ${b}`, a: String(a - b) });
    }
    return raum;
  },

  /** Ergänzen auf ein Ziel: `7 + ▢ = 10`.
   *  `zielSchritt` beschränkt die Ziele auf Vielfache (10, 20, 30 …),
   *  `naechsterZehner` nimmt statt eines festen Ziels den nächsten Zehner
   *  über dem Ausgangswert — das ist die Rechnung, die beim Zehnerübergang
   *  tatsächlich gebraucht wird. */
  ergaenzen(r, saat) {
    const raum = [];
    if (r.naechsterZehner) {
      for (const a of spanne(r.a, saat)) {
        if (a % 10 === 0) continue;              // steht schon auf dem Zehner
        const ziel = (Math.floor(a / 10) + 1) * 10;
        raum.push({ t: `${a} + ▢ = ${ziel}`, a: String(ziel - a) });
      }
      return raum;
    }
    const zs = r.zielSchritt || 1;
    for (const ziel of spanne(r.ziel, saat + 2, zs)) {
      for (const a of spanne(r.a, saat, r.schritt || 1)) {
        if (a >= ziel) continue;
        raum.push({ t: `${a} + ▢ = ${ziel}`, a: String(ziel - a) });
      }
    }
    return raum;
  },

  /** Vermindern: `50 − ▢ = 32`. Die Umkehrung des Ergänzens.
   *  `voriger Zehner` ist das Gegenstück zu `naechsterZehner`. */
  vermindern(r, saat) {
    const raum = [];
    if (r.vorigerZehner) {
      for (const a of spanne(r.a, saat)) {
        if (a % 10 === 0) continue;
        const ziel = Math.floor(a / 10) * 10;
        raum.push({ t: `${a} − ▢ = ${ziel}`, a: String(a - ziel) });
      }
      return raum;
    }
    const zs = r.zielSchritt || 1;
    for (const a of spanne(r.a, saat, r.schritt || 1)) for (const ziel of spanne(r.ziel, saat + 2, zs)) {
      if (ziel >= a) continue;
      raum.push({ t: `${a} − ▢ = ${ziel}`, a: String(a - ziel) });
    }
    return raum;
  },

  verdoppeln(r, saat) {
    return spanne(r.a, saat, r.schritt || 1).map(a => ({ t: `2 · ${a}`, a: String(2 * a) }));
  },

  halbieren(r, saat) {
    return spanne(r.a, saat, r.schritt || 2).filter(a => a % 2 === 0)
      .map(a => ({ t: `${a} : 2`, a: String(a / 2) }));
  },

  mal(r, saat) {
    const raum = [];
    for (const a of spanne(r.a, saat, r.schrittA || 1))
      for (const b of spanne(r.b, saat + 1, r.schrittB || 1)) {
      if (r.produktMax != null && a * b > r.produktMax) continue;
      raum.push({ t: `${a} · ${b}`, a: String(a * b) });
      // `tausche` nimmt die Tauschaufgabe dazu — 3 · 8 und 8 · 3 sind für den
      // Kopf zwei verschiedene Wege zur selben Zahl.
      if (r.tausche && a !== b) raum.push({ t: `${b} · ${a}`, a: String(a * b) });
    }
    return raum;
  },

  /** Division, die immer aufgeht: aus a · b wird (a·b) : b. */
  geteilt(r, saat) {
    const raum = [];
    for (const a of spanne(r.a, saat, r.schrittA || 1))
      for (const b of spanne(r.b, saat + 1, r.schrittB || 1)) {
      if (b === 0) continue;
      if (r.produktMax != null && a * b > r.produktMax) continue;
      raum.push({ t: `${a * b} : ${b}`, a: String(a) });
      if (r.tausche && a !== b && a !== 0) raum.push({ t: `${a * b} : ${a}`, a: String(b) });
    }
    return raum;
  },

  /** Platzhalter: `7 · ▢ = 56`, `8 + ▢ = 15`. Die Umkehraufgabe im Gewand
   *  der Ausgangsrechnung — das ist der eigentliche Übergang zur Algebra. */
  platzhalter(r, saat) {
    const raum = [];
    const art = r.unterart || 'mal';
    for (const a of spanne(r.a, saat)) for (const b of spanne(r.b, saat + 1)) {
      if (art === 'mal') {
        if (r.produktMax != null && a * b > r.produktMax) continue;
        raum.push({ t: `${a} · ▢ = ${a * b}`, a: String(b) });
        if (r.tausche && a !== b) raum.push({ t: `▢ · ${b} = ${a * b}`, a: String(a) });
      } else if (art === 'plus') {
        if (r.summeMax != null && a + b > r.summeMax) continue;
        raum.push({ t: `${a} + ▢ = ${a + b}`, a: String(b) });
      } else if (art === 'geteilt') {
        if (b === 0) continue;
        if (r.produktMax != null && a * b > r.produktMax) continue;
        raum.push({ t: `${a * b} : ▢ = ${a}`, a: String(b) });
      }
    }
    return raum;
  },

  /** Mehrere Regeln zu einem Raum verschmelzen — für die gemischten Sets. */
  gemischt(r, saat) {
    const raum = [];
    (r.regeln || []).forEach(teil => raum.push(...raumBauen(teil)));
    return raum;
  }
};


/** Weitere Regelarten anmelden. Jeder Bereich bringt seine eigenen mit und
 *  legt sie in einer eigenen Datei ab — sonst wüchse diese Datei auf ein paar
 *  tausend Zeilen, und genau davor soll der Modulschnitt schützen. */
export function erzeugerAnmelden(arten) {
  Object.keys(arten).forEach(name => {
    if (ERZEUGER[name]) throw new Error('Regelart doppelt angemeldet: ' + name);
    ERZEUGER[name] = arten[name];
  });
}

export { spanne };

/** Baut den vollständigen Aufgabenraum einer Regel. Dubletten (gleicher
 *  Text) fliegen raus — bei `gemischt` überschneiden sich die Teilregeln
 *  sonst, und ein Set hätte dieselbe Aufgabe zweimal. */
export function raumBauen(regel) {
  const bauer = ERZEUGER[regel?.art];
  if (!bauer) throw new Error('Unbekannte Regelart: ' + regel?.art);
  const roh = bauer(regel, saatVon(regel));
  const gesehen = new Set();
  const raum = [];
  for (const auf of roh) {
    if (gesehen.has(auf.t)) continue;
    gesehen.add(auf.t);
    raum.push(auf);
  }
  return raum;
}

/**
 * Die Aufgaben eines Sets.
 * @param {object} regel    Regelbeschreibung aus mathe-sets.js
 * @param {number} anzahl   12, 16, 20 oder 24
 * @param {number} startwert Set-Nummer im Testmodus, gewürfelt im Übungsmodus
 * @returns {Array<{t:string,a:string}>}
 */
export function setAufgaben(regel, anzahl, startwert) {
  const raum = raumBauen(regel);
  if (!raum.length) throw new Error('Leerer Aufgabenraum: ' + JSON.stringify(regel));
  const rnd = zufallVon(startwert);
  const gemischt = mischenMit(raum, rnd);

  const heraus = [];
  /* Ist der Raum kleiner als das Set, wird er zyklisch wiederholt statt
     nachgewürfelt: So liegt zwischen zwei gleichen Aufgaben immer der
     größtmögliche Abstand — bei zehn Aufgaben im Raum und einem Set zu 24
     also neun andere. Nachwürfeln könnte dieselbe Aufgabe zweimal
     hintereinander bringen, und das misst dann Kurzzeitgedächtnis. */
  for (let i = 0; i < anzahl; i++) {
    const runde = Math.floor(i / gemischt.length);
    const index = i % gemischt.length;
    // Ab der zweiten Runde neu mischen, damit nicht dieselbe Folge wiederkommt.
    if (index === 0 && runde > 0) {
      const nochmal = mischenMit(gemischt, zufallVon(startwert + runde * 7919));
      /* Ohne diesen Handgriff könnte die neue Runde mit genau der Aufgabe
         beginnen, mit der die vorige endete — dann stünde sie doch zweimal
         hintereinander, und die zyklische Wiederholung wäre umsonst. */
      if (nochmal.length > 1 && heraus.length &&
          nochmal[0].t === heraus[heraus.length - 1].t) {
        [nochmal[0], nochmal[1]] = [nochmal[1], nochmal[0]];
      }
      for (let j = 0; j < gemischt.length; j++) gemischt[j] = nochmal[j];
    }
    heraus.push(gemischt[index]);
  }
  return heraus;
}

/**
 * Antwortvergleich. Führende Nullen, Leerzeichen und ein getipptes Komma
 * ohne Nachkommastellen dürfen nicht als Fehler zählen — sonst bestraft das
 * Programm Tippgewohnheiten statt Rechenfehler.
 */
export function antwortStimmt(eingabe, erwartet) {
  const norm = s => String(s ?? '').trim()
    .replace(/\s+/g, '')
    /* Die Minustaste der Oberfläche schreibt U+2212, die Musterlösungen
       stehen mit ASCII-Minus da. Ohne diese Zeile wäre jede negative
       Antwort in Bereich 4 unerreichbar. Gefunden beim Bau von Bereich 4. */
    .replace(/[−–—]/g, '-')
    .replace(',', '.')
    .replace(/^(-?)0+(?=\d)/, '$1')      // 007 → 7,  -007 → -7
    .replace(/\.0+$/, '')                // 7.0 → 7
    .replace(/^-0$/, '0');
  return norm(eingabe) === norm(erwartet) && norm(eingabe) !== '';
}

/** Welche Tasten ein Set überhaupt braucht. Weil die Aufgaben erzeugt
 *  werden, ist das Antwortalphabet vorher bekannt — der Block bleibt klein
 *  genug für den Daumen. */
export function tastenFuer(aufgaben) {
  const zeichen = new Set();
  aufgaben.forEach(auf => String(auf.a).split('').forEach(c => zeichen.add(c)));
  const ziffern = '0123456789'.split('');
  const extra = [];
  if (zeichen.has('-') || zeichen.has('−')) extra.push('−');
  if (zeichen.has('.') || zeichen.has(',')) extra.push(',');
  if (zeichen.has('R')) extra.push('R');
  return { ziffern, extra };
}
