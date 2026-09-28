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
export class TableauActionUtilisateurService {
  constructor(private tableauUtilService: TableauUtilService) {}

  private NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour sélectionner les actions à charger</b>';
  private PROPERTY_AUTH = AUTH.SUPERVISION.ACTIONS.ACTION_UTILISATEUR;
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
    return [
      this.getColId(),
      this.getColUser(),
      this.getColFormulaire(),
      this.getColDate(),
      this.getColAction(),
      this.getColParams(),
      this.getColStatus(),
      this.getColError(),
    ];
  }

  private getColId() {
    return {
      headerName: 'ID',
      field: 'codulo',
      sort: 'desc',
      sortable: true,
      sortIndex: 1,
      width: 55,
      maxWidth: 55,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: PopupCellRendererComponent,
    };
  }

  private getColUser() {
    return {
      headerName: 'Utilisateur',
      field: 'codusr',
      width: 100,
      maxWidth: 100,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColFormulaire() {
    return {
      headerName: 'Formulaire Entité',
      field: 'formid',
      flex: 1,
      minWidth: 300,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColDate() {
    return {
      headerName: 'Date action',
      field: 'datulo',
      width: 150,
      maxWidth: 150,
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
      field: 'action',
      width: 100,
      maxWidth: 100,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColParams() {
    return {
      headerName: 'Paramètres',
      field: 'params',
      flex: 1,
      minWidth: 120,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColStatus() {
    return {
      headerName: 'KO?',
      field: 'ko',
      width: 65,
      maxWidth: 65,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'listFloatingFilter',
      floatingFilterComponentParams: {
        possibleLabelWithValues: [
          { label: 'KO', value: true },
          { label: 'OK', value: false },
        ],
        suppressFilterButton: true,
      },
    };
  }

  private getColError() {
    return {
      headerName: 'Anomalie Clause WHERE',
      field: 'erreur',
      flex: 1,
      minWidth: 130,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefsAction().concat(this.getColumDefs());
  }
}
