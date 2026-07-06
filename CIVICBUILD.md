# CivicBuild — Project Overview

## 1. What This App Is

CivicBuild is a mobile-first construction marketplace and directory platform
connecting customers, construction agencies, and delivery providers into one
centralized ecosystem.

## 2. Problem Statement

The construction industry in many African countries is highly fragmented and
inefficient. Individuals building homes or commercial properties struggle to
find trusted contractors, materials, and construction service providers in a
centralized system.

Currently, people rely on WhatsApp groups, referrals, roadside discovery,
Facebook listings, and phone calls to locate construction materials, block and
brick providers, gravel and sand suppliers, roofing companies, contractors, and
agencies.

This creates problems such as: difficulty verifying legitimacy, inconsistent
pricing, procurement delays, lack of centralized communication, poor project
coordination, and limited transparency.

CivicBuild solves this with a mobile-based construction ecosystem app that
centralizes agencies, delivery personnel, materials listings, and customers into
one digital marketplace.

## 3. High-Level Overview

- **Construction Agencies** register businesses, upload verification documents,
  showcase portfolios, list services, manage delivery personnel, and receive
  project requests.
- **Delivery Providers** complete a dedicated setup flow, associate with a
  verified construction agency, and await company confirmation before full
  marketplace access.
- **Customers** search for materials and agencies, compare listings, request
  quotations, save favorites, and manage project procurement.

**Marketplace catalog:** Product and supplier cards on the dashboard are
**admin-curated, role-agnostic listings** for now (not owned by a removed
Material Supplier role). Ownership may move to Construction Agencies when the
backend supports it.

---

## 4. User Roles & RBAC

Three account types, selected during onboarding:

| Role                | Description                                | Onboarding Path                                                         |
| ------------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| Customer            | Finds materials, agencies, requests quotes | Role Selection → Dashboard                                              |
| Construction Agency | Showcases portfolio, bids on projects      | Role Selection → Verification (document upload)                         |
| Delivery Provider   | Logistics for construction companies       | Role Selection → Delivery Provider Setup → Pending Company Confirmation |

**Construction Agency verification** (config-driven form):

- Agency name, service category, registration/portfolio document upload
- Verification status on profile: Pending / Verified / Rejected

**Delivery Provider setup** (separate from agency verification):

- Profile photo upload (expo-image-picker + expo-image preview)
- Full name (pre-filled from Sign Up or Google mock auth, editable)
- Required association with a verified Construction Agency (searchable select,
  stored as `constructionAgencyId` foreign key — not free text)
- Submit → **Pending Company Confirmation** until the associated agency approves
  (demo: “Simulate Company Approval” on pending screen)

---

## 5. Screens

### Auth Flow (unchanged in this phase)

1. **Sign In** — email/password entry; Google button (mock auth)
2. **Sign Up** — full name, email, password, confirmation; Google button (mock)
3. **Forgot Password** — email → Check Your Email (`mode: 'reset'`)
4. **Check Your Email** — reused with `mode: 'reset' | 'signup'`

### Onboarding / RBAC Flow

5. **Role Selection** — 3 role cards (Customer, Construction Agency, Delivery
   Provider); config-driven routing via `onboardingRouteConfig.ts`
6. **Verification** — Construction Agency only; config-driven fields + upload
7. **Delivery Provider Setup** — photo, name, construction company select
8. **Pending Company Confirmation** — waiting state until agency approves

### Main App (post-onboarding)

9. **Marketplace Dashboard (Home)** — search bar, category chips, trusted
   suppliers, popular materials grid; **settings gear** in header (not bottom nav)
10. **Saved** — filterable favorites (Materials, Suppliers, Agencies)
11. **Messages** — thread list + conversation detail (chat UI)
12. **Profile** — identity, role badge, company link (delivery), verification
    badge (agency); Edit Profile, Reviews, Help, Log Out
13. **Settings** — reached from dashboard header only: Account, Notifications,
    Privacy, App preferences, Log Out, Delete Account

**Bottom navigation:** Home · Saved · Messages · Profile (Search tab removed;
search lives on Home dashboard only)

---

## 6. Design System

- Background: white / `#f9f9f9`
- Primary accent: green (`#006e1c` / `#4CAF50` container)
- Inputs: rounded fields, soft gray borders
- Buttons: full-width, rounded, green primary
- Typography: Manrope (headlines), Hanken Grotesk (body)
- Source of truth for pixel-level layout: `PROMPT.md` (Stitch export)
- Theme tokens: `src/theme/index.ts`

---

## 7. Functional Requirements

**User Management**

- Register/Login (mock auth until backend ready)
- Choose account type with role-specific onboarding
- Manage profiles; delivery ↔ construction agency association

**Marketplace (Customer-facing)**

- Admin-curated material/supplier listings (mock data)
- Search and category filtering on Home
- Save/favorite items
- Quote requests (UI placeholders)

**Construction Agency**

- Verification document upload
- Future: manage associated delivery providers

**Delivery Provider**

- Dedicated setup + company approval gate

**Additional Features**

- Messaging (mock threads)
- Notifications (UI)
- Ratings and reviews (placeholders)

---

## 8. Non-Functional Requirements

- **Scalability:** support thousands of users
- **Performance:** expo-image, optimized lists
- **Security:** JWT when backend wired; env secrets not committed
- **Usability:** mobile-first, accessibility labels on interactive elements
- **Maintainability:** config-driven onboarding routing, typed props/forms

---

## 9. Tech Stack

**Frontend**

- React Native + Expo SDK 57
- React Navigation (native stack + bottom tabs + nested stacks for Home/Settings and Messages)
- Zustand (auth, saved favorites)
- expo-image, expo-image-picker, expo-document-picker
- TypeScript throughout

**Backend** (planned)

- Spring Boot microservices, PostgreSQL, Cloudinary/S3

---

## 10. API Design

**Authentication**

- Endpoints defined in `src/api/` — not wired on auth screens during mock phase
