import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { ConnectionStatus } from '@/types/enums';

export interface ConnectionState {
  connectionStatus: ConnectionStatus;
  address: string;
  port: number;
}

const initialState: ConnectionState = {
  connectionStatus: ConnectionStatus.Connecting,
  address: 'localhost',
  port: 4682
};

export const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    startConnection: (state) => {
      state.connectionStatus = ConnectionStatus.Connecting;
      return state;
    },
    onOpenConnection: (state) => {
      state.connectionStatus = ConnectionStatus.Connected;
      return state;
    },
    onCloseConnection: (state) => {
      state.connectionStatus = ConnectionStatus.Disconnected;
      return state;
    },
    setIpAddress: (state, action: PayloadAction<{ address: string; port: number }>) => {
      state.address = action.payload.address;
      state.port = action.payload.port;
      return state;
    }
  }
});

export const { startConnection, onOpenConnection, onCloseConnection, setIpAddress } =
  connectionSlice.actions;
export const connectionReducer = connectionSlice.reducer;
