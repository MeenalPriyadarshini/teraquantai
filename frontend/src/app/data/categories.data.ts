import { Category } from '../shared/models/catalog.models';

export const CATEGORIES: Category[] = [
  { slug: 'agricultural-ai', name: 'Agricultural AI', blurb: 'Maize, Sugarcane & more', icon: 'leaf',
    tint: 'from-emerald-50 to-teal-50', iconColor: 'text-emerald-600' },
  { slug: 'energy-ai', name: 'Energy AI', blurb: 'Crude Oil & Energy', icon: 'droplet',
    tint: 'from-sky-50 to-blue-50', iconColor: 'text-sky-600' },
  { slug: 'market-ai', name: 'Market AI', blurb: 'Stocks, Commodities & more', icon: 'chart',
    tint: 'from-indigo-50 to-violet-50', iconColor: 'text-indigo-600' },
  { slug: 'industrial-ai', name: 'Industrial AI', blurb: 'Industries & Manufacturing', icon: 'factory',
    tint: 'from-teal-50 to-cyan-50', iconColor: 'text-teal-700' },
];
