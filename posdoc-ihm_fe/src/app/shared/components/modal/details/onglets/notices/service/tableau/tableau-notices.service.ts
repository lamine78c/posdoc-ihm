import { Injectable } from '@angular/core';
import { ColDef, ColGroupDef, ValueGetterParams } from 'ag-grid-community';
import SharedUtil from '@app/shared/utils/SharedUtil';

@Injectable({
  providedIn: 'root',
})
export class TableauNoticesService {
  private NO_ROWS_TEXT = "Aucune notice pour l'occurrence d'application sélectionnée";

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefs();
  }

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      this.getColPlus(),
      this.getColFichier(),
      this.getColCodePrd(),
      this.getColImprime(),
      this.getColNotice(),
      this.getColPoids(),
      this.getColFormat(),
      this.getColPortee(),
      this.getColDesignation(),
    ];
  }

  private getColPlus(): ColDef | ColGroupDef | any {
    return {
      field: 'fichier',
      headerName: '',
      sortIndex: 1,
      enableCollapsing: true,
      rowGroup: true,
      rowGroupIndex: 0,
      sort: 'asc',
      sortable: true,
      hide: true,
      lockPosition: 'left',
      width: 35,
      minWidth: 35,
      maxWidth: 40,
      valueGetter: params => {
        if (params.data) {
          return params.data.codcom + params.data.codfic + '-' + params.data.numcom;
        }
      },
    };
  }

  private getColFichier(): ColDef | ColGroupDef | any {
    return {
      headerName: 'Fichier',
      field: 'fichier',
      showRowGroup: true,
      sort: 'asc',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {},
      // suppressRowTransform: true,
      // TODO à remplacer
      cellClass: 'overflow-visible',
      width: 120,
      minWidth: 120,
      maxWidth: 150,
    };
  }

  private getColCodePrd(): ColDef | ColGroupDef {
    return {
      headerName: 'Code prd',
      field: 'codprd',
      sort: 'asc',
      sortable: true,
      width: 110,
      minWidth: 110,
      maxWidth: 130,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'codprd', ''),
    };
  }

  private getColImprime(): ColDef | ColGroupDef {
    return {
      headerName: 'Imprimé',
      field: 'refimp',
      sort: 'asc',
      sortable: true,
      width: 100,
      minWidth: 100,
      maxWidth: 120,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'refimp', ''),
    };
  }

  private getColNotice(): ColDef | ColGroupDef {
    return {
      headerName: 'Notice',
      field: 'codnot',
      sort: 'asc',
      sortable: true,
      width: 150,
      minWidth: 150,
      maxWidth: 200,
    };
  }

  private getColPoids(): ColDef | ColGroupDef {
    return {
      headerName: 'Poids',
      field: 'poinot',
      sort: 'asc',
      sortable: true,
      width: 120,
      minWidth: 120,
      maxWidth: 150,
      cellStyle: { 'justify-content': 'flex-end' },
    };
  }

  private getColFormat(): ColDef | ColGroupDef {
    return {
      headerName: 'Format',
      field: 'fornot',
      sort: 'asc',
      sortable: true,
      width: 100,
      minWidth: 100,
      maxWidth: 120,
    };
  }

  private getColPortee(): ColDef | ColGroupDef {
    return {
      headerName: 'Portée',
      field: 'pornot',
      sort: 'asc',
      sortable: true,
      width: 100,
      minWidth: 100,
      maxWidth: 120,
      valueGetter: params => {
        if (params.data) {
          return params.data.pornot === 'N' ? params.data.pornot : params.data.pornot + '-' + params.data.codsit;
        }
      },
    };
  }

  private getColDesignation(): ColDef | ColGroupDef {
    return {
      headerName: 'Désignation',
      field: 'libfic',
      sort: 'asc',
      sortable: true,
      width: 250,
      minWidth: 250,
      maxWidth: 300,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'libfic', 'libnot'),
    };
  }
}
