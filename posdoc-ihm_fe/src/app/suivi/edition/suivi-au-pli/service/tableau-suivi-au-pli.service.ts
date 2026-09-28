import { Injectable } from '@angular/core';
import { CustomTooltipComponent } from '@app/fullstack-components/tableau/ag-grid-components/custom-tooltip/custom-tooltip.component';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ColDef, ColGroupDef, ITooltipParams } from 'ag-grid-community';
import { getFullAdresse } from '../model/adresse-pli';
import { getEtatPliHtml, getEtatPliText } from '../model/etat-pli';
import { CompteRendererComponent } from './compte-renderer.component';
import { PopupCellRendererComponent } from './popup-cell-renderer.component';

@Injectable({
  providedIn: 'root',
})
export class TableauSuiviAuPliService {
  constructor(private tableauUtilService: TableauUtilService) {}

  private NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour sélectionner les plis à charger</b>';

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      this.tableauUtilService.getColClearFilter(),
      this.getColEtat(),
      this.getColIsSuiviAR(),
      this.getColSmartData(),
      this.getColCompte(),
      this.getColAdresse(),
      this.getColDatDep(),
      this.getColNumDep(),
      this.getColEnv(),
      this.getColOrg(),
      this.getColApp(),
      this.getColComFic(),
      this.getColPeriode(),
    ];
  }

  private getColIsSuiviAR(): ColDef {
    return {
      headerName: 'avec AR',
      field: 'codgam',
      initialHide: true,
    };
  }

  private getColDatDep(): ColDef {
    return {
      headerName: 'Date de dépôt',
      field: 'datdep',
      sortable: true,
      flex: 1,
      minWidth: 90,
      maxWidth: 90,
      width: 90,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColNumDep(): ColDef {
    return {
      headerName: 'Numéro de dépôt',
      field: 'mpsidd',
      sortable: true,
      flex: 1,
      minWidth: 100,
      maxWidth: 100,
      width: 100,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColEnv(): ColDef {
    return {
      headerName: 'Env.',
      field: 'codenv',
      flex: 1,
      minWidth: 70,
      maxWidth: 70,
      width: 70,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColOrg(): ColDef {
    return {
      headerName: 'Org.',
      field: 'codorg',
      sortable: true,
      flex: 1,
      minWidth: 70,
      maxWidth: 70,
      width: 70,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectHierarchiseeFloatingFilter',
      floatingFilterComponentParams: {
        possibleValues: [],
      },
    };
  }

  private getColApp(): ColDef {
    return {
      headerName: 'App.',
      field: 'codapp',
      sortable: true,
      flex: 1,
      minWidth: 70,
      maxWidth: 70,
      width: 70,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColComFic(): ColDef {
    return {
      headerName: 'Fic.',
      field: 'comfic',
      sortable: true,
      flex: 1,
      minWidth: 90,
      maxWidth: 90,
      width: 90,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColPeriode(): ColDef {
    return {
      headerName: 'Période',
      field: 'percod',
      sortable: true,
      flex: 1,
      minWidth: 90,
      maxWidth: 90,
      width: 90,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColEtat(): ColDef {
    return {
      headerName: 'Etat',
      field: 'status',
      sortable: true,
      flex: 1,
      minWidth: 125,
      maxWidth: 125,
      width: 125,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      cellRenderer: function (params) {
        const html = getEtatPliHtml(params.data.status, params.data.codgam);
        return ' <h2 class="d-flex">' + html + '</h2> ';
      },
      valueGetter: function (params) {
        const sep = ' - ';
        return params.data.status + sep + getEtatPliText(params.data.status);
      },
      tooltipComponent: CustomTooltipComponent,
      tooltipValueGetter: (params: ITooltipParams) => params.data && getEtatPliText(params.data.status),
    };
  }

  private getColSmartData(): ColDef {
    return {
      headerName: 'SmartData',
      field: 'numpli',
      sortIndex: 1,
      sortable: true,
      sort: 'desc',
      flex: 1,
      minWidth: 125,
      maxWidth: 125,
      width: 125,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: PopupCellRendererComponent,
    };
  }

  private getColCompte(): ColDef {
    return {
      headerName: 'Compte',
      field: 'idtpli',
      sortable: true,
      flex: 1,
      minWidth: 160,
      maxWidth: 250,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: CompteRendererComponent,
    };
  }

  private getColAdresse(): ColDef {
    return {
      headerName: 'Adresse',
      field: 'adresse',
      sortable: true,
      flex: 1,
      minWidth: 230,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: function (params) {
        const sep = '<br>';
        return getFullAdresse(params.data, sep);
      },
      valueGetter: function (params) {
        const sep = '';
        return getFullAdresse(params.data, sep);
      },
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefs();
  }
}
