import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ConfirmationPopupComponent } from '@app/admin/popup/confirmation-popup/confirmation-popup.component';
import { SharedModule } from '@app/shared/shared.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { AgGridModule } from 'ag-grid-angular';
import { PopoutWindowModule } from 'angular-popout-window';
import { AngularSvgIconModule, provideAngularSvgIcon } from 'angular-svg-icon';
import { AngularDraggableModule } from 'angular2-draggable';
import { QuillModule } from 'ngx-quill';
import { AdminRoutingModule } from './admin-routing.module';
import { ApplicationComponent } from './application/application.component';
import { ApplicationDefinitionComponent } from './application/definition/application-definition/application-definition.component';
import { ClientComponent } from './client/client.component';
import { ContenuComponent } from './contenu/contenu.component';
import { AideComponent } from './contenu/aide/aide.component';
import { PopupAideComponent } from '@app/admin/contenu/aide/popup/popup-aide.component';
import { FaqComponent } from './contenu/faq/faq.component';
import { PopupFaqComponent } from './contenu/popup-help/onglets/faq/popup/popup-faq.component';
import { PageAccueilComponent } from './contenu/page-accueil/page-accueil.component';
import { PopupConfirmationComponent as ppcc } from './contenu/page-accueil/popup-confirmation/popup-confirmation.component';
import { PopupCtreateContenuComponent } from './contenu/page-accueil/popup-ctreate-contenu/popup-ctreate-contenu.component';
import { EnvironnementComponent } from './environnement/environnement.component';
import { FabricationComponent } from './fabrication/fabrication.component';
import { GammeComponent } from './fabrication/gamme/gamme.component';
import { DetailsParamDistrComponent } from './fabrication/parametre-distribution/details-param-distr/details-param-distr.component';
import { ParametreDistributionComponent } from './fabrication/parametre-distribution/parametre-distribution.component';
import { DetailsComponent } from './fabrication/ressource/details/details.component';
import { RessourceComponent } from './fabrication/ressource/ressource.component';
import { ServeurComponent } from './fabrication/serveur/serveur.component';
import { VerrouComponent } from './fabrication/verrou/verrou.component';
import { HabilitationComponent } from './habilitations/habilitation/habilitation.component';
import { HabilitationsComponent } from './habilitations/habilitations.component';
import { ProfilsUtilisateurComponent } from './habilitations/profils-utilisateur/profils-utilisateur.component';
import { MoteurAdelaideComponent } from './moteur-adelaide/moteur-adelaide.component';
import { OrganismeComponent } from './organisme/organisme.component';
import { OrganismesComponent } from './organisme/organismes/organismes.component';
import { RegionsComponent } from './organisme/regions/regions.component';
import { SitesComponent } from './organisme/sites/sites.component';
import { PopupConfirmationComponent } from './popup/popup-confirmation/popup-confirmation.component';
import { PopupDuplicateProfileComponent } from './popup/popup-duplicate-profile/popup-duplicate-profile.component';
import { PopupErreurComponent } from './popup/popup-erreur/popup-erreur.component';
import { CompositionsComponent } from './specification-fichier/compositions/compositions.component';
import { EchantillonsComponent } from './specification-fichier/echantillons/echantillons.component';
import { FormatsComponent } from './specification-fichier/formats/formats.component';
import { MultifsComponent } from './specification-fichier/multifs/multifs.component';
import { ReeditionsComponent } from './specification-fichier/reeditions/reeditions.component';
import { SpecificationFichierComponent } from './specification-fichier/specification-fichier.component';
import { SupportsComponent } from './specification-fichier/supports/supports.component';
import { TarifDetailsComponent } from './tarif/tarif-details/tarif-details.component';
import { TarifComponent } from './tarif/tarif.component';
import { PopupHelpComponent } from './contenu/popup-help/popup-help.component';
import { HelpComponent } from './contenu/popup-help/onglets/help/help.component';
import { ServiceComponent } from './service/service.component';
import {
  CreateQuestionComponent
} from '@app/admin/contenu/popup-help/onglets/conversation/create-question/create-question.component';
import {
  AnswerQuestionComponent
} from '@app/admin/contenu/popup-help/onglets/conversation/answer-question/answer-question.component';
import {
  ListQuestionComponent
} from '@app/admin/contenu/popup-help/onglets/conversation/list-question/list-question.component';
import { ConversationComponent } from '@app/admin/contenu/popup-help/onglets/conversation/conversation.component';
import { FaqComponent as FaqOngletComponent } from '@app/admin/contenu/popup-help/onglets/faq/faq.component';
@NgModule({
  declarations: [
    HabilitationsComponent,
    HabilitationComponent,
    ApplicationComponent,
    EnvironnementComponent,
    OrganismeComponent,
    FabricationComponent,
    ContenuComponent,
    ClientComponent,
    TarifComponent,
    MoteurAdelaideComponent,
    SpecificationFichierComponent,
    ServeurComponent,
    GammeComponent,
    VerrouComponent,
    ParametreDistributionComponent,
    OrganismesComponent,
    RegionsComponent,
    SitesComponent,
    RessourceComponent,
    ProfilsUtilisateurComponent,
    FormatsComponent,
    CompositionsComponent,
    MultifsComponent,
    EchantillonsComponent,
    ReeditionsComponent,
    SupportsComponent,
    ApplicationDefinitionComponent,
    PopupConfirmationComponent,
    PopupErreurComponent,
    PopupDuplicateProfileComponent,
    PageAccueilComponent,
    AideComponent,
    PopupAideComponent,
    FaqComponent,
    PopupFaqComponent,
    ppcc,
    DetailsComponent,
    DetailsParamDistrComponent,
    ConfirmationPopupComponent,
    PopupCtreateContenuComponent,
    TarifDetailsComponent,
    PopupHelpComponent,
    HelpComponent,
    ServiceComponent,
    CreateQuestionComponent,
    AnswerQuestionComponent,
    ListQuestionComponent,
    ConversationComponent,
    FaqOngletComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    AgGridModule,
    AngularSvgIconModule,
    AngularEditorModule,
    PopoutWindowModule,
    AngularDraggableModule,
    QuillModule.forRoot(),
  ],
  exports: [ConfirmationPopupComponent],
  providers: [provideHttpClient(withInterceptorsFromDi()), provideAngularSvgIcon()],
})
export class AdminModule {}
