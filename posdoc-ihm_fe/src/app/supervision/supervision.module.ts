import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FullstackComponentsModule } from '@app/fullstack-components/fullstack-components.module';
import { SharedModule } from '@app/shared/shared.module';
import { OccurrenceApplicationComponent } from '@app/supervision/production/occurrence-application/occurrence-application.component';
import { SearchOccurrenceApplicationComponent } from '@app/supervision/production/occurrence-application/search/search-occurrence-application.component';
import { TimelineComponent } from '@app/supervision/production/occurrence-application/timeline/timeline.component';
import { OccurrenceEtapeMenuComponent } from '@app/supervision/production/occurrence-etape/menu/occurrence-etape-menu.component';
import { OccurrenceEtapeComponent } from '@app/supervision/production/occurrence-etape/occurrence-etape.component';
import { SearchOccurrenceEtapeComponent } from '@app/supervision/production/occurrence-etape/search/search-occurrence-etape.component';
import { ActionUtilisateurComponent } from './actions/action-utilisateur/action-utilisateur.component';
import { DetailsActionUtilisateurComponent } from './actions/action-utilisateur/details-action-utilisateur/details-action-utilisateur.component';
import { SearchActionUtilisateurComponent } from './actions/action-utilisateur/search/search-action-utilisateur/search-action-utilisateur.component';
import { ActionComponent } from './actions/action/action.component';
import { DetailsActionComponent } from './actions/action/details-action/details-action/details-action.component';
import { SearchActionComponent } from './actions/action/search/search-action/search-action.component';
import { ActionsComponent } from './actions/actions.component';
import { ConsultationComponent } from './document-dematerialise/consultation/consultation.component';
import { SearchDocumentDematerialiseComponent } from './document-dematerialise/consultation/search/search-document-dematerialise/search-document-dematerialise.component';
import { DocumentDematerialiseComponent } from './document-dematerialise/document-dematerialise.component';
import { DetailsComponent } from './document-dematerialise/video/modal/details/details.component';
import { VideoComponent } from './document-dematerialise/video/video.component';
import { GestionOccurrenceApplicationComponent } from './production/gestion-occurrence-application/gestion-occurrence-application.component';
import { GestionOccurrenceApplicationModalComponent } from './production/gestion-occurrence-application/modal/gestion-occurrence-application-modal/gestion-occurrence-application-modal.component';
import { SearchGestionOccurrenceApplicationComponent } from './production/gestion-occurrence-application/search/search-gestion-occurrence-application/search-gestion-occurrence-application.component';
import { GestionOccurrenceEtapeComponent } from './production/gestion-occurrence-etape/gestion-occurrence-etape.component';
import { GestionOccurrenceEtapeModalComponent } from './production/gestion-occurrence-etape/modal/gestion-occurrence-etape-modal.component';
import { SearchGestionOccurrenceEtapeComponent } from './production/gestion-occurrence-etape/search//search-gestion-occurrence-etape.component';
import { DagNetworkComponent } from './production/occurrence-etape/dag-network/dag-network.component';
import { DetailsModalOccurrenceEtapeComponent } from './production/occurrence-etape/modal/details/details-modal-occurrence-etape.component';
import { DetailsEtapeOccurrenceEtapeComponent } from './production/occurrence-etape/modal/details/onglets/etape/details-etape-occurrence-etape/details-etape-occurrence-etape.component';
import { DetailsFichierOccurrenceEtapeComponent } from './production/occurrence-etape/modal/details/onglets/fichier/details-fichier-occurrence-etape/details-fichier-occurrence-etape.component';
import { DetailsIncidentsOccurrenceEtapeComponent } from './production/occurrence-etape/modal/details/onglets/incidents/details-incidents-occurrence-etape/details-incidents-occurrence-etape.component';
import { DetailsMassificationOccurrenceEtapeComponent } from './production/occurrence-etape/modal/details/onglets/massification/details-massification-occurrence-etape/details-massification-occurrence-etape.component';
import { ModalConsulteScriptComponent } from './production/occurrence-etape/modal/modal-consulte-script/modal-consulte-script/modal-consulte-script.component';
import { ModalInvalidationEtapeComponent } from './production/occurrence-etape/modal/modal-invalidation-etape/modal-invalidation-etape.component';
import { ModalValidationEtapeComponent } from './production/occurrence-etape/modal/modal-validation-etape/modal-validation-etape.component';
import { ProductionComponent } from './production/production.component';
import { ServiceComponent } from './service/service.component';
import { SupervisionRoutingModule } from './supervision-routing.module';

@NgModule({
  declarations: [
    ProductionComponent,
    ActionComponent,
    DetailsActionComponent,
    DocumentDematerialiseComponent,
    SearchDocumentDematerialiseComponent,
    OccurrenceApplicationComponent,
    SearchOccurrenceApplicationComponent,
    TimelineComponent,
    GestionOccurrenceApplicationComponent,
    SearchGestionOccurrenceApplicationComponent,
    GestionOccurrenceApplicationModalComponent,
    DagNetworkComponent,
    GestionOccurrenceApplicationModalComponent,
    GestionOccurrenceEtapeComponent,
    OccurrenceEtapeComponent,
    GestionOccurrenceEtapeModalComponent,
    SearchGestionOccurrenceEtapeComponent,
    SearchOccurrenceEtapeComponent,
    OccurrenceEtapeMenuComponent,
    DetailsModalOccurrenceEtapeComponent,
    DetailsEtapeOccurrenceEtapeComponent,
    DetailsFichierOccurrenceEtapeComponent,
    DetailsIncidentsOccurrenceEtapeComponent,
    DetailsMassificationOccurrenceEtapeComponent,
    OccurrenceEtapeMenuComponent,
    ModalValidationEtapeComponent,
    ModalInvalidationEtapeComponent,
    ModalConsulteScriptComponent,
    ConsultationComponent,
    VideoComponent,
    DetailsComponent,
    ActionsComponent,
    SearchActionComponent,
    ActionUtilisateurComponent,
    DetailsActionUtilisateurComponent,
    SearchActionUtilisateurComponent,
    ServiceComponent,
  ],
  imports: [CommonModule, SupervisionRoutingModule, SharedModule, FullstackComponentsModule],
  providers: [],
})
export class SupervisionModule {}
