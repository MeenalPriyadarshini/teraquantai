export interface Category {
  slug: string;
  name: string;
  blurb: string;
  icon: string;
  /** Tailwind gradient classes for the card background. */
  tint: string;
  /** Tailwind text colour class for the icon. */
  iconColor: string;
}

/**
 * "coming-soon" is a frontend catalogue placeholder. The backend should only
 * persist draft, published and archived product states.
 */
export type ProductStatus = 'draft' | 'published' | 'archived' | 'coming-soon';
export type ProductFileFormat = 'PDF' | 'PPT';
export type ProductCurrency = 'INR';

export interface ProductDetails {
  about: string;
  highlights: string[];
  whatYouGet: string[];
  specs: { label: string; value: string }[];
  perfectFor: string[];
  faqs: { q: string; a: string }[];
}

/** Public metadata only. Never expose a storage key or permanent file URL here. */
export interface ProductVersionSummary {
  versionNumber: number;
  format: ProductFileFormat;
  releasedAt: string;
  isCorrection: boolean;
  changeSummary?: string;
}

/**
 * A catalogue product is one independently purchasable report for one
 * forecast period. A later forecast period is a new Product, not a new version.
 */
export interface Product {
  /** Stable database identifier (UUID in the backend). */
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  summary: string;
  market?: string;
  /** ISO-8601 date, e.g. 2026-11-15. */
  forecastStartDate?: string;
  /** ISO-8601 date, e.g. 2027-05-31. */
  forecastEndDate?: string;
  /** Human-readable display label retained for existing catalogue components. */
  period?: string;
  frequency?: string;
  /** Integer paise. null means the product cannot be purchased yet. */
  pricePaise: number | null;
  currency: ProductCurrency;
  /** Format of the currently published report. */
  format?: ProductFileFormat;
  imageUrl?: string;
  previewImageUrls?: string[];
  status: ProductStatus;
  currentVersion?: ProductVersionSummary;
  details?: ProductDetails;
}

/** Fields used when an admin creates or edits product metadata. */
export interface ProductWriteRequest {
  title: string;
  slug: string;
  categorySlug: string;
  summary: string;
  market?: string;
  forecastStartDate?: string;
  forecastEndDate?: string;
  frequency?: string;
  pricePaise: number;
  currency: ProductCurrency;
  format: ProductFileFormat;
  imageUrl?: string;
  previewImageUrls?: string[];
  details?: ProductDetails;
}

export interface CatalogQuery {
  page?: number;
  size?: number;
  categorySlug?: string;
  search?: string;
}

/** Standard paginated response expected from the Spring Boot API. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
