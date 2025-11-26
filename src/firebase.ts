import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration loaded from Vite environment variables with safe
// fallbacks. The fallbacks are the values you previously pasted; keeping
// them here only as a temporary measure to ensure the deployed app works.
// For best practice, remove the fallback values and rely on Vercel/GitHub
// Secrets instead.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBikrbLisawta4SzwaCzlB0ZExiwRM4uaY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'francetude-c3238.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'francetude-c3238',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'francetude-c3238.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '713770754250',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:713770754250:web:e8f7d0b3cbc30429c85433',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-TSZV233PW7',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);