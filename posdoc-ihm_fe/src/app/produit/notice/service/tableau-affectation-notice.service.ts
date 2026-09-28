import { Injectable } from '@angular/core';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, ValueGetterParams } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauAffectationNoticeService {
  constructor(private tableauUtilService: TableauUtilService) {
    //No - op
  }
  private NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour sélectionner les notices à charger</b>';
  private PROPERTY_AUTH = AUTH.FICHIER_EDITION.NOTICES.AFFECTATION_NOTICES;
  private getColumDefsActionPopupCreate() {
    const params: ParamColDefInterface = {};
    const paramColShow: ParamColShowInterface = {
      isNoColEdit: true,
      isNoColDelete: true,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        sortable: false,
        cellRendererParams: {
          idsLabelSeparator: '-',
          idsLabel: ['codenv_codorg_codapp', 'codcom_codfic'],
          messages: [
            "Suppression d'une notice",
            `Vous êtes sur le point de supprimer la notice *** associée au fichier suivant`,
            `Vous êtes sur le point de supprimer la notice *** associée aux fichiers suivants`,
            'Suppression de notices',
            'Les notices suivantes ne peuvent pas être supprimées',
            'La notice suivante ne peut pas être supprimée',
            { '***': 'codnot' },
          ],
        },
      },
    };
    const paramColShow: ParamColShowInterface = {
      isNoColEdit: true,
      isColSelectAll: isColSelectAll,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }
  getColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    const colsDefData = [
      this.getColApp(),
      this.getColFic(),
      this.getColCodPrd(),
      this.getColRefImp(),
      this.getColDateDebut(),
      this.getColDateFin(),
      this.getColCodeNotice(),
    ];
    return this.getColumDefsAction(isColSelectAll).concat(colsDefData);
  }

  getColumnDefsPopupCreate(): (ColDef | ColGroupDef)[] {
    const colsDefData = [
      this.getColResetRow(),
      this.getColApp(),
      this.getColFic(),
      this.getColCodPrd(),
      this.getColRefImp(),
      this.getColDateDebut(),
      this.getColDateFin(),
    ];
    return this.getColumDefsActionPopupCreate().concat(colsDefData);
  }

  private getColResetRow(): ColDef {
    return {
      headerName: '',
      field: 'isAuthorisedToReset',
      sortable: false,
      width: 35,
      minWidth: 35,
      maxWidth: 35,
      cellRenderer: 'actionRendererReset',
      cellRendererParams: {
        resetKeys: [
          { to: 'dnotid', from: 'dnodtid_old' },
          { to: 'dnotit', from: 'dnodtit_old' },
        ],
      },
    };
  }

  private getColApp(): ColDef {
    return {
      headerName: 'Application',
      field: 'codenv_codorg_codapp',
      sort: 'asc',
      sortable: true,
      flex: 1,
      minWidth: 120,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFieldsConcat(params, '', ['codenv', 'codorg', 'codapp'], '-'),
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
      minWidth: 100,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColCodPrd(): ColDef {
    return {
      headerName: 'Code prd',
      field: 'codeProd',
      sort: 'asc',
      sortable: true,
      flex: 1,
      minWidth: 100,
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
      minWidth: 100,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColDateDebut(): ColDef {
    return {
      headerName: 'Date début',
      field: 'dnotid',
      sort: 'asc',
      sortable: true,
      flex: 1,
      minWidth: 120,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      valueFormatter: function (params) {
        return SharedUtil.formatDateToDDMMYYYY(params.data.dnotid);
      },
    };
  }

  private getColDateFin(): ColDef {
    return {
      headerName: 'Date fin',
      field: 'dnotit',
      sort: 'asc',
      sortable: true,
      flex: 1,
      minWidth: 120,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      valueFormatter: function (params) {
        return SharedUtil.formatDateToDDMMYYYY(params.data.dnotit);
      },
    };
  }

  private getColCodeNotice(): ColDef {
    return {
      headerName: 'Notice',
      field: 'codnot',
      sortable: false,
      hide: true,
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }
}
