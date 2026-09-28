import { DatePipe } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { TableauFormattersComparatorsService } from '@app/fullstack-components/tableau/services/tableau-formatters-comparators.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ONE, ONE_HUNDRED } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ColDef, ColGroupDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauServicePosdocService {
  private readonly tableauFormattersComparatorsService = inject(TableauFormattersComparatorsService);
  private readonly tableauUtilService = inject(TableauUtilService);

  constructor() {
    // nothing
  }

  private NO_ROWS_TEXT = 'Aucun résultat';
  private PROPERTY_AUTH = AUTH.ADMINISTRATION.CLIENTS;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['libelle'],
          messages: [
            "Suppression d'un service",
            'Vous êtes sur le point de supprimer le service',
            'Vous êtes sur le point de supprimer les services',
            'Suppression des services',
            'Les services suivants ne peuvent pas être supprimés',
            'Le service suivant ne peut pas être supprimé',
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
    return [this.getLibelle(), this.getUrl(), this.getUserCreated(), this.getDateCreated(), this.getUserUpdated(), this.getDateUpdated()];
  }

  private getLibelle(): ColDef {
    return {
      headerName: 'Libellé',
      field: 'libelle',
      sort: 'asc',
      width: 150,
      maxWidth: 250,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'libelle',
        validators: [CustomValidators.lenghtValidation(ONE, ONE_HUNDRED), CustomValidators.required()],
        allowedCharacters: [' '],
      },
    };
  }

  private getUrl(): ColDef {
    return {
      headerName: 'Url',
      field: 'url',
      flex: 1,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'url',
        validators: [CustomValidators.required()],
        allowedCharacters: [':', '/', '.', '_'],
      },
    };
  }

  private getDateCreated(): ColDef {
    return {
      headerName: 'Date création',
      field: 'createdAt',
      width: 140,
      maxWidth: 150,
      valueFormatter: function (params) {
        const datepipe: DatePipe = new DatePipe('fr-FR');
        return datepipe.transform(params.value, 'dd/MM/YYYY');
      },
      floatingFilter: true,
      filter: 'agDateColumnFilter',
      floatingFilterComponent: 'agDateInput',
      filterParams: { comparator: this.tableauFormattersComparatorsService.compareDates },
    };
  }

  private getDateUpdated(): ColDef {
    return {
      headerName: 'Date modification',
      field: 'updatedAt',
      width: 140,
      maxWidth: 150,
      valueFormatter: function (params) {
        const datepipe: DatePipe = new DatePipe('fr-FR');
        return datepipe.transform(params.value, 'dd/MM/YYYY');
      },
      floatingFilter: true,
      filter: 'agDateColumnFilter',
      floatingFilterComponent: 'agDateInput',
      filterParams: { comparator: this.tableauFormattersComparatorsService.compareDates },
    };
  }

  private getUserCreated(): ColDef {
    return {
      headerName: 'Crée par',
      field: 'createdBy',
      width: 100,
      maxWidth: 110,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }
  private getUserUpdated(): ColDef {
    return {
      headerName: 'Modifié par',
      field: 'updatedBy',
      width: 100,
      maxWidth: 110,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    return this.getColumDefsAction(isColSelectAll).concat(this.getColumDefs());
  }
}
