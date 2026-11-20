import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCard } from '../../shared/components/product-card';
import { Icon } from '../../shared/ui/icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, ProductCard],
  templateUrl: './home.html',
})
export class Home {
  private readonly catalog = inject(CatalogService);

  protected readonly categories = toSignal(this.catalog.getCategories(), { initialValue: [] });
  protected readonly featured = toSignal(this.catalog.getFeaturedProducts(), { initialValue: [] });

  protected readonly steps = [
    { n: '1', title: 'Explore', text: 'Browse solutions by market or industry.' },
    { n: '2', title: 'Choose', text: 'Review what is included, the coverage period and the price.' },
    { n: '3', title: 'Access', text: 'Get your report securely from your account.' },
  ];

  protected readonly benefits = [
    { icon: 'bolt', title: 'AI-Powered Analytics', text: 'Advanced analysis behind every solution.' },
    { icon: 'target', title: 'Data-Driven Insights', text: 'Clear views of where a market may be heading.' },
    { icon: 'shield', title: 'Secure Checkout', text: 'Protected payments and private report access.' },
    { icon: 'gauge', title: 'Built for Real Decisions', text: 'Ready-to-use reports. No technical skills needed.' },
  ];

  protected readonly bars = [18, 30, 24, 40, 52, 46, 64, 78, 92];

  constructor() {
    inject(SeoService).set(null, 'Explore specialized AI-powered forecasting and intelligence solutions for agriculture, energy, markets and industry.');
  }
}
