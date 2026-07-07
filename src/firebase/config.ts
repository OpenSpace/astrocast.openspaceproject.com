import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

import { env } from '@/config/env';

// Authentication config
const firebaseAuthenticationConfig = {
  apiKey: env.VITE_AUTH_FIREBASE_API_KEY,
  authDomain: env.VITE_AUTH_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_AUTH_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_AUTH_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_AUTH_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_AUTH_FIREBASE_APP_ID
};

// Realtime database config
const firebaseDatabaseConfig = {
  apiKey: env.VITE_DATABASE_FIREBASE_API_KEY,
  authDomain: env.VITE_DATABASE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_DATABASE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_DATABASE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_DATABASE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_DATABASE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_DATABASE_FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseDatabaseConfig, 'database');
const authApp = initializeApp(firebaseAuthenticationConfig, 'auth');

export const db = getDatabase(firebaseApp);
export const auth = getAuth(authApp);
