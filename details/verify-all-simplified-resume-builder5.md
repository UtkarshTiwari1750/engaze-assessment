I have the following verification comments after thorough review and exploration of the codebase. Implement the comments by following the instructions in the comments verbatim.

---
## Comment 1: Template and editor actions in UI are placeholders; important UX flows are not wired.

Wire `TemplateGalleryPage` button to call `templateService.applyTemplate` for a selected resume or navigate to create/apply flow. Bind Editor/Public buttons to respective services (apply template, open sharing dialog, download PDF).

### Referred Files
- /home/utkarsh/internship/engaze/client/src/pages/TemplateGalleryPage.tsx
- /home/utkarsh/internship/engaze/client/src/pages/EditorPage.tsx
- /home/utkarsh/internship/engaze/client/src/pages/PublicResumePage.tsx
- /home/utkarsh/internship/engaze/client/src/services/template.service.ts
- /home/utkarsh/internship/engaze/client/src/services/sharing.service.ts
---