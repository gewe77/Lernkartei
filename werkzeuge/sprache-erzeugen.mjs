#!/usr/bin/env node
/* ===========================================================================
   HAN CROCO — Sprachdateien vorproduzieren (Stufe 5)
   ---------------------------------------------------------------------------
   Läuft auf DEINEM Rechner, nie im Browser. Der Zugangsschlüssel bleibt damit
   dort, wo er hingehört.

   Was das Skript tut:
     1. liest die gemeinsame Sammlung `audioBedarf` aus Firestore
        (oder wahlweise eine JSON-Sicherung, siehe --aus)
     2. erzeugt für jeden noch fehlenden Eintrag eine MP3 mit Google
        Chirp 3 HD
     3. legt sie unter  audio/<schluessel>.mp3  ab
     4. schreibt  audio/manifest.json  fort — daran erkennt die App, was da ist
     5. räumt die erledigten Einträge aus `audioBedarf` weg

   Der Dateiname ist ein SHA-256 über Sprache, Stimme und Text. Deshalb teilen
   sich alle Konten dieselbe Aufnahme, sobald sie dieselbe Vokabel haben, und
   eine verschobene oder umbenannte Karte behält ihre Datei.

   ---------------------------------------------------------------------------
   EINRICHTUNG (einmalig)

   1. Google Cloud: Text-to-Speech API aktivieren.
        console.cloud.google.com → APIs & Dienste → „Cloud Text-to-Speech API“
      Abrechnung muss aktiv sein — auch für das Freikontingent von 1 Mio.
      Zeichen im Monat. Wer das Kartenprojekt davon freihalten will, legt
      dafür ein eigenes Cloud-Projekt an; die MP3-Dateien landen ohnehin im
      Repository und nicht bei Firebase.

   2. Dienstkonto anlegen und Schlüssel als JSON herunterladen.
      Rollen:  „Cloud Text-to-Speech-Nutzer“  und  „Cloud Datastore-Nutzer“
      (Letzteres nur, wenn die Sammelliste gelesen werden soll.)

   3. Abhängigkeiten:
        cd werkzeuge && npm install

   4. Aufruf:
        export GOOGLE_APPLICATION_CREDENTIALS=/pfad/zum/dienstkonto.json
        node sprache-erzeugen.mjs

   ---------------------------------------------------------------------------
   AUFRUFE

     node sprache-erzeugen.mjs                 alles Offene aus der Sammelliste
     node sprache-erzeugen.mjs --probe         nur zeigen, was zu tun wäre
     node sprache-erzeugen.mjs --aus sicherung.json
                                               aus einer JSON-Sicherung statt
                                               aus Firestore (dann ohne
                                               Dienstkonto für Firestore)
     node sprache-erzeugen.mjs --grenze 500    höchstens 500 Aufnahmen erzeugen
     node sprache-erzeugen.mjs --behalten      Sammelliste nicht aufräumen

   =========================================================================== */

import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
/* Erst beim tatsächlichen Aufruf laden. So lässt sich die Datei auch ohne
   installierte Abhängigkeiten importieren — die Abnahmeprüfung braucht nur
   die Textfunktionen, nicht den Google-Zugang. */
let GoogleAuth = null;
async function googleAuthLaden() {
  if (!GoogleAuth) ({ GoogleAuth } = await import('google-auth-library'));
  return GoogleAuth;
}

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, '..');
const AUDIO_ORDNER = path.join(WURZEL, 'audio');
const MANIFEST = path.join(AUDIO_ORDNER, 'manifest.json');

/* Muss Wort für Wort zu index.html passen — sonst sucht die App nach
   Dateinamen, die das Skript nie erzeugt. Bei einer Änderung hier gehört die
   Gegenprobe in test/pruefung-stufe5.mjs nachgezogen. */
const textNormalisieren = t => String(t ?? '').replace(/\s+/g, ' ').trim();
function schluesselVon(text, sprache, stimme, lautschrift) {
  const kern = lautschrift ? textNormalisieren(text) + '\u0001' + lautschrift : text;
  const roh = `${sprache}|${stimme}|${textNormalisieren(kern)}`;
  return createHash('sha256').update(roh, 'utf8').digest('hex').slice(0, 40);
}

/* MUSS Zeichen für Zeichen dem DOM-freien Zweig von htmlZuText() in
   index.html entsprechen. Die erste Fassung ersetzte jedes Tag durch ein
   LEERZEICHEN — aus „H<sub>2</sub>O“ wurde damit „H 2 O“ statt „H2O“ und
   der Hash wich ab: Das Skript erzeugte bei Google eine Aufnahme, die die
   App nie anfordert. Die Entity-Tabelle ist zudem vollständiger, weil
   Anki-Exporte gern &auml; und Verwandtes enthalten. */
