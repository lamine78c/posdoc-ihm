import { Injectable } from '@angular/core';
import { DateEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/date-editor/date-editor.component';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FIFTY, ONE, THREE, TWO } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { FormatUtil } from '@app/shared/utils/FormatUtil';
import { ColDef, ColGroupDef } from 'ag-grid-community';

type ColumnType = ColDef | ColGroupDef;
@Injectable({
  providedIn: 'root',
})
export class TableauTarifService {
  constructor(
    private readonly servicePerm: PermissionService,
    private readonly formatterService: FormattersService,
    private readonly tableauUtilService: TableauUtilService
  ) {}

  private readonly NO_ROWS_TEXT = 'Aucun résultat';
  private readonly PROPERTY_AUTH = AUTH.ADMINISTRATION.TARPOS;

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [this.getColType(), this.getColOrdre(), this.getColDesignation(), this.getColLibre(), this.getColCompta(), this.getColPerime()];
  }

  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['type'],
          messages: [
            "Suppression d'un tarif",
            'Vous êtes sur le point de supprimer le tarif',
            'Vous êtes sur le point de supprimer les tarifs',
            'Suppression des tarifs',
            'Les tarifs suivants ne peuvent pas être supprimés',
            'Le tarif suivant ne peut pas être supprimé',
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

  private getColType(): ColumnType {
    return {
      headerName: 'Type',
      field: 'type',
      sort: 'asc',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'type', // Pas de formKey => pas éditable
        canEditOnlyOnNewRow: true,
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.required(), CustomValidators.lenghtValidation(ONE, THREE)],
      },
    };
  }

  private getColOrdre(): ColumnType {
    return {
      headerName: 'Ordre',
      field: 'ordre',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'ordre',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.TARPOS.Ordre),
        // canEditOnlyOnNewRow: true,
        validators: [CustomValidators.required(), CustomValidators.lenghtValidation(ONE, TWO), CustomValidators.numberValidator()],
      },
      valueGetter: params => {
        return params.data.ordre;
      },
    };
  }

  private getColDesignation(): ColumnType {
    return {
      headerName: 'Désignation',
      field: 'libelle',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'libelle',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.TARPOS.Libelle),
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.required(), CustomValidators.lenghtValidation(ONE, FIFTY)],
        allowedCharacters: ['-', '_', ' ', '.', '(', ')', '€', '+'],
      },
    };
  }

  private getColLibre(): ColumnType {
    return {
      headerName: 'Libre',
      field: 'tlibre',
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
        formKey: 'tlibre',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.TARPOS.Libre),
      },
    };
  }

  private getColCompta(): ColumnType {
    return {
      headerName: 'Non Comptabilisé',
      field: 'compta',
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
        formKey: 'compta',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.TARPOS.Compta),
      },
    };
  }

  private getColPerime(): ColumnType {
    return {
      headerName: 'Périmé',
      field: 'perime',
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
        formKey: 'perime',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.TARPOS.Perime),
      },
    };
  }

  private getColumDetailsDefs(): ColumnType[] {
    return [this.getColDateDebut(), this.getColDateFin(), this.getColCout(), this.getColUrgent()];
  }

  private getColumDetailsDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['type', 'numero'],
          idsLabelSeparator: '-',
          messages: [
            "Suppression d'un tarif",
            'Vous êtes sur le point de supprimer le tarif',
            'Vous êtes sur le point de supprimer les tarifs',
            'Suppression des tarifs',
            'Les tarifs suivants ne peuvent pas être supprimés',
            'Le tarif suivant ne peut pas être supprimé',
          ],
        },
      },
    };
    const paramColShow: ParamColShowInterface = {
      isColSelectAll: isColSelectAll,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }

  private getColDateDebut(): ColumnType {
    return {
      headerName: 'Date de début',
      field: 'dateDebut',
      sortable: true,
      sort: 'asc',
      cellRenderer: DateEditorComponent,
      cellRendererParams: {
        formKey: 'dateDebut',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.TARPOS.detail),
        validators: [CustomValidators.required()],
      },
      valueGetter: params => {
        return params.data.dateDebut;
      },
    };
  }

  private getColDateFin(): ColumnType {
    return {
      headerName: 'Date de fin',
      field: 'dateFin',
      sortable: true,
      cellRenderer: DateEditorComponent,
      cellRendererParams: {
        formKey: 'dateFin',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.TARPOS.detail),
      },
      valueGetter: params => {
        return params.data.dateFin;
      },
    };
  }

  private getColCout(): ColumnType {
    return {
      headerName: 'Coût',
      field: 'coutPli',
      sortable: true,
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'coutPli',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.TARPOS.detail),
        validators: [CustomValidators.required(), CustomValidators.coupliValidator()],
        allowedCharacters: ['.'],
      },
      cellStyle: { 'justify-content': 'flex-end' },
      valueFormatter: params => {
        return FormatUtil.threeDecimalFormatter(params.value);
      },
      valueGetter: params => {
        return FormatUtil.threeDecimalFormatter(params.data.coutPli);
      },
    };
  }

  private getColUrgent(): ColumnType {
    return {
      headerName: 'Urgent',
      field: 'urgent',
      sortable: true,
      cellRenderer: InterrupteurRadioComponent,
      cellRendererParams: {
        formKey: 'urgent',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.TARPOS.detail),
      },
      valueGetter: params => {
        return params.data.urgent;
      },
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    return this.getColumDefsAction(isColSelectAll).concat(this.getColumDefs());
  }

  getDetailColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    return this.getColumDetailsDefsAction(isColSelectAll).concat(this.getColumDetailsDefs());
  }
}
