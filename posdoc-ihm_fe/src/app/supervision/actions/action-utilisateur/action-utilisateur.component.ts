import { Component, inject } from '@angular/core';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { ApiAdelaideActionUtilisateurService } from './service/api-adelaide-action-utilisateur.service';
import { TableauActionUtilisateurService } from './service/tableau-action-utilisateur.service';
import { SearchActionUtilisateurByQuery, SearchActionUtilisateurByQueryResult } from './model/search-action-utilisateur-by-query';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';

@Component({
  selector: 'app-action-utilisateur',
  templateUrl: './action-utilisateur.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class ActionUtilisateurComponent {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData: any = [];

  nombreActionTotal;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  tableauActionUtilisateurService = inject(TableauActionUtilisateurService);
  apiAdelaideService = inject(ApiAdelaideActionUtilisateurService);
  generateFileService = inject(GenerateFileService);

  subscriptions: Subscription[] = [];

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
    this.columnDefs = this.tableauActionUtilisateurService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauActionUtilisateurService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
  }

  setError(uniqueRowKey: number, error: TableAsynchronousError, errors: Map<number, TableAsynchronousError[]>): void {
    if (errors.has(uniqueRowKey)) {
      errors.get(uniqueRowKey).push(error);
    } else {
      errors.set(uniqueRowKey, [error]);
    }
  }

  lister($event: SearchActionUtilisateurByQuery) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    this.subscriptions.push(
      this.apiAdelaideService.searchActionUtilisateurByQuery($event).pipe(take(1)).subscribe({
        next: data => {
          AgGridUtil.resetFilterAndColumnSort(this.gridApi);
          this.rowData = data.data.findUtiLogByQuery.map((row: SearchActionUtilisateurByQueryResult) => {
            row.ko = !row.result;
            return row;
          });
          this.nombreActionTotal = this.rowData.length;
          if (!this.nombreActionTotal) {
            this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
          }
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
