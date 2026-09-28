import { Injectable } from '@angular/core';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, ValueGetterParams } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauCommandesFichiersService {
  private NO_ROWS_TEXT = "Aucune commande et fichier pour l'occurrence d'application sélectionnée";

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      this.getColPlus(),
      this.getColCommande(),
      this.getColFichier(),
      this.getColCodePrd(),
      this.getColImprime(),
      this.getColDesignation(),
      this.getColStatut(),
      this.getColDateAppli(),
      this.getColDateDebut(),
      this.getColDateFin(),
      this.getColDateSuspension(),
      this.getColRefaction(),
      this.getColFicVide(),
    ];
  }

  private getColPlus(): ColDef | ColGroupDef | any {
    return {
      field: 'commande',
      headerName: '',
      sortIndex: 1,
      enableCollapsing: true,
      rowGroup: true,
      rowGroupIndex: 0,
      sort: 'asc',
      sortable: true,
      hide: true,
      lockPosition: 'left',
      width: 50,
      minWidth: 50,
      maxWidth: 65,
      valueGetter: params => {
        if (params.data) {
          return params.data.codcom + '-' + params.data.numcom;
        }
      },
    };
  }

  private getColCommande(): ColDef | ColGroupDef | any {
    return {
      headerName: 'Commande',
      field: 'commande',
      showRowGroup: true,
      sort: 'asc',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {},
      // suppressRowTransform: true,
      // TODO à remplacer
      cellClass: 'overflow-visible',
      width: 150,
      minWidth: 150,
      maxWidth: 180,
    };
  }

  private getColFichier(): ColDef | ColGroupDef {
    return {
      headerName: 'Fichier',
      field: 'codfic',
      sort: 'asc',
      sortable: true,
      width: 80,
      minWidth: 80,
      maxWidth: 100,
      valueGetter: params => {
        if (params.data) {
          return params.data.codcom + params.data.codfic;
        }
      },
    };
  }

  private getColCodePrd(): ColDef | ColGroupDef {
    return {
      headerName: 'Code Prd',
      field: 'codprd',
      sort: 'asc',
      sortable: true,
      width: 100,
      minWidth: 100,
      maxWidth: 120,
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
    };
  }

  private getColDesignation(): ColDef | ColGroupDef {
    return {
      headerName: 'Désignation',
      field: 'libfic',
      sort: 'asc',
      sortable: true,
      width: 300,
      minWidth: 300,
      maxWidth: 350,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'libelle', 'libfic'),
    };
  }

  private getColStatut(): ColDef | ColGroupDef {
    return {
      headerName: 'Statut',
      field: 'statut',
      sort: 'asc',
      sortable: true,
      width: 80,
      minWidth: 80,
      maxWidth: 100,
      valueGetter: params => {
        if (params.data) {
          return params.data.ficsta + '-' + params.data.ficinf;
        }
      },
    };
  }

  private getColDateAppli(): ColDef | ColGroupDef {
    return {
      headerName: 'Date appli.',
      field: 'dappcr',
      sort: 'asc',
      sortable: true,
      width: 180,
      minWidth: 180,
      maxWidth: 200,
      valueFormatter: function (params) {
        return params?.data?.dappcr ? SharedUtil.formatDateToDDMMYYYYHHMMSS(params.data.dappcr) : '';
      },
    };
  }

  private getColDateDebut(): ColDef | ColGroupDef {
    return {
      headerName: 'Date début',
      field: 'dfichd',
      sort: 'asc',
      sortable: true,
      width: 180,
      minWidth: 180,
      maxWidth: 200,
      valueFormatter: function (params) {
        return params?.data?.dfichd ? SharedUtil.formatDateToDDMMYYYYHHMMSS(params.data.dfichd) : '';
      },
    };
  }

  private getColDateFin(): ColDef | ColGroupDef {
    return {
      headerName: 'Date fin',
      field: 'dficht',
      sort: 'asc',
      sortable: true,
      width: 180,
      minWidth: 180,
      maxWidth: 200,
      valueFormatter: function (params) {
        return params?.data?.dficht ? SharedUtil.formatDateToDDMMYYYYHHMMSS(params.data.dficht) : '';
      },
    };
  }

  private getColDateSuspension(): ColDef | ColGroupDef {
    return {
      headerName: 'Date suspension',
      field: 'dfichs',
      sort: 'asc',
      sortable: true,
      width: 180,
      minWidth: 180,
      maxWidth: 200,
      valueFormatter: function (params) {
        return params?.data?.dfichs ? SharedUtil.formatDateToDDMMYYYYHHMMSS(params.data.dfichs) : '';
      },
    };
  }

  private getColRefaction(): ColDef | ColGroupDef {
    return {
      headerName: 'Réfection ?',
      field: 'frefec',
      sort: 'asc',
      width: 110,
      minWidth: 110,
      maxWidth: 120,
      sortable: true,
      valueGetter: params => {
        if (params.data) {
          return params.data.frefec ? 'Oui' : 'Non';
        }
      },
    };
  }

  private getColFicVide(): ColDef | ColGroupDef {
    return {
      headerName: 'Fic. vide ?',
      field: 'ficvid',
      sort: 'asc',
      sortable: true,
      width: 100,
      minWidth: 100,
      maxWidth: 120,
      valueGetter: params => {
        if (params.data) {
          return params.data.ficvid ? 'Oui' : 'Non';
        }
      },
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefs();
  }
}
