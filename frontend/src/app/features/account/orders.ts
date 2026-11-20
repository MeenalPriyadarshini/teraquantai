import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { CustomerOrder } from '../../shared/models/order.models';
import { InrPipe } from '../../shared/pipes/inr.pipe';

@Component({
  selector: 'app-account-orders',
  imports: [DatePipe, RouterLink, InrPipe],
  template: `
    <section class="container-page py-12">
      <a routerLink="/account" class="text-sm font-semibold text-brand-700 hover:underline">← My account</a>
      <h1 class="mt-3 text-3xl font-extrabold text-ink-900">My orders</h1>
      <p class="mt-2 text-sm text-ink-500">Track payment verification and access reports you've purchased.</p>
      @if (routeNotice) {
        <p role="status" class="mt-5 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">Your payment reference was submitted. The order will remain locked until an administrator verifies the payment.</p>
      }
      @if (error()) {
        <p role="alert" class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error() }}</p>
      }
      @if (loading()) {
        <p class="mt-8 text-sm text-ink-500">Loading your orders…</p>
      } @else if (orders().length) {
        <div class="mt-8 space-y-4">
          @for (order of orders(); track order.id) {
            <article class="card p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-xs text-ink-500">{{ order.orderNumber }} · {{ order.createdAt | date:'mediumDate' }}</p>
                  <h2 class="mt-1 font-bold text-ink-900">{{ order.items.length }} report(s)</h2>
                </div>
                <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">{{ statusLabel(order.status) }}</span>
              </div>
              <ul class="mt-4 space-y-2 text-sm text-ink-700">
                @for (item of order.items; track item.productId) {
                  <li class="flex justify-between gap-3"><span>{{ item.title }}</span><span>{{ item.pricePaise | inr }}</span></li>
                }
              </ul>
              <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-100 pt-4">
                <span class="font-bold text-ink-900">Total: {{ order.totalPaise | inr }}</span>
                @if (order.status === 'PAID') {
                  <button type="button" (click)="download(order)" class="btn-primary">Download report</button>
                } @else {
                  <span class="text-xs text-ink-500">Downloads unlock after payment verification.</span>
                }
              </div>
            </article>
          }
        </div>
      } @else {
        <div class="card mt-8 p-8 text-center">
          <h2 class="text-lg font-bold text-ink-900">No orders yet</h2>
          <p class="mt-2 text-sm text-ink-500">Your purchases will appear here.</p>
          <a routerLink="/solutions" class="btn-primary mt-5">Explore reports</a>
        </div>
      }
    </section>
  `,
})
export class Orders {
  private readonly service = inject(OrderService);
  protected readonly orders = signal<CustomerOrder[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly routeNotice = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('submitted') === '1';

  constructor() {
    this.service.getMyOrders().subscribe({
      next: (response) => { this.orders.set(response.content); this.loading.set(false); },
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'We could not load your orders. The orders API may not be available yet.');
      },
    });
  }

  protected statusLabel(status: CustomerOrder['status']): string {
    return ({
      PENDING_PAYMENT: 'Awaiting payment',
      PAYMENT_UNDER_REVIEW: 'Payment under review',
      PAID: 'Paid',
      REJECTED: 'Payment rejected',
      CANCELLED: 'Cancelled',
    })[status];
  }

  protected download(order: CustomerOrder): void {
    for (const item of order.items) {
      this.service.getDownloadUrl(order.id, item.productId).subscribe({
        next: (result) => window.open(result.url, '_blank', 'noopener'),
        error: () => this.error.set('A secure download could not be prepared. Please try again.'),
      });
    }
  }
}
