import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, forwardRef, LOCALE_ID, NgModule, Provider, inject, provideAppInitializer } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './graphql.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './components/home/home.component';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import {
  PRISME_SUCCESS_LOGIN_HANDLER,
  PrismeAngularConfiguration,
  PrismeAngularInitModule,
  PrismeAngularModule,
} from '@acoss/prisme-angular-intranet';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormatDatePipe } from './pipes/format-date.pipe';
import { DatePipe, registerLocaleData } from '@angular/common';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CoreModule } from '@app/core/core.module';
import { ExploitationEditiqueModule } from '@app/exploitation-editique/exploitation-editique.module';
import { SuiviModule } from '@app/suivi/suivi.module';
import { SupervisionModule } from '@app/supervision/supervision.module';
import { MatDialogModule } from '@angular/material/dialog';
import localeFr from '@angular/common/locales/fr';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { FullstackComponentsModule } from './fullstack-components/fullstack-components.module';
import { LayoutModule as MainLayoutModule } from '@app/layout/layout.module';
import { ApiInterceptor } from './apis/interceptors/api-interceptor';
import { AppConfigService } from './app-config/app-config.service';
import { AppliRestApiConfiguration } from './apis/applirest/appli-rest-api-configuration';
import { CustomPrismeConfigurationService } from './app-config/custom-prisme-configuration.service';
import { MySuccessLoginHandlerService } from './services/postLogin/my-success-login-handler.service';
import { LoaderInterceptor } from './apis/interceptors/loader.interceptor';
import { SharedModule } from '@app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { PRISME_STORAGE_KEY } from '@app/shared/utils/Constants';

registerLocaleData(localeFr);

export const API_INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  useExisting: forwardRef(() => ApiInterceptor),
  multi: true,
};

export const LOADER_INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  useExisting: forwardRef(() => LoaderInterceptor),
  multi: true,
};

export function initRestApiConfiguration(config: AppConfigService) {
  const restConfig = new AppliRestApiConfiguration();
  restConfig.rootUrl = config.apiBaseUrl();

  return restConfig;
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FormatDatePipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GraphQLModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatGridListModule,
    MatDialogModule,
    PrismeAngularModule,
    PrismeAngularInitModule.forRoot(PRISME_STORAGE_KEY, false),
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    CoreModule,
    ExploitationEditiqueModule,
    SuiviModule,
    SupervisionModule,
    MatSlideToggleModule,
    FormsModule,
    FullstackComponentsModule,
    MainLayoutModule,
    RouterModule,
    SharedModule,
  ],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'fr' },
    {
      provide: PRISME_SUCCESS_LOGIN_HANDLER,
      useClass: MySuccessLoginHandlerService,
    },

    provideAppInitializer(() => {
      const initializerFn = (
        (config: AppConfigService) => () =>
          config.loadConfiguration()
      )(inject(AppConfigService));
      return initializerFn();
    }),
    // {
    //   // ceci charge et remplit la conf avec les données trouvées dans notre fichier JSON au démmarage de l'application
    //   provide: APP_INITIALIZER, useFactory: (config: AccueilConfigService) => () => config.loadConfiguration(),
    //   deps: [AccueilConfigService], multi: true
    // },
    { provide: PrismeAngularConfiguration, useClass: CustomPrismeConfigurationService, deps: [AppConfigService], multi: false },
    { provide: AppliRestApiConfiguration, useFactory: initRestApiConfiguration, deps: [AppConfigService], multi: false },
    ApiInterceptor,
    LoaderInterceptor,
    API_INTERCEPTOR_PROVIDER,
    LOADER_INTERCEPTOR_PROVIDER,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
