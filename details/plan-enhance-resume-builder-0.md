I have created the following plan after thorough exploration and analysis of the codebase. Follow the below plan verbatim. Trust the files and references. Do not re-verify what's written in the plan. Explore only when absolutely necessary. First implement all the proposed file changes and then I'll review all the changes together at the end.

### Observations

The user has implemented the resume builder application and encountered 6 specific bugs:

1. **ContentEditable placeholder not disappearing** when text is added
2. **Skills and Experience sections not editable** - unable to modify placeholders or add data
3. **Section visibility toggle (Eye button) causing crash** with "Cannot read properties of undefined (reading 'key')" error
4. **Public resume page displaying JSON** instead of formatted content
5. **PDF download failing** with "unable to open document, File type HTML document" error
6. **Save status stuck on "Not Saved"** instead of updating after successful saves

All issues are well-defined with clear reproduction steps and error messages. The fixes are localized to specific components and don't require architectural changes.

### Approach

Fix each bug individually with targeted changes:

1. **ContentEditable placeholder**: Modify the placeholder visibility logic and z-index to prevent overlap
2. **Skills/Experience editing**: Ensure proper data initialization when sections are created and fix ContentEditable integration
3. **Visibility toggle crash**: Add null safety checks for sectionType before accessing its properties
4. **Public resume JSON display**: Replace JSON.stringify with proper SectionRenderer component usage
5. **PDF download**: Fix response headers and error handling in both controller and routes
6. **Save status**: Update all mutation callbacks to properly reflect save state changes

### Reasoning

I examined the reported issues, read the relevant component files (ContentEditable, SectionRenderer, SkillsSection, ExperienceSection, PublicResumePage, EditorPage, PDF controller and routes), identified the root causes of each bug, and determined the minimal changes needed to fix them without introducing unnecessary complexity.

## Mermaid Diagram

sequenceDiagram
    participant User
    participant ContentEditable
    participant SectionRenderer
    participant EditorPage
    participant Backend
    participant PDFService
    
    Note over User,PDFService: Bug Fix Flow
    
    rect rgb(255, 240, 240)
    Note over User,ContentEditable: Issue 1: Placeholder Not Disappearing
    User->>ContentEditable: Start typing
    ContentEditable->>ContentEditable: Check showPlaceholder logic
    ContentEditable->>ContentEditable: Hide placeholder (z-index fix)
    ContentEditable-->>User: Placeholder hidden immediately
    end
    
    rect rgb(240, 255, 240)
    Note over User,SectionRenderer: Issue 2 & 3: Skills/Experience Editing & Visibility Toggle
    User->>SectionRenderer: Add Skills section
    SectionRenderer->>SectionRenderer: Initialize with default data structure
    SectionRenderer->>SectionRenderer: Check sectionType?.key (null safety)
    SectionRenderer-->>User: Section ready for editing
    User->>SectionRenderer: Toggle visibility (Eye button)
    SectionRenderer->>SectionRenderer: Null check before accessing sectionType.key
    SectionRenderer-->>User: Visibility toggled successfully
    end
    
    rect rgb(240, 240, 255)
    Note over User,Backend: Issue 4: Public Resume JSON Display
    User->>Backend: Request public resume
    Backend-->>User: Resume data
    User->>SectionRenderer: Render with ModernTemplate
    SectionRenderer-->>User: Formatted resume (not JSON)
    end
    
    rect rgb(255, 255, 240)
    Note over User,PDFService: Issue 5: PDF Download Error
    User->>Backend: Request PDF download
    Backend->>PDFService: Generate PDF
    PDFService->>PDFService: Validate data & create buffer
    PDFService-->>Backend: Valid PDF buffer
    Backend->>Backend: Set proper headers (Content-Type: application/pdf)
    Backend->>Backend: Check if buffer is valid
    Backend-->>User: PDF file (not HTML)
    end
    
    rect rgb(255, 240, 255)
    Note over User,EditorPage: Issue 6: Save Status Not Updating
    User->>EditorPage: Edit section/item
    EditorPage->>EditorPage: Set status to 'saving'
    EditorPage->>Backend: Save mutation
    Backend-->>EditorPage: Success response
    EditorPage->>EditorPage: Set status to 'saved' + timestamp
    EditorPage-->>User: Show "Saved at [time]"
    end

## Proposed File Changes

### client/src/components/editor/ContentEditable.tsx(MODIFY)

**Fix placeholder not disappearing when typing:**

1. Change the placeholder visibility condition on line 56 from `!value && !isFocused` to `!value && !isFocused && !ref.current?.textContent`
2. Update the placeholder div styling on line 78 to add `z-index: -1` to ensure it stays behind the contentEditable div
3. Modify the placeholder div to use `opacity-50` instead of default opacity to make it more visually distinct
4. Add a check in the useEffect (line 26-30) to prevent updating textContent when the element is focused, preserving cursor position during typing
5. Update the showPlaceholder logic to also check if the contentEditable div has any text content: `const showPlaceholder = !value && !isFocused && !ref.current?.textContent && placeholder && !disabled`

