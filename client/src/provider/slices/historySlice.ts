import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { MAX_UNDO_HISTORY } from "@/config/constants";

interface HistoryState {
  past: any[];
  future: any[];
  canUndo: boolean;
  canRedo: boolean;
}

const initialState: HistoryState = {
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    pushHistory: (state, action: PayloadAction<any>) => {
      // Add current state to past
      state.past.push(action.payload);

      // Limit history size
      if (state.past.length > MAX_UNDO_HISTORY) {
        state.past.shift();
      }

      // Clear future when new action is performed
      state.future = [];

      // Update flags
      state.canUndo = state.past.length > 0;
      state.canRedo = false;
    },
    undo: (state) => {
      if (state.past.length > 0) {
        // Move current state to future
        const current = state.past.pop();
        if (current) {
          state.future.unshift(current);
        }

        // Update flags
        state.canUndo = state.past.length > 0;
        state.canRedo = true;
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        // Move future state to past
        const next = state.future.shift();
        if (next) {
          state.past.push(next);
        }

        // Update flags
        state.canUndo = true;
        state.canRedo = state.future.length > 0;
      }
    },
    clearHistory: (state) => {
      state.past = [];
      state.future = [];
      state.canUndo = false;
      state.canRedo = false;
    },
  },
});

export const { pushHistory, undo, redo, clearHistory } = historySlice.actions;
export default historySlice.reducer;
