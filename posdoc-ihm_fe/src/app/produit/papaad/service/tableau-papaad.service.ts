import { Injectable } from '@angular/core';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { FormattersService } from '@app/fullstack-components/tableau/services/formatters.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { PAPAAD_FORMAT_DEFAUT, PAPAAD_TYPEHAS_DEFAUT } from '@app/shared/utils/Constants';

@Injectable({
  providedIn: 'root',
})
export class TableauPapaadService {
  constructor(
    private servicePerm: PermissionService,
    private tableauUtilService: TableauUtilService,
    private formatterService: FormattersService
  ) {}

  private NO_ROWS_TEXT = 'Aucun résultat';
  private PROPERTY_AUTH = AUTH.FICHIER_EDITION.PAPAAD;
  private getColumDefsAction(isColSelectAll) {
    const params: ParamColDefInterface = {
      clearFilter: {
        pinned: 'left',
      },
      selectAll: {
        pinned: 'left',
      },
      edit: {
        pinned: 'left',
      },
      delete: {
        pinned: 'left',
        cellRendererParams: {
          idsLabel: ['codeCommande', 'codeFichier', 'codeNotif'],
          idsLabelSeparator: ' | ',
          messages: [
            'Suppression du papaad',
            'Vous êtes sur le point de supprimer le papaad',
            'Vous êtes sur le point de supprimer les papaads',
            'Suppression des papaads',
            'Les papaads suivants ne peuvent pas être supprimés',
            'Le papaad suivant ne peut pas être supprimé',
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
      this.getColCodeCommande(),
      this.getColCodeProduit(),
      this.getColLibelle(),
      this.getColCodeNotif(),
      this.getColPeriode(),
      this.getColCodeRND(),
      this.getColAppPro(),
      this.getColTypeHas(),
      this.getColFormat(),
      this.getColIsUrib(),
      this.getColNsTruc(),
      this.getColImprime(),
      this.getColHuissier(),
      this.getColNumNot(),
      this.getColStrRaf(),
      this.getColContrat(),
      this.getColMedele(),
      this.getColIdtbcce(),
    ];
  }

  private getColCodeCommande(): ColDef {
    return {
      headerName: 'Commande',
      field: 'codeCommande',
      pinned: 'left',
      sort: 'asc',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'codeCommande',
        canEditOnlyOnNewRow: true,
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(1, 4), CustomValidators.required()],
      },
    };
  }

  ///!\ Attention, le champ 'codeFichier' correspond au 'Produit' dans l'IHM
  private getColCodeProduit(): ColDef {
    return {
      headerName: 'Produit',
      field: 'codeFichier',
      pinned: 'left',
      sort: 'asc',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'codeFichier',
        canEditOnlyOnNewRow: true,
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(1, 5), CustomValidators.required()],
      },
    };
  }

  private getColLibelle(): ColDef {
    return {
      headerName: 'Libellé',
      field: 'libelle',
      pinned: 'left',
      sortable: true,
      sort: 'asc',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'libelle',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.libelle),
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(1, 128), CustomValidators.required()],
        allowedCharacters: ['-', '_', ' ', '.', ',', ':', '/', "'", '(', ')', '+'],
      },
    };
  }

  private getColCodeNotif(): ColDef {
    return {
      headerName: 'Notif',
      field: 'codeNotif',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'codeNotif',
        canEditOnlyOnNewRow: true,
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(1, 4), CustomValidators.required()],
        allowedCharacters: ['*'],
      },
    };
  }

  private getColPeriode(): ColDef {
    return {
      headerName: 'Période',
      field: 'periode',
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
        formKey: 'periode',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.periode),
      },
    };
  }

  private getColCodeRND(): ColDef {
    return {
      headerName: 'CodeRND',
      field: 'codeRND',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'codeRND',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.code_rnd),
        validators: [CustomValidators.lenghtValidation(1, 25), CustomValidators.required()],
        allowedCharacters: ['.'],
      },
    };
  }

  private getColAppPro(): ColDef {
    return {
      headerName: 'AppPro',
      field: 'appPro',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'appPro',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.app_pro),
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(1, 25), CustomValidators.required()],
      },
    };
  }

  private getColTypeHas(): ColDef {
    return {
      headerName: 'TypeHas',
      field: 'typeHas',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'typeHas',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.type_has),
        inputInput: this.formatterService.toUpperCase,
        validators: [CustomValidators.lenghtValidation(1, 25), CustomValidators.required()],
        allowedCharacters: ['-'],
      },
      valueGetter: params => {
        return params.data?.typeHas ?? PAPAAD_TYPEHAS_DEFAUT;
      },
    };
  }

  private getColFormat(): ColDef {
    return {
      headerName: 'Format',
      field: 'format',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'format',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.format),
        inputInput: this.formatterService.toLowerCase,
        validators: [CustomValidators.lenghtValidation(1, 25), CustomValidators.required()],
        allowedCharacters: ['/'],
      },
      valueGetter: params => {
        return params.data?.format ?? PAPAAD_FORMAT_DEFAUT;
      },
    };
  }

  private getColIsUrib(): ColDef {
    return {
      headerName: 'IsUrib',
      field: 'isUrib',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'isUrib',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.is_urib),
        validators: [CustomValidators.lenghtMaxValidation(50)],
      },
    };
  }

  private getColNsTruc(): ColDef {
    return {
      headerName: 'NsTruc',
      field: 'nsTruc',
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
        formKey: 'nsTruc',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.ns_truc),
      },
    };
  }

  private getColImprime(): ColDef {
    return {
      headerName: 'Imprime',
      field: 'imprime',
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
        formKey: 'imprime',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.imprime),
      },
    };
  }

  private getColHuissier(): ColDef {
    return {
      headerName: 'Huissier',
      field: 'huissier',
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
        formKey: 'huissier',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.huissier),
      },
    };
  }

  private getColNumNot(): ColDef {
    return {
      headerName: 'NumNot',
      field: 'numNot',
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
        formKey: 'numNot',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.num_not),
      },
    };
  }

  private getColStrRaf(): ColDef {
    return {
      headerName: 'StrRaf',
      field: 'strRaf',
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
        formKey: 'strRaf',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.str_raf),
      },
    };
  }

  private getColContrat(): ColDef {
    return {
      headerName: 'Contrat',
      field: 'contrat',
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
        formKey: 'contrat',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.contrat),
      },
    };
  }

  private getColMedele(): ColDef {
    return {
      headerName: 'Medele',
      field: 'medele',
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
        formKey: 'medele',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.medele),
      },
    };
  }

  private getColIdtbcce(): ColDef {
    return {
      headerName: 'IdNRAF',
      field: 'idtbcc',
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
        formKey: 'idtbcc',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.PAPAAD.idtbcc),
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
