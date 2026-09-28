import { Injectable } from '@angular/core';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { DateUtil } from '@app/shared/utils/DateUtil';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { CellClickedEvent, ColDef, ValueGetterParams } from 'ag-grid-community';
import { PopupFichierCellRendererComponent } from '../../occurrences-fichiers/service/popup-fichier-cell-renderer.component';

@Injectable({
  providedIn: 'root',
})
export class TableauOccurrenceApplicationService {
  private readonly NO_ROWS_TEXT = "<b>Veuillez remplir le formulaire pour sélectionner les occurrences d'application à charger</b>";

  private commandeModalCallback: (codenv: string, codorg: string, codapp: string) => void;
  private detailsOccurrenceModalCallback: (paramData: OngletsParamDataModel) => void;

  getColumnDefs(): ColDef[] {
    return [
      this.getColPlus(),
      this.getColApplication(),
      this.getColPeriode(),
      this.getColSiteFichier(),
      this.getColCodeProd(),
      this.getColStatut(),
      this.getColRefection(),
      this.getColFichierVide(),
      this.getColDateAppli(),
      this.getColDateDebut(),
      this.getColDateFin(),
      this.getColDateSuspension(),
      this.getColManuel(),
    ];
  }

  private getColPlus(): ColDef {
    return {
      field: 'codenv_codorg_codapp_percod',
      headerName: '',
      rowGroup: true,
      rowGroupIndex: 0,
      hide: true,
      lockPosition: 'left',
      width: 35,
      minWidth: 35,
      maxWidth: 35,
    };
  }

  private getColApplication(): ColDef {
    return {
      field: 'codenv',
      headerName: 'Application',
      minWidth: 110,
      sort: 'asc',
      sortIndex: 1,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFieldsAllConcat(params, ['codenv', 'codorg', 'codapp'], [], '-'),
      filterValueGetter: (params: ValueGetterParams) => `${params.data.codenv}-${params.data.codorg}-${params.data.codapp}`,
      cellRenderer: params => {
        if (params.node.group) {
          if (params.value && params.value !== '') {
            return `<a href="javascript:void(0)" class="link-application">${params.value}</a>`;
          }
        }
      },
      onCellClicked: params => {
        const target = params.event.target as HTMLElement;
        if (target?.classList.contains('link-application')) {
          const [codenv, codorg, codapp] = params.value.split('-');
          this.openCommandeDetailsModal(codenv, codorg, codapp);
        }
      },
    };
  }

  private openCommandeDetailsModal(codenv: string, codorg: string, codapp: string): void {
    if (this.commandeModalCallback) {
      this.commandeModalCallback(codenv, codorg, codapp);
    }
  }

  setCommandeModalCallback(callback: (codenv: string, codorg: string, codapp: string) => void): void {
    this.commandeModalCallback = callback;
  }

