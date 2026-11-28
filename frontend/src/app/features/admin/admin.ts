import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';
import { API_CONFIG } from '../../core/config/api.config';
import { AuthService } from '../../core/services/auth.service';

interface AdminSummary {
  publishedProducts: number;
  draftProducts: number;
  archivedProducts: number;
  totalProducts: number;
  customers: number;
  totalOrders: number;
}
interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
  active: boolean;
}
interface AdminProduct {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  summary: string;
  market?: string;
  forecastStartDate?: string;
  forecastEndDate?: string;
  frequency?: string;
  pricePaise: number | null;
  currency: string;
  format: 'PDF' | 'PPT';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  versionCount: number;
  latestVersion?: number;
}
interface ProductForm {
  title: string;
  slug: string;
  categorySlug: string;
  summary: string;
  market: string;
  forecastStartDate: string;
  forecastEndDate: string;
  frequency: string;
  priceRupees: number | null;
  format: 'PDF' | 'PPT';
}
interface AdminVersion {
  versionNumber: number;
  format: string;
  originalFilename: string;
  fileSizeBytes: number;
  isCorrection: boolean;
  changeSummary?: string;
  createdAt: string;
}

const emptyProductForm = (): ProductForm => ({
  title: '', slug: '', categorySlug: '', summary: '', market: '',
  forecastStartDate: '', forecastEndDate: '', frequency: '',
  priceRupees: null, format: 'PDF',
});

