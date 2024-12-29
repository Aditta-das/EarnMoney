import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBY4A6rxmh2wi2-tEkvLf-tw-HDZQfWX44",
  authDomain: "myvideos-6fcc4.firebaseapp.com",
  projectId: "myvideos-6fcc4",
  storageBucket: "myvideos-6fcc4.firebasestorage.app",
  messagingSenderId: "276715023278",
  appId: "1:276715023278:web:a5f805a15a62633dae763f",
  measurementId: "G-ZZ7LDVBZFC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth=getAuth(app);
const db=getFirestore(app);
export { app, auth, db };