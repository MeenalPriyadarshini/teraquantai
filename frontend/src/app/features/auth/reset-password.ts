import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="container-page flex min-h-[65vh] items-center justify-center py-12">
      <div class="card w-full max-w-md p-8">
        <h1 class="text-2xl font-extrabold text-ink-900">Set a new password</h1>
        @if (success()) {
          <p role="status" class="mt-5 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">{{ success() }}</p>
          <a routerLink="/login" class="btn-primary mt-6 w-full justify-center">Sign in</a>
        } @else {
          <p class="mt-2 text-sm text-ink-500">Choose a new password for your account.</p>
          @if (error()) {
            <p role="alert" class="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ error() }}</p>
          }
          <form class="mt-6 space-y-4" (ngSubmit)="submit()" #form="ngForm">
            <div>
              <label for="password" class="mb-1.5 block text-sm font-semibold">New password</label>
              <input id="password" name="password" type="password" required minlength="8" autocomplete="new-password"
                [(ngModel)]="password" class="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600" />
            </div>
            <div>
              <label for="confirm" class="mb-1.5 block text-sm font-semibold">Confirm new password</label>
              <input id="confirm" name="confirm" type="password" required autocomplete="new-password"
                [(ngModel)]="confirm" class="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600" />
              @if (confirm && password !== confirm) {
                <p class="mt-1 text-xs text-red-600">Passwords do not match.</p>
              }
            </div>
            <button type="submit" [disabled]="form.invalid || password !== confirm || loading() || !token"
              class="btn-primary w-full justify-center disabled:opacity-50">
              {{ loading() ? 'Updating…' : 'Update password' }}
            </button>
          </form>
        }
      </div>
    </section>
  `,
})
export class ResetPassword {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  protected readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';
  protected password = '';
  protected confirm = '';
  protected readonly loading = signal(false);
  protected readonly error = signal(this.token ? '' : 'This reset link is incomplete. Request a new password reset link.');
  protected readonly success = signal('');

  protected submit(): void {
    if (!this.token || this.password !== this.confirm || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.success.set(response.message || 'Your password has been updated. You can now sign in.');
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'This reset link is invalid or has expired.');
      },
    });
  }
}
