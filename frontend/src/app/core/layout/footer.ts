import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/ui/icon';
import { Logo } from '../../shared/ui/logo';
import { FOOTER_LINKS, SITE, SOCIALS } from '../config/site.config';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon, Logo],
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly links = FOOTER_LINKS;
  protected readonly site = SITE;
  protected readonly socials = SOCIALS.filter((s) => !!s.url);
  protected readonly year = new Date().getFullYear();
}
