// plan-alimentacion/scripts/seed.js
//
// Carga los datos iniciales del plan en Firestore. Se corre UNA sola vez
// (o cada vez que se quiera resetear los datos desde seedData.js).
//
// Usa el Admin SDK de Firebase, que se autentica con una cuenta de servicio
// y por lo tanto ignora las reglas de seguridad de Firestore (necesario
// porque las reglas exigen `request.auth != null` para escribir, y este
// script no tiene un usuario logueado).
//
// Cómo obtener la cuenta de servicio:
//   1. Firebase Console -> Configuración del proyecto -> Cuentas de servicio
//   2. "Generar nueva clave privada" -> descarga un archivo .json
//   3. Guardalo fuera del repo (nunca lo commitees) y apuntá la variable
//      de entorno GOOGLE_APPLICATION_CREDENTIALS a su ruta.
//
// Cómo correr el script:
//   GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/service-account.json node scripts/seed.js
//
// (en PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\service-account.json"; node scripts/seed.js)

import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  PROFILES, DAYS, SNACKS, INTERCHANGEABLE, EQUIVALENCES, VARIETY, SHOPPING,
} from "./seedData.js";

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
  console.error(
    "Error: falta GOOGLE_APPLICATION_CREDENTIALS.\n" +
    "Generá una clave de cuenta de servicio en Firebase Console " +
    "(Configuración del proyecto -> Cuentas de servicio -> Generar nueva clave privada) " +
    "y apuntá la variable de entorno a su ruta.\n" +
    "Ejemplo: GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/seed.js"
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(credentialsPath, "utf8"));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seed() {
  for (const [key, profile] of Object.entries(PROFILES)) {
    await db.doc(`profiles/${key}`).set(profile);
    console.log(`profiles/${key} ok`);
  }

  for (const [person, days] of Object.entries(DAYS)) {
    for (let i = 0; i < days.length; i++) {
      await db.doc(`days/${person}/list/day${i + 1}`).set(days[i]);
      console.log(`days/${person}/list/day${i + 1} ok`);
    }
  }

  await db.doc("snacks/main").set(SNACKS);
  console.log("snacks/main ok");

  for (const [person, data] of Object.entries(INTERCHANGEABLE)) {
    await db.doc(`interchangeable/${person}`).set(data);
    console.log(`interchangeable/${person} ok`);
  }

  await db.doc("equivalences/main").set({ list: EQUIVALENCES });
  console.log("equivalences/main ok");

  await db.doc("variety/main").set({ list: VARIETY });
  console.log("variety/main ok");

  await db.doc("shopping/main").set({ list: SHOPPING });
  console.log("shopping/main ok");

  console.log("Seed completo.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
