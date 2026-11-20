import { Product } from '../shared/models/catalog.models';

/**
 * Sample catalogue. To add a real product, add an entry here (later this comes
 * from the API). A "coming-soon" entry shows as an empty box; replace it with a
 * product whose status is 'available' to fill the slot.
 */
export const PRODUCTS: Product[] = [
  {
    slug: 'maize-market-forecast-sangli',
    title: 'Maize Market Forecast — Sangli',
    categorySlug: 'agricultural-ai',
    summary: 'AI-powered maize price forecasting for the Sangli market, with daily projections and scenario-based market insights.',
    market: 'Sangli, Maharashtra',
    period: '15 Nov 2026 – 31 May 2027',
    frequency: 'Daily estimates',
    price: null, // TODO: confirm price with client
    status: 'available',
    details: {
      about:
        'Get clear, easy-to-read maize price forecasts for the Sangli market, powered by advanced AI analytics. Plan purchases, sales and stock with a better view of where prices may be heading.',
      highlights: [
        'Multiple price scenarios (Base, Bull, Bear)',
        'Detailed market analysis',
        'Easy-to-understand reports',
      ],
      whatYouGet: [
        'Daily maize price estimates for the Sangli market across the coverage period',
        'Base, Bull and Bear scenario views',
        'Market analysis summary explaining the key drivers',
        'Report available to download from your account after purchase',
      ],
      // TODO: confirm price unit, report format and any extra files with client before launch
      specs: [
        { label: 'Market', value: 'Sangli, Maharashtra' },
        { label: 'Commodity', value: 'Maize' },
        { label: 'Coverage period', value: '15 Nov 2026 – 31 May 2027' },
        { label: 'Frequency', value: 'Daily estimates' },
        { label: 'Scenarios', value: 'Base, Bull, Bear' },
        { label: 'Purchase type', value: 'One-time purchase' },
      ],
      perfectFor: ['Traders & Businesses', 'Farmers & Producers', 'Market Analysts'],
      faqs: [
        { q: 'What will I receive after purchase?',
          a: 'You get the report described under “What You Get”. It is available to download from the My Purchases section of your account.' },
        { q: 'Is the forecast guaranteed?',
          a: 'No. Forecasts are estimates based on available information and are not guaranteed outcomes. Please use them as one input to your own decisions.' },
        { q: 'Does it cover other markets?',
          a: 'This solution covers the Sangli market only. Other markets are offered as separate solutions.' },
        { q: 'Can I get a refund?',
          a: 'Please see our Refund Policy for details.' },
      ],
    },
  },
  {
    slug: 'coming-soon-energy',
    title: 'New solution coming soon',
    categorySlug: 'energy-ai',
    summary: 'A new Energy AI solution is on its way.',
    price: null,
    status: 'coming-soon',
  },
  {
    slug: 'coming-soon-market',
    title: 'New solution coming soon',
    categorySlug: 'market-ai',
    summary: 'A new Market AI solution is on its way.',
    price: null,
    status: 'coming-soon',
  },
];
