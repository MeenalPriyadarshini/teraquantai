import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="container-page flex min-h-[65vh] items-center justify-center py-12">
      <div class="card w-full max-w-md p-8">
        <h1 class="text-2xl font-extrabold text-ink-900">Forgot your password?</h1>
        <p class="mt-2 text-sm text-ink-500">Enter your account email and we'll send a password reset link if an account matches.</p>
        @if (message()) {
          <p role="status" class="mt-5 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">{{ message() }}</p>
        }
        @if (error()) {
          <p role="alert" class="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ error() }}</p>
        }
        @if (!sent()) {
          <form class="mt-6 space-y-4" (ngSubmit)="submit()" #form="ngForm">
            <div>
              <label for="email" class="mb-1.5 block text-sm font-semibold">Email address</label>
              <input id="email" name="email" type="email" required email [(ngModel)]="email"
                class="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600" />
            </div>
            <button type="submit" [disabled]="form.invalid || loading()" class="btn-primary w-full justify-center disabled:opacity-50">
              {{ loading() ? 'Sending…' : 'Send reset link' }}
            </button>
          </form>
        }
        <a routerLink="/login" class="mt-6 block text-center text-sm font-semibold text-brand-700 hover:underline">Back to sign in</a>
      </div>
    </section>
  `,
})
export class ForgotPassword {
  private readonly auth = inject(AuthService);
  protected email = '';
  protected readonly loading = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');

  protected submit(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.requestPasswordReset(this.email).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.sent.set(true);
        this.message.set(response.message || 'If an account exists for this address, a password reset link has been sent.');
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'We could not process that request. Please try again.');
      },
    });
  }
}
