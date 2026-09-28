import { Injectable } from '@angular/core';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { TableauUtilService } from '@app/services/tableau-util.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ColDef, ColGroupDef } from 'ag-grid-community';

type ColAll = ColDef | ColGroupDef | any;

@Injectable({
  providedIn: 'root',
})
export class TableauDocumentDematerialiseService {
  constructor(private tableauUtilService: TableauUtilService) {
    //nop
  }

  private NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour sélectionner les documents à charger</b>';

  private getColumDefs(): ColAll[] {
    return [
      this.getColEmpty(),
      this.getColId(),
      this.getColumCodEnv(),
      this.getColumCodeRegion(),
      this.getColumCodorg(),
      this.getColumCodApp(),
      this.getColumDocument(),
      this.getColumTypact(),
      //Split
      this.getColumCodeSiteDematerialisation(),
      this.getColumStatut(),
      this.getColumPercod(),
      this.getColumImprim(),
      this.getColumRefdem(),
      this.getColumProduit(),
      this.getColumLibinf(),
      this.getColumDdodeb(),
      this.getColumDdofin(),
      this.getColumDdosus(),
      this.getColumTpscom(),
    ];
  }

  private getColEmpty(): ColAll {
    const params = {
      pinned: true,
    };
    return this.tableauUtilService.getColClearFilter(params);
  }

  private getColId(): ColAll {
    return {
      field: 'id',
      headerName: 'Identifiant',
      pinned: 'left',
      width: 100,
      minWidth: 100,
      sortable: true,
      sort: 'desc',
      sortIndex: 1,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      comparator: (valueA, valueB): number => {
        // Extract datdem and numdem parts from id (the format is datdem-numdem)
        const [datdemA, numdemA] = valueA.split('-');
        const [datdemB, numdemB] = valueB.split('-');

        // First compare by datdem
        const datdemANum = parseInt(datdemA, 10);
        const datdemBNum = parseInt(datdemB, 10);
        if (datdemANum < datdemBNum) {
          return -1;
        }
        if (datdemANum > datdemBNum) {
          return 1;
        }

        // If datdem parts are equal, compare by numdem
        const numdemANum = parseInt(numdemA, 10);
        const numdemBNum = parseInt(numdemB, 10);
        if (numdemANum < numdemBNum) {
          return -1;
        }
        if (numdemANum > numdemBNum) {
          return 1;
        }

        return 0;
      },
    };
  }

  private getColumCodEnv(): ColAll {
    return {
      field: 'codenv',
      headerName: 'Env.',
      pinned: 'left',
      width: 80,
      minWidth: 50,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColumCodeRegion(): ColAll {
    return {
      field: 'codeRegion',
      headerName: 'Rég.',
      pinned: 'left',
      width: 80,
      minWidth: 50,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColumCodorg(): ColAll {
    return {
      field: 'codorg',
      headerName: 'Org.',
      pinned: 'left',
      width: 80,
      minWidth: 50,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectHierarchiseeFloatingFilter',
      floatingFilterComponentParams: {
        possibleValues: [],
      },
    };
  }

  private getColumCodApp(): ColAll {
    return {
      field: 'codapp',
      headerName: 'App.',
      pinned: 'left',
      width: 80,
      minWidth: 60,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColumDocument(): ColAll {
    return {
      field: 'document',
      headerName: 'Document',
      pinned: 'left',
      width: 100,
      minWidth: 100,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColumTypact(): ColAll {
    return {
      field: 'typact',
      headerName: 'Type',
      pinned: 'left',
      width: 110,
      minWidth: 110,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColumCodeSiteDematerialisation(): ColAll {
    return {
      field: 'codeSiteDematerialisation',
      headerName: 'Site',
      width: 80,
      minWidth: 80,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColumStatut(): ColAll {
    return {
      field: 'statut',
      headerName: 'Statut',
      minWidth: 70,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColumPercod(): ColAll {
    return {
      field: 'percod',
      headerName: 'Période',
      minWidth: 80,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColumImprim(): ColAll {
    return {
      field: 'imprim',
      headerName: 'Imprimé',
      minWidth: 80,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'listFloatingFilter',
      floatingFilterComponentParams: {
        possibleLabelWithValues: [
          { label: 'Vrai', value: true },
          { label: 'Faux', value: false },
        ],
        suppressFilterButton: true,
      },
      cellRenderer: InterrupteurRadioComponent,
      cellRendererParams: {
        formKey: 'imprim',
      },
    };
  }

  private getColumRefdem(): ColAll {
    return {
      field: 'refdem',
      headerName: 'Référence',
      minWidth: 120,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColumProduit(): ColAll {
    return {
      field: 'produit',
      headerName: 'Produit',
      minWidth: 100,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColumLibinf(): ColAll {
    return {
      field: 'libinf',
      headerName: 'Anomalie',
      minWidth: 120,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColumDdodeb(): ColAll {
    return {
      field: 'ddodeb',
      headerName: 'Débuté',
      minWidth: 140,
      sortable: true,
      sort: 'desc',
      sortIndex: 0,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueFormatter: params => {
        return params.data.ddodeb ? SharedUtil.formatDateToDDMMYYYYHHMMSS(params.data.ddodeb) : '';
      },
    };
  }

  private getColumDdofin(): ColAll {
    return {
      field: 'ddofin',
      headerName: 'Terminé',
      minWidth: 140,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueFormatter: params => {
        return params.data.ddofin ? SharedUtil.formatDateToDDMMYYYYHHMMSS(params.data.ddofin) : '';
      },
    };
  }

  private getColumDdosus(): ColAll {
    return {
      field: 'ddosus',
      headerName: 'Suspendu',
      minWidth: 140,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      valueFormatter: params => {
        return params.data.ddosus ? SharedUtil.formatDateToDDMMYYYYHHMMSS(params.data.ddosus) : '';
      },
    };
  }

  private getColumTpscom(): ColAll {
    return {
      field: 'tpscom',
      headerName: 'Durée',
      minWidth: 80,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef | any)[] {
    return this.getColumDefs();
  }
}
