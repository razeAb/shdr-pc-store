# Private purchasing data and product locks

The designated owner's product editor shows supplier, purchase cost, whether cost includes VAT, and a content lock. This information is excluded from public responses and other administrators' responses.

Set PRODUCT_OWNER_USER_ID on the backend to the owner's database user ID (preferred). Otherwise PRODUCT_OWNER_EMAIL, ADMIN_EMAIL, then the existing admin@shdr.com account determines the owner. The current database user must still be an administrator. No credentials are stored in source.

Existing purchase costs are unknown and remain blank. Supplier labels can be inferred from AL-/ML- SKUs; this does not reconstruct costs from selling prices.

## Synchronization contract

Authenticated administrators can PATCH /api/products/:id/stock with exactly {"inStock":false} or {"inStock":true}. This operation works while automationLocked is true and never changes price, content, or publication status. Unavailable products display an out-of-stock label and checkout rejects them.

All ordinary catalog update, deactivate, and toggle routes reject locked products with HTTP 423 / PRODUCT_LOCKED. Bulk activation and categorization skip locked products. A synchronizer must use the stock endpoint for availability instead of changing isActive. Legacy synchronization applications need that adjustment before they can update stock on locked products. An AI client using the API has the same restrictions; direct database access is outside API protection.

Owner metadata is read/updated at /api/products/owner/:id. PATCH accepts only supplier, purchaseCost (nonnegative number or null), costIncludesVat, and automationLocked. Only the designated owner can unlock products. Other administrators cannot gain access by presenting the owner's email in their JWT.

## Validation

Run `node --test backend/tests/productOwnership.test.js` and `npm --prefix frontend run build`. API tests mock database storage, use real HTTP/JWT middleware, and cover public redaction, another administrator, private-field validation, locked price/deactivation/toggle refusal, and stock changes in both directions without price/content changes. No production data is modified by these checks.
