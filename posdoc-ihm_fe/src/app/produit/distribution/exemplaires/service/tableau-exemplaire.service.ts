import { Injectable } from '@angular/core';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef, ColGroupDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauExemplaireService {
  constructor(private tableauUtilService: TableauUtilService) {}

  private NO_ROWS_TEXT = 'Aucun résultat';
  private getColumDefs(): (ColDef | ColGroupDef | any)[] {
    return [
      this.tableauUtilService.getColClearFilter(),
      {
        headerName: 'Env.',
        field: 'codenv',
        width: 65,
        minWidth: 65,
        maxWidth: 65,
        sortIndex: 1,
        sort: 'asc',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },

      {
        headerName: 'Rég.',
        field: 'codreg',
        sortIndex: 2,
        sort: 'asc',
        sortable: true,
        width: 65,
        minWidth: 65,
        maxWidth: 65,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },

      {
        headerName: 'Org.',
        field: 'codorg',
        sortIndex: 3,
        sort: 'asc',
        sortable: true,
        width: 65,
        minWidth: 65,
        maxWidth: 65,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectHierarchiseeFloatingFilter',
        floatingFilterComponentParams: {
          possibleValues: [],
        },
      },

      {
        headerName: 'App.',
        field: 'codapp',
        sortable: false,
        width: 70,
        minWidth: 70,
        maxWidth: 70,
      },

      {
        headerName: 'Com.',
        field: 'codcom',
        sortIndex: 4,
        sort: 'asc',
        sortable: true,
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
      },

      {
        headerName: 'Code Prd',
        field: 'codeProd',
        sortable: true,
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
      },

      {
        headerName: 'Fic.',
        field: 'codfic',
        sortIndex: 5,
        sort: 'asc',
        sortable: true,
        width: 65,
        minWidth: 65,
        maxWidth: 65,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
      },

      {
        headerName: 'Désignation',
        field: 'libFichier',
        sortable: true,
        flex: 1,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
      },

      {
        headerName: 'Imprimé',
        field: 'refImprime',
        sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 90,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
      },

      {
        headerName: 'Gamme',
        field: 'codgam',
        sortIndex: 6,
        sort: 'asc',
        sortable: true,
        width: 70,
        minWidth: 70,
        maxWidth: 90,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },
      {
        headerName: 'Site',
        field: 'codsit',
        sortIndex: 7,
        sort: 'asc',
        sortable: true,
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },

      {
        headerName: 'Ressource',
        field: 'codres',
        sortIndex: 8,
        sort: 'asc',
        sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 100,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },

      {
        headerName: 'Copies',
        field: 'nbrexe',
        sortable: true,
        width: 60,
        minWidth: 60,
        maxWidth: 80,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        cellStyle: { 'justify-content': 'flex-end' },
      },

      {
        headerName: 'Destinataire',
        field: 'coddes',
        sortable: true,
        width: 90,
        minWidth: 90,
        maxWidth: 110,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },

      {
        headerName: 'Actif',
        field: 'exeact',
        sortable: true,
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'listFloatingFilter',
        floatingFilterComponentParams: {
          possibleLabelWithValues: [
            { label: 'Vrai', value: true },
            { label: 'Faux', value: false },
          ],
          suppressFilterButton: true,
        },
        cellRenderer: InterrupteurRadioComponent,
        cellRendererParams: {
          formKey: 'exeact',
        },
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
