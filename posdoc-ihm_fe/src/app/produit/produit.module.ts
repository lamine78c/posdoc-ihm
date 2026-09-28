import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AdminModule } from '@app/admin/admin.module';
import { FullstackComponentsModule } from '@app/fullstack-components/fullstack-components.module';
import { DetailAdresseRetourComponent } from '@app/produit/adresse-retour/detail-adresse-retour/detail-adresse-retour.component';
import { DistributionReferenceComponent } from '@app/produit/fond-page/reference/distribution-reference/distribution-reference.component';
import { ModalImprimeComponent } from '@app/produit/fond-page/reference/popup/modal-component/modal-imprime.component';
import { ImprimeSearchComponent } from '@app/produit/fond-page/reference/search/imprime-search-component';
import { SharedModule } from '@app/shared/shared.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AngularDraggableModule } from 'angular2-draggable';
import { AdresseRetourComponent } from './adresse-retour/adresse-retour.component';
import { ModalAddAdressComponent } from './adresse-retour/modal/modal-add-adress/modal-add-adress.component';
import { ModalAddAdresseFichierComponent } from './adresse-retour/modal/modal-add-adresse-fichier/modal-add-adresse-fichier.component';
import { DestinataireComponent } from './destinataire/destinataire.component';
import { PopupFormulaireCreationComponent } from './destinataire/popup/popup-formulaire-creation/popup-formulaire-creation.component';
import { DistributionComponent } from './distribution/distribution.component';
import { DistributionExemplairesComponent } from './distribution/exemplaires/distribution-exemplaires/distribution-exemplaires.component';
import { DistributionParametreEditionComponent } from './distribution/parametre-edition/distribution-parametre-edition/distribution-parametre-edition.component';
import { ParametreEditionColonneComponent } from './distribution/parametre-edition/parametre-edition-colonne/parametre-edition-colonne/parametre-edition-colonne.component';
import { SearchParametreEditionColonneComponent } from './distribution/parametre-edition/parametre-edition-colonne/search/search-parametre-edition-colonne/search-parametre-edition-colonne.component';
import { ModalAjoutCompletComponent } from './distribution/parametre-edition/popup/modal-ajout-complet/modal-ajout-complet.component';
import { ModalComponentComponent } from './distribution/parametre-edition/popup/modal-component/modal-component.component';
import { ModalUpdateComponent } from './distribution/parametre-edition/popup/modal-update/modal-update.component';
import { DetailsComponent } from './fichier/details/details.component';
import { FichiersComponent } from './fichier/fichiers.component';
import { AddModalComponent } from './fichier/modal/add-modal/add-modal.component';
import { StepDefinitionComponent } from './fichier/modal/step-definition/step-definition.component';
import { StepExemplaireComponent } from './fichier/modal/step-exemplaire/step-exemplaire.component';
import { StepGeneraliteComponent } from './fichier/modal/step-generalite/step-generalite.component';
import { FondPageComponent } from './fond-page/fond-page.component';
import { DistributionImprimeComponent } from './fond-page/imprime/distribution-imprime/distribution-imprime.component';
import { AffectationNoticeComponent } from './notice/affectation-notice/affectation-notice.component';
import { ModalAjoutComponent } from './notice/affectation-notice/modal/modal-ajout/modal-ajout.component';
import { SearchComponent } from './notice/affectation-notice/search/search.component';
import { NoticeComponent } from './notice/notice.component';
import { NoticesFichiersComponent } from './notice/notices-fichiers/notices-fichiers.component';
import { NoticeDetailsModalComponent } from './notice/notices-fichiers/notice-details-modal/notice-details-modal.component';
import { TableauNoticeComponent } from './notice/tableau-notice/tableau-notice.component';
import { PapaadComponent } from './papaad/papaad.component';
import { ProduitRoutingModule } from './produit-routing.module';
import { SearchCommandeCompareModalComponent } from './commande/search/search-commande-compare-modal/search-commande-compare-modal.component';
import { CommandeComponent } from './commande/commande.component';
import { AddCommandeModalComponent } from './commande/modal/add-modal/add-commande-modal/add-commande-modal.component';
import { CompareModalComponent } from './commande/modal/compare-modal/compare-modal/compare-modal.component';
import { SearchDistributionImprimeComponent } from './fond-page/imprime/distribution-imprime/search/search-distribution-imprime/search-distribution-imprime.component';
import { EditModalComponent } from './fichier/modal/edit-modal/edit-modal/edit-modal.component';
import { OrganismeClientModalComponent } from './fichier/modal/organisme-client-modal/organisme-client-modal.component';

@NgModule({
  declarations: [
    DestinataireComponent,
    FondPageComponent,
    AdresseRetourComponent,
    DetailAdresseRetourComponent,
    NoticeComponent,
    DistributionComponent,
    DistributionExemplairesComponent,
    DistributionParametreEditionComponent,
    FichiersComponent,
    PapaadComponent,
    ModalComponentComponent,
    PopupFormulaireCreationComponent,
    ModalAddAdressComponent,
    DistributionImprimeComponent,
    DistributionReferenceComponent,
    ModalImprimeComponent,
    ImprimeSearchComponent,
    ModalAddAdresseFichierComponent,
    DetailsComponent,
    AddModalComponent,
    StepDefinitionComponent,
    StepExemplaireComponent,
    StepGeneraliteComponent,
    TableauNoticeComponent,
    ModalAjoutCompletComponent,
    AffectationNoticeComponent,
    SearchComponent,
    ModalAjoutComponent,
    NoticesFichiersComponent,
    NoticeDetailsModalComponent,
    ModalUpdateComponent,
    ParametreEditionColonneComponent,
    SearchParametreEditionColonneComponent,
    SearchCommandeCompareModalComponent,
    CommandeComponent,
    AddCommandeModalComponent,
    CompareModalComponent,
    SearchDistributionImprimeComponent,
    EditModalComponent,
    OrganismeClientModalComponent,
  ],
  imports: [CommonModule, ProduitRoutingModule, SharedModule, FullstackComponentsModule, AngularDraggableModule, AngularSvgIconModule, AdminModule],
  providers: [],
})
export class ProduitModule {}
