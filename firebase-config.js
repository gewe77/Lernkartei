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

/* ---------------------------------------------------------------------------
   Optional: Abzeichen für ALLE Konten.

   Diese Datei ist die einzige Stelle, die sich alle drei Konten teilen — sie
   wird von allen aus demselben Repository geladen. Damit lässt sich ein
   gemeinsamer Abzeichensatz vorgeben, ohne die Firestore-Sicherheitsregeln
   anzufassen. Wird der Eintrag hier gesetzt, gilt er überall und hat Vorrang
   vor dem Satz im einzelnen Konto.

   Nicht von Hand tippen: In der App unter
     Einstellungen → Abzeichen → „Textblock für alle Konten"
   den fertigen Block erzeugen und hier einsetzen.

   Bleibt der Eintrag weg (so wie jetzt), benutzt jedes Konto seinen eigenen
   Satz — voreingestellt ist ein eingebauter Standard.

   Aufbau je Abzeichen:
     art      'streak' (Tage in Folge) | 'wiederholungen' | 'karten' | 'fach'
     schwelle ab welchem Wert es erreicht ist
     icon     ein Emoji
     farbe    Hex-Farbe

   Beispiel:
   export const ABZEICHEN = [
     { id: "s7",  art: "streak", schwelle: 7,  name: "Eine Woche", icon: "🔥", farbe: "#F2994A" },
     { id: "s30", art: "streak", schwelle: 30, name: "Ein Monat",  icon: "🏅", farbe: "#2D7FF9" }
   ];
   --------------------------------------------------------------------------- */
