import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7Owul2wb8JVIpE274gXLTkUkG3fZ6PC0",
  authDomain: "committed-bodies-website.firebaseapp.com",
  projectId: "committed-bodies-website",
  storageBucket: "committed-bodies-website.appspot.com",
  messagingSenderId: "1028837700024",
  appId: "1:1028837700024:web:6799ca191a0cb76f195f4d"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
