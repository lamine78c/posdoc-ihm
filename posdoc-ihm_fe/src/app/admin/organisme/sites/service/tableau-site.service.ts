import { Injectable } from '@angular/core';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { MultiSelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/multi-select-editor/multi-select-editor.component';
import { SelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/select-editor/select-editor.component';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { FIFTY, ONE, SIX, TWELVE } from '@app/shared/utils/Constants';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ColDef, ColGroupDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root',
})
export class TableauSiteService {
  constructor(
    private readonly formatterService: FormattersService,
    private readonly tableauUtilService: TableauUtilService
  ) {}

  private readonly NO_ROWS_TEXT = 'Aucun résultat';
  private readonly PROPERTY_AUTH = AUTH.ADMINISTRATION.ORGANISMES.SITE;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['code'],
          messages: [
            "Suppression d'une site",
            'Vous êtes sur le point de supprimer la site',
            'Vous êtes sur le point de supprimer les sites',
            'Suppression des sites',
            'Les sites suivants ne peuvent pas être supprimés',
            'Le site suivant ne peut pas être supprimé',
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
    return [this.getCode(), this.getHost(), this.getRessourceDelestage(), this.getUsername(), this.getPassword(), this.getOrganismeMassification()];
  }

  getCode(): ColDef | ColGroupDef {
    return {
      headerName: 'Code',
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
        inputInput: this.formatterService.toUpperCase,
        canEditOnlyOnNewRow: true,
        validators: [CustomValidators.lenghtValidation(ONE, SIX)],
      },
    };
  }

  getHost(): ColDef | ColGroupDef {
    return {
      headerName: 'Serveur',
      field: 'host',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'libelle',
        validators: [CustomValidators.lenghtValidation(ONE, FIFTY)],
        allowedCharacters: ['-', '_', '.'],
      },
    };
  }

  getRessourceDelestage(): ColDef | ColGroupDef {
    return {
      headerName: 'Ressource Délestage',
      field: 'ressourceDelestage',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: SelectEditorComponent,
      cellRendererParams: {
        formKey: 'ressourceDelestage',
        values: [],
        hasBlankOption: true,
        validators: [CustomValidators.required()],
      },
    };
  }

  getUsername(): ColDef | ColGroupDef {
    return {
      headerName: 'Utilisateur',
      field: 'username',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'libelle',
        validators: [CustomValidators.lenghtValidation(ONE, TWELVE)],
      },
    };
  }

  getPassword(): ColDef | ColGroupDef {
    return {
      headerName: 'Mot de passe',
      field: 'password',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'libelle',
        validators: [CustomValidators.lenghtValidation(ONE, TWELVE)],
      },
    };
  }

  getOrganismeMassification(): ColDef | ColGroupDef {
    return {
      headerName: 'Organisme de massification',
      field: 'organismeMassification',
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      floatingFilterComponentParams: {
        possibleValues: [],
      },
      // Renderer avec une formKey, considéré comme éditable
      cellRenderer: MultiSelectEditorComponent,
      cellRendererParams: {
        formKey: 'organismeMassification',
        values: [],
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
