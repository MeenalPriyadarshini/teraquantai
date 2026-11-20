import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'account', renderMode: RenderMode.Client },       // private, never prerendered
  { path: 'cart', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'signup', renderMode: RenderMode.Client },
  { path: 'solutions/:slug', renderMode: RenderMode.Server }, // rendered per request (data-driven)
  { path: '**', renderMode: RenderMode.Prerender },
];
