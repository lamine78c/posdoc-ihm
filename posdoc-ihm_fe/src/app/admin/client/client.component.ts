import { Component, inject, OnInit } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { AddType } from '@app/models/enums/add-type';
import { ApiAdelaideClientService } from '@app/services/api-adelaide-client.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AUTH, KEY_AJOUTER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TableauClientService } from './service/tableau-client.service';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class ClientComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData = [];

  subscriptions: Subscription[] = [];

  nombreClientTotal;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  addType = AddType.INLINE_ROW;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  private readonly servicePerm = inject(PermissionService);
  private readonly auth = AUTH.ADMINISTRATION.CLIENTS;
  readonly canAddPermPosition = this.auth[KEY_AJOUTER_AUTH];
  readonly canRemovePermPosition = this.auth[KEY_SUPPRIMER_AUTH];
  private readonly isColSelectAll = this.servicePerm.hasActionDeMasse(this.auth);

  constructor(
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauClientService: TableauClientService,
    private apiAdelaideService: ApiAdelaideClientService,
    private generateFileService: GenerateFileService,
    private noteService: NotesService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration(this.isColSelectAll);
    this.gridOptions.suppressDragLeaveHidesColumns = true;

    // Colonnes du tableau
    this.columnDefs = this.tableauClientService.getColumnDefs(this.isColSelectAll);
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauClientService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    // Show spinner
    this.gridApi.setGridOption('loading', true);

    this.subscriptions.push(
      this.apiAdelaideService.getAllClient().pipe(take(1)).subscribe(data => {
        if (!this.nombreClientTotal) this.nombreClientTotal = (data as any).data.allClients.length;
        this.rowData = (data as any).data.allClients;
        this.gridApi.setGridOption('loading', false);
      })
    );
  }

  onSaveEdition(editedRow: Map<number, any>) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();

    let client = [...editedRow][0][1];

    // si nesRow, creation d'une nouvelle ligne, si non mise a jours
    if (client.newRow) {
      client.newRow = null;
      Object.keys(client)
        .filter(key => client[key] === null)
        .forEach(e => delete client[e]);

      this.subscriptions.push(
        this.apiAdelaideService.createClient(client).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'Le client "' + (data as any).createClient.code + '" a été créé avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
            this.gridApi.forEachNode(node => node.data.hasOwnProperty('newRow') && delete node.data.newRow);
            this.asynchronousErrors$.next(errors);
            this.nombreClientTotal = SharedUtil.getNumberTotalRows(this.gridApi);
          },
          error: error => {
            client.newRow = true;
            const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[0].message, id: null };
            this.setError(1, err, errors);
            this.asynchronousErrors$.next(errors);
          },
        })
      );
    } else {
      Object.keys(client)
        .filter(key => client[key] === null)
        .forEach(e => delete client[e]);

      this.subscriptions.push(
        this.apiAdelaideService.updateClient(client).subscribe({
          next: ({ data }) => {
            this.noteService.show({
              title: 'Le client "' + (data as any).updateClient.code + '" a été mis à jour avec succès',
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
    this.subscriptions.push(
      this.apiAdelaideService.deleteClients(event.map(e => e.code)).subscribe(({ data }) => {
        this.gridApi.applyTransaction({ remove: event });
        // Redraw les lignes afin de prendre en compte la ligne supprimée
        this.gridApi.redrawRows();
        this.noteService.show({
          title: event.length == 1 ? 'Le client a été supprimé avec succès' : 'Les clients ont été supprimés avec succès',
          classname: 'note-confirmation',
          category: ToastCategoryEnum.SUCCESS,
        });
        this.nombreClientTotal = SharedUtil.getNumberTotalRows(this.gridApi);
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
    const title = 'Liste des clients';
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
