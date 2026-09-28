import { Component, inject, OnInit } from '@angular/core';
import { ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideActionService } from '@app/services/api-adelaide-action.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { ONE, ZERO } from '@app/shared/utils/Constants';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { SearchHistoryByQuery } from './model/search-history-by-query';
import { TableauActionService } from './service/tableau-action.service';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class ActionComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData: any = [];

  nombreActionTotal;

  columnDefs: (ColDef | ColGroupDef)[];

  gridApi: GridApi;
  gridColumnApi: GridApi;

  toastCategoryEnum: typeof ToastCategoryEnum = ToastCategoryEnum;

  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  tableauActionService = inject(TableauActionService);
  apiAdelaideService = inject(ApiAdelaideActionService);
  generateFileService = inject(GenerateFileService);

  subscriptions: Subscription[] = [];

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
    this.columnDefs = this.tableauActionService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauActionService.getOverlayNoRowsTemplate();
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

  lister($event: SearchHistoryByQuery) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    this.subscriptions.push(
      this.apiAdelaideService.searchHistoryByQuery($event).pipe(take(1)).subscribe({
        next: data => {
          AgGridUtil.resetFilterAndColumnSort(this.gridApi);
          this.rowData = data.data.findHistoryByQuery;
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
