import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { BoutonPopup } from '@app/fullstack-components/popup/components/popup/popup.component';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideAdresseRetourService } from '@app/services/api-adelaide-adresse-retour.service';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { AUTH, KEY_MODIFIER_AUTH } from '@app/services/permission/PermissionsFile';
import { PermissionService } from '@app/services/permission/permission.service';
import { ONE, TWENTY, ZERO } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { TableauModalFichierAdresseRetourService } from '../../service/tableau-modal-fichier-adresse-retour.service';

@Component({
  selector: 'app-modal-add-adresse-fichier',
  templateUrl: './modal-add-adresse-fichier.component.html',
  styleUrls: ['./modal-add-adresse-fichier.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ModalAddAdresseFichierComponent implements OnInit {
  @Input() title: string;
  @Input() firstButton: BoutonPopup = { label: 'Confirmer', icone: 'icon-b_valid' };
  @Input() secondButton: BoutonPopup = { label: 'Abandonner', icone: 'icon-b_cancel' };
  @Input() adresseSelected: string;
  @Input() orgSelected: string;

  isFormValid = false;
  errorPass: string;

  @Output() passEntry = new EventEmitter<any>();

  environnementsList: { value: string; text: string }[] = [];
  applicationsList: { value: string; text: string }[] = [];
  commandesList: { value: string; text: string }[] = [];
  fichiersList: { value: string; text: string }[] = [];

  fichiers = [];

  envirionnementSelected: string;
  applicationSelected: string;
  commandeSelected: string;
  fichierSelected: string;
  refImpSelected = '%';

  formGroup: UntypedFormGroup = new UntypedFormGroup({});

  subscriptions: Subscription[] = [];

  nombreTotalArticles;
  params;
  rowData = [];
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  columnDefs: (ColDef | ColGroupDef)[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  canEditPermPosition = AUTH.FICHIER_EDITION.ADRESSES_RETOUR[KEY_MODIFIER_AUTH];
  servicePerm = inject(PermissionService);
  fb = inject(FormBuilder);
  activeModal = inject(NgbActiveModal);
  tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  tableauModalFichierAdresseRetourService = inject(TableauModalFichierAdresseRetourService);
  apiAdelaideFichierService = inject(ApiAdelaideFichierService);
  apiAdelaideAdresseRetourService = inject(ApiAdelaideAdresseRetourService);
  noteService = inject(NotesService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.getFichiersForAdsNull();
    this.initForm();
    this.initGrid();
  }

  initForm() {
    this.formGroup = this.fb.group({
      environnement: [this.envirionnementSelected, null],
      application: [this.applicationSelected, null],
      commande: [this.commandeSelected, null],
      fichier: [this.fichierSelected, null],
      refImp: [this.refImpSelected, CustomValidators.lenghtValidation(ZERO, TWENTY)],
    });
  }

  initGrid() {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.servicePerm.hasPermission(this.canEditPermPosition));
    this.gridOptions.floatingFiltersHeight = ZERO;
    this.columnDefs = this.tableauModalFichierAdresseRetourService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauModalFichierAdresseRetourService.getOverlayNoRowsTemplate();
  }

  getFichiersForAdsNull() {
    this.subscriptions.push(
      this.apiAdelaideFichierService
        .getFichiersForAdsNull(
          this.envirionnementSelected,
          this.orgSelected,
          this.applicationSelected,
          this.commandeSelected,
          this.fichierSelected,
          this.refImpSelected
        )
        .pipe(take(1))
        .subscribe(data => {
          this.fichiers = data.data.getFichiersForAdsNull;
          this.fichiers.forEach(fic => {
            if (!this.environnementsList.some(env => env.value == fic.codeEnv)) {
              this.environnementsList.push({ value: fic.codeEnv, text: fic.codeEnv });
            }
          });
          this.environnementsList.sort((a, b) => a.text.localeCompare(b.text));
        })
    );
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
  }

  onChangeEnvironnement(code) {
    this.envirionnementSelected = !code ? null : code;
    this.applicationSelected = null;
    this.commandeSelected = null;
    this.fichierSelected = null;
    this.applicationsList = [];
    this.commandesList = [];
    this.fichiersList = [];
    this.fichiers.forEach(fic => {
      if (fic.codeEnv == this.envirionnementSelected && !this.applicationsList.some(app => app.value == fic.codeApp)) {
        this.applicationsList.push({ value: fic.codeApp, text: fic.codeApp });
      }
    });
    this.applicationsList.sort((a, b) => a.text.localeCompare(b.text));
  }

  onChangeApplication(code) {
    this.applicationSelected = !code ? null : code;
    this.commandeSelected = null;
    this.fichierSelected = null;
    this.commandesList = [];
    this.fichiersList = [];
    this.fichiers.forEach(fic => {
      if (
        fic.codeEnv == this.envirionnementSelected &&
        fic.codeApp == this.applicationSelected &&
        !this.commandesList.some(com => com.value == fic.codeCom)
      ) {
        this.commandesList.push({ value: fic.codeCom, text: fic.codeCom });
      }
    });
    this.commandesList.sort((a, b) => a.text.localeCompare(b.text));
  }

  onChangeCommande(code) {
    this.commandeSelected = !code ? null : code;
    this.fichierSelected = null;
    this.fichiersList = [];
    this.fichiers.forEach(fic => {
      if (
        fic.codeEnv == this.envirionnementSelected &&
        fic.codeApp == this.applicationSelected &&
        fic.codeCom == this.commandeSelected &&
        !this.fichiersList.some(fic2 => fic2.value == fic.codeFich)
      ) {
        this.fichiersList.push({
          value: fic.codeFich,
          text: fic.codeFich + (fic.codeProd ? ' - ' + fic.codeProd : '') + (fic.refImprime ? ' - ' + fic.refImprime : ''),
        });
      }
    });
    this.fichiersList.sort((a, b) => a.text.localeCompare(b.text));
  }

  onChangeFichier(code) {
    this.fichierSelected = code ?? null;
  }

  setEnvirionnementSelected(): void {
    this.envirionnementSelected =
      this.envirionnementSelected === undefined ||
      !this.envirionnementSelected ||
      this.envirionnementSelected == '' ||
      this.envirionnementSelected == '%'
        ? null
        : this.envirionnementSelected;
  }

  setApplicationSelected(): void {
    this.applicationSelected =
      this.applicationSelected === undefined || !this.applicationSelected || this.applicationSelected == '' ? null : this.applicationSelected;
  }

  setCommandeSelected(): void {
    this.commandeSelected =
      this.commandeSelected === undefined || !this.commandeSelected || this.commandeSelected == '' ? null : this.commandeSelected;
  }

  setFichierSelected(): void {
    this.fichierSelected = this.fichierSelected === undefined || !this.fichierSelected || this.fichierSelected == '' ? null : this.fichierSelected;
  }

  setRefImpSelected(): void {
    this.refImpSelected =
      this.formGroup.value['refImp'] === undefined || this.formGroup.value['refImp'] == '%' || this.formGroup.value['refImp'] == ''
        ? null
        : this.formGroup.value['refImp'].replaceAll('%', '.*').replaceAll('_', '.');
  }

  checkFicEnvSelected(fic): boolean {
    return this.envirionnementSelected === null || fic.codeEnv == this.envirionnementSelected;
  }

  checkFicAppSelected(fic): boolean {
    return this.applicationSelected === null || fic.codeApp == this.applicationSelected;
  }

  checkFicComSelected(fic): boolean {
    return this.commandeSelected === null || fic.codeCom == this.commandeSelected;
  }

  checkFicFicSelected(fic): boolean {
    return this.fichierSelected === null || fic.codeFich == this.fichierSelected;
  }

  checkFicRefImpSelected(fic): boolean {
    return this.refImpSelected === null || new RegExp(this.refImpSelected, 'i').exec(fic.refImprime) !== null;
  }

  checkToAddFic(fic): boolean {
    return (
      this.checkFicEnvSelected(fic) &&
      this.checkFicAppSelected(fic) &&
      this.checkFicComSelected(fic) &&
      this.checkFicFicSelected(fic) &&
      this.checkFicRefImpSelected(fic)
    );
  }

  lister() {
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.setEnvirionnementSelected();
    this.setApplicationSelected();
    this.setCommandeSelected();
    this.setFichierSelected();
    this.setRefImpSelected();
    this.rowData = [];
    const rowD = [];
    this.fichiers.forEach(fic => this.checkToAddFic(fic) && rowD.push(fic));
    if (rowD.length > ZERO) {
      this.rowData = rowD;
    }
    this.nombreTotalArticles = rowD.length;
    // affiche les changements
    this.gridApi.redrawRows();
    this.gridApi.setGridOption('loading', false);
  }

  isEnableButton(): boolean {
    return this.gridApi?.getSelectedNodes()?.length >= ONE;
  }

  passBack() {
    this.errorPass = '';
    const selectedElements = this.gridApi
      .getSelectedNodes()
      .map(selectedNode => ({ ...selectedNode.data, codeAdr: this.adresseSelected, codeOrg: this.orgSelected }));
    if (selectedElements.length > ZERO) {
      this.subscriptions.push(
        this.apiAdelaideAdresseRetourService.updateFichiersFromAdressesRetour(selectedElements).subscribe({
          next: data => {
            const updatedDTO = data.data.updateFichiersFromAdressesRetour;
            if (updatedDTO.length != ZERO) {
              this.noteService.show({
                title: "L'adresse retour a été mise à jour avec succès",
                classname: 'note-confirmation',
                category: ToastCategoryEnum.SUCCESS,
              });
            }
            this.passEntry.emit(updatedDTO.length);
            this.closePopup();
          },
          error: error => {
            this.errorPass = error.graphQLErrors[ZERO].message;
          },
        })
      );
    }
  }

  closePopup() {
    this.activeModal.close();
  }
}
