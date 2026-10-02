import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyBJBipwCGANVCYj3N8hHaLljnaDn1BzAhM",
  authDomain: "some-hfcyumbel.firebaseapp.com",
  projectId: "some-hfcyumbel",
  storageBucket: "some-hfcyumbel.firebasestorage.app",
  messagingSenderId: "110156057097",
  appId: "1:110156057097:web:026c4374931d2543dc46d8",
  measurementId: "G-P4ZYJDZ9L6"
};

let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Error inicializando Firebase.", error);
}

export { app, db, auth };
