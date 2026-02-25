# Specification

## Summary
**Goal:** Fix application startup crash, restore activity fields/functionality in report pages, and add an "Approve Report" button in the Coordinator view.

**Planned changes:**
- Investigate and fix runtime errors or missing imports causing a blank screen on startup
- Add an "Aprovar Relatório" (Approve Report) button in ApprovalsPage and/or ApprovalDetailView, visible only to coordinator/admin roles, that triggers the existing approval mutation and updates the report status
- Restore the "Adicionar Atividade" (Add Activity) button on report detail/list views for editable reports
- Restore the ActivitiesList component displaying activity cards with status badges, hours, audience, and other fields
- Restore navigation from "Add Activity" to ActivityFormPage pre-linked to the correct report
- Ensure all activity form fields (classification, status, audience profiles, products, evidence, accessibility, quantitative goals) are present and functional
- Ensure activities are correctly fetched and displayed per report

**User-visible outcome:** The application opens without errors, coordinators can approve submitted reports via a dedicated button, and all activity-related features (listing, creating, and editing activities linked to reports) work correctly.
