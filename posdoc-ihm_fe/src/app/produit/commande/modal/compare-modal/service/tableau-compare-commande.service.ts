import { Injectable } from '@angular/core';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ColDef, ColGroupDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauCompareCommandeService {
  constructor() {
    //NOP
  }

  private NO_ROWS_TEXT = 'Aucun résultat';
  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      {
        headerName: 'Organismes',
        field: 'codesnv',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        //cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'codesnv',
          validators: [CustomValidators.required()],
        },
      },

      {
        headerName: 'Application',
        field: 'codapp',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        // cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'codapp',
          validators: [CustomValidators.required()],
        },
      },
      {
        headerName: 'P',
        field: 'code',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        // cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'code', // Pas de formKey => pas éditable
          validators: [CustomValidators.required()],
        },
      },
      {
        headerName: 'I',
        field: 'libelle',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'libelle',
          validators: [CustomValidators.required()],
        },
      },
    ];
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(): (ColDef | ColGroupDef)[] {
    return this.getColumDefs();
  }
}
