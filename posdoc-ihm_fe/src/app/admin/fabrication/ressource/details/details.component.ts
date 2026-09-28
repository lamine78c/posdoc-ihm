import {Component, inject} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {AutoUnsubscribe} from "@app/shared/decorators/auto-unsubscribe.decorator";

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: false,
})

@AutoUnsubscribe
export class DetailsComponent implements ICellRendererAngularComp {

  private readonly servicePerm = inject(PermissionService);
  private readonly fb = inject(FormBuilder);

  constructor() {
    // no-op
  }

  // formulaire
  form: FormGroup;

  // affichage des erreurs erreurs
  displayErrorsFn;

  params;

  // composant en etat d'edition
  isEditing = false;

  subscriptions: Subscription[] = [];

  // option type
  optionsType = [
    { value: 'C', text: 'Centralisé' },
    { value: 'D', text: 'Décentralisé' },
  ];

  // option type de fusion
  optionsTypeFision = [
    { value: '-', text: '- - Pas de fusion' },
    { value: 'T', text: 'T - Fusion totale' },
    { value: 'I', text: 'I - Fusion par imprimé' },
    { value: 'S', text: 'S - Fusion par support' },
  ];

  // option ligicuiel
  optionsLogiciel = [
    { value: 'Q', text: 'Qmaster' },
    { value: 'F', text: 'Ftp' },
    { value: 'C', text: 'Copie (cp)' },
    { value: 'B', text: 'Batch' },
    { value: 'X', text: 'Hors Adelaïde' },
  ];

  optionsServeur;
  optionsCommande;

  onChangeLogiciel(logiciel: string): void {
    this.optionsCommande = this.params.commandes
      .getValue()
      .filter(c => logiciel == c.logiciel)
      .map(c => c.value);
  }

  agInit(params: any): void {
    this.params = params;

    this.initOptions(params);
    this.initEditingState(params);
    this.parentFormErrors();

    this.form = this.buildForm(params);

    this.handleFormValueChanges(params);

    this.displayErrorsFn = this.displayErrors.bind(this);
    this.params.api.addEventListener('rowDataUpdated', this.displayErrorsFn);

    this.handleFormErrorsState();
  }

  private initOptions(params: any): void {
    this.optionsServeur = params.serveurs.getValue();
    this.optionsCommande = params.commandes
      .getValue()
      .filter(c =>
        !params.data.logicielDistribution
          ? true
          : params.data.logicielDistribution == c.logiciel
      )
      .map(c => c.value);
  }

  private initEditingState(params: any): void {
    this.isEditing = params.node.parent.__objectId === params.rowIdEdit;
  }

  private parentFormErrors(): void {
    if (this.params.node.parent && !this.params.node.parent.formErrors) {
      this.params.node.parent.formErrors = new Map();
    }
  }

