import { notifications } from '@mantine/notifications';
import {
  type AsyncThunkConfig,
  createAction,
  createAsyncThunk,
  type GetThunkAPI
} from '@reduxjs/toolkit';

import { api, initApi } from '@/api/api';
import type { AppStartListening } from '@/redux/listenerMiddleware';
import { ConnectionStatus } from '@/types/enums';

import type { RootState } from '../store';

import {
  onCloseConnection,
  onOpenConnection,
  setIpAddress,
  startConnection
} from './connectionSlice';

export const closeConnection = createAction('closeConnection');

function onDisconnect(thunkApi: GetThunkAPI<AsyncThunkConfig>) {
  thunkApi.dispatch(onCloseConnection());
  notifications.show({
    title: 'OpenSpace',
    message: 'Disconnected from OpenSpace',
    color: 'orange'
  });
}

export const reconnect = createAsyncThunk(
  'connection/reconnect',
  async (payload: { address: string; port: number }, thunkApi) => {
    const { connectionStatus } = (thunkApi.getState() as RootState).connection;

    if (connectionStatus === ConnectionStatus.Connected) {
      // Waits for the current connection to fully close before updating the address
      // and reconnecting
      await new Promise<void>((resolve) => {
        api.onDisconnect(() => {
          onDisconnect(thunkApi);
          resolve();
        });
        api.disconnect();
      });
    }

    thunkApi.dispatch(setIpAddress(payload));
    thunkApi.dispatch(startConnection());
  }
);

export const connectToOpenSpace = createAsyncThunk(
  'connection/connectToOpenSpace',
  async (_, thunkApi) => {
    async function onConnect() {
      thunkApi.dispatch(onOpenConnection());
      const { address, port } = (thunkApi.getState() as RootState).connection;
      notifications.show({
        title: 'OpenSpace',
        message: `Connected to OpenSpace ${address}:${port}`
      });
    }

    api.onConnect(onConnect);
    api.onDisconnect(() => onDisconnect(thunkApi));
    api.connect();
  }
);

export const addConnectionListener = (startListening: AppStartListening) => {
  startListening({
    actionCreator: startConnection,
    effect: async (_, listenerApi) => {
      const { address, port } = listenerApi.getState().connection;
      notifications.show({
        title: 'OpenSpace',
        message: `Connecting to ${address}:${port}...`
      });
      initApi(address, port);
      listenerApi.dispatch(connectToOpenSpace());
    }
  });
  startListening({
    actionCreator: closeConnection,
    effect: async (_, listenerApi) => {
      const { connectionStatus } = listenerApi.getState().connection;
      if (connectionStatus !== ConnectionStatus.Disconnected) {
        api.disconnect();
      }
    }
  });
};
