# Specification

## Summary
**Goal:** Re-add a monthly report export button (PDF and CSV) with a month/year selector to the reports list page.

**Planned changes:**
- Add a month/year selector component to the reports list page, defaulting to the current month and year
- Add an "Export Report" button group with PDF and CSV/Excel options visible to the logged-in user on the reports list page
- On PDF export, generate and download a PDF with the user's report metadata and all associated activities for the selected month/year using the existing pdfGenerator utility
- On CSV export, generate and download a CSV file with the user's report metadata and all associated activities for the selected month/year using the existing excelGenerator utility
- Show a user-friendly message if no report exists for the selected month/year
- Scope all exports to the currently authenticated user's own data only

**User-visible outcome:** Users can select a month and year on the reports list page and export their monthly report (including all activities) as either a PDF or CSV file.
