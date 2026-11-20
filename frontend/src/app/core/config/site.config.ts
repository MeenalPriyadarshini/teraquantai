import { CATEGORIES } from '../../data/categories.data';

export const SITE = {
  name: 'TerraQuantAI',
  tagline: 'Data • Markets • Intelligence',
  description: 'AI-powered forecasting and intelligence solutions for agriculture, energy, markets and industry.',
} as const;

export interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
  children?: { label: string; path: string; query?: Record<string, string> }[];
}

export const NAV: NavItem[] = [
  { label: 'Home', path: '/', exact: true },
  {
    label: 'Solutions', path: '/solutions',
    children: CATEGORIES.map((c) => ({ label: c.name, path: '/solutions', query: { category: c.slug } })),
  },
  { label: 'About', path: '/about' },
  {
    label: 'Resources', path: '/resources',
    children: [
      { label: 'Insights', path: '/resources' },
      { label: 'FAQs', path: '/resources/faqs' },
    ],
  },
  { label: 'Contact', path: '/contact' },
];

export const FOOTER_LINKS = {
  quick: [
    { label: 'Home', path: '/' },
    { label: 'Solutions', path: '/solutions' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ],
  resources: [
    { label: 'Insights', path: '/resources' },
    { label: 'FAQs', path: '/resources/faqs' },
    { label: 'Support', path: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Refund Policy', path: '/refund-policy' },
    { label: 'Disclaimer', path: '/disclaimer' },
  ],
};

/** Leave url empty until the client supplies real profiles; empty ones are not rendered. */
export const SOCIALS = [
  { label: 'LinkedIn', icon: 'linkedin', url: '' },
  { label: 'YouTube', icon: 'youtube', url: '' },
  { label: 'X (Twitter)', icon: 'x', url: '' },
];
