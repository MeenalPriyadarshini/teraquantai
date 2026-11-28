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
 * product data comes from. Live API mode is enabled for the current implementation.
 * Mock fixtures remain available for isolated frontend development.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.baseUrl;

  getCategories(): Observable<Category[]> {
    if (API_CONFIG.useMockData) {
      return of(CATEGORIES);
    }

    return this.http.get<Array<Pick<Category, 'slug' | 'name' | 'blurb'>>>(`${this.baseUrl}/catalog/categories`).pipe(
      map(items => items.map(item => {
        const visual = CATEGORIES.find(category => category.slug === item.slug);
        return { ...visual, ...item, icon: visual?.icon ?? 'chart', tint: visual?.tint ?? 'from-slate-50 to-slate-100', iconColor: visual?.iconColor ?? 'text-brand-600' };
      })),
    );
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
      .pipe(map((response) => response.content.map(product => this.normalizeProduct(product))));
  }

  getFeaturedProducts(limit = 6): Observable<Product[]> {
    if (API_CONFIG.useMockData) {
      return of(PRODUCTS.filter((product) => product.status === 'published').slice(0, limit));
    }

    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<Product[]>(`${this.baseUrl}/catalog/products/featured`, { params })
      .pipe(map(products => products.map(product => this.normalizeProduct(product))));
  }

  private normalizeProduct(product: Product): Product {
    const period = product.period || (product.forecastStartDate && product.forecastEndDate
      ? `${product.forecastStartDate} – ${product.forecastEndDate}` : undefined);
    return { ...product, period };
  }

  getProduct(slug: string): Observable<Product | undefined> {
    if (API_CONFIG.useMockData) {
      return of(PRODUCTS.find((product) => product.slug === slug && product.status === 'published'));
    }

    return this.http
      .get<Product>(`${this.baseUrl}/catalog/products/${encodeURIComponent(slug)}`)
      .pipe(map(product => this.normalizeProduct(product)),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of(undefined);
          }
          return throwError(() => error);
        }),
      );
  }
}
