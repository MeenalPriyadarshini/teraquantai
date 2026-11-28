# TerraQuantAI Admin Panel

The admin workspace is available at `/admin` and is protected by both the Angular route guard and Spring Security's `ROLE_ADMIN` rule.

## Provision the first administrator

Set `ADMIN_EMAIL` in the private root `.env` file to an existing, verified account email. The application promotes that account to ADMIN on startup without changing its password.

If the configured email does not yet exist in `users`, also set `ADMIN_PASSWORD` to a password of at least 12 characters; the bootstrap creates a verified administrator account. Do not put secrets in source control.

After restarting the backend, sign out and sign in again so the session receives the ADMIN authority.

## Admin workspace

- Dashboard counts: total, published, draft and archived products; customers and orders.
- Product management: create draft, search/filter, edit metadata, publish, unpublish and archive.
- Product fields: title, URL slug, category, summary, market, forecast period, frequency, INR price and report format.
- Report files: private PDF/PPT/PPTX uploads, up to 50 MB, with extension and basic file-signature validation.
- Version history: first upload creates version 1; later uploads create correction versions with an optional change note.
- Category management: create categories and activate/deactivate them. A category with published products cannot be deactivated until those products are unpublished or archived.
- Public catalogue: only published products in active categories are returned. The latest report version determines the displayed report format.

## API endpoints

All endpoints use `/api/v1` and require an authenticated ADMIN session except public catalogue reads.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/dashboard` | Dashboard counts |
| GET | `/admin/categories` | List categories |
| POST | `/admin/categories` | Create category |
| PATCH | `/admin/categories/{id}` | Update category metadata or active state |
| GET | `/admin/products` | List/filter products |
| POST | `/admin/products` | Create draft |
| PATCH | `/admin/products/{id}` | Update product metadata |
| POST | `/admin/products/{id}/files` | Upload initial report |
| POST | `/admin/products/{id}/versions` | Upload correction version |
| GET | `/admin/products/{id}/versions` | View version history |
| POST | `/admin/products/{id}/publish` | Publish after file and price checks |
| POST | `/admin/products/{id}/unpublish` | Return to draft |
| POST | `/admin/products/{id}/archive` | Archive product |

## Storage and payment boundary

Files are stored outside the public frontend directory under `FILE_STORAGE_PATH`. Public catalogue responses never expose storage keys. Customer report downloads are deliberately not exposed by the admin upload API; paid-order authorization and secure downloads belong to the payment and fulfillment stage.

The local filesystem storage is suitable for development. Production deployment must use durable private object storage, backups, malware scanning and short-lived authorized download access.
