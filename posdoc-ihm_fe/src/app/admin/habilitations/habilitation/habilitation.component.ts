import { Component } from '@angular/core';
import { ColDef, GetDataPath } from 'ag-grid-community';

@Component({
  selector: 'app-habilitation',
  templateUrl: './habilitation.component.html',
  styleUrls: ['./habilitation.component.scss'],
  standalone: false,
})
export class HabilitationComponent {
  public rowData: any[] | null = [
    { orgHierarchy: ['A'] },
    { orgHierarchy: ['A', 'B'] },
    { orgHierarchy: ['C', 'D'] },
    { orgHierarchy: ['E', 'F', 'G', 'H'] },
  ];
  public columnDefs: ColDef[] = [
    // we're using the auto group column by default!
    {
      field: 'groupType',
      valueGetter: params => {
        return params.data ? 'Provided' : 'Filler';
      },
    },
  ];
  public defaultColDef: ColDef = {
    flex: 1,
  };
  public autoGroupColumnDef: ColDef = {
    headerName: 'Organisation Hierarchy',
    cellRendererParams: {
      suppressCount: true,
    },
  };
  public groupDefaultExpanded = -1;
  public getDataPath: GetDataPath = (data: any) => {
    return data.orgHierarchy;
  };
}
