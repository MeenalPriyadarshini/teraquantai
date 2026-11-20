import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE } from '../config/site.config';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleSvc = inject(Title);
  private readonly meta = inject(Meta);

  /** Pass title=null for the home page (brand-first title). */
  set(title: string | null, description: string = SITE.description): void {
    const full = title ? `${title} | ${SITE.name}` : `${SITE.name} | AI-Powered Market Intelligence`;
    this.titleSvc.setTitle(full);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: full });
    this.meta.updateTag({ property: 'og:description', content: description });
  }
}
