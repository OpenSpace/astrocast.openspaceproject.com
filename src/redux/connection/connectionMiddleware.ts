import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { api } from '@/api/api';
import type { AppStartListening } from '@/redux/listenerMiddleware';
import { ConnectionStatus } from '@/types/enums';

import { onCloseConnection, onOpenConnection, startConnection } from './connectionSlice';

export const closeConnection = createAction('closeConnection');

export const connectToOpenSpace = createAsyncThunk(
  'connection/connectToOpenSpace',
  async (_, thunkApi) => {
    async function onConnect() {
      thunkApi.dispatch(onOpenConnection());
    }

    async function onDisconnect() {
      thunkApi.dispatch(onCloseConnection());

      const reconnectionInterval = 1000;
      setTimeout(() => {
        api.connect();
      }, reconnectionInterval);
    }

    api.onConnect(onConnect);
    api.onDisconnect(onDisconnect);
    api.connect();
  }
);

export const addConnectionListener = (startListening: AppStartListening) => {
  startListening({
    actionCreator: startConnection,
    effect: async (_, listenerApi) => {
      listenerApi.dispatch(connectToOpenSpace());
    }
  });
  startListening({
    actionCreator: closeConnection,
    effect: async (_, listenerApi) => {
      const { connectionStatus } = listenerApi.getState().connection;
      if (connectionStatus === ConnectionStatus.Connected) {
        api.disconnect();
      }
    }
  });
};
