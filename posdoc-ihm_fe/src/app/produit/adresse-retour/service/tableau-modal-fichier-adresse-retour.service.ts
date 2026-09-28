import { Injectable } from '@angular/core';
import { ColDef, ColGroupDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauModalFichierAdresseRetourService {
  private readonly NO_ROWS_TEXT = 'Aucun résultat';
  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      {
        headerName: 'Envt',
        field: 'codeEnv',
        sort: 'asc',
        sortable: true,
        filter: false,
        width: 100,
      },
      {
        headerName: 'Appli',
        field: 'codeApp',
        sort: 'asc',
        sortable: true,
        filter: false,
        width: 100,
      },
      {
        headerName: 'Commande',
        field: 'codeCom',
        sort: 'asc',
        sortable: true,
        filter: false,
        width: 100,
      },
      {
        headerName: 'Fichier',
        field: 'codeFich',
        sort: 'asc',
        sortable: true,
        filter: false,
        width: 100,
      },
      {
        headerName: 'Code Prd',
        field: 'codeProd',
        sortable: true,
        filter: false,
        width: 100,
      },
      {
        headerName: 'Imprimé',
        field: 'refImprime',
        sortable: true,
        filter: false,
        width: 100,
      },
      {
        headerName: 'Désignation',
        field: 'libFichier',
        sortable: true,
        filter: false,
      },
    ];
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefs();
  }
}
