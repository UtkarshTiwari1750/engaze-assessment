I have the following verification comments after thorough review and exploration of the codebase. Implement the comments by following the instructions in the comments verbatim.

---
## Comment 1: Prisma introspection requirement not followed; schema authored manually with migrations.

Create SQL DDL to set up tables, apply to the database, and then run `prisma db pull` to generate the Prisma schema based on the live DB. Update docs/scripts to reflect the introspection workflow. Ensure the Prisma client is regenerated after pulling the schema.

### Referred Files
- /home/utkarsh/internship/engaze/server/prisma/schema.prisma
- /home/utkarsh/internship/engaze/server/README.md
- /home/utkarsh/internship/engaze/server/package.json
---