@Component({
  selector: 'app-admin',
  imports: [DatePipe, FormsModule],
  template: `
    <section class="container-page py-10">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-brand-700">TerraQuantAI management</p>
          <h1 class="mt-1 text-3xl font-extrabold text-ink-900">Admin dashboard</h1>
          <p class="mt-2 text-sm text-ink-500">Manage commodity reports, catalogue listings and product files.</p>
        </div>
        <div class="flex gap-2">
          <button type="button" (click)="refresh()" class="btn-outline">Refresh</button>
          <button type="button" (click)="signOut()" class="btn-outline">Sign out</button>
        </div>
      </div>

      @if (notice()) {
        <p role="status" class="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{{ notice() }}</p>
      }
      @if (error()) {
        <p role="alert" class="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{{ error() }}</p>
      }

      @if (summary(); as s) {
        <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article class="card p-5"><p class="text-sm text-ink-500">All products</p><p class="mt-2 text-3xl font-extrabold">{{ s.totalProducts }}</p></article>
          <article class="card p-5"><p class="text-sm text-ink-500">Published reports</p><p class="mt-2 text-3xl font-extrabold">{{ s.publishedProducts }}</p></article>
          <article class="card p-5"><p class="text-sm text-ink-500">Draft reports</p><p class="mt-2 text-3xl font-extrabold">{{ s.draftProducts }}</p></article>
          <article class="card p-5"><p class="text-sm text-ink-500">Archived reports</p><p class="mt-2 text-3xl font-extrabold">{{ s.archivedProducts }}</p></article>
          <article class="card p-5"><p class="text-sm text-ink-500">Customers</p><p class="mt-2 text-3xl font-extrabold">{{ s.customers }}</p></article>
          <article class="card p-5"><p class="text-sm text-ink-500">Orders</p><p class="mt-2 text-3xl font-extrabold">{{ s.totalOrders }}</p></article>
        </div>
      }

      <div class="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        <section class="min-w-0">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-xl font-bold text-ink-900">Product catalogue</h2>
              <p class="mt-1 text-sm text-ink-500">Create a report product, upload its file and publish it when ready.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <input aria-label="Search products" class="input-field max-w-48" placeholder="Search reports" [(ngModel)]="search" (ngModelChange)="loadProducts()">
              <select aria-label="Filter by status" class="input-field" [(ngModel)]="statusFilter" (ngModelChange)="loadProducts()">
                <option value="">All statuses</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div class="mt-5 space-y-3">
            @for (product of products(); track product.id) {
              <article class="card p-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="font-bold text-ink-900">{{ product.title }}</h3>
                      <span class="rounded-full px-2.5 py-1 text-xs font-semibold"
                        [class.bg-emerald-50]="product.status === 'PUBLISHED'"
                        [class.text-emerald-800]="product.status === 'PUBLISHED'"
                        [class.bg-amber-50]="product.status === 'DRAFT'"
                        [class.text-amber-800]="product.status === 'DRAFT'"
                        [class.bg-slate-100]="product.status === 'ARCHIVED'"
                        [class.text-slate-700]="product.status === 'ARCHIVED'">{{ product.status }}</span>
                    </div>
                    <p class="mt-1 text-xs text-ink-500">{{ product.categoryName }} · {{ product.slug }}</p>
                    <p class="mt-2 text-sm text-ink-600">{{ product.summary }}</p>
                    <p class="mt-2 text-xs text-ink-500">
                      {{ product.pricePaise === null ? 'Price not set' : ('₹' + (product.pricePaise / 100).toFixed(2)) }}
                      · {{ product.format }} · {{ product.versionCount }} file version(s)
                      @if (product.forecastStartDate || product.forecastEndDate) { · {{ product.forecastStartDate || '—' }} to {{ product.forecastEndDate || '—' }} }
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button type="button" class="btn-outline" (click)="editProduct(product)">Edit</button>
                    <button type="button" class="btn-outline" (click)="showVersions(product)">Versions</button>
                    @if (product.status === 'PUBLISHED') {
                      <button type="button" class="btn-outline" (click)="changeStatus(product, 'unpublish')">Unpublish</button>
                    } @else if (product.status !== 'ARCHIVED') {
                      <button type="button" class="btn-primary" [disabled]="product.versionCount === 0 || !product.pricePaise" (click)="changeStatus(product, 'publish')">Publish</button>
                    }
                    @if (product.status !== 'ARCHIVED') {
                      <button type="button" class="btn-outline" (click)="changeStatus(product, 'archive')">Archive</button>
                    }
                  </div>
                </div>
                @if (versionProductId() === product.id) {
                  <div class="mt-4 border-t border-slate-100 pt-4">
                    <h4 class="font-semibold text-ink-900">Report versions</h4>
                    @for (version of versions(); track version.versionNumber) {
                      <p class="mt-2 text-sm text-ink-600">v{{ version.versionNumber }} · {{ version.originalFilename }} · {{ version.format }} · {{ version.createdAt | date:'medium' }} @if (version.changeSummary) { · {{ version.changeSummary }} }</p>
                    } @empty { <p class="mt-2 text-sm text-ink-500">No uploaded versions yet.</p> }
                  </div>
                }
                <div class="mt-4 border-t border-slate-100 pt-4">
                  <label class="block text-sm font-semibold text-ink-800">{{ product.versionCount === 0 ? 'Upload report file' : 'Upload correction / new version' }}</label>
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <input #reportFile type="file" accept=".pdf,.ppt,.pptx,application/pdf" class="block max-w-full text-sm" />
                    <input #changeNote class="input-field min-w-48 flex-1" placeholder="Version note (optional)">
                    <button type="button" class="btn-outline" (click)="uploadVersion(product, reportFile, changeNote)">Upload file</button>
                  </div>
                  <p class="mt-1 text-xs text-ink-500">PDF, PPT or PPTX · maximum 50 MB · files are stored privately.</p>
                </div>
              </article>
            } @empty {
              <div class="card p-8 text-center text-sm text-ink-500">No products found. Create your first report using the form.</div>
            }
          </div>
        </section>

        <aside class="space-y-6">
          <section class="card p-6">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-lg font-bold text-ink-900">{{ editingId() ? 'Edit product' : 'Create product' }}</h2>
              @if (editingId()) { <button type="button" class="text-sm font-semibold text-brand-700" (click)="resetProductForm()">Cancel edit</button> }
            </div>
            <p class="mt-1 text-sm text-ink-500">Each forecast period is a separate product. A correction is a new version of the same product.</p>
            <form class="mt-5 space-y-3" (ngSubmit)="saveProduct()">
              <label class="block text-sm font-medium">Product title
                <input class="input-field mt-1 w-full" name="title" required maxlength="240" [(ngModel)]="form.title">
              </label>
              <label class="block text-sm font-medium">URL slug
                <input class="input-field mt-1 w-full" name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" [(ngModel)]="form.slug">
              </label>
              <label class="block text-sm font-medium">Category
                <select class="input-field mt-1 w-full" name="categorySlug" required [(ngModel)]="form.categorySlug">
                  <option value="">Select category</option>
                  @for (category of categories(); track category.id) { @if (category.active) { <option [value]="category.slug">{{ category.name }}</option> } }
                </select>
              </label>
              <label class="block text-sm font-medium">Short description
                <textarea class="input-field mt-1 w-full" rows="3" name="summary" required [(ngModel)]="form.summary"></textarea>
              </label>
              <label class="block text-sm font-medium">Market / region
                <input class="input-field mt-1 w-full" name="market" [(ngModel)]="form.market">
              </label>
              <div class="grid grid-cols-2 gap-3">
                <label class="block text-sm font-medium">Forecast start
                  <input class="input-field mt-1 w-full" type="date" name="forecastStartDate" [(ngModel)]="form.forecastStartDate">
                </label>
                <label class="block text-sm font-medium">Forecast end
                  <input class="input-field mt-1 w-full" type="date" name="forecastEndDate" [(ngModel)]="form.forecastEndDate">
                </label>
              </div>
              <label class="block text-sm font-medium">Forecast frequency
                <input class="input-field mt-1 w-full" name="frequency" placeholder="e.g. Daily estimates" [(ngModel)]="form.frequency">
              </label>
              <div class="grid grid-cols-2 gap-3">
                <label class="block text-sm font-medium">Price (INR)
                  <input class="input-field mt-1 w-full" type="number" min="0" step="0.01" name="priceRupees" [(ngModel)]="form.priceRupees">
                </label>
                <label class="block text-sm font-medium">Report format
                  <select class="input-field mt-1 w-full" name="format" [(ngModel)]="form.format"><option value="PDF">PDF</option><option value="PPT">PPT / PPTX</option></select>
                </label>
              </div>
              <button class="btn-primary w-full" type="submit" [disabled]="saving()">{{ saving() ? 'Saving…' : (editingId() ? 'Save changes' : 'Create draft product') }}</button>
            </form>
          </section>

          <section class="card p-6">
            <h2 class="text-lg font-bold text-ink-900">Categories</h2>
            <p class="mt-1 text-sm text-ink-500">Manage the groups used in the public catalogue.</p>
            <form class="mt-4 space-y-3" (ngSubmit)="createCategory()">
              <input class="input-field w-full" name="categoryName" placeholder="Category name" required [(ngModel)]="newCategoryName">
              <input class="input-field w-full" name="categorySlug" placeholder="category-slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" [(ngModel)]="newCategorySlug">
              <input class="input-field w-full" name="categoryDescription" placeholder="Description (optional)" [(ngModel)]="newCategoryDescription">
              <button type="submit" class="btn-outline w-full" [disabled]="savingCategory()">Add category</button>
            </form>
            <div class="mt-4 space-y-2">
              @for (category of categories(); track category.id) {
                <div class="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                  <div><p class="text-sm font-semibold">{{ category.name }}</p><p class="text-xs text-ink-500">{{ category.slug }}</p></div>
                  <button type="button" class="text-xs font-semibold text-brand-700" (click)="toggleCategory(category)">{{ category.active ? 'Deactivate' : 'Activate' }}</button>
                </div>
              }
            </div>
          </section>
        </aside>
      </div>
    </section>
  `,
})
export class Admin {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = API_CONFIG.baseUrl;

