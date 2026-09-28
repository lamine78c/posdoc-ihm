import { Injectable } from '@angular/core';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
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
export class TableauClientService {
  constructor(
    private servicePerm: PermissionService,
    private tableauUtilService: TableauUtilService,
    private formatterService: FormattersService
  ) {}

  private NO_ROWS_TEXT = 'Aucun résultat';
  private PROPERTY_AUTH = AUTH.ADMINISTRATION.CLIENTS;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['code'],
          messages: [
            "Suppression d'un client",
            'Vous êtes sur le point de supprimer le client',
            'Vous êtes sur le point de supprimer les clients',
            'Suppression des clients',
            'Les clients suivants ne peuvent pas être supprimés',
            'Le client suivant ne peut pas être supprimé',
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
        headerName: 'Code',
        field: 'code',
        sort: 'asc',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'code', // Pas de formKey => pas éditable
          canEditOnlyOnNewRow: true,
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.lenghtValidation(1, 8), CustomValidators.required()],
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
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.CLIENTS.libelle),
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.lenghtValidation(1, 50), CustomValidators.required()],
          allowedCharacters: ['-', '_', ' ', '.', '(', ')'],
        },
      },
      {
        headerName: 'Code Alliage',
        field: 'codeAlliage',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'codeAlliage',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.CLIENTS.codeAlliage),
          validators: [CustomValidators.lenghtValidation(1, 2), CustomValidators.required()],
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
