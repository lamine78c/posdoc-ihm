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
import { FIFTY, ONE, TWO } from '@app/shared/utils/Constants';

@Injectable({
  providedIn: 'root',
})
export class TableauGammeService {
  constructor(
    private servicePerm: PermissionService,
    private tableauUtilService: TableauUtilService,
    private formatterService: FormattersService
  ) {}

  private NO_ROWS_TEXT = 'Aucun résultat';
  private PROPERTY_AUTH = AUTH.ADMINISTRATION.FABRICATION.GAMMES;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['code'],
          messages: [
            "Suppression d'une gamme",
            'Vous êtes sur le point de supprimer la la gamme',
            'Vous êtes sur le point de supprimer les gammes',
            'Suppression des gammes',
            'Les gammes suivantes ne peuvent pas être supprimées',
            'La gamme suivante ne peut pas être supprimée',
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
        headerName: 'Gamme',
        field: 'code',
        sort: 'asc',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
        floatingFilterComponentParams: {},
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'code', // Pas de formKey => pas éditable
          canEditOnlyOnNewRow: true,
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.lenghtValidation(TWO, TWO)],
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
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.FABRICATION.GAMMES.libelle),
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.lenghtValidation(ONE, FIFTY)],
          allowedCharacters: ['-', '_', ' ', '/', '(', ')', '.'],
        },
      },
      {
        headerName: 'Verrou',
        field: 'codeVerrou',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
        floatingFilterComponentParams: {},
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: SelectEditorComponent,
        cellRendererParams: {
          formKey: 'codeVerrou',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.FABRICATION.GAMMES.code_verrou),
          values: [],
          hasBlankOption: true,
        },
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
