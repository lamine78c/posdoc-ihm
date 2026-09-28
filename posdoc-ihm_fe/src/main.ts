import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import '../node_modules/jquery/dist/jquery.slim.min.js';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';

import { AllEnterpriseModule, LicenseManager, ModuleRegistry } from 'ag-grid-enterprise';

import { AgChartsCommunityModule } from 'ag-charts-community';
ModuleRegistry.registerModules([AllEnterpriseModule.with(AgChartsCommunityModule)]);

// Licence pour Ag-Grid
// eslint-disable-next-line max-len
LicenseManager.setLicenseKey('Using_this_{AG_Grid}_Enterprise_key_{AG-067801}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{AGENCE_CENTRALE_DES_ORGANISMES_DE_SECURITE_SOCIALE}_is_granted_a_{Multiple_Applications}_Developer_License_for_{70}_Front-End_JavaScript_developers___All_Front-End_JavaScript_developers_need_to_be_licensed_in_addition_to_the_ones_working_with_{AG_Grid}_Enterprise___This_key_has_not_been_granted_a_Deployment_License_Add-on___This_key_works_with_{AG_Grid}_Enterprise_versions_released_before_{28_October_2027}____[v3]_[01]_MTgyNDY3ODAwMDAwMA==eec08941722a6c06f9a2dc4b0b56875f');

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
