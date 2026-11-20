import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div class="card w-full max-w-md p-6 sm:p-8">
        <p class="text-sm font-semibold text-brand-700">Get started</p>
        <h1 class="mt-2 text-3xl font-extrabold text-ink-900">Create your account</h1>
        <p class="mt-2 text-sm text-ink-500">Use your email address to create a secure customer account.</p>

        @if (success()) {
          <div role="status" class="mt-6 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
            <p class="font-semibold">Check your inbox</p>
            <p class="mt-1">{{ success() }}</p>
            <a routerLink="/login" class="mt-3 inline-block font-semibold underline">Go to sign in</a>
          </div>
        } @else {
          @if (error()) {
            <p role="alert" class="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ error() }}</p>
          }
          <form class="mt-6 space-y-4" (ngSubmit)="submit()" #signupForm="ngForm">
            <div>
              <label for="email" class="mb-1.5 block text-sm font-semibold text-ink-900">Email address</label>
              <input id="email" name="email" type="email" autocomplete="email" required email
                [(ngModel)]="email" class="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                placeholder="you@example.com" />
            </div>
            <div>
              <label for="password" class="mb-1.5 block text-sm font-semibold text-ink-900">Password</label>
              <input id="password" name="password" type="password" autocomplete="new-password" required minlength="8"
                [(ngModel)]="password" class="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                placeholder="At least 8 characters" />
              <p class="mt-1 text-xs text-ink-500">Use at least 8 characters. The backend will enforce the final password policy.</p>
            </div>
            <div>
              <label for="confirmPassword" class="mb-1.5 block text-sm font-semibold text-ink-900">Confirm password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required
                [(ngModel)]="confirmPassword" class="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                placeholder="Re-enter your password" />
              @if (confirmPassword && password !== confirmPassword) {
                <p class="mt-1 text-xs text-red-600">Passwords do not match.</p>
              }
            </div>
            <button type="submit" [disabled]="signupForm.invalid || password !== confirmPassword || loading()"
              class="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50">
              {{ loading() ? 'Creating account…' : 'Create account' }}
            </button>
          </form>
          <p class="mt-6 text-center text-sm text-ink-500">Already registered?
            <a routerLink="/login" class="font-semibold text-brand-700 hover:underline">Sign in</a>
          </p>
        }
      </div>
    </section>
  `,
})
export class Signup {
  private readonly auth = inject(AuthService);
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');

  protected submit(): void {
    if (this.loading() || this.password !== this.confirmPassword) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.email, this.password).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.success.set(response.message || 'We sent a verification link to your email address. Open it to activate your account.');
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'We could not create your account. Please try again.');
      },
    });
  }
}
