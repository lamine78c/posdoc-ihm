import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { Exemplaire } from '@app/models/exemplaire';
import { RessourceDataInterface } from '@app/models/gestion-fichier-edition/parametre-edition/params-env-orgs-app-interface';
import { SearchByEnvOrgsAppComFicQuery } from '@app/models/payload/search-by-env-orgs-app-com-fic';
import { initExemplaireByFilterQuery } from '@app/models/supervision/production/gestion-occurrence-etape-interface';
import { ModalAjoutCompletComponent } from '@app/produit/distribution/parametre-edition/popup/modal-ajout-complet/modal-ajout-complet.component';
import { ModalUpdateComponent } from '@app/produit/distribution/parametre-edition/popup/modal-update/modal-update.component';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_MODIFIER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { getFormName } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { DataService } from '@app/shared/utils/data.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, combineLatest, Subscription, take } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ModalComponentComponent } from '../popup/modal-component/modal-component.component';
import { TableauParametreEditionService } from '../service/tableau-parametre-edition.service';
import { FichierCodficRefImprimeCodeProdInterface } from '@app/models/fichier';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { DestinataireData } from '../model/destinataire-data';
import { SearchByEnvOrgAppComFicQuery } from '@app/models/payload/search-by-env-org-app-com-fic';

