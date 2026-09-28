import { Component, inject, OnInit } from '@angular/core';
import { TableAsynchronousError } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { getEtatPliText, isGammeSuivi } from './model/etat-pli';
import { SearchPliByQuery } from './model/search-pli';
import { ApiAdelaideSuiviAuPliService } from './service/api-adelaide-suivi-au-pli.service';
import { TableauSuiviAuPliService } from './service/tableau-suivi-au-pli.service';
import { getFullAdresse } from './model/adresse-pli';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { FIVE, ONE, SIX, THREE, TIRET, TWO, UNDERSCORE, ZERO } from '@app/shared/utils/Constants';
import { DatePipe } from '@angular/common';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';

@Component({
  selector: 'app-suivi-au-pli',
  templateUrl: './suivi-au-pli.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class SuiviAuPliComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  gridApi: GridApi;
  nombreTotal: number;
  columnDefs: ColDef[];
  rowData = [];
  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);
  organismes;
  subscriptions: Subscription[] = [];
  asynchronousErrors$: BehaviorSubject<Map<number, TableAsynchronousError[]>> = new BehaviorSubject(null);

  tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  tableauSuiviAuPliService = inject(TableauSuiviAuPliService);
  generateFileService = inject(GenerateFileService);
  apiAdelaideSuiviAuPliService = inject(ApiAdelaideSuiviAuPliService);
  datepipe = inject(DatePipe);

  constructor() {
    // do nothing.
  }

  ngOnInit(): void {
    this.getGridOptions();
    this.getColDefs();
    this.overlayNoRowsTemplate = this.tableauSuiviAuPliService.getOverlayNoRowsTemplate();
  }

  getGridOptions() {
    this.gridOptions = {
      ...this.tableauConfigurationBuilderService.createGridConfiguration(),
      rowHeight: 90,
    };
  }

  getColDefs() {
    this.columnDefs = this.tableauSuiviAuPliService.getColumnDefs();
    this.columnDefs.find(colDef => colDef.field === 'codorg').floatingFilterComponentParams.selectData = this.organismeData$;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.subscriptions.push(
      this.apiAdelaideSuiviAuPliService.getAllSelectConfig().pipe(take(1)).subscribe(data => {
        this.organismes = data.data.allOrganismes;
        this.organismeData$.next(data.data.allOrganismes.sort((a, b) => a.code.localeCompare(b.code)));
      })
    );
  }

  lister($event: SearchPliByQuery) {
    const errors: Map<number, TableAsynchronousError[]> = new Map();
    this.subscriptions.push(
      this.apiAdelaideSuiviAuPliService.searchPliByQuery($event).pipe(take(1)).subscribe(
        data => {
          AgGridUtil.resetFilterAndColumnSort(this.gridApi);
          this.rowData = data.data.searchPliByQuery.filter(row => {
            const lGenPro = row.genpro.split(UNDERSCORE);
            row.codenv = lGenPro[ZERO];
            row.codorg = lGenPro[ONE];
            row.codapp = lGenPro[TWO];
            row.percod = lGenPro[THREE];
            row.comfic = [lGenPro[FIVE], lGenPro[SIX]].join(TIRET);
            row.datdep = this.datepipe.transform(row.datdep, 'dd/MM/yyyy');
            return row;
          });
          this.nombreTotal = this.rowData.length;
          if (!this.nombreTotal) {
            this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
          }
        },
        error => {
          const err: TableAsynchronousError = { isError: true, message: error.graphQLErrors[ZERO].message, id: null };
          this.setError(ONE, err, errors);
          this.asynchronousErrors$.next(errors);
        }
      )
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
    const title = 'Suivi au pli';
    const fileServiceMap = { exportAsExcel: 'generateExcelFile' };
    const columnDefs = this.gridApi.getColumnDefs().filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data = [];
    const sep = ', ';
    this.gridApi.forEachNodeAfterFilterAndSort(node => data.push(fields.map(field => this.getValueExport(field, node.data, sep))));
    this.generateFileService[fileServiceMap[event.type]](data, headers, title);
  }

  getValueExport(field, data, sep) {
    let value = '';
    switch (field) {
      case 'codgam':
        value = isGammeSuivi(data[field]) ? 'Oui' : 'Non';
        break;
      case 'status':
        value = getEtatPliText(data[field]);
        break;
      case 'adresse':
        value = getFullAdresse(data, sep);
        break;
      default:
        value = data[field];
    }
    return value;
  }
}
