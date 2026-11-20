import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { CustomerOrder } from '../../shared/models/order.models';
import { apiErrorMessage } from '../../shared/utils/api-error';

@Component({
  selector: 'app-checkout',
  imports: [FormsModule, RouterLink, InrPipe],
  template: `
    <section class="container-page py-12">
      <a routerLink="/cart" class="text-sm font-semibold text-brand-700 hover:underline">← Back to cart</a>
      <h1 class="mt-3 text-3xl font-extrabold text-ink-900">Checkout</h1>
      <p class="mt-2 text-sm text-ink-500">Review your order before creating a payment request.</p>

      @if (error()) {
        <p role="alert" class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ error() }}</p>
      }
      @if (!createdOrder()) {
        <div class="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div class="card p-6">
            <h2 class="text-lg font-bold text-ink-900">Your reports</h2>
            @for (item of cart.items(); track item.productId) {
              <div class="flex justify-between gap-4 border-b border-brand-100 py-4 text-sm">
                <span class="font-medium text-ink-800">{{ item.title }}</span>
                <span class="font-semibold text-ink-900">{{ item.pricePaise | inr }}</span>
              </div>
            }
            @if (!cart.items().length) {
              <p class="py-5 text-sm text-ink-500">Your cart is empty.</p>
              <a routerLink="/solutions" class="btn-outline mt-3">Browse reports</a>
            }
          </div>
          <aside class="card h-fit p-6">
            <h2 class="font-bold text-ink-900">Order total</h2>
            <p class="mt-3 text-2xl font-extrabold text-ink-900">{{ cart.total() | inr }}</p>
            <p class="mt-2 text-xs text-ink-500">The server will re-check product availability and calculate the final amount.</p>
            <button type="button" (click)="createOrder()" [disabled]="!cart.items().length || creating()"
              class="btn-primary mt-6 w-full justify-center disabled:opacity-50">
              {{ creating() ? 'Creating order…' : 'Continue to payment' }}
            </button>
          </aside>
        </div>
      } @else {
        <div class="card mt-8 max-w-2xl p-6">
          <p class="text-sm font-semibold text-brand-700">Order created</p>
          <h2 class="mt-2 text-xl font-bold text-ink-900">Order {{ createdOrder()?.orderNumber }}</h2>
          <p class="mt-2 text-sm text-ink-600">Your order is awaiting payment. Use the official payment QR/details provided by TerraQuantAI and submit the UTR/reference below. Do not upload sensitive banking credentials.</p>
          <div class="mt-5 rounded-xl bg-brand-50 p-4">
            <p class="text-sm text-ink-600">Amount to pay</p>
            <p class="mt-1 text-2xl font-extrabold text-ink-900">{{ createdOrder()?.totalPaise | inr }}</p>
            <p class="mt-2 text-xs text-ink-600">Payment QR details will appear here once configured by the administrator.</p>
          </div>
          <form class="mt-6 space-y-4" (ngSubmit)="submitPayment()" #paymentForm="ngForm">
            <div>
              <label for="utr" class="mb-1.5 block text-sm font-semibold text-ink-900">UTR / transaction reference</label>
              <input id="utr" name="utr" required minlength="6" maxlength="80" [(ngModel)]="utr"
                class="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600"
                placeholder="Enter your payment reference" />
            </div>
            <div>
              <label for="screenshot" class="mb-1.5 block text-sm font-semibold text-ink-900">Payment screenshot (optional)</label>
              <input id="screenshot" name="screenshot" type="file" accept="image/png,image/jpeg,image/webp"
                (change)="selectScreenshot($event)" class="block w-full text-sm text-ink-600" />
              <p class="mt-1 text-xs text-ink-500">Optional. Do not upload full account numbers, passwords or OTPs.</p>
            </div>
            <button type="submit" [disabled]="paymentForm.invalid || submitting()" class="btn-primary w-full justify-center disabled:opacity-50">
              {{ submitting() ? 'Submitting…' : 'Submit payment for verification' }}
            </button>
          </form>
        </div>
      }
    </section>
  `,
})
export class Checkout {
  protected readonly cart = inject(CartService);
  private readonly orders = inject(OrderService);
  private readonly router = inject(Router);
  protected readonly creating = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected readonly createdOrder = signal<CustomerOrder | null>(null);
  protected utr = '';
  private screenshot?: File;

  protected createOrder(): void {
    if (!this.cart.items().length || this.creating()) return;
    this.creating.set(true);
    this.error.set('');
    this.orders.createOrder(this.cart.items()).subscribe({
      next: (order) => { this.createdOrder.set(order); this.creating.set(false); },
      error: (err: unknown) => {
        this.creating.set(false);
        this.error.set(apiErrorMessage(err, 'We could not create your order. Please try again.'));
      },
    });
  }

  protected selectScreenshot(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) { this.screenshot = undefined; return; }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.error.set('Choose a PNG, JPG or WebP image up to 5 MB.');
      (event.target as HTMLInputElement).value = '';
      this.screenshot = undefined;
      return;
    }
    this.error.set('');
    this.screenshot = file;
  }

  protected submitPayment(): void {
    const order = this.createdOrder();
    if (!order || this.submitting()) return;
    this.submitting.set(true);
    this.error.set('');
    this.orders.submitPaymentReference(order.id, this.utr, this.screenshot).subscribe({
      next: () => {
        this.submitting.set(false);
        this.cart.clear();
        this.router.navigate(['/account/orders'], { queryParams: { submitted: '1' } });
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.error.set(apiErrorMessage(err, 'We could not submit your payment reference. Please try again.'));
      },
    });
  }
}
