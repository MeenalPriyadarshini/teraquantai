import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { CATEGORIES } from '../../data/categories.data';
import { PRODUCTS } from '../../data/products.data';
import {
  CatalogQuery,
  Category,
  PageResponse,
  Product,
} from '../../shared/models/catalog.models';

/**
 * The catalogue is read through this service so pages do not depend on where
 * product data comes from. Mock mode is used until the Spring Boot API exists.
 *
 * Expected API endpoints are documented in docs/frontend-api-contract.md.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;

  getCategories(): Observable<Category[]> {
    if (API_CONFIG.useMockData) {
      return of(CATEGORIES);
    }

    return this.http.get<Category[]>(`${this.baseUrl}/catalog/categories`);
  }

  getProducts(query: CatalogQuery = {}): Observable<Product[]> {
    if (API_CONFIG.useMockData) {
      const search = query.search?.trim().toLowerCase();

      return of(
        PRODUCTS.filter((product) => product.status === 'published' || product.status === 'coming-soon')
          .filter((product) => !query.categorySlug || product.categorySlug === query.categorySlug)
          .filter((product) => !search || `${product.title} ${product.summary}`.toLowerCase().includes(search))
          .slice((query.page ?? 0) * (query.size ?? 100), (query.page ?? 0) * (query.size ?? 100) + (query.size ?? 100)),
      );
    }

    let params = new HttpParams()
      .set('page', String(query.page ?? 0))
      .set('size', String(query.size ?? 100));

    if (query.categorySlug) {
      params = params.set('category', query.categorySlug);
    }
    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    return this.http
      .get<PageResponse<Product>>(`${this.baseUrl}/catalog/products`, { params })
      .pipe(map((response) => response.content));
  }

  getFeaturedProducts(limit = 6): Observable<Product[]> {
    if (API_CONFIG.useMockData) {
      return of(PRODUCTS.filter((product) => product.status === 'published').slice(0, limit));
    }

    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<Product[]>(`${this.baseUrl}/catalog/products/featured`, { params });
  }

  getProduct(slug: string): Observable<Product | undefined> {
    if (API_CONFIG.useMockData) {
      return of(PRODUCTS.find((product) => product.slug === slug && product.status === 'published'));
    }

    return this.http
      .get<Product>(`${this.baseUrl}/catalog/products/${encodeURIComponent(slug)}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of(undefined);
          }
          return throwError(() => error);
        }),
      );
  }
}
