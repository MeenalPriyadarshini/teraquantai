# Frontend API contract — catalogue foundation

This document records the API shape expected by the Angular catalogue service.
It is a frontend/backend integration contract, not a claim that these endpoints
already exist. The Spring Boot implementation will be built to this contract
or the contract will be deliberately revised before integration.

## Base URL

- API prefix: `/api/v1`
- Currency: INR
- Monetary values: integer paise (₹1 = 100 paise)
- Dates: ISO-8601 calendar dates (`YYYY-MM-DD`)
- Product identifiers: UUID strings
- Product slugs: stable, URL-safe identifiers

## Public catalogue endpoints

| Method | Endpoint | Response |
|---|---|---|
| GET | `/catalog/categories` | `Category[]` |
| GET | `/catalog/products?page=0&size=24` | `PageResponse<Product>` |
| GET | `/catalog/products/featured?limit=6` | `Product[]` |
| GET | `/catalog/products/{slug}` | `Product` or HTTP 404 |

The product list endpoint may accept `category` and `search` query parameters.
Only published products should be returned by public catalogue endpoints.
Draft and archived products must never appear in public responses.

## Product DTO

A public product response should contain:

- `id`: UUID
- `slug`, `title`, `categorySlug`, `summary`
- `market`, `forecastStartDate`, `forecastEndDate`, `frequency`
- `pricePaise`: integer or null while the product is not purchasable
- `currency`: `INR`
- `format`: `PDF` or `PPT`
- `imageUrl` and optional `previewImageUrls`
- `status`: public products are `published`
- `currentVersion`: public version summary, without a storage key or file URL
- `details`: overview, highlights, deliverables, specifications and FAQs

The public DTO must not expose private storage paths, permanent download URLs,
admin-only notes, payment information or unpublished report versions.

## Pagination DTO

```json
{
  "content": [],
  "page": 0,
  "size": 24,
  "totalElements": 0,
  "totalPages": 0,
  "first": true,
  "last": true
}
```

## Product and report lifecycle

- A new forecast period is a new product with a new product ID and slug.
- A correction to an already-published report creates a new report version under
  the same product.
- A report version records its version number, format, release timestamp,
  correction flag and change summary.
- Buyers' order items remain linked to the product they purchased.
- A correction workflow must identify prior buyers and queue email notifications.
- The report binary is stored privately. Downloads are authorized by the backend
  against a verified purchase; the catalogue DTO never contains the file itself.

## Frontend development mode

`frontend/src/app/core/config/api.config.ts` currently has
`useMockData: true`. This keeps the current website usable until the backend
endpoints are implemented. Set it to `false` only after the backend contract is
implemented and the local API base URL is configured.
