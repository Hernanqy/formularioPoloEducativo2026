import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "....",
  authDomain: "....",
  projectId: "....",          // ✅ OBLIGATORIO
  storageBucket: "....",
  messagingSenderId: "....",
  appId: "....",
};

const app = initializeApp(firebaseConfig);

// ✅ esto es lo que tu App.jsx está intentando importar:
export const db = getFirestore(app);
