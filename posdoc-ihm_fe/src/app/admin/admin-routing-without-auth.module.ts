import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { canDesactivateGuard } from '@app/can-desactivate.guard';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { PermissionGuard } from '@app/shared/guards/permission.guard';
import { ApplicationComponent } from './application/application.component';
import { ClientComponent } from './client/client.component';
import { ContenuComponent } from './contenu/contenu.component';
import { EnvironnementComponent } from './environnement/environnement.component';
import { FabricationComponent } from './fabrication/fabrication.component';
import { HabilitationsComponent } from './habilitations/habilitations.component';
import { HabilitationResolver } from './habilitations/resolver/HabilitationsResolver';
import { MoteurAdelaideComponent } from './moteur-adelaide/moteur-adelaide.component';
import { OrganismeComponent } from './organisme/organisme.component';
import { SpecificationFichierComponent } from './specification-fichier/specification-fichier.component';
import { TarifComponent } from './tarif/tarif.component';
import { ServiceComponent } from './service/service.component';

const routes: Routes = [
  {
    path: 'habilitation',
    canActivate: [PermissionGuard],
    canDeactivate: [canDesactivateGuard],
    data: { breadcrumb: 'habilitation', perm: AUTH.ADMINISTRATION.HABILITATION.ID },
    component: HabilitationsComponent,
    resolve: {
      habilitations: HabilitationResolver,
    },
  },
  {
    path: 'moteur-adelaide',
    canActivate: [PermissionGuard],
    data: { breadcrumb: 'moteur adelaide', perm: AUTH.ADMINISTRATION.MOTEUR_ADELAIDE.ID },
    component: MoteurAdelaideComponent,
  },
  {
    path: 'environnement',
    canActivate: [PermissionGuard],
    data: { breadcrumb: 'environnement', perm: AUTH.ADMINISTRATION.ENVIRONNEMENTS.ID },
    component: EnvironnementComponent,
  },
  {
    path: 'application',
    canActivate: [PermissionGuard],
    data: { breadcrumb: 'application', perm: AUTH.ADMINISTRATION.APPLICATIONS.ID },
    component: ApplicationComponent,
  },
  {
    path: 'organisme',
    canActivate: [PermissionGuard],
    data: { breadcrumb: 'organisme', perm: AUTH.ADMINISTRATION.ORGANISMES.ID },
    component: OrganismeComponent,
  },
  {
    path: 'fabrication',
    canActivate: [PermissionGuard],
    data: { breadcrumb: 'fabrication', perm: AUTH.ADMINISTRATION.FABRICATION.ID },
    component: FabricationComponent,
  },
  {
    path: 'specification-fichier',
    canActivate: [PermissionGuard],
    data: { breadcrumb: 'specification de fichier', perm: AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ID },
    component: SpecificationFichierComponent,
  },
  {
    path: 'contenu',
    canActivate: [PermissionGuard],
    data: { breadcrumb: 'contenu', perm: AUTH.ADMINISTRATION.CONTENU.ID },
    component: ContenuComponent,
  },
  {
    path: 'client',
    canActivate: [PermissionGuard],
    data: { breadcrumb: 'client', perm: AUTH.ADMINISTRATION.CLIENTS.ID },
    component: ClientComponent,
  },
  {
    path: 'tarif',
    canActivate: [PermissionGuard],
    data: { breadcrumb: 'tarif', perm: AUTH.ADMINISTRATION.TARPOS.ID },
    component: TarifComponent,
  },
  {
    path: 'service',
    canActivate: [PermissionGuard],
    data: { breadcrumb: 'Service', perm: AUTH.ADMINISTRATION.SERVICE.ID },
    component: ServiceComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
