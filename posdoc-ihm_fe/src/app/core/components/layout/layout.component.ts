import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: false,
})
export class LayoutComponent implements OnInit {
  sideNavOpened = true;
  sideNavMode: 'side' | 'over' = 'side';

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    // do nothing
  }
}
