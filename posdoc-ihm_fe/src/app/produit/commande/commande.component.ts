import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { BehaviorSubject, combineLatest, of, Subscription, take } from 'rxjs';
import { TableauCommandeService } from './service/tableau-commande.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { Application } from '@app/models/application';
import { DeleteCommande } from '@app/models/deleteCommande';
import { AddCommandeModalComponent } from './modal/add-modal/add-commande-modal/add-commande-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompareModalComponent } from './modal/compare-modal/compare-modal/compare-modal.component';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { DataService } from '@app/shared/utils/data.service';
import { AddType } from '@app/models/enums/add-type';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { ApiAdelaideOrganismeService } from '@app/services/api-adelaide-organisme.service';
import { DELAI_VALUE_CHANGE, getFormName, ZERO } from '@app/shared/utils/Constants';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { PermissionService } from '@app/services/permission/permission.service';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';

@Component({
  selector: 'app-commande',
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class CommandeComponent implements OnInit, OnDestroy {
  application: Application = {} as Application;
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  nombreCommandesTotal: number;

  addType = AddType.MODAL;

  columnDefs: ColDef[];
  codenv: string;
  codesOrg: string[] = [];
  codesApp: string[] = [];
  selectedEnvs: string[];
  selectedApp: string;

  gridApi: GridApi;
  gridColumnApi: GridApi;
  params: any;
  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);
  form: UntypedFormGroup;
  commandes: any = [];

  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);
  organismes: any = [];
  environnementList: string[] = [];

  formPreselection: FormGroup;
  applicationOptions = [];
  listOfOldSelectedOrganismesCode: string[] = [];

  subscriptions: Subscription[] = [];

  isEnvOptionsInitialized = false;
  isOrgOptionsInitialized = false;

  formName = getFormName();

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.FICHIER_EDITION.COMMANDES;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);
  private readonly popupConfirmationService = inject(PopupConfirmationService);
  private readonly noteService = inject(NotesService);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauCommandeService = inject(TableauCommandeService);
  private readonly apiAdelaideCommandeService = inject(ApiAdelaideCommandeService);
  private readonly apiAdelaideOrganismeService = inject(ApiAdelaideOrganismeService);
  private readonly dataService = inject(DataService);
  private readonly generateFileService = inject(GenerateFileService);
  private readonly modalService = inject(NgbModal);

  constructor() {
    // no-op
  }

  ngOnInit(): void {
    this.codenv = null;
    this.codesOrg = null;
    this.codesApp = null;

    this.form = this.fb.group({
      listeDeroulante: ['', null],
    });

    // initialisation du formulaire de preselection
    this.formPreselection = this.fb.group({
      [this.formName.ENVIRONNEMENT]: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      [this.formName.ORGANISME]: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      [this.formName.APPLICATION]: ['', CustomValidators.required()],
    });

    this.initGridOptions();

    // Observateur se lance lorsque une nouvelle commande est créée
    this.subscriptions.push(
      this.dataService.getTransferedData().subscribe((data: any) => data && this.validerPreselectionAfterAddNewCommande(data))
    );
  }

  private initGridOptions() {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);

    this.columnDefs = this.tableauCommandeService.getColumnDefs(this.isColSelectAll);

    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauCommandeService.getOverlayNoRowsTemplate();

    this.columnDefs.find(colDef => colDef.field === 'codorg').floatingFilterComponentParams.selectData = this.organismeData$;
  }

  /**
   * Relance la recherche avec les données de la nouvelle commande créée
   * @param data
   */
  validerPreselectionAfterAddNewCommande(data: any): void {
    this.subscriptions.push(
      combineLatest([
        // Mise à jour du sélécteur 'Environnement'
        this.apiAdelaideCommandeService.getDistinctEnvsFromCommande().pipe(
          tap((result: any) => {
            this.environnementList = result.data.getDistinctEnvsFromCommande;
            this.formPreselection.get(this.formName.ENVIRONNEMENT).setValue(
              this.environnementList.reduce((newEnvsValues, envCode) => {
                newEnvsValues[envCode] = data.environnement === envCode;
                return newEnvsValues;
              }, []),
              { emitEvent: false }
            );
          })
        ),
        // Mise à jour du sélécteur 'Organisme'
        this.apiAdelaideCommandeService.getDistinctOrgsByEnvs(data.environnement).pipe(
          tap((result: any): void => {
            let organismes = result.data.getDistOrgByEnvFromCommande;
            let orgForm: FormGroup = this.formPreselection.get(this.formName.ORGANISME) as FormGroup;
            const allOrgReg = result.data.allOrganismes;
            SharedUtil.getOrgFormByOrgData(orgForm, organismes, allOrgReg, false, data.organisme);
          })
        ),
        // Mise à jour du sélécteur 'Application'
        this.apiAdelaideCommandeService.getDistAppsByEnvOrg(data.environnement, data.organisme).pipe(
          tap((result: any): void => {
            this.applicationOptions = result.data.getDistAppByEnvOrgFromCommande;
            this.formPreselection.get(this.formName.APPLICATION).patchValue(data.application, { emitEvent: false });
          })
        ),
      ])
        .pipe(take(1))
        .subscribe(() => this.validerPreselection())
    );
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;

    this.subscriptions.push(
      this.apiAdelaideOrganismeService.getAllOrganismes().pipe(take(1)).subscribe((result: any) => {
        this.organismeData$.next(result.data.allOrganismes.sort((a, b) => a.code.localeCompare(b.code)));
      })
    );

    this.getEnvironnementsFromCommande();
    this.onChangeEnvrionnement();
    this.onChangeApplication();
  }

  getEnvironnementsFromCommande() {
    this.subscriptions.push(
      this.apiAdelaideCommandeService.getDistinctEnvsFromCommande().pipe(take(1)).subscribe((result: any) => {
        result.data.getDistinctEnvsFromCommande.forEach(envCode =>
          (this.formPreselection.get(this.formName.ENVIRONNEMENT) as FormGroup).addControl(envCode, new FormControl(false, null))
        );
        this.environnementList = result.data.getDistinctEnvsFromCommande;
        this.isEnvOptionsInitialized = true;
      })
    );
  }

  onChangeEnvrionnement() {
    this.subscriptions.push(
      this.formPreselection
        .get(this.formName.ENVIRONNEMENT)
        .valueChanges.pipe(
          debounceTime(DELAI_VALUE_CHANGE),
          switchMap(elm => {
            this.selectedEnvs = Object.keys(elm).filter(k => elm[k]);
            return this.apiAdelaideCommandeService.getDistinctOrgsByEnvs(this.selectedEnvs);
          })
        )
        .subscribe((result: any) => {
          const organismes = result.data.getDistOrgByEnvFromCommande;
          const orgForm = this.formPreselection.get(this.formName.ORGANISME) as FormGroup;
          const allOrgReg = result.data.allOrganismes;
          this.organismes = allOrgReg;
          SharedUtil.getOrgFormByOrgData(orgForm, organismes, allOrgReg, false, this.listOfOldSelectedOrganismesCode);
          this.isOrgOptionsInitialized && this.onChangeOrganisme({ selectedOrgs: this.listOfOldSelectedOrganismesCode });
          this.isOrgOptionsInitialized = true;
        })
    );
  }

  onChangeApplication() {
    this.subscriptions.push(this.formPreselection.get(this.formName.APPLICATION).valueChanges.subscribe(() => this.saveNewSelectedApp()));
  }

  saveNewSelectedApp(): void {
    this.selectedApp = this.formPreselection.get(this.formName.APPLICATION).value;
  }

  /**  Mettre à jours les applications */
  onChangeOrganisme(event): void {
    const envs = this.formPreselection.get(this.formName.ENVIRONNEMENT).value;
    const selectedEnvs = Object.keys(envs).filter(k => envs[k]);
    this.listOfOldSelectedOrganismesCode = event.selectedOrgs;
    this.applicationOptions = [];
    if (!!selectedEnvs.length && !!event.selectedOrgs.length) {
      this.subscriptions.push(
        this.apiAdelaideCommandeService
          .getDistAppsByEnvOrg(selectedEnvs, event.selectedOrgs)
          .pipe(
            switchMap(data => {
              return of(data);
            }),
            take(1)
          )
          .subscribe((result: any) => {
            this.applicationOptions = result.data.getDistAppByEnvOrgFromCommande;
            this.formPreselection.get(this.formName.APPLICATION).reset(this.selectedApp, { emitEvent: true });
          })
      );
    } else {
      this.formPreselection.get(this.formName.APPLICATION).reset(false, { emitEvent: true });
    }
  }

  getCodeRegionByCodeOrg(codeOrg) {
    return this.organismes.filter(o => o.code == codeOrg)[0]?.codeRegion;
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    const commande = [...editedRow][0][1];
    // Ignore l'ajout/modif du code région
    commande.codreg = null;
    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (!commande.newRow) {
      Object.keys(commande)
        .filter(key => commande[key] === null)
        .forEach(e => delete commande[e]);

      this.subscriptions.push(
        this.apiAdelaideCommandeService.updateCommande(commande).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title:
                'La commande "' +
                (data as any).updateCommande.codenv +
                '-' +
                (data as any).updateCommande.codorg +
                '-' +
                (data as any).updateCommande.codapp +
                '-' +
                (data as any).updateCommande.code +
                '" a été mise à jour avec succès',
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

  setError(uniqueRowKey: number, error: TableAsynchronousError, errors: Map<number, TableAsynchronousError[]>): void {
    if (errors.has(uniqueRowKey)) {
      errors.get(uniqueRowKey).push(error);
    } else {
      errors.set(uniqueRowKey, [error]);
    }
  }

  onDeleteRow(event) {
    let deletesDTO: any[] = [];
    event.forEach(app => {
      let deleteCommande: DeleteCommande = new DeleteCommande();
      deleteCommande.codenv = app.codenv;
      deleteCommande.codorg = app.codorg;
      deleteCommande.codapp = app.codapp;
      deleteCommande.code = app.code;

      deletesDTO.push(deleteCommande);
    });

    this.subscriptions.push(
      this.apiAdelaideCommandeService.deleteCommandes(deletesDTO).subscribe({
        next: ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == 1 ? 'La commande a été supprimée avec succès' : 'Les commandes ont été supprimées avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreCommandesTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          this.commandes = this.commandes.filter(
            commande => !deletesDTO.some(deleteCommande => Object.keys(deleteCommande).every(key => commande[key] === deleteCommande[key]))
          );
        },
        error: error => {
          this.noteService.show({
            title:
              event.length == 1
                ? 'Impossible de supprimer la commande, elle est liée à des fichiers'
                : 'Impossible de supprimer les commandes, elles sont liées à des fichiers',
            classname: 'note-erreur',
            category: ToastCategoryEnum.ERROR,
          });
        },
      })
    );
  }

  export(event: any) {
    const rawEnv = this.formPreselection.get(this.formName.ENVIRONNEMENT).value;
    const selectedEnvs: string[] = Object.keys(rawEnv).filter(k => rawEnv[k]);
    const rawOrg = this.formPreselection.get(this.formName.ORGANISME).value;
    let selectedApp = this.formPreselection.get(this.formName.APPLICATION).value;
    let selectedOrgs: string[] = [];
    SharedUtil.extractSelectedOrgs(rawOrg, selectedOrgs);
    selectedOrgs = !!selectedOrgs.length ? selectedOrgs : null;
    selectedApp = selectedApp ? selectedApp : null;

    !!selectedEnvs.length &&
      this.subscriptions.push(
        this.apiAdelaideCommandeService
          .getCommandesByEnvsOrgsApps(selectedEnvs, selectedOrgs, selectedApp)
          .pipe(take(1))
          .subscribe((result: any) => {
            const title = 'Liste des commandes';
            const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
            const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
              .getColumnDefs()
              .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
            const headers: any[] = ['Environnement', 'Région', 'Organisme', 'Application', 'Commande', 'Désignation'];
            const fields = ['codenv', 'codreg', 'codorg', 'codapp', 'code', 'libelle'];
            const data = [];
            result.data.getCommandesByEnvsOrgsApps
              .sort((a, b) => this.compare(a, b))
              .forEach(com => data.push(fields.map(field => (com[field] !== '' ? com[field] : null))));
            this.generateFileService[fileServiceMap[event.type]](data, headers, title);
          })
      );
  }

  compare(a: any, b: any): number {
    return (
      a.codapp.localeCompare(b.codapp) ||
      a.code.localeCompare(b.code) ||
      a.codenv.localeCompare(b.codenv) ||
      a.codreg?.localeCompare(b.codreg) ||
      a.codorg.localeCompare(b.codorg)
    );
  }

  openPopup(event) {
    if (event.mode == 'compare') {
      if (!!!this.environnementList.length || !!!this.organismes.length) {
        this.noteService.show({
          title: 'Veuillez patienter un moment!',
          classname: 'note-avertissement',
          category: ToastCategoryEnum.WARNING,
        });
      } else {
        const modalRef = this.modalService.open(CompareModalComponent);
        modalRef.componentInstance.modalRef = modalRef;
        modalRef.componentInstance.title = 'Comparer des environnements';
        modalRef.componentInstance.environnementList = this.environnementList;
        modalRef.componentInstance.allOrgReg = this.organismes;
      }
    } else {
      const isCompleteStep: boolean = this.gridApi.getSelectedRows().length == 1;
      const modalRef = this.modalService.open(AddCommandeModalComponent);
      modalRef.componentInstance.modalRef = modalRef;
      modalRef.componentInstance.title = isCompleteStep ? 'Compléter une commande' : 'Création de la commande';
      modalRef.componentInstance.commandes = this.commandes;
      modalRef.componentInstance.isCompleteStep = isCompleteStep;
      modalRef.componentInstance.selectedNode = isCompleteStep ? { ...this.gridApi.getSelectedNodes()[0], isNotAuthorisedToBeDeleted: false } : null;
      modalRef.componentInstance.passEntry.subscribe(data => {
        if (data.createCommandesNumber != 0) {
          this.nombreCommandesTotal = this.nombreCommandesTotal + data.createdDTO.length;
          let rowsData: any = [];
          rowsData = data.createdDTO.map(e => {
            e.codreg = this.getCodeRegionByCodeOrg(e.codorg);
            return e;
          });
          this.gridApi.applyTransaction({ add: rowsData });
          // mise à jours les données de la popup comparer
          this.commandes = [...this.commandes, ...rowsData];
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.dataService.setServerData(null);
    this.dataService.setDataToTransfer(null);
  }

  validerPreselection() {
    const rawEnv = this.formPreselection.get(this.formName.ENVIRONNEMENT).value;
    const selectedEnvs: string[] = Object.keys(rawEnv).filter(k => rawEnv[k]);
    let selectedOrgs: string[] = [];
    const rawOrg = this.formPreselection.get(this.formName.ORGANISME).value;
    SharedUtil.extractSelectedOrgs(rawOrg, selectedOrgs);
    const selectedApp = this.formPreselection.get(this.formName.APPLICATION).value;

    this.subscriptions.push(
      this.apiAdelaideCommandeService.getPreselectedData(selectedEnvs, selectedOrgs, selectedApp).subscribe(result => {
        const responseData = result?.data?.getPreselectedCommande;
        const commandes = responseData?.commandes ?? [];
        const message = responseData?.message;

        if (message) {
          this.popupConfirmationService.popupTooManyResultsConfirmation(message);
          return;
        }

        if (commandes.length === ZERO) {
          this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
          return;
        }

        this.nombreCommandesTotal = commandes.length;
        this.rowData = this.commandes = commandes;
      })
    );
  }
}
