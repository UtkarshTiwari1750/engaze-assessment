I have created the following plan after thorough exploration and analysis of the codebase. Follow the below plan verbatim. Trust the files and references. Do not re-verify what's written in the plan. Explore only when absolutely necessary. First implement all the proposed file changes and then I'll review all the changes together at the end.

### Observations

The codebase is a minimal starter template with:
- **Client**: Vite + React 19 + TypeScript + Redux Toolkit + Tailwind CSS v4 + shadcn UI (only button component exists)
- **Server**: Bun + Express + Prisma (no schema yet) + PostgreSQL
- **Current state**: Only a counter example in Redux, no authentication, no resume builder features, no database schema
- **Path aliases**: `@/` configured for client-side imports
- **shadcn config**: New York style with neutral base color, CSS variables enabled, lucide icons

The task requires building a full-featured resume builder with on-canvas editing, template switching, design customization, drag-and-drop reordering, undo-redo, PDF export, and public sharing capabilities.

### Approach

**Architecture Overview:**

1. **Database Layer**: Design normalized PostgreSQL schema with Prisma ORM using introspection workflow - users, resumes, sections, section_items, templates, themes, sharing_links tables with proper relationships and ordering fields

2. **Backend Services**: Implement OOP-based service architecture with separate modules for auth, resume, template, and sharing - each with controllers, services, DTOs, and validation middleware

3. **State Management**: Redux Toolkit with multiple slices (auth, resume, templates, design, history) + undo-redo middleware using Immer patches for efficient history tracking + TanStack Query for server state synchronization

4. **Frontend Architecture**: Component-based structure with routing (react-router-dom), editor canvas with on-canvas editing, sidebar controls, template gallery, drag-and-drop sections (@dnd-kit), and responsive layouts using shadcn components

5. **Real-time Persistence**: Debounced auto-save with optimistic updates, localStorage caching for offline editing, conflict resolution on sync

6. **PDF Generation**: Use @react-pdf/renderer for text-based PDF export with template-driven layouts matching on-screen designs

7. **Public Sharing**: Generate unique shareable links with optional password protection and expiry dates

### Reasoning

I explored the repository structure to understand the minimal starter setup, examined existing configuration files (Vite, TypeScript, shadcn, Redux store), reviewed the current dependencies, and researched best practices for resume builder database schemas, Redux undo-redo implementation patterns, and text-based PDF generation approaches to inform the comprehensive implementation plan.

## Mermaid Diagram

sequenceDiagram
    participant User
    participant Frontend
    participant Redux
    participant TanStack Query
    participant Backend API
    participant Database
    
    User->>Frontend: Login/Register
    Frontend->>Backend API: POST /auth/login
    Backend API->>Database: Verify credentials
    Database-->>Backend API: User data
    Backend API-->>Frontend: JWT token + user
    Frontend->>Redux: Store auth state
    Frontend->>localStorage: Cache token
    
    User->>Frontend: Create/Open Resume
    Frontend->>Backend API: GET /resumes/:id
    Backend API->>Database: Fetch resume with sections
    Database-->>Backend API: Resume data
    Backend API-->>Frontend: Resume JSON
    Frontend->>Redux: Load resume state
    Frontend->>localStorage: Cache draft
    
    User->>Frontend: Edit section (on-canvas)
    Frontend->>Redux: Update section action
    Redux->>Redux: History middleware captures state
    Frontend->>TanStack Query: Debounced mutation
    TanStack Query->>Backend API: PATCH /resumes/:id/sections/:sectionId
    Backend API->>Database: Update section
    Database-->>Backend API: Success
    Backend API-->>Frontend: Updated section
    
    User->>Frontend: Drag-drop reorder
    Frontend->>Redux: Reorder sections action
    Frontend->>Backend API: PUT /resumes/:id/sections/reorder
    Backend API->>Database: Update positions (transaction)
    Database-->>Backend API: Success
    
    User->>Frontend: Change template
    Frontend->>Redux: Apply template action
    Frontend->>Backend API: POST /resumes/:id/template
    Backend API->>Database: Update ResumeTemplate
    Database-->>Backend API: Success
    Frontend->>Frontend: Re-render with new template
    
    User->>Frontend: Undo (Ctrl+Z)
    Frontend->>Redux: Undo action
    Redux->>Redux: Restore from history.past
    Frontend->>Frontend: Re-render canvas
    
    User->>Frontend: Download PDF
    Frontend->>Backend API: GET /resumes/:id/pdf
    Backend API->>Backend API: Generate PDF with @react-pdf/renderer
    Backend API-->>Frontend: PDF buffer
    Frontend->>User: Download file
    
    User->>Frontend: Create sharing link
    Frontend->>Backend API: POST /resumes/:id/share
    Backend API->>Database: Create SharingLink
    Database-->>Backend API: Link with slug
    Backend API-->>Frontend: Shareable URL
    Frontend->>User: Display link + copy button

## Proposed File Changes

### server/prisma/schema.prisma(MODIFY)

Create Prisma schema file defining the complete database structure:

- **User model**: id, email (unique), name, passwordHash, createdAt, updatedAt with relations to resumes
- **Resume model**: id, userId, title, slug (unique), status (draft/published/archived), activeVersionId, createdAt, updatedAt with relations to user, sections, template settings, versions, and sharing links
- **ResumeVersion model**: id, resumeId, versionNum, snapshotJson (JSONB for full state), createdAt for undo-redo history
- **Template model**: id, key (unique), name, description, previewImage, layoutConfig (JSONB), isPublic, createdAt
- **Theme model**: id, templateId, name, colorScheme (JSONB), typography (JSONB), spacing (JSONB), createdAt
- **ResumeTemplate model**: resumeId (PK), templateId, themeId, customOverrides (JSONB) for per-resume design settings
- **SectionType model**: id, key (unique), name, isSingleton (boolean), defaultFields (JSONB) for section type catalog
- **ResumeSection model**: id, resumeId, sectionTypeId, heading, position (integer for ordering), visible, layoutConfig (JSONB), createdAt, updatedAt
- **SectionItem model**: id, sectionId, position, dataJson (JSONB for flexible content), createdAt, updatedAt
- **SharingLink model**: id, resumeId, slug (unique), visibility (private/unlisted/public), passwordHash (nullable), expiresAt (nullable), createdAt

