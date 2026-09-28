import { Injectable } from '@angular/core';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { FormatUtil } from '@app/shared/utils/FormatUtil';

@Injectable({
  providedIn: 'root',
})
export class TableauVolumeTraiteService {
  private NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour sélectionner les volumes traités à charger</b>';

  constructor(private tableauUtilService: TableauUtilService) {}

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      this.tableauUtilService.getColClearFilter(),
      {
        headerName: 'Rég.',
        field: 'codreg',
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        sortable: true,
        sort: 'asc',
        sortIndex: 3,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },
      {
        headerName: 'Org.',
        field: 'codorg',
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        sortable: true,
        sort: 'asc',
        sortIndex: 4,
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
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        sortable: true,
        sort: 'asc',
        sortIndex: 1,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },
      {
        headerName: 'Com.',
        field: 'codcom',
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        sortable: true,
        sort: 'asc',
        sortIndex: 2,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },
      {
        headerName: 'Fic.',
        field: 'codfic',
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        sortable: true,
        sort: 'asc',
        sortIndex: 5,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },
      {
        headerName: 'Ressource',
        field: 'ressource',
        flex: 1,
        sortable: true,
        sort: 'asc',
        sortIndex: 6,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
        floatingFilterComponentParams: {
          isRessourceCustomSort: true,
        },
      },
      {
        headerName: 'Destinataire',
        field: 'libdes',
        flex: 1,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
      },
      {
        headerName: 'Pages',
        field: 'sumpagfic',
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        cellStyle: { 'justify-content': 'flex-end' },
        valueFormatter: params => {
          return FormatUtil.formatNumberWithThousandSeparators(params.value);
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