  private getColPeriode(): ColDef {
    return {
      field: 'percod',
      headerName: 'Période',
      minWidth: 88,
      sort: 'desc',
      sortIndex: 2,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'percod', ''),
      filterValueGetter: (params: ValueGetterParams) => params.data.percod,
      cellRenderer: params => {
        if (params.node.group) {
          if (params.value && params.value !== '') {
            return `<a href="javascript:void(0)" class="link-application">${params.value}</a>`;
          }
        }
      },
      onCellClicked: (params: CellClickedEvent) => {
        const target = params.event.target as HTMLElement;
        if (target?.classList.contains('link-application')) {
          const paramData = this.getOngletsParamData(params);
          this.openDetailsOccurrenceModal(paramData);
        }
      },
    };
  }

  private getOngletsParamData(params: CellClickedEvent): OngletsParamDataModel {
    const firstChildData = params.node.allLeafChildren[0]?.data;
    return {
      codEnv: firstChildData.codenv,
      codOrg: firstChildData.codorg,
      codApp: firstChildData.codapp,
      perCod: firstChildData.percod,
    };
  }

  private openDetailsOccurrenceModal(paramData: OngletsParamDataModel): void {
    if (this.detailsOccurrenceModalCallback) {
      this.detailsOccurrenceModalCallback(paramData);
    }
  }

  setDetailsOccurrenceModalCallback(callback: (paramData: OngletsParamDataModel) => void): void {
    this.detailsOccurrenceModalCallback = callback;
  }

  private getColSiteFichier(): ColDef {
    return {
      field: 'codsit',
      headerName: 'Site/Fichier',
      minWidth: 105,
      sort: 'asc',
      sortIndex: 3,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFieldsConcat(params, 'codsit', ['codcom', 'codfic', 'numcom'], '-'),
      filterValueGetter: (params: ValueGetterParams) => `${params.data.codsit}-${params.data.codcom}-${params.data.codfic}-${params.data.numcom}`,
      cellRenderer: PopupFichierCellRendererComponent,
    };
  }

  private getColCodeProd(): ColDef {
    return {
      field: 'codprd',
      headerName: 'Code Prd',
      minWidth: 93,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColStatut(): ColDef {
    return {
      field: 'statut',
      headerName: 'Statut',
      minWidth: 80,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFieldsAllConcat(params, ['appsta', 'appinf'], ['ficsta', 'ficinf'], '-'),
      filterValueGetter: (params: ValueGetterParams) => `${params.data.appsta}-${params.data.appinf}-${params.data.ficsta}-${params.data.ficinf}`,
    };
  }

  private getColRefection(): ColDef {
    return {
      field: 'frefec',
      headerName: 'Réfection?',
      minWidth: 100,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'listFloatingFilter',
      floatingFilterComponentParams: {
        possibleLabelWithValues: [
          { label: 'Oui', value: true },
          { label: 'Non', value: false },
        ],
        suppressFilterButton: true,
      },
      cellRenderer: InterrupteurRadioComponent,
      cellRendererParams: params => ({
        formKey: params.node.group ? 'arefec' : 'frefec',
      }),
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'arefec', 'frefec'),
      filterValueGetter: (params: ValueGetterParams) => params.data.frefec,
    };
  }

  private getColFichierVide(): ColDef {
    return {
      field: 'ficvid',
      headerName: 'Fic. vide?',
      minWidth: 100,
      cellRenderer: InterrupteurRadioComponent,
      cellRendererParams: {
        formKey: 'ficvid',
      },
    };
  }

  private getColDateAppli(): ColDef {
    return {
      field: 'dappcr',
      headerName: 'Date appli.',
      flex: 1,
      minWidth: 140,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {
        isFormatDDMMYYYYCustomSort: true,
      },
      valueFormatter: param => DateUtil.formatDateToDDMMYYYYHHMMSS(param.value),
      filterValueGetter: (params: ValueGetterParams) => DateUtil.formatDateToDDMMYYYY(params.data.dappcr),
    };
  }

  private getColDateDebut(): ColDef {
    return {
      field: 'dfichd',
      headerName: 'Date début',
      flex: 1,
      minWidth: 140,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {
        isFormatDDMMYYYYCustomSort: true,
      },
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'dappld', 'dfichd'),
      filterValueGetter: (params: ValueGetterParams) => DateUtil.formatDateToDDMMYYYY(SharedUtil.getGroupedFields(params, 'dappld', 'dfichd')),
      valueFormatter: param => DateUtil.formatDateToDDMMYYYYHHMMSS(param.value),
    };
  }

  private getColDateFin(): ColDef {
    return {
      field: 'dficht',
      headerName: 'Date fin',
      flex: 1,
      minWidth: 140,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {
        isFormatDDMMYYYYCustomSort: true,
      },
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'dapplt', 'dficht'),
      filterValueGetter: (params: ValueGetterParams) => DateUtil.formatDateToDDMMYYYY(SharedUtil.getGroupedFields(params, 'dapplt', 'dficht')),
      valueFormatter: param => DateUtil.formatDateToDDMMYYYYHHMMSS(param.value),
    };
  }

  private getColDateSuspension(): ColDef {
    return {
      field: 'dfichs',
      headerName: 'Date suspension',
      flex: 1,
      minWidth: 140,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {
        isFormatDDMMYYYYCustomSort: true,
      },
      valueGetter: (params: ValueGetterParams) => SharedUtil.getGroupedFields(params, 'dappls', 'dfichs'),
      filterValueGetter: (params: ValueGetterParams) => DateUtil.formatDateToDDMMYYYY(SharedUtil.getGroupedFields(params, 'dappls', 'dfichs')),
      valueFormatter: param => DateUtil.formatDateToDDMMYYYYHHMMSS(param.value),
    };
  }

  private getColManuel(): ColDef {
    return {
      field: 'manuel',
      headerName: 'Manuel?',
      minWidth: 90,
      cellRenderer: InterrupteurRadioComponent,
      cellRendererParams: {
        formKey: 'manuel',
      },
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }
}
