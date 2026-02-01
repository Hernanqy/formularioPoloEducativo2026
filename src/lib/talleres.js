import { db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export async function createTaller(data) {
  const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const ref = await addDoc(collection(db, "talleres"), payload);
  return ref.id;
}

export async function updateTaller(id, data) {
  const ref = doc(db, "talleres", id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteTaller(id) {
  await deleteDoc(doc(db, "talleres", id));
}

export async function listTalleres() {
  const q = query(collection(db, "talleres"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
