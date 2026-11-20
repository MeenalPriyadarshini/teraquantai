import { Routes } from '@angular/router';

const page = (path: string, title: string) => ({
  path,
  title: `${title} | TerraQuantAI`,
  data: { title },
  loadComponent: () => import('./features/placeholder/placeholder').then((m) => m.Placeholder),
});

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/home/home').then((m) => m.Home) },

  // Phase 2 pages above. Built in later phases; replace each `page(...)` with its real feature.
  { path: 'solutions', title: 'Solutions | TerraQuantAI', loadComponent: () => import('./features/solutions/solutions').then((m) => m.Solutions) },
  { path: 'solutions/:slug', loadComponent: () => import('./features/product-detail/product-detail').then((m) => m.ProductDetail) },
  { path: 'cart', title: 'Your Cart | TerraQuantAI', loadComponent: () => import('./features/cart/cart').then((m) => m.Cart) },
  page('about', 'About'),
  page('resources', 'Resources'),
  page('resources/faqs', 'FAQs'),
  page('contact', 'Contact'),
  page('login', 'Login'),
  page('signup', 'Create account'),
  page('account', 'My Account'),
  page('privacy', 'Privacy Policy'),
  page('terms', 'Terms of Service'),
  page('refund-policy', 'Refund Policy'),
  page('disclaimer', 'Disclaimer'),

  page('**', 'Page not found'),
];
