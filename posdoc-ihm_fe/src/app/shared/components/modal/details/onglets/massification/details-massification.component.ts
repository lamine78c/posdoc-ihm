import { Component, Input, OnInit } from '@angular/core';
import { ExtendedColDef } from '@app/fullstack-components/tableau/models/tableau.models';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { ParamMassification } from '@app/models/supervision/production/details/param-massification';
import { ParamMassificationApiModel } from '@app/models/supervision/production/details/param-massification-api-model';
import { ApiMassificationsService } from '@app/services/api-adelaide/supervision/production/details/api-massifications.service';
import { GenerateFileService } from '@app/services/generate-file.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, IRowNode, RowDataUpdatedEvent } from 'ag-grid-community';
import { TableauDetailsMassificationService } from './service/tableau-details-massification.service';

@Component({
  selector: 'app-massification',
  templateUrl: './details-massification.component.html',
  styleUrls: ['./details-massification.component.scss'],
  standalone: false,
})
export class DetailsMassificationComponent implements OnInit {
  @Input() paramData: OngletsParamDataModel;
  @Input() paramMassification: ParamMassification;
  params: any;
  rowData: any[] = [];
  gridOptions: GridOptions;
  overlayNoRowsTemplate: string;
  columnDefs: (ColDef | ColGroupDef | any)[];
  gridApi: GridApi;
  gridColumnApi: GridApi;
  paramMassificationApiModel: ParamMassificationApiModel;

  constructor(
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    private tableauDetailsMassificationService: TableauDetailsMassificationService,
    private apiMassificationsService: ApiMassificationsService,
    private generateFileService: GenerateFileService
  ) {}

  ngOnInit(): void {
    this.initGridOptions();
    this.columnDefs = this.tableauDetailsMassificationService.getColumnDefs();
    this.columnDefs.find(colDef => colDef.field === 'masuti').headerName = 'Désignation et ' + this.paramMassification.masUti;
    this.overlayNoRowsTemplate = this.tableauDetailsMassificationService.getOverlayNoRowsTemplate();
    if (this.paramMassification.bMasApp) {
      this.paramMassificationApiModel = {
        codEnv: this.paramData.codEnv,
        codOrg: this.paramData.codOrg,
        codApp: this.paramData.codApp,
        perCod: this.paramData.perCod,
        masGam: this.paramMassification.masGam,
      };
      this.getOccurenceApplicationDetailsMassifications();
    }
  }

  getOccurenceApplicationDetailsMassifications(): void {
    this.apiMassificationsService.getDetailsMassification(this.paramMassificationApiModel).subscribe((data: any) => {
      this.rowData = data.data.getDetailsMassification;
    });
  }

  initGridOptions() {
    this.gridOptions = {
      ...this.tableauConfigurationBuilderService.createGridConfiguration(),
      autoGroupColumnDef: {
        headerName: '',
        sortable: false,
        resizable: false,
        width: 35,
        minWidth: 35,
        // Paramètre custom permettant de gérer l'affichage de l'icône dans l'header
        enableGrouping: true,
      } as ExtendedColDef,
      suppressAggFuncInHeader: true,
      onRowDataUpdated: (event: RowDataUpdatedEvent) =>
        SharedUtil.generatePinnedBottomRowForGroupedRows(event, 'pool', ['pagFic', 'pliFic'], '*** TOTAL ***'),
    };
  }

  onGridReady(params: GridReadyEvent) {
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
  }

  imprimerPDF() {
    const title = `Massification sur l'application ${this.paramData.codEnv}-${this.paramData.codOrg}-${this.paramData.codApp}-${this.paramData.perCod}-${this.paramMassification.masGam}`;
    const columnDefs: (ColDef | ColGroupDef)[] = this.gridApi
      .getColumnDefs()
      .filter((columnDef: ColDef) => !!columnDef.field && !!columnDef.headerName);
    const headers = columnDefs.flatMap((columnDef: ColDef) => columnDef.headerName);
    const fields = columnDefs.flatMap((columnDef: ColDef) => columnDef.field);
    const pageOrientation = 'landscape';
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
      pageOrientation: pageOrientation,
      nombreTotal: nbrRows,
    });
  }

  private createRowChild(node: IRowNode<any>, fields: any[], data: any[]) {
    // Create a copy of the node data to avoid modifying the original data
    const nodeDataCopy = { ...node.data };
    nodeDataCopy['codapp'] = nodeDataCopy['masenv'] + '-' + nodeDataCopy['codorg'] + '-' + nodeDataCopy['codapp'];
    nodeDataCopy['codfic'] = nodeDataCopy['codcom'] + '-' + nodeDataCopy['codfic'] + '-' + nodeDataCopy['numcom'];
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
      '',
      node.allLeafChildren[ZERO]?.data.masper ?? '',
      '',
      '',
      '',
      node.allLeafChildren[ZERO]?.data.libFichier ?? '',
      node.allLeafChildren[ZERO]?.data.refImprime ?? '',
      ''
    );
    data.push(parentData.slice(ZERO, fields.length));
  }
}
