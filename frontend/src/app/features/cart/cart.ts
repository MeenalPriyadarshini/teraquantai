import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, Icon, InrPipe, PageHeader],
  templateUrl: './cart.html',
})
export class Cart {
  protected readonly cart = inject(CartService);
  constructor() { inject(SeoService).set('Your Cart', 'Review the solutions in your cart.'); }
}
