import { LoginService } from '@acoss/prisme-angular-intranet';
import { Component, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PopupConfirmationComponent } from '@app/admin/popup/popup-confirmation/popup-confirmation.component';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { TypeRefection } from '@app/models/enums/type-refection';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { ParamTermineGenappInterface } from '@app/models/supervision/production/param-termine-genapp-interface';
import { ParamUpdateTyprefGenappInterface } from '@app/models/supervision/production/param-update-typref-genapp-interface';
import { SearchGestionOccurrenceApplication } from '@app/models/supervision/production/search-gestion-occurrence-application';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { APP_OCCURRENCES_STATUS_HISTORIQUE, APP_OCCURRENCES_STATUS_TERMINATED } from '@app/shared/utils/Constants';
import { FORMID_GESTION_OCCURRENCES_APPLICATION } from '@app/shared/utils/Constants_formid';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SearchGestionOccurrenceApplicationComponent } from './search/search-gestion-occurrence-application/search-gestion-occurrence-application.component';

@Component({
  selector: 'app-gestion-occurrence-application',
  templateUrl: './gestion-occurrence-application.component.html',
  styleUrls: ['./gestion-occurrence-application.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class GestionOccurrenceApplicationComponent implements OnInit {
  @ViewChild('searchComponent') searchComponent: SearchGestionOccurrenceApplicationComponent;

  searchGestionOccurrenceApplication: SearchGestionOccurrenceApplication;
  resultat: any;
  optionsTypeRefection = Object.values(TypeRefection);
  form: FormGroup;
  paramDataUpdateTypeRef: ParamUpdateTyprefGenappInterface;
  paramDataTermineGenApp: ParamTermineGenappInterface;
  formId: string;
  user: any;
  @Input() paramData: OngletsParamDataModel;
  @Output() passEntry = new EventEmitter<any>();
  subscriptions: Subscription[] = [];

  private readonly adelaideOccurenceApplicationService = inject(ApiAdelaideOccurenceApplicationService);
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly noteService = inject(NotesService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly loginService = inject(LoginService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      typeRefection: [''],
    });
    this.formId = FORMID_GESTION_OCCURRENCES_APPLICATION;
    this.user = this.loginService.getIdentifiantUtilisateur();
    if (this.paramData !== undefined) {
      this.searchGestionOccurrenceApplication = {
        codEnv: this.paramData.codEnv,
        codOrg: this.paramData.codOrg,
        codApp: this.paramData.codApp,
        perCod: this.paramData.perCod,
      };
      this.search();
    }
  }

  lister(event) {
    this.resultat = null;
    this.searchGestionOccurrenceApplication = {
      codEnv: event.environnement,
      codOrg: event.organisme,
      codApp: event.application,
      perCod: event.periode,
    };
    this.search();
  }

  search() {
    this.subscriptions.push(
      this.adelaideOccurenceApplicationService
        .getOccurrenceApplication(this.searchGestionOccurrenceApplication)
        .pipe(take(1))
        .subscribe(result => {
          this.resultat = result.data.getOccurrenceApplication;
          this.form.get('typeRefection').setValue(this.resultat.typref);
        })
    );
  }

  isFormValid() {
    return this.resultat.typref != this.form.get('typeRefection').value;
  }

  modifier() {
    this.paramDataUpdateTypeRef = {
      codEnv: this.searchGestionOccurrenceApplication.codEnv,
      codOrg: this.searchGestionOccurrenceApplication.codOrg,
      codApp: this.searchGestionOccurrenceApplication.codApp,
      perCod: this.searchGestionOccurrenceApplication.perCod,
      typRef: this.form.get('typeRefection').value,
      user: this.user,
      formId: this.formId,
    };
    this.adelaideOccurenceApplicationService.update(this.paramDataUpdateTypeRef).subscribe({
      next: () => {
        this.noteService.show({
          title: 'Le type de réfection a été modifié avec succès',
          classname: 'note-confirmation',
          category: ToastCategoryEnum.SUCCESS,
        });
        // relance la recherche ici
        this.search();
      },
      error: error => {
        this.noteService.show({
          title: error.graphQLErrors[0].message,
          classname: 'note-erreur',
          category: ToastCategoryEnum.ERROR,
        });
      },
    });
  }

  isTermine() {
    return this.resultat.appsta !== APP_OCCURRENCES_STATUS_TERMINATED && this.resultat.appsta !== APP_OCCURRENCES_STATUS_HISTORIQUE;
  }

  isModifiable() {
    return this.resultat.appsta !== APP_OCCURRENCES_STATUS_HISTORIQUE;
  }

  terminer() {
    this.openPopupConfirmationTerminaison();
  }

  openPopupConfirmationTerminaison() {
    const modalRef = this.modalService.open(PopupConfirmationComponent);
    modalRef.componentInstance.messages = ['Confirmation', "Veuillez confirmer la terminaison de l'application"];
    modalRef.componentInstance.rowDataArray = [
      this.searchGestionOccurrenceApplication.codEnv +
        '-' +
        this.searchGestionOccurrenceApplication.codOrg +
        '-' +
        this.searchGestionOccurrenceApplication.codApp +
        '-' +
        this.searchGestionOccurrenceApplication.perCod,
    ];
    modalRef.componentInstance.firstButton = { label: 'Oui', icone: 'icon-b_valid' };
    modalRef.componentInstance.secondButton = { label: 'Non', icone: 'icon-b_cancel' };
    modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
      // Dans le cas ou l'utilisateur confirmer ou annuler
      let isAnnule = !(numButton === NUM_FIRST_BTN_MODAL);
      this.paramDataTermineGenApp = {
        codEnv: this.searchGestionOccurrenceApplication.codEnv,
        codOrg: this.searchGestionOccurrenceApplication.codOrg,
        codApp: this.searchGestionOccurrenceApplication.codApp,
        perCod: this.searchGestionOccurrenceApplication.perCod,
        user: this.user,
        formId: this.formId,
        isAnnule: isAnnule,
      };
      // appel api service pour terminer ou annuler
      this.adelaideOccurenceApplicationService.termine(this.paramDataTermineGenApp).subscribe((result: any) => {
        if (numButton === NUM_FIRST_BTN_MODAL) {
          // terminaison
          const erreur = result.data.termineOccApp.erreur;
          if (erreur === null) {
            this.noteService.show({
              title: 'La terminaison a été effectuée avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            if (this.paramData !== undefined) {
              // renvoie data au parent
              this.passEntry.emit({ terminaison: true });
            } else {
              // récupérer les options periode de la recherche
              this.searchComponent.getPeriode();
              // relance la recherche ici
              this.search();
            }
          } else {
            this.noteService.show({
              title: `Erreur de terminaison : ${erreur} `,
              classname: 'note-erreur',
              category: ToastCategoryEnum.ERROR,
            });
          }
        }
      });
    });
  }
}
