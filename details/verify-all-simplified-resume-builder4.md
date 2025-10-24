I have the following verification comments after thorough review and exploration of the codebase. Implement the comments by following the instructions in the comments verbatim.

---
## Comment 1: PDF public download route uses POST; client has no corresponding service call/button wiring.

Implement `sharingService.downloadPublicPdf(slug, password?)` that calls `POST /api/share/:slug/pdf` and triggers a file download (Blob). Wire the button in `PublicResumePage.tsx` to call it and handle password-protected cases.

### Referred Files
- /home/utkarsh/internship/engaze/server/src/modules/pdf/pdf.routes.ts
- /home/utkarsh/internship/engaze/client/src/config/api.config.ts
- /home/utkarsh/internship/engaze/client/src/pages/PublicResumePage.tsx
---