import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch(() => {});
