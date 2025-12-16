import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArfOso9hsrHWq8s8oiV3q6yk_ZUZaj2vg",
  authDomain: "main-app-356bb.firebaseapp.com",
  projectId: "main-app-356bb",
  storageBucket: "main-app-356bb.firebasestorage.app",
  messagingSenderId: "248138094055",
  appId: "1:248138094055:web:0ca47cace6011ade219942",
  measurementId: "G-D9DRFTWYDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore instances
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);