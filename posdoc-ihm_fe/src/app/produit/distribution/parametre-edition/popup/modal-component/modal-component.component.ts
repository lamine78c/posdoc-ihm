import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { BoutonPopup } from '@app/fullstack-components/popup/components/popup/popup.component';
import { Exemplaire } from '@app/models/exemplaire';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { PermissionService } from '@app/services/permission/permission.service';
import CustomValidators from '@app/shared/utils/CustomValidators';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FindOrganismesToCompleteInput } from './model/find-organisme-to-complete-input';
import { Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ONE, ZERO } from '@app/shared/utils/Constants';

@Component({
  selector: 'app-modal-component',
  templateUrl: './modal-component.component.html',
  styleUrls: ['./modal-component.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ModalComponentComponent implements OnInit, OnDestroy {
  @Input() modalRef: NgbModalRef | NgbActiveModal;
  /**
   * Titre de la popup
   */
  @Input() title: string;
  /**
   * Label et icône du premier bouton (En partant de la droite)
   * Champ optionnel, sera affiché par défaut "Confirmer"
   */
  @Input() firstButton: BoutonPopup = { label: 'Confirmer', icone: 'icon-b_valid' };
  /**
   * Label et icône du premier bouton (En partant de la droite)
   * Champ optionnel, sera affiché par défaut "Abandonner"
   */
  @Input() secondButton: BoutonPopup = { label: 'Abandonner', icone: 'icon-b_cancel' };

  @Input() selectedNodes = [];
  errorForm: string;
  @Output() passEntry = new EventEmitter<any>();
  organismesSelected = [];
  copiesNbre = ONE;
  exemplaire: Exemplaire;
  createdExemplaireNumber = ONE;
  formGroup: FormGroup = new FormGroup({});

  subscriptions: Subscription[] = [];

  private readonly apiAdelaideDistibutionService = inject(ApiAdelaideDistributionService);
  private readonly noteService = inject(NotesService);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly servicePerm = inject(PermissionService);
  private readonly filterSharedDataService = inject(FilterSharedDataService);

  constructor() {
    // do nothing
  }

  initForm() {
    this.formGroup = this.fb.group({
      organismes: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      copiesNbre: [this.copiesNbre, [CustomValidators.required(), CustomValidators.min(ONE)]],
    });
  }

  initExemplaireFromSelectedNodes() {
    this.exemplaire =
      this.selectedNodes.length === ONE
        ? {
            codenv: this.selectedNodes[ZERO].data.codenv,
            codorg: this.selectedNodes[ZERO].data.codorg,
            codapp: this.selectedNodes[ZERO].data.codapp,
            codcom: this.selectedNodes[ZERO].data.codcom,
            codfic: this.selectedNodes[ZERO].data.codfic,
            codgam: this.selectedNodes[ZERO].data.codgam,
            numexe: this.selectedNodes[ZERO].data.numexe,
            codsit: this.selectedNodes[ZERO].data.codsit,
            codres: this.selectedNodes[ZERO].data.codres,
            coddes: this.selectedNodes[ZERO].data.coddes,
            nbrexe: this.copiesNbre,
            exeact: this.selectedNodes[ZERO].data.exeact,
          }
        : null;
  }

  getAPIs() {
    if (!!this.exemplaire) {
      const input = new FindOrganismesToCompleteInput();
      input.codapp = this.exemplaire.codapp;
      input.codenv = this.exemplaire.codenv;
      input.codcom = this.exemplaire.codcom;
      input.codfic = this.exemplaire.codfic;
      input.codgam = this.exemplaire.codgam;
      input.codsit = this.exemplaire.codsit;
      input.codres = this.exemplaire.codres;
      input.isadmin = this.servicePerm.hasProfileAdmin();
      this.subscriptions.push(
        this.apiAdelaideDistibutionService.getAPIsForCompleteParametreEdition(input).pipe(take(1)).subscribe({
          next: results => {
            const allOrgReg = results.data.allOrganismes;
            const organismesToComplete = results.data.findExemplaireOrganismeToComplete;
            const orgForm = this.formGroup.get('organismes') as FormGroup;
            SharedUtil.getOrgFormByOrgData(orgForm, organismesToComplete, allOrgReg, false);
            if (!organismesToComplete.length) {
              this.errorForm = 'Vous ne pouvez pas compléter la ressource sélectionnée car tous les organismes sont enregistrés';
            }
          },
          error: err => console.error(err),
        })
      );
    } else {
      this.errorForm = 'Aucun exemplaire sélectionné';
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.initExemplaireFromSelectedNodes();
    this.getAPIs();
    this.subscriptions.push(this.formGroup.get('copiesNbre').valueChanges.subscribe(e => (this.copiesNbre = e)));
  }

  getCreatesDTO() {
    return this.organismesSelected.map(org => ({
      codenv: this.exemplaire.codenv,
      codorg: org,
      codapp: this.exemplaire.codapp,
      codcom: this.exemplaire.codcom,
      codfic: this.exemplaire.codfic,
      codgam: this.exemplaire.codgam,
      codsit: this.exemplaire.codsit,
      coddes: '',
      nbrexe: this.copiesNbre,
      exeact: this.exemplaire.exeact,
      numexe: this.exemplaire.numexe,
      codres: this.exemplaire.codres,
    }));
  }

  passBack() {
    this.errorForm = '';
    const toCreatesDTO = this.getCreatesDTO();
    if (toCreatesDTO.length > ZERO) {
      this.subscriptions.push(
        this.apiAdelaideDistibutionService.createExemplaires(toCreatesDTO, null).subscribe({
          next: data => {
            const createdDTO = data.data.createExemplaires;
            this.createdExemplaireNumber = createdDTO.length;
            if (this.createdExemplaireNumber != ZERO) {
              this.modalRef.close();
            }
            this.passEntry.emit({ createdExemplaireNumber: this.createdExemplaireNumber, createdDTO: createdDTO });
            this.noteService.show({
              title:
                this.createdExemplaireNumber == ONE
                  ? "L'exemplaire" +
                    ' ' +
                    createdDTO[ZERO].codenv +
                    '-' +
                    createdDTO[ZERO].codorg +
                    '-' +
                    createdDTO[ZERO].codapp +
                    '-' +
                    createdDTO[ZERO].codcom +
                    '-' +
                    createdDTO[ZERO].codfic +
                    '-' +
                    createdDTO[ZERO].codgam +
                    '-' +
                    createdDTO[ZERO].codsit +
                    '-' +
                    createdDTO[ZERO].codres +
                    ' ' +
                    'a été ajoutée avec succès'
                  : this.createdExemplaireNumber + ' ' + 'exemplaires ont été ajoutées avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
          },
          error: err => console.error(err),
        })
      );
    } else {
      this.errorForm = 'Tous les organismes séléctionnés existent';
    }
  }

  onChangeOrganisme(event) {
    this.organismesSelected = [];
    let elementSelectedList = [];
    elementSelectedList = event;
    elementSelectedList.forEach(element => {
      const elementCode = element.title.split('-', ONE);
      this.organismesSelected.push(elementCode[ZERO]);
    });
  }

  isFormValid() {
    return this.formGroup.get('organismes').valid && this.formGroup.get('copiesNbre').valid;
  }

  ngOnDestroy(): void {
    this.filterSharedDataService.updateData(false);
  }
}
