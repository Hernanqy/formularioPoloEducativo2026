import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // PEGÁ ACÁ tu config copiada de Firebase (tal cual)
};

const app = initializeApp(firebaseConfig);

// ✅ esto es lo que tu App.jsx está intentando importar:
export const db = getFirestore(app);
