import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import {
  AuthMessageResponse,
  AuthSessionResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../../shared/models/auth.models';

/**
 * Authentication uses a server-managed session in an HttpOnly cookie.
 * No access token or password is stored in localStorage/sessionStorage.
 *
 * The Spring Boot API must set Secure, HttpOnly and appropriate SameSite
 * cookie attributes, validate CSRF where applicable, and enforce permissions
 * on every protected endpoint.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;

  private readonly _user = signal<AuthUser | null>(null);
  private sessionChecked = false;

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = () => this._user() !== null;
  readonly isAdmin = () => this._user()?.role === 'ADMIN';

  register(email: string, password: string): Observable<AuthMessageResponse> {
    const body: RegisterRequest = { email: email.trim().toLowerCase(), password };
    return this.http.post<AuthMessageResponse>(
      `${this.baseUrl}/auth/register`,
      body,
      { withCredentials: true },
    );
  }

  login(email: string, password: string): Observable<AuthUser> {
    const body: LoginRequest = { email: email.trim().toLowerCase(), password };
    return this.http
      .post<AuthSessionResponse>(`${this.baseUrl}/auth/login`, body, { withCredentials: true })
      .pipe(
        map((response) => response.user),
        tap((user) => {
          this._user.set(user);
          this.sessionChecked = true;
        }),
      );
  }

  loadCurrentUser(forceRefresh = false): Observable<AuthUser | null> {
    if (this.sessionChecked && !forceRefresh) {
      return of(this._user());
    }

    return this.http
      .get<AuthSessionResponse>(`${this.baseUrl}/auth/me`, { withCredentials: true })
      .pipe(
        map((response) => response.user),
        tap((user) => {
          this._user.set(user);
          this.sessionChecked = true;
        }),
        catchError((error) => {
          if (error.status === 401 || error.status === 403) {
            this._user.set(null);
            this.sessionChecked = true;
            return of(null);
          }
          return throwError(() => error);
        }),
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this._user.set(null);
          this.sessionChecked = true;
        }),
      );
  }

  verifyEmail(token: string): Observable<AuthMessageResponse> {
    return this.http.post<AuthMessageResponse>(
      `${this.baseUrl}/auth/email/verify`,
      { token },
    );
  }

  resendVerification(email: string): Observable<AuthMessageResponse> {
    return this.http.post<AuthMessageResponse>(
      `${this.baseUrl}/auth/email/verification/resend`,
      { email: email.trim().toLowerCase() },
    );
  }

  requestPasswordReset(email: string): Observable<AuthMessageResponse> {
    return this.http.post<AuthMessageResponse>(
      `${this.baseUrl}/auth/password/forgot`,
      { email: email.trim().toLowerCase() },
    );
  }

  resetPassword(token: string, newPassword: string): Observable<AuthMessageResponse> {
    const body: ResetPasswordRequest = { token, newPassword };
    return this.http.post<AuthMessageResponse>(
      `${this.baseUrl}/auth/password/reset`,
      body,
    );
  }
}
