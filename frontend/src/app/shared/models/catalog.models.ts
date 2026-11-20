export interface Category {
  slug: string;
  name: string;
  blurb: string;
  icon: string;
  /** Tailwind gradient classes for the card background */
  tint: string;
  /** Tailwind text colour class for the icon */
  iconColor: string;
}

export type ProductStatus = 'available' | 'coming-soon';

export interface ProductDetails {
  about: string;
  highlights: string[];
  whatYouGet: string[];
  specs: { label: string; value: string }[];
  perfectFor: string[];
  faqs: { q: string; a: string }[];
}

export interface Product {
  slug: string;
  title: string;
  categorySlug: string;
  summary: string;
  market?: string;
  period?: string;
  frequency?: string;
  /** Price in INR. null = not decided yet ("Pricing soon"). */
  price: number | null;
  imageUrl?: string;
  status: ProductStatus;
  details?: ProductDetails;
}
