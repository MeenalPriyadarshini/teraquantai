import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCard } from '../../shared/components/product-card';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-solutions',
  imports: [RouterLink, Icon, PageHeader, ProductCard],
  templateUrl: './solutions.html',
})
export class Solutions {
  /** bound from the ?category= query parameter */
  category = input<string>();

  private readonly catalog = inject(CatalogService);
  protected readonly categories = toSignal(this.catalog.getCategories(), { initialValue: [] });
  private readonly products = toSignal(this.catalog.getProducts(), { initialValue: [] });
  protected readonly search = signal('');

  protected readonly activeCategory = computed(() => this.categories().find((c) => c.slug === this.category()));

  protected readonly filtered = computed(() => {
    const cat = this.category();
    const q = this.search().trim().toLowerCase();
    return this.products().filter(
      (p) => (!cat || p.categorySlug === cat) && (!q || `${p.title} ${p.summary}`.toLowerCase().includes(q)),
    );
  });

  protected chip(active: boolean): string {
    const base = 'rounded-full px-4 py-2 text-sm font-semibold ring-1 transition';
    return active
      ? `${base} bg-brand-800 text-white ring-brand-800`
      : `${base} bg-white/80 text-ink-900 ring-brand-200 hover:bg-brand-50`;
  }

  constructor() {
    inject(SeoService).set('Solutions', 'Browse AI-powered forecasting and intelligence solutions for agriculture, energy, markets and industry.');
  }
}
