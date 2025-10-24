I have the following verification comments after thorough review and exploration of the codebase. Implement the comments by following the instructions in the comments verbatim.

---
## Comment 1: Drag-and-drop reordering is not implemented in UI despite dependencies present.

Implement DnD in the left section list and within section items using `@dnd-kit/sortable`. On drop, dispatch `reorderSections`/`reorderItems` in the store and call the respective API endpoints to persist order.

### Referred Files
- /home/utkarsh/internship/engaze/client/src/components/editor/SectionList.tsx
- /home/utkarsh/internship/engaze/client/src/pages/EditorPage.tsx
- /home/utkarsh/internship/engaze/client/src/services/resume.service.ts
---