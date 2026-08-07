// plan-alimentacion/src/firestoreApi.js
import { collection, doc, onSnapshot, query } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

export function subscribeProfiles(cb) {
  const unsubs = ["angel", "gabriela"].map((key) =>
    onSnapshot(doc(db, "profiles", key), (snap) => {
      cb(key, snap.data());
    })
  );
  return () => unsubs.forEach((u) => u());
}

export function subscribeDays(person, cb) {
  const q = query(collection(db, "days", person, "list"));
  return onSnapshot(q, (snap) => {
    const days = snap.docs
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
      .map((d) => d.data());
    cb(days);
  });
}

export function subscribeSnacks(cb) {
  return onSnapshot(doc(db, "snacks", "main"), (snap) => cb(snap.data()));
}

export function subscribeInterchangeable(person, cb) {
  return onSnapshot(doc(db, "interchangeable", person), (snap) => cb(snap.data()));
}

export function subscribeEquivalences(cb) {
  return onSnapshot(doc(db, "equivalences", "main"), (snap) => cb(snap.data()?.list ?? []));
}

export function subscribeVariety(cb) {
  return onSnapshot(doc(db, "variety", "main"), (snap) => cb(snap.data()?.list ?? []));
}

export function subscribeShopping(cb) {
  return onSnapshot(doc(db, "shopping", "main"), (snap) => cb(snap.data()?.list ?? []));
}
