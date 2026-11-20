# Images folder (served at /images/...)

Drop finished images straight into these folders. No code change needed for product photos.

| Folder        | What goes here                         | Naming rule                                         |
|---------------|----------------------------------------|-----------------------------------------------------|
| `products/`   | Product / solution cover image         | **same name as the product slug**, e.g. `maize-market-forecast-sangli.webp` |
| `categories/` | Category images (future use)           | category slug, e.g. `agricultural-ai.webp`          |
| `general/`    | Anything else (About page, banners)    | any name, referenced in code as `images/general/x.webp` |

Product images: 4:3 ratio, about 1200 x 900 px, under 200 KB. `.webp`, `.jpg`, `.jpeg` and `.png` are all picked up automatically.
Not sure about size/format? Put the original in `assets-inbox/` instead and run `npm run images` (see assets-inbox/README.md).
