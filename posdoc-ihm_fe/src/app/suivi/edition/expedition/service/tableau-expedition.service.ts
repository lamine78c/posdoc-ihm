import { Injectable } from '@angular/core';
import { CustomTooltipComponent } from '@app/fullstack-components/tableau/ag-grid-components/custom-tooltip/custom-tooltip.component';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FormatUtil } from '@app/shared/utils/FormatUtil';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef, ITooltipParams } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauExpeditionService {
  constructor(private tableauUtilService: TableauUtilService) {}

  private NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour sélectionner les expéditions à charger</b>';

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      this.tableauUtilService.getColClearFilter(),
      this.getColEnv(),
      this.getColRegion(),
      this.getColOrg(),
      this.getColApp(),
      this.getColPeriode(),
      this.getColFichier(),
      this.getColProduit(),
      this.getColImprime(),
      this.getColDesignation(),
      this.getColClient(),
      this.getColSiteExpedition(),
      this.getColPages(),
      this.getColDateExpedition(),
    ];
  }

  private getColEnv(): ColDef {
    return {
      headerName: 'Env.',
      field: 'codenv',
      flex: 1,
      minWidth: 70,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColRegion(): ColDef {
    return {
      field: 'codeRegion',
      headerName: 'Rég.',
      sort: 'asc',
      sortIndex: 1,
      sortable: true,
      flex: 1,
      minWidth: 70,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColOrg(): ColDef {
    return {
      headerName: 'Org.',
      field: 'codorg',
      sort: 'asc',
      sortable: true,
      sortIndex: 3,
      flex: 1,
      minWidth: 70,
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
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColPeriode(): ColDef {
    return {
      headerName: 'Période',
      field: 'percod',
      sort: 'desc',
      sortable: true,
      sortIndex: 2,
      flex: 1.2,
      minWidth: 110,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColFichier(): ColDef {
    return {
      headerName: 'Fichier',
      field: 'codfic',
      sort: 'asc',
      sortable: true,
      sortIndex: 5,
      flex: 1,
      minWidth: 110,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      valueGetter: params => {
        const { codcom, codfic } = params.data;
        if (codcom && codfic) {
          return `${codcom}-${codfic}`;
        }
        return codfic || '';
      },
      tooltipComponent: CustomTooltipComponent,
      tooltipValueGetter: (params: ITooltipParams) => (params.data && params.data.libfic ? params.data.libfic : ''),
    };
  }

  private getColProduit(): ColDef {
    return {
      headerName: 'Code Prd',
      field: 'codprd',
      sortable: true,
      flex: 1,
      minWidth: 110,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColImprime(): ColDef {
    return {
      headerName: 'Imprimé',
      field: 'refimp',
      sortable: true,
      flex: 1,
      minWidth: 110,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColDesignation(): ColDef {
    return {
      headerName: 'Désignation',
      field: 'libfic',
      flex: 1.5,
      minWidth: 150,
      initialHide: true,
    };
  }

  private getColClient(): ColDef {
    return {
      headerName: 'Client',
      field: 'codcli',
      sortable: true,
      flex: 1,
      minWidth: 80,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColSiteExpedition(): ColDef {
    return {
      headerName: 'Site expédition',
      field: 'codsit',
      sortable: true,
      flex: 1.5,
      minWidth: 130,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColPages(): ColDef {
    return {
      headerName: 'Pages',
      field: 'pagfic',
      sortable: true,
      flex: 1,
      minWidth: 80,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      cellStyle: { 'justify-content': 'flex-end' },
      valueFormatter: params => {
        return FormatUtil.formatNumberWithThousandSeparators(params.value);
      },
    };
  }

  private getColDateExpedition(): ColDef {
    return {
      headerName: 'Date expédition',
      field: 'dfiexp',
      sortable: true,
      flex: 1.5,
      minWidth: 140,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {
        isFormatDDMMYYYYCustomSort: true,
      },
      cellRenderer: function (params) {
        return SharedUtil.formatDateToDDMMYYYY(params.data.dfiexp);
      },
      valueGetter: function (params) {
        return SharedUtil.formatDateToDDMMYYYY(params.data.dfiexp);
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
