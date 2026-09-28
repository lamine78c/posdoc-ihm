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
import { FIFTY, ONE, THIRTY_EIGHT, THIRTY_NINE, THREE, ZERO } from '@app/shared/utils/Constants';

@Injectable({
  providedIn: 'root',
})
export class TableauOrganismeService {
  constructor(
    private readonly servicePerm: PermissionService,
    private readonly tableauUtilService: TableauUtilService,
    private readonly formatterService: FormattersService
  ) {}

  private readonly PROPERTY_AUTH = AUTH.ADMINISTRATION.ORGANISMES.ORGANISME;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['code'],
          messages: [
            "Suppression d'un organisme",
            "Vous êtes sur le point de supprimer l'organisme",
            'Vous êtes sur le point de supprimer les organismes',
            'Suppression des organismes',
            'Les organismes suivants ne peuvent pas être supprimés',
            "L'organisme suivant ne peut pas être supprimé",
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
      this.getOrganisme(),
      this.getLibelle(),
      this.getAdresse1(),
      this.getAdresse2(),
      this.getAdresse3(),
      this.getAdresse4(),
      this.getType(),
      this.getCodeRegion(),
      this.getCodeSite(),
    ];
  }

  getOrganisme(): ColDef | ColGroupDef {
    return {
      headerName: 'Organisme',
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
        validators: [CustomValidators.lenghtValidation(ONE, THREE), CustomValidators.required()],
      },
    };
  }

  getLibelle(): ColDef | ColGroupDef {
    return {
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
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.libelle),
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(ONE, FIFTY), CustomValidators.required()],
        allowedCharacters: ['-', '_', ' ', '(', ')'],
      },
    };
  }

  getAdresse1(): ColDef | ColGroupDef {
    return {
      headerName: 'Adresse 1',
      field: 'adresse1',
      sortable: true,
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'adresse1',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.adresse1),
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(ZERO, THIRTY_EIGHT)],
        allowedCharacters: ['-', '_', ' '],
      },
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  getAdresse2(): ColDef | ColGroupDef {
    return {
      headerName: 'Adresse 2',
      field: 'adresse2',
      sortable: true,
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'adresse2',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.adresse2),
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(ZERO, THIRTY_EIGHT)],
        allowedCharacters: ['-', '_', ' '],
      },
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  getAdresse3(): ColDef | ColGroupDef {
    return {
      headerName: 'Adresse 3',
      field: 'adresse3',
      sortable: true,
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'adresse3',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.adresse3),
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(ZERO, THIRTY_NINE)],
        allowedCharacters: ['-', '_', ' '],
      },
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  getAdresse4(): ColDef | ColGroupDef {
    return {
      headerName: 'Adresse 4',
      field: 'adresse4',
      sortable: true,
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'adresse4',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.adresse4),
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(ZERO, THIRTY_EIGHT)],
        allowedCharacters: ['-', '_', ' '],
      },
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  getType(): ColDef | ColGroupDef {
    return {
      headerName: 'Type Organisme',
      field: 'type',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'listFloatingFilter',
      floatingFilterComponentParams: {
        possibleValues: ['R', 'F'],
        suppressFilterButton: true,
      },
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: SelectEditorComponent,
      cellRendererParams: {
        formKey: 'type',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.type_organisme),
        values: ['R', 'F'],
        hasBlankOption: true,
        validators: [CustomValidators.required()],
      },
    };
  }

  getCodeRegion(): ColDef | ColGroupDef {
    return {
      headerName: 'Code Région',
      field: 'codeRegion',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: SelectEditorComponent,
      cellRendererParams: {
        formKey: 'codeRegion',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.code_region),
        values: [],
        hasBlankOption: true,
      },
    };
  }

  getCodeSite(): ColDef | ColGroupDef {
    return {
      headerName: 'Code Site',
      field: 'codeSite',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: SelectEditorComponent,
      cellRendererParams: {
        formKey: 'codeSite',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.code_site),
        values: [],
        hasBlankOption: true,
      },
    };
  }

  private readonly NO_ROWS_TEXT = 'Aucun résultat';
  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    return this.getColumDefsAction(isColSelectAll).concat(this.getColumDefs());
  }
}