const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß',
  eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç', ntilde: 'ñ',
  hellip: '…', ndash: '–', mdash: '—', laquo: '«', raquo: '»',
  bdquo: '„', ldquo: '“', rdquo: '”', sbquo: '‚', lsquo: '‘', rsquo: '’' };
const entitaeten = t => t
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m2, n) => (n in ENTITIES ? ENTITIES[n] : m2));
const aufraeumen = t => String(t)
  .replace(/\u00a0/g, ' ')
  .replace(/[ \t]+\n/g, '\n')
  .trim();
const nurText = roh => {
  const t = String(roh ?? '');
  if (!t) return '';
  if (!/[<&]/.test(t)) return t;
  /* Blockgrenzen werden erst markiert und dann zusammengefasst, nicht gleich
     zu Umbrüchen gemacht. Sonst ergäbe '</div><div>' zwei Umbrüche, während
     die App über den DOM-Baum nur einen setzt — und schon weichen die
     Dateinamen ab. Ein Marker steht für „hier endet oder beginnt ein Block“,
     eine Folge davon für genau einen Umbruch. */
  return aufraeumen(entitaeten(t
    .replace(/<\/?(?:p|div|li|ul|ol|tr|table|pre|blockquote|h[1-6])\b[^>]*>/gi, '\u0000')
    .replace(/<(?:br|hr)\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]*\u0000[ \t\u0000]*/g, '\n')));
};

/* --- Befehlszeile -------------------------------------------------------- */

const argv = process.argv.slice(2);
const hatFlagge = n => argv.includes(n);
const wert = (n, ersatz) => {
  const i = argv.indexOf(n);
  // Ein Wert, der mit -- beginnt, ist in Wahrheit die nächste Flagge:
  // `--aus --probe` nahm sonst „--probe“ als Dateinamen.
  const v = i >= 0 ? argv[i + 1] : undefined;
  if (i >= 0 && (v === undefined || v.startsWith('--'))) {
    console.error(`Fehlender Wert für ${n}.`); process.exit(2);
  }
  return i >= 0 ? v : ersatz;
};
const NUR_PROBE = hatFlagge('--probe');
const BEHALTEN = hatFlagge('--behalten');
// Number(...) || 100000 machte aus `--grenze 0` klammheimlich „alles“.
const GRENZE = (() => {
  const n = Number(wert('--grenze', '100000'));
  if (!Number.isFinite(n) || n < 0) { console.error('--grenze braucht eine Zahl ≥ 0.'); process.exit(2); }
  return n;
})();
const AUS_DATEI = wert('--aus', null);

/* --- Google Text-to-Speech ---------------------------------------------- */

const TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
let holeToken = null;

async function tokenBesorgen() {
  if (!holeToken) {
    const Auth = await googleAuthLaden();
    const auth = new Auth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
    const client = await auth.getClient();
    holeToken = async () => (await client.getAccessToken()).token;
  }
  return holeToken();
}

/**
 * Eine Aufnahme erzeugen. Liefert einen Buffer mit MP3-Daten.
 *
 * speakingRate bleibt bewusst bei 1.0: Das Tempo stellt die App über
 * playbackRate ein. Wäre es in der Datei fest verbacken, müsste bei jeder
 * Änderung des Reglers der gesamte Bestand neu erzeugt werden.
 */
async function aufnahmeErzeugen({ text, sprache, stimme, lautschrift }) {
  const eingabe = { text };

  /* Lautschrift nur bei einem einzelnen Wort. customPronunciations erwartet
     eine `phrase`, die im Text vorkommt — bei einem ganzen Satz wäre nicht
     bestimmbar, welches Wort gemeint ist, und Google spräche den Satz dann
     als ein Wort aus. Mehrwortige Karten mit Lautschrift sind selten; sie
     bekommen die normale Aussprache und eine Meldung. */
  if (lautschrift) {
    const einWort = !/\s/.test(text.trim());
    if (einWort) {
      eingabe.customPronunciations = {
        pronunciations: [{
          phrase: text.trim(),
          phoneticEncoding: 'PHONETIC_ENCODING_IPA',
          pronunciation: lautschrift
        }]
      };
    } else {
      console.warn(`  ! Lautschrift übergangen (mehrere Wörter): „${text.slice(0, 40)}“`);
    }
  }

  const antwort = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + (await tokenBesorgen()),
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      input: eingabe,
      voice: { languageCode: sprache, name: `${sprache}-Chirp3-HD-${stimme}` },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 }
    })
  });

  if (!antwort.ok) {
    const text2 = await antwort.text();
    throw new Error(`HTTP ${antwort.status} — ${text2.slice(0, 400)}`);
  }
  const j = await antwort.json();
  if (!j.audioContent) throw new Error('Antwort ohne audioContent');
  return Buffer.from(j.audioContent, 'base64');
}

