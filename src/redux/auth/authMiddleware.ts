import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  AuthCredential,
  getIdTokenResult,
  linkWithCredential,
  OAuthProvider,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  signInWithPopup,
  signOut,
  type Unsubscribe,
  type User
} from 'firebase/auth';

import { auth } from '@/firebase/config';
import type { ProviderKey } from '@/firebase/types';
import { getProvider } from '@/firebase/utils';
import type { AppStartListening } from '@/redux/listenerMiddleware';
import type { AuthUser } from '@/types/types';

import { wormholeApi } from '../api/wormholeApiSlice';

import { onAuthStateChanged, pendingLinkCleared, pendingLinkRequest } from './authSlice';

export const startAuthListening = createAction('startAuthListening');
export const stopAuthListening = createAction('stopAuthListening');
let unsubscribeAuthState: Unsubscribe | null = null;

// The `pendingCredential` is a temporary holding for the credential extracted from a
// failed sign-in attempt due to an existing account with a different provider. Example:
// User tries to sign in with GitHub, but they already have an account under that email
// via Google. Thus, Firebase throws an 'auth/account-exists-with-different-credential'
// error. We prompt users to sign in with the original provider (Google), and if they do,
// we link the pending GitHub credential to their account so they can sign in with either.
let pendingCredential: AuthCredential | null = null;

async function toAuthUser(user: User): Promise<AuthUser> {
  const tokenResult = await getIdTokenResult(user);
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    providerIds: user.providerData.map((p) => p.providerId),
    isAdmin: tokenResult.claims.admin === true
  };
}

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, thunkApi) => {
    // Cleanup any existing listener before starting a new one
    if (unsubscribeAuthState) {
      unsubscribeAuthState();
    }

    unsubscribeAuthState = onFirebaseAuthStateChanged(auth, async (user) => {
      thunkApi.dispatch(onAuthStateChanged(user ? await toAuthUser(user) : null));

      if (!user) {
        thunkApi.dispatch(wormholeApi.util.resetApiState());
      }

      // If user tried to sign in with a provider but has an existing account with another
      // provider, we link the pending credential to the user's account after successful
      // sign-in with the original provider
      if (user && pendingCredential) {
        const credential = pendingCredential;
        try {
          await linkWithCredential(user, credential);
        } finally {
          thunkApi.dispatch(pendingLinkCleared());
          pendingCredential = null;
        }
      }
    });
  }
);

export const signInWithProvider = createAsyncThunk(
  'auth/signInWithProvider',
  async (providerKey: ProviderKey, thunkApi) => {
    thunkApi.dispatch(pendingLinkCleared());
    const provider = getProvider(providerKey);

    try {
      await signInWithPopup(auth, provider);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        pendingCredential = OAuthProvider.credentialFromError(error);
        const email = error.customData?.email ?? 'this email';
        thunkApi.dispatch(pendingLinkRequest(email));
        throw new Error(
          `An account already exists with ${email}. Please sign in with the provider ` +
            'you used originally to link your accounts.',
          { cause: error }
        );
      }
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      throw new Error(
        `An error occurred during sign-in: '${error?.message}'. Please try again.`,
        { cause: error }
      );
    }
  }
);

export const signOutUser = createAsyncThunk('auth/signOutUser', async () => {
  await signOut(auth);
});

export const addAuthListener = (startListening: AppStartListening) => {
  startListening({
    actionCreator: startAuthListening,
    effect: async (_, listenerApi) => {
      listenerApi.dispatch(initializeAuth());
    }
  });
  startListening({
    actionCreator: stopAuthListening,
    effect: async () => {
      if (unsubscribeAuthState) {
        unsubscribeAuthState();
        unsubscribeAuthState = null;
      }
    }
  });
};
