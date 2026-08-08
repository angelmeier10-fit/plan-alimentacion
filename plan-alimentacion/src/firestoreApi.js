// plan-alimentacion/src/firestoreApi.js
import { collection, doc, onSnapshot, query } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

export function subscribeProfiles(cb, onError) {
  const unsubs = ["angel", "gabriela"].map((key) =>
    onSnapshot(
      doc(db, "profiles", key),
      (snap) => {
        cb(key, snap.data());
      },
      (err) => {
        console.error("subscribeProfiles error:", err);
        onError?.(err);
      }
    )
  );
  return () => unsubs.forEach((u) => u());
}

export function subscribeDays(person, cb, onError) {
  const q = query(collection(db, "days", person, "list"));
  return onSnapshot(
    q,
    (snap) => {
      const days = snap.docs
        .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
        .map((d) => d.data());
      cb(days);
    },
    (err) => {
      console.error("subscribeDays error:", err);
      onError?.(err);
    }
  );
}

export function subscribeSnacks(cb, onError) {
  return onSnapshot(
    doc(db, "snacks", "main"),
    (snap) => cb(snap.data()),
    (err) => {
      console.error("subscribeSnacks error:", err);
      onError?.(err);
    }
  );
}

export function subscribeInterchangeable(person, cb, onError) {
  return onSnapshot(
    doc(db, "interchangeable", person),
    (snap) => cb(snap.data()),
    (err) => {
      console.error("subscribeInterchangeable error:", err);
      onError?.(err);
    }
  );
}

export function subscribeEquivalences(cb, onError) {
  return onSnapshot(
    doc(db, "equivalences", "main"),
    (snap) => cb(snap.data()?.list ?? []),
    (err) => {
      console.error("subscribeEquivalences error:", err);
      onError?.(err);
    }
  );
}

export function subscribeVariety(cb, onError) {
  return onSnapshot(
    doc(db, "variety", "main"),
    (snap) => cb(snap.data()?.list ?? []),
    (err) => {
      console.error("subscribeVariety error:", err);
      onError?.(err);
    }
  );
}

export function subscribeShopping(cb, onError) {
  return onSnapshot(
    doc(db, "shopping", "main"),
    (snap) => cb(snap.data()?.list ?? []),
    (err) => {
      console.error("subscribeShopping error:", err);
      onError?.(err);
    }
  );
}

export function subscribeRecipes(cb) {
  return onSnapshot(doc(db, "recipes", "main"), (snap) => cb(snap.data()?.list ?? []));
}
