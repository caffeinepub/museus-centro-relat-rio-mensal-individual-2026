# Specification

## Summary
**Goal:** Grant the coordinator role permission to create reports and insert activities, both in the backend authorization logic and the frontend UI.

**Planned changes:**
- Update backend authorization to allow the coordinator role to call the createReport function.
- Update backend authorization to allow the coordinator role to call the createActivity function.
- Update the Sidebar navigation so coordinators see menu items for creating reports and inserting activities.
- Ensure ReportFormPage and ActivityFormPage are fully editable and submittable by coordinator users (not rendered as read-only).

**User-visible outcome:** Coordinators can now create new reports and insert activities through the application without receiving authorization errors or encountering read-only forms, while all other roles retain their existing permissions unchanged.
