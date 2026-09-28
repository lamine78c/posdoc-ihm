import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditionComponent } from './edition/edition.component';
import { FacturationComponent } from './facturation/facturation.component';
import { VolumeTraiteComponent } from './volume-traite/volume-traite.component';
import { MassificationComponent } from './massification/massification.component';
import { BonTravailComponent } from '@app/suivi/bon-travail/bon-travail.component';
import { canDesactivateGuard } from '@app/can-desactivate.guard';
import { PermissionGuard } from '@app/shared/guards/permission.guard';
import { AuthImplicitGuard } from '@acoss/prisme-angular-intranet';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ProductionComponent } from '@app/suivi/production/production.component';

const routes: Routes = [
  { path: 'edition', data: { breadcrumb: 'Editions' }, component: EditionComponent },
  { path: 'facturation', data: { breadcrumb: 'Facturation' }, component: FacturationComponent },
  { path: 'volume-traite', data: { breadcrumb: 'Volumes traités' }, component: VolumeTraiteComponent },
  { path: 'massification', data: { breadcrumb: 'Massification' }, component: MassificationComponent },
  {
    canActivate: [PermissionGuard, AuthImplicitGuard],
    path: 'bon-travail',
    data: { breadcrumb: 'Bons de travail', perm: AUTH.SUIVI.BONS_TRAVAIL.ID },
    canDeactivate: [canDesactivateGuard],
    component: BonTravailComponent,
  },
  { path: 'production', data: { breadcrumb: 'Production' }, component: ProductionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuiviRoutingModule {}
