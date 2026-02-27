# Specification

## Summary
**Goal:** Downgrade all users with the 'General Coordinator' (coordenador geral) role to 'Coordinator' (coordenador) across the backend and user management UI.

**Planned changes:**
- Run a backend migration that updates every user profile with the `generalCoordinator` role to `coordinator`, leaving all other roles and profile fields untouched.
- Remove the 'Coordenador Geral' option from the role selection dropdown on the `/users` (User Management) page so it can no longer be assigned to new users.
- Ensure the user list on `/users` displays previously 'Coordenador Geral' users as 'Coordenador'.

**User-visible outcome:** On the User Management page, no user appears with the 'Coordenador Geral' role, and the role dropdown no longer offers that option. All affected users are now shown and treated as 'Coordenador'.