This ensures the placeholder disappears immediately when the user starts typing, even before the onChange event fires.

### client/src/components/editor/SectionRenderer.tsx(MODIFY)

References: 

- client/src/config/constants.ts

**Fix section visibility toggle crash and improve data initialization:**

1. Add null safety check at line 164 before accessing sectionType.key:
   - Change `const sectionKey = section.sectionType.key;` to `const sectionKey = section.sectionType?.key || 'custom';`
   - This prevents the crash when sectionType is undefined

2. Add early return in renderSectionContent function (after line 163) if sectionType is missing:
   - Check `if (!section.sectionType) { return <div>Section type not loaded</div>; }`

3. Update getDefaultItemData function (lines 122-161) to ensure Skills section gets proper initial structure:
   - For SECTION_TYPES.SKILLS case (line 146-149), change the return value to include an empty category by default: `{ categories: [{ name: 'Technical Skills', skills: [''] }] }`
   - This ensures when a skill section is added, it has at least one category with one empty skill field

4. For SECTION_TYPES.EXPERIENCE case (lines 126-135), ensure description array has at least one empty string: `description: ['']`

5. Add a safety check in the switch statement (line 166) to handle undefined sectionKey:
   - Add a check before the switch: `if (!sectionKey) { return <DefaultSection ... />; }`

These changes prevent crashes when toggling visibility and ensure sections have proper initial data structures for editing.

### client/src/components/sections/SkillsSection.tsx(MODIFY)

**Fix skills section editing by ensuring proper data initialization:**

1. Update the skillsData initialization on line 21 to handle undefined or null cases:
   - Change `const skillsData = skillsItem?.dataJson || { categories: [] };` to `const skillsData = skillsItem?.dataJson || { categories: [{ name: '', skills: [] }] };`
   - This ensures there's always at least one category to work with

2. Modify the updateSkillsData function (lines 23-29) to handle the case when skillsItem doesn't exist:
   - When calling onAddItem() on line 27, pass the default data structure: `onAddItem({ categories: [{ name: '', skills: [] }] });`
   - This ensures the item is created with proper structure

3. Update the addCategory function (lines 31-34) to initialize new categories with at least one empty skill:
   - Change line 32 to: `const categories = [...skillsData.categories, { name: '', skills: [''] }];`
   - This makes it easier for users to start adding skills immediately

4. Add a check in the component to auto-create the first item if none exists:
   - After line 21, add: `if (!skillsItem && items.length === 0) { useEffect(() => { onAddItem({ categories: [{ name: 'Technical Skills', skills: [''] }] }); }, []); }`

These changes ensure the skills section always has a proper data structure for editing.

### client/src/components/sections/ExperienceSection.tsx(MODIFY)

**Fix experience section editing by ensuring proper data initialization:**

1. Update the data initialization on line 26 to provide default values:
   - Change `const data = item.dataJson || {};` to:
   ```
   const data = item.dataJson || {
     company: '',
     role: '',
     location: '',
     startDate: '',
     endDate: '',
     current: false,
     description: ['']
   };
   ```

2. Ensure the description array always exists in updateDescription function (line 32-36):
   - Change line 33 to: `const description = Array.isArray(data.description) ? [...data.description] : [''];`
   - This prevents errors when description is undefined or not an array

3. Update addDescriptionBullet function (lines 38-41) to handle missing description:
   - Change line 39 to: `const description = Array.isArray(data.description) ? [...data.description, ''] : [''];`

4. Add safety check in the render section (line 139) for description mapping:
   - Change line 139 to: `{(Array.isArray(data.description) ? data.description : []).map((bullet: string, index: number) => (`

These changes ensure experience items always have proper data structures and prevent undefined errors during editing.

### client/src/pages/PublicResumePage.tsx(MODIFY)

References: 

- client/src/components/editor/SectionRenderer.tsx(MODIFY)
- client/src/components/templates/ModernTemplate.tsx

**Replace JSON display with proper resume rendering:**

1. Import SectionRenderer component at the top (after line 10):
   - Add: `import { SectionRenderer } from '@/components/editor/SectionRenderer';`

2. Replace the entire resume content section (lines 139-166) with proper template rendering:
   - Remove the JSON.stringify display (lines 152-158)
   - Instead, use SectionRenderer for each section similar to how it's done in ModernTemplate
   - For each section, render: `<SectionRenderer section={section} onUpdateSection={() => {}} onUpdateItem={() => {}} onDeleteItem={() => {}} onAddItem={() => {}} onReorderItems={() => {}} isSelected={false} />`
   - Pass empty functions for the handlers since this is read-only view

