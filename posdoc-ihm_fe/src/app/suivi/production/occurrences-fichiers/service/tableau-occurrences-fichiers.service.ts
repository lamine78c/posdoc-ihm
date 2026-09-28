import { inject, Injectable } from '@angular/core';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { TableauUtilService } from '@app/services/tableau-util.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { PopupFichierCellRendererComponent } from './popup-fichier-cell-renderer.component';
import { PopupPeriodeCellRendererComponent } from './popup-periode-cell-renderer.component';

@Injectable({
  providedIn: 'root',
})
export class TableauOccurrencesFichiersService {
  private readonly tableauUtilService = inject(TableauUtilService);

  private readonly NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour sélectionner les occurrences de fichiers à charger</b>';

  private modalCallback: (codenv: string, codorg: string, codapp: string) => void;

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      this.tableauUtilService.getColClearFilter(),
      this.getColApplication(),
      this.getColPeriode(),
      this.getColFichier(),
      this.getColCodePrd(),
      this.getColStatut(),
      this.getColRefection(),
      this.getColFicVide(),
      this.getColDateAppli(),
      this.getColDateDebut(),
      this.getColDateFin(),
    ];
  }

  private getColApplication(): ColDef {
    return {
      headerName: 'Application',
      field: 'application',
      flex: 1.2,
      minWidth: 120,
      sort: 'asc',
      sortable: true,
      sortIndex: 1,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      valueGetter: params => {
        const { codenv, codorg, codapp } = params.data;
        if (codenv && codorg && codapp) {
          return `${codenv}-${codorg}-${codapp}`;
        }
        return '';
      },
      cellRenderer: params => {
        const { codenv, codorg, codapp } = params.data;
        if (codenv && codorg && codapp) {
          return `<a href="javascript:void(0)" class="link-application">${codenv}-${codorg}-${codapp}</a>`;
        }
        return '';
      },
      onCellClicked: params => {
        const target = params.event.target as HTMLElement;
        if (target && target.classList.contains('link-application')) {
          const { codenv, codorg, codapp } = params.data;
          this.openCommandeDetailsModal(codenv, codorg, codapp);
        }
      },
    };
  }

  private openCommandeDetailsModal(codenv: string, codorg: string, codapp: string): void {
    if (this.modalCallback) {
      this.modalCallback(codenv, codorg, codapp);
    }
  }

  setModalCallback(callback: (codenv: string, codorg: string, codapp: string) => void): void {
    this.modalCallback = callback;
  }

  private getColPeriode(): ColDef {
    return {
      headerName: 'Période',
      field: 'percod',
      flex: 1.2,
      minWidth: 120,
      sort: 'desc',
      sortable: true,
      sortIndex: 2,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      cellRenderer: PopupPeriodeCellRendererComponent,
    };
  }

  private getColFichier(): ColDef {
    return {
      headerName: 'Fichier',
      field: 'fichier',
      flex: 1.3,
      minWidth: 130,
      sort: 'asc',
      sortable: true,
      sortIndex: 3,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      valueGetter: params => {
        const { codcom, codfic, numcom } = params.data;
        if (codcom && codfic && numcom) {
          return `${codcom}${codfic}-${numcom}`;
        }
        return '';
      },
      cellRenderer: PopupFichierCellRendererComponent,
    };
  }

  private getColCodePrd(): ColDef {
    return {
      headerName: 'Code Prd',
      field: 'codprd',
      flex: 1,
      minWidth: 100,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColStatut(): ColDef {
    return {
      headerName: 'Statut',
      field: 'statut',
      flex: 1,
      minWidth: 100,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      valueGetter: params => {
        const { ficsta, ficinf } = params.data;
        if (ficsta && ficinf) {
          return `${ficsta}-${ficinf}`;
        }
        return ficsta || '';
      },
    };
  }

  private getColRefection(): ColDef {
    return {
      headerName: 'Réfection',
      field: 'frefec',
      flex: 1,
      minWidth: 100,
      sortable: true,
      cellRenderer: InterrupteurRadioComponent,
      cellRendererParams: {
        formKey: 'frefec',
        isAllTimeClickable: false,
        isnotEditableOnNewRow: true,
      },
      valueGetter: params => params.data?.frefec ?? false,
    };
  }

  private getColFicVide(): ColDef {
    return {
      headerName: 'Fic vide ?',
      field: 'ficvid',
      flex: 1,
      minWidth: 100,
      sortable: true,
      cellRenderer: InterrupteurRadioComponent,
      cellRendererParams: {
        formKey: 'ficvid',
        isAllTimeClickable: false,
        isnotEditableOnNewRow: true,
      },
      valueGetter: params => params.data?.ficvid ?? false,
    };
  }

  private getColDateAppli(): ColDef {
    return {
      headerName: 'Date appli',
      field: 'dappcr',
      flex: 1.5,
      minWidth: 180,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {
        isFormatDDMMYYYYCustomSort: true,
      },
      cellRenderer: params => SharedUtil.formatDateToDDMMYYYYHHMMSS(params.data.dappcr),
      filterValueGetter: params => SharedUtil.formatDateToDDMMYYYY(params.data.dappcr),
    };
  }

  private getColDateDebut(): ColDef {
    return {
      headerName: 'Date début',
      field: 'dfichd',
      flex: 1.5,
      minWidth: 180,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {
        isFormatDDMMYYYYCustomSort: true,
      },
      cellRenderer: params => SharedUtil.formatDateToDDMMYYYYHHMMSS(params.data.dfichd),
      filterValueGetter: params => SharedUtil.formatDateToDDMMYYYY(params.data.dfichd),
    };
  }

  private getColDateFin(): ColDef {
    return {
      headerName: 'Date fin',
      field: 'dficht',
      flex: 1.5,
      minWidth: 180,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {
        isFormatDDMMYYYYCustomSort: true,
      },
      cellRenderer: params => SharedUtil.formatDateToDDMMYYYYHHMMSS(params.data.dficht),
      filterValueGetter: params => SharedUtil.formatDateToDDMMYYYY(params.data.dficht),
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefs();
  }
}
