import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA43pY3J8WL8IxeuPiQXqu-1Yv_vJityI0",
  authDomain: "ittedbodiesapp.firebaseapp.com",
  databaseURL: "https://ittedbodiesapp-default-rtdb.firebaseio.com/",
  projectId: "ittedbodiesapp",
  storageBucket: "ittedbodiesapp.appspot.com",
  messagingSenderId: "91788918036",
  appId: "1:91788918036:web:d8e8c235f5b168d6685601",
  measurementId: "G-745M66YCZ9"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
