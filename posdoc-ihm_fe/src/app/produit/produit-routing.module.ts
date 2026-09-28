import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DestinataireComponent } from './destinataire/destinataire.component';
import { FichiersComponent } from './fichier/fichiers.component';
import { FondPageComponent } from './fond-page/fond-page.component';
import { AdresseRetourComponent } from './adresse-retour/adresse-retour.component';
import { NoticeComponent } from './notice/notice.component';
import { DistributionComponent } from './distribution/distribution.component';
import { PapaadComponent } from './papaad/papaad.component';
import { canDesactivateGuard } from '@app/can-desactivate.guard';
import { CommandeComponent } from './commande/commande.component';

const routes: Routes = [
  { path: 'destinataire', data: { breadcrumb: 'Destinataire' }, component: DestinataireComponent },
  { path: 'commande', data: { breadcrumb: 'Commande' }, component: CommandeComponent },
  { path: 'fichier', data: { breadcrumb: 'Propriétés des fichiers' }, component: FichiersComponent },
  { path: 'papaad', data: { breadcrumb: 'Papaad' }, component: PapaadComponent },
  { path: 'fond-page', data: { breadcrumb: 'Fonds de page' }, component: FondPageComponent },
  { path: 'distribution', data: { breadcrumb: 'Distribution' }, component: DistributionComponent },
  { path: 'adresse-retour', data: { breadcrumb: 'Adresses Retour' }, component: AdresseRetourComponent },
  {
    path: 'notice',
    data: { breadcrumb: 'Notices' },
    component: NoticeComponent,
    canDeactivate: [canDesactivateGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProduitRoutingModule {}