  private buildForm(params: any): FormGroup {
    return this.fb.group({
      designation: [
        {
          value: params.data.libelle,
          disabled: this.isDisabled('libelle', params),
        },
        [CustomValidators.lenghtMaxValidation(50), CustomValidators.required()],
      ],
      type: [
        {
          value: params.data.type,
          disabled: this.isDisabled('type', params),
        },
        [CustomValidators.required()],
      ],
      typeFusion: [
        {
          value: params.data.typeFusion,
          disabled: this.isDisabled('type_fusion', params),
        },
        [CustomValidators.required()],
      ],
      commandeProduit: [
        {
          value: params.data.referenceDistributionProduit,
          disabled: this.isDisabled('commande_produit', params),
        },
        [CustomValidators.required()],
      ],
      serveur: [
        {
          value: params.data.codeServeur,
          disabled: this.isDisabled('serveur', params),
        },
        [CustomValidators.required()],
      ],
      utilisateur: [
        {
          value: params.data.userId,
          disabled: this.isDisabled('utilisateur', params),
        },
        [CustomValidators.lenghtMaxValidation(12)],
      ],
      fileImpression: [
        {
          value: params.data.fileImpression,
          disabled: this.isDisabled('file_impression', params),
        },
        [CustomValidators.lenghtMaxValidation(12)],
      ],
      logiciel: [
        {
          value: params.data.logicielDistribution,
          disabled: this.isDisabled('logiciel', params),
        },
        [CustomValidators.required()],
      ],
      commandeRecap: [
        {
          value: params.data.referenceDistributionProduitRecap,
          disabled: this.isDisabled('commande_recap', params),
        },
        [CustomValidators.required()],
      ],
      motDePasse: [
        {
          value: params.data.password,
          disabled: this.isDisabled('mot_de_passe', params),
        },
        [CustomValidators.lenghtMaxValidation(12)],
      ],
      informationParticuliere: [
        {
          value: params.data.informationUtilisateur,
          disabled: this.isDisabled('info_mation_particuliere', params),
        },
        CustomValidators.lenghtMaxValidation(25),
      ],
      miseSousPli: [
        {
          value: !!params.data.miseSousPli,
          disabled: this.isDisabled('mise_sous_pli', params),
        },
        Validators.required,
      ],
      fileBloquee: [
        {
          value: !!params.data.fileBloquee,
          disabled: this.isDisabled('file_bloquee', params),
        },
        Validators.required,
      ],
      destinataire: [
        {
          value: !!params.data.destinataire,
          disabled: this.isDisabled('destinataire', params),
        },
        Validators.required,
      ],
    });
  }

  private isDisabled(field: string, params: any): boolean {
    return (
      !this.isEditing ||
      (!params.newRowAdded &&
        !this.servicePerm.hasPermission(
          AUTH.ADMINISTRATION.FABRICATION.RESSOURCES[field]
        ))
    );
  }

  private handleFormValueChanges(params: any): void {
    if (!this.isEditing) return;

    this.subscriptions.push(
      this.form.valueChanges.pipe(debounceTime(300)).subscribe(() => {
        this.updateFormData(params);
        this.markParentUpdated();
      })
    );
  }

  private updateFormData(params: any): void {
    params.data.libelle = this.form.get('designation').value;
    params.data.type = this.form.get('type').value;
    params.data.typeFusion = this.form.get('typeFusion').value;
    params.data.referenceDistributionProduit = this.form.get('commandeProduit').value;
    params.data.codeServeur = this.form.get('serveur').value;
    params.data.userId = this.form.get('utilisateur').value;
    params.data.fileImpression = this.form.get('fileImpression').value;
    params.data.logicielDistribution = this.form.get('logiciel').value;
    params.data.referenceDistributionProduitRecap = this.form.get('commandeRecap').value;
    params.data.password = this.form.get('motDePasse').value;
    params.data.informationUtilisateur = this.form.get('informationParticuliere').value;
    params.data.miseSousPli = this.form.get('miseSousPli').value;
    params.data.fileBloquee = this.form.get('fileBloquee').value;
    params.data.destinataire = this.form.get('destinataire').value;
  }

  private markParentUpdated(): void {
    if (this.params.node.parent) {
      this.params.node.parent.updated = true;
      if (this.params.node.parent.formErrors) {
        this.params.node.parent.formErrors.set('detailsForm', this.form.invalid);
      }
    }
  }

  private handleFormErrorsState(): void {
    if (!this.isEditing) return;

    if (this.params.node.parent && this.params.node.parent.formErrors) {
      if (this.params.node.parent.formErrors.has('detailsForm')) {
        this.form.markAllAsTouched();
      } else {
        this.params.node.parent.formErrors.set('detailsForm', this.form.invalid);
      }
    }
  }

  refresh(params: any): boolean {
    return false;
  }

  getTectByValue(val, opt) {
    return opt.filter(e => e.value == val)[0]?.text;
  }

  displayErrors() {
    if (this.isEditing) {
      this.form.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.params.api.removeEventListener('rowDataUpdated', this.displayErrorsFn);
  }
}
