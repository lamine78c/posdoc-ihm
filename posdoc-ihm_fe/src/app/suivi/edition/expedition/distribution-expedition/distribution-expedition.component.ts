import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { SearchExpeditionQuery } from '@app/models/payload/search-expedition';
import { ApiAdelaideEditionService } from '@app/services/api-adelaide-edition.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { ZERO } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TableauExpeditionService } from '@app/suivi/edition/expedition/service/tableau-expedition.service';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-distribution-expedition',
  templateUrl: './distribution-expedition.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class DistributionExpeditionComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  gridApi: GridApi;
  rowData: any = [];
  subscriptions: Subscription[] = [];
  private readonly datePipe = new DatePipe('fr-FR');

  nombreExpeditionsTotal: number;

  columnDefs: ColDef[];

  toMaxDate: NgbDateStruct = this.calendar.getToday();
  fromMinDate: NgbDateStruct = this.calendar.getNext(this.calendar.getToday(), 'm', -12); // One year ago
  toDefaultDate: NgbDateStruct;
  fromDefaultDate: NgbDateStruct;

  organismes: any = [];
  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);

  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauExpeditionService = inject(TableauExpeditionService);
  private readonly apiAdelaideEditionService = inject(ApiAdelaideEditionService);
  private readonly generateFileService = inject(GenerateFileService);
  private readonly popupConfirmationService = inject(PopupConfirmationService);

  constructor(private calendar: NgbCalendar) {}

  ngOnInit(): void {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
    // Colonnes du tableau
    this.columnDefs = this.tableauExpeditionService.getColumnDefs();
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauExpeditionService.getOverlayNoRowsTemplate();

    this.columnDefs.find(colDef => colDef.field === 'codorg').floatingFilterComponentParams.selectData = this.organismeData$;

    this.toDefaultDate = this.toMaxDate;
    this.fromDefaultDate = this.toMaxDate;
  }

  getCodeRegionByCodeOrg(codeOrg) {
    return this.organismes.filter(o => o.code == codeOrg)[0]?.codeRegion;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.subscriptions.push(
      this.apiAdelaideEditionService.getAllSelectConfig().pipe(take(1)).subscribe(data => {
        this.organismes = (data as any).data.allOrganismes;
        this.organismeData$.next((data as any).data.allOrganismes.sort((a, b) => a.code.localeCompare(b.code)));
      })
    );
  }

  export(event: any) {
    const title = 'Liste des Expéditions';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      data.push(
        fields.map(field => {
          if (field === 'dfiexp') {
            return SharedUtil.formatDateToDDMMYYYY(node.data[field]);
          } else if (field === 'codfic') {
            return node.data['codcom'] + '-' + node.data['codfic'];
          } else {
            return node.data[field] !== '' ? node.data[field] : null;
          }
        })
      );
    });

    this.generateFileService[fileServiceMap[event.type]](data, headers, title);
  }

  lister($event: SearchExpeditionQuery) {
    AgGridUtil.resetFilterAndColumnSort(this.gridApi);
    $event.dfiexpDeb = this.formaliseDate($event.dfiexpDeb);
    $event.dfiexpFin = this.formaliseDate($event.dfiexpFin);
    this.initDataGrid($event);
  }

  formaliseDate(date: string): string {
    // Format the date as 'YYMMDD-HH'
    return this.datePipe.transform(new Date(date), 'YYMMdd-H');
  }

  initDataGrid(searchData: SearchExpeditionQuery): void {
    this.subscriptions.push(
      this.apiAdelaideEditionService.getExpeditionsByParam(searchData).pipe(take(1)).subscribe(result => {
        const responseData = result.data.getExpeditions;
        const expeditionList = responseData.expeditionList;
        const message = responseData.message;
        if (message) {
          this.popupConfirmationService.popupTooManyResultsConfirmation(message);
          return;
        }
        if (expeditionList.length === ZERO) {
          this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
          return;
        }
        this.nombreExpeditionsTotal = expeditionList.length;
        let rowsData = [];
        expeditionList.forEach(row => {
          row.codeRegion = this.getCodeRegionByCodeOrg(row.codorg);
          rowsData.push(row);
        });
        this.rowData = rowsData;
        if (!this.nombreExpeditionsTotal) {
          this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
        }
        this.organismeData$.next(result.data.allOrganismes.sort((a, b) => a.code.localeCompare(b.code)));
        // todo: code a analysé => j'ai ajouté cette ligne car 'this.organismes' est utilisé dans la fonction 'getCodeRegionByCodeOrg'
        this.organismes = result.data.allOrganismes.sort((a, b) => a.code.localeCompare(b.code));
      })
    );
  }
}
