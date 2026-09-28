import { inject, Injectable } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { InputEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/input-editor/input-editor.component';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { InterrupteurSelectEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-select-editor/interrupteur-select-editor.component';
import { Exemplaire } from '@app/models/exemplaire';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH, KEY_MODIFIER_AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { CellClickedEvent, CellValueChangedEvent, ColDef, ColGroupDef, SortDirection } from 'ag-grid-community';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
@AutoUnsubscribe
export class TableauParametreEditionService {
  private readonly servicePerm = inject(PermissionService);
  private readonly apiAdelaideService = inject(ApiAdelaideDistributionService);
  private readonly tableauUtilService = inject(TableauUtilService);
  private readonly noteService = inject(NotesService);
  private NO_ROWS_TEXT = "<b>Veuillez remplir le formulaire pour sélectionner les paramètres d'editions à charger</b>";
  private PROPERTY_AUTH = AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE;
  subscriptions: Subscription[] = [];

  private getColumDefsAction(isColSelectAll: boolean) {
    const params: ParamColDefInterface = {
      delete: {
        cellRendererParams: {
          idsLabel: ['codenv', 'codorg', 'codapp', 'codcom', 'codfic', 'codgam', 'codres'],
          idsLabelSeparator: '-',
          messages: [
            "Suppression d'un exemplaire",
            "Vous êtes sur le point de supprimer l'exemplaire",
            'Vous êtes sur le point de supprimer les exemplaires',
            'Suppression des exemplaires',
            'Les exemplaires suivants ne peuvent pas être supprimés',
            "L'exemplaire suivant ne peut pas être supprimé",
          ],
        },
      },
    };
    const paramColShow: ParamColShowInterface = {
      isNoColEdit: false,
      isColSelectAll: isColSelectAll,
    };
    return this.tableauUtilService.getColsDefAction(this.PROPERTY_AUTH, paramColShow, params);
  }

  private getColumDefs(): (ColDef | ColGroupDef)[] {
    return [
      this.getColEtat(),
      this.getColCodenv(),
      this.getColCodreg(),
      this.getColCodorg(),
      this.getColCodapp(),
      this.getColCodcom(),
      this.getColCodeProd(),
      this.getColCodfic(),
      this.getColLibFichier(),
      this.getColRefImprime(),
      this.getColCodgam(),
      this.getColCodsit(),
      this.getColCodres(),
      this.getColCoddes(),
      this.getColNbrexe(),
      this.getColFicatt(),
    ];
  }

  private getColCodenv() {
    return {
      headerName: 'Env.',
      field: 'codenv',
      sort: <SortDirection>'asc',
      sortIndex: 1,
      sortable: true,
      width: 65,
      minWidth: 65,
      maxWidth: 65,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColCodreg() {
    return {
      headerName: 'Rég.',
      field: 'codreg',
      sort: <SortDirection>'asc',
      sortIndex: 3,
      sortable: true,
      width: 65,
      minWidth: 65,
      maxWidth: 65,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColCodorg() {
    return {
      headerName: 'Org.',
      field: 'codorg',
      sort: <SortDirection>'asc',
      sortIndex: 4,
      sortable: true,
      width: 65,
      minWidth: 65,
      maxWidth: 65,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectHierarchiseeFloatingFilter',
      floatingFilterComponentParams: {
        possibleValues: [],
      },
    };
  }

  private getColCodapp() {
    return {
      headerName: 'App.',
      field: 'codapp',
      sortable: false,
      width: 50,
      minWidth: 50,
      maxWidth: 50,
    };
  }

  private getColCodcom() {
    return {
      headerName: 'Com.',
      field: 'codcom',
      sortable: false,
      width: 50,
      minWidth: 50,
      maxWidth: 50,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColCodeProd() {
    return {
      headerName: 'Code Prd',
      field: 'codeProd',
      sortable: true,
      width: 70,
      minWidth: 70,
      maxWidth: 70,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColCodfic() {
    return {
      headerName: 'Fic.',
      field: 'codfic',
      sort: 'asc',
      sortIndex: 2,
      sortable: true,
      width: 65,
      minWidth: 65,
      maxWidth: 65,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColLibFichier() {
    return {
      headerName: 'Désignation',
      field: 'libFichier',
      sortable: true,
      flex: 1,
      minWidth: 260,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColRefImprime() {
    return {
      headerName: 'Imprimé',
      field: 'refImprime',
      sortable: true,
      width: 90,
      minWidth: 90,
      maxWidth: 90,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
    };
  }

  private getColCodgam() {
    return {
      headerName: 'Gamme',
      field: 'codgam',
      sort: <SortDirection>'asc',
      sortIndex: 5,
      sortable: true,
      width: 70,
      minWidth: 70,
      maxWidth: 90,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
    };
  }

  private getColCodsit() {
    return {
      headerName: 'Site',
      field: 'codsit',
      sort: <SortDirection>'asc',
      sortIndex: 6,
      sortable: true,
      width: 80,
      minWidth: 80,
      maxWidth: 80,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      cellRenderer: InterrupteurSelectEditorComponent,
      cellRendererParams: {
        isAllTimeClickable: this.isCellModifiable(AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE.code_site),
        canEditOnlyOnNewRow: true,
        formKey: 'codsit',
        values: [],
        validators: [CustomValidators.required()],
      },
      onCellValueChanged: (param: CellValueChangedEvent) => this.updateSite(param),
    };
  }

  private getColCodres() {
    return {
      headerName: 'Ressource',
      field: 'codres',
      sort: <SortDirection>'asc',
      sortIndex: 7,
      sortable: true,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      width: 90,
      minWidth: 90,
      maxWidth: 100,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      cellRenderer: InterrupteurSelectEditorComponent,
      cellRendererParams: {
        isAllTimeClickable: this.isCellModifiable(AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE.code_ressource),
        canEditOnlyOnNewRow: true,
        formKey: 'codres',
        filterByFields: ['codenv', 'codorg', 'codapp', 'codsit', 'codgam'],
        acceptGenericOrgs: { key: 'codorg', value: '999' },
        values: [],
        validators: [CustomValidators.required()],
      },
      onCellValueChanged: (param: CellValueChangedEvent) => this.updateRessource(param),
    };
  }

  private getColCoddes() {
    return {
      headerName: 'Destinataire',
      field: 'coddes',
      sortable: true,
      width: 90,
      minWidth: 90,
      maxWidth: 110,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      cellRenderer: InterrupteurSelectEditorComponent,
      // Renderer avec une formKey, considéré comme éditable
      cellRendererParams: {
        isAllTimeClickable: this.isCellModifiable(AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE.code_destinataire),
        canEditOnlyOnNewRow: true,
        filterByFields: ['codorg'],
        formKey: 'coddes',
        values: [],
        hasBlankOption: true,
      },
      onCellValueChanged: (param: CellValueChangedEvent) => this.updateDestinataire(param),
    };
  }

  private getColNbrexe() {
    return {
      headerName: 'Copies',
      field: 'nbrexe',
      sortable: true,
      width: 60,
      minWidth: 60,
      maxWidth: 80,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'inputFilter',
      // Renderer avec une formKey, considéré comme éditable
      //cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'nbrexe',
        validators: [CustomValidators.maxValueValidator(99)],
      },
      cellStyle: { 'justify-content': 'flex-end' },
    };
  }

  private getColFicatt() {
    return {
      headerName: 'Message',
      field: 'ficatt',
      sortable: true,
      flex: 1,
      minWidth: 100,
      cellRenderer: InputEditorComponent,
      cellRendererParams: {
        formKey: 'ficatt',
        canEditOnlyOnNewRow: !this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE.ficatt),
        allowedCharacters: ['ALL'],
      },
    };
  }

  private getColEtat() {
    return {
      field: 'exeact',
      headerName: 'Etat',
      sortable: true,
      width: 70,
      minWidth: 70,
      maxWidth: 70,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'listFloatingFilter',
      floatingFilterComponentParams: {
        possibleLabelWithValues: [
          { label: 'Actif', value: true },
          { label: 'Inactif', value: false },
        ],
        suppressFilterButton: true,
      },
      cellRenderer: InterrupteurRadioComponent,
      cellRendererParams: {
        isAllTimeClickable: this.isCellModifiable(AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE.etat),
        canEditOnlyOnNewRow: true,
        formKey: 'exeact',
      },
      onCellClicked: (param: CellClickedEvent) => this.updateEtat(param),
    };
  }

  private updateEtat(param: CellClickedEvent) {
    if (this.canUpdate(param, AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE.etat) && (param.event.target as any).tagName === 'INPUT') {
      const input: any = param.event.target;
      const updateDTO = this.createExemplaireFromParamData(param.data);
      const oldSiteInCaseOfException = updateDTO.exeact;
      updateDTO.exeact = input.checked;
      input.checked && (updateDTO.nbrexe = 1);
      const title = "L'état de " + this.getExemplaireUpdateMessage(updateDTO);
      this.updateExemplaireFromApi(updateDTO, param, title, 'exeact', oldSiteInCaseOfException);
    }
  }

  private updateSite(param: CellValueChangedEvent) {
    if (this.canUpdate(param, AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE.code_site)) {
      const updateDTO = this.createExemplaireFromParamData(param.data);
      const title = 'Le site de ' + this.getExemplaireUpdateMessage(updateDTO);
      this.updateExemplaireFromApi(updateDTO, param, title, 'codsit', param.oldValue);
    }
  }

  private updateRessource(param: CellValueChangedEvent) {
    if (this.canUpdate(param, AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE.code_ressource)) {
      const updateDTO = this.createExemplaireFromParamData(param.data);
      const title = 'La ressource de ' + this.getExemplaireUpdateMessage(updateDTO);
      this.updateExemplaireFromApi(updateDTO, param, title, 'codres', param.oldValue);
    }
  }

  private updateDestinataire(param: CellValueChangedEvent) {
    if (
      this.canUpdate(param, AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE.code_destinataire) &&
      (param.oldValue ?? '') !== param.newValue
    ) {
      const updateDTO = this.createExemplaireFromParamData(param.data);
      const title = 'Le destinataire de ' + this.getExemplaireUpdateMessage(updateDTO);
      this.updateExemplaireFromApi(updateDTO, param, title, 'coddes', param.oldValue);
    }
  }

  // controle pour maj des données
  private canUpdate(param: CellValueChangedEvent | CellClickedEvent, auth: number) {
    const isCellModifiable = this.isCellModifiable(auth);
    const isDataConsul = param.data.isDataConsul;
    const isEditing = param.colDef?.cellRendererParams?.isEditing ?? false;
    return isCellModifiable && !isDataConsul && !isEditing;
  }

  private updateExemplaireFromApi(
    updateDTO: Exemplaire,
    param: CellValueChangedEvent | CellClickedEvent,
    title: string,
    key: string,
    oldValueInCaseOfException: any
  ) {
    this.subscriptions.push(
      this.apiAdelaideService.updateExemplaire(updateDTO).subscribe({
        next: () => {
          param.node.data[key] = updateDTO[key];
          param.api.redrawRows({ rowNodes: [param.node] });
          this.noteService.show({
            title: title,
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
        },
        error: error => {
          param.node.data[key] = oldValueInCaseOfException;
          param.api.redrawRows({ rowNodes: [param.node] });
          this.noteService.show({
            title: error.graphQLErrors[0].message,
            classname: 'note-erreur',
            category: ToastCategoryEnum.ERROR,
          });
        },
      })
    );
  }

  private createExemplaireFromParamData(rowData) {
    return new Exemplaire(
      rowData.codenv,
      rowData.codorg,
      rowData.codapp,
      rowData.codcom,
      rowData.codfic,
      rowData.codgam,
      rowData.numexe,
      rowData.codsit,
      rowData.codres,
      rowData.coddes,
      rowData.nbrexe,
      rowData.exeact
    );
  }

  private getExemplaireUpdateMessage(updateDTO: Exemplaire) {
    return (
      "l'exemplaire [" +
      updateDTO.codenv +
      '-' +
      updateDTO.codorg +
      '-' +
      updateDTO.codapp +
      '-' +
      updateDTO.codcom +
      '-' +
      updateDTO.codfic +
      '-' +
      updateDTO.codgam +
      '-' +
      updateDTO.codres +
      '] a été mis à jour avec succès'
    );
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }

  getColumnDefs(isColSelectAll: boolean): (ColDef | ColGroupDef)[] {
    return this.getColumDefsAction(isColSelectAll).concat(this.getColumDefs());
  }

  private isCellModifiable(idPermission: number) {
    return (
      this.servicePerm.hasPermission(AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE[KEY_MODIFIER_AUTH]) &&
      this.servicePerm.hasPermission(idPermission)
    );
  }
}
