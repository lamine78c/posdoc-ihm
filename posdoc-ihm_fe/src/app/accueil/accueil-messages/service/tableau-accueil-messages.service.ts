import { Injectable } from "@angular/core";
import { ColDef } from "ag-grid-community";

@Injectable({
  providedIn: 'root'
})
export class TableauAccueilMessagesService {
  public getColumnDefs(): ColDef[] {
    return [
      this.getTitleCol(),
      this.getMessageCol(),
    ]
  }

  private getTitleCol(): ColDef {
    return {
      headerName: 'Titre',
      field: 'titre',
      flex: 1,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    }
  }

  private getMessageCol(): ColDef {
    return {
      headerName: 'Message',
      field: 'message',
      flex: 3,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: params => {
        return params.value ? params.value : '';
      },
    }
  }
}
