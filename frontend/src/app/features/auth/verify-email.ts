import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="container-page flex min-h-[65vh] items-center justify-center py-12">
      <div class="card w-full max-w-lg p-8">
        <div class="text-center">
          <h1 class="text-2xl font-extrabold text-ink-900">Email verification</h1>
          @if (status() === 'checking') {
            <p class="mt-3 text-sm text-ink-500">Checking your verification link…</p>
          } @else if (status() === 'success') {
            <p role="status" class="mt-3 text-sm text-brand-800">{{ message() }}</p>
            <a routerLink="/login" class="btn-primary mt-6">Continue to sign in</a>
          } @else {
            <p class="mt-3 text-sm text-ink-600">{{ message() }}</p>
          }
        </div>

        @if (status() === 'error') {
          <div class="mt-6 border-t border-brand-100 pt-6">
            <h2 class="font-semibold text-ink-900">Send a new verification link</h2>
            <p class="mt-1 text-sm text-ink-500">Enter the email address you used to register.</p>
            @if (resendMessage()) {
              <p role="status" class="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">{{ resendMessage() }}</p>
            }
            @if (resendError()) {
              <p role="alert" class="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ resendError() }}</p>
            }
            <form class="mt-4 space-y-3" (ngSubmit)="resend()" #form="ngForm">
              <label for="email" class="block text-sm font-semibold text-ink-900">Email address</label>
              <input id="email" name="email" type="email" required email [(ngModel)]="email"
                class="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600" />
              <button type="submit" [disabled]="form.invalid || resending()" class="btn-primary w-full justify-center disabled:opacity-50">
                {{ resending() ? 'Sending…' : 'Resend verification email' }}
              </button>
            </form>
          </div>
          <a routerLink="/login" class="mt-5 block text-center text-sm font-semibold text-brand-700 hover:underline">Back to sign in</a>
        }
      </div>
    </section>
  `,
})
export class VerifyEmail {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  protected email = this.route.snapshot.queryParamMap.get('email') ?? '';
  protected readonly status = signal<'checking' | 'success' | 'error'>('checking');
  protected readonly message = signal('Please wait while we verify your email address.');
  protected readonly resending = signal(false);
  protected readonly resendMessage = signal('');
  protected readonly resendError = signal('');

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status.set('error');
      this.message.set('Your account needs email verification. If your link is missing or expired, request a new one below.');
      return;
    }

    this.auth.verifyEmail(token).subscribe({
      next: (response) => {
        this.status.set('success');
        this.message.set(response.message || 'Your email address has been verified. You can now sign in.');
      },
      error: (err: { error?: { message?: string } }) => {
        this.status.set('error');
        this.message.set(err.error?.message ?? 'This verification link is invalid or has expired. You can request a new link below.');
      },
    });
  }

  protected resend(): void {
    if (this.resending()) return;
    this.resending.set(true);
    this.resendMessage.set('');
    this.resendError.set('');
    this.auth.resendVerification(this.email).subscribe({
      next: (response) => {
        this.resending.set(false);
        this.resendMessage.set(response.message || 'If the account needs verification, a new link has been sent.');
      },
      error: (err: { error?: { message?: string } }) => {
        this.resending.set(false);
        this.resendError.set(err.error?.message ?? 'We could not send a verification email. Please try again.');
      },
    });
  }
}
