import { Component } from '@angular/core';

/** Decorative placeholder illustration. Replace with final brand imagery later. */
@Component({
  selector: 'app-hero-visual',
  template: `
    <svg viewBox="0 0 520 420" class="h-auto w-full" role="img"
         aria-label="Illustration of a globe and a rising market chart">
      <defs>
        <linearGradient id="hv-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#14a89c" stop-opacity=".45" /><stop offset="1" stop-color="#14a89c" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="hv-line" x1="0" x2="1">
          <stop offset="0" stop-color="#14a89c" /><stop offset="1" stop-color="#1d7fd8" />
        </linearGradient>
        <linearGradient id="hv-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2fc2b5" /><stop offset="1" stop-color="#0c5753" />
        </linearGradient>
        <radialGradient id="hv-globe" cx=".35" cy=".3" r=".9">
          <stop offset="0" stop-color="#7ee8dc" /><stop offset=".55" stop-color="#1aa6a0" /><stop offset="1" stop-color="#0b4f6c" />
        </radialGradient>
      </defs>
      <rect x="20" y="30" width="360" height="260" rx="22" fill="#fff" fill-opacity=".6" stroke="#fff" stroke-width="2" />
      <g stroke="#0f6e69" stroke-opacity=".12"><path d="M40 90h320M40 140h320M40 190h320M40 240h320" /></g>
      <path d="M40 260L110 220 170 235 240 170 300 150 360 85V270H40z" fill="url(#hv-area)" />
      <path d="M40 260L110 220 170 235 240 170 300 150 360 85" fill="none" stroke="url(#hv-line)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M338 82h24v24" fill="none" stroke="#1d7fd8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
      <g fill="url(#hv-bar)">
        <rect x="50" y="320" width="26" height="50" rx="6" /><rect x="86" y="300" width="26" height="70" rx="6" />
        <rect x="122" y="310" width="26" height="60" rx="6" /><rect x="158" y="280" width="26" height="90" rx="6" />
      </g>
      <g transform="translate(375 255)">
        <circle r="108" fill="url(#hv-globe)" />
        <g fill="none" stroke="#fff" stroke-opacity=".35">
          <ellipse rx="108" ry="38" /><ellipse rx="46" ry="108" /><ellipse rx="86" ry="108" /><path d="M-108 0h216" />
        </g>
      </g>
      <g fill="#2fc2b5"><circle cx="470" cy="70" r="5" /><circle cx="495" cy="120" r="3" /><circle cx="440" cy="40" r="3" /></g>
    </svg>`,
})
export class HeroVisual {}
