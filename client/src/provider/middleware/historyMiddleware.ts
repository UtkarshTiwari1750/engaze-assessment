import type { Middleware } from "@reduxjs/toolkit";
import { pushHistory, undo, redo } from "../slices/historySlice";
import { setCurrentResume } from "../slices/resumeSlice";
import { setCurrentDesign } from "../slices/templateSlice";

// Actions that should trigger history tracking
const TRACKABLE_ACTIONS = [
  "resume/updateResumeLocal",
  "resume/addSection",
  "resume/updateSection",
  "resume/deleteSection",
  "resume/reorderSections",
  "resume/addItem",
  "resume/updateItem",
  "resume/deleteItem",
  "resume/reorderItems",
  "template/updateDesignLocal",
];

// Debounce settings for high-frequency actions
const DEBOUNCED_ACTIONS = [
  "resume/updateItem", // For typing in content editable fields
];

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 1000; // 1 second

export const historyMiddleware: Middleware = (store) => (next) => (action) => {
  const actionType = (action as { type?: string }).type;

  // Handle undo/redo actions
  if (actionType === "history/undo") {
    const state = store.getState();
    const { past } = state.history;

    if (past.length > 0) {
      // Get the previous state
      const previousState = past[past.length - 1];

      // Dispatch the undo action
      const result = next(action);

      // Restore the previous state
      if (previousState.resume) {
        store.dispatch(setCurrentResume(previousState.resume));
      }
      if (previousState.template) {
        store.dispatch(setCurrentDesign(previousState.template));
      }

      return result;
    }
    return next(action);
  }

  if (actionType === "history/redo") {
    const state = store.getState();
    const { future } = state.history;

    if (future.length > 0) {
      // Get the next state
      const nextState = future[0];

      // Dispatch the redo action
      const result = next(action);

      // Restore the next state
      if (nextState.resume) {
        store.dispatch(setCurrentResume(nextState.resume));
      }
      if (nextState.template) {
        store.dispatch(setCurrentDesign(nextState.template));
      }

      return result;
    }
    return next(action);
  }

  const result = next(action);

  // Check if this action should be tracked
  if (actionType && TRACKABLE_ACTIONS.includes(actionType)) {
    const state = store.getState();

    // For debounced actions, wait before pushing to history
    if (actionType && DEBOUNCED_ACTIONS.includes(actionType)) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        store.dispatch(
          pushHistory({
            resume: state.resume.currentResume,
            template: state.template.currentDesign,
            timestamp: Date.now(),
          })
        );
      }, DEBOUNCE_DELAY);
    } else {
      // Immediate history push for non-debounced actions
      store.dispatch(
        pushHistory({
          resume: state.resume.currentResume,
          template: state.template.currentDesign,
          timestamp: Date.now(),
        })
      );
    }
  }

  return result;
};

export default historyMiddleware;
