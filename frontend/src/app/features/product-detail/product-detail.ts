import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductImage } from '../../shared/components/product-image';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { Icon } from '../../shared/ui/icon';

type TabId = 'overview' | 'what' | 'specs' | 'faqs';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, Icon, InrPipe, ProductImage],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  /** bound from the :slug route parameter */
  slug = input.required<string>();

  private readonly catalog = inject(CatalogService);
  private readonly doc = inject(DOCUMENT);
  protected readonly cart = inject(CartService);

  protected readonly res = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.catalog.getProduct(params),
  });
  protected readonly product = computed(() => this.res.value());
  private readonly categories = toSignal(this.catalog.getCategories(), { initialValue: [] });
  protected readonly categoryName = computed(
    () => this.categories().find((c) => c.slug === this.product()?.categorySlug)?.name ?? '',
  );
  protected readonly inCart = computed(() => this.cart.has(this.product()?.slug));

  protected readonly tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'what', label: 'What You Get' },
    { id: 'specs', label: 'Specifications' },
    { id: 'faqs', label: 'FAQs' },
  ];
  protected readonly tab = signal<TabId>('overview');

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const p = this.product();
      if (p) seo.set(p.title, p.summary);
    });
  }

  protected onTabKey(e: KeyboardEvent): void {
    const i = this.tabs.findIndex((t) => t.id === this.tab());
    const n = e.key === 'ArrowRight' ? (i + 1) % this.tabs.length
      : e.key === 'ArrowLeft' ? (i - 1 + this.tabs.length) % this.tabs.length : -1;
    if (n < 0) return;
    e.preventDefault();
    this.tab.set(this.tabs[n].id);
    queueMicrotask(() => this.doc.getElementById('tab-' + this.tabs[n].id)?.focus());
  }
}
