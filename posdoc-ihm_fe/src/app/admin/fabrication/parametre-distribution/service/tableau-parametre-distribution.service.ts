import { Injectable } from '@angular/core';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
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
export class TableauParametreDistributionService {
  constructor(
    private servicePerm: PermissionService,
    private formatterService: FormattersService,
    private tableauUtilService: TableauUtilService,
    private tableauConfigurationBuilderService: TableauConfigurationBuilderService
  ) {}

  private NO_ROWS_TEXT = 'Aucun résultat';
  private PROPERTY_AUTH = AUTH.ADMINISTRATION.FABRICATION.PARAMETRES_DISCRIBUTIONS;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['reference'],
          messages: [
            "Suppression d'une distribution",
            'Vous êtes sur le point de supprimer le paramètre de distribution',
            'Vous êtes sur le point de supprimer les paramètres de distribution',
            'Suppression des paramètres',
            'Les paramètres suivants ne peuvent pas être supprimés',
            'La paramètre suivant ne peut pas être supprimé',
          ],
        },
      },
    };
    const paramColShow: ParamColShowInterface = {
      isColCollapse: true,
      isColSelectAll: isColSelectAll,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }
  private getColumDefs(): (ColDef | ColGroupDef | any)[] {
    return [
      {
        headerName: 'Référence',
        field: 'reference',
        sort: 'asc',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'reference', // Pas de formKey => pas éditable,
          canEditOnlyOnNewRow: true,
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.lenghtValidation(1, 12), CustomValidators.required()],
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
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.FABRICATION.PARAMETRES_DISCRIBUTIONS.libelle),
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.lenghtValidation(1, 50), CustomValidators.required()],
          allowedCharacters: ['-', '_', ' ', '.', '(', ')', '+'],
        },
      },
      {
        headerName: 'Logiciel Distribution',
        field: 'logicielDistribution',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
        floatingFilterComponentParams: {},
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'logicielDistribution',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.FABRICATION.PARAMETRES_DISCRIBUTIONS.logiciel_distribution),
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.lenghtValidation(1), CustomValidators.required()],
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
