import { Injectable } from '@angular/core';
import { CellClassParams, ColDef, ColGroupDef, ValueGetterParams } from 'ag-grid-community';
import SharedUtil from '@app/shared/utils/SharedUtil';

@Injectable({
  providedIn: 'root',
})
export class TableauFichiersProduitsService {
  private NO_ROWS_TEXT = "Aucun fichier et produit pour l'occurrence d'application sélectionnée";

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefs();
  }

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      this.getColPlus(),
      this.getColCommande(),
      this.getColImprimePage(),
      this.getColPrdGamme(),
      this.getColRessource(),
      this.getColDestinataire(),
      this.getColCopies(),
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

  private getColCommande(): ColDef | ColGroupDef | any {
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

  private getColImprimePage(): ColDef | ColGroupDef {
    return {
      headerName: 'Imprimé Pages',
      field: 'refimp',
      sort: 'asc',
      sortable: true,
      width: 110,
      minWidth: 110,
      maxWidth: 130,
      cellStyle: (params: CellClassParams) => {
        return !params.node.group ? { 'justify-content': 'flex-end' } : {};
      },
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'refimp', 'pagFic'),
    };
  }

  private getColPrdGamme(): ColDef | ColGroupDef {
    return {
      headerName: 'Prd Gamme',
      field: 'codprd',
      sort: 'asc',
      sortable: true,
      width: 100,
      minWidth: 100,
      maxWidth: 120,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'codprd', 'codgam'),
    };
  }

  private getColRessource(): ColDef | ColGroupDef {
    return {
      headerName: 'Ressource',
      field: 'codres',
      sort: 'asc',
      sortable: true,
      width: 150,
      minWidth: 150,
      maxWidth: 200,
      valueGetter: params => {
        if (params.data) {
          const { codsit, codres } = params.data;
          return codsit && codres ? `${codsit}-${codres}` : codsit || codres || '';
        }
      },
    };
  }

  private getColDestinataire(): ColDef | ColGroupDef {
    return {
      headerName: 'Destinataire',
      field: 'coddes',
      sort: 'asc',
      sortable: true,
      width: 120,
      minWidth: 120,
      maxWidth: 150,
    };
  }

  private getColCopies(): ColDef | ColGroupDef {
    return {
      headerName: 'Copies',
      field: 'nbrexe',
      sort: 'asc',
      sortable: true,
      width: 100,
      minWidth: 100,
      maxWidth: 120,
      cellStyle: { 'justify-content': 'flex-end' },
    };
  }

  private getColDesignation(): ColDef | ColGroupDef {
    return {
      headerName: 'Désignation',
      field: 'libFichier',
      sort: 'asc',
      sortable: true,
      width: 250,
      minWidth: 250,
      maxWidth: 300,
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'libFichier', ''),
    };
  }
}
