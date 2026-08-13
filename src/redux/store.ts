import { configureStore } from '@reduxjs/toolkit';

import { databaseApi } from './api/databaseApiSlice';
import { wormholeApi } from './api/wormholeApiSlice';
import { authReducer } from './auth/authSlice';
import { connectionReducer } from './connection/connectionSlice';
import { localReducer } from './local/localSlice';
import { listenerMiddleware } from './listenerMiddleware';

export const store = configureStore({
  reducer: {
    [databaseApi.reducerPath]: databaseApi.reducer,
    [wormholeApi.reducerPath]: wormholeApi.reducer,
    auth: authReducer,
    connection: connectionReducer,
    local: localReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      listenerMiddleware.middleware,
      databaseApi.middleware,
      wormholeApi.middleware
    ]),
  devTools: true
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