Add indexes on frequently queried fields (email, slug, position) and GIN index on JSONB fields for search capabilities.

### server/prisma/seed.ts(NEW)

Create database seed script to populate initial data:

- Insert default section types (summary, experience, education, skills, projects, certifications, awards, volunteer, languages, custom)
- Create 3-4 starter templates with different layouts (modern single-column, classic two-column, minimal, creative)
- Add 2-3 themes per template with different color schemes (professional blue, elegant gray, creative purple)
- Include sample layout configurations and typography settings in JSONB fields

This provides users with ready-to-use templates and ensures consistent section types across the application.

### server/src/config/prisma.ts(MODIFY)

Implement Prisma client singleton pattern:

- Import PrismaClient from @prisma/client
- Create singleton instance with proper connection pooling configuration
- Add connection lifecycle management (connect, disconnect)
- Export prisma client instance for use across services
- Add error handling for connection failures
- Include logging configuration for development vs production environments

### server/src/config/env.ts(NEW)

References: 

- server/src/constants/global.constants.ts

Create environment configuration module:

- Define typed environment variables interface (DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT, NODE_ENV, CORS_ORIGIN, etc.)
- Implement validation for required environment variables on startup
- Export configuration object with parsed and validated values
- Add default values for optional configurations
- Include type-safe access to environment variables throughout the application

### server/.env.example(NEW)

Create example environment file with all required variables:

- DATABASE_URL with PostgreSQL connection string format
- JWT_SECRET placeholder
- JWT_EXPIRES_IN (e.g., 7d)
- PORT (default 3004)
- NODE_ENV (development/production)
- CORS_ORIGIN (frontend URL)
- Add comments explaining each variable's purpose

### server/src/types(NEW)

Create types directory for shared TypeScript interfaces and types used across the backend.

### server/src/types/express.d.ts(NEW)

Extend Express Request type to include authenticated user:

- Declare module augmentation for 'express-serve-static-core'
- Add user property to Request interface with type { id: number; email: string }
- This enables type-safe access to req.user in authenticated routes

### server/src/types/dtos.ts(NEW)

Define Data Transfer Objects (DTOs) for API requests and responses:

- **Auth DTOs**: RegisterDto, LoginDto, AuthResponseDto (with user and token)
- **Resume DTOs**: CreateResumeDto, UpdateResumeDto, ResumeResponseDto, ResumeListItemDto
- **Section DTOs**: CreateSectionDto, UpdateSectionDto, ReorderSectionsDto, SectionResponseDto
- **SectionItem DTOs**: CreateItemDto, UpdateItemDto, ReorderItemsDto
- **Template DTOs**: TemplateResponseDto, ThemeResponseDto
- **Design DTOs**: UpdateDesignDto (for template, theme, and custom overrides)
- **Sharing DTOs**: CreateSharingLinkDto, SharingLinkResponseDto

All DTOs should include proper TypeScript types with optional/required field annotations.

### server/src/middleware/auth.middleware.ts(NEW)

References: 

- server/src/types/express.d.ts(NEW)

Implement JWT authentication middleware:

- Extract token from Authorization header (Bearer token)
- Verify JWT token using jsonwebtoken library
- Decode payload and attach user information to req.user
- Handle token expiration and invalid token errors
- Return 401 Unauthorized for missing or invalid tokens
- Export authenticate middleware function for protecting routes

### server/src/middleware/validation.middleware.ts(NEW)

Create validation middleware factory using Zod for request validation:

- Implement validateRequest function that accepts Zod schema
- Validate req.body, req.params, or req.query based on configuration
- Return 400 Bad Request with detailed validation errors
- Format Zod errors into user-friendly messages
- Export validation middleware factory for use in routes

### server/src/middleware/error.middleware.ts(NEW)

Implement global error handling middleware:

- Create custom error classes (AppError, ValidationError, UnauthorizedError, NotFoundError)
- Implement error handler middleware that catches all errors
- Format error responses with appropriate status codes and messages
- Log errors with stack traces in development mode
- Return sanitized error messages in production
- Handle Prisma errors (unique constraint violations, not found, etc.)
- Export error middleware and custom error classes

### server/src/utils/jwt.util.ts(NEW)

References: 

- server/src/config/env.ts(NEW)

Implement JWT utility functions:

- generateToken function that creates JWT with user payload (id, email)
- verifyToken function that validates and decodes JWT
- Use jsonwebtoken library with secret from environment configuration
- Set appropriate expiration time from config
- Export token generation and verification functions

### server/src/utils/password.util.ts(NEW)

Implement password hashing utilities using bcrypt:

- hashPassword function that hashes plain text password with salt rounds (10-12)
- comparePassword function that compares plain text with hashed password
- Export both functions for use in auth service
- Add proper error handling for hashing failures

### server/src/utils/slug.util.ts(NEW)

Create slug generation utility:

- generateSlug function that converts title to URL-friendly slug
- generateUniqueSlug function that ensures uniqueness by appending random suffix if needed
- Use slugify or custom implementation to handle special characters
- Export slug generation functions for resume and sharing link creation

### server/src/modules(NEW)

Create modules directory for organizing feature modules (auth, resume, template, sharing).

### server/src/modules/auth(NEW)

Create auth module directory for authentication-related code.

### server/src/modules/auth/auth.service.ts(NEW)

References: 

- server/src/config/prisma.ts(MODIFY)
- server/src/utils/password.util.ts(NEW)
- server/src/utils/jwt.util.ts(NEW)

Implement AuthService class with OOP principles:

- **register method**: Accept email, name, password; validate email uniqueness; hash password; create user in database; return user without password
- **login method**: Accept email, password; find user by email; compare password; throw error if invalid; return user and JWT token
- **getUserById method**: Fetch user by ID for authentication middleware
- Use Prisma client for database operations
- Implement proper error handling with custom error classes
- Follow single responsibility principle with focused methods

### server/src/modules/auth/auth.controller.ts(NEW)

References: 

- server/src/modules/auth/auth.service.ts(NEW)

Implement AuthController class:

- **register handler**: Extract RegisterDto from req.body; call authService.register; return 201 with user and token
- **login handler**: Extract LoginDto from req.body; call authService.login; return 200 with user and token
- **me handler**: Use req.user from auth middleware; return current user profile
- Implement async/await with try-catch blocks
- Use dependency injection pattern (pass authService to constructor)
- Export controller instance

