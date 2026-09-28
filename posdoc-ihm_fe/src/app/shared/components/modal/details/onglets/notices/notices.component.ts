import { Component, Input, OnInit } from '@angular/core';
import { ExtendedColDef } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { NoticesInterface } from '@app/models/supervision/production/details/notices-interface';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import { TableauNoticesService } from './service/tableau/tableau-notices.service';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, IRowNode, RowDataUpdatedEvent, RowNode } from 'ag-grid-community';

@Component({
  selector: 'app-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.scss'],
  standalone: false,
})
export class NoticesComponent implements OnInit {
  @Input() paramData: OngletsParamDataModel;
  detailNotices: NoticesInterface[] = [];
  params: any;
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  columnDefs: (ColDef | ColGroupDef)[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  totalNotice: number;

  constructor(
    private apiNoticesService: ApiNoticesService,
    private generateFileService: GenerateFileService,
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauNoticesService: TableauNoticesService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
    this.getDetailsNotices();
  }

  initGridOptions(): void {
    this.gridOptions = {
      rowHeight: 30,
      onRowDataUpdated: (event: RowDataUpdatedEvent) => {
        this.totalNotice = event.api.getRenderedNodes().filter((n: RowNode) => n.hasChildren()).length ?? 0;
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

    this.columnDefs = this.tableauNoticesService.getColumnDefs();
    this.overlayNoRowsTemplate = this.tableauNoticesService.getOverlayNoRowsTemplate();
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
  }

  getDetailsNotices(): void {
    this.apiNoticesService.getDetailsNotices(this.paramData).subscribe(response => {
      this.detailNotices = response.data.getDetailsNotices;
      this.totalNotice = this.detailNotices.length;
    });
  }

  printPdf(): void {
    const title = `Notices sur l'application
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
    nodeDataCopy['pornot'] = nodeDataCopy['pornot'] === 'N' ? nodeDataCopy['pornot'] : nodeDataCopy['pornot'] + '-' + nodeDataCopy['codsit'];
    nodeDataCopy['libfic'] = nodeDataCopy['libnot'];
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
      node.allLeafChildren[ZERO]?.data.codprd ?? '',
      node.allLeafChildren[ZERO]?.data.refimp ?? '',
      '',
      '',
      '',
      '',
      node.allLeafChildren[ZERO]?.data.libfic ?? ''
    );
    data.push(parentData.slice(ZERO, fields.length));
  }
}
