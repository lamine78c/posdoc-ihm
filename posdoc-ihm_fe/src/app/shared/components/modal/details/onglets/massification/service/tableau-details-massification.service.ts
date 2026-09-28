import { Injectable } from '@angular/core';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, ValueGetterParams } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauDetailsMassificationService {
  private NO_ROWS_TEXT = 'Aucun résultat';
  private getColumDefs(): (ColDef | ColGroupDef | any)[] {
    return [
      this.getColPlus(),
      this.getColPool(),
      this.getColApp(),
      this.getColPeriode(),
      this.getColFichier(),
      this.getColTotalPages(),
      this.getColTotalPlis(),
      this.getColMasuti(),
      this.getColImprime(),
      this.getColClient(),
    ];
  }

  private getColPlus(): ColDef | ColGroupDef | any {
    return {
      field: 'pool',
      headerName: '',
      sortIndex: 1,
      enableCollapsing: true,
      rowGroup: true,
      rowGroupIndex: 0,
      hide: true,
      lockPosition: 'left',
      width: 35,
      minWidth: 35,
      maxWidth: 35,
      valueGetter: params => {
        if (params.data) {
          return params.data.mascom + '-' + params.data.masfic;
        }
      },
    };
  }

  private getColPool(): ColDef | ColGroupDef | any {
    return {
      field: 'pool',
      headerName: 'Pool',
      showRowGroup: true,
      sort: 'asc',
      sortable: true,
      // suppressRowTransform: true,
      // TODO à remplacer
      cellClass: 'overflow-visible',
      width: 90,
    };
  }

  private getColApp(): ColDef | ColGroupDef {
    return {
      field: 'codapp',
      headerName: 'Site/Application',
      sort: 'asc',
      sortable: true,
      width: 120,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFieldsConcat(params, '', ['masenv', 'codorg', 'codapp'], '-'),
    };
  }

  private getColPeriode(): ColDef | ColGroupDef {
    return {
      field: 'percod',
      headerName: 'Période',
      sort: 'asc',
      sortable: true,
      width: 80,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'masper', 'percod'),
    };
  }

  private getColFichier(): ColDef | ColGroupDef {
    return {
      field: 'codfic',
      headerName: 'Fichier',
      sort: 'asc',
      sortable: true,
      width: 80,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFieldsConcat(params, '', ['codcom', 'codfic', 'numcom'], '-'),
    };
  }

  private getColTotalPages(): ColDef | ColGroupDef {
    return {
      field: 'pagFic',
      headerName: 'Total Pages',
      sort: 'asc',
      sortable: true,
      width: 100,
      aggFunc: 'sum',
    };
  }

  private getColTotalPlis(): ColDef | ColGroupDef {
    return {
      field: 'pliFic',
      headerName: 'Total Plis',
      sort: 'asc',
      sortable: true,
      width: 80,
      aggFunc: 'sum',
    };
  }

  private getColMasuti(): ColDef | ColGroupDef {
    return {
      field: 'masuti',
      headerName: "Désignation et date d'acheminement",
      sort: 'asc',
      sortable: true,
      minWidth: 230,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'libFichier', 'masuti'),
    };
  }

  private getColImprime(): ColDef | ColGroupDef {
    return {
      field: 'codbon',
      headerName: 'Imprimé',
      sort: 'asc',
      sortable: true,
      width: 80,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'refImprime', ''),
    };
  }

  private getColClient(): ColDef | ColGroupDef {
    return {
      field: 'codcli',
      headerName: 'Client',
      sort: 'asc',
      sortable: true,
      width: 80,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, '', 'codcli'),
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefs();
  }
}
