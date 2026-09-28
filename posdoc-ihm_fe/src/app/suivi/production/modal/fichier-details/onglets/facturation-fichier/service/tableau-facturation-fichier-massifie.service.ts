import { Injectable } from '@angular/core';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, ValueGetterParams } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauFacturationFichierMassifieService {
  private NO_ROWS_TEXT = 'Aucun fichier massifié';

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefs();
  }

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [this.getColPlus(), this.getColApplication(), this.getColPeriode(), this.getColFichier(), this.getColNbplis(), this.getColCoutot()];
  }

  private getColPlus(): ColDef | ColGroupDef | any {
    return {
      field: 'plus',
      headerName: '',
      enableCollapsing: true,
      rowGroup: true,
      rowGroupIndex: 0,
      sortable: true,
      sort: 'asc',
      sortIndex: 1,
      hide: true,
      lockPosition: 'left',
      valueGetter: params => {
        if (params.data) {
          return (
            params.data.codenv +
            '-' +
            params.data.codorg +
            '-' +
            params.data.codapp +
            '-' +
            params.data.percod +
            '-' +
            params.data.codcom +
            '-' +
            params.data.codfic +
            '-' +
            params.data.numcom
          );
        }
      },
    };
  }

  private getColApplication(): ColDef | ColGroupDef | any {
    return {
      headerName: 'Application',
      field: 'application',
      sort: 'asc',
      sortable: true,
      maxWidth: 120,
      width: 100,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFieldsAllConcat(params, ['codenv', 'codorg', 'codapp'], [], '-'),
      filterValueGetter: (params: ValueGetterParams) => params.data['codenv'] + params.data['codorg'] + params.data['codapp'],
    };
  }

  private getColPeriode(): ColDef | ColGroupDef {
    return {
      headerName: 'Période',
      field: 'percod',
      sort: 'desc',
      sortable: true,
      sortIndex: 2,
      maxWidth: 100,
      width: 90,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'percod', ''),
      filterValueGetter: (params: ValueGetterParams) => params.data['percod'],
    };
  }

  private getColNbplis(): ColDef | ColGroupDef {
    return {
      headerName: 'Nb plis',
      field: 'nbplis',
      sortable: false,
      aggFunc: 'sum',
      maxWidth: 100,
      width: 60,
    };
  }

  private getColCoutot(): ColDef | ColGroupDef {
    return {
      headerName: 'Coût',
      field: 'coutot',
      sortable: false,
      aggFunc: 'sum',
      maxWidth: 100,
      width: 90,
    };
  }

  private getColFichier(): ColDef | ColGroupDef {
    return {
      headerName: 'Fichier',
      field: 'fichier',
      sort: 'asc',
      sortable: true,
      sortIndex: 3,
      flex: 1,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFieldsAllConcat(params, ['codcom', 'codfic', 'numcom'], ['libtar'], '-'),
      filterValueGetter: (params: ValueGetterParams) => params.data['codcom'] + params.data['codfic'] + params.data['numcom'] + params.data['libtar'],
    };
  }
}
