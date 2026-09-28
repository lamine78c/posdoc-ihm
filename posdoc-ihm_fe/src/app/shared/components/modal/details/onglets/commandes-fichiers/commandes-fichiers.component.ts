import { Component, Input, OnInit } from '@angular/core';
import { ExtendedColDef } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { CommandesFichiersIntreface } from '@app/models/supervision/production/details/commandes-fichiers-intreface';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { ApiCommandesFichiersService } from '@app/services/api-adelaide/supervision/production/details/api-commandes-fichiers.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { TableauCommandesFichiersService } from './service/tableau/tableau-commandes-fichiers.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, RowDataUpdatedEvent, RowNode } from 'ag-grid-community';

@Component({
  selector: 'app-commandes-fichiers',
  templateUrl: './commandes-fichiers.component.html',
  styleUrls: ['./commandes-fichiers.component.scss'],
  standalone: false,
})
export class CommandesFichiersComponent implements OnInit {
  @Input() paramData: OngletsParamDataModel;
  detailCommandesFichiers: CommandesFichiersIntreface[] = [];
  params: any;
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  columnDefs: (ColDef | ColGroupDef)[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  totalCmdFic: number;

  constructor(
    private apiCommandesFichiersService: ApiCommandesFichiersService,
    private generateFileService: GenerateFileService,
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauCommandesFichiersService: TableauCommandesFichiersService
  ) {}

  ngOnInit(): void {
    this.gridOptions = {
      rowHeight: 30,
      onRowDataUpdated: (event: RowDataUpdatedEvent) => {
        this.totalCmdFic = event.api.getRenderedNodes().filter((n: RowNode) => n.hasChildren()).length ?? 0;
      },
      groupSelectsChildren: true,
      ...this.tableauConfigurationBuilderService.createGridConfiguration(),
      autoGroupColumnDef: {
        headerName: '',
        sortable: false,
        resizable: false,
        width: 35,
        minWidth: 35,
        enableGrouping: true,
      } as ExtendedColDef,
    };

    this.columnDefs = this.tableauCommandesFichiersService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauCommandesFichiersService.getOverlayNoRowsTemplate();

    this.getDetailsCommandesFichiers();
  }

  getDetailsCommandesFichiers(): void {
    this.apiCommandesFichiersService.getDetailsCommandesFichiers(this.paramData).subscribe(response => {
      this.detailCommandesFichiers = response.data.getDetailsCommandesFichiers;
      this.totalCmdFic = this.detailCommandesFichiers.length;
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
  }

  printPdf(): void {
    const title = `Commandes Fichier sur l'application
  ${this.paramData.codEnv}-${this.paramData.codOrg}-${this.paramData.codApp}-${this.paramData.perCod}`;
    const columnWidths = ['auto', '*'];
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const data: any[] = [];

    let nbrRows = 0;
    this.gridApi.forEachNodeAfterFilterAndSort(node => {
      if (node.data) {
        // Create a copy of the node data to avoid modifying the original data
        const nodeDataCopy = { ...node.data };
        nodeDataCopy['commande'] = nodeDataCopy['codcom'] + '-' + nodeDataCopy['numcom'];
        nodeDataCopy['statut'] = nodeDataCopy['ficsta'] + '-' + nodeDataCopy['ficinf'];
        nodeDataCopy['dappcr'] = nodeDataCopy['dappcr'] ? SharedUtil.formatDateToDDMMYYYYHHMMSS(nodeDataCopy['dappcr']) : '';
        nodeDataCopy['dfichd'] = nodeDataCopy['dfichd'] ? SharedUtil.formatDateToDDMMYYYYHHMMSS(nodeDataCopy['dfichd']) : '';
        nodeDataCopy['dficht'] = nodeDataCopy['dficht'] ? SharedUtil.formatDateToDDMMYYYYHHMMSS(nodeDataCopy['dficht']) : '';
        nodeDataCopy['dfichs'] = nodeDataCopy['dfichs'] ? SharedUtil.formatDateToDDMMYYYYHHMMSS(nodeDataCopy['dfichs']) : '';
        nodeDataCopy['frefec'] = nodeDataCopy['frefec'] ? 'Oui' : 'Non';
        nodeDataCopy['ficvid'] = nodeDataCopy['ficvid'] ? 'Oui' : 'Non';
        const childData = fields.map(field => nodeDataCopy[field] || null);

        data.push(childData);
        nbrRows++;
      }
    });

    this.generateFileService['generatePDFFile'](data, headers, title, {
      pageOrientation: 'landscape',
      nombreTotal: nbrRows,
      columnWidths: columnWidths,
    });
  }
}
