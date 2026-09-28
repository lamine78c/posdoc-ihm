import { Component, OnInit, Input } from '@angular/core';
import { MenuLink } from '../menu-link';

@Component({
  selector: 'app-nav-item',
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss'],
  standalone: false,
})
export class NavItemComponent implements OnInit {
  @Input()
  menuLink: MenuLink;

  @Input()
  disabled = false;

  constructor() {
    // do nothing
  }

  ngOnInit() {
    // do nothing
  }
}
