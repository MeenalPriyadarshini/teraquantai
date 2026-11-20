import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

const page = (path: string, title: string) => ({
  path,
  title: `${title} | TerraQuantAI`,
  data: { title },
  loadComponent: () => import('./features/placeholder/placeholder').then((m) => m.Placeholder),
});

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/home/home').then((m) => m.Home) },
  { path: 'solutions', title: 'Solutions | TerraQuantAI', loadComponent: () => import('./features/solutions/solutions').then((m) => m.Solutions) },
  { path: 'solutions/:slug', loadComponent: () => import('./features/product-detail/product-detail').then((m) => m.ProductDetail) },
  { path: 'cart', title: 'Your Cart | TerraQuantAI', loadComponent: () => import('./features/cart/cart').then((m) => m.Cart) },

  { path: 'login', title: 'Login | TerraQuantAI', loadComponent: () => import('./features/auth/login').then((m) => m.Login) },
  { path: 'signup', title: 'Create account | TerraQuantAI', loadComponent: () => import('./features/auth/signup').then((m) => m.Signup) },
  { path: 'verify-email', title: 'Verify email | TerraQuantAI', loadComponent: () => import('./features/auth/verify-email').then((m) => m.VerifyEmail) },
  { path: 'forgot-password', title: 'Forgot password | TerraQuantAI', loadComponent: () => import('./features/auth/forgot-password').then((m) => m.ForgotPassword) },
  { path: 'reset-password', title: 'Reset password | TerraQuantAI', loadComponent: () => import('./features/auth/reset-password').then((m) => m.ResetPassword) },

  { path: 'account', title: 'My Account | TerraQuantAI', canActivate: [authGuard], loadComponent: () => import('./features/account/account').then((m) => m.Account) },
  { path: 'account/orders', title: 'My Orders | TerraQuantAI', canActivate: [authGuard], loadComponent: () => import('./features/account/orders').then((m) => m.Orders) },
  { path: 'checkout', title: 'Checkout | TerraQuantAI', canActivate: [authGuard], loadComponent: () => import('./features/checkout/checkout').then((m) => m.Checkout) },
  { path: 'admin', title: 'Admin dashboard | TerraQuantAI', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin').then((m) => m.Admin) },

  page('about', 'About'),
  page('resources', 'Resources'),
  page('resources/faqs', 'FAQs'),
  page('contact', 'Contact'),
  page('privacy', 'Privacy Policy'),
  page('terms', 'Terms of Service'),
  page('refund-policy', 'Refund Policy'),
  page('disclaimer', 'Disclaimer'),
  page('**', 'Page not found'),
];
