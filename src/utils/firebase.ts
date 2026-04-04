// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBV5kBeO0yJvYvBw7T8uqrAufqXEDUqduc",
  authDomain: "helloworld-2756c.firebaseapp.com",
  projectId: "helloworld-2756c",
  storageBucket: "helloworld-2756c.firebasestorage.app",
  messagingSenderId: "48391307034",
  appId: "1:48391307034:web:f2568326156cd4520176a3",
  measurementId: "G-GYCDJEHYCT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics in production
const analytics = import.meta.env.PROD ? getAnalytics(app) : null;

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export the app instance for other services
export { app };
