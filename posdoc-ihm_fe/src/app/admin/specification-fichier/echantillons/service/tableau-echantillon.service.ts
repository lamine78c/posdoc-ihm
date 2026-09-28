import { Injectable } from '@angular/core';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { SelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { EIGHT, ONE, PARECH_TYPECH, PARECH_TYPECH_LOT, PARECH_TYPECH_PAGE, THREE } from '@app/shared/utils/Constants';

@Injectable({
  providedIn: 'root',
})
export class TableauEchantillonService {
  constructor(
    private formatterService: FormattersService,
    private tableauUtilService: TableauUtilService,
    private servicePerm: PermissionService
  ) {}

  private NO_ROWS_TEXT = 'Aucun résultat';
  private PROPERTY_AUTH = AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ECHANTILLONS;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['reference'],
          messages: [
            "Suppression d'un echantillon",
            "Vous êtes sur le point de supprimer l'echantillon",
            'Vous êtes sur le point de supprimer les echantillons',
            'Suppression des echantillons',
            'Les echantillons suivants ne peuvent pas être supprimés',
            "L'echantillon suivant ne peut pas être supprimé",
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
        headerName: 'Reference',
        field: 'reference',
        sort: 'asc',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'reference', // Pas de formKey => pas éditable
          canEditOnlyOnNewRow: true,
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.lenghtValidation(ONE, EIGHT)],
          allowedCharacters: ['-'],
        },
      },
      {
        headerName: 'Type',
        field: 'type',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'listFloatingFilter',
        floatingFilterComponentParams: {
          possibleValues: PARECH_TYPECH,
          suppressFilterButton: true,
        },
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: SelectEditorComponent,
        cellRendererParams: {
          formKey: 'type',
          values: PARECH_TYPECH,
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ECHANTILLONS.type),
          validators: [CustomValidators.required()],
        },
        valueGetter: params => {
          params.data.canEdit = [
            { colId: 'nombreLots', value: params.data.type === PARECH_TYPECH_LOT },
            { colId: 'nombrePages', value: params.data.type === PARECH_TYPECH_LOT },
            { colId: 'formule', value: params.data.type === PARECH_TYPECH_PAGE },
          ];
          return params.data.type;
        },
        onCellValueChanged: params => {
          // Redraw the specified row
          params.api.redrawRows({ rowNodes: [params.node] });
        },
      },
      {
        headerName: 'Nombre de lots',
        field: 'nombreLots',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'nombreLots',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ECHANTILLONS.nombre_lots),
          validators: [CustomValidators.lenghtValidation(ONE, THREE), CustomValidators.numberValidator(), CustomValidators.positiveValueValidator()],
        },
        cellStyle: { 'justify-content': 'flex-end' },
        valueGetter: params => {
          return params.data.type === PARECH_TYPECH_LOT ? params.data.nombreLots : null;
        },
      },
      {
        headerName: 'Nombre de pages',
        field: 'nombrePages',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'nombrePages',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ECHANTILLONS.nombre_pages),
          validators: [CustomValidators.lenghtValidation(ONE, THREE), CustomValidators.numberValidator(), CustomValidators.positiveValueValidator()],
        },
        cellStyle: { 'justify-content': 'flex-end' },
        valueGetter: params => {
          return params.data.type === PARECH_TYPECH_LOT ? params.data.nombrePages : null;
        },
      },
      {
        headerName: 'Aléatoire',
        field: 'random',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'listFloatingFilter',
        floatingFilterComponentParams: {
          possibleLabelWithValues: [
            { label: 'Vrai', value: true },
            { label: 'Faux', value: false },
          ],
          suppressFilterButton: true,
        },
        cellRenderer: InterrupteurRadioComponent,
        cellRendererParams: {
          formKey: 'random',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ECHANTILLONS.random),
        },
      },
      {
        headerName: 'Formule',
        field: 'formule',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'formule',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ECHANTILLONS.formule),
          validators: [CustomValidators.required()],
        },
        valueGetter: params => {
          return params.data.type === PARECH_TYPECH_PAGE ? params.data.formule : null;
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
