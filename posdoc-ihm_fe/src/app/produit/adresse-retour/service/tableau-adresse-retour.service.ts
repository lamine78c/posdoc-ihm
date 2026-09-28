import { Injectable } from '@angular/core';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { MultiSelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/multi-select-editor/multi-select-editor.component';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { EIGHT, ONE, THIRTY_EIGHT, ZERO } from '@app/shared/utils/Constants';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';

type ColumnType = ColDef | ColGroupDef;

@Injectable({
  providedIn: 'root',
})
export class TableauAdresseRetourService {
  constructor(
    private readonly formatterService: FormattersService,
    private readonly tableauUtilService: TableauUtilService,
    private readonly servicePerm: PermissionService,
    private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService
  ) {}

  private readonly NO_ROWS_TEXT = 'Aucun résultat';
  private readonly PROPERTY_AUTH = AUTH.FICHIER_EDITION.ADRESSES_RETOUR;
  private readonly PROPERTY_AUTH_FICHIER = AUTH.FICHIER_EDITION.PROPRIETES_DES_FICHIERS;

  createGridConfiguration(permission: boolean): GridOptions {
    return this.tableauConfigurationBuilderService.createGridConfiguration(permission);
  }

  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['code', 'codeOrganisme'],
          idsLabelSeparator: '-',
          messages: [
            "Suppression d'une adresse retour",
            "Vous êtes sur le point de supprimer l'adresse de retour",
            'Vous êtes sur le point de supprimer les adresses de retours',
            'Suppression des adresses de retour',
            'Les adresses de retours suivantes ne peuvent pas être supprimées',
            "L'adresse de retour suivante ne peut pas être supprimée",
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

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      this.getCodeAdresse(),
      this.getCodeRegion(),
      this.getCodeOrganisme(),
      this.getAdresse1(),
      this.getAdresse2(),
      this.getAdresse3(),
      this.getAdresse4(),
    ];
  }

  getCodeAdresse(): ColumnType {
    return {
      field: 'code',
      headerName: 'Code Adresse',
      sort: 'asc',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'code',
        canEditOnlyOnNewRow: true,
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.required(), CustomValidators.lenghtValidation(ONE, EIGHT)],
        allowedCharacters: ['_'],
      },
    };
  }

  getCodeRegion(): ColumnType {
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

  getCodeOrganisme(): ColumnType {
    return {
      field: 'codeOrganisme',
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
        formKey: 'codeOrganisme',
        values: [],
        canEditOnlyOnNewRow: true,
        validators: [CustomValidators.required()],
      },
    };
  }

  getAdresse1(): ColumnType {
    return {
      field: 'adresse1',
      headerName: 'Adresse 1',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'adresse1',
        inputInput: this.formatterService.toUpperCase,
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.ADRESSES_RETOUR.adresse1),
        validators: [CustomValidators.lenghtValidation(ZERO, THIRTY_EIGHT)],
        allowedCharacters: ['-', ' '],
      },
    };
  }

  getAdresse2(): ColumnType {
    return {
      field: 'adresse2',
      headerName: 'Adresse 2',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'adresse2',
        inputInput: this.formatterService.toUpperCase,
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.ADRESSES_RETOUR.adresse2),
        validators: [CustomValidators.lenghtValidation(ZERO, THIRTY_EIGHT)],
        allowedCharacters: ['-', ' '],
      },
    };
  }

  getAdresse3(): ColumnType {
    return {
      field: 'adresse3',
      headerName: 'Adresse 3',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'adresse3',
        inputInput: this.formatterService.toUpperCase,
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.ADRESSES_RETOUR.adresse3),
        validators: [CustomValidators.lenghtValidation(ZERO, THIRTY_EIGHT)],
        allowedCharacters: ['-', ' '],
      },
    };
  }

  getAdresse4(): ColumnType {
    return {
      field: 'adresse4',
      headerName: 'Adresse 4',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'adresse4',
        inputInput: this.formatterService.toUpperCase,
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.ADRESSES_RETOUR.adresse4),
        validators: [CustomValidators.lenghtValidation(ZERO, THIRTY_EIGHT)],
        allowedCharacters: ['-', ' '],
      },
    };
  }

  private getColumnDetailDefs(): ColumnType[] {
    return [
      {
        field: 'codeEnv',
        headerName: 'Code env',
        sort: 'asc',
        sortable: true,
      },
      {
        field: 'codeApp',
        headerName: 'Application',
        sort: 'asc',
        sortable: true,
      },
      {
        field: 'codeCom',
        headerName: 'Commande',
        sort: 'asc',
        sortable: true,
      },
      {
        field: 'codeFich',
        headerName: 'Fichier',
        sort: 'asc',
        sortable: true,
      },
      {
        field: 'codeProd',
        headerName: 'Code Prd',
        sortable: true,
      },
      {
        field: 'refImprime',
        headerName: 'Imprimé',
        sortable: true,
      },
      {
        field: 'libFichier',
        headerName: 'Désignation',
        sortable: true,
      },
    ];
  }

  getDetailColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    return this.getColumDetailsDefsAction(isColSelectAll).concat(this.getColumnDetailDefs());
  }

  private getColumDetailsDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['codeEnv', 'codeOrg', 'codeApp', 'codeCom', 'codeFich'],
          idsLabelSeparator: '-',
          messages: [
            "Suppression d'un article",
            "Vous êtes sur le point de supprimer l'article",
            'Vous êtes sur le point de supprimer les articles',
            'Suppression des articles',
            'Les articles suivantes ne peuvent pas être supprimées',
            "L'article suivante ne peut pas être supprimée",
          ],
        },
      },
    };
    const paramColShow: ParamColShowInterface = {
      isColSelectAll: isColSelectAll,
      isNoColEdit: true,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    return this.getColumDefsAction(isColSelectAll).concat(this.getColumDefs());
  }
}
