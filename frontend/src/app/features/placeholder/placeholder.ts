import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Temporary page for routes built in later phases. Remove each route from here as it gets a real page. */
@Component({
  selector: 'app-placeholder',
  imports: [RouterLink],
  template: `
    <section class="container-page py-24 text-center">
      <h1 class="text-3xl font-bold sm:text-4xl">{{ title }}</h1>
      <p class="mx-auto mt-4 max-w-md text-ink-500">This page is being built and will be available soon.</p>
      <a routerLink="/" class="btn-primary mt-8">Back to home</a>
    </section>`,
})
export class Placeholder {
  protected readonly title: string = inject(ActivatedRoute).snapshot.data['title'] ?? 'Coming soon';
}
