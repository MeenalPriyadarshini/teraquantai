import { Component, computed, input } from '@angular/core';

const PATHS: Record<string, string> = {
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  search: 'M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z',
  play: 'M8 5v14l11-7z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6L6 18',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  target: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zM12 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
  gauge: 'M4 18a9 9 0 1 1 16 0M12 14l4-5',
  leaf: 'M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l8-8',
  droplet: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  chart: 'M3 20h18M6 20v-6M11 20V8M16 20v-9M21 20V4',
  factory: 'M3 21V10l6 4v-4l6 4V5h4v16z',
  sparkle: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
  check: 'M5 13l4 4L19 7',
  user: 'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'chevron-down': 'M6 9l6 6 6-6',
  linkedin: 'M6 9v11M6 5v.01M11 20v-7a3 3 0 0 1 6 0v7M11 9v11',
  youtube: 'M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM10 9l5 3-5 3z',
  x: 'M4 4l16 16M20 4L4 20',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  pin: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  clock: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 7v5l3 2',
  cart: 'M3 4h2l2.4 11h10.2L20 7H6M9 20.5a.5.5 0 1 0 0-.01M17 20.5a.5.5 0 1 0 0-.01',
  'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
  info: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 11v5M12 8v.01',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
};

/** Usage: <app-icon name="bolt" class="size-5" />  (size & colour come from the class) */
@Component({
  selector: 'app-icon',
  host: { class: 'inline-flex shrink-0' },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="h-full w-full">
      <path [attr.d]="path()" />
    </svg>`,
})
export class Icon {
  name = input.required<string>();
  protected path = computed(() => PATHS[this.name()] ?? '');
}
