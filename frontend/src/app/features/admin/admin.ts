import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { API_CONFIG } from '../../core/config/api.config';

interface AdminSummary {
  publishedProducts: number;
  pendingPayments: number;
  customers: number;
  paidOrders: number;
}

interface PaymentReview {
  id: string;
  orderNumber: string;
  customerEmail: string;
  utrReference: string;
  amountPaise: number;
  submittedAt: string;
}

@Component({
  selector: 'app-admin',
  imports: [DatePipe, FormsModule],
  template: `
    <section class="container-page py-10">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-brand-700">TerraQuantAI management</p>
          <h1 class="mt-1 text-3xl font-extrabold text-ink-900">Admin dashboard</h1>
          <p class="mt-2 text-sm text-ink-500">Manage report listings and manually verify customer payments.</p>
        </div>
        <button type="button" (click)="refresh()" class="btn-outline">Refresh dashboard</button>
      </div>

      @if (error()) {
        <p role="alert" class="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{{ error() }}</p>
      }
      @if (summary(); as s) {
        <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article class="card p-5"><p class="text-sm text-ink-500">Published reports</p><p class="mt-2 text-3xl font-extrabold">{{ s.publishedProducts }}</p></article>
          <article class="card p-5"><p class="text-sm text-ink-500">Payments to review</p><p class="mt-2 text-3xl font-extrabold">{{ s.pendingPayments }}</p></article>
          <article class="card p-5"><p class="text-sm text-ink-500">Customers</p><p class="mt-2 text-3xl font-extrabold">{{ s.customers }}</p></article>
          <article class="card p-5"><p class="text-sm text-ink-500">Paid orders</p><p class="mt-2 text-3xl font-extrabold">{{ s.paidOrders }}</p></article>
        </div>
      }

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <section class="card p-6">
          <h2 class="text-lg font-bold text-ink-900">Product management</h2>
          <p class="mt-2 text-sm text-ink-500">The product workspace will support PDF/PPT uploads, draft and publish states, pricing, forecast periods and correction versions.</p>
          <p class="mt-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-900">Upload and publish actions become available after the private-storage API is connected.</p>
        </section>
        <section class="card p-6">
          <h2 class="text-lg font-bold text-ink-900">Payment verification</h2>
          @if (payments().length) {
            <div class="mt-4 space-y-3">
              @for (payment of payments(); track payment.id) {
                <article class="rounded-xl border border-brand-100 p-4">
                  <p class="font-semibold">{{ payment.orderNumber }} · ₹{{ (payment.amountPaise / 100).toFixed(2) }}</p>
                  <p class="mt-1 text-xs text-ink-500">{{ payment.customerEmail }} · UTR {{ payment.utrReference }}</p>
                  <p class="mt-1 text-xs text-ink-500">{{ payment.submittedAt | date:'medium' }}</p>
                  <div class="mt-3 flex gap-2">
                    <button type="button" (click)="review(payment.id, 'approve')" class="btn-primary">Verify payment</button>
                    <button type="button" (click)="review(payment.id, 'reject')" class="btn-outline">Reject</button>
                  </div>
                </article>
              }
            </div>
          } @else {
            <p class="mt-3 text-sm text-ink-500">No payment submissions are available. The review queue loads from the backend.</p>
          }
        </section>
      </div>
    </section>
  `,
})
export class Admin {
  private readonly http = inject(HttpClient);
  protected readonly summary = signal<AdminSummary | null>(null);
  protected readonly payments = signal<PaymentReview[]>([]);
  protected readonly error = signal('');

  constructor() { this.refresh(); }

  protected refresh(): void {
    this.error.set('');
    this.http.get<AdminSummary>(`${API_CONFIG.baseUrl}/admin/dashboard`, { withCredentials: true }).subscribe({
      next: (data) => this.summary.set(data),
      error: () => this.error.set('Admin API is not connected yet. This page is protected, and all admin permissions must be enforced by Spring Boot as well as the frontend route guard.'),
    });
    this.http.get<PaymentReview[]>(`${API_CONFIG.baseUrl}/admin/payments/pending`, { withCredentials: true }).subscribe({
      next: (data) => this.payments.set(data),
      error: () => undefined,
    });
  }

  protected review(id: string, decision: 'approve' | 'reject'): void {
    this.http.post(`${API_CONFIG.baseUrl}/admin/payments/${encodeURIComponent(id)}/${decision}`, {}, { withCredentials: true }).subscribe({
      next: () => this.refresh(),
      error: () => this.error.set('The payment decision could not be saved. Check that you are signed in as an administrator and the backend is running.'),
    });
  }
}
