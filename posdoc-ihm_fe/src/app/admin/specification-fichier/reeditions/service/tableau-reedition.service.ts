import { Injectable } from '@angular/core';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { SelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ColDef, ColGroupDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauReeditionService {
  constructor(
    private formatterService: FormattersService,
    private tableauUtilService: TableauUtilService,
    private servicePerm: PermissionService
  ) {}

  private NO_ROWS_TEXT = 'Aucun résultat';
  private PROPERTY_AUTH = AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.REEDITIONS;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['reference'],
          messages: [
            "Suppression d'une réédition",
            'Vous êtes sur le point de supprimer la réédition',
            'Vous êtes sur le point de supprimer les rééditions',
            'Suppression des rééditions',
            'Les rééditions suivantes ne peuvent pas être supprimées',
            'La réédition suivante ne peut pas être supprimée',
          ],
        },
      },
    };
    const paramColShow: ParamColShowInterface = {
      isColSelectAll: isColSelectAll,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }
  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      {
        headerName: 'Référence clé',
        field: 'reference',
        sort: 'asc',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'reference', // Pas de formKey => pas éditable
          canEditOnlyOnNewRow: true,
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.required(), CustomValidators.lenghtMaxValidation(8)],
        },
      },
      {
        headerName: 'Type format',
        field: 'type',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: SelectEditorComponent,
        cellRendererParams: {
          formKey: 'type',
          values: [],
          canEditOnlyOnNewRow: true,
          validators: [CustomValidators.required()],
        },
      },
      {
        headerName: 'Libellé',
        field: 'libelle',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'libelle',
          inputInput: this.formatterService.toUpperCase,
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.REEDITIONS.libelle),
          validators: [CustomValidators.required(), CustomValidators.lenghtValidation(1, 12)],
          allowedCharacters: ['-', '_', ' ', '.'],
        },
      },
      {
        headerName: 'Numéro de ligne',
        field: 'lineNumber',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'lineNumber',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.REEDITIONS.numero_ligne),
          validators: [CustomValidators.numberValidator(), CustomValidators.required(), CustomValidators.lenghtMaxValidation(3)],
        },
        cellStyle: { 'justify-content': 'flex-end' },
        comparator: (valueA, valueB) => +valueA - +valueB,
        valueGetter: params => params.data.lineNumber,
      },
      {
        headerName: 'Numéro de colonne',
        field: 'columnNumber',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'columnNumber',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.REEDITIONS.numero_colonne),
          validators: [CustomValidators.numberValidator(), CustomValidators.required(), CustomValidators.lenghtMaxValidation(3)],
        },
        cellStyle: { 'justify-content': 'flex-end' },
        comparator: (valueA, valueB) => +valueA - +valueB,
        valueGetter: params => params.data.columnNumber,
      },
      {
        headerName: 'Longueur',
        field: 'length',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'length',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.REEDITIONS.longueur),
          validators: [CustomValidators.numberValidator(), CustomValidators.required(), CustomValidators.lenghtMaxValidation(2)],
        },
        cellStyle: { 'justify-content': 'flex-end' },
        comparator: (valueA, valueB) => +valueA - +valueB,
        valueGetter: params => params.data.length,
      },
    ];
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    return this.getColumDefsAction(isColSelectAll).concat(this.getColumDefs());
  }
}
