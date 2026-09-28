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
import { EIGHT, FIFTY, FOURTEEN, ONE, ZERO } from '@app/shared/utils/Constants';

@Injectable({
  providedIn: 'root',
})
export class TableauImprimeService {
  constructor(
    private servicePerm: PermissionService,
    private tableauUtilService: TableauUtilService,
    private formatterService: FormattersService
  ) {}

  private NO_ROWS_TEXT = 'Aucun résultat';
  private PROPERTY_AUTH = AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        headerName: 'Utilisé', // pour l'export
        floatingFilterComponentParams: {
          possibleLabelWithValues: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
            { label: 'Non', value: undefined },
          ], // pour l'export
        },
        cellRendererParams: {
          idsLabel: ['reference'],
          messages: [
            "Suppression d'un imprimé",
            "Vous êtes sur le point de supprimer l'imprimé",
            'Vous êtes sur le point de supprimer les imprimés',
            'Suppression des imprimés',
            'Les imprimés suivants ne peuvent pas être supprimés',
            "L'imprimé suivant ne peut pas être supprimé",
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
        headerName: 'Imprimé',
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
          allowedCharacters: ['-', '_', ' '],
        },
      },
      {
        headerName: 'Désignation',
        field: 'libelle',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'libelle', // Pas de formKey => pas éditable
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.designation),
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.lenghtValidation(ONE, FIFTY)],
          allowedCharacters: ['-', '_', ' ', '.', ',', "'"],
        },
      },
      {
        headerName: 'Code RND',
        field: 'codeRND',
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'codeRND', // Pas de formKey => pas éditable
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.code_rnd),
          validators: [CustomValidators.lenghtValidation(ZERO, FOURTEEN)],
        },
      },
      {
        headerName: 'Type Composition',
        field: 'typeComposition',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
        floatingFilterComponentParams: {},
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: SelectEditorComponent,
        cellRendererParams: {
          formKey: 'typeComposition',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.type_composition),
          values: [],
          hasBlankOption: true,
          validators: [CustomValidators.required()],
        },
      },
      {
        headerName: 'Couleur',
        field: 'typeCouleur',
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
        floatingFilterComponentParams: {},
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: SelectEditorComponent,
        cellRendererParams: {
          formKey: 'typeCouleur',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.couleur),
          values: [],
          hasBlankOption: true,
          validators: [CustomValidators.required()],
        },
      },
      {
        headerName: 'Recto/Verso',
        field: 'rectoVerso',
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
          formKey: 'rectoVerso',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.recto_verso),
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