  protected readonly summary = signal<AdminSummary | null>(null);
  protected readonly products = signal<AdminProduct[]>([]);
  protected readonly categories = signal<AdminCategory[]>([]);
  protected readonly versions = signal<AdminVersion[]>([]);
  protected readonly versionProductId = signal<string | null>(null);
  protected readonly editingId = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly savingCategory = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');

  protected form = emptyProductForm();
  protected search = '';
  protected statusFilter = '';
  protected newCategoryName = '';
  protected newCategorySlug = '';
  protected newCategoryDescription = '';

  constructor() { this.refresh(); }

  private withCsrf<T>(request: () => Observable<T>): Observable<T> {
    return this.http.get<{ token: string }>(`${this.baseUrl}/auth/csrf`, { withCredentials: true })
      .pipe(switchMap(() => request()));
  }

  protected refresh(): void {
    this.error.set('');
    this.http.get<AdminSummary>(`${this.baseUrl}/admin/dashboard`, { withCredentials: true }).subscribe({
      next: data => this.summary.set(data),
      error: error => this.showError(error, 'Could not load the admin dashboard.'),
    });
    this.loadProducts();
    this.http.get<AdminCategory[]>(`${this.baseUrl}/admin/categories`, { withCredentials: true }).subscribe({
      next: data => this.categories.set(data),
      error: error => this.showError(error, 'Could not load categories.'),
    });
  }

  protected loadProducts(): void {
    let params = new HttpParams();
    if (this.statusFilter) params = params.set('status', this.statusFilter);
    if (this.search.trim()) params = params.set('search', this.search.trim());
    this.http.get<AdminProduct[]>(`${this.baseUrl}/admin/products`, { params, withCredentials: true }).subscribe({
      next: data => this.products.set(data),
      error: error => this.showError(error, 'Could not load products.'),
    });
  }

  protected resetProductForm(): void {
    this.form = emptyProductForm();
    this.editingId.set(null);
  }

