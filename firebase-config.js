/* HAN CROCO — Zugangsdaten des Firebase-Projekts.
   ---------------------------------------------------------------------------
   Diese Datei gehört DIR und wird von keinem Auslieferungspaket mehr
   angefasst. Vor jedem Push lohnt sich:

       node werkzeuge/config-pruefen.mjs

   Der `apiKey` ist KEIN Geheimnis. Er benennt das Projekt, er berechtigt zu
   nichts — jede Web-App trägt ihn im Quelltext. Den Zugriff regeln allein die
   Sicherheitsregeln (firestore.rules) und die Anmeldung.
   --------------------------------------------------------------------------- */

export const firebaseConfig = {
  apiKey: "AIzaSyDWqCFpAjrYu_dj9cja91U0DVHTUN36RDg",
  authDomain: "lernkarteikarten.firebaseapp.com",
  projectId: "lernkarteikarten",
  storageBucket: "lernkarteikarten.firebasestorage.app",
  messagingSenderId: "890861401333",
  appId: "1:890861401333:web:5df4f36c56ca71151ec1bc"
};

/* Fassung des Firebase-SDK, die vom Google-CDN geladen wird.
   Gegen 12.15.0 ist die App geprüft. Aktuell wäre 12.18.0 — das Anheben ist
   eine eigene Entscheidung und gehört nicht in eine Wiederherstellung. */
export const SDK_VERSION = "12.15.0";

/* Steht hier etwas drin, zeigt der Anmeldebildschirm „n Konten eingerichtet"
   und die Adressen als Kurzhinweis beim Darüberfahren. Leer lassen ist
   völlig in Ordnung — es ist reine Erinnerungshilfe, keine Zugangskontrolle.
   Beispiel: ["wendt.glen@gmail.com", "…", "…"] */
export const KONTEN_HINWEIS = [];

/* Wann ein Lerntag beginnt. 4 heißt: Was du um halb eins nachts lernst,
   zählt noch auf den Vortag — sonst risse eine späte Sitzung die Serie. */
export const TAGESGRENZE_STUNDE = 4;
