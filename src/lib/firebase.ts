// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ✅ Firebase configuration with fallback
const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key')
    ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    : 'AIzaSyAUp8mkrLHEUuT6zZppd2JAxdJfoYYFafc',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'whatsorder-f2c7b.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'whatsorder-f2c7b',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'whatsorder-f2c7b.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '735632166574',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:735632166574:web:249f558631e83a8b48673f',
};

// ✅ Prevent reinitializing Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ✅ Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Sign-in functions
export const signInAnonymouslyUser = () => signInAnonymously(auth);