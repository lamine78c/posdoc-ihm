import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActionsComponent } from './actions/actions.component';
import { DocumentDematerialiseComponent } from './document-dematerialise/document-dematerialise.component';
import { ProductionComponent } from './production/production.component';
import { ServiceComponent } from './service/service.component';

const routes: Routes = [
  { path: 'production', data: { breadcrumb: 'Production' }, component: ProductionComponent },
  { path: 'document-dematerialise', data: { breadcrumb: 'Documents dématérialisés' }, component: DocumentDematerialiseComponent },
  { path: 'action', data: { breadcrumb: 'Actions' }, component: ActionsComponent },
  { path: 'service', data: { breadcrumb: 'Service' }, component: ServiceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupervisionRoutingModule {}
