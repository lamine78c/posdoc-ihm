import { inject, Injectable } from '@angular/core';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { AUTH } from '@app/services/permission/PermissionsFile';

@Injectable({
  providedIn: 'root',
})
export class TableauNoticesFichiersService {
  private readonly tableauUtilService = inject(TableauUtilService);

  private NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour rechercher les notices de fichiers</b>';
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
    const colsDefData = [this.getColApp(), this.getColFic(), this.getColCodPrd(), this.getColRefImp(), this.getColNotices()];
    return this.getColumDefsAction().concat(colsDefData);
  }

  private getColApp(): ColDef {
    return {
      headerName: 'Application',
      field: 'codenv_codorg_codapp',
      sort: 'asc',
      sortable: true,
      flex: 1,
      minWidth: 200,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColFic(): ColDef {
    return {
      headerName: 'Fichier',
      field: 'codcom_codfic',
      sort: 'asc',
      sortable: true,
      flex: 1,
      minWidth: 150,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      cellRenderer: params => {
        if (params.value) {
          return `<a href="javascript:void(0)" class="text-primary text-decoration-underline" style="cursor: pointer;">${params.value}</a>`;
        }
        return params.value;
      },
    };
  }

  private getColCodPrd(): ColDef {
    return {
      headerName: 'Code prd',
      field: 'codeProd',
      sort: 'asc',
      sortable: true,
      flex: 1,
      minWidth: 120,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColRefImp(): ColDef {
    return {
      headerName: 'Imprimé',
      field: 'refImprime',
      sort: 'asc',
      sortable: true,
      flex: 1,
      minWidth: 150,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColNotices(): ColDef {
    return {
      headerName: 'Notices',
      field: 'noticesString',
      sortable: true,
      flex: 2,
      minWidth: 300,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }
}
