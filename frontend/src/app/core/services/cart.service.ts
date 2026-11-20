import { Injectable, PLATFORM_ID, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../../shared/models/catalog.models';

export interface CartItem {
  slug: string;
  title: string;
  price: number | null;
}

const KEY = 'tq-cart-v1';

/**
 * Prototype cart (browser storage only). The real price and order are always
 * re-checked by the backend at checkout; nothing here is trusted for payment.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _items = signal<CartItem[]>([]);
  private ready = false;

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);
  /** null when any item has no price yet */
  readonly total = computed(() => {
    const items = this._items();
    return items.some((i) => i.price == null) ? null : items.reduce((s, i) => s + (i.price ?? 0), 0);
  });

  constructor() {
    // Load after hydration so server and browser HTML match
    afterNextRender(() => {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) this._items.set(JSON.parse(raw));
      } catch { /* storage unavailable: start empty */ }
      this.ready = true;
    });
    effect(() => {
      const items = this._items();
      if (!this.browser || !this.ready) return;
      try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
    });
  }

  has(slug: string | undefined): boolean {
    return !!slug && this._items().some((i) => i.slug === slug);
  }

  add(p: Product): void {
    if (this.has(p.slug)) return; // digital report: one per product
    this._items.update((l) => [...l, { slug: p.slug, title: p.title, price: p.price }]);
  }

  remove(slug: string): void {
    this._items.update((l) => l.filter((i) => i.slug !== slug));
  }

  clear(): void { this._items.set([]); }
}
