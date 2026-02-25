# Specification

## Summary
**Goal:** Add a File Management tab, file-report linking, a report editing area with linked files section, and fix dashboard errors in the Museus Centro Reports application.

**Planned changes:**
- Add backend data model and CRUD API for file attachments (upload, list, delete, get), storing file metadata and base64 content in stable storage
- Add backend API for many-to-many file-report linking (link, unlink, get files for report)
- Add React Query hooks for all new file and file-report-link operations
- Add a File Management page accessible from the sidebar (coordinators and admins) with a file table (name, type, size, upload date, uploader), upload button with file picker, delete with confirmation, and empty state
- Add a "Linked Files" section inside the report view/edit page with a modal to browse, link, and unlink files; works for both new and existing reports
- Fix all runtime errors in DashboardPage and its child chart/KPI components, ensuring proper loading, error, and empty states
- Add null/undefined guards throughout pages and components, ensure failed mutations show user-facing error feedback, and fix React key/prop-type warnings

**User-visible outcome:** Users can upload and manage files, link or unlink files to any report (new or existing), and the dashboard displays correctly without errors.
