# Specification

## Summary
**Goal:** Add a "Público Geral" (general audience) KPI card to the Dashboard with period filter options: current month, cumulative, and custom date range.

**Planned changes:**
- Add a backend query function in `backend/main.mo` that returns the total `publicoGeral` across approved/submitted reports, supporting three filter modes: specific month+year, cumulative (all time), and custom date range (start/end month+year)
- Add a "Público Geral" KPI card to the Dashboard page using the existing KPICard component
- Add a period selector control with three options: "Mês Atual", "Acumulado", and "Período Customizado"
- When "Período Customizado" is selected, show start and end month+year pickers
- The KPI card updates reactively based on the selected period, with loading and error states

**User-visible outcome:** Users can view the total general audience on the dashboard and filter it by current month, all-time cumulative total, or a custom date range they define.
