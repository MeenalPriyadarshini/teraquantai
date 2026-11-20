import { Product } from '../shared/models/catalog.models';

/**
 * Local catalogue fixtures used only while API_CONFIG.useMockData is true.
 * Real products will be created through the admin panel and stored by the API.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'demo-product-maize-sangli-2026-2027',
    slug: 'maize-market-forecast-sangli',
    title: 'Maize Market Forecast — Sangli',
    categorySlug: 'agricultural-ai',
    summary: 'AI-powered maize price forecasting for the Sangli market, with daily projections and scenario-based market insights.',
    market: 'Sangli, Maharashtra',
    forecastStartDate: '2026-11-15',
    forecastEndDate: '2027-05-31',
    period: '15 Nov 2026 – 31 May 2027',
    frequency: 'Daily estimates',
    pricePaise: null, // Set the actual selling price before enabling purchases.
    currency: 'INR',
    format: 'PDF',
    status: 'published',
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
      specs: [
        { label: 'Market', value: 'Sangli, Maharashtra' },
        { label: 'Commodity', value: 'Maize' },
        { label: 'Coverage period', value: '15 Nov 2026 – 31 May 2027' },
        { label: 'Frequency', value: 'Daily estimates' },
        { label: 'Scenarios', value: 'Base, Bull, Bear' },
        { label: 'Format', value: 'PDF report' },
        { label: 'Purchase type', value: 'One-time purchase' },
      ],
      perfectFor: ['Traders & Businesses', 'Farmers & Producers', 'Market Analysts'],
      faqs: [
        {
          q: 'What will I receive after purchase?',
          a: 'You get the report described under “What You Get”. It is available to download from the My Purchases section of your account.',
        },
        {
          q: 'Is the forecast guaranteed?',
          a: 'No. Forecasts are estimates based on available information and are not guaranteed outcomes. Please use them as one input to your own decisions.',
        },
        {
          q: 'Does it cover other markets?',
          a: 'This solution covers the Sangli market only. Other markets are offered as separate solutions.',
        },
        {
          q: 'Can I get a refund?',
          a: 'Please see our Refund Policy for details.',
        },
      ],
    },
  },
  {
    id: 'demo-coming-soon-energy',
    slug: 'coming-soon-energy',
    title: 'New solution coming soon',
    categorySlug: 'energy-ai',
    summary: 'A new Energy AI solution is on its way.',
    pricePaise: null,
    currency: 'INR',
    status: 'coming-soon',
  },
  {
    id: 'demo-coming-soon-market',
    slug: 'coming-soon-market',
    title: 'New solution coming soon',
    categorySlug: 'market-ai',
    summary: 'A new Market AI solution is on its way.',
    pricePaise: null,
    currency: 'INR',
    status: 'coming-soon',
  },
];
