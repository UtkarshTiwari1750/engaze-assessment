import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import resumeReducer from "./slices/resumeSlice";
import templateReducer from "./slices/templateSlice";
import historyReducer from "./slices/historySlice";
import historyMiddleware from "./middleware/historyMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
    template: templateReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredPaths: ["register", "rehydrate"],
      },
    }).concat(historyMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
