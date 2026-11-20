import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './core/layout/footer';
import { Header } from './core/layout/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  template: `
    <app-header />
    <main id="main" tabindex="-1"><router-outlet /></main>
    <app-footer />`,
})
export class App {}
