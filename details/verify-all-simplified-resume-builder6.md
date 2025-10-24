I have the following verification comments after thorough review and exploration of the codebase. Implement the comments by following the instructions in the comments verbatim.

---
## Comment 1: Section/item dataJson is not validated against section type defaults.

Introduce Zod schemas per section type keyed by `SectionType.key` and validate `dataJson` before create/update. Reject incompatible payloads and/or normalize to default fields.

### Referred Files
- /home/utkarsh/internship/engaze/server/src/modules/resume/item.service.ts
- /home/utkarsh/internship/engaze/server/src/modules/resume/section.service.ts
- /home/utkarsh/internship/engaze/server/src/types/dtos.ts
---