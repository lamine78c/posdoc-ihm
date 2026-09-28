import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { NavComponent } from './nav/nav.component';
import { AuthentificationComponent } from './authentification/authentification.component';
import { ReportBoutonComponent } from './report-bouton/report-bouton.component';
import { NavMenuModule } from '@app/ui-components/nav-menu/nav-menu.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FullstackComponentsModule } from '@app/fullstack-components/fullstack-components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CoreRoutingModule } from '@app/core/core-routing.module';
import { AngularSvgIconModule, provideAngularSvgIcon } from 'angular-svg-icon';
import { ContainerComponent } from './container/container.component';
import { CoreModule } from '@app/core/core.module';
import { SharedModule } from '@app/shared/shared.module';
import { DialogUserPermissionComponent } from '@app/layout/dialog-user-permission/dialog-user-permission.component';
import { DialogErrorServerComponent } from './dialog-error-server/dialog-error-server.component';
import { NotificationsListComponent } from './authentification/notifications-list/notifications-list.component';

@NgModule({
  declarations: [
    HeaderComponent,
    NavComponent,
    AuthentificationComponent,
    ReportBoutonComponent,
    ContainerComponent,
    DialogUserPermissionComponent,
    DialogErrorServerComponent,
    NotificationsListComponent,
  ],
  exports: [HeaderComponent, NavComponent, ReportBoutonComponent, ContainerComponent],
  imports: [
    CommonModule,
    NavMenuModule,
    NgbModule,
    FullstackComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CoreRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    AngularSvgIconModule,
    CoreModule,
    SharedModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi()), provideAngularSvgIcon()],
})
export class LayoutModule {}
