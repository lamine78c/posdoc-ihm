import { Component, inject, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { AddType } from '@app/models/enums/add-type';
import { ApiAdelaideServicePosdocService } from '@app/services/api-adelaide/admin/service/api-adelaide-service.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { CreateUpdateServiceInput } from './model/service.interface';
import { TableauServicePosdocService } from './service/tableau-service.service';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class ServiceComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  rowData = [];
  nombreServicesTotal;
  columnDefs: (ColDef | ColGroupDef)[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  addType = AddType.INLINE_ROW;
  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);
  subscriptions: Subscription[] = [];

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.SERVICE;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauService = inject(TableauServicePosdocService);
  private readonly apiAdelaideService = inject(ApiAdelaideServicePosdocService);
  private readonly generateFileService = inject(GenerateFileService);
  private readonly noteService = inject(NotesService);

  constructor() {
    // nothing
  }

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    this.gridOptions.suppressDragLeaveHidesColumns = true;

    this.columnDefs = this.tableauService.getColumnDefs(this.isColSelectAll);
    this.overlayNoRowsTemplate = this.tableauService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.gridApi.setGridOption('loading', true);
    this.getAllServices();
  }

  getAllServices() {
    this.subscriptions.push(
      this.apiAdelaideService.getAllServices().pipe(take(1)).subscribe(data => {
        if (!this.nombreServicesTotal) this.nombreServicesTotal = data.data.findAllServices.length;
        this.rowData = data.data.findAllServices;
        this.gridApi.setGridOption('loading', false);
      })
    );
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    if ([...editedRow].length > 0) {
      const row = [...editedRow][0][1];
      if (!(row.url.startsWith('http://') || row.url.startsWith('https://'))) {
        const err: TableAsynchronousError = { isError: true, message: "L'Url doit commencer par http:// ou https://", id: null };
        this.setError(ONE, err, errors);
        this.asynchronousErrors$.next(errors);
      } else {
        const serviceInput: CreateUpdateServiceInput = {
          libelle: row.libelle,
          url: row.url,
        };
        if (row.newRow) {
          this.subscriptions.push(
            this.apiAdelaideService.createService(serviceInput).subscribe({
              next: data => {
                this.showSuccessMessage('Le service a été ajoutée avec succès');
                this.rowData = data.data.createServicePosdoc;
                this.asynchronousErrors$.next(errors);
                this.nombreServicesTotal = data.data.createServicePosdoc.length;
              },
              error: error => {
                const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
                this.setError(ONE, err, errors);
                this.asynchronousErrors$.next(errors);
              },
            })
          );
        } else {
          serviceInput.id = row.id;
          this.subscriptions.push(
            this.apiAdelaideService.updateService(serviceInput).subscribe({
              next: data => {
                this.showSuccessMessage('Le service a été mis à jour avec succès');
                this.rowData = data.data.updateServicePosdoc;
                this.asynchronousErrors$.next(errors);
              },
              error: error => {
                const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
                this.setError(ONE, err, errors);
                this.asynchronousErrors$.next(errors);
              },
            })
          );
        }
      }
    }
  }

  onDeleteRow(event) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    this.subscriptions.push(
      this.apiAdelaideService.deleteServices(event.map(e => String(e.id))).subscribe({
        next: () => {
          this.gridApi.applyTransaction({ remove: event });
          this.gridApi.redrawRows();
          this.showSuccessMessage(event.length == ONE ? 'Le service a été supprimé avec succès' : 'Les services ont été supprimés avec succès');
          this.nombreServicesTotal = SharedUtil.getNumberTotalRows(this.gridApi);
        },
        error: error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
          this.setError(ONE, err, errors);
          this.asynchronousErrors$.next(errors);
        },
      })
    );
  }

  setError(uniqueRowKey: number, error: TableAsynchronousError, errors: Map<number, TableAsynchronousError[]>): void {
    if (errors.has(uniqueRowKey)) {
      errors.get(uniqueRowKey).push(error);
    } else {
      errors.set(uniqueRowKey, [error]);
    }
  }

  export(event: any) {
    const title = 'Liste des services';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data = [];
    this.gridApi.forEachNodeAfterFilterAndSort(node =>
      data.push(
        fields.map(field => {
          if (field === 'createdAt' || field === 'updatedAt') {
            return SharedUtil.formatDateToDDMMYYYY(node.data[field]);
          } else {
            return node.data[field] !== '' ? node.data[field] : null;
          }
        })
      )
    );
    this.generateFileService[fileServiceMap[event.type]](data, headers, title);
  }

  showSuccessMessage(message: string) {
    this.noteService.show({
      title: message,
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  }
}
