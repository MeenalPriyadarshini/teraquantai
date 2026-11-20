import { Component, input } from '@angular/core';

/** Title banner reused at the top of inner pages. */
@Component({
  selector: 'app-page-header',
  template: `
    <section class="container-page pb-6 pt-8 sm:pt-10">
      <div class="rounded-3xl bg-linear-to-br from-brand-50 via-white to-sky-50 px-6 py-9 ring-1 ring-brand-100 sm:px-10">
        @if (eyebrow()) { <span class="badge">{{ eyebrow() }}</span> }
        <h1 class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{{ title() }}</h1>
        @if (subtitle()) { <p class="mt-2 max-w-2xl text-ink-700">{{ subtitle() }}</p> }
      </div>
    </section>`,
})
export class PageHeader {
  eyebrow = input<string>();
  title = input.required<string>();
  subtitle = input<string>();
}
