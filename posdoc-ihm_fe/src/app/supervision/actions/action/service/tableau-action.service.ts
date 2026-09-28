import { Injectable } from '@angular/core';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { PopupCellRendererComponent } from './popup-cell-renderer.component';

@Injectable({
  providedIn: 'root',
})
export class TableauActionService {
  constructor(private tableauUtilService: TableauUtilService) {}

  private NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour sélectionner les actions à charger</b>';
  private PROPERTY_AUTH = AUTH.SUPERVISION.ACTIONS.MISE_A_JOUR_DANS_IHM;
  private getColumDefsAction() {
    const params: ParamColDefInterface = {};
    const paramColShow: ParamColShowInterface = {
      isColSelectAll: false,
      isNoColEdit: true,
      isNoColDelete: true,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }
  private getColumDefs(): (ColDef | ColGroupDef | any)[] {
    return [this.getColId(), this.getColUser(), this.getColStation(), this.getColDate(), this.getColAction(), this.getColEntity()];
  }

  private getColId() {
    return {
      headerName: 'ID',
      field: 'id',
      sort: 'desc',
      sortable: true,
      sortIndex: 1,
      flex: 1,
      minWidth: 100,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: PopupCellRendererComponent,
    };
  }

  private getColUser() {
    return {
      headerName: 'Utilisateur',
      field: 'utilisateur',
      sort: 'desc',
      sortable: true,
      sortIndex: 2,
      flex: 1,
      minWidth: 150,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColStation() {
    return {
      headerName: 'Station',
      field: 'station',
      sort: 'desc',
      sortable: true,
      sortIndex: 3,
      flex: 1,
      minWidth: 150,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColDate() {
    return {
      headerName: 'Date',
      field: 'insertionDate',
      sort: 'desc',
      sortable: true,
      sortIndex: 4,
      flex: 1,
      minWidth: 200,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueFormatter: function (params) {
        return params.value ? SharedUtil.formatDateToDDMMYYYYHHMMSS(params.value) : '';
      },
    };
  }

  private getColAction() {
    return {
      headerName: 'Action',
      field: 'actionUtilisateur',
      sort: 'desc',
      sortable: true,
      sortIndex: 5,
      flex: 1,
      minWidth: 100,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColEntity() {
    return {
      headerName: 'Entité',
      field: 'entite',
      sort: 'desc',
      sortable: true,
      sortIndex: 6,
      flex: 1,
      minWidth: 100,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefsAction().concat(this.getColumDefs());
  }
}
