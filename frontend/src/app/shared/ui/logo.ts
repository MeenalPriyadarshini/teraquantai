import { Location } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

/**
 * Brand logo.
 *  - mode "auto" (default): full logo on the Home page, TQ emblem on every other page
 *  - mode "full" / "emblem": force one of them
 * Files live in /public/brand (logo-full.png, logo-emblem.png).
 */
@Component({
  selector: 'app-logo',
  host: { class: 'inline-flex items-center' },
  template: `
    @if (isFull()) {
      <img src="brand/logo-full.png" width="1100" height="198"
           alt="TerraQuantAI — Data, Markets, Intelligence"
           class="h-7 w-auto sm:h-10 lg:h-11" />
    } @else {
      <img src="brand/logo-emblem.png" width="420" height="232"
           alt="TerraQuantAI" class="h-9 w-auto sm:h-10" />
    }`,
})
export class Logo {
  mode = input<'auto' | 'full' | 'emblem'>('auto');

  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: inject(Location).path() || '/' },
  );

  protected readonly isFull = computed(() => {
    const m = this.mode();
    if (m !== 'auto') return m === 'full';
    const path = this.url().split(/[?#]/)[0];
    return path === '/' || path === '';
  });
}
