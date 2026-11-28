import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div class="card w-full max-w-md p-6 sm:p-8">
        <p class="text-sm font-semibold text-brand-700">Welcome back</p>
        <h1 class="mt-2 text-3xl font-extrabold text-ink-900">Sign in to TerraQuantAI</h1>
        <p class="mt-2 text-sm text-ink-500">Access your purchases and report downloads.</p>

        @if (error()) {
          <p role="alert" class="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ error() }}</p>
        }
        @if (notice()) {
          <p role="status" class="mt-5 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">{{ notice() }}</p>
        }

        <form class="mt-6 space-y-4" (ngSubmit)="submit()" #loginForm="ngForm">
          <div>
            <label for="email" class="mb-1.5 block text-sm font-semibold text-ink-900">Email address</label>
            <input id="email" name="email" type="email" autocomplete="email" required email
              [(ngModel)]="email" class="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              placeholder="you@example.com" />
          </div>
          <div>
            <div class="mb-1.5 flex items-center justify-between gap-2">
              <label for="password" class="text-sm font-semibold text-ink-900">Password</label>
              <a routerLink="/forgot-password" class="text-xs font-semibold text-brand-700 hover:underline">Forgot password?</a>
            </div>
            <input id="password" name="password" type="password" autocomplete="current-password" required
              [(ngModel)]="password" class="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              placeholder="Enter your password" />
          </div>
          <button type="submit" [disabled]="loginForm.invalid || loading()"
            class="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-ink-500">New to TerraQuantAI?
          <a routerLink="/signup" class="font-semibold text-brand-700 hover:underline">Create an account</a>
        </p>
      </div>
    </section>
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected email = '';
  protected password = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');

  constructor() {
    if (this.route.snapshot.queryParamMap.get('registered') === '1') {
      this.notice.set('Your account has been created. Verify your email before signing in.');
    }
  }

  protected submit(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.email, this.password).subscribe({
      next: (user) => {
        this.loading.set(false);
        if (!user.emailVerified) {
          this.auth.logout().subscribe({ error: () => undefined });
          this.router.navigate(['/verify-email'], { queryParams: { email: user.email } });
          return;
        }
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const safeReturnUrl = returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
          ? returnUrl
          : user.role === 'ADMIN' ? '/admin' : '/account';
        this.router.navigateByUrl(safeReturnUrl);
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'We could not sign you in. Check your details and try again.');
      },
    });
  }
}
