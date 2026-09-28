import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { Destinataire } from '@app/models/destinataire';
import { ApiAdelaideDestinataireService } from '@app/services/api-adelaide-destinataire.service';
import CustomValidators, { ValidationInterface } from '@app/shared/utils/CustomValidators';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { Subscription } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { EIGHT, FIFTY, ONE, ONE_HUNDRED_FIFTY_ONE, TWELVE, ZERO } from '@app/shared/utils/Constants';

@Component({
  selector: 'app-popup-formulaire-creation',
  templateUrl: './popup-formulaire-creation.component.html',
  styleUrls: ['./popup-formulaire-creation.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class PopupFormulaireCreationComponent implements OnInit, OnDestroy {
  @Input() modalRef: NgbModalRef | NgbActiveModal;
  @Input() organismes = [];
  @Output() passEntry = new EventEmitter<any>();

  subscriptions: Subscription[] = [];

  formGroup: FormGroup;
  orgGroup: FormGroup;
  labelWidth = ONE_HUNDRED_FIFTY_ONE;
  organismesSelected = [];
  createDestinatairesNumber = ONE;

  errorPass: string;
  errorOrganismes = 'Veuillez choisir les organismes à attacher.';
  errorDestinataire =
    "La valeur n'autorise que les caractères alphanumériques (les lettres de l'alphabet en majuscule), espace, tiret, point et virgule.";
  errorDesignation =
    "La valeur n'autorise que les caractères alphanumériques (les lettres de l'alphabet en majuscule), espace, point, tiret et tiret bas.";

  private readonly fb = inject(FormBuilder);
  private readonly apiAdelaideDestinataireService = inject(ApiAdelaideDestinataireService);
  private readonly noteService = inject(NotesService);
  private readonly filterSharedDataService = inject(FilterSharedDataService);

  constructor() {
    // do nothing
  }

  ngOnDestroy(): void {
    this.filterSharedDataService.updateData(false);
  }

  ngOnInit(): void {
    const validationDestinataire: ValidationInterface = {
      regex: new RegExp(/^[A-Z0-9.,-\s]+$/),
      messageError: this.errorDestinataire,
    };
    const validationDesignation: ValidationInterface = {
      regex: new RegExp(/^[A-Z0-9._-\s]+$/),
      messageError: this.errorDesignation,
    };

    this.formGroup = this.fb.group({
      organismes: this.fb.group({}, { validators: CustomValidators.oneRequired(this.errorOrganismes) }),
      destinataire: ['', [CustomValidators.lenghtValidation(ONE, EIGHT), CustomValidators.charValidation(validationDestinataire)]],
      designation: ['', [CustomValidators.lenghtValidation(ONE, FIFTY), CustomValidators.charValidation(validationDesignation)]],
      imprimante: ['', CustomValidators.lenghtValidation(ZERO, TWELVE)],
    });

    this.orgGroup = this.formGroup.get('organismes') as FormGroup;
    SharedUtil.getOrgFormByOrgData(this.orgGroup, [...new Set(this.organismes.map(item => item.code))] as string[], this.organismes as any, false);
  }

  closePopup() {
    this.modalRef.close();
  }

  isFormValid() {
    return this.formGroup.valid;
  }

  passBack() {
    this.errorPass = '';
    if (!this.isFormValid()) {
      this.errorPass = "Le formulaire n'est pas valide";
      return;
    }

    const createDestinataire = new Destinataire(
      this.formGroup.value['destinataire'],
      '',
      this.formGroup.value['designation'],
      this.formGroup.value['imprimante']
    );
    const createsDTO = [];
    let createdDTO = [];
    let titleMsgOk = '';

    // to Destinataire entity
    this.organismesSelected.forEach(org => {
      createsDTO.push(new Destinataire(createDestinataire.code, org, createDestinataire.libelle, createDestinataire.refPri));
    });

    this.subscriptions.push(
      this.apiAdelaideDestinataireService.createDestinataires(createsDTO).subscribe({
        next: data => {
          createdDTO = (data as any).data.createDestinataires;
          this.createDestinatairesNumber = createdDTO.length;
          if (this.createDestinatairesNumber != 0) {
            this.modalRef.close();
          }

          titleMsgOk =
            this.createDestinatairesNumber == 1
              ? 'Le destinataire a été ajoutée avec succès. '
              : this.createDestinatairesNumber + ' ' + 'destinataires ont été ajoutées avec succès.';
          if (createdDTO.length != createsDTO.length) {
            titleMsgOk += ' Les destinataires existants ne sont pas modifiés.';
          }

          this.passEntry.emit(this.createDestinatairesNumber);
          this.noteService.show({
            title: titleMsgOk,
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
        },
        error: error => {
          this.errorPass = error.graphQLErrors[0].message;
        },
      })
    );
  }

  onChangeOrganisme(event) {
    this.organismesSelected = Object.values(event).map((e: any) => e.title);
  }
}