/* --- Quellen ------------------------------------------------------------- */

/** Aus der gemeinsamen Firestore-Sammlung. */
async function bedarfAusFirestore() {
  const { initializeApp, cert, applicationDefault } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const konto = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!konto) throw new Error('GOOGLE_APPLICATION_CREDENTIALS ist nicht gesetzt.');
  initializeApp({ credential: applicationDefault() });
  const db = getFirestore();
  const schnapp = await db.collection('audioBedarf').get();
  const raus = [];
  schnapp.forEach(d => {
    const x = d.data() || {};
    if (!x.text || !x.sprache || !x.stimme) return;
    raus.push({
      id: d.id,
      text: textNormalisieren(x.text),
      sprache: String(x.sprache),
      stimme: String(x.stimme),
      lautschrift: String(x.lautschrift || '').trim()
    });
  });
  return { liste: raus, db };
}

/**
 * Aus einer JSON-Sicherung. Der Weg ohne Sammelliste — nützlich für einen
 * ersten Massenlauf, bevor die App überhaupt etwas gemeldet hat, oder wenn
 * die Sammelliste abgeschaltet ist.
 *
 * Welche Stimme? Die Sicherung kennt die Sprache je Kasten, aber nicht die
 * Stimmwahl (die steht in den Einstellungen). Deshalb wird sie von dort
 * gelesen, mit Kore als Vorgabe.
 */
async function bedarfAusSicherung(datei) {
  const j = JSON.parse(await readFile(datei, 'utf8'));
  const decks = new Map((j.decks || []).map(d => [d.id, d]));
  const stimmen = (j.settings && j.settings.stimmen) || {};
  const stimmeFuer = s => stimmen[s] || 'Kore';


  /* Jeder Grund wird gezählt. Vorher gab es vier stille `return` — bei einer
     Sicherung mit falschen deckIds produzierte das Skript fast nichts und
     sagte am Ende nur, was es erzeugt hatte, nie, was es ausgelassen hatte. */
  const uebersprungen = { ableitung: 0, cloze: 0, ohneKasten: 0, leer: 0, zuLang: 0 };
  const raus = new Map();
  (j.cards || []).forEach(k => {
    // Nur Quellkarten: Die Rückwärtsabfrage trägt denselben Text und ergäbe
    // dieselben zwei Aufnahmen.
    if (k.quelleId) { uebersprungen.ableitung++; return; }
    const d0 = decks.get(k.deckId);
    if (!d0) { uebersprungen.ohneKasten++; return; }
    /* Lückentexte erzeugen je Lücke eine eigene Abfrage — und die App meldet
       deren Texte durchaus an. Die erste Fassung übersprang sie hier
       kommentarlos; beim Massenlauf aus einer Sicherung entstanden ihre
       Aufnahmen dann nie. Die Regeln unten spiegeln frageText()/
       antwortText() aus index.html. */
    if (k.typ === 'cloze') {
      const roh = String(k.frage || '');
      const muster = /\{\{c(\d{1,2})::([\s\S]{1,600}?)(?:::([\s\S]{0,600}?))?\}\}/g;
      const nummern = [];
      for (let t2; (t2 = muster.exec(roh));) {
        const n = Number(t2[1]);
        if (n >= 1 && n <= 20 && !nummern.includes(n)) nummern.push(n);
      }
      if (!nummern.length) { uebersprungen.cloze++; return; }
      const spr = d0.sprache || 'de-DE';
      nummern.forEach(ziel => {
        const vorn = roh.replace(new RegExp(muster.source, 'g'),
          (_, nr, loesung, hinweis) => Number(nr) === ziel ? (hinweis || '…') : loesung);
        let loesung = '';
        roh.replace(new RegExp(muster.source, 'g'),
          (_, nr, l) => { if (Number(nr) === ziel) loesung = l; return ''; });
        [[vorn, ''], [loesung, '']].forEach(([text, ls]) => {
          const t3 = textNormalisieren(text);
          if (!t3) { uebersprungen.leer++; return; }
          if (t3.length > 900) { uebersprungen.zuLang++; return; }
          const st = stimmeFuer(spr);
          raus.set(schluesselVon(t3, spr, st, ls), { text: t3, sprache: spr, stimme: st, lautschrift: ls });
        });
      });
      return;
    }
    const d = d0;
    const seiten = [
      [k.format === 'html' ? nurText(k.frage) : k.frage, d.sprache || 'de-DE', k.lautschrift],
      [k.format === 'html' ? nurText(k.antwort) : k.antwort, d.spracheAntwort || d.sprache || 'de-DE', k.lautschriftAntwort]
    ];
    seiten.forEach(([text, sprache, lautschrift]) => {
      const t = textNormalisieren(text);
      if (!t) { uebersprungen.leer++; return; }
      if (t.length > 900) { uebersprungen.zuLang++; return; }
      const stimme = stimmeFuer(sprache);
      const ls = String(lautschrift || '').trim();
      raus.set(schluesselVon(t, sprache, stimme, ls), { text: t, sprache, stimme, lautschrift: ls });
    });
  });
  const gemeldet = Object.entries(uebersprungen).filter(([, n]) => n)
    .map(([grund, n]) => `${n}× ${grund}`).join(', ');
  if (gemeldet) console.log('  übersprungen: ' + gemeldet);
  return { liste: Array.from(raus, ([id, x]) => ({ id, ...x })), db: null };
}

