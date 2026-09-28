import { AuthImplicitGuard } from '@acoss/prisme-angular-intranet';
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
    canActivate: [PermissionGuard, AuthImplicitGuard],
    canDeactivate: [canDesactivateGuard],
    data: { breadcrumb: 'Habilitation', perm: AUTH.ADMINISTRATION.HABILITATION.ID },
    component: HabilitationsComponent,
    resolve: {
      habilitations: HabilitationResolver,
    },
  },
  {
    path: 'moteur-adelaide',
    canActivate: [PermissionGuard, AuthImplicitGuard],
    data: { breadcrumb: 'Moteur adelaïde', perm: AUTH.ADMINISTRATION.MOTEUR_ADELAIDE.ID },
    component: MoteurAdelaideComponent,
  },
  {
    path: 'environnement',
    canActivate: [PermissionGuard, AuthImplicitGuard],
    data: { breadcrumb: 'Environnement', perm: AUTH.ADMINISTRATION.ENVIRONNEMENTS.ID },
    component: EnvironnementComponent,
  },
  {
    path: 'application',
    canActivate: [PermissionGuard, AuthImplicitGuard],
    data: { breadcrumb: 'Application', perm: AUTH.ADMINISTRATION.APPLICATIONS.ID },
    component: ApplicationComponent,
  },
  {
    path: 'organisme',
    canActivate: [PermissionGuard, AuthImplicitGuard],
    data: { breadcrumb: 'organisme', perm: AUTH.ADMINISTRATION.ORGANISMES.ID },
    component: OrganismeComponent,
  },
  {
    path: 'fabrication',
    canActivate: [PermissionGuard, AuthImplicitGuard],
    data: { breadcrumb: 'fabrication', perm: AUTH.ADMINISTRATION.FABRICATION.ID },
    component: FabricationComponent,
  },
  {
    path: 'specification-fichier',
    canActivate: [PermissionGuard, AuthImplicitGuard],
    data: { breadcrumb: 'Spécification de fichiers', perm: AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ID },
    component: SpecificationFichierComponent,
  },
  {
    path: 'contenu',
    canActivate: [PermissionGuard, AuthImplicitGuard],
    data: { breadcrumb: 'Contenu', perm: AUTH.ADMINISTRATION.CONTENU.ID },
    component: ContenuComponent,
  },
  {
    path: 'client',
    canActivate: [PermissionGuard, AuthImplicitGuard],
    data: { breadcrumb: 'Client', perm: AUTH.ADMINISTRATION.CLIENTS.ID },
    component: ClientComponent,
  },
  {
    path: 'tarif',
    canActivate: [PermissionGuard, AuthImplicitGuard],
    data: { breadcrumb: 'Tarif', perm: AUTH.ADMINISTRATION.TARPOS.ID },
    component: TarifComponent,
  },
  {
    path: 'service',
    canActivate: [PermissionGuard, AuthImplicitGuard],
    data: { breadcrumb: 'Service', perm: AUTH.ADMINISTRATION.SERVICE.ID },
    component: ServiceComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
