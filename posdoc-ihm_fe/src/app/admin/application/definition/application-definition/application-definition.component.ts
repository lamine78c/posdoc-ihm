import { Component, inject, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideApplicationService } from '@app/services/api-adelaide-application.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { GridOptions, ColDef, GridApi, GridReadyEvent, ColGroupDef } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TableauApplicationDefinitionService } from './service/tableau-application-definition.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { Application } from '@app/models/application';
import { concatMap } from 'rxjs/operators';
import { AddType } from '@app/models/enums/add-type';
import { PermissionService } from '@app/services/permission/permission.service';

export class DeleteApplicationInput {
  codeEnvironnement: string;
  codeOrganisation: string;
  code: string;
}

@Component({
  selector: 'app-application-definition',
  templateUrl: './application-definition.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class ApplicationDefinitionComponent implements OnInit {
  applications: Application[] = [];

  subscriptions: Subscription[] = [];

  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  columnDefs: ColDef[];
  rowData: any = [];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  nombreApplisTotal;
  params: any;
  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  environnementData$: BehaviorSubject<any> = new BehaviorSubject([]);
  applicationData$: BehaviorSubject<any> = new BehaviorSubject([]);
  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);

  addType = AddType.INLINE_ROW;

  codeEnvironnement: string;
  codesOrganismes: string[] = [];
  organismes: any = [];

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.APPLICATIONS;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauImbriqueService: TableauApplicationDefinitionService,
    private apiAdelaideApplicationService: ApiAdelaideApplicationService,
    private noteService: NotesService,
    private generateFileService: GenerateFileService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    // // Colonnes du tableau
    this.columnDefs = this.tableauImbriqueService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauImbriqueService.getOverlayNoRowsTemplate();

    this.codeEnvironnement = null;
    this.codesOrganismes = null;

    this.columnDefs.find(colDef => colDef.field === 'codeEnvironnement').cellRendererParams.selectData = this.environnementData$;
    this.columnDefs.find(colDef => colDef.field === 'codeOrganisation').cellRendererParams.selectData = this.organismeData$;
    this.columnDefs.find(colDef => colDef.field === 'codeOrganisation').floatingFilterComponentParams.selectData = this.organismeData$;
    this.columnDefs.find(colDef => colDef.field === 'code').cellRendererParams.selectData = this.applicationData$;
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideApplicationService
        .getAllApplications()
        .pipe(
          concatMap(data => {
            if (!this.nombreApplisTotal) {
              this.nombreApplisTotal = (data as any).data.allApplications.length;
            }
            let rowsData: any = [];
            rowsData = (data as any).data.allApplications;
            const organWithRegion = (data as any).data.allOrganismes;
            this.rowData = rowsData.map(e => {
              e.codeRegion = organWithRegion.filter(n => n.code == e.codeOrganisation)[0].codeRegion;
              return e;
            });
            // récuperer les données application pour le select d'ajout
            this.applicationData$.next([...new Set(rowsData.map(e => e.code).sort((a, b) => a.localeCompare(b)))]);
            // récuperer les données organismes pour le select d'ajout et pour le filtre du tableau
            this.organismeData$.next(
              organWithRegion
                //.map(o => ({value: o.code, text: o.libelle, codeRegion: o.codeRegion}))
                .sort((a, b) => a.code.localeCompare(b.code))
            );
            // todo: code a analysé => j'ai ajouté cette ligne car 'this.organismes' est utilisé dans la fonction 'getCodeRegionByCodeOrg'
            this.organismes = organWithRegion
              //.map(o => ({value: o.code, text: o.libelle, codeRegion: o.codeRegion}))
              .sort((a, b) => a.code.localeCompare(b.code));

            return this.apiAdelaideApplicationService.getConfigData();
          }),
          take(1)
        )
        .subscribe(data => {
          this.environnementData$.next((data as any).data.allEnvironnements.map(e => e.code));
          this.gridApi.setGridOption('loading', false);
        })
    );
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    const application = [...editedRow][0][1];

    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (application.newRow) {
      application.newRow = null;

      const createDTO: Application = {} as Application;
      createDTO.code = application.code;
      createDTO.libelle = application.libelle;
      createDTO.codeOrganisation = application.codeOrganisation;
      createDTO.codeEnvironnement = application.codeEnvironnement;
      createDTO.codeSystem = application.codeSystem;
      createDTO.codeGroupe = null;
      createDTO.lotNumber = null;
      createDTO.typeRefection = 'INITIAUX';

      this.subscriptions.push(
        this.apiAdelaideApplicationService.createApplication(createDTO).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title:
                'L\'application "' +
                (data as any).createApplication.codeEnvironnement +
                '-' +
                (data as any).createApplication.codeOrganisation +
                '-' +
                (data as any).createApplication.code +
                '" a été ajoutée avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });

            this.gridApi.forEachNode(node => {
              if (node.data.hasOwnProperty('newRow')) {
                delete node.data.newRow;
                node.data.codeRegion = SharedUtil.getCodeRegionByCodeOrg(this.organismes, node.data.codeOrganisation);
              }
            });

            this.asynchronousErrors$.next(errors);
            this.nombreApplisTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          },
          error: error => {
            application.newRow = true;
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(1, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    } else {
      const updateDTO: Application = {} as Application;
      updateDTO.code = application.code;
      updateDTO.libelle = application.libelle;
      updateDTO.codeOrganisation = application.codeOrganisation;
      updateDTO.codeEnvironnement = application.codeEnvironnement;
      updateDTO.codeSystem = application.codeSystem;
      updateDTO.codeGroupe = null;
      updateDTO.lotNumber = null;
      updateDTO.typeRefection = 'INITIAUX';

      this.subscriptions.push(
        this.apiAdelaideApplicationService.updateApplication(updateDTO).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'L\'application "' + updateDTO.codeEnvironnement + '-' + updateDTO.codeOrganisation + '-' + updateDTO.code + '" a été mise à jour',
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
    const deletesDTO: any[] = [];
    event.forEach(app => {
      const applicationId: DeleteApplicationInput = new DeleteApplicationInput();
      applicationId.codeEnvironnement = app.codeEnvironnement;
      applicationId.codeOrganisation = app.codeOrganisation;
      applicationId.code = app.code;

      deletesDTO.push(applicationId);
    });
    this.subscriptions.push(
      this.apiAdelaideApplicationService.deleteApplications(deletesDTO).subscribe({
        next: ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == 1 ? "L'application a été supprimée avec succès" : 'Les applications ont été supprimées avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreApplisTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {
          this.noteService.show({
            title:
              event.length == 1
                ? "Impossible de supprimer l'application, elle est liée à une commande "
                : 'Impossible de supprimer les applications, elles sont liées à des commandes',
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

  export(event: any) {
    const title = 'Liste des applications';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data: any[] = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => data.push(fields.map(field => (node.data[field] !== '' ? node.data[field] : null))));

    this.generateFileService[fileServiceMap[event.type]](data, headers, title);
  }
}
