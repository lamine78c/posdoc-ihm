import { Injectable } from '@angular/core';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, ValueGetterParams } from 'ag-grid-community';
import { FormatUtil } from '@app/shared/utils/FormatUtil';

@Injectable({
  providedIn: 'root',
})
export class TableauSuiviMassificationService {
  private NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour sélectionner les massifications à charger</b>';

  constructor() {
    // do nothing
  }

  getColumnDefs(): (ColDef | ColGroupDef | any)[] {
    return [
      this.getColPlus(),
      this.getColPool(),
      this.getColSite(),
      this.getColApplication(),
      this.getColPeriode(),
      this.getColFichier(),
      this.getColTotalPages(),
      this.getColTotalPlis(),
      this.getColClient(),
      this.getColDesignation(),
      this.getColSupport(),
    ];
  }

  private getColPlus(): ColDef | ColGroupDef | any {
    return {
      field: 'mascom_masfic_masper_codsit',
      headerName: '',
      enableCollapsing: true,
      rowGroup: true,
      rowGroupIndex: 0,
      hide: true,
      lockPosition: 'left',
      width: 35,
      minWidth: 35,
      maxWidth: 35,
    };
  }

  private getColPool(): ColDef | ColGroupDef | any {
    return {
      field: 'pool',
      headerName: 'Pool',
      // suppressRowTransform: true,
      // TODO à remplacer
      cellClass: 'overflow-visible',
      width: 110,
      minWidth: 110,
      maxWidth: 150,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'actionRendererClearFilter',
      floatingFilterComponentParams: {},
      valueGetter: params => {
        if (params.node.group) {
          const childNodeData = params.node.allLeafChildren[0].data;
          return childNodeData.mascom + '-' + childNodeData.masfic;
        } else if (params.data.pool) {
          return params.data.pool;
        }
        return '';
      },
    };
  }

  private getColSite(): ColDef | ColGroupDef | any {
    return {
      field: 'codsit',
      headerName: 'Site',
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      filterValueGetter: (params: ValueGetterParams) => {
        return params.data ? params.data.codsit : null;
      },
      width: 90,
      minWidth: 90,
      maxWidth: 120,
      valueGetter: params => {
        if (params.node.group) {
          const childNodeData = params.node.allLeafChildren[0].data;
          return childNodeData.codsit;
        }
        return '';
      },
    };
  }

  private getColApplication(): ColDef | ColGroupDef | any {
    return {
      field: 'codenv_codorg_codapp',
      headerName: 'Application',
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      width: 120,
      minWidth: 120,
      maxWidth: 150,
    };
  }

  private getColPeriode(): ColDef | ColGroupDef | any {
    return {
      field: 'masper',
      headerName: 'Période',
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      width: 120,
      minWidth: 120,
      maxWidth: 150,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'masper', 'percod'),
    };
  }

  private getColFichier(): ColDef | ColGroupDef | any {
    return {
      field: 'codcom_codfic_numcom',
      headerName: 'Fichier',
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      width: 120,
      minWidth: 120,
      maxWidth: 150,
    };
  }

  private getColTotalPages(): ColDef | ColGroupDef | any {
    return {
      field: 'pagFic',
      headerName: 'Pages',
      cellDataType: 'number',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      width: 80,
      minWidth: 80,
      maxWidth: 110,
      cellStyle: { 'justify-content': 'flex-end' },
      aggFunc: 'sum',
      valueFormatter: params => {
        return FormatUtil.formatNumberWithThousandSeparators(params.value);
      },
    };
  }

  private getColTotalPlis(): ColDef | ColGroupDef | any {
    return {
      field: 'pliFic',
      headerName: 'Plis',
      cellDataType: 'number',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      width: 70,
      minWidth: 70,
      maxWidth: 100,
      cellStyle: { 'justify-content': 'flex-end' },
      aggFunc: 'sum',
      valueFormatter: params => {
        return FormatUtil.formatNumberWithThousandSeparators(params.value);
      },
    };
  }

  private getColClient(): ColDef | ColGroupDef | any {
    return {
      field: 'codcli',
      headerName: 'Client',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    };
  }

  private getColDesignation(): ColDef | ColGroupDef | any {
    return {
      field: 'libFichier',
      headerName: 'Désignation',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      flex: 1,
      filterValueGetter: (params: ValueGetterParams) => {
        return params.data ? params.data.libFichier : null;
      },
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'libFichier', ''),
    };
  }

  private getColSupport(): ColDef | ColGroupDef | any {
    return {
      field: 'libsup',
      headerName: 'Support',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      flex: 1,
      filterValueGetter: (params: ValueGetterParams) => {
        return params.data ? params.data.libsup : null;
      },
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'libsup', ''),
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }
}