3. Add proper styling to match the resume template:
   - Wrap sections in a div with proper spacing and typography
   - Apply the same styling as ModernTemplate (padding, borders, colors)

4. Alternatively, import and use ModernTemplate component directly:
   - Import ModernTemplate at the top
   - Replace the manual section rendering with: `<ModernTemplate resume={resume} sections={resume.sections.filter(s => s.visible)} selectedSectionId={null} onSelectSection={() => {}} onUpdateSection={() => {}} onUpdateItem={() => {}} onDeleteItem={() => {}} onAddItem={() => {}} onReorderItems={() => {}} />`
   - This ensures consistent rendering between editor and public view

5. Add a prop to SectionRenderer or create a read-only variant to disable editing in public view

Using the template component approach is preferred as it ensures consistency and reduces code duplication.

### server/src/modules/pdf/pdf.controller.ts(MODIFY)

References: 

- server/src/modules/pdf/pdf.service.ts(MODIFY)

**Fix PDF download to return proper PDF buffer instead of HTML:**

1. Add proper error handling in downloadPDF method (lines 17-38):
   - Wrap the entire method in try-catch
   - If PDF generation fails, log the error and return a proper error response instead of letting it fall through to HTML error page
   - Add validation to ensure resume exists before generating PDF

2. Update the response headers to be more explicit (lines 29-31):
   - Add `Content-Transfer-Encoding: binary` header
   - Ensure Content-Type is set before any other operations
   - Add `Cache-Control: no-cache` header

3. Fix the downloadPublicPDF method (lines 40-61) similarly:
   - Add the same error handling and headers
   - Ensure the password is extracted correctly from request body
   - Add validation for the resume data before PDF generation

4. Add a check to verify the PDF buffer is valid before sending:
   - After line 26 and line 48, add: `if (!pdfBuffer || pdfBuffer.length === 0) { throw new Error('PDF generation failed - empty buffer'); }`

5. Ensure the response is not already sent before setting headers:
   - Check `if (!res.headersSent)` before setting headers

6. Add logging for debugging:
   - Log the buffer size and content type before sending
   - Log any errors that occur during PDF generation

These changes ensure the PDF is properly generated and sent as a binary file, not as HTML error page.

### server/src/modules/pdf/pdf.service.ts(MODIFY)

**Ensure PDF generation returns valid PDF buffer:**

1. Add error handling in generatePDF method (lines 12-45):
   - Wrap the pdf() call in try-catch
   - Add validation to ensure resume has sections before rendering
   - Log any errors during PDF generation

2. Add validation before creating the document (after line 12):
   - Check if resume exists and has required properties
   - Validate that sections array is not empty
   - Provide default values for missing data

3. Update the renderSectionItem method (lines 47-159) to handle missing data gracefully:
   - Add null checks for data object
   - Provide default empty strings for missing fields
   - Handle cases where arrays (description, skills, technologies) are undefined

4. Add a verification step after PDF generation (after line 43):
   - Check if pdfBuffer is valid and has content
   - Log the buffer size for debugging
   - Throw descriptive error if buffer is empty or invalid

5. Ensure React.createElement calls are properly structured:
   - Verify all required props are passed
   - Handle null/undefined children arrays
   - Add key props to all mapped elements

These changes ensure the PDF service always returns a valid PDF buffer or throws a clear error.

### server/src/modules/pdf/pdf.routes.ts(MODIFY)

References: 

- server/src/middleware/error.middleware.ts(MODIFY)

**Ensure PDF routes properly handle binary responses:**

1. Update the route handlers to set proper response type expectations:
   - Both routes are correctly configured, but ensure error middleware doesn't interfere with binary responses

2. Add a comment or middleware to indicate these routes return binary data:
   - This helps other developers understand the response type

3. Consider adding a custom error handler for PDF routes:
   - If PDF generation fails, return a JSON error instead of trying to send HTML
   - Add middleware before the controller that sets `res.locals.isBinaryResponse = true`

4. Verify the validation middleware doesn't interfere with binary responses:
   - Ensure validateRequest doesn't modify response headers

5. Add rate limiting for PDF generation routes to prevent abuse:
   - PDF generation is resource-intensive
   - Add a rate limiter middleware before the controller

The routes are mostly correct, but adding error handling context will help prevent HTML responses when PDF generation fails.

### client/src/pages/EditorPage.tsx(MODIFY)

References: 

- client/src/components/editor/EditorToolbar.tsx(MODIFY)
- client/src/hooks/useDebounce.ts

**Fix save status to update properly for all mutations:**

