import { Injectable } from '@angular/core';
import { ColDef, ColGroupDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauDetailsMassificationOccurrenceEtapeService {
  getColumnDefs(): (ColDef | ColGroupDef | any)[] {
    return [this.getColApplication(), this.getColPeriode(), this.getColFichier(), this.getColImprime(), this.getColDesignation()];
  }

  private getColApplication(): ColDef | ColGroupDef | any {
    return {
      field: 'codenv_codorg_codapp',
      headerName: 'Application',
      minWidth: 120,
      flex: 1,
    };
  }

  private getColPeriode(): ColDef | ColGroupDef | any {
    return {
      field: 'percod',
      headerName: 'Période',
      minWidth: 120,
      flex: 1,
    };
  }

  private getColFichier(): ColDef | ColGroupDef | any {
    return {
      field: 'codcom_codfic_numcom',
      headerName: 'Fichier',
      minWidth: 120,
      flex: 1,
    };
  }

  private getColImprime(): ColDef | ColGroupDef | any {
    return {
      field: 'refimp',
      headerName: 'Imprimé',
      minWidth: 120,
      flex: 1,
    };
  }

  private getColDesignation(): ColDef | ColGroupDef | any {
    return {
      field: 'libfic',
      headerName: 'Désignation',
      minWidth: 200,
      flex: 1,
    };
  }
}
