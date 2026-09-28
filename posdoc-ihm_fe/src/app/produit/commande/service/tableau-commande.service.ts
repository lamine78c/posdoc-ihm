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

@Injectable({
  providedIn: 'root',
})
export class TableauCommandeService {
  constructor(
    private servicePerm: PermissionService,
    private tableauUtilService: TableauUtilService,
    private formatterService: FormattersService
  ) {}

  private NO_ROWS_TEXT = '<b>Veuillez remplir le formulaire pour sélectionner les commandes à charger</b>';
  private PROPERTY_AUTH = AUTH.FICHIER_EDITION.COMMANDES;
  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['codenv', 'codorg', 'codapp', 'code'],
          idsLabelSeparator: '-',
          messages: [
            "Suppression d'une commande",
            'Vous êtes sur le point de supprimer la commande',
            'Vous êtes sur le point de supprimer les commandes',
            'Suppression des commandes',
            'Les commandes suivantes ne peuvent pas être supprimées',
            'La commande suivante ne peut pas être supprimée',
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
        headerName: 'Environnement',
        field: 'codenv',
        sort: 'asc',
        sortIndex: 3,
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },
      {
        headerName: 'Région',
        field: 'codreg',
        sort: 'asc',
        sortIndex: 4,
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },
      {
        headerName: 'Organisme',
        field: 'codorg',
        sort: 'asc',
        sortIndex: 5,
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectHierarchiseeFloatingFilter',
        floatingFilterComponentParams: {
          possibleValues: [],
        },
      },
      {
        headerName: 'Application',
        field: 'codapp',
        sort: 'asc',
        sortIndex: 1,
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'multiSelectFloatingFilter',
      },
      {
        headerName: 'Commande',
        field: 'code',
        sort: 'asc',
        sortIndex: 2,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
      },
      {
        headerName: 'Désignation',
        field: 'libelle',
        sortable: true,
        flex: 1,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: 'inputFilter',
        // Renderer avec une formKey, considéré comme éditable
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          formKey: 'libelle',
          canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.COMMANDES.designation),
          inputInput: this.formatterService.toUpperCase,
          validators: [CustomValidators.required(), CustomValidators.lenghtValidation(1, 50)],
          allowedCharacters: ['-', '_', ' ', '(', ')', '.', '<', '>', '=', ',', '?', '/', '$', '*', '\\', '+'],
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
