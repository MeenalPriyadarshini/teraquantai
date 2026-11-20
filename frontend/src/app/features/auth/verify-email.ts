import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink],
  template: `
    <section class="container-page flex min-h-[65vh] items-center justify-center py-12">
      <div class="card w-full max-w-lg p-8 text-center">
        <h1 class="text-2xl font-extrabold text-ink-900">Email verification</h1>
        @if (status() === 'checking') {
          <p class="mt-3 text-sm text-ink-500">Checking your verification link…</p>
        } @else if (status() === 'success') {
          <p role="status" class="mt-3 text-sm text-brand-800">{{ message() }}</p>
          <a routerLink="/login" class="btn-primary mt-6">Continue to sign in</a>
        } @else {
          <p role="alert" class="mt-3 text-sm text-red-700">{{ message() }}</p>
          <a routerLink="/login" class="btn-outline mt-6">Back to sign in</a>
        }
      </div>
    </section>
  `,
})
export class VerifyEmail {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  protected readonly status = signal<'checking' | 'success' | 'error'>('checking');
  protected readonly message = signal('Please wait while we verify your email address.');

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status.set('error');
      this.message.set('This verification link is incomplete. Please request a new one.');
      return;
    }

    this.auth.verifyEmail(token).subscribe({
      next: (response) => {
        this.status.set('success');
        this.message.set(response.message || 'Your email address has been verified. You can now sign in.');
      },
      error: (err: { error?: { message?: string } }) => {
        this.status.set('error');
        this.message.set(err.error?.message ?? 'This verification link is invalid or has expired.');
      },
    });
  }
}
