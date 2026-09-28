import { Component, Input, OnInit } from '@angular/core';
import { ExtendedColDef } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { FichiersProduitsIntreface } from '@app/models/supervision/production/details/fichiers-produits-intreface';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { ApiFichiersProduitsService } from '@app/services/api-adelaide/supervision/production/details/api-fichiers-produits.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { TableauFichiersProduitsService } from './service/tableau/tableau-fichiers-produits.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, IRowNode, RowDataUpdatedEvent, RowNode } from 'ag-grid-community';

@Component({
  selector: 'app-fichiers-produits',
  templateUrl: './fichiers-produits.component.html',
  styleUrls: ['./fichiers-produits.component.scss'],
  standalone: false,
})
export class FichiersProduitsComponent implements OnInit {
  @Input() paramData: OngletsParamDataModel;
  detailFichiersProduits: FichiersProduitsIntreface[] = [];
  params: any;
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  columnDefs: (ColDef | ColGroupDef)[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  totalCmdFic: number;

  constructor(
    private apiFichierProduitsService: ApiFichiersProduitsService,
    private generateFileService: GenerateFileService,
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauFichierProduitsService: TableauFichiersProduitsService
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

    this.columnDefs = this.tableauFichierProduitsService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauFichierProduitsService.getOverlayNoRowsTemplate();

    this.getDetailsFichiersProduits();
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
  }

  getDetailsFichiersProduits(): void {
    this.apiFichierProduitsService.getDetailsFichiersProduits(this.paramData).subscribe(response => {
      this.detailFichiersProduits = response.data.getDetailsFichiersProduits;
      this.totalCmdFic = this.detailFichiersProduits.length;
    });
  }

  printPdf(): void {
    const title = `Fichier et produits sur l'application
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
        this.createRowChild(node, fields, data);
        nbrRows++;
      } else {
        this.createRowParent(fields, node, data);
      }
    });

    this.generateFileService['generatePDFFile'](data, headers, title, {
      pageOrientation: 'landscape',
      nombreTotal: nbrRows,
      columnWidths: columnWidths,
    });
  }

  private createRowChild(node: IRowNode<any>, fields: any[], data: any[]) {
    // Create a copy of the node data to avoid modifying the original data
    const nodeDataCopy = { ...node.data };
    nodeDataCopy['refimp'] = '' + nodeDataCopy['pagFic'];
    nodeDataCopy['codprd'] = nodeDataCopy['codgam'];
    nodeDataCopy['codres'] = nodeDataCopy['codsit'] + '-' + nodeDataCopy['codres'];
    nodeDataCopy['libFichier'] = '';
    const childData = fields.map(field => nodeDataCopy[field] || null);

    data.push(childData);
  }

  private createRowParent(fields: any[], node: IRowNode<any>, data: any[]) {
    const ZERO = 0;
    const parentData = Array(fields.length).fill(null);
    parentData.splice(
      ZERO,
      ZERO,
      node.key,
      node.allLeafChildren[ZERO]?.data.refimp ?? '',
      node.allLeafChildren[ZERO]?.data.codprd ?? '',
      '',
      '',
      '',
      node.allLeafChildren[ZERO]?.data.libFichier ?? ''
    );
    data.push(parentData.slice(ZERO, fields.length));
  }
}
