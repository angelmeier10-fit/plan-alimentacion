// Actualiza solo el plan de Ángel en Firestore (perfil, días e intercambiables).
// No toca a Gabriela ni recetas, snacks, compras, etc.
//
// PowerShell:
//   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\service-account.json"; node scripts/seedAngel.js

import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { PROFILES, DAYS, INTERCHANGEABLE } from "./seedData.js";

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
  console.error("Error: falta GOOGLE_APPLICATION_CREDENTIALS (ruta al .json de la cuenta de servicio).");
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(credentialsPath, "utf8"))) });
const db = getFirestore();

async function seedAngel() {
  await db.doc("profiles/angel").set(PROFILES.angel);
  console.log("profiles/angel ok");

  for (let i = 0; i < DAYS.angel.length; i++) {
    await db.doc(`days/angel/list/day${i + 1}`).set(DAYS.angel[i]);
    console.log(`days/angel/list/day${i + 1} ok`);
  }

  await db.doc("interchangeable/angel").set(INTERCHANGEABLE.angel);
  console.log("interchangeable/angel ok");

  console.log("Listo: solo Ángel actualizado.");
  process.exit(0);
}

seedAngel().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
