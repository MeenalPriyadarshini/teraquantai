import { Component, computed, input, signal } from '@angular/core';
import { Icon } from '../ui/icon';

/**
 * Shows a product's cover image. Drop a file named after the product slug into
 * public/images/products/ (webp, jpg, jpeg or png) and it appears automatically.
 * If no image exists yet, a neutral placeholder is shown.
 * Give the host element a size, e.g. class="h-36" or class="aspect-4/3".
 */
@Component({
  selector: 'app-product-image',
  imports: [Icon],
  host: { class: 'block overflow-hidden' },
  template: `
    @if (src(); as s) {
      <img [src]="s" [alt]="alt()" class="h-full w-full object-cover" loading="lazy" (error)="next()" />
    } @else {
      <div class="grid h-full w-full place-items-center bg-linear-to-br from-brand-100 via-brand-50 to-sky-100 text-brand-700">
        <app-icon name="chart" class="size-12 opacity-60" />
      </div>
    }`,
})
export class ProductImage {
  slug = input.required<string>();
  /** optional explicit path/URL that overrides the slug-based lookup */
  imageUrl = input<string>();
  alt = input('');

  private readonly tried = signal(0);
  private readonly candidates = computed(() => {
    const explicit = this.imageUrl();
    return explicit
      ? [explicit]
      : ['webp', 'jpg', 'jpeg', 'png'].map((ext) => `images/products/${this.slug()}.${ext}`);
  });
  protected readonly src = computed(() => this.candidates()[this.tried()]);

  protected next(): void { this.tried.update((n) => n + 1); }
}
