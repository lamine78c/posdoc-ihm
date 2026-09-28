import { Component, inject, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideFormatService } from '@app/services/api-adelaide-format.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TableauFormatService } from './service/tableau-format.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { AddType } from '@app/models/enums/add-type';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-formats',
  templateUrl: './formats.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class FormatsComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  subscriptions: Subscription[] = [];

  nombreTotal;

  addType = AddType.INLINE_ROW;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.FORMATS;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauFotmatService: TableauFormatService,
    private apiAdelaideService: ApiAdelaideFormatService,
    private generateFileService: GenerateFileService,
    private noteService: NotesService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    // Colonnes du tableau
    this.columnDefs = this.tableauFotmatService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauFotmatService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService.getFormats().pipe(take(1)).subscribe(data => {
        if (!this.nombreTotal) this.nombreTotal = (data as any).data.allFormats.length;
        //params.successCallback((data as any).data.parametresEchantillon.elements, (data as any).data.parametresEchantillon.totalElement);
        this.rowData = (data as any).data.allFormats;
        this.gridApi.setGridOption('loading', false);
      })
    );
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    let format = [...editedRow][0][1];

    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (format.newRow) {
      format.newRow = null;
      Object.keys(format)
        .filter(key => format[key] === null)
        .forEach(e => delete format[e]);

      this.subscriptions.push(
        this.apiAdelaideService.createFormat(format).subscribe({
        next: ({ data }) => {
          this.noteService.show({
            title: 'Le format "' + (data as any).createFormat.code + '" a été créé avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);
          this.nombreTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          this.asynchronousErrors$.next(errors);
        },
        error: error => {
          format.newRow = true;
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
          this.setError(1, err, errors);
          this.asynchronousErrors$.next(errors);
        },
        })
      );
    } else {
      Object.keys(format)
        .filter(key => format[key] === null)
        .forEach(e => delete format[e]);

      this.subscriptions.push(
        this.apiAdelaideService.updateFormat(format).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'Le format "' + (data as any).updateFormat.code + '" a été mis à jour avec succès',
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

    this.subscriptions.push(
      this.apiAdelaideService.deleteFormats(event.map(e => e.code)).subscribe({
        next: ({ data }) => {
          this.gridApi.applyTransaction({ remove: event });
          // Redraw les lignes afin de prendre en compte la ligne supprimée
          this.gridApi.redrawRows();
          this.nombreTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          this.noteService.show({
            title: event.length == 1 ? 'Le format a été supprimé avec succès' : 'Les formats ont été supprimés avec succès',
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

  exportAsPDF() {
    alert('export as pdf');
  }
  export(event: any) {
    const title = 'Liste des formats';
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
