/* BEISPIEL — NICHT EINSPIELEN, WENN DU SCHON EINE EIGENE FASSUNG HAST.
   ---------------------------------------------------------------------------
   Diese Datei heißt absichtlich `.BEISPIEL.js`. Beim ersten Einrichten
   kopierst du sie einmal:

       cp firebase-config.BEISPIEL.js firebase-config.js

   und trägst dann deine Werte ein. Danach fasst kein Auslieferungspaket
   `firebase-config.js` mehr an — deine Zugangsdaten überleben jedes Update.

   Die Werte stehen in der Firebase-Konsole unter
   Projekteinstellungen → Meine Apps → Web-App → Konfiguration.

   Der `apiKey` ist KEIN Geheimnis: Er benennt das Projekt, er berechtigt zu
   nichts. Den Zugriff regeln allein die Sicherheitsregeln (firestore.rules).
   --------------------------------------------------------------------------- */

export const firebaseConfig = {
  apiKey: "AIzaSyPLATZHALTER-BITTE-ERSETZEN",
  authDomain: "DEIN-PROJEKT.firebaseapp.com",
  projectId: "DEIN-PROJEKT",
  storageBucket: "DEIN-PROJEKT.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};
export const SDK_VERSION = "12.15.0";
export const KONTEN_HINWEIS = [];
export const TAGESGRENZE_STUNDE = 4;
