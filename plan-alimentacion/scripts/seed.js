// plan-alimentacion/scripts/seed.js
// Correr una sola vez: node scripts/seed.js
import { doc, setDoc } from "firebase/firestore";
import { db } from "../src/firebaseConfig.js";
import {
  PROFILES, DAYS, SNACKS, INTERCHANGEABLE, EQUIVALENCES, VARIETY, SHOPPING,
} from "./seedData.js";

async function seed() {
  for (const [key, profile] of Object.entries(PROFILES)) {
    await setDoc(doc(db, "profiles", key), profile);
    console.log(`profiles/${key} ok`);
  }

  for (const [person, days] of Object.entries(DAYS)) {
    for (let i = 0; i < days.length; i++) {
      await setDoc(doc(db, "days", person, "list", `day${i + 1}`), days[i]);
      console.log(`days/${person}/list/day${i + 1} ok`);
    }
  }

  await setDoc(doc(db, "snacks", "main"), SNACKS);
  console.log("snacks/main ok");

  for (const [person, data] of Object.entries(INTERCHANGEABLE)) {
    await setDoc(doc(db, "interchangeable", person), data);
    console.log(`interchangeable/${person} ok`);
  }

  await setDoc(doc(db, "equivalences", "main"), { list: EQUIVALENCES });
  console.log("equivalences/main ok");

  await setDoc(doc(db, "variety", "main"), { list: VARIETY });
  console.log("variety/main ok");

  await setDoc(doc(db, "shopping", "main"), { list: SHOPPING });
  console.log("shopping/main ok");

  console.log("Seed completo.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