/* --- Manifest ------------------------------------------------------------ */

async function manifestLesen() {
  if (!existsSync(MANIFEST)) return new Set();
  try {
    const j = JSON.parse(await readFile(MANIFEST, 'utf8'));
    return new Set(Array.isArray(j.dateien) ? j.dateien : []);
  } catch (_) { return new Set(); }
}

/** Das Manifest wird aus dem Ordnerinhalt neu gebaut, nicht fortgeschrieben.
 *  Sonst behauptet es nach einem gelöschten oder nie hochgeladenen File
 *  weiterhin, die Aufnahme sei da — und die App spielt ins Leere. */
async function manifestSchreiben() {
  const dateien = (await readdir(AUDIO_ORDNER))
    .filter(n => n.endsWith('.mp3'))
    .map(n => n.slice(0, -4))
    .sort();
  /* Erst in eine Nebendatei, dann umbenennen. Ein Abbruch mitten im
     Schreiben hinterließe sonst ein halbes Manifest — und mit dem findet
     die App überhaupt nichts mehr. */
  const vorlaeufig = MANIFEST + '.tmp';
  await writeFile(vorlaeufig, JSON.stringify({
    hinweis: 'Erzeugt von werkzeuge/sprache-erzeugen.mjs — nicht von Hand ändern.',
    stand: new Date().toISOString().slice(0, 10),
    anzahl: dateien.length,
    dateien
  }, null, 0) + '\n', 'utf8');
  await rename(vorlaeufig, MANIFEST);
  return dateien.length;
}

/* --- Hauptlauf ----------------------------------------------------------- */

