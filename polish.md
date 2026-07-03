# Polish & Refinement Log

This document covers all the remaining problems, bugs, security vulnerabilities, and overengineering issues present in the codebase, broken down by phases to ensure a proper flow for refinement.

*(Note: Phases 1–3 covering Architecture Conversion, Initial UI Polish, and Student Registration Flows have been successfully completed).*

---

## Phase 4: Code Quality & Rendering Stability

### Problems Identified
1. **React Rendering Anti-Pattern:** In `app/page.tsx`, `Date.now()` is called directly inside the render cycle (`isDeadlineSoon` helper). This is an impure function call that violates React's rendering rules and causes hydration mismatches.
2. **TypeScript `any` Abuse:** Heavy reliance on the `any` type in critical admin components (`CreateEventPanel`, `ManageEventsPanel`) and server actions (`eventActions.ts`). This defeats the purpose of TypeScript and hides potential runtime bugs.
3. **Dead Code & Clutter:** Multiple pages (`app/events/page.tsx`, `app/events/[id]/page.tsx`, `app/opportunity/page.tsx`) have unused imports like `useEffect`, `useState`, and unused Types, causing compiler warnings and bloating the files.
4. **Unescaped Entities:** React warnings in `app/dashboard/page.tsx` due to unescaped quotes (e.g., `haven't` instead of `haven&apos;t`).

### Proposed Fixes
- Move the deadline calculation in `app/page.tsx` into a `useEffect` or generate a static server-side timestamp to ensure pure rendering.
- Replace all instances of `any` with strict typing using the centralized interfaces in `src/types/index.ts`.
- Run an automated cleanup to remove all unused React hooks and imports across the codebase.
- Escape raw quotes in JSX strings.

---

## Phase 5: Security Hardening & Authentication

### Problems Identified
1. **Plaintext Passwords (CRITICAL):** The login route (`app/api/auth/login/route.ts`) checks passwords using a raw string comparison (`String(storedPassword) === password`). New signups also insert passwords directly into the database without hashing. This is a massive security vulnerability.
2. **Lack of Row Level Security (RLS):** Supabase RLS is currently disabled or undocumented. Because the frontend uses the Supabase anon key, any user could theoretically query sensitive tables like `users` or `event_registrations` directly from the browser console.
3. **Missing Rate Limiting:** The auth routes lack rate limiting, leaving them vulnerable to brute-force attacks.

### Proposed Fixes
- Introduce `bcryptjs` to hash passwords during signup and verify them securely during login.
- Document and enforce strict Row Level Security (RLS) policies in the Supabase dashboard (e.g., `Users can only select their own registrations`, `Only admins can insert events`).
- Add basic rate limiting to API routes, or migrate auth to a hardened provider like Auth.js (NextAuth).

---

## Phase 6: Advanced UI/UX & Component Polish

### Problems Identified
1. ~~**Monolithic Admin Panels:** The components inside `src/components/admin/` (like `ManageEventsPanel.tsx`) are growing too large and handling too much state (modals, fetching, deleting, forms).~~ *(Completed: Extracted `EventForm` and `OpportunityForm`)*
2. **Accessibility (a11y) Gaps:** As noted in `docs/04_UI_UX.md`, there are no skip-to-content links, no keyboard trap testing for the mobile menu, and animations via `motion/react` do not respect the user's `prefers-reduced-motion` OS setting.
3. **Generic Loading States:** While `SWR` handles data fetching, some mutations (like deleting an event) lack optimistic UI updates or specific, localized loading spinners (often freezing the whole UI or relying on a generic `disabled` state).

### Proposed Fixes
- ~~Refactor the Admin Panels into smaller, composable pieces (e.g., separating the Event Form from the Event Table).~~ *(Completed)*
- Audit the mobile menu for keyboard accessibility and add `prefers-reduced-motion` variants to Framer Motion components.
- Implement Optimistic UI updates for event and opportunity mutations to make the admin dashboard feel instantly responsive.
