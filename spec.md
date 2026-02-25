# Specification

## Summary
**Goal:** Remove transparency from all dropdown and select lists throughout the application so they render with fully opaque backgrounds.

**Planned changes:**
- Update all dropdown/select overlay components (Select, Popover, DropdownMenu, and similar) to use a fully opaque background instead of transparent or semi-transparent styles.
- Apply the fix consistently across all pages containing dropdowns (ReportsListPage, MonthYearSelector, ApprovalsPage, DashboardPage, ActivityFormPage, ReportFormPage, UserManagementPage, etc.).
- Ensure opaque backgrounds work correctly in both light and dark themes.

**User-visible outcome:** All dropdown and select lists display with a solid, opaque background — no see-through or semi-transparent effect — across every page in the application.
