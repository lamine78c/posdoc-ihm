import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AllOrganiClientInterface } from '@app/produit/fichier/model/get-config-data-for-add-interface';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ArrayUtil } from '@app/shared/utils/ArrayUtil';
import { COD_APP_SNV2, CODE_CLIENT_UR_GENERAL, EIGHT, EIGHTY, FIVE, NINETY_NINE, ONE, UNDERSCORE, ZERO } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class EditModalComponent implements OnInit {
  @Input() modalRef: NgbModalRef | NgbActiveModal;
  @Input() selectedNodes;
  @Input() formatOptions;
  @Input() clientOptions;
  @Input() typSupportOptions;
  @Input() imprimeData;
  @Input() allOrgCliSnv2: AllOrganiClientInterface[];
  formEditEnMasse: FormGroup;
  formCodcli: FormGroup;
  formOrgCli: FormGroup;
  signatureOptions = [
    { value: 'R', text: 'RECTO' },
    { value: 'V', text: 'VERSO' },
  ];
  selectedOrgs = '';
  selectedEnv = '';
  selectedFic = '';
  selectedApp = '';
  selectedCom = '';
  title = '';
  editFormDef = true;
  editFormCodcli = false;
  showFormOrgCli = false;
  rowData;
  perm = AUTH.FICHIER_EDITION.PROPRIETES_DES_FICHIERS;
  rowsSelectedOrgSansRegion = [];

  private readonly fb = inject(FormBuilder);
  private readonly servicePerm = inject(PermissionService);
  private activeModal = inject(NgbActiveModal);

  subscriptions: Subscription[] = [];

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.rowData = this.selectedNodes[0]?.data;
    this.selectedEnv = this.rowData.codeEnv;
    this.selectedFic = this.rowData.codeFich;
    this.selectedApp = this.rowData.codeApp;
    this.selectedCom = this.rowData.codeCom;
    this.selectedOrgs = this.selectedNodes.map(node => node.data.codeOrg).join(', ');
    const sep = UNDERSCORE;
    this.title = "Modifier en masse d'un fichier " + this.selectedEnv + sep + this.selectedApp + sep + this.selectedCom + sep + this.selectedFic;
    this.getRowsSelectedOrgSansRegion();
    this.initForm();
  }

  initForm() {
    this.initFormDef();
    this.initCoddoc();
    this.initFormCodcli();
  }

  initFormDef() {
    this.formEditEnMasse = this.fb.group({
      designation: [
        { value: this.rowData.libFichier, disabled: !this.servicePerm.hasPermission(this.perm.designation) },
        [CustomValidators.required(), CustomValidators.lenghtMaxValidation(EIGHTY)],
      ],
      codeProduit: [
        { value: this.rowData.codeProd, disabled: !this.servicePerm.hasPermission(this.perm.code_produit) },
        [CustomValidators.lenghtMaxValidation(FIVE)],
      ],
      refFormat: [
        { value: this.rowData.refFormat, disabled: !this.servicePerm.hasPermission(this.perm.ref_format) },
        [CustomValidators.lenghtMaxValidation(EIGHT)],
      ],
      typeFormat: [
        { value: this.rowData.typeFormat, disabled: !this.servicePerm.hasPermission(this.perm.typ_format) },
        [CustomValidators.required()],
      ],
      fondPage: [{ value: this.rowData.refImprime, disabled: !this.servicePerm.hasPermission(this.perm.fond_page) }, [CustomValidators.required()]],
      page: [
        { value: this.rowData.page, disabled: !this.servicePerm.hasPermission(this.perm.limit_regr) },
        [CustomValidators.maxValueValidator(NINETY_NINE)],
      ],
      signature: [{ value: this.rowData.typeSig, disabled: !this.servicePerm.hasPermission(this.perm.signature) }, []],
      codeDocument: [
        { value: this.rowData.codeDocument, disabled: !this.servicePerm.hasPermission(this.perm.code_doc) },
        [CustomValidators.required(), CustomValidators.lenghtMaxValidation(EIGHT)],
      ],
      typeSupport: [
        { value: this.rowData.typeSupport, disabled: !this.servicePerm.hasPermission(this.perm.typ_support) },
        [CustomValidators.required()],
      ],
      eclatement: [{ value: this.rowData.eclatement, disabled: !this.servicePerm.hasPermission(this.perm.eclatement) }, null],
    });
  }

  initCoddoc() {
    if (this.selectedApp !== 'PNR') {
      this.formEditEnMasse.get('codeDocument').disable();
    }
  }

  initFormCodcli() {
    // mettre le code client sélectionné par défault
    let selectedCodeClient = this.rowData.codeClient;
    if ([...new Set(this.selectedNodes.map(node => node.data.codeClient))].length !== ONE) {
      // si les codeClients sélectionnées ne sont pas identique, on mets null pour la valeur sélectionnée
      selectedCodeClient = null;
    }
    // vérifier que les nodes sélectionnées sont tous avec code client UR***
    let isCodcliUrGen = true;
    this.formOrgCli = this.fb.group({});
    this.selectedNodes.map(node => {
      if (
        !ArrayUtil.isCodeClientGeneral({
          codeApplication: node.data.codeApp,
          codeClient: node.data.codeClient,
          codeOrganisme: node.data.codeOrg,
          codeRegion: node.data.codeRegion,
          allOrgCliSnv2: this.allOrgCliSnv2,
        })
      ) {
        isCodcliUrGen = false;
      }
    });
    // si c'est le cas, on mets UR*** dans le formulaire
    if (isCodcliUrGen) {
      selectedCodeClient = CODE_CLIENT_UR_GENERAL;
    }
    // initialiser le formulaire
    this.formCodcli = this.fb.group({
      codeClient: [{ value: selectedCodeClient, disabled: !this.servicePerm.hasPermission(this.perm.code_client) }, [CustomValidators.required()]],
    });
    // dans tous les cas, lister les form controls pour les organismes sans regions
    // car formCodcli.codeClient peut changer dynamiquement
    if (this.rowsSelectedOrgSansRegion.length > 0) {
      this.rowsSelectedOrgSansRegion.forEach(rowData => {
        this.formOrgCli.addControl(rowData.codeOrg, new FormControl(rowData.codeClient, CustomValidators.required()));
      });
    }
    // on affiche formOrgCli sous condition
    if (this.toShowFormOrgCli(selectedCodeClient)) {
      this.showFormOrgCli = true;
    }
    // ajoute event valueChange pour formCodcli.codeClient
    this.onChangeFormCodcli();
  }

  // condition pour afficher le formulaire organismes sans region
  toShowFormOrgCli(selectedCodeClient) {
    return selectedCodeClient === CODE_CLIENT_UR_GENERAL && this.selectedApp === COD_APP_SNV2 && this.rowsSelectedOrgSansRegion.length > ZERO;
  }

  onChangeFormCodcli() {
    this.subscriptions.push(
      this.formCodcli.get('codeClient').valueChanges.subscribe(val => {
        if (this.toShowFormOrgCli(val)) {
          this.showFormOrgCli = true;
        } else {
          this.showFormOrgCli = false;
        }
      })
    );
  }

  getRowsSelectedOrgSansRegion() {
    this.selectedNodes.map(node => {
      if (!node.data.codeRegion) {
        this.rowsSelectedOrgSansRegion.push(node.data);
      }
    });
  }

  isFormValid(): boolean {
    let isValid = false;
    if (this.editFormDef) {
      isValid = this.formEditEnMasse.valid;
    } else if (this.editFormCodcli) {
      isValid = this.formCodcli.valid;
    }
    return isValid;
  }

  save() {
    if (this.editFormDef && this.formEditEnMasse.valid) {
      this.activeModal.close({ formDefData: this.getFormEditEnMasseData() });
    } else if (this.editFormCodcli && this.formCodcli.valid) {
      this.activeModal.close({
        formCodcliData: this.getFormCodcliData(),
        formOrgCliData: this.getFormOrgCliData(),
      });
    }
  }

  getFormEditEnMasseData() {
    const data = this.formEditEnMasse.getRawValue();
    data.fondPage = data.fondPage?.split(' - ')[ZERO];
    return data;
  }

  getFormCodcliData() {
    return this.formCodcli.getRawValue();
  }

  getFormOrgCliData() {
    const selectedCodeClient = this.getFormCodcliData().codeClient;
    return this.toShowFormOrgCli(selectedCodeClient) ? this.formOrgCli.getRawValue() : {};
  }

  toEditFormDef() {
    this.editFormDef = true;
    this.editFormCodcli = false;
  }

  toEditFormCodcli() {
    this.editFormDef = false;
    this.editFormCodcli = true;
  }
}
