# Specification

## Summary
**Goal:** Implement a coordinator approval flow so that newly registered users must be approved by a coordinator or admin before gaining access to the application.

**Planned changes:**
- Add a backend `approveUser` function that transitions a user's status from `pending` to `approved`, accessible only to users with `coordination` or `administration` roles.
- Add a "Pending Users" section in the User Management page (visible only to coordinators and admins) listing pending users with their name, role, museum, and registration date, along with an "Approve" button per row.
- After approval via the Approve button, the user moves from the pending list to the active users list and a success/error toast is shown.
- Display a friendly empty-state message when there are no pending users.
- Block pending users from accessing protected pages after login and show a "Your account is awaiting coordinator approval" screen instead.
- Once approved, the user can log in and access the application normally.

**User-visible outcome:** Coordinators and admins can see and approve pending new users from the User Management page. New users who have not yet been approved are shown a waiting screen after login and cannot access the application until a coordinator approves their account.
