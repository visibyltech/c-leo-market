import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase web configuration is public client configuration.
// Keep the values in Vercel environment variables when available.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDmnGXwrL6mXkG6OBMPyqhAXkYbpvidFHY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'c-leo-market.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'c-leo-market',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'c-leo-market.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '175213729231',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:175213729231:web:e6d2d79c767211f6696eba',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
