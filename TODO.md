# EventSync - TODO

This file tracks the current state of features, along with bugs, misconfigurations, and missing logic to be addressed iteratively.

## ✅ Implemented Features (Working)
- [x] Initialized Next.js Application with App Router.
- [x] Integrated Tailwind CSS 4, Framer Motion, and Radix UI.
- [x] Hooked up Supabase client (`/lib/server/supabase.ts`).
- [x] Created `Home` page with live event/opportunity fetching and animations.
- [x] Created `Events` page with client-side reactive filtering (Category, Date, Search).
- [x] Created `Event Details` page for showing specifics and linked coordinators.
- [x] Created `Opportunities` page with deadline parsing and filtering.
- [x] Created `Opportunity Details` page handling dynamic contact icons (Phone, Email, Web).
- [x] Basic session wrapping.
- [x] Admin panel base layout setup, with distinct panels for Create/Manage tasks.
- [x] Setup Admin API structure for Form Submissions (POST events with coordinators).
- [x] Fetch endpoints (`/api/events`, `/api/opportunities`).

---

## 🛠️ Bugs & Missing Features (To Solve)

**1. Fix Admin Layout Structure**
- [x] **Bug**: `app/admin/layout.tsx` is an extremely massive component designed for manual placement but acts as Next.js's automatic wrapper. At the exact same time, `app/admin/page.tsx` renders its own distinct dashboard wrapping layer (`<aside>` and flex layout). We need to resolve this layout nesting issue to prevent duplicate or broken UI shells.

**2. Standardize Opportunities API Endpoint**
- [ ] **Cleanup**: We have both `app/api/opportunity` and `app/api/opportunities`. They should be merged or completely refactored so we use strict plural endpoints consistently. 

**3. Actuate Primary Action Buttons**
- [ ] **Missing Logic**: The "Register Interest" button on `app/events/[id]/page.tsx` does nothing. 
- [ ] **Missing Logic**: The "Apply Now" button on `app/opportunity/[id]/page.tsx` does nothing.
- *Action*: Connect these buttons to either track analytics, open an external `.registration_link` defined in the db, or launch an internal modal form.

**4. Update Hardcoded Stats**
- [ ] **Enhancement**: The "10K+ Students" statistic on the `app/page.tsx` homepage is hardcoded. Convert it to use accurate logic or replace it if User tracking isn't viable right now.

**5. Enhance API Validation & Types**
- [ ] **Improvement**: Supabase fetching handles basic errors, but we need robust data validation via `zod` before submitting forms on the admin side in our API Routes.

**6. Verify Admin Authentication Protection**
- [ ] **Bug/Security Check**: We must verify if the `/api/admin/...` files apply valid auth parsing before executing database mutations. Client-side hiding of routes is insufficient. 

**7. Form UI Enhancement**
- [x] **Enhancement**: Split `Create Event` (+ Coordinators) and `Create Opportunity` (+ Extra Details) forms into symmetrical side-by-side grids to prevent long scrolling forms.
