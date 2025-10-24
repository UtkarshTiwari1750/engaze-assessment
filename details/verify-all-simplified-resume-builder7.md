I have the following verification comments after thorough review and exploration of the codebase. Implement the comments by following the instructions in the comments verbatim.

---
## Comment 1: JSONB GIN indexes for searchability mentioned in plan are not created.

Add Postgres GIN indexes for JSONB fields where querying is expected (e.g., `ResumeVersion.snapshotJson`, `Template.layoutConfig`, `Theme.colorScheme`). Use Prisma `@@index` with `type: Gin` via `@@index([field], type: Gin)` or raw SQL migrations.

### Referred Files
- /home/utkarsh/internship/engaze/server/prisma/schema.prisma
---