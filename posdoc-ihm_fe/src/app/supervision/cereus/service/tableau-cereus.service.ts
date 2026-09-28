import { DatePipe } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { TableauFormattersComparatorsService } from '@app/fullstack-components/tableau/services/tableau-formatters-comparators.service';
import { FormatUtil } from '@app/shared/utils/FormatUtil';
import { ColDef, ColGroupDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauCereusService {
  private readonly tableauFormattersComparatorsService = inject(TableauFormattersComparatorsService);
  private readonly datePipe = new DatePipe('fr-FR');
  private NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour sélectionner les flux à charger</b>';
  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      {
        headerName: 'ID flux',
        field: 'id',
        sortable: true,
        minWidth: 100,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
      },
      {
        headerName: 'Nom archive retour',
        field: 'nomArchiveRetour',
        sortable: true,
        minWidth: 180,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
      },
      {
        headerName: 'Date production',
        field: 'dateProduction',
        sortable: true,
        flex: 1,
        valueFormatter: (params) => {
          return this.datePipe.transform(params.data.dateProduction, 'dd/MM/YYYY');
        },
        floatingFilter: true,
        filter: 'agDateColumnFilter',
        floatingFilterComponent: 'agDateInput',
        filterParams: { comparator: this.tableauFormattersComparatorsService.compareDates },
      },
      {
        headerName: 'Date poste',
        field: 'datePoste',
        sortable: true,
        flex: 1,
        valueFormatter: (params) => {
          return this.datePipe.transform(params.data.datePoste, 'dd/MM/YYYY');
        },
        floatingFilter: true,
        filter: 'agDateColumnFilter',
        floatingFilterComponent: 'agDateInput',
        filterParams: { comparator: this.tableauFormattersComparatorsService.compareDates },
      },
      {
        headerName: 'Nom fichier retour',
        field: 'nomFichierRetour',
        sortable: true,
        minWidth: 180,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
      },
      {
        headerName: 'Nbre plis fabriqués',
        field: 'nombrePlisFabriques',
        sortable: true,
        flex: 1,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        cellStyle: { 'justify-content': 'flex-end' },
        valueFormatter: params => {
          return FormatUtil.formatNumberWithThousandSeparators(params.value);
        },
      },
      {
        headerName: 'Nbre Occu détails',
        field: 'details',
        sortable: true,
        flex: 1,
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
