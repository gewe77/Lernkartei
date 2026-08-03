/* ===========================================================================
   Lernkartei 2 — Firebase-Konfiguration
   ---------------------------------------------------------------------------
   Diese Datei ist die EINZIGE Stelle, an der projektspezifische Werte stehen.
   index.html wird nicht angefasst.

   So kommst du an die Werte:
     Firebase-Konsole → Projekt öffnen → Zahnrad → Projekteinstellungen
     → Abschnitt "Meine Apps" → Web-App auswählen → "SDK-Einrichtung und
       -Konfiguration" → "Konfiguration"
     Dort steht ein Objekt "const firebaseConfig = { ... }".
     Die Werte daraus hier unten eintragen.

   Ist der apiKey geheim?  Nein.
   Der Schlüssel identifiziert nur das Projekt und steht bei jeder Web-App
   im Quelltext. Die eigentliche Absicherung passiert in firestore.rules —
   dort ist festgelegt, dass jedes Konto ausschließlich an seine eigenen
   Daten kommt. Details stehen in der README unter "Sicherheit".
   =========================================================================== */

export const firebaseConfig = {
  apiKey:            "AIzaSyDWqCFpAjrYu_dj9cja91U0DVHTUN36RDg",
  authDomain:        "lernkarteikarten.firebaseapp.com",
  projectId:         "lernkarteikarten",
  storageBucket:     "lernkarteikarten.firebasestorage.app",
  messagingSenderId: "890861401333",
  appId:             "1:890861401333:web:5df4f36c56ca71151ec1bc"
};

/* ---------------------------------------------------------------------------
   Version des Firebase-Web-SDK, das vom Google-CDN geladen wird.
   Aktualisieren: https://firebase.google.com/docs/web/setup — dort steht die
   jeweils aktuelle Nummer. Nur diese Zeile ändern, sonst nichts.
   --------------------------------------------------------------------------- */
export const SDK_VERSION = "12.15.0";

/* ---------------------------------------------------------------------------
   Optional: Konten, die sich anmelden dürfen (nur Anzeige-Komfort auf dem
   Anmeldebildschirm — die echte Absperrung machen die Security Rules und die
   Tatsache, dass in der Firebase-Konsole die Selbstregistrierung aus ist).
   Leer lassen ([]) blendet die Liste aus.
   Beispiel: ["glen@example.com", "zweite@example.com", "dritte@example.com"]
   --------------------------------------------------------------------------- */
export const KONTEN_HINWEIS = [];

/* Tagesgrenze in Stunden (KONZEPT §2: lokal 04:00 Uhr).
   Wer um 01:30 Uhr lernt, lernt damit noch den Vortag zu Ende. */
export const TAGESGRENZE_STUNDE = 4;
