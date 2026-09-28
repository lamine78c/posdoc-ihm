import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { EIGHT, EIGHTY, FIVE, NINETY_NINE, THREE_HUNDRED, TWELVE, ZERO } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Subscription, take } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: false,
})
export class DetailsComponent implements ICellRendererAngularComp, OnDestroy {
  private readonly servicePerm = inject(PermissionService);

  constructor(private readonly fb: FormBuilder) {}

  // formulaire
  form: FormGroup;

  // affichage des erreurs erreurs
  displayErrorsFn;

  params;

  // composant en etat d'edition
  isEditing = true;

  subscriptions: Subscription[] = [];

  // option client
  clientOption = [];
  typFormatOption = [];
  typSupportOption = [];
  signatureOptions = [
    { value: 'R', text: 'RECTO' },
    { value: 'V', text: 'VERSO' },
  ];
  imprimeData = [];
  separatorFondPage = ' - ';

  agInit(params: any): void {
    this.params = params;

    params.client.pipe(take(1)).subscribe(e => {
      this.clientOption = e;
    });

    params.format.pipe(take(1)).subscribe(e => {
      this.typFormatOption = e.map(format => ({ value: format.value, text: format.value + ' - ' + format.text }));
    });

    params.imprime.pipe(take(1)).subscribe(e => {
      this.imprimeData = e.map(e => e.reference + this.separatorFondPage + e.libelle);
    });

    params.support.pipe(take(1)).subscribe(e => {
      this.typSupportOption = e.map(support => ({ value: support.value, text: support.value + ' - ' + support.text }));
    });

    // definisi c'est edition
    this.isEditing = params.node.parent.__objectId === params.rowIdEdit;

    // initialisation du formulaire
    const perm = AUTH.FICHIER_EDITION.PROPRIETES_DES_FICHIERS;
    this.form = this.fb.group({
      libFichier: [
        { value: params.data.libFichier, disabled: !this.servicePerm.hasPermission(perm.designation) },
        [CustomValidators.lenghtMaxValidation(EIGHTY), CustomValidators.required(), Validators.pattern(/^[a-zA-Z0-9\-()_\s%#]*$/)],
      ],
      codeProd: [
        { value: params.data.codeProd, disabled: !this.servicePerm.hasPermission(perm.code_produit) },
        [CustomValidators.lenghtMaxValidation(FIVE)],
      ],
      refFormat: [
        { value: params.data.refFormat, disabled: !this.servicePerm.hasPermission(perm.ref_format) },
        [CustomValidators.lenghtMaxValidation(EIGHT)],
      ],
      typeFormat: [{ value: params.data.typeFormat, disabled: !this.servicePerm.hasPermission(perm.typ_format) }, [CustomValidators.required()]],
      fondPage: [{ value: params.data.refImprime, disabled: !this.servicePerm.hasPermission(perm.fond_page) }, [CustomValidators.required()]],
      page: [
        { value: params.data.page, disabled: !this.servicePerm.hasPermission(perm.limit_regr) },
        [CustomValidators.maxValueValidator(NINETY_NINE)],
      ],
      codeClient: [
        { value: params.data.codeClient, disabled: !this.servicePerm.hasPermission(perm.code_client) },
        [CustomValidators.lenghtMaxValidation(TWELVE)],
      ],
      signature: [{ value: params.data.typeSig, disabled: !this.servicePerm.hasPermission(perm.signature) }, []],
      codeDocument: [
        { value: params.data.codeDocument, disabled: params.data.codeApp != 'PNR' || !this.servicePerm.hasPermission(perm.code_doc) },
        [CustomValidators.required(), CustomValidators.lenghtMaxValidation(EIGHT)],
      ],
      eclatement: [{ value: params.data.eclatement, disabled: !this.isEditing || !this.servicePerm.hasPermission(perm.eclatement) }, null],
      refSupport: [
        { value: params.data.refSupport, disabled: !this.servicePerm.hasPermission(perm.ref_support) },
        [CustomValidators.lenghtMaxValidation(EIGHT)],
      ],
      typeSupport: [{ value: params.data.typeSupport, disabled: !this.servicePerm.hasPermission(perm.typ_support) }, [CustomValidators.required()]],
    });

    // detection des changement du formulaire
    this.subscriptions.push(
      this.form.valueChanges.pipe(debounceTime(THREE_HUNDRED)).subscribe(() => {
        params.data.libFichier = this.form.get('libFichier').value;
        params.data.codeProd = this.form.get('codeProd').value;
        params.data.refFormat = this.form.get('refFormat').value;
        params.data.typeFormat = this.form.get('typeFormat').value;
        params.data.refImprime = this.getCodefondPage();
        params.data.page = this.form.get('page').value;
        params.data.codeClient = this.form.get('codeClient').value;
        params.data.typeSig = this.form.get('signature').value;
        params.data.codeDocument = this.form.get('codeDocument').value;
        params.data.eclatement = this.form.get('eclatement').value;
        params.data.refSupport = this.form.get('refSupport').value;
        params.data.typeSupport = this.form.get('typeSupport').value;

        // le formulaire a été editer.
        this.params.node.parent.updated = true;

        // on passe le formualre a invalid dans le param. pourlepasser au prant
        this.params.node.parent.formErrors.set('detailsForm', this.form.invalid);
      })
    );

    this.displayErrorsFn = this.displayErrors.bind(this);
    this.params.api.addEventListener('rowDataUpdated', this.displayErrorsFn);

    if (this.isEditing) {
      if (this.params.node.parent.formErrors.has('detailsForm')) {
        this.form.markAllAsTouched();
      } else {
        // Sauvegarde l'invalidité du formulaire sans le node du tableau
        // Cela permet garder l'information même après la destruction de la cellule
        // (destruction causée par une sauvegarde, tri, filtre, changement de page)
        this.params.node.parent.formErrors.set('detailsForm', this.form.invalid);
      }
    }
  }

  //TODO EDT-1225
  getCodefondPage(): string {
    let fondPage = this.form.get('fondPage').value;
    if (fondPage !== undefined && fondPage !== null) {
      fondPage = fondPage.split(this.separatorFondPage)[0];
    }
    return fondPage;
  }

  refresh(): boolean {
    return false;
  }

  getTectByValue(val, opt) {
    return opt.filter(e => e.value == val)[ZERO]?.text;
  }

  displayErrors() {
    this.form.markAllAsTouched();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors) {
      return '';
    }
    // n'est plus utilisé, à supprimer
    if (control.errors['required']) {
      return 'Ce champ est obligatoire';
    }
    // n'est plus utilisé, à supprimer
    if (control.errors['maxlength']) {
      return `Maximum ${control.errors['maxlength'].requiredLength} caractères autorisés`;
    }

    if (control.errors['pattern']) {
      return 'Caractères autorisés sont : lettres, chiffres, tirets, parenthèses, underscores et espaces';
    }

    return control.errors['message'] || 'Erreur de validation';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.params.api.removeEventListener('rowDataUpdated', this.displayErrorsFn);
    this.params.api.removeEventListener('cellEditingStarted', this.displayErrorsFn);
  }
}
