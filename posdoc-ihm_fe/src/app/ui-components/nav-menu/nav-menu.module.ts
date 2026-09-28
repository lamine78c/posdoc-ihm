import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavDropdownComponent } from './nav-dropdown/nav-dropdown.component';
import { NavItemComponent } from './nav-item/nav-item.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [NavDropdownComponent, NavItemComponent, SideNavComponent],
  exports: [NavDropdownComponent, NavItemComponent, SideNavComponent],
})
export class NavMenuModule {}
