import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../models/catalog.models';
import { InrPipe } from '../pipes/inr.pipe';
import { Icon } from '../ui/icon';
import { ProductImage } from './product-image';

/**
 * One card, two looks: a real product, or an empty "coming soon" slot.
 * Slots are filled just by adding the product to the data source.
 */
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, Icon, InrPipe, ProductImage],
  template: `
    @if (isSlot()) {
      <div class="flex h-full min-h-72 flex-col items-center justify-center rounded-card border-2 border-dashed border-brand-200 bg-white/50 p-6 text-center">
        <span class="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600"><app-icon name="sparkle" class="size-6" /></span>
        <h3 class="mt-4 text-base font-semibold">{{ product().title }}</h3>
        <p class="mt-1 text-sm text-ink-500">{{ product().summary }}</p>
      </div>
    } @else {
      <article class="card flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-card">
        <app-product-image class="h-40" [slug]="product().slug" [imageUrl]="product().imageUrl" [alt]="product().title" />
        <div class="flex flex-1 flex-col p-5">
          <span class="badge self-start"><app-icon name="sparkle" class="size-3.5" /> AI-Powered</span>
          <h3 class="mt-3 text-lg font-bold">{{ product().title }}</h3>
          <p class="mt-2 text-sm leading-relaxed">{{ product().summary }}</p>
          <dl class="mt-4 space-y-1.5 text-xs text-ink-500">
            @if (product().market) { <div class="flex items-center gap-2"><app-icon name="pin" class="size-4 text-brand-600" /><dd>{{ product().market }}</dd></div> }
            @if (product().period) { <div class="flex items-center gap-2"><app-icon name="calendar" class="size-4 text-brand-600" /><dd>{{ product().period }}</dd></div> }
            @if (product().frequency) { <div class="flex items-center gap-2"><app-icon name="clock" class="size-4 text-brand-600" /><dd>{{ product().frequency }}</dd></div> }
          </dl>
          <div class="mt-auto flex items-center justify-between pt-5">
            <span class="text-sm font-semibold text-ink-900">{{ product().price | inr }}</span>
            <a [routerLink]="['/solutions', product().slug]" class="btn-primary px-4! py-2!">
              View details <app-icon name="arrow-right" class="size-4" />
            </a>
          </div>
        </div>
      </article>
    }`,
})
export class ProductCard {
  product = input.required<Product>();
  protected isSlot = computed(() => this.product().status === 'coming-soon');
}
