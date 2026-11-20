import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account',
  imports: [RouterLink],
  template: `
    <section class="container-page py-12">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-brand-700">Customer account</p>
          <h1 class="mt-1 text-3xl font-extrabold text-ink-900">My Account</h1>
          <p class="mt-2 text-sm text-ink-500">Manage your TerraQuantAI account and purchased reports.</p>
        </div>
        <button type="button" (click)="signOut()" [disabled]="loggingOut()" class="btn-outline disabled:opacity-50">
          {{ loggingOut() ? 'Signing out…' : 'Sign out' }}
        </button>
      </div>

      <div class="mt-8 grid gap-5 md:grid-cols-2">
        <article class="card p-6">
          <h2 class="text-lg font-bold text-ink-900">Account details</h2>
          <p class="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-500">Email address</p>
          <p class="mt-1 break-all font-medium text-ink-900">{{ auth.user()?.email }}</p>
          <p class="mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
             [class]="auth.user()?.emailVerified ? 'bg-brand-50 text-brand-800' : 'bg-amber-50 text-amber-800'">
            {{ auth.user()?.emailVerified ? 'Email verified' : 'Email not verified' }}
          </p>
        </article>
        <article class="card p-6">
          <h2 class="text-lg font-bold text-ink-900">My purchases</h2>
          <p class="mt-2 text-sm text-ink-500">View your payment status and download verified purchases.</p>
          <a routerLink="/account/orders" class="btn-outline mt-5">View my orders</a>
        </article>
      </div>
      @if (auth.isAdmin()) {
        <article class="card mt-5 p-6">
          <h2 class="text-lg font-bold text-ink-900">Administration</h2>
          <p class="mt-2 text-sm text-ink-500">Manage catalogue and review payment submissions.</p>
          <a routerLink="/admin" class="btn-outline mt-4">Open admin dashboard</a>
        </article>
      }
      @if (error()) {
        <p role="alert" class="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ error() }}</p>
      }
    </section>
  `,
})
export class Account {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly loggingOut = signal(false);
  protected readonly error = signal('');

  protected signOut(): void {
    this.loggingOut.set(true);
    this.error.set('');
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.loggingOut.set(false);
        this.error.set('We could not complete sign out. Please try again.');
      },
    });
  }
}
