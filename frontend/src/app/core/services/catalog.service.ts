import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CATEGORIES } from '../../data/categories.data';
import { PRODUCTS } from '../../data/products.data';
import { Category, Product } from '../../shared/models/catalog.models';

/**
 * Mock data today. When the Spring Boot API exists, swap `of(...)` for
 * HttpClient calls; the components that use this service do not change.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  getCategories(): Observable<Category[]> {
    return of(CATEGORIES);
  }

  getProducts(): Observable<Product[]> {
    return of(PRODUCTS);
  }

  getFeaturedProducts(): Observable<Product[]> {
    return of(PRODUCTS);
  }

  getProduct(slug: string): Observable<Product | undefined> {
    return of(PRODUCTS.find((p) => p.slug === slug && p.status === 'available'));
  }
}
