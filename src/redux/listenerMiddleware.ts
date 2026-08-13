import { createListenerMiddleware, type TypedStartListening } from '@reduxjs/toolkit';

import { addAuthListener } from './auth/authMiddleware';
import { addConnectionListener } from './connection/connectionMiddleware';
import type { AppDispatch, RootState } from './store';

export const listenerMiddleware = createListenerMiddleware();
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

const startAppListening = listenerMiddleware.startListening as AppStartListening;

addAuthListener(startAppListening);
addConnectionListener(startAppListening);
