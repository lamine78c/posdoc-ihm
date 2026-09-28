import { Injectable } from '@angular/core';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { ColDef, ColGroupDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauFichierService {
  constructor(private readonly tableauUtilService: TableauUtilService) {}
  private readonly NO_ROWS_TEXT = 'Aucun résultat';
  private readonly PROPERTY_AUTH = AUTH.FICHIER_EDITION.PROPRIETES_DES_FICHIERS;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['codeEnv', 'codeOrg', 'codeApp', 'codeCom', 'codeFich'],
          idsLabelSeparator: '-',
          messages: [
            "Suppression d'un fichier",
            'Vous êtes sur le point de supprimer le fichier',
            'Vous êtes sur le point de supprimer les fichiers',
            'Suppression des fichiers',
            'Les fichiers suivants ne peuvent pas être supprimés',
            'Le fichier suivant ne peut pas être supprimé',
          ],
        },
      },
    };
    const paramColShow: ParamColShowInterface = {
      isColCollapse: true,
      isColSelectAll: isColSelectAll,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }
  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [this.getCodeEnv(), this.getCodeRegion(), this.getCodeOrg(), this.getCodeApp(), this.getCodeCom(), this.getCodeProd(), this.getCodeFich()];
  }

  getCodeEnv(): ColDef | ColGroupDef {
    return {
      field: 'codeEnv',
      headerName: 'Environnement',
      sort: 'asc',
      sortIndex: 5,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {},
      // suppressRowTransform: true,
      // TODO à remplacer
      cellClass: 'overflow-visible',
    };
  }

  getCodeRegion(): ColDef | ColGroupDef {
    return {
      field: 'codeRegion',
      headerName: 'Région',
      sort: 'asc',
      sortIndex: 6,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  getCodeOrg(): ColDef | ColGroupDef {
    return {
      field: 'codeOrg',
      headerName: 'Organisme',
      sort: 'asc',
      sortIndex: 7,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectHierarchiseeFloatingFilter',
      floatingFilterComponentParams: {
        possibleValues: [],
      },
    };
  }

  getCodeApp(): ColDef | ColGroupDef {
    return {
      field: 'codeApp',
      headerName: 'Application',
      sort: 'asc',
      sortable: true,
      sortIndex: 1,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  getCodeCom(): ColDef | ColGroupDef {
    return {
      field: 'codeCom',
      headerName: 'Commande',
      sort: 'asc',
      sortIndex: 2,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  getCodeProd(): ColDef | ColGroupDef {
    return {
      field: 'codeProd',
      headerName: 'Produit',
      sort: 'asc',
      sortIndex: 4,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  getCodeFich(): ColDef | ColGroupDef {
    return {
      field: 'codeFich',
      headerName: 'Fichier',
      sort: 'asc',
      sortIndex: 3,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      flex: 1,
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    return this.getColumDefsAction(isColSelectAll).concat(this.getColumDefs());
  }
}
