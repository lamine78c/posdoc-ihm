import { Injectable } from '@angular/core';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauDocDematerialisesFichierService {
  private readonly NO_ROWS_TEXT = '<b>Aucun document dématérialisé trouvé</b>';

  getColumnDefs(): ColDef[] {
    return [
      this.getIdentificationCol(),
      this.getDocumentCol(),
      this.getRefDemandeCol(),
      this.getTypeCol(),
      this.getDateDebutCol(),
      this.getDateFinCol(),
    ];
  }

  private getIdentificationCol(): ColDef {
    return {
      field: 'numdem',
      headerName: 'Identification',
      sort: 'asc',
      flex: 1,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueGetter: params => `${params.data.datdem}-${params.data.numdem}`,
    };
  }

  private getDocumentCol(): ColDef {
    return {
      field: 'coddoc',
      headerName: 'Document',
      flex: 1,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getRefDemandeCol(): ColDef {
    return {
      field: 'refdem',
      headerName: 'Réf. demande',
      flex: 1,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getTypeCol(): ColDef {
    return {
      field: 'typact',
      headerName: 'Type',
      flex: 1,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getDateDebutCol(): ColDef {
    return {
      field: 'ddodeb',
      headerName: 'Date début',
      flex: 1,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueFormatter: params => SharedUtil.formatDateToDDMMYYYYHHMMSS(params.value),
    };
  }

  private getDateFinCol(): ColDef {
    return {
      field: 'ddofin',
      headerName: 'Date fin',
      flex: 1,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueFormatter: params => SharedUtil.formatDateToDDMMYYYYHHMMSS(params.value),
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }
}
