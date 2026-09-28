import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { Wizard } from '@app/fullstack-components/wizard/models/wizard.models';
import { initSearchByEnvsOrgsAppProfilInput } from '@app/models/payload/search-by-envs-orgs-app-profil';
import { transformCodeClientInterface } from '@app/models/transformeCodeClient';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { ArrayUtil } from '@app/shared/utils/ArrayUtil';
import {
  COD_APP_PNR,
  COD_APP_SNV2,
  CODE_CLIENT_UR_GENERAL,
  DELAI_VALUE_CHANGE,
  EIGHT,
  EIGHTY,
  FIVE,
  NINETY_NINE,
  TYPE_SUPPORT_DEFAUT,
  ZERO,
} from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, debounceTime, Subscription, take } from 'rxjs';
import { AllOrganiClientInterface } from '../../model/get-config-data-for-add-interface';
import { OrganismeClientModalComponent } from '../organisme-client-modal/organisme-client-modal.component';

@Component({
  selector: 'app-add-modal',
  templateUrl: './add-modal.component.html',
  styleUrls: ['./add-modal.component.scss'],
  standalone: false,
})
export class AddModalComponent implements OnInit {
  @Input() appDistinctData$: BehaviorSubject<any>;
  @Input() imprimeData$: BehaviorSubject<any>;
  @Input() allOrgReg: Array<any>;

  /** Sauvegarde les données de la liste commande de la step definition  */
  commandeDataStore = [];

  /**
   * Affiche tout le temps les icônes de navigation
   * Sinon, les icônes s'affichent automatiquement lorsque nécessaire
   */
  alwaysDisplayNavigation = false;

  wizard: Wizard[];
  active = 1;

  formDefinition: FormGroup;
  formGeneralite: FormGroup;

  dataDefinition: any = {
    application: '',
    environnement: '',
    organisme: '',
    commande: '',
    fichier: '',
  };

  formatOption;
  clientOption;
  clientOptionNoURG;
  typSupportOption;
  imprimeData;
  allOrganiClientList: AllOrganiClientInterface[];
  allClientList;
  noRegionFound;
  noRegionFoundb = false;
  orgsNoRegSelected = [];
  formOrganismeClientValue = {};

  ressources = [];

  subscriptions: Subscription[] = [];

