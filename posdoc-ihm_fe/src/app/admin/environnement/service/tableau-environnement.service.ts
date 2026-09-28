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
import { FIFTY, ONE } from '@app/shared/utils/Constants';

@Injectable({
  providedIn: 'root',
})
export class TableauEnvironnementService {
  constructor(
    private readonly servicePerm: PermissionService,
    private readonly tableauUtilService: TableauUtilService,
    private readonly formatterService: FormattersService
  ) {}

  private readonly NO_ROWS_TEXT = 'Aucun résultat';
  private readonly PROPERTY_AUTH = AUTH.ADMINISTRATION.ENVIRONNEMENTS;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['code'],
          messages: [
            "Suppression d'un environnement",
            "Vous êtes sur le point de supprimer l'environnement",
            'Vous êtes sur le point de supprimer les environnements',
            'Suppression des environnements',
            'Les environnements suivants ne peuvent pas être supprimés',
            "L'environnement suivant ne peut pas être supprimé",
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
        headerName: ' Environnement',
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
          validators: [CustomValidators.lenghtValidation(ONE), CustomValidators.required()],
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
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.MOTEUR_ADELAIDE.libelle),
          validators: [CustomValidators.lenghtValidation(ONE, FIFTY), CustomValidators.required()],
          allowedCharacters: ['-', '_', ' '],
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
