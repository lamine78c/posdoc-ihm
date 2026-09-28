import { Injectable } from '@angular/core';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { FIFTY, ONE, SIX } from '@app/shared/utils/Constants';

@Injectable({
  providedIn: 'root',
})
export class TableauParamsAdelaideService {
  constructor(
    private readonly servicePerm: PermissionService,
    private readonly tableauUtilService: TableauUtilService,
    private readonly formatterService: FormattersService
  ) {}

  private readonly NO_ROWS_TEXT = 'Aucun résultat';
  private readonly PROPERTY_AUTH = AUTH.ADMINISTRATION.MOTEUR_ADELAIDE;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['code'],
          messages: [
            "Suppression d'un paramètre Adelaïde",
            'Vous êtes sur le point de supprimer le paramètre Adelaïde',
            'Vous êtes sur le point de supprimer les paramètres Adelaïde',
            'Suppression des paramètres Adelaïde',
            'Les paramètres Adelaïde suivants ne peuvent pas être supprimés',
            'Le paramètre Adelaïde suivant ne peut pas être supprimé',
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
    return [this.getCode(), this.getValeur(), this.getLibelle()];
  }

  getCode(): ColDef | ColGroupDef {
    return {
      headerName: 'Code',
      field: 'code',
      flex: 1,
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
        validators: [CustomValidators.lenghtValidation(ONE, SIX), CustomValidators.required()],
      },
    };
  }

  getValeur(): ColDef | ColGroupDef {
    return {
      headerName: 'Valeur',
      field: 'value',
      flex: 1,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'value',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.MOTEUR_ADELAIDE.valeur),
        validators: [CustomValidators.lenghtValidation(ONE, FIFTY), CustomValidators.required()],
        allowedCharacters: ['.', '-', '_', '$', '{', '}', ' ', '/', '*', ':'],
      },
    };
  }

  getLibelle(): ColDef | ColGroupDef {
    return {
      headerName: 'Libellé',
      field: 'libelle',
      flex: 1,
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'libelle',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.ADMINISTRATION.MOTEUR_ADELAIDE.libelle),
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(ONE, FIFTY), CustomValidators.required()],
        allowedCharacters: ['-', '(', ')', ' '],
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
