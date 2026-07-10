# CivicBuild Postman Collection

Import **`CivicBuild-API.postman_collection.json`** into Postman (File → Import).

If the JSON file is not in this folder yet, copy it from the backend repo:

```
postman/CivicBuild-API.postman_collection.json
```

Or paste the collection export from `docs/FRONTEND_API_REFERENCE.md` / team chat.

## Variables (set automatically or manually)

| Variable      | Default                                        | Set by                        |
| ------------- | ---------------------------------------------- | ----------------------------- |
| `baseUrl`     | `https://civicbuild-production.up.railway.app` | collection                    |
| `productId`   | Dangote Cement seed UUID                       | collection                    |
| `supplierId`  | BuildMart Ghana seed UUID                      | collection                    |
| `accessToken` | —                                              | **Login** test script         |
| `agencyId`    | —                                              | **Create Agency** test script |
| `orderId`     | —                                              | **Checkout** test script      |
| `threadId`    | —                                              | **Start Thread** test script  |
| `reviewId`    | —                                              | **Create Review** test script |

## See also

[`docs/API_INDEX.md`](../docs/API_INDEX.md) — Postman folder → `src/api/*` → Expo screen map.
