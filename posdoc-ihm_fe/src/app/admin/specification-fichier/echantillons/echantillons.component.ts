import { Component, inject, OnInit } from '@angular/core';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideEchantillonService } from '@app/services/api-adelaide-echantillon.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { TableauEchantillonService } from './service/tableau-echantillon.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { AddType } from '@app/models/enums/add-type';
import { PermissionService } from '@app/services/permission/permission.service';
import { ONE, PARECH_TYPECH_LOT, PARECH_TYPECH_PAGE, ZERO } from '@app/shared/utils/Constants';
import { Echantillon } from '@app/models/echantillon';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';

@Component({
  selector: 'app-echantillons',
  templateUrl: './echantillons.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class EchantillonsComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  rowData = [];
  nombreEchantillonTotal;
  addType = AddType.INLINE_ROW;
  columnDefs: (ColDef | ColGroupDef)[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);
  subscriptions: Subscription[] = [];

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ECHANTILLONS;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauEchantillonService = inject(TableauEchantillonService);
  private readonly apiAdelaideService = inject(ApiAdelaideEchantillonService);
  private readonly generateFileService = inject(GenerateFileService);
  private readonly noteService = inject(NotesService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    this.columnDefs = this.tableauEchantillonService.getColumnDefs(this.isColSelectAll);
    this.overlayNoRowsTemplate = this.tableauEchantillonService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.gridApi.setGridOption('loading', true);
    this.subscriptions.push(
      this.apiAdelaideService.getAllEchantillons().pipe(take(1)).subscribe((echantillons: any) => {
        if (!this.nombreEchantillonTotal) this.nombreEchantillonTotal = echantillons.data.allParametresEchantillon.length;
        this.rowData = echantillons.data.allParametresEchantillon;
        this.gridApi.setGridOption('loading', false);
      })
    );
  }

  setEchantillonInterface(data): Echantillon {
    if (data.type === PARECH_TYPECH_LOT && data.nombreLots && data.nombrePages) {
      return {
        reference: data.reference,
        type: data.type,
        nombreLots: data.nombreLots,
        nombrePages: data.nombrePages,
        random: data.random,
        formule: '',
      };
    } else if (data.type === PARECH_TYPECH_PAGE && data.formule) {
      return {
        reference: data.reference,
        type: data.type,
        nombreLots: null,
        nombrePages: null,
        random: data.random,
        formule: data.formule,
      };
    }
    return null;
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    if ([...editedRow].length > 0) {
      const row = [...editedRow][ZERO][ONE];
      const createUpdatePayload = this.setEchantillonInterface([...editedRow][ZERO][ONE]);
      if (!createUpdatePayload) {
        return;
      }
      if (row.newRow) {
        this.subscriptions.push(
          this.apiAdelaideService.createParametreEchantillon(createUpdatePayload).subscribe({
            next: ({ data }) => {
              this.noteService.show({
                title: 'L\'échantillon "' + data.createParametreEchantillon.reference + '" a été créé avec succès',
                classname: 'note-confirmation',
                category: ToastCategoryEnum.SUCCESS,
              });
              this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);
              this.asynchronousErrors$.next(errors);
              this.nombreEchantillonTotal = SharedUtil.getNumberTotalRows(this.gridApi);
            },
            error: error => {
              const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
              this.setError(1, err, errors);
              this.asynchronousErrors$.next(errors);
            },
          })
        );
      } else {
        this.subscriptions.push(
          this.apiAdelaideService.updateParametreEchantillon(createUpdatePayload).subscribe({
            next: ({ data }) => {
              this.noteService.show({
                title: 'L\'échantillon "' + data.updateParametreEchantillon.reference + '" a été mis à jour avec succès',
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

  onDeleteRow(event) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    this.subscriptions.push(
      this.apiAdelaideService.deleteEchantillons(event.map(e => e.reference)).subscribe({
        next: () => {
          this.gridApi.applyTransaction({ remove: event });
          this.gridApi.redrawRows();
          this.noteService.show({
            title: event.length == 1 ? "L'échantillon a été supprimé avec succès" : 'Les échantillons ont été supprimés avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
          this.nombreEchantillonTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
          this.setError(1, err, errors);
          this.asynchronousErrors$.next(errors);
        },
      })
    );
  }

  export(event: any) {
    const title = 'Liste des échantillons';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data = [];
    this.gridApi.forEachNodeAfterFilterAndSort(node => data.push(fields.map(field => (node.data[field] !== '' ? node.data[field] : null))));
    this.generateFileService[fileServiceMap[event.type]](data, headers, title, { columnDefs: columnDefs });
  }

  setError(uniqueRowKey: number, error: TableAsynchronousError, errors: Map<number, TableAsynchronousError[]>): void {
    if (errors.has(uniqueRowKey)) {
      errors.get(uniqueRowKey).push(error);
    } else {
      errors.set(uniqueRowKey, [error]);
    }
  }
}
