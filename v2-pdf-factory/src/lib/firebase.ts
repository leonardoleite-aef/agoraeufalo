import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk",
  authDomain: "agoraeufalo-3463a.firebaseapp.com",
  projectId: "agoraeufalo-3463a",
  storageBucket: "agoraeufalo-3463a.firebasestorage.app",
  messagingSenderId: "973862553705",
  appId: "1:973862553705:web:959ea81c80c28cc1dc7af8"
};

const app = initializeApp(FIREBASE_CONFIG);
export const db = getFirestore(app);
export const storage = getStorage(app);
