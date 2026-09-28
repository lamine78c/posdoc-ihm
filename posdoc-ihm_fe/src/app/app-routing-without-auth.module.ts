import { CallbackComponent } from '@acoss/prisme-angular-intranet';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PermissionGuard } from './shared/guards/permission.guard';
import { AUTH } from './services/permission/PermissionsFile';
import { ContainerComponent } from './layout/container/container.component';
import { InitResolver } from './services/resolvers/InitResolver';
import { RedirectHomeGuard } from './shared/guards/redirect-home.guard';

const routes: Routes = [
  {
    path: 'retour_pss',
    component: CallbackComponent,
    canActivate: [],
  },
  { path: '', canActivate: [RedirectHomeGuard], component: HomeComponent },
  { path: 'accueil', component: HomeComponent },
  {
    path: 'home',
    component: ContainerComponent,
    canActivate: [],
    resolve: {
      perms: InitResolver,
    },
  },
  {
    path: 'admin',
    data: { breadcrumb: 'administration', perm: AUTH.ADMINISTRATION.ID },
    component: ContainerComponent,
    canLoad: [PermissionGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
  },
  {
    path: 'produit',
    data: { breadcrumb: 'produit', perm: AUTH.FICHIER_EDITION.ID },
    component: ContainerComponent,
    canLoad: [PermissionGuard],
    loadChildren: () => import('./produit/produit.module').then(m => m.ProduitModule),
  },
  {
    path: 'exploitation-editique',
    data: { breadcrumb: 'exploitation-editique', perm: AUTH.EXPLOITATION_EDITIQUE.ID },
    component: ContainerComponent,
    canLoad: [PermissionGuard],
    loadChildren: () => import('./exploitation-editique/exploitation-editique.module').then(m => m.ExploitationEditiqueModule),
  },
  {
    path: 'suivi',
    data: { breadcrumb: 'suivi', perm: AUTH.SUIVI.ID },
    component: ContainerComponent,
    canLoad: [PermissionGuard],
    loadChildren: () => import('./suivi/suivi.module').then(m => m.SuiviModule),
  },
  {
    path: 'supervision',
    data: { breadcrumb: 'supervision', perm: AUTH.SUPERVISION.ID },
    component: ContainerComponent,
    canLoad: [PermissionGuard],
    loadChildren: () => import('./supervision/supervision.module').then(m => m.SupervisionModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
