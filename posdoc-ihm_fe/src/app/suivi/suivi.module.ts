import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FullstackComponentsModule } from '@app/fullstack-components/fullstack-components.module';
import { SharedModule } from '@app/shared/shared.module';
import { BonTravailComponent } from '@app/suivi/bon-travail/bon-travail.component';
import { SearchBonTravailComponent } from '@app/suivi/bon-travail/search/search-bon-travail/search-bon-travail.component';
import { DistributionExpeditionComponent } from '@app/suivi/edition/expedition/distribution-expedition/distribution-expedition.component';
import { CommandeDetailsComponent } from '@app/suivi/production/modal/commande-details/commande-details.component';
import { OccurrencesApplicationComponent } from '@app/suivi/production/occurrences-application/occurrences-application.component';
import { OccurrencesFichiersComponent } from '@app/suivi/production/occurrences-fichiers/occurrences-fichiers.component';
import { SearchOccurrencesFichiersComponent } from '@app/suivi/production/occurrences-fichiers/search/search-occurrences-fichiers/search-occurrences-fichiers.component';
import { ProductionComponent } from '@app/suivi/production/production.component';
import { EditionComponent } from './edition/edition.component';
import { SearchDistributionExpeditionComponent } from './edition/expedition/distribution-expedition/search/search-distribution-expedition/search-distribution-expedition.component';
import { DetailSuiviAuPliComponent } from './edition/suivi-au-pli/detail/detail-suivi-au-pli/detail-suivi-au-pli.component';
import { SearchSuiviAuPliComponent } from './edition/suivi-au-pli/search/search-suivi-au-pli/search-suivi-au-pli.component';
import { SuiviAuPliComponent } from './edition/suivi-au-pli/suivi-au-pli.component';
import { FacturationDetailleeComponent } from './facturation/facturation-detaillee/facturation-detaillee.component';
import { SearchFacturationDetailleeComponent } from './facturation/facturation-detaillee/search-facturation-detaillee/search-facturation-detaillee.component';
import { FacturationComponent } from './facturation/facturation.component';
import { MassificationSearchComponent } from './massification/massification-search/massification-search.component';
import { MassificationComponent } from './massification/massification.component';
import { FichierDetailsComponent } from './production/modal/fichier-details/fichier-details.component';
import { FacturationFichierComponent } from './production/modal/fichier-details/onglets/facturation-fichier/facturation-fichier.component';
import { GeneralitesFichierComponent } from './production/modal/fichier-details/onglets/generalites-fichier/generalites-fichier.component';
import { NoticesFichierComponent } from './production/modal/fichier-details/onglets/notices-fichier/notices-fichier.component';
import { ProduitsFichierComponent } from './production/modal/fichier-details/onglets/produits-fichier/produits-fichier.component';
import { SearchOccurrenceApplicationComponent } from './production/occurrences-application/search/search-occurrence-application/search-occurrence-application.component';
import { SuiviRoutingModule } from './suivi-routing.module';
import { SearchVolumeTraiteComponent } from './volume-traite/search/search-volume-traite/search-volume-traite.component';
import { VolumeTraiteComponent } from './volume-traite/volume-traite.component';
import { DocumentsDematerialisesFichierComponent } from './production/modal/fichier-details/onglets/documents-dematerialises-fichier/documents-dematerialises-fichier.component';

@NgModule({
  declarations: [
    EditionComponent,
    FacturationComponent,
    VolumeTraiteComponent,
    MassificationComponent,
    DistributionExpeditionComponent,
    SearchDistributionExpeditionComponent,
    SearchVolumeTraiteComponent,
    MassificationSearchComponent,
    BonTravailComponent,
    SearchBonTravailComponent,
    FacturationDetailleeComponent,
    SearchFacturationDetailleeComponent,
    SuiviAuPliComponent,
    DetailSuiviAuPliComponent,
    SearchSuiviAuPliComponent,
    ProductionComponent,
    OccurrencesApplicationComponent,
    OccurrencesFichiersComponent,
    SearchOccurrencesFichiersComponent,
    SearchOccurrenceApplicationComponent,
    CommandeDetailsComponent,
    FichierDetailsComponent,
    GeneralitesFichierComponent,
    NoticesFichierComponent,
    ProduitsFichierComponent,
    FacturationFichierComponent,
    DocumentsDematerialisesFichierComponent,
  ],
  imports: [CommonModule, SuiviRoutingModule, SharedModule, FullstackComponentsModule],
  providers: [],
})
export class SuiviModule {}
