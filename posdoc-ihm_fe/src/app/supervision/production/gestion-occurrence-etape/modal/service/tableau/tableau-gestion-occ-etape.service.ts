import { Injectable } from '@angular/core';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { TableauUtilService } from '@app/services/tableau-util.service';

@Injectable({
  providedIn: 'root',
})
export class TableauGestionOccEtapeService {
  constructor(private tableauUtilService: TableauUtilService) {}

  private NO_ROWS_TEXT = "Aucun fichier et produit pour l'occurrence d'application sélectionnée";

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefs();
  }

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      this.getColStatut(),
      this.getColInfo(),
      this.getColType(),
      this.getColApplication(),
      this.getColPeriode(),
      this.getColFichier(),
      this.getColGamme(),
      this.getColRessource(),
      this.getColDestinataire(),
      this.getColServeur(),
      this.getColScript(),
      this.getColReedite(),
      this.getColDateCreation(),
      this.getColDateValidation(),
      this.getColDateDebut(),
      this.getColDateTerminaison(),
      this.getColDateSuspension(),
      this.getColDateInvalidation(),
    ];
  }

  private getColStatut(): ColDef | ColGroupDef | any {
    return {
      headerName: 'Statut',
      field: 'statut',
      width: 80,
      minWidth: 80,
      maxWidth: 100,
    };
  }

  private getColInfo(): ColDef | ColGroupDef {
    return {
      headerName: 'Info',
      field: 'codinf',
      width: 80,
      minWidth: 80,
      maxWidth: 100,
    };
  }

  private getColType(): ColDef | ColGroupDef {
    return {
      headerName: 'Type',
      field: 'typetp',
      width: 80,
      minWidth: 80,
      maxWidth: 100,
    };
  }

  private getColApplication(): ColDef | ColGroupDef {
    return {
      headerName: 'Application',
      field: 'codapp',
      width: 110,
      minWidth: 110,
      maxWidth: 120,
      valueGetter: params => {
        if (params.data) {
          return params.data.codenv + '-' + params.data.codorg + '-' + params.data.codapp;
        }
      },
    };
  }

  private getColPeriode(): ColDef | ColGroupDef {
    return {
      headerName: 'Période',
      field: 'percod',
      width: 110,
      minWidth: 110,
      maxWidth: 120,
    };
  }

  private getColFichier(): ColDef | ColGroupDef {
    return {
      headerName: 'Fichier',
      field: 'codfic',
      width: 110,
      minWidth: 110,
      maxWidth: 120,
      valueGetter: params => {
        if (params.data && params.data.codcom) {
          return params.data.codcom + params.data.codfic + '-' + params.data.numcom;
        }
      },
    };
  }
  private getColGamme(): ColDef | ColGroupDef {
    return {
      headerName: 'Gamme',
      field: 'codgam',
      width: 100,
      minWidth: 100,
      maxWidth: 110,
    };
  }

  private getColRessource(): ColDef | ColGroupDef {
    return {
      headerName: 'Ressource',
      field: 'codres',
      width: 150,
      minWidth: 150,
      maxWidth: 200,
      valueGetter: params => {
        if (params.data && params.data.codres) {
          return params.data.codsit + '-' + params.data.codres;
        }
      },
    };
  }

  private getColDestinataire(): ColDef | ColGroupDef {
    return {
      headerName: 'Destinataire',
      field: 'coddes',
      width: 150,
      minWidth: 150,
      maxWidth: 200,
    };
  }
  private getColServeur(): ColDef | ColGroupDef {
    return {
      headerName: 'Serveur',
      field: 'codser',
      width: 120,
      minWidth: 120,
      maxWidth: 150,
    };
  }

  private getColScript(): ColDef | ColGroupDef {
    return {
      headerName: 'Script',
      field: 'script',
      width: 400,
      minWidth: 400,
      maxWidth: 500,
    };
  }

  private getColReedite(): ColDef | ColGroupDef {
    return {
      headerName: 'Réédité ?',
      field: 'reedit',
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      valueGetter: params => {
        if (params.data) {
          return params.data.reedit ? 'Oui' : 'Non';
        }
      },
    };
  }

  private getColDateCreation(): ColDef | ColGroupDef {
    return {
      headerName: 'Date création',
      field: 'create',
      width: 150,
      minWidth: 150,
      maxWidth: 200,
      valueFormatter: params => {
        if (params.value) {
          return SharedUtil.formatDateToDDMMYYYYHHMMSS(params.value);
        }
      },
    };
  }

  private getColDateValidation(): ColDef | ColGroupDef {
    return {
      headerName: 'Date validation',
      field: 'valide',
      width: 150,
      minWidth: 150,
      maxWidth: 200,
      valueFormatter: params => {
        if (params.value) {
          return SharedUtil.formatDateToDDMMYYYYHHMMSS(params.value);
        }
      },
    };
  }

  private getColDateDebut(): ColDef | ColGroupDef {
    return {
      headerName: 'Date début',
      field: 'debute',
      width: 150,
      minWidth: 150,
      maxWidth: 200,
      valueFormatter: params => {
        if (params.value) {
          return SharedUtil.formatDateToDDMMYYYYHHMMSS(params.value);
        }
      },
    };
  }

  private getColDateTerminaison(): ColDef | ColGroupDef {
    return {
      headerName: 'Date terminaison',
      field: 'termin',
      width: 150,
      minWidth: 150,
      maxWidth: 200,
      valueFormatter: params => {
        if (params.value) {
          return SharedUtil.formatDateToDDMMYYYYHHMMSS(params.value);
        }
      },
    };
  }

  private getColDateSuspension(): ColDef | ColGroupDef {
    return {
      headerName: 'Date suspension',
      field: 'suspen',
      width: 150,
      minWidth: 150,
      maxWidth: 200,
      valueFormatter: params => {
        if (params.value) {
          return SharedUtil.formatDateToDDMMYYYYHHMMSS(params.value);
        }
      },
    };
  }

  private getColDateInvalidation(): ColDef | ColGroupDef {
    return {
      headerName: 'Date invalidation',
      field: 'invalid',
      width: 150,
      minWidth: 150,
      maxWidth: 200,
      valueFormatter: params => {
        if (params.value) {
          return SharedUtil.formatDateToDDMMYYYYHHMMSS(params.value);
        }
      },
    };
  }
}
