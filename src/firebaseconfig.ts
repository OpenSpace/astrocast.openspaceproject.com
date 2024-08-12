/*****************************************************************************************
 *                                                                                       *
 * Wormhole                                                                              *
 *                                                                                       *
 * Copyright (c) 2022-2024                                                               *
 *                                                                                       *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this  *
 * software and associated documentation files (the "Software"), to deal in the Software *
 * without restriction, including without limitation the rights to use, copy, modify,    *
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to    *
 * permit persons to whom the Software is furnished to do so, subject to the following   *
 * conditions:                                                                           *
 *                                                                                       *
 * The above copyright notice and this permission notice shall be included in all copies *
 * or substantial portions of the Software.                                              *
 *                                                                                       *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,   *
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A         *
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT    *
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF  *
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE  *
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                                         *
 ****************************************************************************************/

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth";
import { getDatabase } from "firebase/database";

// Authentication Config
const firebaseAuthenticationConfig = {
  apiKey: import.meta.env.VITE_AUTH_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_AUTH_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_AUTH_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_AUTH_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_AUTH_FIREBASE_APP_ID,
};

// Realtime database config
const firebaseDatabaseConfig = {
  apiKey: import.meta.env.VITE_DATABASE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_DATABASE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_FIREBASE_DATABASE_URL,
  projectID: import.meta.env.VITE_DATABASE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_DATABASE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_DATABASE_FIREBASE_MESSAGING_SENDER_ID,
  appID: import.meta.env.VITE_DATABASE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseDatabaseConfig);
const authApp = initializeApp(firebaseAuthenticationConfig, "auth");

export const db = getDatabase(app);
export const auth = getAuth(authApp);

export const supportedProviders = [
  GoogleAuthProvider.PROVIDER_ID,
  FacebookAuthProvider.PROVIDER_ID,
  GithubAuthProvider.PROVIDER_ID,
  TwitterAuthProvider.PROVIDER_ID,
] as const;

/**
 * @return The provider object for the given `providerID`
 */
export const getProvider = (providerID: string) => {
  switch (providerID) {
    case GoogleAuthProvider.PROVIDER_ID:
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: "select_account" });
      return googleProvider;
    case FacebookAuthProvider.PROVIDER_ID:
      return new FacebookAuthProvider();
    case GithubAuthProvider.PROVIDER_ID:
      return new GithubAuthProvider();
    case TwitterAuthProvider.PROVIDER_ID:
      return new TwitterAuthProvider();
    default:
      throw new Error(`No provider implemented for ${providerID}`);
  }
};

/**
 * Attempts to sign in with the given provider, if user already has an existing account
 * with another provider it throws an error with the list of available login methods
 * for the user
 *
 * @param providerKey Provider to sign in with
 */
export const signInWith = async (providerKey: string) => {
  const provider = getProvider(providerKey);

  try {
    await signInWithPopup(auth, provider);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error.customData.email;
      const methods = await fetchSignInMethodsForEmail(auth, email);
      throw methods;
    } else {
      console.log(error);
    }
  }
};
