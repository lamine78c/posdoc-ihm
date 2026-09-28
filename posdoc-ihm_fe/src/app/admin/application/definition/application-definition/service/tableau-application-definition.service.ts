import { Injectable } from '@angular/core';
import { ComboboxComponent } from '@app/fullstack-components/tableau/ag-grid-components/combobox/combobox.component';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { MultiSelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/multi-select-editor/multi-select-editor.component';
import { SelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { FIFTY, FOUR, ONE } from '@app/shared/utils/Constants';

@Injectable({
  providedIn: 'root',
})
export class TableauApplicationDefinitionService {
  constructor(
    private readonly servicePerm: PermissionService,
    private readonly tableauUtilService: TableauUtilService,
    private readonly formatterService: FormattersService
  ) {}

  private readonly NO_ROWS_TEXT = 'Aucun résultat';
  private readonly PROPERTY_AUTH = AUTH.ADMINISTRATION.APPLICATIONS;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['codeEnvironnement', 'codeOrganisation', 'code'],
          idsLabelSeparator: '-',
          messages: [
            "Suppression d'une application",
            "Vous êtes sur le point de supprimer l'application",
            'Vous êtes sur le point de supprimer les applications',
            'Suppression des applications',
            'Les applications suivantes ne peuvent pas être supprimées',
            "L'application suivante ne peut pas être supprimée",
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
    return [this.getCodeEnvironnement(), this.getCodeRegion(), this.getCodeOrganisation(), this.getCode(), this.getLibelle(), this.getCodeSystem()];
  }

  getCodeEnvironnement(): ColDef | ColGroupDef {
    return {
      field: 'codeEnvironnement',
      headerName: 'Environnement',
      sort: 'asc',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {},
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: SelectEditorComponent,
      cellRendererParams: {
        formKey: 'codeEnvironnement',
        values: [],
        canEditOnlyOnNewRow: true,
        validators: [CustomValidators.required()],
      },
      // suppressRowTransform: true,
      // TODO à remplacer
      cellClass: 'overflow-visible',
    };
  }

  getCodeRegion(): ColDef | ColGroupDef {
    return {
      field: 'codeRegion',
      headerName: 'Région',
      sort: 'asc',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  getCodeOrganisation(): ColDef | ColGroupDef {
    return {
      field: 'codeOrganisation',
      headerName: 'Organisme',
      sort: 'asc',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectHierarchiseeFloatingFilter',
      floatingFilterComponentParams: {
        possibleValues: [],
      },
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: MultiSelectEditorComponent,
      cellRendererParams: {
        formKey: 'codeOrganisation',
        values: [],
        canEditOnlyOnNewRow: true,
        validators: [CustomValidators.required()],
      },
    };
  }

  getCode(): ColDef | ColGroupDef {
    return {
      field: 'code',
      headerName: 'Application',
      sort: 'asc',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: ComboboxComponent,
      cellRendererParams: {
        formKey: 'code',
        canEditOnlyOnNewRow: true,
        inputInput: this.formatterService.toUpperCase,
        values: [],
        validators: [CustomValidators.required(), CustomValidators.lenghtValidation(ONE, FOUR)],
      },
    };
  }

  getLibelle(): ColDef | ColGroupDef {
    return {
      field: 'libelle',
      headerName: 'Désignation',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'libelle',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.APPLICATIONS.libelle),
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.required(), CustomValidators.lenghtValidation(ONE, FIFTY)],
        allowedCharacters: ['-', '_', ' ', '.', '(', ')'],
      },
    };
  }

  getCodeSystem(): ColDef | ColGroupDef {
    return {
      field: 'codeSystem',
      headerName: 'Système gamme',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'listFloatingFilter',
      floatingFilterComponentParams: {
        possibleValues: ['U', 'L', 'A'],
        suppressFilterButton: true,
      },
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: SelectEditorComponent,
      cellRendererParams: {
        formKey: 'codeSystem',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.APPLICATIONS.codeSystem),
        values: ['U', 'L', 'A'],
        hasBlankOption: true,
        validators: [CustomValidators.required()],
      },
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    return this.getColumDefsAction(isColSelectAll).concat(this.getColumDefs());
  }
}
