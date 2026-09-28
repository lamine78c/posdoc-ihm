import { Component, ContentChildren, QueryList, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavDropdownComponent } from '../nav-dropdown/nav-dropdown.component';
import { NavItemComponent } from '../nav-item/nav-item.component';
import { MenuLink } from '../menu-link';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  standalone: false,
})
export class SideNavComponent {
  @Input()
  column = false;
  subscriptions: Subscription[] = [];

  @ContentChildren(NavItemComponent, { descendants: true }) navItems: QueryList<NavItemComponent>;

  @ContentChildren(NavDropdownComponent) navDropdown: QueryList<NavDropdownComponent>;

  constructor(private router: Router) {
    this.subscriptions.push(this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd && this.navItems) {
        this.navItems.forEach(item => {
          const menuLink: MenuLink = item.menuLink;
          menuLink.activated = this.isActiveRoute(e.urlAfterRedirects, this.extractMenuRoute(menuLink.route));
        });

        if (this.navDropdown) {
          this.navDropdown.forEach(dropDown => {
            dropDown.updateDropdown();
          });
        }
      }
    }));
  }

  private extractMenuRoute(url: string): string {
    const split = url.split('/');
    if (split.length > 1) {
      return split[1];
    }
    return '';
  }
  private isActiveRoute(url: string, route: string): boolean {
    const split = url.split('/');
    for (let index = 0; index < split.length; index++) {
      const element = split[index];
      if (route === element) {
        return true;
      }
    }
    return false;
  }
}
