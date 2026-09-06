/* Das Audio-Verzeichnis aus dem Ordner neu aufbauen.
   ---------------------------------------------------------------------------
   Nötig, wenn `audio/manifest.json` verlorengegangen oder überschrieben
   wurde. Die Aufnahmen selbst (`audio/*.mp3`) genügen — es wird nichts neu
   erzeugt, nichts gesprochen, nichts bezahlt. Die Datei listet nur, was da
   ist.

   Aufruf aus dem Projektordner:
       node werkzeuge/manifest-neu.mjs

   Format (so liest es index.html):
       { "stand": "<Datum>", "dateien": ["<schluessel>", …] }
   `schluessel` ist der Dateiname OHNE „.mp3“ — die App setzt ihn selbst
   wieder zusammen: audio/<schluessel>.mp3
   --------------------------------------------------------------------------- */

import { readdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const ORDNER = path.join(process.cwd(), 'audio');
const ZIEL = path.join(ORDNER, 'manifest.json');

let namen;
try {
  namen = await readdir(ORDNER);
} catch (e) {
  console.error(`Ordner "audio" nicht gefunden. Bitte aus dem Projektordner aufrufen.`);
  process.exit(2);
}

const dateien = namen
  .filter(n => n.toLowerCase().endsWith('.mp3'))
  .map(n => n.slice(0, -4))
  .sort();

/* Einen vorhandenen Stand nicht wegwerfen — er steuert nur die Zwischen-
   speicherung im Browser und darf ruhig weiterzählen. */
let stand = new Date().toISOString().slice(0, 10);
try {
  const alt = JSON.parse(await readFile(ZIEL, 'utf8'));
  if (typeof alt?.stand === 'string' && alt.stand && alt.stand !== stand) stand = alt.stand;
} catch (_) { /* keine alte Datei — dann eben das heutige Datum */ }

await writeFile(ZIEL, JSON.stringify({ stand, dateien }, null, 0) + '\n', 'utf8');
console.log(`audio/manifest.json neu geschrieben: ${dateien.length} Aufnahmen, Stand ${stand}.`);
if (!dateien.length)
  console.log('Achtung: Es liegen keine .mp3-Dateien in audio/. Die Karten sprechen dann '
    + 'mit der Browserstimme — das ist der Normalzustand vor dem ersten Produktionslauf.');
