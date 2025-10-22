import type { Middleware } from "@reduxjs/toolkit";
import { pushHistory } from "../slices/historySlice";

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
  const result = next(action);

  // Type-safe access to action.type (action may be unknown per middleware signature)
  const actionType = (action as { type?: string }).type;

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
