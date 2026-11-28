import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/ui/icon';
import { Logo } from '../../shared/ui/logo';
import { NAV } from '../config/site.config';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon, Logo],
  templateUrl: './header.html',
})
export class Header {
  protected readonly nav = NAV;
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);
  protected readonly menuOpen = signal(false);

  protected toggle(): void { this.menuOpen.update((v) => !v); }
  protected close(): void { this.menuOpen.set(false); }
}
