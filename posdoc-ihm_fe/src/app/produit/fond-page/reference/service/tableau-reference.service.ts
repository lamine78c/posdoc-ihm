import { Injectable } from '@angular/core';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { SelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';

@Injectable({
  providedIn: 'root',
})
export class TableauReferenceService {
  constructor(
    private servicePerm: PermissionService,
    private tableauUtilService: TableauUtilService
  ) {}

  private NO_ROWS_TEXT = 'Aucun résultat';
  private PROPERTY_AUTH = AUTH.FICHIER_EDITION.FONDS_DE_PAGE.REFERENCES;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {};
    const paramColShow: ParamColShowInterface = {
      isNoColDelete: true,
      isColSelectAll: isColSelectAll,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }
  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      {
        headerName: 'Environnement',
        field: 'codeEnv',
        sort: 'asc',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
        // Renderer avec une formKey, considéré comme éditable
        //cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'codeEnv',
          validators: [CustomValidators.required()],
        },
      },
      {
        headerName: 'Organisme',
        field: 'codeOrg',
        sort: 'asc',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectHierarchiseeFloatingFilter',
        floatingFilterComponentParams: {
          possibleValues: [],
        },
      },
      {
        headerName: 'Fichie',
        // field: 'codeFich',
        sort: 'asc',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        valueGetter: params => {
          return params.data.codeCom + '-' + params.data.codeFich;
        },
      },
      {
        headerName: 'Code Prd',
        field: 'codeProd',
        sort: 'asc',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
      },
      {
        headerName: 'Désignation',
        field: 'libFichier',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        flex: 1,
      },
      {
        headerName: 'Référence imprimé',
        field: 'refImprime',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        cellRenderer: SelectEditorComponent,
        cellRendererParams: {
          formKey: 'refImprime',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.REFERENCES.reference_imprime),
          values: [],
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
