import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauNoticesFichierService {
  private readonly NO_ROWS_TEXT = 'Aucune notice';

  getColumnDefs(): ColDef[] {
    return [this.getNoticeCol(), this.getPoidsCol(), this.getFormatCol(), this.getPorteeCol(), this.getDesignationCol()];
  }

  private getNoticeCol(): ColDef {
    return {
      field: 'codnot',
      headerName: 'Notice',
      sort: 'asc',
      maxWidth: 130,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getPoidsCol(): ColDef {
    return {
      field: 'poinot',
      headerName: 'Poids',
      maxWidth: 130,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellStyle: { 'justify-content': 'flex-end' },
    };
  }

  private getFormatCol(): ColDef {
    return {
      field: 'fornot',
      headerName: 'Format',
      maxWidth: 105,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getPorteeCol(): ColDef {
    return {
      field: 'pornot',
      headerName: 'Portée',
      maxWidth: 130,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      valueGetter: params => `${params.data.pornot}-${params.data.codsit}`,
    };
  }

  private getDesignationCol(): ColDef {
    return {
      field: 'libnot',
      headerName: 'Désignation',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }
}
