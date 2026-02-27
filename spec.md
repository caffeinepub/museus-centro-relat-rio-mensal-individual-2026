# Specification

## Summary
**Goal:** Elevate two specific users to the administrator role (`coordenador_geral`) in the backend so they can perform privileged actions like deleting users.

**Planned changes:**
- Add initialization/upgrade logic in the backend canister that assigns the `coordenador_geral` (or highest-privilege) role to `daniel@periniprojetos.com.br` and `danielperini.mc@viadutodasartes.org.br` on every canister upgrade.
- Create a `migration.mo` file that updates the `userProfiles` stable state to apply the administrator role to both specified users while leaving all other user profiles unchanged.

**User-visible outcome:** After the canister upgrade, both specified users will have full administrator privileges (e.g., ability to delete other users), while all other users retain their existing roles.
