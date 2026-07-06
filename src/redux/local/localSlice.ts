import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
    setConnectedSessionId: (state, action: PayloadAction<string | null>) => {
      state.connectedSessionId = action.payload;
      return state;
    }
  }
});

export const { setConnectedSessionId } = localSlice.actions;
export const localReducer = localSlice.reducer;