  protected editProduct(product: AdminProduct): void {
    this.editingId.set(product.id);
    this.form = {
      title: product.title, slug: product.slug, categorySlug: product.categorySlug,
      summary: product.summary, market: product.market ?? '',
      forecastStartDate: product.forecastStartDate ?? '', forecastEndDate: product.forecastEndDate ?? '',
      frequency: product.frequency ?? '', priceRupees: product.pricePaise === null ? null : product.pricePaise / 100,
      format: product.format ?? 'PDF',
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected saveProduct(): void {
    this.error.set('');
    this.notice.set('');
    if (this.form.priceRupees !== null && this.form.priceRupees < 0) {
      this.error.set('Price cannot be negative. A zero-priced draft can be saved, but it cannot be published.');
      return;
    }
    const body = {
      title: this.form.title.trim(), slug: this.form.slug.trim().toLowerCase(),
      categorySlug: this.form.categorySlug, summary: this.form.summary.trim(),
      market: this.form.market.trim() || null,
      forecastStartDate: this.form.forecastStartDate || null,
      forecastEndDate: this.form.forecastEndDate || null,
      frequency: this.form.frequency.trim() || null,
      pricePaise: this.form.priceRupees === null ? null : Math.round(this.form.priceRupees * 100),
      format: this.form.format,
    };
    const id = this.editingId();
    this.saving.set(true);
    this.withCsrf(() => id
      ? this.http.patch(`${this.baseUrl}/admin/products/${id}`, body, { withCredentials: true })
      : this.http.post(`${this.baseUrl}/admin/products`, body, { withCredentials: true }))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.notice.set(id ? 'Product details updated.' : 'Draft product created. Upload its report file before publishing.');
          this.resetProductForm();
          this.refresh();
        },
        error: error => { this.saving.set(false); this.showError(error, 'Could not save the product.'); },
      });
  }

  protected uploadVersion(product: AdminProduct, input: HTMLInputElement, note: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) { this.error.set('Choose a PDF, PPT or PPTX file first.'); return; }
    if (file.size > 50 * 1024 * 1024) { this.error.set('The maximum report size is 50 MB.'); return; }
    const body = new FormData();
    body.append('file', file);
    if (note.value.trim()) body.append('changeSummary', note.value.trim());
    this.withCsrf(() => this.http.post(
      `${this.baseUrl}/admin/products/${product.id}/${product.versionCount === 0 ? 'files' : 'versions'}`,
      body, { withCredentials: true }))
      .subscribe({
        next: () => {
          this.notice.set(product.versionCount === 0 ? 'Report file uploaded successfully.' : 'New report version uploaded.');
          this.error.set('');
          input.value = '';
          note.value = '';
          this.refresh();
        },
        error: error => this.showError(error, 'Report upload failed.'),
      });
  }

  protected changeStatus(product: AdminProduct, action: 'publish' | 'unpublish' | 'archive'): void {
    const labels = { publish: 'publish', unpublish: 'move back to draft', archive: 'archive' };
    if (!window.confirm(`Are you sure you want to ${labels[action]} “${product.title}”?`)) return;
    this.withCsrf(() => this.http.post(
      `${this.baseUrl}/admin/products/${product.id}/${action}`, {}, { withCredentials: true }))
      .subscribe({
        next: () => { this.notice.set(`Product ${action} action completed.`); this.refresh(); },
        error: error => this.showError(error, `Could not ${action} the product.`),
      });
  }

  protected showVersions(product: AdminProduct): void {
    if (this.versionProductId() === product.id) { this.versionProductId.set(null); return; }
    this.versionProductId.set(product.id);
    this.http.get<AdminVersion[]>(`${this.baseUrl}/admin/products/${product.id}/versions`, { withCredentials: true })
      .subscribe({
        next: data => this.versions.set(data),
        error: error => this.showError(error, 'Could not load report versions.'),
      });
  }

  protected createCategory(): void {
    this.savingCategory.set(true);
    this.withCsrf(() => this.http.post(`${this.baseUrl}/admin/categories`, {
      name: this.newCategoryName.trim(), slug: this.newCategorySlug.trim().toLowerCase(),
      description: this.newCategoryDescription.trim(), displayOrder: this.categories().length + 1,
    }, { withCredentials: true })).subscribe({
      next: () => {
        this.savingCategory.set(false);
        this.newCategoryName = ''; this.newCategorySlug = ''; this.newCategoryDescription = '';
        this.notice.set('Category created.');
        this.refresh();
      },
      error: error => { this.savingCategory.set(false); this.showError(error, 'Could not create category.'); },
    });
  }

  protected toggleCategory(category: AdminCategory): void {
    const active = !category.active;
    this.withCsrf(() => this.http.patch(
      `${this.baseUrl}/admin/categories/${category.id}`, { active }, { withCredentials: true }))
      .subscribe({
        next: () => { this.notice.set(`Category ${active ? 'activated' : 'deactivated'}.`); this.refresh(); },
        error: error => this.showError(error, 'Could not update category.'),
      });
  }

  protected signOut(): void {
    this.auth.logout().subscribe({
      next: () => { window.location.href = '/login'; },
      error: error => this.showError(error, 'Could not sign out.'),
    });
  }

  private showError(error: { error?: { message?: string }; status?: number }, fallback: string): void {
    this.error.set(error?.error?.message || (error?.status === 403
      ? 'Your account does not have administrator permissions. Sign out and sign in again after the admin role is assigned.'
      : fallback));
    this.notice.set('');
  }
}
