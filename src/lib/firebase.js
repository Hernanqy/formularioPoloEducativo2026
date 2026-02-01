// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBEC_hoZ7nvTLtoXiiKUKAqzRmaSlXLyY",
  authDomain: "formularioactividades-9ab58.firebaseapp.com",
  projectId: "formularioactividades-9ab58",
  storageBucket: "formularioactividades-9ab58.firebasestorage.app",
  messagingSenderId: "889779287379",
  appId: "1:889779287379:web:273a91bc2fb2645feadda6",
  measurementId: "G-J30SWL4R5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);