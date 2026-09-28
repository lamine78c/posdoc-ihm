import { Injectable } from '@angular/core';
import { CustomTooltipComponent } from '@app/fullstack-components/tableau/ag-grid-components/custom-tooltip/custom-tooltip.component';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, ITooltipParams } from 'ag-grid-community';
import { PopupCellRendererComponent } from '../../action/service/popup-cell-renderer.component';

@Injectable({
  providedIn: 'root',
})
export class TableauActionDetailsService {
  constructor() {
    // do nothing
  }

  private getColumDefs(): (ColDef | ColGroupDef | any)[] {
    return [
      this.getColId(),
      this.getColUser(),
      this.getColStation(),
      this.getColDate(),
      this.getColAction(),
      this.getColEntity(),
      this.getColClauseWhere(),
      this.getColBeforeValue(),
      this.getColAfterValue(),
    ];
  }

  private getColId() {
    return {
      headerName: 'ID',
      field: 'id',
      sortable: false,
      width: 60,
      maxWidth: 60,
      cellRenderer: PopupCellRendererComponent,
    };
  }

  private getColUser() {
    return {
      headerName: 'Utilisateur',
      field: 'utilisateur',
      sortable: false,
      width: 110,
      maxWidth: 110,
    };
  }

  private getColStation() {
    return {
      headerName: 'Station',
      field: 'station',
      sortable: false,
      width: 110,
      maxWidth: 110,
    };
  }

  private getColDate() {
    return {
      headerName: 'Date Maj',
      field: 'insertionDate',
      sortable: false,
      width: 100,
      maxWidth: 100,
      valueGetter: function (params) {
        return SharedUtil.formatDateToDDMMYYYYHHMMSS(params.data.insertionDate);
      },
    };
  }

  private getColAction() {
    return {
      headerName: 'Action',
      field: 'actionUtilisateur',
      sortable: false,
      width: 80,
      maxWidth: 80,
    };
  }

  private getColEntity() {
    return {
      headerName: 'Entité',
      field: 'entite',
      sortable: false,
      width: 80,
      maxWidth: 80,
    };
  }

  private getColClauseWhere() {
    return {
      headerName: 'Clause WHERE',
      field: 'condition',
      sortable: false,
      cellClassRules: {
        'cell-multi-line': params => params.value?.toUpperCase().includes('AND'),
      },
      flex: 1,
      tooltipComponent: CustomTooltipComponent,
      tooltipValueGetter: (params: ITooltipParams) => (params.data && params.data.condition ? params.data.condition : ''),
    };
  }

  private getColBeforeValue() {
    return {
      headerName: 'Clause SET avant Maj',
      field: 'entree',
      sortable: false,
      cellClassRules: {
        'cell-multi-line': params => params.value?.includes(','),
      },
      flex: 1,
      tooltipComponent: CustomTooltipComponent,
      tooltipValueGetter: (params: ITooltipParams) => (params.data && params.data.entree ? params.data.entree : ''),
    };
  }

  private getColAfterValue() {
    return {
      headerName: 'Clause SET après Maj',
      field: 'sortie',
      sortable: false,
      cellClassRules: {
        'cell-multi-line': params => params.value?.includes(','),
      },
      flex: 1,
      tooltipComponent: CustomTooltipComponent,
      tooltipValueGetter: (params: ITooltipParams) => (params.data && params.data.sortie ? params.data.sortie : ''),
    };
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefs();
  }
}
