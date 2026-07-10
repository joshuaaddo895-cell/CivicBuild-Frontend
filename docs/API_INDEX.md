# CivicBuild API — Postman ↔ Frontend Map

**Production base URL:** `https://civicbuild-production.up.railway.app`  
**Local:** `http://localhost:8081`  
**Env in app:** `EXPO_PUBLIC_API_URL`

## Import Postman collection

```
postman/CivicBuild-API.postman_collection.json
```

Collection variables: `accessToken`, `refreshToken`, `agencyId`, `productId`, `orderId`, `threadId`, etc.  
**Smoke (no auth):** Health → List Products → List Suppliers  
**Auth flow:** Login → sets `accessToken` automatically via test script.

## Postman folder → `src/api/*.ts` → Screens

| Postman folder       | API module                                  | Key screens                                          |
| -------------------- | ------------------------------------------- | ---------------------------------------------------- |
| Health               | —                                           | —                                                    |
| Auth                 | `src/api/auth.ts`                           | Login, Register, Forgot, ChangePassword              |
| Profile              | `src/api/users.ts`                          | EditProfile, Profile                                 |
| Onboarding           | `src/api/onboarding.ts`                     | RoleSelection, Verification, DeliverySetup           |
| Account              | `src/api/account.ts`                        | Settings (delete account)                            |
| Catalog (public)     | `src/api/catalog.ts`                        | Home, AllSuppliers, SupplierDetail, ProductDetail    |
| Agencies             | `src/api/agencies.ts`                       | Verification, AgencyDetail, ConstructionAgencySelect |
| Agency Products      | `src/api/agencies.ts`                       | AgencyProductForm, AgencyProducts                    |
| Agency Posts         | `src/api/agencies.ts`                       | AgencyPostForm, AgencyPosts, navbar Create tab       |
| Agency Portfolio     | `src/api/agencies.ts`, `agencyPortfolio.ts` | AgencyPortfolioScreen                                |
| Agency Orders        | `src/api/agencyOrders.ts`                   | AgencyOrders, AgencyOrderDetail, Dashboard           |
| Agency Personnel     | `src/api/agencies.ts`                       | AgencyPersonnel, Notifications                       |
| Delivery Providers   | `src/api/delivery.ts`                       | DeliveryProviderSetup, DeliveryDashboard             |
| Verification         | `src/api/verification.ts`                   | VerificationScreen, DocumentPreview                  |
| Orders (customer)    | `src/api/orders.ts`, `checkoutService.ts`   | Checkout, PaymentWebView, OrderConfirmation          |
| Saved Items          | `src/api/saved.ts`                          | SavedScreen, favorite toggles                        |
| Reviews              | `src/api/reviews.ts`                        | Reviews, MyReviews, ProductDetail, Profile           |
| Messages             | `src/api/messages.ts`                       | Messages, ConversationDetail                         |
| Notifications        | `src/api/notifications.ts`                  | NotificationsScreen                                  |
| Admin                | — (not in mobile app)                       | —                                                    |
| Payments (reference) | —                                           | Paystack callback URLs in PaymentWebView             |

## Seed UUIDs (Postman pre-filled)

| Variable     | Value                                  | Entity                       |
| ------------ | -------------------------------------- | ---------------------------- |
| `productId`  | `b2000001-0000-4000-8000-000000000001` | Dangote Cement 50kg — 88 GHS |
| `supplierId` | `a1000001-0000-4000-8000-000000000001` | BuildMart Ghana              |

## Response envelope (all endpoints)

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "errors": null,
  "timestamp": "..."
}
```

Paginated lists: `data.items`, `data.page`, `data.limit`, `data.total`, `data.hasNextPage`.

## Recommended test flows (Postman order)

### Customer checkout

1. Login
2. List Products (pick `productId`)
3. Save Item (optional)
4. Checkout (with productId) → copy `authorizationUrl`, `orderId`
5. Paystack (browser) → Verify Payment → Get Order → List My Orders

### Construction agency

1. Login → Set Account Type `construction`
2. Create Agency → saves `agencyId`
3. Create Post
4. Upload Portfolio Image → List My Portfolio
5. Create Product

### Delivery provider

1. Login → Set Account Type `delivery`
2. List Agencies (public) → pick `agencyId`
3. Setup Delivery Profile
4. Complete Onboarding

### Messaging

1. Login (customer)
2. Start Thread `{ "agencyId": "..." }` → saves `threadId`
3. Send Message → List Messages → Mark Thread Read

## Docs cross-reference

| Doc                                      | Purpose                                       |
| ---------------------------------------- | --------------------------------------------- |
| `docs/API_INDEX.md`                      | This file — Postman ↔ frontend map            |
| `docs/FRONTEND_INTEGRATION_PROMPT.md`    | Contract summary & integration status         |
| Backend `docs/FRONTEND_API_REFERENCE.md` | Full 68-endpoint reference with live examples |