  public activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);
  private noteService = inject(NotesService);
  private permissionService = inject(PermissionService);
  private apiFichierService = inject(ApiAdelaideFichierService);
  private readonly modalService = inject(NgbModal);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.getConfig();
    this.initWizard();
    this.initFormDefinition();
    this.initFormGeneralite();
    this.afterInitForm();
  }

  getConfig() {
    this.subscriptions.push(
      this.apiFichierService.getConfigDataForAdd().pipe(take(1)).subscribe(data => {
        this.formatOption = data.data.allFormats.map(e => ({ value: e.code, text: e.code + ' - ' + e.libelle }));
        this.clientOption = data.data.allClients.map(e => e.code);
        this.clientOptionNoURG = data.data.allClients.map(e => e.code);
        this.typSupportOption = data.data.allSupports.map(e => ({ value: e.type, text: e.type + ' - ' + e.libelle }));
        this.allClientList = data.data.allClients.map(e => e.code);
        this.allOrganiClientList = data.data.findAllOrganiClient;
      })
    );
  }

  initWizard() {
    this.wizard = [{ text: 'Définition' }, { text: 'Généralité' }, { text: 'Exemplaires' }];
  }

  initFormDefinition() {
    this.formDefinition = this.fb.group({
      application: ['', CustomValidators.required()],
      environnement: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      organisme: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      commande: ['', CustomValidators.required()],
      fichier: ['', [CustomValidators.required(), CustomValidators.lenghtMaxValidation(5)]],
    });

    this.subscriptions.push(
      this.formDefinition.valueChanges.subscribe(() => {
        this.dataDefinition = this.formDefinition.getRawValue();
      })
    );

    this.subscriptions.push(
      this.imprimeData$.pipe(take(1)).subscribe(data => {
        this.imprimeData = data.map(e => e.reference + ' - ' + e.libelle);
      })
    );
  }

  initFormGeneralite() {
    this.formGeneralite = this.fb.group({
      designation: ['', [CustomValidators.required(), CustomValidators.lenghtMaxValidation(EIGHTY)]],
      codeProduit: ['', [CustomValidators.lenghtMaxValidation(FIVE)]],
      refFormat: ['', [CustomValidators.lenghtMaxValidation(EIGHT)]],
      typeFormat: ['', CustomValidators.required()],
      fondPage: ['', CustomValidators.required()],
      page: [NINETY_NINE, [CustomValidators.maxValueValidator(NINETY_NINE)]],
      codeClient: ['', CustomValidators.required()],
      signature: [''],
      codeDocument: ['', [CustomValidators.required(), CustomValidators.lenghtMaxValidation(EIGHT)]],
      refSupport: ['', CustomValidators.lenghtMaxValidation(EIGHT)],
      typeSupport: [TYPE_SUPPORT_DEFAUT],
      eclatement: [''],
    });
  }

  afterInitForm() {
    this.onChangeApplication();
    this.onChangeOrganisme();
    this.onChangeCodeClient();
  }

  onChangeApplication() {
    this.subscriptions.push(
      this.formDefinition.get('application').valueChanges.subscribe(value => {
        const formDocument = this.formGeneralite.get('codeDocument');
        const formClient = this.formGeneralite.get('codeClient');
        if (value !== COD_APP_PNR) {
          formDocument.setValue('');
          formDocument.disable();
        } else {
          formDocument.enable();
        }
        const codeClientSelected = formClient.value;
        if (this.clientOption?.includes(CODE_CLIENT_UR_GENERAL)) {
          this.clientOption.pop();
        }
        if (value === COD_APP_SNV2) {
          this.clientOption.push(CODE_CLIENT_UR_GENERAL);
        } else if (codeClientSelected === CODE_CLIENT_UR_GENERAL) {
          formClient.setValue(null, { emitEvent: true });
        }
      })
    );
  }

  onChangeOrganisme() {
    this.subscriptions.push(
      this.formDefinition
        .get('organisme')
        .valueChanges.pipe(debounceTime(DELAI_VALUE_CHANGE))
        .subscribe(() => this.checkForClientURGeneral(false))
    );
  }

  onChangeCodeClient() {
    this.subscriptions.push(this.formGeneralite.get('codeClient').valueChanges.subscribe(() => this.checkForClientURGeneral(true)));
  }

  private checkForClientURGeneral(toShowOrgCliModal) {
    const formOrganisme = this.formDefinition.get('organisme');
    const formCodeClient = this.formGeneralite.get('codeClient');
    this.orgsNoRegSelected = this.getOrgsNoRegSelected(formOrganisme.value);
    const codeClientSelected = formCodeClient.value;
    this.noRegionFound = '';
    this.noRegionFoundb = false;
    this.formOrganismeClientValue = {};
    if (codeClientSelected === CODE_CLIENT_UR_GENERAL && this.orgsNoRegSelected.length) {
      this.noRegionFound = this.orgsNoRegSelected.join(', ');
      toShowOrgCliModal && this.toShowOrganismeClientModal();
    }
  }

  private toShowOrganismeClientModal() {
    const modalRef = this.modalService.open(OrganismeClientModalComponent, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'organisme-client-modal',
    });
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.title = 'Code client';
    modalRef.componentInstance.values = this.formOrganismeClientValue;
    modalRef.componentInstance.clientOptions = this.clientOptionNoURG;
    modalRef.componentInstance.organismesSansRegionSelected = this.orgsNoRegSelected;
    modalRef.componentInstance.passEntry.subscribe(formData => {
      this.formOrganismeClientValue = formData.formOrganismeClientValue;
      this.noRegionFound = '';
      const orgReg = [];
      Object.keys(this.formOrganismeClientValue).forEach(key => {
        orgReg.push(key + ': ' + this.formOrganismeClientValue[key]);
      });
      this.noRegionFound = orgReg.join(', ');
      this.noRegionFoundb = true;
    });
  }

  private getOrgsNoRegSelected(formOrgsValue) {
    const orgsNoRegSelected = [];
    Object.keys(formOrgsValue).forEach(regKey => {
      const orgs = formOrgsValue[regKey];
      orgsNoRegSelected.push(Object.keys(orgs).filter(orgKey => orgs[orgKey] && !this.getCodeClientByCodeOrganisme(orgKey)));
    });
    return orgsNoRegSelected.flat();
  }

  /**
   * Statut du bouton suivant
   */
  enableNextButton(): boolean {
    if (this.active === 1) {
      return this.isStep1Valid();
    } else if (this.active === 2) {
      return this.isStep2Valid();
    }
    return true;
  }

  isStep1Valid() {
    return this.formDefinition.valid;
  }

  isStep2Valid() {
    if (this.formGeneralite.get('codeClient').value === CODE_CLIENT_UR_GENERAL && this.orgsNoRegSelected.length > 0) {
      return (
        this.formGeneralite.valid &&
        this.orgsNoRegSelected.length === Object.keys(this.formOrganismeClientValue).length &&
        Object.values(this.formOrganismeClientValue).every(v => v !== null && v !== undefined && v !== '')
      );
    } else {
      return this.formGeneralite.valid;
    }
  }

  previousStep(): void {
    this.active--;
  }

  nextStep(): void {
    this.active++;
    if (this.active == 2) this.getRessGam();
  }

  stepClicked(step: number): void {
    // il accepte que le click sur les étapes précédentes afin de valider correctement le formulaire,
    if (step < this.active) {
      this.active = step;
    }
  }

  private getMessageFichier(nbFichiers, unFic) {
    return nbFichiers > unFic ? ' fichiers ont été créés avec succès' : ' fichier a été créé avec succès';
  }

  private getMessageProduit(nbProduits, unFic) {
    return nbProduits > unFic ? ' produits ont été créés avec succès' : ' produit a été créé avec succès';
  }

  private getMessageExemplaire(nbExemplaires, unFic) {
    return nbExemplaires > unFic ? ' exemplaires ont été créés avec succès' : ' exemplaire a été créé avec succès';
  }

  isAllStepsValid() {
    return this.isStep1Valid() && this.isStep2Valid();
  }

  save() {
    const fichiers = this.getFichiers();
    if (!fichiers.length) {
      this.noteService.show({
        title: 'Aucun fichier créé',
        classname: 'note-avertissement',
        category: ToastCategoryEnum.WARNING,
      });
      return;
    }
    const unFic = 1;
    this.subscriptions.push(
      this.apiFichierService.createFichierWithExemplaire(fichiers).subscribe(
        data => {
          if (data.data.createFichierWithExemplaire.nbFichiers) {
            const nbFichiers = data.data.createFichierWithExemplaire.nbFichiers;
            const message = this.getMessageFichier(nbFichiers, unFic);
            this.showSuccessMessage(nbFichiers + message);
          }

          if (data.data.createFichierWithExemplaire.nbProduits) {
            const nbProduits = data.data.createFichierWithExemplaire.nbProduits;
            const message = this.getMessageProduit(nbProduits, unFic);
            this.showSuccessMessage(nbProduits + message);
          }

          if (data.data.createFichierWithExemplaire.nbExemplaires) {
            const nbExemplaires = data.data.createFichierWithExemplaire.nbExemplaires;
            const message = this.getMessageExemplaire(nbExemplaires, unFic);
            this.showSuccessMessage(nbExemplaires + message);
          }

          const definition = this.formDefinition.getRawValue();
          this.activeModal.close(definition);
        },
        error => {
          this.noteService.show({
            title: error.graphQLErrors[0].message,
            classname: 'note-erreur',
            category: ToastCategoryEnum.ERROR,
            delay: 999999,
            body: error.graphQLErrors[0].message,
          });
        }
      )
    );
  }

  private getCodeClientByCodeOrganisme(codeOrg) {
    return ArrayUtil.getCodeClientByCodeOrganisme({
      codeOrganisme: codeOrg,
      allOrgCliSnv2: this.allOrganiClientList,
      allClientList: this.allClientList,
      allOrgReg: this.allOrgReg,
    });
  }

  private transformEclatement(eclatement) {
    return eclatement ? '1' : '0';
  }

  private transformCodeDocument(codeApplication, codeDocument) {
    return codeApplication === COD_APP_PNR ? codeDocument : '';
  }

  private transformCodeClient(codeClient, codeOrganisme) {
    const param: transformCodeClientInterface = {
      codeClient: codeClient,
      codeOrganisme: codeOrganisme,
      orgCliSansRegValue: this.formOrganismeClientValue,
      allOrgCliSnv2: this.allOrganiClientList,
      allClientList: this.allClientList,
      allOrgReg: this.allOrgReg,
    };
    return ArrayUtil.transformCodeClient(param);
  }

  private getFichiers() {
    const fichiers = [];
    const dataDef = this.formDefinition.getRawValue();
    const dataGen = this.formGeneralite.getRawValue();
    Object.keys(dataDef.environnement)
      .filter(envKey => dataDef.environnement[envKey])
      .forEach(envKey => {
        Object.keys(dataDef.organisme).forEach(regKey => {
          const orgs = dataDef.organisme[regKey];
          Object.keys(orgs)
            .filter(orgKey => orgs[orgKey])
            .forEach(orgKey => {
              const codeClient = this.transformCodeClient(dataGen.codeClient, orgKey);
              if (codeClient) {
                // ajoute fichier si codeClient est défini
                const fichier: any = {
                  codeEnv: envKey,
                  codeOrg: orgKey,
                  codeApp: dataDef.application,
                  codeCom: dataDef.commande,
                  codeFich: dataDef.fichier,
                  libFichier: dataGen.designation,
                  typeSig: dataGen.signature,
                  codeProd: dataGen.codeProduit,
                  refFormat: dataGen.refFormat,
                  typeFormat: dataGen.typeFormat,
                  refImprime: dataGen.fondPage.split('-')[ZERO].trim(),
                  codeClient: codeClient,
                  eclatement: this.transformEclatement(dataGen.eclatement),
                  page: dataGen.page,
                  typeSupport: dataGen.typeSupport,
                  codeDocument: this.transformCodeDocument(dataDef.application, dataGen.codeDocument),
                };
                const myRessources = this.getRessourceByEnvOrg(envKey, orgKey);
                if (myRessources.length > ZERO) {
                  fichier.exemplaires = myRessources.map(e => {
                    return {
                      codeRessource: e.codeRessource,
                      codeGamme: e.codeGamme,
                      codeSite: e.codeSite,
                    };
                  });
                }
                fichiers.push(fichier);
              }
            });
        });
      });
    return fichiers;
  }

  getRessourceByEnvOrg(codEnv, codOrg) {
    const codSit = this.allOrgReg.find(e => e.code == codOrg).codeSite;
    return this.ressources.filter(
      e => e.value && e.codeEnvironnement == codEnv && (e.codeOrganisme == codOrg || (e.codeOrganisme == '999' && e.codeSite == codSit))
    );
  }

  abandonner() {
    this.activeModal.dismiss('cancel');
  }
  getRessGam() {
    const envs = [];
    for (const key in this.dataDefinition.environnement) {
      if (this.dataDefinition.environnement[key]) {
        envs.push(key);
      }
    }

    const orgs = [];
    for (const key in this.dataDefinition.organisme) {
      const region = this.dataDefinition.organisme[key];
      for (const org in region) {
        if (region[org]) {
          orgs.push(org);
        }
      }
    }

    this.subscriptions.push(
      this.apiFichierService
        .getRessourcesGam(initSearchByEnvsOrgsAppProfilInput(envs, orgs, this.dataDefinition.application, this.permissionService.hasProfileAdmin()))
        .pipe(take(1))
        .subscribe(data => {
          this.ressources = (data as any).data.getRessourcesGam;
        })
    );
  }

  showSuccessMessage(message: string): void {
    this.noteService.show({
      title: message,
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }
}
