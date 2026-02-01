import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  // 🔽 pegá acá tu config completa de Firebase
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
  // storageBucket: "...",
  // messagingSenderId: "...",
  // appId: "..."
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ✅ Cache offline (si falla, no rompe)
enableIndexedDbPersistence(db).catch(() => {});
