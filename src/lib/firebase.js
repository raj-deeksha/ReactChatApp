import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "react-65601.firebaseapp.com",
  projectId: "react-65601",
  storageBucket: "react-65601.appspot.com",
  messagingSenderId: "623829046115",
  appId: "1:623829046115:web:011c94567c48bdbf0c3956",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()


