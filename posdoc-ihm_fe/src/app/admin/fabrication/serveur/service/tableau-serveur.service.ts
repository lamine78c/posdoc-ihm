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
import { EIGHT, FIFTY, ONE, THIRTY_TWO } from '@app/shared/utils/Constants';

@Injectable({
  providedIn: 'root',
})
export class TableauServeurService {
  constructor(
    private servicePerm: PermissionService,
    private tableauUtilService: TableauUtilService,
    private formatterService: FormattersService
  ) {}

  etatMapping = { false: 'Inactif', true: 'Actif' };
  testeMapping = { false: '-', true: 'Testé' };
  private NO_ROWS_TEXT = 'Aucun résultat';
  private PROPERTY_AUTH = AUTH.ADMINISTRATION.FABRICATION.SERVEURS;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['code'],
          messages: [
            'Suppression de serveurs',
            'Vous êtes sur le point de supprimer le serveur',
            'Vous êtes sur le point de supprimer les serveurs',
            'Suppression des serveurs',
            'Le serveur suivants ne peuvent pas être supprimés',
            'Le serveur suivant ne peut pas être supprimé',
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
        headerName: 'Serveur',
        field: 'code',
        sort: 'asc',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
        floatingFilterComponentParams: {},
        maxWidth: 140,
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'code', // Pas de formKey => pas éditable
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.lenghtValidation(ONE, EIGHT)],
          canEditOnlyOnNewRow: true,
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
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.FABRICATION.SERVEURS.libelle),
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.lenghtValidation(ONE, FIFTY)],
          allowedCharacters: ['-', '_', ' '],
        },
      },
      {
        headerName: 'Système',
        field: 'systeme',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'listFloatingFilter',
        floatingFilterComponentParams: {
          possibleValues: ['LINUX', 'WINDOWS', 'AIX'],
          suppressFilterButton: true,
        },
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: SelectEditorComponent,
        cellRendererParams: {
          formKey: 'systeme',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.FABRICATION.SERVEURS.systeme),
          values: ['LINUX', 'WINDOWS', 'AIX'],
          hasBlankOption: true,
          validators: [CustomValidators.required()],
        },
      },
      {
        headerName: 'Adresse IP',
        field: 'adresseIp',
        sortable: true,
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'adresseIp',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.FABRICATION.SERVEURS.adresse_ip),
          validators: [CustomValidators.lenghtValidation(ONE, THIRTY_TWO)],
          allowedCharacters: ['.', '-'],
        },
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
      },
      {
        headerName: 'Test',
        field: 'teste',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'listFloatingFilter',
        floatingFilterComponentParams: {
          possibleValues: this.formatterService.extractValues(this.testeMapping),
          suppressFilterButton: true,
        },
        maxWidth: 90,
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: SelectEditorComponent,
        cellRendererParams: {
          formKey: 'test',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.FABRICATION.SERVEURS.teste),
          values: this.formatterService.extractValues(this.testeMapping),
        },
      },
      {
        headerName: 'Etat',
        field: 'actif',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'listFloatingFilter',
        floatingFilterComponentParams: {
          possibleValues: this.formatterService.extractValues(this.etatMapping),
          suppressFilterButton: true,
        },
        maxWidth: 90,
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: SelectEditorComponent,
        cellRendererParams: {
          formKey: 'actif',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.FABRICATION.SERVEURS.actif),
          values: this.formatterService.extractValues(this.etatMapping),
        },
        cellStyle: params => {
          if (params.value === 'Actif') {
            return { color: '#004B00', 'background-color': '#CCFFCC' };
          } else {
            return { color: '#4B0000', 'background-color': '#FF9999' };
          }
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
