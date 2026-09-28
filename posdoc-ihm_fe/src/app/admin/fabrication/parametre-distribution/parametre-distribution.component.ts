import { Component, inject, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideParamDistriService } from '@app/services/api-adelaide-param-distri.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TableauParametreDistributionService } from './service/tableau-parametre-distribution.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { AddType } from '@app/models/enums/add-type';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-parametre-distribution',
  templateUrl: './parametre-distribution.component.html',
  styleUrls: ['./parametre-distribution.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ParametreDistributionComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  subscriptions: Subscription[] = [];

  nombreParamDitributionTotal;

  addType = AddType.INLINE_ROW;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.FABRICATION.PARAMETRES_DISCRIBUTIONS;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauParamDistriService: TableauParametreDistributionService,
    private apiAdelaideService: ApiAdelaideParamDistriService,
    private generateFileService: GenerateFileService,
    private noteService: NotesService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);

    this.gridOptions.masterDetail = true;
    this.gridOptions.detailRowAutoHeight = false;
    this.gridOptions.detailRowHeight = 122;
    this.gridOptions.detailCellRenderer = 'detailsParamDistrComponent';
    this.gridOptions.detailCellRendererParams = {};

    // Colonnes du tableau
    this.columnDefs = this.tableauParamDistriService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauParamDistriService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService.getAllParamDistri().pipe(take(1)).subscribe(data => {
        if (!this.nombreParamDitributionTotal) this.nombreParamDitributionTotal = (data as any).data.allParametresDistribution.length;
        let parametresDistribution = (data as any).data.allParametresDistribution;
        this.rowData = parametresDistribution.map(parametre => {
          parametre.collapse = '';
          return parametre;
        });
        this.gridApi.setGridOption('loading', false);
      })
    );
  }

  onDeleteRow(event) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    this.subscriptions.push(
      this.apiAdelaideService.deleteParamDistris(event.map(e => e.reference)).subscribe({
        next: ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          this.gridApi.redrawRows();
          this.noteService.show({
            title:
              event.length == 1
                ? 'Le paramètre de distribution a été supprimé avec succès'
                : 'Les paramètres de distribution ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreParamDitributionTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
          this.setError(1, err, errors);
          this.asynchronousErrors$.next(errors);
        },
      })
    );
  }

  onSaveEdition(editedRow: any[]) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    let paramDistri = [...editedRow][0][1];
    delete paramDistri.collapse;

    if (paramDistri.newRow) {
      paramDistri.newRow = null;
      Object.keys(paramDistri)
        .filter(key => paramDistri[key] === null)
        .forEach(e => delete paramDistri[e]);
      this.subscriptions.push(
        this.apiAdelaideService.createParamDistri(paramDistri).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'Le paramètre de distribution ' + (data as any).createParametreDistribution.reference + ' a été créé avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.gridApi.forEachNode(node => {
              if (node.data.hasOwnProperty('newRow')) {
                node.data.collapse = '';
                delete node.data.newRow;
              }
            });
            this.asynchronousErrors$.next(errors);
            this.nombreParamDitributionTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          },
          error: error => {
            paramDistri.newRow = true;
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(1, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    } else {
      Object.keys(paramDistri)
        .filter(key => paramDistri[key] === null)
        .forEach(e => delete paramDistri[e]);
      let r = Object.assign({}, paramDistri);
      delete r['collapse'];
      this.subscriptions.push(
        this.apiAdelaideService.updateParamDistri(r).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'Le paramètre de distribution ' + (data as any).updateParametreDistribution.reference + ' a été mis à jour avec succès',
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
    const title = 'Liste des paramètres de distribution';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => data.push(fields.map(field => (node.data[field] !== '' ? node.data[field] : null))));

    this.generateFileService[fileServiceMap[event.type]](data, headers, title);
  }
}
