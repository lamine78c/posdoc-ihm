import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { AddType } from '@app/models/enums/add-type';
import { Fichier } from '@app/models/fichier';
import { initExemplaireByFilterQuery } from '@app/models/supervision/production/gestion-occurrence-etape-interface';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_MODIFIER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { ArrayUtil } from '@app/shared/utils/ArrayUtil';
import { COD_APP_SNV2, CODE_CLIENT_UR_GENERAL, DELAI_VALUE_CHANGE, getFormName, ONE, ZERO } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, forkJoin, of, Subscription } from 'rxjs';
import { concatMap, debounceTime, switchMap, take, tap } from 'rxjs/operators';
import { DetailsComponent } from './details/details.component';
import { AddModalComponent } from './modal/add-modal/add-modal.component';
import { EditModalComponent } from './modal/edit-modal/edit-modal/edit-modal.component';
import { AllOrganiClientInterface } from './model/get-config-data-for-add-interface';
import { TableauFichierService } from './service/tableau-fichier.service';

export enum TypeFormat {
  B = 'DOC1',
}

export enum Signature {
  R = 'RECTO',
}
export enum CodeClient {
  U = 'URSSAF',
  R = 'RSI',
}

@Component({
  selector: 'app-fichiers',
  templateUrl: './fichiers.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class FichiersComponent implements OnInit {
  gridOptions: GridOptions = {};
  overlayNoRowsTemplate: string;
  columnDefs: ColDef[];
  rowData = [];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  nombreFichierTotal;
  params: any;
  noDataMessage = '<b>Veuillez remplir le formulaire pour sélectionner les fichiers à charger</b>';
  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  formatData$: BehaviorSubject<any> = new BehaviorSubject([]);
  supportData$: BehaviorSubject<any> = new BehaviorSubject([]);
  clientData$: BehaviorSubject<any> = new BehaviorSubject([]);
  documentData$: BehaviorSubject<any> = new BehaviorSubject([]);
  imprimeData$: BehaviorSubject<any> = new BehaviorSubject([]);
  applicationData$: BehaviorSubject<any> = new BehaviorSubject([]);
  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);
  allOrgCliSnv2: AllOrganiClientInterface[];
  allClientList;
  client;

  allOrgReg;
  formPreselection: FormGroup;

  addType = AddType.MODAL;

  applicationOptions = [];
  commandeOptions = [];
  fichierOptions = [];

  listOfOldSelectedOrganismesCode: string[] = [];

  isEnvOptionsInitialized = false;
  isOrgOptionsInitialized = false;

  formName = getFormName();
  subscriptions: Subscription[] = [];

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.FICHIER_EDITION.PROPRIETES_DES_FICHIERS;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canEditPermPosition = this.auth[KEY_MODIFIER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableaufichierService = inject(TableauFichierService);
  private readonly apiAdelaideFichierService = inject(ApiAdelaideFichierService);
  private readonly apiAdelaideDistributionService = inject(ApiAdelaideDistributionService);
  private readonly modalService = inject(NgbModal);
  private readonly noteService = inject(NotesService);
  private readonly fb = inject(FormBuilder);
  private readonly generateFileService = inject(GenerateFileService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initGridOptions();
    this.formPreselection = this.fb.group({
      [this.formName.APPLICATION]: ['', CustomValidators.required()],
      [this.formName.ENVIRONNEMENT]: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      [this.formName.ORGANISME]: this.fb.group({}, { validators: CustomValidators.oneRequired() }),
      [this.formName.COMMANDE]: ['', CustomValidators.required()],
      [this.formName.FICHIER]: [''],
    });

    this.onChangeEnv();
    this.onChangeApplication();
    this.onChangeCommande();
  }

  private initGridOptions() {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    this.columnDefs = this.tableaufichierService.getColumnDefs(this.isColSelectAll);
    this.overlayNoRowsTemplate = this.tableaufichierService.getOverlayNoRowsTemplate();
    this.columnDefs.find(colDef => colDef.field === 'codeOrg').floatingFilterComponentParams.selectData = this.organismeData$;
    this.gridOptions.masterDetail = true;
    this.gridOptions.detailRowAutoHeight = false;
    this.gridOptions.detailRowHeight = 250;
    this.gridOptions.detailCellRenderer = DetailsComponent;
    this.gridOptions.detailCellRendererParams = {
      client: this.clientData$,
      format: this.formatData$,
      support: this.supportData$,
      document: this.documentData$,
      imprime: this.imprimeData$,
    };
  }

  onChangeEnv(): void {
    this.subscriptions.push(
      this.formPreselection
        .get(this.formName.ENVIRONNEMENT)
        .valueChanges.pipe(
          debounceTime(DELAI_VALUE_CHANGE),
          switchMap(e => {
            const env = Object.keys(e).filter(k => e[k]);
            return this.apiAdelaideFichierService.getDistinctOrgsByEnvs(this.getSearchFichierFilterQuery(env));
          })
        )
        .subscribe(data => {
          /**  mettre à jours les organismes */
          const organismes = (data as any).data.getDistOrgByEnvFromFichier;
          const orgForm = this.formPreselection.get(this.formName.ORGANISME) as FormGroup;
          SharedUtil.getOrgFormByOrgData(orgForm, organismes, this.allOrgReg, false, this.listOfOldSelectedOrganismesCode);
          this.isOrgOptionsInitialized && this.onChangeOrganisme({ selectedOrgs: this.listOfOldSelectedOrganismesCode });
          this.isOrgOptionsInitialized = true;
        })
    );
  }

  onChangeApplication(): void {
    this.subscriptions.push(
      this.formPreselection
        .get(this.formName.APPLICATION)
        .valueChanges.pipe(
          switchMap(app => {
            const env = this.getValueOfFormEnvironnement();
            const org = this.getValueOfFormOrganisme();
            const toFind = !!env.length && !!org.length && !!app;
            return toFind ? this.apiAdelaideFichierService.getDistComsByEnvOrgApp(this.getSearchFichierFilterQuery(env, org, app)) : of(null);
          })
        )
        .subscribe(data => {
          const comSelected = this.getValueOfFormCommande();
          this.commandeOptions = [];
          if (data) {
            this.commandeOptions = (data as any).data.getDistComByEnvOrgAppFromFichier;
            if (this.commandeOptions.includes(comSelected)) {
              this.formPreselection.get(this.formName.COMMANDE).patchValue(comSelected, { emitEvent: true });
            } else {
              this.formPreselection.get(this.formName.COMMANDE).reset(false, { emitEvent: true });
            }
          } else {
            this.formPreselection.get(this.formName.COMMANDE).reset(false, { emitEvent: true });
          }
        })
    );
  }

  onChangeOrganisme(event): void {
    const env = this.getValueOfFormEnvironnement();
    this.listOfOldSelectedOrganismesCode = event.selectedOrgs;
    const appSelected = this.getValueOfFormApplication();
    this.applicationOptions = [];
    if (!!env.length && !!event.selectedOrgs.length) {
      this.subscriptions.push(
        this.apiAdelaideFichierService
          .getDistAppsByEnvOrg(this.getSearchFichierFilterQuery(env, event.selectedOrgs))
          .pipe(
            switchMap(data => {
              return of(data);
            }),
            take(1)
          )
          .subscribe((data: any) => {
            this.applicationOptions = data.data.getDistAppByEnvOrgFromFichier;
            if (this.applicationOptions.includes(appSelected)) {
              this.formPreselection.get(this.formName.APPLICATION).patchValue(appSelected, { emitEvent: true });
            } else {
              this.formPreselection.get(this.formName.APPLICATION).reset(false, { emitEvent: true });
            }
          })
      );
    } else {
      this.formPreselection.get(this.formName.APPLICATION).reset(false, { emitEvent: true });
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;

    this.subscriptions.push(
      this.apiAdelaideFichierService
        .getDistinctEnvironnements()
        .pipe(
          concatMap(data => {
            const env = (data as any).data.getDistinctEnvsFromFichier;
            const envForm = this.formPreselection.get(this.formName.ENVIRONNEMENT) as FormGroup;
            Object.keys(envForm.controls).forEach(key => envForm.removeControl(key));
            if (!!env.length) {
              env.forEach(i => {
                envForm.addControl(i as string, new FormControl(false, null), { emitEvent: false });
              });
              this.isEnvOptionsInitialized = true;
            }
            this.allOrgReg = (data as any).data.allOrganismes;
            this.organismeData$.next(this.allOrgReg);
            return this.apiAdelaideFichierService.getConfigData();
          })
        )
        .pipe(take(1))
        .subscribe(data => {
          this.formatData$.next((data as any).data.allFormats);
          this.clientData$.next((data as any).data.allClients.map(e => e.code));
          this.documentData$.next(['a', 'r', 'g']);
          this.imprimeData$.next((data as any).data.allImprimes);
          this.supportData$.next((data as any).data.allSupports);
          this.allOrgCliSnv2 = (data as any).data.findAllOrganiClient;
          this.allClientList = (data as any).data.allClients.map(e => e.code);
        })
    );
  }

  validerPreselection() {
    AgGridUtil.resetFilterAndColumnSort(this.gridApi);
    const env = this.getValueOfFormEnvironnement();
    const org = this.getValueOfFormOrganisme();
    const app = this.getValueOfFormApplication();
    const com = this.getValueOfFormCommande();
    const fic = this.getValueOfFormFichier();
    const paramsPreselectedData = { codenvs: env, codorgs: org, codapp: app, codcom: com, codfic: fic || null };
    this.subscriptions.push(
      this.apiAdelaideFichierService.preselectedData(paramsPreselectedData).pipe(take(1)).subscribe(data => {
        this.updateTableData((data as any).data.getPreselectedFichier);
      })
    );
  }

  addModal() {
    const modalRef = this.modalService.open(AddModalComponent, { backdrop: 'static', keyboard: false });
    modalRef.componentInstance.allOrgReg = this.allOrgReg;
    modalRef.componentInstance.imprimeData$ = this.imprimeData$;
    modalRef.result
      .then(formData => {
        this.reloadPreselectedFichier(formData);
      })
      .catch(e => console.error(e));
  }

  updateFichier(editedRow) {
    if ([...editedRow].length > 0) {
      const data = [...editedRow][0][1];
      this.updateFichiers([data]);
    }
  }

  getLibelle(fichier: any): string {
    const list: Array<string> = [];
    if (fichier.codeEnv != null) {
      list.push(fichier.codeEnv);
    }
    if (fichier.codeOrg != null) {
      list.push(fichier.codeOrg);
    }
    if (fichier.codeApp != null) {
      list.push(fichier.codeApp);
    }
    if (fichier.codeCom != null) {
      list.push(fichier.codeCom);
    }
    if (fichier.codeFich != null) {
      list.push(fichier.codeFich);
    }
    return list.map(x => x).join(', ');
  }

  /**
   * initiailise le formulaire de recherche celon les donnée du fichier créer.
   * @param formData les données du formulaire définition.
   */
  reloadPreselectedFichier(formData) {
    //selectionner les environnement
    this.formPreselection.get(this.formName.ENVIRONNEMENT).patchValue(formData.environnement, { emitEvent: false });
    const env = Object.keys(formData.environnement).filter(key => formData.environnement[key]);
    const org = [];
    SharedUtil.extractSelectedOrgs(formData.organisme, org);
    const app = formData.application;
    const com = formData.commande;
    const fic = formData.fichier ?? null;
    this.subscriptions.push(
      forkJoin([
        this.apiAdelaideFichierService
          .getDistinctOrgsByEnvs(this.getSearchFichierFilterQuery(env))
          .pipe(
            tap(res => {
              const formOrg = this.formPreselection.get(this.formName.ORGANISME) as FormGroup;
              const organismes = (res as any).data.getDistOrgByEnvFromFichier;
              SharedUtil.getOrgFormByOrgData(formOrg, organismes, this.allOrgReg, false, org);
            }),
            take(1)
          ),
        this.apiAdelaideFichierService
          .getDistAppsByEnvOrg(this.getSearchFichierFilterQuery(env, org))
          .pipe(
            tap(res => {
              this.applicationOptions = (res as any).data.getDistAppByEnvOrgFromFichier;
              this.formPreselection.get(this.formName.APPLICATION).setValue(app, { emitEvent: false });
            }),
            take(1)
          ),
        this.apiAdelaideFichierService
          .getDistComsByEnvOrgApp(this.getSearchFichierFilterQuery(env, org, app))
          .pipe(
            tap(res => {
              this.commandeOptions = (res as any).data.getDistComByEnvOrgAppFromFichier;
              this.formPreselection.get(this.formName.COMMANDE).setValue(com, { emitEvent: false });
            }),
            take(1)
          ),
        this.apiAdelaideDistributionService
          .getDistFicsByEnvOrgAppCom(initExemplaireByFilterQuery(env, org, app, com, null))
          .pipe(
            tap(res => {
              this.setFichierOptionsFromWS((res as any).data.getDistFicByEnvOrgAppComFromExemplaire);
              this.formPreselection.get(this.formName.FICHIER).setValue(fic, { emitEvent: false });
            }),
            take(1)
          ),
        this.apiAdelaideFichierService
          .preselectedData(this.getSearchFichierFilterQuery(env, org, app, com, fic))
          .pipe(
            tap(res => {
              this.updateTableData((res as any).data.getPreselectedFichier);
            }),
            take(1)
          ),
      ]).subscribe()
    );
  }

  onDeleteRow(event) {
    const fichiers: Fichier[] = [];
    event.forEach(fich => {
      const fichier: Fichier = {} as Fichier;
      fichier.codeEnv = fich.codeEnv;
      fichier.codeOrg = fich.codeOrg;
      fichier.codeApp = fich.codeApp;
      fichier.codeCom = fich.codeCom;
      fichier.codeFich = fich.codeFich;

      fichiers.push(fichier);
    });
    this.subscriptions.push(
      this.apiAdelaideFichierService.deleteFichiers(fichiers).subscribe({
        next: () => {
          this.gridApi.applyTransaction({ remove: event });
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == 1 ? 'Le fichier a été supprimé avec succès' : 'Les fichiers ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreFichierTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: () => {
          this.noteService.show({
            title:
              event.length == 1
                ? 'Impossible de supprimer le fichier, il est lié à une Produit '
                : 'Impossible de supprimer les fichiers, ils sont liés à des Produit',
            classname: 'note-erreur',
            category: ToastCategoryEnum.ERROR,
          });
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

  /**
   * exporter les données au format pdf ou excel
   * @param event type de fichier a exporter PDF ou Excel
   */
  export(event: any) {
    const title = 'Liste des fichiers';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    let headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    let fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data = [];
    const detailsFields = this.getDetailsHeaderFieldsForExport();
    if (event.type == 'exportAsExcel') {
      fields = fields.concat(detailsFields.map((df: any) => df.field));
      headers = headers.concat(detailsFields.map((df: any) => df.header));
    }
    const env = this.getValueOfFormEnvironnement();
    const org = this.getValueOfFormOrganisme();
    const app = this.getValueOfFormApplication();
    const com = this.getValueOfFormCommande();
    const fic = this.getValueOfFormFichier();
    const paramsPreselectedData = {
      codenvs: env,
      codorgs: org,
      codapp: app || null,
      codcom: com || null,
      codfic: fic || null,
    };
    this.subscriptions.push(
      this.apiAdelaideFichierService.preselectedData(paramsPreselectedData).pipe(take(1)).subscribe(d => {
        const fichiers = (d as any).data.getPreselectedFichier.map(e => {
          e.codeRegion = this.allOrgReg.filter(n => n.code == e.codeOrg)[0].codeRegion;
          //TODO EDT-250 voir rendre générique le formatage des exports xls et pdf
          e.eclatement = SharedUtil.formatOuiNon(e.eclatement);
          return e;
        });
        fichiers.sort(
          (a, b) =>
            a.codeApp.localeCompare(b.codeApp) ||
            a.codeCom.localeCompare(b.codeCom) ||
            a.codeFich.localeCompare(b.codeFich) ||
            (a.codeProd ?? '').localeCompare(b.codeProd ?? '') ||
            a.codeEnv.localeCompare(b.codeEnv) ||
            (a.codeRegion ?? '').localeCompare(b.codeRegion ?? '') ||
            a.codeOrg.localeCompare(b.codeOrg)
        );
        fichiers.map(e => {
          data.push(fields.map(field => e[field]));
          if (event.type == 'exportAsPDF') {
            data.push(SharedUtil.getDetailRow(detailsFields, e, headers));
          }
        });
        this.generateFileService[fileServiceMap[event.type]](data, headers, title);
      })
    );
  }

  private getDetailsHeaderFieldsForExport() {
    return [
      { header: 'Désignation', field: 'libFichier' },
      { header: 'Code Produit', field: 'codeProd' },
      { header: 'Référence Format', field: 'refFormat' },
      { header: 'Type Format', field: 'typeFormat' },
      { header: 'Fond De Page', field: 'refImprime' },
      { header: 'Code Client', field: 'codeClient' },
      { header: 'Signature', field: 'typeSig', format: 'format()' },
      { header: 'Code Document', field: 'codeDocument' },
      { header: 'Eclatement', field: 'eclatement' },
      { header: 'Référence Support', field: 'refSupport' },
      { header: 'Limite Regroupement', field: 'page' },
    ];
  }

  getSearchFichierFilterQuery(codenvs: string[], codorgs?: string[], codapp?: string, codcom?: string, codfic?: string) {
    return {
      codenvs: codenvs,
      codorgs: codorgs,
      codapp: codapp,
      codcom: codcom,
      codfic: codfic,
    };
  }

  openUpdateRowsPopup(event): void {
    // vérification un seul fichier, un seul environnement
    const envs = [...new Set(event.selectedNodes.map(node => node.data.codeEnv))];
    const fics = [...new Set(event.selectedNodes.map(node => node.data.codeFich))];
    if (envs.length !== ONE || fics.length !== ONE) {
      const errors: Map<number, TableAsynchronousError[]> = new Map();
      const err: TableAsynchronousError = {
        isError: true,
        message: 'Veuillez choisir un seul environnement et un seul fichier',
        id: null,
      };
      this.setError(1, err, errors);
      this.asynchronousErrors$.next(errors);
      return;
    }

    const modalRef = this.modalService.open(EditModalComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.selectedNodes = event.selectedNodes;
    modalRef.componentInstance.allOrgCliSnv2 = this.allOrgCliSnv2;
    this.subscriptions.push(
      this.clientData$.pipe(take(1)).subscribe(data => {
        modalRef.componentInstance.clientOptions = [...new Set(data)];
        // ajoute l'option UR*** pour la V2
        if (event.selectedNodes[0].data.codeApp == COD_APP_SNV2) {
          modalRef.componentInstance.clientOptions.push(CODE_CLIENT_UR_GENERAL);
        }
      })
    );
    this.subscriptions.push(
      this.formatData$.pipe(take(1)).subscribe(data => {
        modalRef.componentInstance.formatOptions = data.map(e => ({ value: e.value, text: e.value + ' - ' + e.text }));
      })
    );
    this.subscriptions.push(
      this.supportData$.pipe(take(1)).subscribe(data => {
        modalRef.componentInstance.typSupportOptions = data.map(e => ({ value: e.value, text: e.value + ' - ' + e.text }));
      })
    );
    this.subscriptions.push(
      this.imprimeData$.pipe(take(1)).subscribe(data => {
        modalRef.componentInstance.imprimeData = data.map(e => e.reference + ' - ' + e.libelle);
      })
    );
    modalRef.result
      .then(result => {
        let rows;
        if (result.formDefData) {
          // form définition
          const formDefData = result.formDefData;
          rows = event.selectedNodes.map(node => {
            let row = node.data;
            row.libFichier = formDefData.designation;
            row.codeProd = formDefData.codeProduit;
            row.refFormat = formDefData.refFormat;
            row.typeFormat = formDefData.typeFormat;
            row.refImprime = formDefData.fondPage;
            row.page = formDefData.page;
            row.typeSig = formDefData.signature;
            row.codeDocument = formDefData.codeDocument;
            row.typeSupport = formDefData.typeSupport;
            row.eclatement = formDefData.eclatement ? ONE : ZERO;
            return row;
          });
        } else if (result.formCodcliData) {
          // form code client
          const formCodcliData = result.formCodcliData;
          rows = event.selectedNodes.map(node => {
            let row = node.data;
            const codeClient = node.data.codeClient;
            row.codeClient = ArrayUtil.transformCodeClient({
              codeClient: formCodcliData.codeClient,
              codeOrganisme: row.codeOrg,
              orgCliSansRegValue: result.formOrgCliData,
              allOrgCliSnv2: this.allOrgCliSnv2,
              allClientList: this.allClientList,
              allOrgReg: this.allOrgReg,
            });
            return row;
          });
        }
        rows && this.updateFichiers(rows);
      })
      .catch(e => console.error(e));
  }

  updateFichiers(rows) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    let fichiers = [];
    rows.map(node => {
      const row = { ...node };
      delete row.collapse;
      delete row.codeRegion;
      delete row.isNotAuthorisedToBeDeleted;
      Object.keys(row)
        .filter(key => row[key] === null)
        .forEach(e => delete row[e]);
      const r = Object.assign({}, row);
      fichiers.push(r);
    });
    this.subscriptions.push(
      this.apiAdelaideFichierService.updateFichiers(fichiers).subscribe({
        next: ({ data }) => {
          this.noteService.show({
            title:
              fichiers.length === ONE
                ? 'Le fichier "' + this.getLibelle((data as any).updateFichiers[0]) + '" a été mis à jour avec succès'
                : 'Les fichiers ont été mis à jour avec succès',
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

  private getValueOfFormEnvironnement(): string[] {
    const rawEnv = this.formPreselection.get(this.formName.ENVIRONNEMENT).value;
    return Object.keys(rawEnv).filter(k => rawEnv[k]);
  }

  private getValueOfFormOrganisme(): string[] {
    const org = [];
    const rawOrg = this.formPreselection.get(this.formName.ORGANISME).value;
    SharedUtil.extractSelectedOrgs(rawOrg, org);
    return org;
  }

  private getValueOfFormApplication(): string {
    return this.formPreselection.get(this.formName.APPLICATION).value;
  }

  private getValueOfFormCommande(): string {
    return this.formPreselection.get(this.formName.COMMANDE).value;
  }

  private getValueOfFormFichier(): string {
    return this.formPreselection.get(this.formName.FICHIER).value;
  }

  private updateTableData(data) {
    this.nombreFichierTotal = data.length;
    this.rowData = data.map(e => {
      e.codeRegion = this.allOrgReg.filter(n => n.code == e.codeOrg)[0].codeRegion;
      e.collapse = '';
      return e;
    });
    if (!this.nombreFichierTotal) {
      this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
    }
  }

  onChangeCommande(): void {
    this.subscriptions.push(
      this.formPreselection
        .get(this.formName.COMMANDE)
        .valueChanges.pipe(
          switchMap(comm => {
            const env = this.getValueOfFormEnvironnement();
            const org = this.getValueOfFormOrganisme();
            const app = this.getValueOfFormApplication();
            const toFind = !!env.length && !!org.length && !!app && !!comm;
            return toFind
              ? this.apiAdelaideDistributionService.getDistFicsByEnvOrgAppCom(initExemplaireByFilterQuery(env, org, app, comm, null))
              : of(null);
          })
        )
        .subscribe(data => {
          const ficSelected = this.getValueOfFormFichier();
          this.fichierOptions = [
            {
              value: '',
              columns: [
                { label: 'Fichier', value: '' },
                { label: 'Code Prd', value: '' },
                { label: 'Imprimé', value: '' },
              ],
            },
          ];
          if (data) {
            this.setFichierOptionsFromWS((data as any).data.getDistFicByEnvOrgAppComFromExemplaire);
            if (this.isIncludeInFichierOptions(ficSelected)) {
              this.formPreselection.get(this.formName.FICHIER).patchValue(ficSelected, { emitEvent: true });
            } else {
              this.formPreselection.get(this.formName.FICHIER).reset('', { emitEvent: true });
            }
          } else {
            this.formPreselection.get(this.formName.FICHIER).reset('', { emitEvent: true });
          }
        })
    );
  }

  setFichierOptionsFromWS(data) {
    this.fichierOptions = [
      {
        value: '',
        columns: [
          { label: 'Fichier', value: '' },
          { label: 'Code Prd', value: '' },
          { label: 'Imprimé', value: '' },
        ],
      },
      ...data.map(fichierInfo => ({
        value: fichierInfo.codfic,
        columns: [
          { label: 'Fichier', value: fichierInfo.codfic },
          { label: 'Code Prd', value: fichierInfo.codeProd },
          { label: 'Imprimé', value: fichierInfo.refImprime },
        ],
      })),
    ];
  }

  isIncludeInFichierOptions(ficSelected): boolean {
    return this.fichierOptions.find(opt => opt.value === ficSelected);
  }
}
