import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';
import { LayoutComponent } from './components/layout/layout.component';

import { BreadcrumbComponent } from './components/layout/breadcrumb/breadcrumb.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [LayoutComponent, BreadcrumbComponent],
  imports: [
    CommonModule,
    CoreRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    // BreadcrumbModule
  ],
  exports: [LayoutComponent, BreadcrumbComponent],
})
export class CoreModule {}