### server/src/modules/auth/auth.routes.ts(NEW)

References: 

- server/src/modules/auth/auth.controller.ts(NEW)
- server/src/middleware/auth.middleware.ts(NEW)
- server/src/middleware/validation.middleware.ts(NEW)

Define authentication routes:

- POST /auth/register with validation middleware for RegisterDto
- POST /auth/login with validation middleware for LoginDto
- GET /auth/me with authentication middleware
- Use Express Router
- Apply validation middleware before controller handlers
- Export router for mounting in main app

### server/src/modules/resume(NEW)

Create resume module directory for resume management code.

### server/src/modules/resume/resume.service.ts(NEW)

References: 

- server/src/config/prisma.ts(MODIFY)

Implement ResumeService class with comprehensive resume operations:

- **createResume**: Create new resume with default template, generate unique slug, initialize with empty sections
- **getResumeById**: Fetch resume with all sections, items, template settings; verify ownership
- **getUserResumes**: List all resumes for authenticated user with pagination
- **updateResume**: Update title, status; regenerate slug if title changes
- **deleteResume**: Soft delete or hard delete resume
- **createVersion**: Save current resume state as version snapshot in ResumeVersion table for undo-redo
- **restoreVersion**: Restore resume to specific version by copying snapshot data
- Use Prisma transactions for multi-table operations
- Include proper error handling and authorization checks

### server/src/modules/resume/section.service.ts(NEW)

References: 

- server/src/config/prisma.ts(MODIFY)

Implement SectionService class for section management:

- **createSection**: Add new section to resume with specified type, heading, position
- **updateSection**: Update section heading, visibility, layout config
- **deleteSection**: Remove section and reorder remaining sections
- **reorderSections**: Update position values for multiple sections in single transaction
- **getSectionTypes**: Fetch all available section types from catalog
- Use Prisma transactions for position updates to maintain consistency
- Validate section type exists and handle singleton constraints

### server/src/modules/resume/item.service.ts(NEW)

References: 

- server/src/config/prisma.ts(MODIFY)

Implement ItemService class for section item management:

- **createItem**: Add new item to section with position and data JSON
- **updateItem**: Update item data JSON (experience details, education info, etc.)
- **deleteItem**: Remove item and reorder remaining items
- **reorderItems**: Update position values for items within a section
- Validate data JSON structure based on section type
- Use transactions for position updates

### server/src/modules/resume/resume.controller.ts(NEW)

References: 

- server/src/modules/resume/resume.service.ts(NEW)
- server/src/modules/resume/section.service.ts(NEW)
- server/src/modules/resume/item.service.ts(NEW)

Implement ResumeController class with handlers:

- **createResume**: POST handler for creating new resume
- **getResume**: GET handler for fetching single resume with full details
- **listResumes**: GET handler for listing user's resumes
- **updateResume**: PATCH handler for updating resume metadata
- **deleteResume**: DELETE handler
- **createSection**: POST handler for adding section
- **updateSection**: PATCH handler for section updates
- **deleteSection**: DELETE handler for section
- **reorderSections**: PUT handler for bulk section reordering
- **createItem**: POST handler for adding item to section
- **updateItem**: PATCH handler for item updates
- **deleteItem**: DELETE handler for item
- **reorderItems**: PUT handler for bulk item reordering
- Use dependency injection for services
- Extract user ID from req.user for authorization

### server/src/modules/resume/resume.routes.ts(NEW)

References: 

- server/src/modules/resume/resume.controller.ts(NEW)
- server/src/middleware/auth.middleware.ts(NEW)

Define resume routes with proper RESTful structure:

- GET /resumes - list user resumes
- POST /resumes - create resume
- GET /resumes/:id - get single resume
- PATCH /resumes/:id - update resume
- DELETE /resumes/:id - delete resume
- POST /resumes/:id/sections - create section
- PATCH /resumes/:id/sections/:sectionId - update section
- DELETE /resumes/:id/sections/:sectionId - delete section
- PUT /resumes/:id/sections/reorder - reorder sections
- POST /resumes/:id/sections/:sectionId/items - create item
- PATCH /resumes/:id/sections/:sectionId/items/:itemId - update item
- DELETE /resumes/:id/sections/:sectionId/items/:itemId - delete item
- PUT /resumes/:id/sections/:sectionId/items/reorder - reorder items

All routes protected with authentication middleware and validation middleware.

### server/src/modules/template(NEW)

Create template module directory for template and theme management.

### server/src/modules/template/template.service.ts(NEW)

References: 

- server/src/config/prisma.ts(MODIFY)

Implement TemplateService class:

- **getTemplates**: Fetch all public templates with their themes
- **getTemplateById**: Get single template with themes and layout config
- **applyTemplate**: Update resume's template and theme selection in ResumeTemplate table
- **updateDesignOverrides**: Save custom color, font, spacing overrides for resume
- **getResumeDesign**: Fetch complete design configuration (template + theme + overrides) for resume
- Return merged design settings combining template defaults, theme, and custom overrides

### server/src/modules/template/template.controller.ts(NEW)

References: 

- server/src/modules/template/template.service.ts(NEW)

Implement TemplateController class:

- **listTemplates**: GET handler returning all available templates
- **getTemplate**: GET handler for single template details
- **applyTemplate**: POST handler to switch resume template
- **updateDesign**: PATCH handler for custom design overrides
- **getDesign**: GET handler for resume's current design configuration

### server/src/modules/template/template.routes.ts(NEW)

References: 

- server/src/modules/template/template.controller.ts(NEW)
- server/src/middleware/auth.middleware.ts(NEW)

Define template routes:

- GET /templates - list all templates
- GET /templates/:id - get template details
- POST /resumes/:id/template - apply template to resume
- PATCH /resumes/:id/design - update design overrides
- GET /resumes/:id/design - get resume design config

Protect resume-specific routes with authentication.

### server/src/modules/sharing(NEW)

Create sharing module directory for public resume sharing functionality.

### server/src/modules/sharing/sharing.service.ts(NEW)

References: 

- server/src/config/prisma.ts(MODIFY)
- server/src/utils/slug.util.ts(NEW)
- server/src/utils/password.util.ts(NEW)

