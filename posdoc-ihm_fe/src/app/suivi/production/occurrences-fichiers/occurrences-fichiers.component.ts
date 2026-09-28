import { Component, inject, OnInit } from '@angular/core';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { TableauOccurrencesFichiersService } from './service/tableau-occurrences-fichiers.service';
import { ApiOccurrenceFichierService } from '@app/services/api-adelaide/suivi/api-occurrence-fichier.service';
import { OccurrenceFichier, OccurrencesFichiersFilters } from '@app/models/suivi/occurrence-fichier.model';
import { ZERO } from '@app/shared/utils/Constants';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { GenerateFileService } from '@app/services/generate-file.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommandeDetailsComponent } from '../modal/commande-details/commande-details.component';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-occurrences-fichiers',
  templateUrl: './occurrences-fichiers.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class OccurrencesFichiersComponent implements OnInit {
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauOccurrencesFichiersService = inject(TableauOccurrencesFichiersService);
  private readonly apiOccurrenceFichierService = inject(ApiOccurrenceFichierService);
  private readonly popupConfirmationService = inject(PopupConfirmationService);
  private readonly generateFileService = inject(GenerateFileService);
  private readonly modalService = inject(NgbModal);

  constructor() {
    //do nothing
  }

  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  gridApi: GridApi;
  rowData: OccurrenceFichier[] = [];
  columnDefs: ColDef[];
  totalArticles = 0;
  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initGridOptions();
    this.tableauOccurrencesFichiersService.setModalCallback((codenv, codorg, codapp) => {
      this.openCommandeDetailsModal(codenv, codorg, codapp);
    });
  }

  private initGridOptions() {
    this.gridOptions = {
      ...this.tableauConfigurationBuilderService.createGridConfiguration(),
      onFilterChanged: (event) => {
        this.totalArticles = AgGridUtil.updateTotalRowCount(event);
      },
      onRowDataUpdated: (event) => {
        this.totalArticles = AgGridUtil.updateTotalRowCount(event);
      }
    };
    this.columnDefs = this.tableauOccurrencesFichiersService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauOccurrencesFichiersService.getOverlayNoRowsTemplate();
  }

  /**
   * Charge les occurrences de fichiers depuis la base de données avec les filtres
   */
  onSearchOccurrencesFichiers(filtersPayload: OccurrencesFichiersFilters): void {
    this.subscriptions.push(
      this.apiOccurrenceFichierService.getOccurrencesFichiers(filtersPayload).pipe(take(1)).subscribe({
        next: (result) => {
          const responseData = result.data;
          const occurrencesFichiers = responseData.getOccurrencesFichiers.occurrencesFichiers;
          const message = responseData.getOccurrencesFichiers.message;

          if (message) {
            this.popupConfirmationService.popupTooManyResultsConfirmation(message);
            this.rowData = [];
            this.totalArticles = ZERO;
            return;
          }

          if (occurrencesFichiers.length === ZERO) {
            this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
            this.rowData = [];
            this.totalArticles = ZERO;
            return;
          }

          this.rowData = occurrencesFichiers;
          this.totalArticles = occurrencesFichiers.length;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des occurrences de fichiers:', error);
          this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
          this.rowData = [];
          this.totalArticles = ZERO;
        },
      })
    );
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  export(event: any) {
    const title = 'Liste des Occurrences de Fichiers';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs = this.getColumnDefs();
    const headers = columnDefs.map((col: ColDef) => col.headerName);
    const fields = columnDefs.map((col: ColDef) => col.field);
    const data = this.getGridData(fields);

    this.generateFileService[fileServiceMap[event.type]](data, headers, title);
  }

  private getColumnDefs(): ColDef[] {
    return this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName) as ColDef[];
  }

  private getGridData(fields: string[]): any[][] {
    const data: any[][] = [];
    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      data.push(fields.map(field => this.formatFieldValue(field, node.data)));
    });
    return data;
  }

  private formatFieldValue(field: string, rowData: any): any {
    if (field === 'application') return this.formatApplication(rowData);
    if (field === 'fichier') return this.formatFichier(rowData);
    if (field === 'statut') return this.formatStatut(rowData);
    if (field === 'frefec' || field === 'ficvid') return rowData[field] ? 'Oui' : 'Non';
    if (field === 'dappcr' || field === 'dfichd' || field === 'dficht') {
      return SharedUtil.formatDateToDDMMYYYYHHMMSS(rowData[field]);
    }
    return rowData[field] !== '' ? rowData[field] : null;
  }

  private formatApplication(data: any): string {
    const { codenv, codorg, codapp } = data;
    return codenv && codorg && codapp ? `${codenv}-${codorg}-${codapp}` : '';
  }

  private formatFichier(data: any): string {
    const { codcom, codfic, numcom } = data;
    return codcom && codfic && numcom ? `${codcom}${codfic}-${numcom}` : '';
  }

  private formatStatut(data: any): string {
    const { ficsta, ficinf } = data;
    if (ficsta && ficinf) return `${ficsta}-${ficinf}`;
    return ficsta || '';
  }

  openCommandeDetailsModal(codenv: string, codorg: string, codapp: string): void {
    const modalRef = this.modalService.open(CommandeDetailsComponent, { size: 'lg' });
    modalRef.componentInstance.codenv = codenv;
    modalRef.componentInstance.codorg = codorg;
    modalRef.componentInstance.codapp = codapp;
  }
}
