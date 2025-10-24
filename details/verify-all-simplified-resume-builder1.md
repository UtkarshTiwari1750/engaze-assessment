I have the following verification comments after thorough review and exploration of the codebase. Implement the comments by following the instructions in the comments verbatim.

---
## Comment 1: Undo/redo not wired to UI and does not restore state; history slice only stores snapshots.

Add reducers or a root-level handler to apply history snapshots back into `resume` and `template` slices on `undo`/`redo`. Wire toolbar buttons and keyboard shortcuts in `EditorPage.tsx`. Implement `restoreVersion()` in `server/src/modules/resume/resume.service.ts` to rehydrate sections/items from `snapshotJson`.

### Referred Files
- /home/utkarsh/internship/engaze/client/src/provider/slices/historySlice.ts
- /home/utkarsh/internship/engaze/client/src/provider/middleware/historyMiddleware.ts
- /home/utkarsh/internship/engaze/client/src/pages/EditorPage.tsx
- /home/utkarsh/internship/engaze/server/src/modules/resume/resume.service.ts
---