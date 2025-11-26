import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace these with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBikrbLisawta4SzwaCzlB0ZExiwRM4uaY",
  authDomain: "francetude-c3238.firebaseapp.com",
  projectId: "francetude-c3238",
  storageBucket: "francetude-c3238.firebasestorage.app",
  messagingSenderId: "713770754250",
  appId: "1:713770754250:web:e8f7d0b3cbc30429c85433",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);