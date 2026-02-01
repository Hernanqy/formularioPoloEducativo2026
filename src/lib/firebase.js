import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBEC_hoZ7nvTLtoXiiKUKAqzRmaSlXLyY",
  authDomain: "formularioactividades-9ab58.firebaseapp.com",
  projectId: "formularioactividades-9ab58",
  storageBucket: "formularioactividades-9ab58.firebasestorage.app",
  messagingSenderId: "889779287379",
  appId: "1:889779287379:web:273a91bc2fb2645feadda6",
  measurementId: "G-J30SWL4R5J"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
