import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Authentication config
const firebaseAuthenticationConfig = {
  apiKey: import.meta.env.VITE_AUTH_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_AUTH_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_AUTH_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_AUTH_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_AUTH_FIREBASE_APP_ID
};

// Realtime database config
const firebaseDatabaseConfig = {
  apiKey: import.meta.env.VITE_DATABASE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_DATABASE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_DATABASE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_DATABASE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_DATABASE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_DATABASE_FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseDatabaseConfig, 'database');
const authApp = initializeApp(firebaseAuthenticationConfig, 'auth');

export const db = getDatabase(firebaseApp);
export const auth = getAuth(authApp);
