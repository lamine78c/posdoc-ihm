import { Component, inject, OnInit } from '@angular/core';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideVolumeTraiteService } from '@app/services/api-adelaide-volume-traite.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { ZERO } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { setResGamSitList, setVolumeTraiteSearchInput } from './model/search-volume-traite';
import { TableauVolumeTraiteService } from './service/tableau-volume-traite.service';

@Component({
  selector: 'app-volume-traite',
  templateUrl: './volume-traite.component.html',
  standalone: false,
})
@AutoUnsubscribe
export class VolumeTraiteComponent implements OnInit {
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;

  rowData: any = [];
  columnDefs: ColDef[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  params: any;
  nombreLignesTotal: number;
  subscriptions: Subscription[] = [];

  organismeData$: BehaviorSubject<any> = new BehaviorSubject([]);
  organismes;
  destinataires;

  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauVolumeTraiteService = inject(TableauVolumeTraiteService);
  private readonly generateFileService = inject(GenerateFileService);
  private readonly apiAdelaideVolumeTraiteService = inject(ApiAdelaideVolumeTraiteService);
  private readonly popupConfirmationService = inject(PopupConfirmationService);

  constructor() {
    // no-op
  }

  ngOnInit(): void {
    this.initGridOptions();
    this.subscriptions.push(
      this.apiAdelaideVolumeTraiteService.getAllSelectConfig().pipe(take(1)).subscribe((data: any) => {
        this.organismeData$.next(data.data.allOrganismes.sort((a, b) => a.code.localeCompare(b.code)));
        this.organismes = data.data.allOrganismes;
        this.destinataires = data.data.allDestinataires;
      })
    );
  }

  private initGridOptions() {
    // Configuration générale du tableau
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
    // Colonnes du tableau
    this.columnDefs = this.tableauVolumeTraiteService.getColumnDefs();
    // Template tableau vide
    this.overlayNoRowsTemplate = this.tableauVolumeTraiteService.getOverlayNoRowsTemplate();

    this.columnDefs.find(colDef => colDef.field === 'codorg').floatingFilterComponentParams.selectData = this.organismeData$;
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
  }

  lister($event: any) {
    AgGridUtil.resetFilterAndColumnSort(this.gridApi);

    let ressources = [];
    let resGamSitList = [];
    for (let key in $event.ressource) {
      if ($event.ressource[key]) ressources.push(key);
    }
    ressources.forEach(e => {
      let data = e.split('/');
      resGamSitList.push(setResGamSitList(data[2], data[0], data[1]));
    });

    let orgs = [];
    SharedUtil.extractSelectedOrgs($event.organisme, orgs);

    this.subscriptions.push(
      this.apiAdelaideVolumeTraiteService
        .getVolumestraites(setVolumeTraiteSearchInput($event.environnement, orgs, $event.toDate, $event.fromDate, resGamSitList))
        .pipe(take(1))
        .subscribe(result => {
          const responseData = result.data.getVolumestraites;
          const volumesTraitesList = responseData.volumesTraitesList;
          const message = responseData.message;
          if (message) {
            this.popupConfirmationService.popupTooManyResultsConfirmation(message);
            return;
          }
          if (volumesTraitesList.length === ZERO) {
            this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
            return;
          }
          this.nombreLignesTotal = volumesTraitesList.length;
          this.rowData = volumesTraitesList.map(v => {
            v.ressource = v.codgam + '/' + v.codsit + '/' + v.codres;
            v.codreg = SharedUtil.getCodeRegionByCodeOrg(this.organismes, v.codorg);
            if (!!v.coddes) {
              v.libdes = this.destinataires.filter(d => d.codeOrg === v.codorg && d.code === v.coddes)[0]?.libelle;
            }
            return v;
          });
        })
    );
  }

  export(event: any) {
    const title = 'Liste des Volumes traités';
    const fileServiceMap = { exportAsPDF: 'generatePDFFile', exportAsExcel: 'generateExcelFile' };
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.map((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.map((columnDef: ColDef) => columnDef.field);
    const data = [];

    this.gridApi.forEachNodeAfterFilterAndSort(node => data.push(fields.map(field => (node.data[field] !== '' ? node.data[field] : null))));

    this.generateFileService[fileServiceMap[event.type]](data, headers, title);
  }
}
