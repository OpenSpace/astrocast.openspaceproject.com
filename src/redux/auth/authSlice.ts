import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { AuthStatus } from '@/types/enums';
import type { AuthUser } from '@/types/types';

export interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  pendingEmailLink: string | null;
}

const initialState: AuthState = {
  user: null,
  status: AuthStatus.Initializing,
  pendingEmailLink: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    onAuthStateChanged: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.status = action.payload
        ? AuthStatus.Authenticated
        : AuthStatus.Unauthenticated;
      return state;
    },
    pendingLinkRequest: (state, action: PayloadAction<string>) => {
      state.pendingEmailLink = action.payload;
      return state;
    },
    pendingLinkCleared: (state) => {
      state.pendingEmailLink = null;
      return state;
    }
  }
});

export const { onAuthStateChanged, pendingLinkRequest, pendingLinkCleared } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
