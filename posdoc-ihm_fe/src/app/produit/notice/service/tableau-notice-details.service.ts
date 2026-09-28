import { Injectable } from '@angular/core';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { AUTH } from '@app/services/permission/PermissionsFile';

@Injectable({
  providedIn: 'root',
})
export class TableauNoticeDetailsService {
  constructor(private readonly tableauUtilService: TableauUtilService) {}

  private NO_ROWS_TEXT = '<b>Aucun détail de notice trouvé pour ce fichier</b>';
  private PROPERTY_AUTH = AUTH.FICHIER_EDITION.NOTICES.NOTICES_FICHIERS;

  private getColumDefsAction(): (ColDef | ColGroupDef)[] {
    const params: ParamColDefInterface = {
      clearFilter: {
        pinned: 'left',
      },
    };
    const paramColShow: ParamColShowInterface = {
      isColCollapse: false,
      isNoColEdit: true,
      isNoColDelete: true,
      isColSelectAll: false,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    const colsDefData = [
      this.getColCodeNotice(),
      this.getColFormat(),
      this.getColPoids(),
      this.getColPortee(),
      this.getColDateDebut(),
      this.getColDateFin(),
    ];
    return this.getColumDefsAction().concat(colsDefData);
  }

  private getColCodeNotice(): ColDef {
    return {
      headerName: 'Code notice',
      field: 'codeNotice',
      sort: 'asc',
      sortable: true,
      flex: 1,
      minWidth: 120,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColFormat(): ColDef {
    return {
      headerName: 'Format',
      field: 'format',
      sortable: true,
      flex: 1,
      minWidth: 100,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColPoids(): ColDef {
    return {
      headerName: 'Poids',
      field: 'poids',
      sortable: true,
      flex: 1,
      minWidth: 100,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      valueFormatter: params => (params.value ? `${params.value} g` : ''),
    };
  }

  private getColPortee(): ColDef {
    return {
      headerName: 'Portée',
      field: 'portee',
      sortable: true,
      flex: 1,
      minWidth: 100,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColDateDebut(): ColDef {
    return {
      headerName: 'Date début',
      field: 'dateDebut',
      sortable: true,
      flex: 1,
      minWidth: 120,
      valueFormatter: params => {
        if (params.value) {
          const date = new Date(params.value);
          return date.toLocaleDateString('fr-FR');
        }
        return '';
      },
    };
  }

  private getColDateFin(): ColDef {
    return {
      headerName: 'Date fin',
      field: 'dateFin',
      sortable: true,
      flex: 1,
      minWidth: 120,
      valueFormatter: params => {
        if (params.value) {
          const date = new Date(params.value);
          return date.toLocaleDateString('fr-FR');
        }
        return '';
      },
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }
}
