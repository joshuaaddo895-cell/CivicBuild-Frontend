# CivicBuild — Project Overview

## 1. What This App Is

CivicBuild is a mobile-first construction marketplace and directory platform
connecting customers, material suppliers, construction agencies, planning/
architectural agencies, and delivery providers into one centralized ecosystem.

## 2. Problem Statement

The construction industry in many African countries is highly fragmented and
inefficient. Individuals building homes or commercial properties struggle to
find trusted suppliers, contractors, planning agencies, and construction
service providers in a centralized system.

Currently, people rely on WhatsApp groups, referrals, roadside discovery,
Facebook listings, and phone calls to locate construction material suppliers,
block and brick providers, gravel and sand suppliers, roofing companies,
contractors, and planning agencies.

This creates problems such as: difficulty verifying legitimacy, inconsistent
pricing, procurement delays, lack of centralized communication, poor project
coordination, and limited transparency.

CivicBuild solves this with a mobile-based construction ecosystem app that
centralizes suppliers, agencies, contractors, and customers into one digital
marketplace.

## 3. High-Level Overview

- **Shops/Suppliers** register businesses, upload construction materials,
  manage inventory, receive quote requests, and communicate with customers.
- **Construction Agencies** showcase portfolios, list services, receive
  project requests, and bid for contracts.
- **Customers** search for suppliers, compare materials, discover agencies,
  request quotations, and manage project procurement.

---

## 4. User Roles & RBAC

Five account types, selected during onboarding:

| Role                            | Description                                     | Requires Verification? |
| ------------------------------- | ----------------------------------------------- | ---------------------- |
| Customer                        | Finds suppliers, agencies, requests quotes      | No                     |
| Material Supplier               | Sells construction materials, manages inventory | Yes                    |
| Construction Agency             | Showcases portfolio, bids on projects           | Yes                    |
| Planning & Architectural Agency | Offers design/planning services                 | Yes                    |
| Delivery Provider               | Manages deliveries for suppliers/customers      | Yes                    |

**Verification field differences by role** (form must be config-driven, not
hardcoded):

- Material Supplier: business name, material category, business registration doc
- Construction Agency: agency name, specialization, portfolio upload, registration doc
- Planning Agency: firm name, specialization, portfolio upload, professional license doc
- Delivery Provider: business/individual name, vehicle info, driver's license/ID

Verification status states: Pending Verification (amber), Verified (green
checkmark badge), Rejected (red, with reason).

---

## 5. Screens (Full List — 7 Screens)

### Auth Flow

1. **Sign In** — email/password entry point (no separate Welcome screen; Sign In
   is the direct app entry). Google button present as UI only for now (no OAuth
   wiring unless already implemented in this codebase).
2. **Sign Up** — email, password, password confirmation only (no first/last name
   fields). Live validation with red-border error state ("ERROR: Password do
   not match").
3. **Forgot Password** — single email field only. No 2FA/OTP/Authenticator
   options — manual email reset link only.
4. **Check Your Email** — confirmation screen, reused/repurposed component with
   a mode prop to handle both password-reset confirmation and (optional)
   signup-confirmation, with copy branching correctly per mode ("reset your
   password" vs. "confirm your account").

### Onboarding / RBAC Flow

5. **Role Selection** — 5 selectable role cards (see table above), radio-style
   selection, green highlight on selected card, "Continue" disabled until a
   role is chosen.
6. **Verification** — shown for all roles except Customer. Config-driven form
   fields per role, document upload with dashed-border upload card, status
   badge, "Submit for Review" disabled until required fields + document are
   present.
7. **Marketplace Dashboard** — replaces the existing generic HomeScreen entirely.
   This becomes the actual post-onboarding landing screen (primarily for
   Customer role). Includes:
   - Header: logo, location, notification bell
   - Search bar
   - Horizontal category chips (Cement, Blocks/Bricks, Gravel, Sand/Soil,
     Roofing Sheets, Tiles, Paint, Plumbing, Electrical)
   - "Trusted Suppliers Near You" horizontal cards (verified badge, name,
     category tag, rating, distance)
   - "Popular Materials" 2-column product grid with realistic material photos
     (cement blocks, roofing sheets, sand/gravel, cement bags, tiles, PVC pipes),
     product name, supplier name, price, quick-quote button
   - Bottom tab navigation: Home, Search, Messages, Profile

---

## 6. Design System

- Background: white
- Primary accent: green (~#4CAF50)
- Inputs: rounded fields, soft gray borders
- Buttons: full-width, rounded, green primary with arrow icon
- Icons: simple line-style icons; plus/cross-style app logo mark
- Typography: bold headings, medium-weight body text
- Consistent spacing and soft card shadows across all screens
- Source of truth for exact layout/copy per screen: PROMPT.md (Stitch export)

---

## 7. Functional Requirements

**User Management**

- Register/Login
- Verify phone/email
- Manage profiles
- Choose account type

**Supplier Management**

- Create storefronts
- Upload products
- Set prices
- Manage stock
- Upload verification documents
- Receive quote requests

**Agency Management**

- Create profiles
- Upload portfolios
- List services
- Receive project inquiries
- Respond to bids

**Material Categories**
Cement, Blocks/Bricks, Gravel, Sand/Soil, Roofing Sheets, Tiles, Paint,
Plumbing Materials, Electrical Materials

**Additional Features**

- Search and filtering
- Quote requests
- Ratings and reviews
- Messaging system
- Notifications
- Admin moderation

---

## 8. Non-Functional Requirements

- **Scalability:** support thousands of users, handle concurrent requests
- **Availability:** high uptime, fault tolerance, backup systems
- **Performance:** fast loading, low-bandwidth optimization, optimized image
  loading (use expo-image, WebP where possible)
- **Security:** JWT authentication, secure file uploads, encrypted passwords
- **Maintainability:** modular architecture, independent deployment support
- **Usability:** mobile-first, responsive, intuitive interface

---

## 9. Tech Stack

**Frontend**

- React Native + Expo
- Existing navigation library already configured in this repo (React Navigation
  or Expo Router — confirm before adding a new one)
- State management: existing global state solution if present (Zustand/Context/
  Redux) — check before introducing anything new
- expo-image for image handling/caching
- TypeScript for all components, props, and data shapes

**Backend** (per original system design)

- Spring Boot microservices
- Microservices: Authentication, Supplier, Agency, Quote, Messaging, Review
- Database: PostgreSQL
- File storage: Cloudinary or AWS S3

> Note: confirm whether this repo's actual backend matches the above — the
> original system design doc specifies Spring Boot/PostgreSQL, but implementation
> specifics should be verified against what's actually deployed/connected.

---

## 10. API Design

**Authentication**
