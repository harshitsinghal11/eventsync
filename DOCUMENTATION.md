# EventSync Project Documentation

## 1. Overview
**EventSync** is a modern, responsive web application designed as a centralised "Campus Event Hub". It allows students to discover campus events (technical, cultural, sports, academic, etc.), register for them, and stay informed about various opportunities like internships, volunteer roles, and leadership positions. 

The application provides a seamless discovery experience on the frontend while enabling administrators to manage the events and opportunities via a secured dashboard.

## 2. Technology Stack
- **Framework**: Next.js (App Router) version 15/16 (utilises React 19).
- **Styling**: Tailwind CSS v4, integrated with custom colour tokens and utility classes.
- **UI Components & Animation**: Radix UI (for accessible unstyled primitives like menus, dialogs, accordions), `lucide-react` (icons), and `motion/react` (Framer Motion v12) for fluid, dynamic micro-interactions.
- **Backend/Database**: Supabase (PostgreSQL). Stores events, opportunities, and user data.
- **Form Handling**: Custom, coupled with standard HTML form behaviour using React state.
- **Authentication**: Basic session management wrapper around typical JWT/Cookie mechanisms (likely integrated with Supabase Auth).

## 3. Architecture & Routing
The application is structured using Next.js App Router (`/app`):
- `app/page.tsx`: The Hero landing page with dynamic counters and featured feeds.
- `app/events/...`: Display pages for viewing a list of all events and comprehensive detail pages.
- `app/opportunity/...`: Display pages for viewing aggregated opportunities and their specific detail pages.
- `app/admin/...`: The admin dashboard interface housing various sections (Create Event, Manage Events, Create Opportunity).
- `app/auth/...`: Authentication pages (Login, Signup).
- `app/api/...`: Next.js REST API routes that communicate safely with Supabase:
  - `/api/events` & `/api/events/[id]`
  - `/api/opportunities` & `/api/opportunity`
  - `/api/admin/...` (Protected POST/PUT/DELETE commands).

## 4. Current Features
* **Dynamic Event & Opportunity Discovery**: Responsive cards with skeletons for loading states. Fast search and filter integrations (by title, category, and date).
* **Detailed Views**: Fully fleshed-out single event/opportunity pages detailing descriptions, date/time, venue, duration, perks, organizational details, and linked coordinators.
* **Admin Dashboard**: Contains dedicated UI panels for CRUD operations. It supports dynamic forms, such as adding multiple coordinators at once to an event schema.
* **Component Reusability**: Well-structured `src/components` with Radix-based UI and dashboard blocks.

## 5. Identified Bugs & Inconsistent Logic
During the analysis, the following structural patterns and bugs were detected:

1. **Nested / Redundant Admin Layout**:
   - `app/admin/layout.tsx` exports a huge template component named `Dashboard` that isn't connected properly to the App Router's `{ children }` pattern. Simultaneously, `app/admin/page.tsx` (`AdminPage`) has its own built-in layout (rendering a sidebar (`<aside>`) and a `<main>` container). This creates visual conflicts, duplicated sidebar logic, or stranded layout files.
2. **Missing Action Bindings**:
   - Buttons like "Register Interest" on Event details and "Apply Now" on Opportunity details are purely visual. They must be linked to forms, emails, or Supabase endpoints to capture applicant intent.
3. **API Endpoint Duplication**:
   - There are separate directories for `/api/opportunity` and `/api/opportunities` referencing the exact same logic. While one acts as an alias, it is poor practice for maintenance.
4. **Hardcoded UI Statistics**:
   - The homepage shows "10K+ Students". This might have been a placeholder template element and ideally needs linking to actual statistics, or requires removal if it's purely generic.
5. **Over-reliance on Client Components**:
   - While interactive pages need `'use client'`, using it on generic list pages suppresses Next.js's powerful Server-side rendering (SSR) benefits.

---
*Created automatically during project analysis.*
