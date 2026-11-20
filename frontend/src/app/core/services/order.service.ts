import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { CartItem } from './cart.service';
import { CreateOrderRequest, CustomerOrder, OrderPageResponse } from '../../shared/models/order.models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;

  private withCsrf<T>(request: () => Observable<T>): Observable<T> {
    return this.http.get<{ token: string }>(`${this.baseUrl}/auth/csrf`, { withCredentials: true })
      .pipe(switchMap(() => request()));
  }

  createOrder(items: CartItem[]): Observable<CustomerOrder> {
    const body: CreateOrderRequest = { productIds: items.map(item => item.productId) };
    return this.withCsrf(() => this.http.post<CustomerOrder>(`${this.baseUrl}/orders`, body, { withCredentials: true }));
  }

  submitPaymentReference(orderId: string, utrReference: string, screenshot?: File): Observable<CustomerOrder> {
    const body = new FormData();
    body.append('utrReference', utrReference.trim());
    if (screenshot) body.append('screenshot', screenshot);
    return this.withCsrf(() => this.http.post<CustomerOrder>(
      `${this.baseUrl}/orders/${encodeURIComponent(orderId)}/payment-submission`, body, { withCredentials: true },
    ));
  }

  getMyOrders(page = 0, size = 10): Observable<OrderPageResponse> {
    return this.http.get<OrderPageResponse>(`${this.baseUrl}/orders/me?page=${page}&size=${size}`, { withCredentials: true });
  }

  getMyOrder(orderId: string): Observable<CustomerOrder> {
    return this.http.get<CustomerOrder>(`${this.baseUrl}/orders/me/${encodeURIComponent(orderId)}`, { withCredentials: true });
  }

  getDownloadUrl(orderId: string, productId: string): Observable<{ url: string; expiresAt: string }> {
    return this.withCsrf(() => this.http.post<{ url: string; expiresAt: string }>(
      `${this.baseUrl}/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(productId)}/download`, {}, { withCredentials: true },
    ));
  }
}
