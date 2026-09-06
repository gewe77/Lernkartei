#!/bin/bash
# Auslieferungspaket bauen.
# ---------------------------------------------------------------------------
# Die Regel, die dieses Skript durchsetzt:
#
#   IM PAKET DARF KEINE DATEI LIEGEN, DIE BEIM AUSPACKEN ETWAS
#   ÜBERSCHREIBT, WAS DER NUTZER SELBST ANGELEGT HAT.
#
# Gelernt am 6.9.2026: Ein Paket enthielt `firebase-config.js` mit
# Platzhaltern und ein leeres `audio/manifest.json`. Beim Auspacken über das
# Repository startete die App nicht mehr, und sämtliche vorproduzierten
# Aufnahmen galten still als nicht vorhanden.
#
# Solche Dateien tragen deshalb `.BEISPIEL` im Namen oder fehlen ganz.
# ---------------------------------------------------------------------------
set -eu
cd "$(dirname "$0")/.."
V="${1:?Aufruf: werkzeuge/packen.sh 7-5}"

VERBOTEN=(firebase-config.js audio/manifest.json firestore.rules)
rm -f "han-croco-$V.zip" "han-croco-$V-tests.zip"

zip -q -r "han-croco-$V.zip" \
  index.html js audio README.md MEISTERKLASSE.md RUECKMELDUNG-*.md \
  firebase-config.BEISPIEL.js firestore.rules.BEISPIEL werkzeuge \
  -x "*/node_modules/*"

zip -q -r "han-croco-$V-tests.zip" test \
  -x "test/node_modules/*" "test/build-*/*" "test/shots-*/*"

fehler=0
for f in "${VERBOTEN[@]}"; do
  if unzip -l "han-croco-$V.zip" | grep -qE "[[:space:]]$f\$"; then
    echo "ABBRUCH: $f liegt im Paket und würde beim Auspacken überschreiben." >&2
    fehler=1
  fi
done
[ "$fehler" = 0 ] || { rm -f "han-croco-$V.zip"; exit 1; }

echo "Gepackt:"
ls -la "han-croco-$V.zip" "han-croco-$V-tests.zip"
