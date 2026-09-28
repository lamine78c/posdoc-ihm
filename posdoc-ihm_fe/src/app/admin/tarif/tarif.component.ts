import { Component, inject, OnInit } from '@angular/core';
import { TarifDetailsComponent } from '@app/admin/tarif/tarif-details/tarif-details.component';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { AddType } from '@app/models/enums/add-type';
import { ApiAdelaideTarifService } from '@app/services/api-adelaide-tarif.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, of, Subscription, take } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TableauTarifService } from './service/tableau-tarif.service';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-tarif',
  templateUrl: './tarif.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class TarifComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  nombreTarifTotal;

  addType = AddType.INLINE_ROW;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);
  subscriptions: Subscription[] = [];

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.TARPOS;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private readonly tableauTarifService: TableauTarifService,
    private readonly apiAdelaideService: ApiAdelaideTarifService,
    private readonly generateFileService: GenerateFileService,
    private readonly noteService: NotesService
  ) {}

  ngOnInit(): void {
    // Colonnes du tableau
    this.columnDefs = this.tableauTarifService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauTarifService.getOverlayNoRowsTemplate();

    this.initGridOptions();
  }

  initGridOptions(): void {
    // Configuration générale du tableau
    this.gridOptions = {
      ...this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll),
    };
    this.gridOptions.masterDetail = true;
    this.gridOptions.detailRowAutoHeight = false;
    this.gridOptions.detailRowHeight = 350;

    this.gridOptions.detailCellRenderer = TarifDetailsComponent;
    this.gridOptions.detailCellRendererParams = {
      ...this.tableauTarifService.getDetailColumnDefs(this.isColSelectAll),
    };
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.getData();
  }

  getData() {
    this.subscriptions.push(
      this.apiAdelaideService
        .getAllTarpos()
        .pipe(
          switchMap(result => {
            return of(result);
          }),
          take(1)
        )
        .subscribe(tarifs => {
          this.nombreTarifTotal ??= tarifs.data.allTarpos.length;
          const rowsData: any = tarifs.data.allTarpos;
          this.rowData = rowsData.map(elt => {
            elt.collapse = '';
            elt.detail = elt.tarifs !== null ? elt.tarifs : [];
            delete elt.tarifs;
            return elt;
          });
          this.gridApi.setGridOption('loading', false);
        })
    );
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const tarif = this.prepareTarif(editedRow);

    if (tarif.newRow) {
      this.handleCreateTarif(tarif, errors);
    } else {
      this.handleUpdateTarif(tarif, errors);
    }
  }

  private prepareTarif(editedRow: Map<number, any>): any {
    const raw = Object.assign({}, [...editedRow][ZERO][ONE]);
    delete raw['collapse'];
    delete raw['detail'];
    Object.keys(raw)
      .filter(key => raw[key] === null)
      .forEach(key => delete raw[key]);
    return raw;
  }

  private handleCreateTarif(tarif: any, errors: Map<number, TableAsynchronousError[]>) {
    delete tarif.newRow;

    const obs$ = this.apiAdelaideService.createTarpos(tarif).pipe(switchMap(result => of(result)));

    this.subscriptions.push(
      obs$.subscribe({
        next: ({ data }) => {
          this.noteService.show({
            title: `Le tarif "${(data as any).createTarpos.type}" a été créé avec succès`,
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });

          this.resetNewRows();
          this.asynchronousErrors$.next(errors);
          this.nombreTarifTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {
          tarif.newRow = true;
          this.setError(ONE, this.buildError(error), errors);
          this.asynchronousErrors$.next(errors);
        },
      })
    );
  }

  private handleUpdateTarif(tarif: any, errors: Map<number, TableAsynchronousError[]>) {
    const obs$ = this.apiAdelaideService.updateTarpos(tarif).pipe(switchMap(result => of(result)));

    this.subscriptions.push(
      obs$.subscribe({
        next: ({ data }) => {
          this.noteService.show({
            title: `Le tarif "${(data as any).updateTarpos.type}" a été mis à jour avec succès`,
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.asynchronousErrors$.next(errors);
        },
        error: error => {
          this.setError(ONE, this.buildError(error), errors);
          this.asynchronousErrors$.next(errors);
        },
      })
    );
  }

  private resetNewRows() {
    this.gridApi.forEachNode(node => {
      if (node.data.hasOwnProperty('newRow')) {
        node.data.collapse = '';
        node.data.detail = [];
        delete node.data.newRow;
      }
    });
  }

  private buildError(error: any): TableAsynchronousError {
    return {
      isError: true,
      message: error?.graphQLErrors?.[ZERO]?.message ?? 'Erreur inconnue',
      id: null,
    };
  }

  onDeleteRow(event: any[]) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    const deleteTarifs: string[] = event.map(e => e.type);

    this.subscriptions.push(
      this.apiAdelaideService
        .deleteTarpos(deleteTarifs)
        .pipe(
          switchMap(result => {
            return of(result);
          })
        )
        .subscribe({
          next: () => {
            this.gridApi.applyTransaction({ remove: event });
            // Redraw les lignes afin de prendre en compte la ligne supprimée
            this.gridApi.redrawRows();
            this.noteService.show({
              title: event.length == ONE ? 'Le tarif a été supprimé avec succès' : 'Les tarifs ont été supprimés avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.nombreTarifTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          },
          error: error => {
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(ONE, err, errors);
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

  export(event: any): void {
    const title = 'Liste des tarifs';

    const { headers, headersDetail, fields, fieldsDetail, emptyRow, emptyDetailRow } = this.prepareMetadata();

    const { dataExcel, dataPDF, totalRows } = this.buildExportData(fields, fieldsDetail, emptyRow, emptyDetailRow);

    this.handleExport(event.type, [...headers, ...headersDetail], title, dataExcel, dataPDF, totalRows);
  }

  private prepareMetadata() {
    const getValidColumns = (columns: (ColDef | ColGroupDef)[]) => columns.filter((col: ColDef) => !!col.field && !!col.headerName);

    const baseColumns = getValidColumns(this.gridApi.getColumnDefs());
    const detailColumns = getValidColumns(this.tableauTarifService.getDetailColumnDefs(this.isColSelectAll));

    const headers = baseColumns.map(col => col.headerName);
    const headersDetail = detailColumns.map(col => col.headerName);
    const fields = baseColumns.map((col: ColDef) => col.field);
    const fieldsDetail = detailColumns.map((col: ColDef) => col.field);

    const emptyRow = fields.map(() => null);
    const emptyDetailRow = fieldsDetail.map(() => null);

    return { headers, headersDetail, fields, fieldsDetail, emptyRow, emptyDetailRow };
  }

  private buildExportData(fields: string[], fieldsDetail: string[], emptyRow: any[], emptyDetailRow: any[]) {
    const dataExcel: any[] = [];
    const dataPDF: any[] = [];
    let totalRows = 0;

    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      const rowData = fields.map(field => node.data?.[field] || null);
      const detailList = node.data?.detail ?? [];

      if (Array.isArray(detailList) && detailList.length > ZERO) {
        let isFirstPDFLine = true;

        detailList.forEach(detail => {
          const detailData = fieldsDetail.map(field => detail?.[field] ?? null);
          dataExcel.push([...rowData, ...detailData]);

          if (isFirstPDFLine) {
            dataPDF.push([...rowData, ...detailData]);
            isFirstPDFLine = false;
          } else {
            dataPDF.push([...emptyRow, ...detailData]);
          }
        });
      } else {
        const row = [...rowData, ...emptyDetailRow];
        dataExcel.push(row);
        dataPDF.push(row);
      }
      totalRows++;
    });
    return { dataExcel, dataPDF, totalRows };
  }

  private handleExport(type: string, headers: any[], title: string, dataExcel: any[], dataPDF: any[], totalRows: number) {
    const exportOptions = { nombreTotal: totalRows };

    switch (type) {
      case 'exportAsPDF':
        this.generateFileService.generatePDFFile(dataPDF, headers, title, { ...exportOptions, pageOrientation: 'landscape', withDetail: true });
        break;
      case 'exportAsExcel':
        this.generateFileService.generateExcelFile(dataExcel, headers, title, exportOptions);
        break;
      default:
        console.warn(`Unsupported export type: ${type}`);
    }
  }
}