Implement SharingService class:

- **createSharingLink**: Generate unique slug, create SharingLink record with visibility settings, optional password, expiry date
- **getSharingLinks**: List all sharing links for a resume
- **updateSharingLink**: Update visibility, password, expiry
- **deleteSharingLink**: Remove sharing link
- **getPublicResume**: Fetch resume by sharing slug, verify not expired, check password if required, return resume data
- Use slug generation utility for unique URLs
- Hash passwords for protected links

### server/src/modules/sharing/sharing.controller.ts(NEW)

References: 

- server/src/modules/sharing/sharing.service.ts(NEW)

Implement SharingController class:

- **createLink**: POST handler for creating sharing link
- **listLinks**: GET handler for resume's sharing links
- **updateLink**: PATCH handler for updating link settings
- **deleteLink**: DELETE handler
- **getPublicResume**: GET handler for public resume view (no auth required)
- **verifyPassword**: POST handler for password-protected links

### server/src/modules/sharing/sharing.routes.ts(NEW)

References: 

- server/src/modules/sharing/sharing.controller.ts(NEW)
- server/src/middleware/auth.middleware.ts(NEW)

Define sharing routes:

- POST /resumes/:id/share - create sharing link (authenticated)
- GET /resumes/:id/share - list sharing links (authenticated)
- PATCH /share/:linkId - update sharing link (authenticated)
- DELETE /share/:linkId - delete sharing link (authenticated)
- GET /share/:slug - get public resume (no auth)
- POST /share/:slug/verify - verify password for protected link (no auth)

Separate public routes from authenticated routes.

### server/src/modules/pdf(NEW)

Create PDF module directory for PDF generation functionality.

### server/src/modules/pdf/pdf.service.ts(NEW)

Implement PDFService class using @react-pdf/renderer:

- **generatePDF**: Accept resume data with sections, items, and design config; render PDF using template-specific layout components; return PDF buffer
- Create template renderer functions that map to different PDF layouts
- Register custom fonts (Inter, Source Serif, etc.) for typography
- Apply design settings (colors, spacing, fonts) from resume design config
- Ensure text-based output with proper text selection
- Handle pagination and section breaks appropriately
- Export PDF generation function

### server/src/modules/pdf/pdf.controller.ts(NEW)

References: 

- server/src/modules/pdf/pdf.service.ts(NEW)
- server/src/modules/resume/resume.service.ts(NEW)

Implement PDFController class:

- **downloadPDF**: GET handler that fetches resume data, generates PDF using PDFService, sets appropriate headers (Content-Type: application/pdf, Content-Disposition), streams PDF to response
- Verify user owns resume before generating PDF
- Handle errors gracefully with appropriate status codes

### server/src/modules/pdf/pdf.routes.ts(NEW)

References: 

- server/src/modules/pdf/pdf.controller.ts(NEW)
- server/src/middleware/auth.middleware.ts(NEW)

Define PDF routes:

- GET /resumes/:id/pdf - download resume as PDF (authenticated)
- GET /share/:slug/pdf - download public resume as PDF (no auth, verify sharing link)

Both routes should trigger PDF generation and file download.

### server/src/index.ts(MODIFY)

References: 

- server/src/constants/global.constants.ts
- server/src/config/prisma.ts(MODIFY)
- server/src/modules/auth/auth.routes.ts(NEW)
- server/src/modules/resume/resume.routes.ts(NEW)
- server/src/modules/template/template.routes.ts(NEW)
- server/src/modules/sharing/sharing.routes.ts(NEW)
- server/src/modules/pdf/pdf.routes.ts(NEW)
- server/src/middleware/error.middleware.ts(NEW)

Transform the basic Express server into a complete application:

- Import and configure CORS middleware with origin from environment config
- Add express.json() and express.urlencoded() middleware for body parsing
- Import and mount all route modules (auth, resume, template, sharing, pdf) with appropriate base paths
- Add global error handling middleware at the end
- Initialize Prisma connection on startup
- Add graceful shutdown handler for Prisma disconnect
- Keep existing port configuration from `DEFAULT_PORT` constant
- Add request logging middleware for development
- Structure middleware in correct order (CORS → body parsing → routes → error handling)

### server/package.json(MODIFY)

Add missing backend dependencies:

- **Production dependencies**: cors, jsonwebtoken, bcrypt, zod (validation), @react-pdf/renderer (PDF generation), slugify (slug generation)
- **Dev dependencies**: @types/cors, @types/jsonwebtoken, @types/bcrypt, @types/express (if not present)
- Keep existing dependencies (express, prisma, @prisma/client, etc.)
- Update scripts if needed (add prisma:generate, prisma:migrate, prisma:seed)

### client/package.json(MODIFY)

Add missing frontend dependencies:

- **Production dependencies**: react-router-dom, @tanstack/react-query, @tanstack/react-query-devtools, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, axios (API client), react-hook-form, @hookform/resolvers, zod (validation), date-fns (date formatting), react-colorful (color picker), sonner (toast notifications)
- Keep existing dependencies (react, redux, tailwind, shadcn components)
- Ensure all peer dependencies are satisfied

### client/src/config(NEW)

Create config directory for frontend configuration files.

### client/src/config/api.config.ts(NEW)

Create API configuration:

