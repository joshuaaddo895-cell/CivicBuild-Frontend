# CivicBuild Frontend — API Integration Index

**Production (Railway):** `https://civicbuild-production.up.railway.app`  
**Env:** `EXPO_PUBLIC_API_URL`

## Documentation

| File                                                                                                  | Description                                                                    |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [`docs/FRONTEND_MASTER_INTEGRATION_PROMPT.md`](./FRONTEND_MASTER_INTEGRATION_PROMPT.md)               | **Primary agent prompt** — Railway validation, flows A–D, regression checklist |
| [`docs/API_INDEX.md`](./API_INDEX.md)                                                                 | Postman folder → `src/api/*` → screen mapping                                  |
| [`postman/CivicBuild-API.postman_collection.json`](../postman/CivicBuild-API.postman_collection.json) | Full Postman collection (21 folders, 75+ requests)                             |
| Backend `docs/FRONTEND_API_REFERENCE.md`                                                              | Postman-style reference with live Railway response examples                    |

## Quick smoke (no auth)

```
GET /api/health
GET /api/products?page=0&limit=20
GET /api/suppliers?page=0&limit=20
```

## API client modules (`src/api/`)

`auth` · `users` · `onboarding` · `account` · `catalog` · `agencies` · `agencyOrders` · `agencyPortfolio` · `verification` · `orders` · `checkoutService` · `saved` · `reviews` · `messages` · `notifications` · `delivery`

## Integration status

Most screens now call the backend via the modules above. Use Postman to verify the API independently, then confirm the matching screen in the Expo app.

**Still verify manually:**

- Checkout sends `productId` in items (`src/utils/orderMappers.ts`)
- Paystack WebView → verify payment flow on device
- Google Sign-In with real `idToken`
- Multipart uploads (avatar, verification docs, portfolio) on physical device

Update this file when new endpoints are added.
