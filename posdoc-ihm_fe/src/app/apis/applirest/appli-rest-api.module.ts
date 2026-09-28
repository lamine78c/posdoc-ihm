/* eslint-disable */
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppliRestApiConfiguration, AppliRestApiConfigurationInterface } from './appli-rest-api-configuration';

import { EntrepriseService } from './services/entreprise.service';
import { CommuneService } from './services/commune.service';
import { ErreursService } from './services/erreurs.service';

/**
 * Provider for all AppliRestApi services, plus AppliRestApiConfiguration
 */
@NgModule({
  imports: [HttpClientModule],
  exports: [HttpClientModule],
  declarations: [],
  providers: [AppliRestApiConfiguration, EntrepriseService, CommuneService, ErreursService],
})
export class AppliRestApiModule {
  static forRoot(customParams: AppliRestApiConfigurationInterface): ModuleWithProviders<AppliRestApiModule> {
    return {
      ngModule: AppliRestApiModule,
      providers: [
        {
          provide: AppliRestApiConfiguration,
          useValue: { rootUrl: customParams.rootUrl },
        },
      ],
    };
  }
}
