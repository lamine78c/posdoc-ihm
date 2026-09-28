import { Component, ContentChildren, Input, QueryList } from '@angular/core';
import { NavItemComponent } from '../nav-item/nav-item.component';

@Component({
  selector: 'app-nav-dropdown',
  templateUrl: './nav-dropdown.component.html',
  styleUrls: ['./nav-dropdown.component.scss'],
  standalone: false,
})
export class NavDropdownComponent {
  @Input()
  label: string;

  @ContentChildren(NavItemComponent) navItems: QueryList<NavItemComponent>;

  show = false;

  collapse() {
    this.show = !this.show;
  }

  public updateDropdown(): void {
    this.show = false;
    this.navItems.forEach(item => {
      if (item.menuLink.activated) {
        this.show = true;
      }
    });
  }
}
