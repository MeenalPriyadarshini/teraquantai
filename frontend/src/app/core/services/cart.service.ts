import { Injectable, PLATFORM_ID, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../../shared/models/catalog.models';

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  /** Integer paise copied for display only; the backend recalculates at checkout. */
  pricePaise: number | null;
  currency: 'INR';
}

const KEY = 'tq-cart-v2';

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;

  const item = value as Partial<CartItem>;
  return typeof item.productId === 'string'
    && typeof item.slug === 'string'
    && typeof item.title === 'string'
    && (item.pricePaise === null || (Number.isSafeInteger(item.pricePaise) && item.pricePaise >= 0))
    && item.currency === 'INR';
}

/**
 * Browser cart for the shopping experience. It is not an order record and is
 * never trusted for pricing or payment. The backend validates product status
 * and current price when it creates an order.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _items = signal<CartItem[]>([]);
  private ready = false;

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);
  /** Total in paise; null if an item has not been priced yet. */
  readonly total = computed(() => {
    const items = this._items();
    return items.some((item) => item.pricePaise == null)
      ? null
      : items.reduce((sum, item) => sum + (item.pricePaise ?? 0), 0);
  });

  constructor() {
    // Load after hydration so server and browser HTML match.
    afterNextRender(() => {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          this._items.set(Array.isArray(parsed) ? parsed.filter(isCartItem) : []);
        }
      } catch {
        // Storage unavailable or invalid: start with an empty cart.
      }
      this.ready = true;
    });

    effect(() => {
      const items = this._items();
      if (!this.browser || !this.ready) return;

      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {
        // Ignore storage quota / privacy-mode errors.
      }
    });
  }

  has(slug: string | undefined): boolean {
    return !!slug && this._items().some((item) => item.slug === slug);
  }

  add(product: Product): void {
    // Unpublished or unpriced products cannot enter a purchasable cart.
    if (product.status !== 'published' || product.pricePaise == null) return;
    if (this._items().some((item) => item.productId === product.id)) return;

    this._items.update((items) => [
      ...items,
      {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        pricePaise: product.pricePaise,
        currency: product.currency,
      },
    ]);
  }

  remove(productId: string): void {
    this._items.update((items) => items.filter((item) => item.productId !== productId));
  }

  clear(): void {
    this._items.set([]);
  }
}
