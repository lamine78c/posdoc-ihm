import { Component, inject, OnInit } from '@angular/core';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { FieldValue } from '@app/models/FieldValue';
import { FacturationDetailleeInterface, SearchFacturationDetailleePayloadModel } from '@app/models/suivi/facturation-detaillee-interface';
import { ApiFacturationDetailleeService } from '@app/services/api-adelaide/suivi/api-facturation-detaillee.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { ZERO } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { TableauFacturationDetailleeService } from '@app/suivi/facturation/facturation-detaillee/service/tableau-facturation-detaillee.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, RowDataUpdatedEvent } from 'ag-grid-community';
import { Subscription, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-facturation-detaillee',
  templateUrl: './facturation-detaillee.component.html',
  styleUrls: ['./facturation-detaillee.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class FacturationDetailleeComponent implements OnInit {
  facturationDetaillee: any[] = [];
  nbTotalFacturationDetaillee = 0;
  gridOptions: GridOptions;
  columnDefs: ColDef[];
  overlayNoRowsTemplate: string;
  gridApi: GridApi;
  gridColumnApi: GridApi;
  subscriptions: Subscription[] = [];
  showTotal = false;
  COUT_PREFIX = 'cout';
  PLIS_PREFIX = 'plis';
  COUT_TOTAL_FIELD = 'coutTotal';
  TOTAL_PAGES_FIELD = 'totalPages';
  TOTAL_PLIS_FIELD = 'totalPlis';
  TOTAL_FIELD = 'TOTAL';
  CODFIC_FIELD = 'codfic';
  DFIEXP_FIELD = 'dfiexp';
  EXCEL_NUMFMT_COUT_TOTAL = '#,##0.000 [$€-fr-FR]';

  private readonly apiFacturationDetailleeService = inject(ApiFacturationDetailleeService);
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauFacturationDetailleeService = inject(TableauFacturationDetailleeService);
  private readonly generateFileService = inject(GenerateFileService);
  private readonly popupConfirmationService = inject(PopupConfirmationService);

  constructor() {
    //no-op
  }

  ngOnInit(): void {
    this.initGridOptions();
  }

  private initGridOptions() {
    this.gridOptions = {
      ...this.tableauConfigurationBuilderService.createGridConfiguration(),
      selectionColumnDef: {
        pinned: 'left',
      },
    };
    this.gridOptions.rowSelection = {
      mode: 'singleRow',
      checkboxes: false,
      enableClickSelection: true,
    };
    this.onFilterChanged();
    this.onRowDataUpdated();

    // Initialize columnDefs with base columns
    this.columnDefs = this.tableauFacturationDetailleeService.getBaseColumnDefs();
    this.overlayNoRowsTemplate = this.tableauFacturationDetailleeService.getOverlayNoRowsTemplate();
  }

  private onRowDataUpdated() {
    this.gridOptions.onRowDataUpdated = this.updateRowData.bind(this);
  }

  private onFilterChanged() {
    this.gridOptions.onFilterChanged = this.updateRowData.bind(this);
  }

  private updateRowData(event: RowDataUpdatedEvent) {
    if (!this.gridApi) {
      return;
    }

    this.nbTotalFacturationDetaillee = SharedUtil.updateTotalRowCount(event);

    if (this.showTotal) {
      this.gridApi.setGridOption('pinnedBottomRowData', []);
      return;
    }

    const displayedRowCount = event.api.getDisplayedRowCount();
    if (displayedRowCount === ZERO) {
      this.gridApi.setGridOption('pinnedBottomRowData', []);
      return;
    }

    this.updatePinnedBottomRow(event);
  }

  private updatePinnedBottomRow(event: RowDataUpdatedEvent) {
    const dynamicColumns = this.getDynamicColumnFields();
    const columns = [this.TOTAL_PAGES_FIELD, this.TOTAL_PLIS_FIELD, this.COUT_TOTAL_FIELD, ...dynamicColumns];

    SharedUtil.generatePinnedBottomRowForNotGroupedRows(event, this.CODFIC_FIELD, columns, this.TOTAL_FIELD);
  }

  searchFacturationDetaillee(event) {
    if (event) {
      AgGridUtil.resetFilterAndColumnSort(this.gridApi);
      const payload = this.searchFacturationDetailleePayload(event);
      this.subscriptions.push(
        this.apiFacturationDetailleeService.searchFacturationDetaillee(payload).pipe(take(1)).subscribe(response => {
          const { facturationDetailleeWithAllColumns, message } = response.data.searchFacturationDetaillee;
          if (message && message.trim() !== '') {
            this.popupConfirmationService.popupTooManyResultsConfirmation(message);
            return;
          }
          const resultData = this.transformFaturationDetailleeData(facturationDetailleeWithAllColumns);
          this.nbTotalFacturationDetaillee = resultData.length;
          if (this.nbTotalFacturationDetaillee > environment.paginationPageSize) {
            this.popupConfirmationService.popupTooManyResultsConfirmation(this.nbTotalFacturationDetaillee);
            return;
          }
          this.afterSearchFacturationDetaillee(resultData);
        })
      );
    }
  }

  afterSearchFacturationDetaillee(resultData) {
    this.facturationDetaillee = resultData;
    if (!this.nbTotalFacturationDetaillee) {
      this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
    }
    this.updateColumnDefs();
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.facturationDetaillee);
    }
  }

  updateColumnDefs() {
    this.columnDefs = this.tableauFacturationDetailleeService.getColumnDefs(this.facturationDetaillee);
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.columnDefs);
    }
  }

  getDynamicColumnFields(): string[] {
    return this.facturationDetaillee.reduce((fields, row) => {
      Object.keys(row).forEach(key => {
        if ((key.startsWith(this.COUT_PREFIX) || key.startsWith(this.PLIS_PREFIX)) && row[key] !== null && key !== this.COUT_TOTAL_FIELD) {
          if (!fields.includes(key)) {
            fields.push(key);
          }
        }
      });
      return fields;
    }, []);
  }

  public transformFaturationDetailleeData(data: FacturationDetailleeInterface[]) {
    return data.map(row => {
      const transformedRow = { ...row };
      if (Array.isArray(row.tarifs)) {
        row.tarifs.forEach(tarif => {
          transformedRow[`${this.COUT_PREFIX}${tarif.codeTar}`] = tarif.cout;
          transformedRow[`${this.PLIS_PREFIX}${tarif.codeTar}`] = tarif.plis;
        });
        // Remove tarifs from the final object
        delete transformedRow.tarifs;
      }
      return transformedRow;
    });
  }

  searchFacturationDetailleePayload(event): SearchFacturationDetailleePayloadModel {
    const codclis = SharedUtil.getSelectedValuesFromListeDeroulanteMultiple(event?.codclis);
    const typtars = SharedUtil.getSelectedValuesFromListeDeroulanteMultiple(event?.typtars);
    const payload = new SearchFacturationDetailleePayloadModel();
    this.showTotal = event?.totaux;

    payload.dfiexpDeb = event?.dfiexpDeb || null;
    payload.dfiexpFin = event?.dfiexpFin || null;
    payload.codorgs = this.selectedCodorgs(event).length > 0 ? this.selectedCodorgs(event) : null;
    payload.codclis = codclis.length > 0 ? codclis : null;
    payload.typtars = typtars.length > 0 ? typtars : null;
    payload.codenv = event?.codenv || null;
    payload.codapp = event?.codapp || null;
    payload.codcom = event?.codcom || null;
    payload.codfic = event?.codfic || null;
    payload.codsit = event?.codsit || null;
    payload.showTotal = this.showTotal;

    return payload;
  }

  selectedCodorgs(event): string[] {
    const codorgs: string[] = [];
    const rawOrg = event?.codorgs;
    if (rawOrg) {
      SharedUtil.extractSelectedOrgs(rawOrg, codorgs);
    }
    return codorgs;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
  }

  excelExport(event: any) {
    const title = 'Facturation détaillée';
    const fileServiceMap = { exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.map((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.map((columnDef: ColDef) => columnDef.field);
    const data: any[] = [];
    const totalDynamicColumns: FieldValue[] = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      const dynamicFields = fields.slice(10);
      dynamicFields.forEach(field => {
        if (node.data[field] !== undefined) {
          this.addTotalDynamicColumn(totalDynamicColumns, field, node.data[field]);
        }
      });
      data.push(
        fields.map(field => {
          if (field === this.DFIEXP_FIELD) {
            return node.data[field] ? new Date(node.data[field].split('T')[0]) : null;
          } else if (field === this.COUT_TOTAL_FIELD) {
            return Number(node.data[field]);
          } else {
            const value = this.gridApi.getCellValue({ rowNode: node, colKey: field });
            return value !== '' ? value : null;
          }
        })
      );
    });
    this.generateFileService[fileServiceMap[event.type]](data, headers, title, {
      numFmtDefs: [
        {
          number: fields.indexOf(this.COUT_TOTAL_FIELD) + 1,
          numFmt: this.EXCEL_NUMFMT_COUT_TOTAL,
        },
      ],
    });
  }

  createTotalRow(fields: any[], data: any[], totalDynamicColumns: FieldValue[]) {
    const baseColumnsCount = this.tableauFacturationDetailleeService.getBaseColumnDefs().length;
    const totalData = Array(baseColumnsCount).fill('');
    totalData[fields.indexOf(this.CODFIC_FIELD)] = this.TOTAL_FIELD;
    fields.slice(baseColumnsCount).forEach((field: string) => {
      const value = totalDynamicColumns.find(col => col.field === field)?.value;
      totalData.push(field.includes(this.COUT_PREFIX) ? SharedUtil.threeDecimalFormatter(value)?.replace('.', ',') : value);
    });
    data.push(totalData.slice(0, fields.length));
  }

  addTotalDynamicColumn(totalDynamicColumn: FieldValue[], field: string, value: any) {
    const element = totalDynamicColumn.find(el => el.field === field);
    if (element) {
      element.value += value;
    } else {
      totalDynamicColumn.push({
        field: field,
        value: value,
      });
    }
  }
}