async function main() {
  await mkdir(AUDIO_ORDNER, { recursive: true });
  const vorhanden = await manifestLesen();

  console.log('HAN CROCO — Sprachdateien vorproduzieren');
  console.log('Ordner:', AUDIO_ORDNER);

  const quelle = AUS_DATEI ? await bedarfAusSicherung(AUS_DATEI) : await bedarfAusFirestore();
  const { liste, db } = quelle;
  console.log(`Quelle: ${AUS_DATEI ? 'Sicherung ' + AUS_DATEI : 'Firestore-Sammelliste'} — ${liste.length} Einträge`);

  /* Was schon als Datei existiert, wird nicht erneut erzeugt. Das ist die
     Stelle, an der aus „einmalig je Karte“ tatsächlich einmalig wird. */
  const offen = [];
  const schonDa = [];
  for (const e of liste) {
    const erwartet = schluesselVon(e.text, e.sprache, e.stimme, e.lautschrift);
    if (e.id !== erwartet) {
      // Kein Beinbruch, aber ein Hinweis auf auseinanderlaufende Hash-Regeln
      // zwischen App und Skript. Maßgeblich ist der selbst berechnete Wert.
      console.warn(`  ! Schlüssel weicht ab (${e.id.slice(0, 8)}… erwartet ${erwartet.slice(0, 8)}…)`);
    }
    const datei = path.join(AUDIO_ORDNER, erwartet + '.mp3');
    if (vorhanden.has(erwartet) || existsSync(datei)) { schonDa.push(e); continue; }
    offen.push({ ...e, schluessel: erwartet });
  }

  const zeichen = offen.reduce((s, e) => s + e.text.length, 0);
  console.log(`Bereits vorhanden: ${schonDa.length} · zu erzeugen: ${offen.length}` +
              (offen.length ? ` (${zeichen.toLocaleString('de-DE')} Zeichen)` : ''));

  if (!offen.length) {
    const n = await manifestSchreiben();
    if (db && !BEHALTEN && schonDa.length) {
      for (let i = 0; i < schonDa.length; i += 400) {
        const stapel = db.batch();
        schonDa.slice(i, i + 400).forEach(e => stapel.delete(db.collection('audioBedarf').doc(e.id)));
        await stapel.commit();
      }
      console.log(`Sammelliste aufgeräumt: ${schonDa.length} bereits vorhandene Einträge entfernt.`);
    }
    console.log(`Nichts zu erzeugen. Manifest: ${n} Aufnahmen.`);
    return;
  }

  if (NUR_PROBE) {
    offen.slice(0, 40).forEach(e =>
      console.log(`  ${e.sprache} ${e.stimme.padEnd(13)} ${e.text.slice(0, 60)}`));
    if (offen.length > 40) console.log(`  … und ${offen.length - 40} weitere`);
    console.log('\n--probe: nichts erzeugt, nichts gelöscht.');
    return;
  }

  const machen = offen.slice(0, GRENZE);
  if (machen.length < offen.length)
    console.log(`Begrenzt auf ${machen.length} (--grenze). Der Rest bleibt für den nächsten Lauf liegen.`);

  let fertig = 0, fehler = 0, hintereinander = 0;
  const erledigt = [];
  for (const e of machen) {
    try {
      const daten = await aufnahmeErzeugen(e);
      await writeFile(path.join(AUDIO_ORDNER, e.schluessel + '.mp3'), daten);
      erledigt.push(e);
      fertig++; hintereinander = 0;
      if (fertig % 25 === 0 || fertig === machen.length)
        console.log(`  ${fertig}/${machen.length} …`);
    } catch (err) {
      fehler++; hintereinander++;
      console.error(`  × ${e.sprache} „${e.text.slice(0, 40)}“ — ${err.message}`);
      /* Nach fünf Fehlern AM STÜCK abbrechen: Das ist dann kein Einzelfall
         mehr, sondern ein falscher Schlüssel, eine fehlende Berechtigung
         oder ein erschöpftes Kontingent. Gezählt werden bewusst nur
         aufeinanderfolgende — vorher brachen fünf über eine Stunde
         verstreute 503er den Lauf auch bei Position 3.800 von 4.000 ab. */
      if (hintereinander >= 5) { console.error('\nFünf Fehler nacheinander — Abbruch.'); break; }
    }
  }

  const gesamt = await manifestSchreiben();
  console.log(`\nErzeugt: ${fertig} · Fehler: ${fehler} · Manifest: ${gesamt} Aufnahmen.`);

  /* Aufräumen erst nach dem Schreiben des Manifests: Bräche der Lauf vorher
     ab, wäre der Bedarf gelöscht und die Datei nicht da — die App würde die
     Karte nie wieder anmelden. */
  /* Auch die Einträge wegräumen, deren Datei schon da war. Sonst bleiben sie
     dauerhaft liegen — nach einem `--behalten`, nach einem Abbruch oder wenn
     ein Konto mit veraltetem Manifest nachmeldet — und tauchen bei jedem
     Lauf erneut auf. */
  const wegzuraeumen = BEHALTEN ? [] : erledigt.concat(schonDa);
  if (db && wegzuraeumen.length) {
    let weg = 0;
    for (let i = 0; i < wegzuraeumen.length; i += 400) {
      const stapel = db.batch();
      wegzuraeumen.slice(i, i + 400).forEach(e => stapel.delete(db.collection('audioBedarf').doc(e.id)));
      await stapel.commit();
      weg += Math.min(400, wegzuraeumen.length - i);
    }
    console.log(`Sammelliste aufgeräumt: ${weg} Einträge entfernt.`);
  }

  console.log('\nNicht vergessen: audio/ und audio/manifest.json einchecken und ausrollen.');
  console.log('  git add audio && git commit -m "Sprachdateien" && git push');
}

/* main() nur beim direkten Aufruf. So kann die Abnahmeprüfung die Helfer
   einzeln gegen die App fahren — insbesondere nurText(), das Zeichen für
   Zeichen zu htmlZuText() passen muss. */
const direktAufgerufen = process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direktAufgerufen) {
  main().catch(e => { console.error('\nAbbruch:', e.message); process.exit(1); });
}

export { schluesselVon, textNormalisieren, nurText, manifestLesen };