- Define API_BASE_URL constant (from environment variable or default to http://localhost:3004)
- Export API endpoints object with all route paths organized by module (auth, resumes, templates, sharing, pdf)
- This centralizes API URLs for use across the application

### client/src/config/constants.ts(NEW)

Define application constants:

- LOCAL_STORAGE_KEYS object (AUTH_TOKEN, RESUME_DRAFT, USER_PREFERENCES)
- DEBOUNCE_DELAYS object (AUTO_SAVE: 1000ms, SEARCH: 300ms)
- MAX_UNDO_HISTORY constant (e.g., 50)
- DEFAULT_TEMPLATE_ID and DEFAULT_THEME_ID
- Export all constants for consistent usage across app

### client/src/lib/axios.ts(NEW)

References: 

- client/src/config/api.config.ts(NEW)
- client/src/lib/utils.ts

Create configured axios instance:

- Import axios and API_BASE_URL from config
- Create axios instance with baseURL set to API_BASE_URL
- Add request interceptor to attach Authorization header with JWT token from localStorage
- Add response interceptor to handle 401 errors (clear token, redirect to login)
- Export configured axios instance for use in API services

### client/src/types(NEW)

Create types directory for TypeScript interfaces and types.

### client/src/types/index.ts(NEW)

Define core TypeScript interfaces matching backend DTOs:

- **User**: id, email, name, createdAt
- **Resume**: id, userId, title, slug, status, sections, template, design, createdAt, updatedAt
- **Section**: id, resumeId, type, heading, position, visible, items, layoutConfig
- **SectionItem**: id, sectionId, position, data (flexible object)
- **SectionType**: id, key, name, isSingleton, defaultFields
- **Template**: id, key, name, description, previewImage, layoutConfig, themes
- **Theme**: id, templateId, name, colorScheme, typography, spacing
- **DesignConfig**: templateId, themeId, customOverrides (colors, fonts, spacing)
- **SharingLink**: id, resumeId, slug, visibility, expiresAt, createdAt
- **AuthResponse**: user, token

Export all interfaces for use across components and services.

### client/src/services(NEW)

Create services directory for API service modules.

### client/src/services/auth.service.ts(NEW)

References: 

- client/src/lib/axios.ts(NEW)
- client/src/types/index.ts(NEW)

Implement authentication API service:

- **register**: POST request to /auth/register with email, name, password
- **login**: POST request to /auth/login with email, password
- **getCurrentUser**: GET request to /auth/me
- **logout**: Clear token from localStorage
- All functions use configured axios instance and return typed responses
- Export auth service functions

### client/src/services/resume.service.ts(NEW)

References: 

- client/src/lib/axios.ts(NEW)
- client/src/types/index.ts(NEW)

Implement resume API service:

- **getResumes**: GET /resumes with pagination params
- **getResume**: GET /resumes/:id
- **createResume**: POST /resumes with title
- **updateResume**: PATCH /resumes/:id
- **deleteResume**: DELETE /resumes/:id
- **createSection**: POST /resumes/:id/sections
- **updateSection**: PATCH /resumes/:id/sections/:sectionId
- **deleteSection**: DELETE /resumes/:id/sections/:sectionId
- **reorderSections**: PUT /resumes/:id/sections/reorder
- **createItem**: POST /resumes/:id/sections/:sectionId/items
- **updateItem**: PATCH /resumes/:id/sections/:sectionId/items/:itemId
- **deleteItem**: DELETE /resumes/:id/sections/:sectionId/items/:itemId
- **reorderItems**: PUT /resumes/:id/sections/:sectionId/items/reorder

All functions return typed promises using interfaces from types directory.

### client/src/services/template.service.ts(NEW)

References: 

- client/src/lib/axios.ts(NEW)
- client/src/types/index.ts(NEW)

Implement template API service:

- **getTemplates**: GET /templates
- **getTemplate**: GET /templates/:id
- **applyTemplate**: POST /resumes/:id/template with templateId and themeId
- **updateDesign**: PATCH /resumes/:id/design with custom overrides
- **getDesign**: GET /resumes/:id/design

Return typed responses using Template and DesignConfig interfaces.

### client/src/services/sharing.service.ts(NEW)

References: 

- client/src/lib/axios.ts(NEW)
- client/src/types/index.ts(NEW)

Implement sharing API service:

- **createSharingLink**: POST /resumes/:id/share
- **getSharingLinks**: GET /resumes/:id/share
- **updateSharingLink**: PATCH /share/:linkId
- **deleteSharingLink**: DELETE /share/:linkId
- **getPublicResume**: GET /share/:slug
- **verifyPassword**: POST /share/:slug/verify

Return typed responses using SharingLink interface.

### client/src/hooks(NEW)

Create hooks directory for custom React hooks (already referenced in shadcn config).

### client/src/hooks/useAuth.ts(NEW)

References: 

- client/src/provider/store.ts(MODIFY)

Create authentication hook:

- Use Redux selector to get auth state (user, token, isAuthenticated)
- Use Redux dispatch for login, logout, register actions
- Return object with user, isAuthenticated, login, logout, register functions
- Provide convenient interface for components to access auth functionality

### client/src/hooks/useDebounce.ts(NEW)

Create debounce hook:

- Accept value and delay parameters
- Use useState and useEffect to debounce value changes
- Return debounced value
- Used for auto-save and search functionality

### client/src/hooks/useLocalStorage.ts(NEW)

Create localStorage hook:

- Accept key and initial value parameters
- Use useState with lazy initialization from localStorage
- Sync state changes to localStorage
- Handle JSON serialization/deserialization
- Return [value, setValue] tuple similar to useState
- Used for caching resume drafts and user preferences

### client/src/provider/slices/authSlice.ts(NEW)

References: 

- client/src/services/auth.service.ts(NEW)
- client/src/types/index.ts(NEW)

Create auth Redux slice:

- **State**: user (User | null), token (string | null), isAuthenticated (boolean), loading (boolean), error (string | null)
- **Reducers**: setCredentials (set user and token), logout (clear state), setLoading, setError
- **Async thunks**: loginThunk (call auth service, store token in localStorage), registerThunk, getCurrentUserThunk
- Initialize state from localStorage token on app load
- Export actions and reducer

### client/src/provider/slices/resumeSlice.ts(NEW)

References: 

- client/src/services/resume.service.ts(NEW)
- client/src/types/index.ts(NEW)

Create resume Redux slice:

- **State**: currentResume (Resume | null), resumes (Resume[]), loading, error
- **Reducers**: setCurrentResume, updateResumeLocal (optimistic updates), addSection, updateSection, deleteSection, reorderSections, addItem, updateItem, deleteItem, reorderItems
- **Async thunks**: fetchResumesThunk, fetchResumeThunk, createResumeThunk, updateResumeThunk, deleteResumeThunk, and thunks for all section/item operations
- Implement optimistic updates for better UX
- Export actions and reducer

### client/src/provider/slices/templateSlice.ts(NEW)

References: 

- client/src/services/template.service.ts(NEW)
- client/src/types/index.ts(NEW)

Create template Redux slice:

- **State**: templates (Template[]), currentDesign (DesignConfig | null), loading, error
- **Reducers**: setTemplates, setCurrentDesign, updateDesignLocal
- **Async thunks**: fetchTemplatesThunk, applyTemplateThunk, updateDesignThunk, fetchDesignThunk
- Export actions and reducer

### client/src/provider/slices/historySlice.ts(NEW)

References: 

- client/src/config/constants.ts(NEW)

Create history Redux slice for undo-redo functionality:

- **State**: past (array of state snapshots), future (array of state snapshots), canUndo (boolean), canRedo (boolean)
- **Reducers**: pushHistory (add current state to past, clear future), undo (move from past to future, restore state), redo (move from future to past, restore state), clearHistory
- Implement with Immer patches for memory efficiency
- Limit history size to MAX_UNDO_HISTORY constant
- Filter actions to only track user-meaningful changes (exclude loading states, etc.)
- Export actions and reducer

### client/src/provider/middleware/historyMiddleware.ts(NEW)

References: 

- client/src/provider/slices/historySlice.ts(NEW)
- client/src/provider/slices/resumeSlice.ts(NEW)

Create Redux middleware for automatic history tracking:

- Intercept actions that modify resume state (section updates, item changes, design changes)
- Before applying action, capture current resume state and push to history
- Filter out non-trackable actions (loading, errors, navigation)
- Implement action grouping for related changes (e.g., drag-and-drop reorder)
- Debounce high-frequency actions (typing) to avoid excessive history entries
- Export middleware for inclusion in store configuration

### client/src/provider/slices/counterSlice.ts(DELETE)

Remove the example counter slice as it's no longer needed.

### client/src/provider/store.ts(MODIFY)

References: 

- client/src/provider/slices/authSlice.ts(NEW)
- client/src/provider/slices/resumeSlice.ts(NEW)
- client/src/provider/slices/templateSlice.ts(NEW)
- client/src/provider/slices/historySlice.ts(NEW)
- client/src/provider/middleware/historyMiddleware.ts(NEW)

Update Redux store configuration:

- Remove counter reducer import
- Import and add new reducers: auth, resume, template, history
- Add historyMiddleware to middleware array using getDefaultMiddleware
- Configure middleware to include serializable check with ignore paths for non-serializable data if needed
- Keep existing RootState and AppDispatch type exports
- Export configured store

### client/src/main.tsx(MODIFY)

References: 

- client/src/provider/store.ts(MODIFY)

Update main entry point to add TanStack Query provider:

- Import QueryClient and QueryClientProvider from @tanstack/react-query
- Import ReactQueryDevtools for development
- Create QueryClient instance with default options (staleTime, cacheTime, retry config)
- Wrap App with QueryClientProvider
- Add ReactQueryDevtools in development mode
- Keep existing Redux Provider and StrictMode wrappers
- Maintain proper provider nesting order

### client/src/routes(NEW)

Create routes directory for routing configuration.

### client/src/routes/index.tsx(NEW)

References: 

- client/src/hooks/useAuth.ts(NEW)

Define application routes using react-router-dom:

- Create router configuration with createBrowserRouter
- Define route structure:
  - / - Landing/home page
  - /login - Login page
  - /register - Register page
  - /dashboard - Dashboard (protected, lists resumes)
  - /editor/:id - Resume editor (protected, main editing interface)
  - /templates - Template gallery (protected)
  - /share/:slug - Public resume view (no auth)
- Implement ProtectedRoute wrapper component that checks authentication and redirects to login
- Export router for use in App component

### client/src/App.tsx(MODIFY)

References: 

- client/src/routes/index.tsx(NEW)

Transform App component into router provider:

- Remove all existing boilerplate code (counter example, logos, etc.)
- Import RouterProvider from react-router-dom
- Import router configuration from routes
- Import Toaster from sonner for toast notifications
- Return RouterProvider with router prop and Toaster component
- Keep component clean and focused on routing setup

### client/src/pages(NEW)

Create pages directory for page-level components.

### client/src/pages/LoginPage.tsx(NEW)

References: 

- client/src/hooks/useAuth.ts(NEW)
- client/src/components/ui/button.tsx

Create login page component:

- Use react-hook-form with Zod validation for email and password fields
- Use shadcn Form components (Input, Button, Label, Card)
- Call loginThunk on form submission
- Show loading state during authentication
- Display error messages using toast notifications
- Redirect to dashboard on successful login
- Include link to register page
- Implement responsive layout with centered card design

### client/src/pages/RegisterPage.tsx(NEW)

References: 

- client/src/hooks/useAuth.ts(NEW)
- client/src/components/ui/button.tsx

Create register page component:

- Use react-hook-form with Zod validation for name, email, password, confirmPassword fields
- Use shadcn Form components
- Call registerThunk on form submission
- Show loading state and error messages
- Redirect to dashboard on successful registration
- Include link to login page
- Implement responsive layout similar to login page

### client/src/pages/DashboardPage.tsx(NEW)

References: 

- client/src/services/resume.service.ts(NEW)
- client/src/components/ui/button.tsx

Create dashboard page component:

- Fetch user's resumes using TanStack Query (useQuery with resume service)
- Display resumes in grid layout with cards showing title, last updated, status
- Include "Create New Resume" button that calls createResumeThunk
- Add actions for each resume: Edit (navigate to editor), Delete (with confirmation dialog), Duplicate
- Show empty state when no resumes exist
- Implement search/filter functionality for resumes
- Use shadcn Card, Button, Dialog components
- Add loading skeleton while fetching resumes
- Implement responsive grid layout (1 column mobile, 2-3 columns desktop)

### client/src/pages/EditorPage.tsx(NEW)

References: 

- client/src/hooks/useDebounce.ts(NEW)
- client/src/provider/slices/resumeSlice.ts(NEW)
- client/src/provider/slices/historySlice.ts(NEW)

Create main editor page component:

- Fetch resume data using useParams to get ID and TanStack Query
- Implement three-panel layout: left sidebar (section controls), center canvas (resume preview), right sidebar (design controls)
- Load resume into Redux state on mount
- Implement auto-save using useDebounce hook and mutation
- Add toolbar with undo/redo buttons (connected to history slice), template switcher, share button, download PDF button
- Handle loading and error states
- Implement responsive layout (collapsible sidebars on mobile)
- Use ResizeObserver for responsive canvas scaling
- Add keyboard shortcuts (Ctrl+Z for undo, Ctrl+Y for redo, Ctrl+S for save)

### client/src/pages/TemplateGalleryPage.tsx(NEW)

References: 

- client/src/services/template.service.ts(NEW)
- client/src/components/ui/button.tsx

Create template gallery page:

- Fetch templates using TanStack Query
- Display templates in grid with preview images
- Show themes for each template
- Allow selecting template and theme
- Apply selection to current resume or create new resume with template
- Use shadcn Card, Button, RadioGroup components
- Implement responsive grid layout
- Add filter/search for templates

### client/src/pages/PublicResumePage.tsx(NEW)

References: 

- client/src/services/sharing.service.ts(NEW)

Create public resume view page:

- Extract slug from URL params
- Fetch public resume using sharing service
- Handle password-protected resumes with password input dialog
- Display resume in read-only mode using same template renderer as editor
- Add download PDF button
- Show "Create your own resume" CTA for non-authenticated users
- Handle expired links and not found errors
- Implement clean, distraction-free layout

### client/src/components/editor(NEW)

Create editor components directory for resume editor-specific components.

### client/src/components/editor/ResumeCanvas.tsx(NEW)

References: 

- client/src/provider/slices/resumeSlice.ts(NEW)
- client/src/provider/slices/templateSlice.ts(NEW)

Create resume canvas component:

- Display resume sections in template-driven layout
- Implement on-canvas editing with contentEditable or input fields
- Apply design settings (colors, fonts, spacing) from Redux state
- Render sections using SectionRenderer component
- Scale canvas to fit container while maintaining aspect ratio
- Add click handlers for section selection and editing
- Implement visual feedback for selected/hovered sections
- Use template-specific layout components based on current template

### client/src/components/editor/SectionRenderer.tsx(NEW)

References: 

- client/src/provider/slices/resumeSlice.ts(NEW)
- client/src/types/index.ts(NEW)

Create section renderer component:

- Accept section prop with type, heading, items, layout config
- Render different section types (summary, experience, education, skills, etc.) with appropriate layouts
- Implement on-canvas editing for section heading and items
- Use ContentEditable component for inline text editing
- Dispatch Redux actions on content changes
- Apply section-specific styling and layout
- Handle empty states for sections with no items

### client/src/components/editor/ContentEditable.tsx(NEW)

Create content editable component:

- Wrapper around contentEditable div with controlled value
- Handle onChange event with proper cursor position preservation
- Support multiline and single-line modes
- Apply styling props (fontSize, fontWeight, color, etc.)
- Implement focus management
- Debounce onChange to avoid excessive updates
- Export reusable component for inline editing throughout editor

### client/src/components/editor/SectionList.tsx(NEW)

References: 

- client/src/provider/slices/resumeSlice.ts(NEW)
- client/src/components/ui/button.tsx

Create section list component for left sidebar:

- Display list of resume sections with drag handles
- Implement drag-and-drop reordering using @dnd-kit/sortable
- Show section type icons and headings
- Add visibility toggle for each section
- Include "Add Section" button with section type selector
- Dispatch reorderSections action on drag end
- Highlight currently selected section
- Use shadcn Button, Switch, DropdownMenu components

### client/src/components/editor/DesignPanel.tsx(NEW)

References: 

- client/src/provider/slices/templateSlice.ts(NEW)
- client/src/components/ui/button.tsx

Create design panel component for right sidebar:

- Display template selector with thumbnail previews
- Show theme selector for current template
- Include color pickers for custom color overrides (primary, secondary, accent, text)
- Add font family selectors for headings and body text
- Include spacing controls (margins, line height)
- Dispatch updateDesignThunk on changes
- Use shadcn Select, Slider, Tabs components
- Implement collapsible sections for organization
- Show live preview of design changes on canvas

### client/src/components/editor/EditorToolbar.tsx(NEW)

References: 

- client/src/provider/slices/historySlice.ts(NEW)
- client/src/components/ui/button.tsx

Create editor toolbar component:

- Display resume title with inline editing
- Add undo/redo buttons with disabled state based on history slice
- Include save status indicator (saving/saved/error)
- Add template switcher button
- Include share button that opens sharing dialog
- Add download PDF button
- Show last saved timestamp
- Use shadcn Button, Tooltip components
- Implement responsive layout (collapse to menu on mobile)

### client/src/components/editor/SharingDialog.tsx(NEW)

References: 

- client/src/services/sharing.service.ts(NEW)
- client/src/components/ui/button.tsx

Create sharing dialog component:

- Display existing sharing links for resume
- Show shareable URL with copy button
- Include visibility selector (private/unlisted/public)
- Add optional password protection toggle and input
- Include expiry date picker
- Show QR code for sharing link
- Add "Create New Link" button
- Display link analytics (views count) if available
- Use shadcn Dialog, Input, Select, DatePicker, Button components
- Implement copy-to-clipboard functionality with toast feedback

### client/src/components/sections(NEW)

Create sections directory for section-specific components.

### client/src/components/sections/ExperienceSection.tsx(NEW)

References: 

- client/src/components/editor/ContentEditable.tsx(NEW)

Create experience section component:

- Render experience items with company, role, location, dates, description bullets
- Implement on-canvas editing for all fields
- Support drag-and-drop reordering of experience items
- Add "Add Experience" button
- Include delete button for each item
- Format dates using date-fns
- Apply template-specific styling
- Handle current position checkbox (no end date)

### client/src/components/sections/EducationSection.tsx(NEW)

References: 

- client/src/components/editor/ContentEditable.tsx(NEW)

Create education section component:

- Render education items with school, degree, field, dates, GPA, honors
- Implement on-canvas editing
- Support drag-and-drop reordering
- Add "Add Education" button
- Include delete functionality
- Format dates and GPA display
- Apply template-specific styling

### client/src/components/sections/SkillsSection.tsx(NEW)

References: 

- client/src/components/editor/ContentEditable.tsx(NEW)

Create skills section component:

- Render skills in groups or flat list based on layout config
- Support different display modes (list, grid, tags)
- Implement on-canvas editing for skill names
- Add skill level indicators (optional)
- Support drag-and-drop reordering
- Include add/delete functionality
- Apply template-specific styling

### client/src/components/sections/SummarySection.tsx(NEW)

References: 

- client/src/components/editor/ContentEditable.tsx(NEW)

Create summary section component:

- Render summary text with multiline editing
- Implement on-canvas editing with ContentEditable
- Support rich text formatting (bold, italic) if needed
- Apply template-specific styling
- Handle empty state with placeholder text

### client/src/components/sections/ProjectsSection.tsx(NEW)

References: 

- client/src/components/editor/ContentEditable.tsx(NEW)

Create projects section component:

- Render project items with name, URL, role, description, technologies
- Implement on-canvas editing
- Support drag-and-drop reordering
- Add "Add Project" button
- Include delete functionality
- Display technology tags
- Apply template-specific styling

### client/src/components/templates(NEW)

Create templates directory for template-specific layout components.

### client/src/components/templates/ModernTemplate.tsx(NEW)

References: 

- client/src/components/editor/SectionRenderer.tsx(NEW)

Create modern template layout component:

- Implement single-column layout with clean design
- Use modern typography and spacing
- Apply design config (colors, fonts) from props
- Render sections in order using SectionRenderer
- Include header with name and contact info
- Export template component for use in canvas and PDF generation

### client/src/components/templates/ClassicTemplate.tsx(NEW)

References: 

- client/src/components/editor/SectionRenderer.tsx(NEW)

Create classic template layout component:

- Implement two-column layout (sidebar + main content)
- Use traditional typography and spacing
- Apply design config from props
- Render sections with appropriate column placement
- Include header with name and contact info
- Export template component

### client/src/components/templates/MinimalTemplate.tsx(NEW)

References: 

- client/src/components/editor/SectionRenderer.tsx(NEW)

Create minimal template layout component:

- Implement minimalist single-column layout
- Use subtle typography and generous whitespace
- Apply design config from props
- Render sections with minimal styling
- Include simple header
- Export template component

### client/src/components/ui/input.tsx(NEW)

References: 

- client/src/lib/utils.ts
- client/src/components/ui/button.tsx

Add shadcn Input component:

- Use shadcn CLI or manually create Input component following shadcn patterns
- Implement with forwardRef for form compatibility
- Include variants for different sizes and states
- Apply consistent styling with design system
- Export Input component

### client/src/components/ui/card.tsx(NEW)

References: 

- client/src/lib/utils.ts

Add shadcn Card component:

- Create Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter components
- Follow shadcn patterns and styling
- Export all card-related components

### client/src/components/ui/dialog.tsx(NEW)

References: 

- client/src/lib/utils.ts

Add shadcn Dialog component:

- Create Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter components
- Use Radix UI Dialog primitive
- Follow shadcn patterns
- Export all dialog-related components

### client/src/components/ui/select.tsx(NEW)

References: 

- client/src/lib/utils.ts

Add shadcn Select component:

- Create Select, SelectTrigger, SelectValue, SelectContent, SelectItem components
- Use Radix UI Select primitive
- Follow shadcn patterns
- Export all select-related components

### client/src/components/ui/form.tsx(NEW)

References: 

- client/src/lib/utils.ts

Add shadcn Form component:

- Create Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage components
- Integrate with react-hook-form
- Follow shadcn patterns
- Export all form-related components

### client/src/components/ui/label.tsx(NEW)

References: 

- client/src/lib/utils.ts

Add shadcn Label component:

- Create Label component using Radix UI Label primitive
- Follow shadcn patterns
- Export Label component

### client/src/components/ui/switch.tsx(NEW)

References: 

- client/src/lib/utils.ts

Add shadcn Switch component:

- Create Switch component using Radix UI Switch primitive
- Follow shadcn patterns
- Export Switch component

### client/src/components/ui/slider.tsx(NEW)

References: 

- client/src/lib/utils.ts

Add shadcn Slider component:

- Create Slider component using Radix UI Slider primitive
- Follow shadcn patterns
- Export Slider component

### client/src/components/ui/dropdown-menu.tsx(NEW)

References: 

- client/src/lib/utils.ts

Add shadcn DropdownMenu component:

- Create DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator components
- Use Radix UI DropdownMenu primitive
- Follow shadcn patterns
- Export all dropdown-related components

### client/src/components/ui/tooltip.tsx(NEW)

References: 

- client/src/lib/utils.ts

Add shadcn Tooltip component:

- Create Tooltip, TooltipTrigger, TooltipContent, TooltipProvider components
- Use Radix UI Tooltip primitive
- Follow shadcn patterns
- Export all tooltip-related components

### client/src/components/ui/tabs.tsx(NEW)

References: 

- client/src/lib/utils.ts

Add shadcn Tabs component:

- Create Tabs, TabsList, TabsTrigger, TabsContent components
- Use Radix UI Tabs primitive
- Follow shadcn patterns
- Export all tabs-related components

### client/src/components/ui/skeleton.tsx(NEW)

References: 

- client/src/lib/utils.ts

Add shadcn Skeleton component:

- Create Skeleton component for loading states
- Follow shadcn patterns
- Export Skeleton component

### README.md(NEW)

Create comprehensive project README:

- **Project Overview**: Description of resume builder application with key features
- **Tech Stack**: List all technologies (Next.js/Express, React, TypeScript, Redux, Prisma, PostgreSQL, Tailwind, shadcn, TanStack Query, dnd-kit)
- **Features**: Detailed list of implemented features (on-canvas editing, template switching, design customization, undo-redo, PDF export, sharing)
- **Architecture**: High-level architecture diagram and explanation of modules
- **Getting Started**: Prerequisites, installation steps, environment setup
- **Development**: Running dev servers, database migrations, seeding
- **Project Structure**: Directory structure explanation for both client and server
- **API Documentation**: Brief overview of API endpoints
- **Deployment**: Instructions for production deployment
- **Contributing**: Guidelines for contributions
- **License**: License information

Include code examples and screenshots where appropriate.

### .gitignore(NEW)

Create comprehensive .gitignore file:

- Node modules (node_modules/)
- Environment files (.env, .env.local, .env.*.local)
- Build outputs (dist/, build/, .next/)
- IDE files (.vscode/, .idea/, *.swp)
- OS files (.DS_Store, Thumbs.db)
- Logs (*.log, npm-debug.log*)
- Prisma generated files (if needed)
- Coverage reports (coverage/)
- Temporary files (*.tmp, .cache/)