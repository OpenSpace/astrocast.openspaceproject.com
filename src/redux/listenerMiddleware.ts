import { createListenerMiddleware, type TypedStartListening } from '@reduxjs/toolkit';

import { addConnectionListener } from './connection/connectionMiddleware';
import type { AppDispatch, RootState } from './store';

export const listenerMiddleware = createListenerMiddleware();
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

const startAppListening = listenerMiddleware.startListening as AppStartListening;

addConnectionListener(startAppListening);
