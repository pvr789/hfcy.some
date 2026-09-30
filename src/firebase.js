import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyDlgEvvyPNqk6uX5bVvqDRvzRopij2Jyq4",
  authDomain: "lista-sticker26.firebaseapp.com",
  projectId: "lista-sticker26",
  storageBucket: "lista-sticker26.firebasestorage.app",
  messagingSenderId: "1061268322208",
  appId: "1:1061268322208:web:ca587dfa99ef1b95c056c5",
  measurementId: "G-T3NGQ4Z812"
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
