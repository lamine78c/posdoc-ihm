import { Component, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideRessourceService } from '@app/services/api-adelaide-ressource.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, IRowNode } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TableauRessourceService } from './service/tableau-ressource.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { GenerateFileService } from '@app/services/generate-file.service';
import { ressourceId } from '@app/models/ressourceId';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { concatMap } from 'rxjs/operators';
import { AddType } from '@app/models/enums/add-type';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { RESSOURCE_CALLBACK } from '@app/fullstack-components/utils/Constants';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-ressource',
  templateUrl: './ressource.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class RessourceComponent {
  gridOptions: GridOptions = {};
  overlayNoRowsTemplate: string;

  rowData: any = [];
  organismes = [];

  subscriptions: Subscription[] = [];

  nombreRessourceTotal;

  addType = AddType.INLINE_ROW;

  columnDefs: ColDef[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  form: FormGroup;

  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);
  organismeFiltreData$: BehaviorSubject<any> = new BehaviorSubject([]);
  environnementData$: BehaviorSubject<any> = new BehaviorSubject([]);
  applicationData$: BehaviorSubject<any> = new BehaviorSubject([]);
  gammeData$: BehaviorSubject<any> = new BehaviorSubject([]);
  siteData$: BehaviorSubject<any> = new BehaviorSubject([]);
  serveurData$: BehaviorSubject<any> = new BehaviorSubject([]);
  commandData$: BehaviorSubject<any> = new BehaviorSubject([]);
  compareData$: BehaviorSubject<any> = new BehaviorSubject([]);
  private readonly isSmallScreen = () => window.innerWidth <= 1566;

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.FABRICATION.RESSOURCES;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauRessourceService: TableauRessourceService,
    private apiAdelaideService: ApiAdelaideRessourceService,
    private noteService: NotesService,
    private generateFileService: GenerateFileService,
    private filterSharedDataService: FilterSharedDataService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    this.gridOptions.masterDetail = true;
    this.gridOptions.detailRowAutoHeight = false;
    this.gridOptions.detailRowHeight = this.isSmallScreen() ? 500 : 335;
    this.gridOptions.detailCellRenderer = 'detailsComponent';
    this.gridOptions.detailCellRendererParams = {
      serveurs: this.serveurData$,
      commandes: this.commandData$,
    };

    // Colonnes du tableau
    this.columnDefs = this.tableauRessourceService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauRessourceService.getOverlayNoRowsTemplate();

    /** configure les select du tableau */
    this.columnDefs.find(colDef => colDef.field === 'codeEnvironnement').cellRendererParams.selectData = this.environnementData$;
    this.columnDefs.find(colDef => colDef.field === 'codeApplication').cellRendererParams.selectData = this.applicationData$;
    this.columnDefs.find(colDef => colDef.field === 'codeOrganisme').cellRendererParams.selectData = this.organismeData$;
    this.columnDefs.find(colDef => colDef.field === 'codeOrganisme').floatingFilterComponentParams.selectData = this.organismeFiltreData$;
    this.columnDefs.find(colDef => colDef.field === 'codeGamme').cellRendererParams.selectData = this.gammeData$;
    this.columnDefs.find(colDef => colDef.field === 'codeSite').cellRendererParams.selectData = this.siteData$;
  }

  getCodeRegionByCodeOrg(codeOrg) {
    return this.organismes.filter(o => o.code == codeOrg)[0]?.codeRegion;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService
        .getAllRessources()
        .pipe(
          concatMap(data => {
            let rowsData: any = [];
            rowsData = (data as any).data.allRessources;
            this.organismes = (data as any).data.allOrganismes;

            if (!this.nombreRessourceTotal) this.nombreRessourceTotal = (data as any).data.allRessources.length;
            this.rowData = rowsData.map(e => {
              e.codeRegion = this.getCodeRegionByCodeOrg(e.codeOrganisme);
              e.collapse = '';
              return e;
            });
            // récuperer les données organismes pour le filtre du tableau
            this.organismeFiltreData$.next(this.organismes.sort((a, b) => a.code.localeCompare(b.code)));

            return this.apiAdelaideService.getAllSelectConfig();
          }),
          take(1)
        )
        .subscribe(data => {
        this.environnementData$.next(
          (data as any).data.allEnvironnementsInApplication.map(e => ({ text: e.value, value: e.value })).sort((a, b) => a.text.localeCompare(b.text))
        );
        this.gammeData$.next((data as any).data.allGammes.map(e => ({ text: e.value, value: e.value })).sort((a, b) => a.text.localeCompare(b.text)));
        this.siteData$.next(
          (data as any).data.allSitesCNP.map(e => ({ text: e.value, value: e.value })).sort((a, b) => a.text.localeCompare(b.text))
        );
        this.serveurData$.next(
          (data as any).data.allServers.map(e => ({ text: e.value, value: e.value, actif: e.actif })).sort((a, b) => a.text.localeCompare(b.text))
        );
        this.commandData$.next(
          (data as any).data.allParametresDistribution
            .map(e => ({ text: e.value, value: e.value, logiciel: e.logicielDistribution }))
            .sort((a, b) => a.text.localeCompare(b.text))
        );
        this.compareData$.next((data as any).data.allApplications.map(e => ({ codeApp: e.value, codeEnv: e.codeEnv, codeOrg: e.codeOrg })));
        this.gridApi.setGridOption('loading', false);
      })
    );

    this.subscriptions.push(
      this.filterSharedDataService.getData().subscribe(response => {
        if (response?.sujet && response?.node) {
          if (response.sujet === RESSOURCE_CALLBACK.FIND_APP_BY_ENV) {
            this.updateSelectApplicationByCodeEnv(response?.node);
            this.updateSelectOrganismeByCodeEnvCodeApp(response?.node);
          } else if (response.sujet === RESSOURCE_CALLBACK.FIND_ORG_BY_ENV_APP) {
            this.updateSelectOrganismeByCodeEnvCodeApp(response?.node);
          }
        }
      })
    );
  }

  // recharger la liste application
  updateSelectApplicationByCodeEnv(node) {
    const codeEnv = node.data.codeEnvironnement;
    const codeApp = node.data.codeApplication;
    // get liste application
    const codesApp = SharedUtil.getUniqueList(
      this.compareData$.getValue().filter(e => codeEnv === e.codeEnv),
      'codeApp'
    ).map(e => ({ text: e.codeApp, value: e.codeApp }));
    // si la valeur actuelle n'est pas présenté dans sa liste, vire-la
    if (codeApp && !codesApp.some(e => e.value === codeApp)) {
      node.setDataValue('codeApplication', '');
    }
    // envoie la liste
    this.applicationData$.next(codesApp);
  }

  // recharger la liste organisme
  updateSelectOrganismeByCodeEnvCodeApp(node) {
    const codeEnv = node.data.codeEnvironnement;
    const codeApp = node.data.codeApplication;
    const codeOrg = node.data.codeOrganisme;
    // get liste codes organisme
    const codesOrg = this.compareData$
      .getValue()
      .filter(e => e.codeApp === codeApp && e.codeEnv === codeEnv)
      .map(e => e.codeOrg);
    // get liste organisme
    const orgs = this.organismes.filter(e => codesOrg.includes(e.code));
    // si la valeur actuelle n'est pas présenté dans sa liste, vire-la
    if (codeOrg && !orgs.some(e => e.code === codeOrg)) {
      node.setDataValue('codeOrganisme', '');
    }
    // envoie la liste
    this.organismeData$.next(orgs);
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const ressource = [...editedRow][0][1];
    delete ressource.collapse;

    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (ressource.newRow) {
      // ajoute la validation manuelle pour les changements en détection
      if (ressource.codeApplication && ressource.codeOrganisme) {
        ressource.newRow = null;
        ressource.codeRegion = null;
        Object.keys(ressource)
          .filter(key => ressource[key] === null)
          .forEach(e => delete ressource[e]);

        this.subscriptions.push(
          this.apiAdelaideService.createRessource(ressource).subscribe({
            next: ({ data }) => {
              this.noteService.show({
                title: 'La ressource a été créée avec succès',
                classname: 'note-confirmation',
                category: ToastCategoryEnum.SUCCESS,
              });
              this.gridApi.forEachNode(node => {
                if (node.data.hasOwnProperty('newRow')) {
                  node.data.collapse = '';
                  node.data.codeRegion = this.getCodeRegionByCodeOrg(node.data.codeOrganisme);
                  delete node.data.newRow;
                }
              });
              this.asynchronousErrors$.next(errors);
              this.nombreRessourceTotal = SharedUtil.getNumberTotalRows(this.gridApi);
            },
            error: error => {
              ressource.newRow = true;
              const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
              this.setError(1, err, errors);
              this.asynchronousErrors$.next(errors);
            },
          })
        );
      }
    } else {
      ressource.codeRegion = null;
      Object.keys(ressource)
        .filter(key => ressource[key] === null)
        .forEach(e => delete ressource[e]);
      const r = Object.assign({}, ressource);
      delete r['collapse'];
      this.subscriptions.push(
        this.apiAdelaideService.updateRessource(r).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'La ressource a été mise à jour avec succès',
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

  onDeleteRow(event) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const deletesDTO: any[] = [];
    event.forEach(r => {
      deletesDTO.push(new ressourceId(r.codeEnvironnement, r.codeOrganisme, r.codeApplication, r.codeGamme, r.codeSite, r.codeRessource));
    });
    this.subscriptions.push(
      this.apiAdelaideService.deleteRessources(deletesDTO).subscribe({
        next: ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == 1 ? 'La ressource a été supprimée avec succès' : 'Les ressources ont été supprimées avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreRessourceTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
          this.setError(1, err, errors);
          this.asynchronousErrors$.next(errors);
        },
      })
    );
  }

  // /**
  //  * Ajoute les erreurs dans la map
  //  */
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
    const title = 'Liste des ressources';
    const fileServiceMap: { [key: string]: string } = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    let headers: string[] = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    let fields: string[] = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data: any[] = [];

    // Cette constante définit le champ de détails et le nom de l'en-tête
    const detailsFields: { header: string; field: string }[] = [
      { header: 'Désignation', field: 'libelle' },
      { header: 'Type', field: 'type' },
      { header: 'Type de fusion', field: 'typeFusion' },
      { header: 'Commande produit', field: 'referenceDistributionProduit' },
      { header: 'Serveur', field: 'codeServeur' },
      { header: 'Utilisateur', field: 'userId' },
      { header: 'File impression', field: 'fileImpression' },
      { header: 'Logiciel', field: 'logicielDistribution' },
      { header: 'Commande récap', field: 'referenceDistributionProduitRecap' },
      { header: 'Mot de passe', field: 'password' },
      { header: 'Information particulière', field: 'informationUtilisateur' },
      { header: 'Mise sous pli', field: 'miseSousPli' },
      { header: 'File bloquée', field: 'fileBloquee' },
      { header: 'Destinataire', field: 'destinataire' },
    ];

    // Dans le cas d'un export Excel, ce code ajoute les éléments de détails
    if (event.type == 'exportAsExcel') {
      fields = fields.concat(detailsFields.map((df: { header: string; field: string }) => df.field));
      headers = headers.concat(detailsFields.map((df: { header: string; field: string }) => df.header));
    }

    let nbrRows = 0;
    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      this.fillData(node, fields, data);
      // Dans le cas d'un export PDF, ce code ajoute les éléments de détails
      if (event.type == 'exportAsPDF') {
        data.push(SharedUtil.getDetailRow(detailsFields, node.data, headers));
      }
      nbrRows++;
    });
    this.generateFileService[fileServiceMap[event.type]](data, headers, title, {
      pageOrientation: 'landscape',
      nombreTotal: nbrRows,
      rowsPerPage: 12,
    });
  }

  private fillData(node: IRowNode, fields: string[], data: any[]): void {
    const fieldsTransformed = fields.map(field => {
      const fieldValue = node.data[field];
      if (fieldValue && fieldValue !== '') {
        return field === 'password' ? '***' : fieldValue;
      }
      return null;
    });

    data.push(fieldsTransformed);
  }
}
