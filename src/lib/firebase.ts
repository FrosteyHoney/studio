import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaJRgNkNUTeJhTVAu0IcAJNfsqmL987-U",
  authDomain: "apptest-b0690.firebaseapp.com",
  projectId: "apptest-b0690",
  storageBucket: "apptest-b0690.appspot.com",
  messagingSenderId: "439946723338",
  appId: "1:439946723338:web:74f68cd13b6fc9fff29ff3"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