@Component({
  selector: 'app-distribution-parametre-edition',
  templateUrl: './distribution-parametre-edition.component.html',
  styleUrls: ['./distribution-parametre-edition.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class DistributionParametreEditionComponent implements OnInit, OnDestroy {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData: any = [];

  nombresTotal;

  columnDefs: ColDef[];

  params: GridReadyEvent;
  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  modalRef: NgbModalRef;
  subscription: Subscription;
  organismes: any = [];
  ressources: any = [];

  formPreselection: FormGroup;
  applicationOptions = [];
  commandeOptions = [];
  fichierOptions = [];
  subscriptions: Subscription[] = [];

  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);
  siteData$: BehaviorSubject<any> = new BehaviorSubject([]);
  ressourceData$: BehaviorSubject<any> = new BehaviorSubject([]);
  destinataireData$: BehaviorSubject<DestinataireData[]> = new BehaviorSubject([]);

  formName = getFormName();
  selectedEnvs: string[] = [];
  selectedNodes: any;
  codeOrgOGUR;

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canEditPermPosition = this.auth[KEY_MODIFIER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauParametreEditionService = inject(TableauParametreEditionService);
  private readonly apiAdelaideService = inject(ApiAdelaideDistributionService);
  private readonly generateFileService = inject(GenerateFileService);
  private readonly noteService = inject(NotesService);
  private readonly modalService = inject(NgbModal);
  private readonly dataService = inject(DataService);
  private readonly fb = inject(UntypedFormBuilder);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initForm();
    this.initGridOptions();
    this.subscribeToTransferedData();
  }

  private initForm() {
    // initialisation du formulaire de preselection
    this.formPreselection = this.fb.group({
      [this.formName.COMMANDE]: ['', CustomValidators.required()],
      [this.formName.APPLICATION]: ['', CustomValidators.required()],
      [this.formName.ENVIRONNEMENT]: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      [this.formName.ORGANISME]: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      [this.formName.FICHIER]: [''],
    });
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = {
      ...this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll),
      getRowClass: params => {
        return params.data.isDataConsul ? 'row-consultation' : '';
      },
    };
    // Colonnes du tableau
    this.columnDefs = this.tableauParametreEditionService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauParametreEditionService.getOverlayNoRowsTemplate();

    this.columnDefs.find(colDef => colDef.field === 'codorg').floatingFilterComponentParams.selectData = this.organismeData$;
    this.columnDefs.find(colDef => colDef.field === 'codsit').cellRendererParams.selectData = this.siteData$;
    this.columnDefs.find(colDef => colDef.field === 'codres').cellRendererParams.selectData = this.ressourceData$;
    this.columnDefs.find(colDef => colDef.field === 'coddes').cellRendererParams.selectData = this.destinataireData$;
  }

  private subscribeToTransferedData(): void {
    // Observateur se lance lorsqu'il y a des changements des éléments dans component preslection
    this.subscriptions.push(
      this.dataService.getTransferedData().subscribe((data: any) => {
        data && this.validerPreselectionAfterAddNewParamEdit(data);
      })
    );
  }

  getDistinctEnvsFromExemplaire(data) {
    return this.apiAdelaideService.getDistinctEnvsFromExemplaire().pipe(
      tap((result: any) => {
        this.formPreselection.get(this.formName.ENVIRONNEMENT).setValue(
          result.data.getDistinctEnvsFromExemplaire.reduce((newEnvsValues, envCode) => {
            newEnvsValues[envCode] = !!data.environnements && data.environnements.includes(envCode);
            return newEnvsValues;
          }, []),
          { emitEvent: false }
        );
      })
    );
  }

  getDistinctOrgsByEnvs(data) {
    return this.apiAdelaideService.getDistinctOrgsByEnvs(data.environnements).pipe(
      tap((result: any): void => {
        const organismes = result.data.getDistOrgByEnvFromExemplaire;
        const orgForm: FormGroup = this.formPreselection.get(this.formName.ORGANISME) as FormGroup;
        const allOrgReg = result.data.allOrganismes;
        SharedUtil.getOrgFormByOrgData(orgForm, organismes, allOrgReg, false, data.organismes ? data.organismes : []);
      })
    );
  }

  getDistAppsByEnvOrg(data) {
    return this.apiAdelaideService.getDistAppsByEnvOrg(data.environnements, data.organismes).pipe(
      tap((result: any): void => {
        this.applicationOptions = result.data.getDistAppByEnvOrgFromExemplaire;
        this.formPreselection
          .get(this.formName.APPLICATION)
          .patchValue(!!data.application && this.applicationOptions.includes(data.application) ? data.application : false, { emitEvent: false });
      })
    );
  }

  getDistComsByEnvOrgApp(data) {
    return this.apiAdelaideService.getDistComsByEnvOrgApp(data.environnements, data.organismes, data.application).pipe(
      tap((result: any): void => {
        this.commandeOptions = result.data.getDistComByEnvOrgAppFromExemplaire;
        this.formPreselection
          .get(this.formName.COMMANDE)
          .patchValue(!!data.commande && this.commandeOptions.includes(data.commande) ? data.commande : false, { emitEvent: false });
      })
    );
  }

  getDistFicsByEnvOrgAppCom(data) {
    return this.apiAdelaideService
      .getDistFicsByEnvOrgAppCom(initExemplaireByFilterQuery(data.environnements, data.organismes, data.application, data.commande, null))
      .pipe(
        tap((result: any): void => {
          this.fichierOptions = [
            {
              value: '',
              columns: [
                { label: 'Fichier', value: '' },
                { label: 'Code Prd', value: '' },
                { label: 'Imprimé', value: '' },
              ],
            },
            ...result.data.getDistFicByEnvOrgAppComFromExemplaire.map((fichierInfo: FichierCodficRefImprimeCodeProdInterface) => ({
              value: fichierInfo.codfic,
              columns: [
                { label: 'Fichier', value: fichierInfo.codfic },
                { label: 'Code Prd', value: fichierInfo.codeProd },
                { label: 'Imprimé', value: fichierInfo.refImprime },
              ],
            })),
          ];

          this.formPreselection.get(this.formName.FICHIER).patchValue(data.fichier ? data.fichier : '', { emitEvent: false });
        })
      );
  }

  /**
   * Relance la recherche
   * @param data
   */
  validerPreselectionAfterAddNewParamEdit(data: any): void {
    AgGridUtil.resetFilterAndColumnSort(this.gridApi);
    let sourceObservableInput = [];
    // Mise à jour du sélécteur 'Environnement'
    sourceObservableInput.push(this.getDistinctEnvsFromExemplaire(data));
    // Mise à jour du sélécteur 'Organisme'
    sourceObservableInput.push(this.getDistinctOrgsByEnvs(data));
    // Mise à jour du sélécteur 'Application'
    this.applicationOptions = [];
    !!data.environnements && !!data.organismes
      ? sourceObservableInput.push(this.getDistAppsByEnvOrg(data))
      : this.formPreselection.get(this.formName.APPLICATION).patchValue(false, { emitEvent: false });
    // Mise à jour du sélécteur 'Commande'
    this.commandeOptions = [];
    !!data.environnements && !!data.organismes && !!data.application
      ? sourceObservableInput.push(this.getDistComsByEnvOrgApp(data))
      : this.formPreselection.get(this.formName.COMMANDE).patchValue(false, { emitEvent: false });
    // Mise à jour du sélécteur 'Fichier'
    this.fichierOptions = [];
    !!data.environnements && !!data.organismes && !!data.application && !!data.commande
      ? sourceObservableInput.push(this.getDistFicsByEnvOrgAppCom(data))
      : this.formPreselection.get(this.formName.FICHIER).patchValue('', { emitEvent: false });
    this.subscriptions.push(
      combineLatest(sourceObservableInput)
        .pipe(take(1))
        .subscribe(() => this.validerPreselection())
    );
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.getConfigData();
  }

  getConfigData() {
    // Récuperation des données organismes, destinataires et ressource pour le select d'ajout et pour le filtre du tableau
    this.subscriptions.push(
      this.apiAdelaideService.getAsyncAPIsForParametreEdition().pipe(take(1)).subscribe((result: any) => {
        this.codeOrgOGUR = result.data.getCodeOrgOGUR;
        this.organismes = result.data.allOrganismes;
        this.organismeData$.next(result.data.allOrganismes.sort((a, b) => a.code.localeCompare(b.code)));
        this.destinataireData$.next(
          result.data.allDestinataires
            .map(destin => ({ value: destin.code, text: destin.code, codorg: destin.codeOrg }))
            .sort((a, b) => a.text.localeCompare(b.text))
        );
        this.ressources = result.data.allRessources;
        this.ressourceData$.next(
          result.data.allRessources
            .filter(ressource => this.servicePerm.hasProfileAdmin() || ressource.profil !== 'A')
            .map(ressource => ({
              value: ressource.codeRessource,
              text: ressource.codeRessource,
              codapp: ressource.codeApplication,
              codenv: ressource.codeEnvironnement,
              codorg: ressource.codeOrganisme,
              codsit: ressource.codeSite,
              codgam: ressource.codeGamme,
            }))
            .sort((a, b) => a.text.localeCompare(b.text))
        );
        this.siteData$.next(result.data.allSitesCNP.map(s => ({ value: s.code, text: s.code })));
      })
    );
  }

  onDeleteRow(event) {
    const deletesDTO = event.map(e => {
      return { codenv: e.codenv, codorg: e.codorg, codapp: e.codapp, codcom: e.codcom, codfic: e.codfic, codgam: e.codgam, numexe: e.numexe };
    });
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    this.subscriptions.push(
      this.apiAdelaideService.deleteExemplaires(deletesDTO).subscribe({
        next: () => {
          this.validerPreselection();
          this.noteService.show({
            title: event.length == 1 ? "L'exemplaire a été supprimé avec succès" : 'Les exemplaires ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
        },
        error: error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
          this.setError(1, err, errors);
          this.asynchronousErrors$.next(errors);
        },
      })
    );
  }

  /**
   * Ajoute les erreurs dans la map
   */
  setError(uniqueRowKey: number, error: TableAsynchronousError, errors: Map<number, TableAsynchronousError[]>): void {
    if (errors.has(uniqueRowKey)) {
      errors.get(uniqueRowKey).push(error);
    } else {
      errors.set(uniqueRowKey, [error]);
    }
  }

  export(event: any) {
    const title = "Liste des paramètres d'édition";
    const fileServiceMap = { exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => data.push(fields.map(field => (node.data[field] !== '' ? node.data[field] : null))));

    this.generateFileService[fileServiceMap[event.type]](data, headers, title, { columnDefs: columnDefs });
  }

  ngOnDestroy(): void {
    this.dataService.setServerData(null);
    this.dataService.setDataToTransfer(null);
  }

  getSelectedValues(selectedNodes) {
    const values = {};
    if (selectedNodes.length > 0) {
      // récupère d'info de la première ligne sélectionnée + les organismes
      values[this.formName.ENVIRONNEMENT] = selectedNodes.map(node => node.data.codenv);
      values[this.formName.ORGANISME] = selectedNodes.map(node => node.data.codorg);
      values[this.formName.APPLICATION] = selectedNodes[0].data.codapp;
      values[this.formName.COMMANDE] = selectedNodes[0].data.codcom;
      values[this.formName.FICHIER] = selectedNodes[0].data.codfic;
    } else {
      // pas de nodes selectionnés, récupère par les éléments de la recherche
      const selectedValues = this.formPreselection.getRawValue();

      const rawEnv = selectedValues[this.formName.ENVIRONNEMENT];
      const selectedOrgs: string[] = [];
      const rawOrg = selectedValues[this.formName.ORGANISME];
      SharedUtil.extractSelectedOrgs(rawOrg, selectedOrgs);
      values[this.formName.ENVIRONNEMENT] = [...new Set(Object.keys(rawEnv).filter(k => rawEnv[k]))];
      values[this.formName.ORGANISME] = selectedOrgs;
      values[this.formName.APPLICATION] = selectedValues[this.formName.APPLICATION];
      values[this.formName.COMMANDE] = selectedValues[this.formName.COMMANDE];
      values[this.formName.FICHIER] = selectedValues[this.formName.FICHIER];
    }
    return values;
  }

  /**
   * Ouvre la popup selon le cas
   */
  openAddPopup(event): void {
    const selectedNodesAndMode = event;
    if (selectedNodesAndMode.mode == 'complete') {
      this.openCompleterRessourcesPopup(selectedNodesAndMode.selectedNodes);
    } else {
      this.openAddEnMassePopup(selectedNodesAndMode.selectedNodes);
    }
  }

  // modal d'ajoute en masse
  openAddEnMassePopup(selectedNodes) {
    const modalAjoutComplet = this.modalService.open(ModalAjoutCompletComponent);
    modalAjoutComplet.componentInstance.title = 'Ajout en masse des exemplaires';
    modalAjoutComplet.componentInstance.selectedValues = this.getSelectedValues(selectedNodes);
    this.subscriptions.push(
      modalAjoutComplet.componentInstance.passEntry.subscribe(data => {
        data.nbrExemplaires && this.validerPreselection();
      })
    );
  }

  // modal de compléter une ressource
  openCompleterRessourcesPopup(selectedNodes) {
    const modalRef = this.modalService.open(ModalComponentComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.selectedNodes = selectedNodes;
    modalRef.componentInstance.title = 'Compléter une ressource';
    this.subscriptions.push(
      modalRef.componentInstance.passEntry.subscribe(data => {
        // Relance la recherche avec des organismes à jour
        const rawEnv = this.formPreselection.get(this.formName.ENVIRONNEMENT).value;
        const selectedOrgs: string[] = [];
        const rawOrg = this.formPreselection.get(this.formName.ORGANISME).value;
        SharedUtil.extractSelectedOrgs(rawOrg, selectedOrgs);
        this.dataService.setDataToTransfer({
          environnements: [...new Set(Object.keys(rawEnv).filter(k => rawEnv[k]))],
          organismes: [...selectedOrgs, ...new Set(data.createdDTO.map(e => e.codorg))],
          application: this.formPreselection.get(this.formName.APPLICATION).value,
          commande: this.formPreselection.get(this.formName.COMMANDE).value,
          fichier: this.formPreselection.get(this.formName.FICHIER).value,
        });
      })
    );
  }

  validerPreselection() {
    AgGridUtil.resetFilterAndColumnSort(this.gridApi);
    const rawEnv = this.formPreselection.get(this.formName.ENVIRONNEMENT).value;
    const selectedEnvs: string[] = Object.keys(rawEnv).filter(k => rawEnv[k]);
    const selectedOrgs: string[] = [];
    const rawOrg = this.formPreselection.get(this.formName.ORGANISME).value;
    SharedUtil.extractSelectedOrgs(rawOrg, selectedOrgs);
    const selectedApp = this.formPreselection.get(this.formName.APPLICATION).value;
    const selectedCom = this.formPreselection.get(this.formName.COMMANDE).value;
    const selectedFic = this.formPreselection.get(this.formName.FICHIER).value;
    this.subscriptions.push(
      this.apiAdelaideService
        .getPreselectedData(
          initExemplaireByFilterQuery(
            selectedEnvs,
            selectedOrgs,
            [selectedApp],
            selectedCom ? [selectedCom] : null,
            selectedFic ? [selectedFic] : null
          )
        )
        .pipe(take(1))
        .subscribe((result: any) => {
          this.rowData = result.data.getPreselectedExemplaire.map(e => ({
            ...e,
            codreg: this.getCodeRegionByCodeOrg(e.codorg),
            // utilisateur non admin ne peut pas faire la modification si le profil de ressource n'est pas null
            isDataConsul: !this.servicePerm.hasProfileAdmin() && e.isAdmin,
            // utilisateur non admin ne peut pas faire la suppression si le profil de ressource n'est pas null
            isNotAuthorisedToBeDeleted: !this.servicePerm.hasProfileAdmin() && e.isAdmin,
          }));
          this.nombresTotal = this.rowData.length;
          if (!this.nombresTotal) {
            this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
          }
        })
    );
  }

  getCodeRegionByCodeOrg(codeOrg) {
    return this.organismes.filter(o => o.code == codeOrg)[0]?.codeRegion;
  }

  openUpdateRowsPopup(event): void {
    this.selectedNodes = event.selectedNodes;
    const modalRef = this.modalService.open(ModalUpdateComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.selectedNodes = this.selectedNodes;
    modalRef.componentInstance.allRessources = this.ressources;
    modalRef.componentInstance.siteOptions$ = this.siteData$.asObservable();
    modalRef.componentInstance.codeOrgOGUR = this.codeOrgOGUR;
    modalRef.componentInstance.allOrganismes = this.organismes;

    this.subscriptions.push(
      modalRef.componentInstance.updateMasse.subscribe((data: RessourceDataInterface) => {
        this.updateMasseExemplaire(data, modalRef);
      })
    );
    this.subscriptions.push(
      modalRef.componentInstance.updateMasseEtat.subscribe((etat: boolean) => {
        this.updateMasseEtat(etat, modalRef);
      })
    );
    this.subscriptions.push(
      modalRef.componentInstance.updateMasseMessage.subscribe((message: string) => {
        this.updateMasseMessage(message, modalRef);
      })
    );
    this.subscriptions.push(
      modalRef.componentInstance.updateMasseSite.subscribe((site: string) => {
        this.updateMasseSite(site, modalRef);
      })
    );
  }

  updateMasseMessage(message: string, modalRef) {
    const exemplaires = this.exemplairePayload();
    const query: SearchByEnvOrgAppComFicQuery[] = exemplaires.map(e => {
      return {
        codeEnv: e.codenv,
        codeOrg: e.codorg,
        codeApp: e.codapp,
        codeCom: e.codcom,
        codeFich: e.codfic,
      };
    });

    this.subscriptions.push(
      this.apiAdelaideService.updateMessageFichierByIdsFichier(query, message).subscribe(() => {
        this.noteService.show({
          title: 'Le message a été mis à jour avec succès',
          classname: 'note-confirmation',
          category: ToastCategoryEnum.SUCCESS,
        });
        this.validerPreselection();
        modalRef.close();
      })
    );
  }

  updateMasseSite(site: string, modalRef) {
    const exemplaires = this.exemplairePayload().map(e => {
      e.codsit = site;
      return e;
    });
    this.updateExemplaires(exemplaires, modalRef);
  }

  updateMasseEtat(etat: boolean, modalRef) {
    const exemplaires = this.exemplairePayload().map(e => {
      e.exeact = etat;
      return e;
    });
    this.updateExemplaires(exemplaires, modalRef);
  }

  updateExemplaires(exemplaires, modalRef) {
    this.subscriptions.push(
      this.apiAdelaideService.updateExemplaires(exemplaires).subscribe(response => {
        this.noteService.show({
          title: response.data.updateExemplaires.length + ' Exemplaires ont été mis à jour avec succès',
          classname: 'note-confirmation',
          category: ToastCategoryEnum.SUCCESS,
        });
        this.validerPreselection();
        modalRef.close();
      })
    );
  }

  updateMasseExemplaire(ressourceData: RessourceDataInterface, modalRef) {
    const exemplaires = this.exemplairePayload();
    this.subscriptions.push(
      this.apiAdelaideService.updateMasseExemplaires(ressourceData, exemplaires).subscribe(response => {
        const countExemplaireUpdated = response.data.updateMasseExemplaires.length;
        this.showMessage(countExemplaireUpdated, exemplaires);
        this.validerPreselection();
        modalRef.close();
      })
    );
  }

  showMessage(countExemplaireUpdated: number, exemplaires: Exemplaire[]) {
    let message = countExemplaireUpdated > 1 ? ' Exemplaires ont été mis à jour avec succès' : ' Exemplaire a été mis à jour avec succès';
    message = countExemplaireUpdated + message;
    if (countExemplaireUpdated > 0 && countExemplaireUpdated < exemplaires.length) {
      const countExemplaireNotUpdated = exemplaires.length - countExemplaireUpdated;
      const notUpdatedMessage = countExemplaireNotUpdated > 1 ? " n'ont pas été mis à jour" : " n'a pas été mis à jour";
      message = message + ' et ' + countExemplaireNotUpdated + notUpdatedMessage;
      this.infoMessage(message);
    }

    if (countExemplaireUpdated > 0 && countExemplaireUpdated === exemplaires.length) {
      this.successMessage(message);
    }

    if (countExemplaireUpdated === 0) {
      this.warningMessage();
    }
  }

  successMessage(message: string): void {
    this.noteService.show({
      title: message,
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  }

  infoMessage(message): void {
    this.noteService.show({
      title: message,
      classname: 'note-information',
      category: ToastCategoryEnum.INFO,
    });
  }

  warningMessage(): void {
    this.noteService.show({
      title: "Aucun exemplaire n'a été mis à jour",
      classname: 'note-avertissement',
      category: ToastCategoryEnum.WARNING,
    });
  }

  exemplairePayload() {
    const exemplaire: Exemplaire[] = this.selectedNodes.map(node => ({
      codapp: node.data.codapp,
      codcom: node.data.codcom,
      coddes: node.data.coddes,
      codenv: node.data.codenv,
      codfic: node.data.codfic,
      codgam: node.data.codgam,
      codorg: node.data.codorg,
      codres: node.data.codres,
      codsit: node.data.codsit,
      exeact: node.data.exeact,
      nbrexe: node.data.nbrexe,
      numexe: node.data.numexe,
    }));

    return exemplaire;
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    let row = [...editedRow][0][1];
    if (row.newRow) {
    } else {
      const query: SearchByEnvOrgsAppComFicQuery = {
        codenv: row.codenv,
        codorgs: [row.codorg],
        codapp: row.codapp,
        codcom: row.codcom,
        codfic: row.codfic,
      };

      this.subscriptions.push(
        this.apiAdelaideService.updateMessageFichierByExemplaires(query, row.ficatt).subscribe({
          next: () => {
            this.validerPreselection();
            this.noteService.show({
              title: 'Le message a été mis à jour avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.asynchronousErrors$.next(errors);
          },
          error: error => {
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(1, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    }
  }
}
