import { Injectable } from '@angular/core';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { MultiSelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/multi-select-editor/multi-select-editor.component';
import { SelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { RESSOURCE_CALLBACK } from '@app/fullstack-components/utils/Constants';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ColDef, ColGroupDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauRessourceService {
  constructor(
    private formatterService: FormattersService,
    private tableauUtilService: TableauUtilService,
    private filterSharedDataService: FilterSharedDataService
  ) {}

  private NO_ROWS_TEXT = 'Aucun résultat';
  private PROPERTY_AUTH = AUTH.ADMINISTRATION.FABRICATION.RESSOURCES;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['codeEnvironnement', 'codeOrganisme', 'codeApplication', 'codeGamme', 'codeSite', 'codeRessource'],
          idsLabelSeparator: '|',
          messages: [
            'Suppression de ressources',
            'Vous êtes sur le point de supprimer la ressource',
            'Vous êtes sur le point de supprimer les ressources',
            'Suppression des ressources',
            'Les ressource suivantes ne peuvent pas être supprimées',
            'La ressource suivante ne peut pas être supprimée',
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
        headerName: 'Environnement',
        field: 'codeEnvironnement',
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
          changeDetectionOnDuplication: true,
          values: [], // a fournir dynamiquement au chargementdi composant
          canEditOnlyOnNewRow: true,
          validators: [CustomValidators.required()],
        },
        onCellValueChanged: params => {
          // transfère le changement
          this.filterSharedDataService.updateData({
            sujet: RESSOURCE_CALLBACK.FIND_APP_BY_ENV,
            node: params.node,
          });
        },
        // suppressRowTransform: true,
        // TODO à remplacer
        cellClass: 'overflow-visible',
      },
      {
        headerName: 'Application',
        field: 'codeApplication',
        sort: 'asc',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
        floatingFilterComponentParams: {},
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: SelectEditorComponent,
        cellRendererParams: {
          formKey: 'codeApplication',
          changeDetectionOnDuplication: true,
          hasBlankOption: true,
          initWithNoData: true,
          values: [], // a fournir dynamiquement au chargementdi composant
          canEditOnlyOnNewRow: true,
          validators: [CustomValidators.required()],
        },
        onCellValueChanged: params => {
          // transfère le changement
          this.filterSharedDataService.updateData({
            sujet: RESSOURCE_CALLBACK.FIND_ORG_BY_ENV_APP,
            node: params.node,
          });
        },
      },
      {
        field: 'codeRegion',
        headerName: 'Région',
        sort: 'asc',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },
      {
        headerName: 'Organisme',
        field: 'codeOrganisme',
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
          initWithNoData: true,
          values: [],
          canEditOnlyOnNewRow: true,
          validators: [CustomValidators.required()],
        },
      },
      {
        headerName: 'Gamme',
        field: 'codeGamme',
        sort: 'asc',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
        floatingFilterComponentParams: {},
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: SelectEditorComponent,
        cellRendererParams: {
          formKey: 'codeGamme',
          values: [], // a fournir dynamiquement au chargementdi composant
          canEditOnlyOnNewRow: true,
          validators: [CustomValidators.required()],
        },
      },
      {
        headerName: 'Site',
        field: 'codeSite',
        sort: 'asc',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
        floatingFilterComponentParams: {},
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: SelectEditorComponent,
        cellRendererParams: {
          formKey: 'codeSite',
          values: [], // a fournir dynamiquement au chargementdi composant
          canEditOnlyOnNewRow: true,
          validators: [CustomValidators.required()],
        },
      },
      {
        headerName: 'Ressource',
        field: 'codeRessource',
        sort: 'asc',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'ressource',
          canEditOnlyOnNewRow: true,
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.required(), CustomValidators.lenghtMaxValidation(8)],
          allowedCharacters: ['-', '_', '#'],
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
