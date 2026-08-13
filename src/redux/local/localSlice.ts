import { notifications } from '@mantine/notifications';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { SessionData } from '@/types/types';

export interface LocalState {
  connectedSessionId: string | null;
}

const initialState: LocalState = {
  connectedSessionId: null
};

export const localSlice = createSlice({
  name: 'local',
  initialState,
  reducers: {
    setConnectedSessionId: (state, action: PayloadAction<SessionData | null>) => {
      const sessionId = action.payload?.id ?? null;
      state.connectedSessionId = sessionId;
      if (sessionId) {
        notifications.show({
          title: 'Session',
          message: `Joined session ${action.payload?.roomName}`
        });
      } else {
        notifications.show({
          title: 'Session',
          message: 'Disconnected from session'
        });
      }
      return state;
    }
  }
});

export const { setConnectedSessionId } = localSlice.actions;
export const localReducer = localSlice.reducer;