1. Update updateSectionMutation (lines 75-78) to include status callbacks:
   - Add `onMutate: () => setSaveStatus('saving')`
   - Add `onSuccess: () => { setSaveStatus('saved'); setLastSaved(new Date()); }`
   - Add `onError: () => setSaveStatus('error')`

2. Update updateItemMutation (lines 80-83) with the same status callbacks:
   - Add the same onMutate, onSuccess, and onError handlers

3. Create additional mutations for other operations that need save status:
   - Add createSectionMutation with status callbacks
   - Add deleteSectionMutation with status callbacks
   - Add createItemMutation with status callbacks
   - Add deleteItemMutation with status callbacks
   - Add reorderSectionsMutation with status callbacks
   - Add reorderItemsMutation with status callbacks

4. Update all handler functions to use the new mutations:
   - handleAddSection (line 168-178): Use createSectionMutation instead of direct service call
   - handleDeleteSection (line 180-183): Use deleteSectionMutation
   - handleAddItem (line 149-153): Use createItemMutation
   - handleDeleteItem (line 144-147): Use deleteItemMutation
   - handleReorderSections (line 155-158): Use reorderSectionsMutation
   - handleReorderItems (line 160-166): Use reorderItemsMutation

5. Add a debounced save indicator:
   - Use the useDebounce hook to delay showing 'saved' status by 500ms
   - This prevents flickering when multiple rapid changes occur

6. Add auto-save text next to the status when status is 'saved':
   - The EditorToolbar already shows this on line 94, ensure it's visible

7. Consider adding a manual save button that forces immediate save:
   - Useful when user wants to ensure changes are persisted before leaving

These changes ensure the save status accurately reflects all editing operations, not just resume title updates.

### client/src/components/editor/EditorToolbar.tsx(MODIFY)

**Ensure save status text updates dynamically:**

1. The getSaveStatusText function (lines 67-78) is already correctly implemented

2. Verify the saveStatus prop is being passed correctly from EditorPage:
   - The prop is correctly defined in the interface (line 26)
   - The component receives it from parent (line 36)

3. Add a visual indicator for the different states:
   - For 'saving' state: Show a spinner animation (already implemented on line 57)
   - For 'saved' state: Show green checkmark (already implemented on line 59)
   - For 'error' state: Show red alert icon (already implemented on line 61)

4. Update the text display to be more prominent:
   - The current implementation on lines 91-95 is correct
   - Ensure the text color changes based on status (green for saved, red for error)

5. Add a tooltip to explain the save status:
   - Wrap the status indicator in a Tooltip component
   - Show detailed information about last save time and any errors

6. Consider adding a retry button when status is 'error':
   - Allow users to manually trigger a save retry
   - Show error details in a tooltip or dialog

The component is mostly correct, but ensure the parent (EditorPage) is properly updating the saveStatus prop for all operations.

### client/src/services/sharing.service.ts(MODIFY)

**Fix PDF download to handle binary response correctly:**

1. Update the downloadPublicPdf method (lines 52-78) to properly handle the response:
   - The current implementation looks correct with responseType: 'blob'
   - Ensure the Accept header is set correctly (line 60)

2. Add error handling for non-PDF responses:
   - After receiving the response, check the content-type header
   - If content-type is 'text/html' or 'application/json', throw an error
   - Add: `if (response.headers['content-type']?.includes('text/html')) { throw new Error('Server returned HTML instead of PDF'); }`

3. Add better error messages:
   - Catch specific error types and provide user-friendly messages
   - If the response is HTML, it means the server had an error

4. Add a loading indicator:
   - Return a promise that can be tracked by the UI
   - Allow the calling component to show a loading state

5. Verify the blob is valid before creating download link:
   - Check blob.size > 0
   - Check blob.type is 'application/pdf'

These changes ensure the download fails gracefully if the server returns HTML error page instead of PDF.

### server/src/middleware/error.middleware.ts(MODIFY)

**Ensure error middleware doesn't interfere with binary responses:**

1. Add a check at the beginning of the error handler to detect binary response routes:
   - Check if `res.locals.isBinaryResponse` is true
   - Check if the route path includes '/pdf'
   - If so, send a minimal error response without HTML formatting

2. For PDF routes, return a simple error object instead of HTML:
   - Set Content-Type to 'application/json'
   - Return: `{ success: false, message: error.message }`
   - This prevents the "File type HTML document" error

3. Add logging for PDF generation errors:
   - Log the full error stack for debugging
   - Include request details (user, resume ID, etc.)

4. Ensure the error handler doesn't try to send response if headers are already sent:
   - Add check: `if (res.headersSent) { return next(err); }`

5. Add specific handling for Prisma errors in PDF context:
   - If resume not found, return 404 JSON instead of HTML
   - If database error, return 500 JSON instead of HTML

These changes ensure PDF routes return proper error responses that don't confuse the client.