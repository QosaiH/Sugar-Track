// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgRgbcnyLKmayk3Vf3_1ZRW-t_SLFHG78",
  authDomain: "classexample-d21be.firebaseapp.com",
  databaseURL:
    "https://classexample-d21be-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "classexample-d21be",
  storageBucket: "classexample-d21be.firebasestorage.app",
  messagingSenderId: "1038258876561",
  appId: "1:1038258876561:web:aefb493daaafeb2ad20f30",
  measurementId: "G-HQG9BP7GQB",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
