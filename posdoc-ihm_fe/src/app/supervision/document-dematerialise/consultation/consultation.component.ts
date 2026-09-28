import { Component, inject, OnInit } from '@angular/core';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideDocumentDematerialiseService } from '@app/services/api-adelaide-docments-dematerialise.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { STATUT_DEBUT, STATUT_SUSPENDU, STATUT_TERMINE, TYPES, ZERO } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SearchDocDematerialiseInterface } from './model/search-document-dematerialise-interface';
import { TableauDocumentDematerialiseService } from './service/tableau-document-dematerialise.service';

@Component({
  selector: 'app-document-dematerialise-consultation',
  templateUrl: './consultation.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class ConsultationComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  columnDefs: ColDef[];
  rowData = [];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  nombreLignesTotal: number;
  nombreLignesDebute: number;
  nombreLignesSuspendu: number;
  nombreLignesTermine: number;
  params: any;
  organismes = [];
  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);
  subscriptions: Subscription[] = [];

  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauService = inject(TableauDocumentDematerialiseService);
  private readonly apiAdelaideDocumentDematerialiseService = inject(ApiAdelaideDocumentDematerialiseService);
  private readonly generateFileService = inject(GenerateFileService);
  private readonly popupConfirmationService = inject(PopupConfirmationService);

  constructor() {
    // no-op
  }

  ngOnInit(): void {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
    this.columnDefs = this.tableauService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauService.getOverlayNoRowsTemplate();
    this.columnDefs.find(colDef => colDef.field === 'codorg').floatingFilterComponentParams.selectData = this.organismeData$;
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.subscriptions.push(
      this.apiAdelaideDocumentDematerialiseService.getAllSelectConfig().pipe(take(1)).subscribe(data => {
        this.organismes = data.data.allOrganismes;
        this.organismeData$.next(data.data.allOrganismes.sort((a, b) => a.code.localeCompare(b.code)));
      })
    );
  }

  lister($event: SearchDocDematerialiseInterface) {
    this.initializeGrid();
    this.loadDocumentsDematerialises($event);
  }

  private initializeGrid() {
    this.rowData = [];
    AgGridUtil.resetFilterAndColumnSort(this.gridApi);
    this.gridApi.setGridOption('loading', true);
  }

  private loadDocumentsDematerialises($event) {
    this.subscriptions.push(
      this.apiAdelaideDocumentDematerialiseService.getDocsDematerialises($event).pipe(take(1)).subscribe(docsDematerialises => {
        const processedData = this.processDocumentsData(docsDematerialises.data.getDocsDematerialises);
        this.updateGridWithData(processedData, docsDematerialises.data.allOrganismes);
      })
    );
  }

  private processDocumentsData(documents: any[]): {
    rowData: any[];
    nombreLignesDebute: number;
    nombreLignesSuspendu: number;
    nombreLignesTermine: number;
  } {
    const rowData = [];
    let nombreLignesDebute = 0;
    let nombreLignesSuspendu = 0;
    let nombreLignesTermine = 0;

    documents.forEach(value => {
      if (value.docsta === STATUT_DEBUT) {
        nombreLignesDebute++;
      } else if (value.docsta === STATUT_SUSPENDU) {
        nombreLignesSuspendu++;
      } else if (value.docsta === STATUT_TERMINE) {
        nombreLignesTermine++;
      }
      value.id = value.datdem + '-' + value.numdem;
      value.produit = (value.codcom ? value.codcom : '') + '.' + (value.codfic ? value.codfic : '');
      value.document = value.coddoc;
      value.statut = value.docsta + '-' + value.docinf;
      value.typact = this.getTypactLabel(value.typact);
      value.codeRegion = SharedUtil.getCodeRegionByCodeOrg(this.organismes, value.codorg);

      rowData.push(value);
    });

    return { rowData, nombreLignesDebute, nombreLignesSuspendu, nombreLignesTermine };
  }

  private updateGridWithData(processedData: any, organismes: any[]) {
    this.nombreLignesTotal = processedData.rowData.length;
    this.nombreLignesDebute = processedData.nombreLignesDebute;
    this.nombreLignesSuspendu = processedData.nombreLignesSuspendu;
    this.nombreLignesTermine = processedData.nombreLignesTermine;

    if (this.nombreLignesTotal > environment.paginationPageSize) {
      this.popupConfirmationService.popupTooManyResultsConfirmation(this.nombreLignesTotal);
      this.rowData = [];
    } else {
      this.rowData = processedData.rowData;
      if (!this.nombreLignesTotal) {
        this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
      }
    }

    this.organismeData$.next(organismes.sort((a, b) => a.code.localeCompare(b.code)));
    this.gridApi.setGridOption('loading', false);
  }

  private getTypactLabel(typact: string): string {
    const firstChar = typact.charAt(ZERO);
    return TYPES.filter(e => e.value == firstChar)[0]?.label;
  }

  export(event: any) {
    const title = 'Liste des Documents dématérialisés';
    const fileServiceMap = { exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.map((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.map((columnDef: ColDef) => columnDef.field);
    const data = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => data.push(fields.map(field => (node.data[field] !== '' ? node.data[field] : null))));
    this.generateFileService[fileServiceMap[event.type]](data, headers, title, { pageOrientation: 'landscape', columnDefs: columnDefs });
  }
}
