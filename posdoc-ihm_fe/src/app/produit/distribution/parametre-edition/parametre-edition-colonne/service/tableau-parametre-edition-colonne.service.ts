import { inject, Injectable } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { InterrupteurRadioComponent } from '@app/fullstack-components/tableau/ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { SelectTableEditorComponent } from '@app/fullstack-components/tableau/ag-grid-components/select-table-editor/select-table-editor.component';
import { Exemplaire } from '@app/models/exemplaire';
import { ExemplaireByResource, ExemplaireRessource } from '@app/models/exemplaire-by-resource';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { TableauUtilService } from '@app/services/tableau-util.service';
import { CheckboxHeaderComponent } from '@app/shared/components/checkbox/checkbox-header/checkbox-header.component';
import { CheckboxComponent } from '@app/shared/components/checkbox/checkbox.component';
import { DEFAULT_SEPARATOR } from '@app/shared/utils/Constants';
import { StringUtil } from '@app/shared/utils/StringUtil';
import { CellClassParams, CellClickedEvent, ColDef, ValueGetterParams } from 'ag-grid-community';
import { BehaviorSubject } from 'rxjs';
import { DestinataireData } from '../../model/destinataire-data';

@Injectable({
  providedIn: 'root',
})
export class TableauParametreEditionColonneService {
  private readonly permissionsService = inject(PermissionService);
  private readonly tableauUtilService = inject(TableauUtilService);
  private readonly apiDistributionService = inject(ApiAdelaideDistributionService);
  private readonly noteService = inject(NotesService);
  private NO_ROWS_TEXT = "<b>Veuillez remplir le formulaire pour sélectionner les paramètres d'editions à charger</b>";

  constructor() {
    // do nothing
  }

  canRemoveParamEditionRessource: boolean = this.permissionsService.hasPermission(
    AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.supprimer
  );
  canAddParamEditionRessource: boolean = this.permissionsService.hasPermission(AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.ajouter);
  canEditMsgParamEditionRessource: boolean = this.permissionsService.hasPermission(
    AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.message
  );
  canEditStateParamEditionRessource: boolean = this.permissionsService.hasPermission(
    AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.state
  );
  canEditDestParamEditionRessource: boolean = this.permissionsService.hasPermission(
    AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.coddes
  );

  genericOrg: string;

  public getBaseColumns(): ColDef[] {
    return [
      this.tableauUtilService.getColClearFilter({ pinned: 'left' }),
      this.getRegionCol(),
      this.getOrganismeCol(),
      this.getCommandeCol(),
      this.getFichierCol(),
      this.getMessageCol(),
    ];
  }

  private getRegionCol(): ColDef {
    return {
      headerName: 'Reg.',
      field: 'codreg',
      flex: 1,
      minWidth: 70,
      maxWidth: 70,
      sortable: true,
      sort: 'asc',
      pinned: 'left',
      suppressMovable: true,
    };
  }

  private getOrganismeCol(): ColDef {
    return {
      headerName: 'Org.',
      field: 'codorg',
      flex: 1,
      minWidth: 70,
      maxWidth: 70,
      sortable: true,
      sort: 'asc',
      pinned: 'left',
      suppressMovable: true,
    };
  }

  private getCommandeCol(): ColDef {
    return {
      headerName: 'Com.',
      field: 'codcom',
      flex: 1,
      minWidth: 70,
      maxWidth: 70,
      sortable: true,
      sort: 'asc',
      pinned: 'left',
      suppressMovable: true,
    };
  }

  private getFichierCol(): ColDef {
    return {
      headerName: 'Fic.',
      field: 'codfic',
      flex: 1,
      minWidth: 70,
      maxWidth: 70,
      sortable: true,
      sort: 'asc',
      pinned: 'left',
      suppressMovable: true,
    };
  }

  private getMessageCol(): ColDef {
    return {
      headerName: 'Message',
      field: 'message',
      flex: 1,
      minWidth: 150,
      editable: this.canEditMsgParamEditionRessource,
      pinned: 'left',
      suppressMovable: true,
    };
  }

  private getRessourcesCols(
    resources: string[],
    exemplaires: ExemplaireByResource[],
    destinataireData$: BehaviorSubject<DestinataireData[]>,
    genericOrg: string
  ): ColDef[] {
    this.genericOrg = genericOrg;
    const resourceColumns: ColDef[] = [];

    const sortedResources = [...resources].sort(StringUtil.compareKeys.bind(this));

    sortedResources.forEach(resource => {
      const [codgam, codsit, codres] = resource.split('/');

      resourceColumns.push(this.getCheckboxCol(codsit, codres, codgam, exemplaires));
      resourceColumns.push(this.getActionCol(codsit, codres, codgam));
      resourceColumns.push(this.getStateCol(codsit, codres, codgam));
      resourceColumns.push(this.getDestinataireCol(codsit, codres, codgam, destinataireData$));
    });

    return resourceColumns;
  }

  private getCheckboxCol(codsit: string, codres: string, codgam: string, exemplaires: ExemplaireByResource[]): ColDef {
    return {
      headerName: '',
      field: `${codsit}${DEFAULT_SEPARATOR}${codres}${DEFAULT_SEPARATOR}${codgam}`,
      sortable: false,
      flex: 1,
      minWidth: 35,
      maxWidth: 35,
      suppressMovable: true,
      headerComponent: CheckboxHeaderComponent,
      cellRenderer: CheckboxComponent,
      cellRendererParams: params => {
        const resource: ExemplaireRessource = this.getResourceFromExemplaire(params.data.ressources, codres, codsit, codgam);
        return {
          exemplaires: exemplaires,
          resource: resource,
          genericOrg: this.genericOrg,
        };
      },
      hide: !this.canRemoveParamEditionRessource,
    };
  }

  private getActionCol(codsit: string, codres: string, codgam: string): ColDef {
    return {
      headerName: '',
      field: 'addExemplaire',
      flex: 1,
      width: 35,
      minWidth: 35,
      maxWidth: 35,
      sortable: false,
      suppressMovable: true,
      cellRenderer: 'actionRendererAddExemplaire',
      cellRendererParams: params => {
        const resource = this.getResourceFromExemplaire(params.data.ressources, codres, codsit, codgam);
        return {
          resource: resource,
          genericOrg: this.genericOrg,
        };
      },
      hide: !this.canAddParamEditionRessource && !this.canRemoveParamEditionRessource,
    };
  }

  private getStateCol(codsit: string, codres: string, codgam: string): ColDef {
    return {
      headerName: 'Etat',
      field: `${codgam}_${codres}_${codsit}_state`,
      flex: 1,
      minWidth: 50,
      maxWidth: 50,
      sortable: false,
      suppressMovable: true,
      cellRenderer: InterrupteurRadioComponent,
      cellRendererParams: params => {
        const resource: ExemplaireRessource = this.getResourceFromExemplaire(params.data.ressources, codres, codsit, codgam);
        return {
          formKey: 'state',
          isAllTimeClickable:
            this.canEditStateParamEditionRessource &&
            !resource?.hasProfil &&
            (resource?.codorg === params.data.codorg || resource?.codorg === this.genericOrg),
          resource: resource,
        };
      },
      valueGetter: (params: ValueGetterParams<ExemplaireByResource>) => {
        const resource = this.getResourceFromExemplaire(params.data.ressources, codres, codsit, codgam);
        return resource?.etat;
      },
      onCellClicked: (param: CellClickedEvent) => {
        const resource = this.getResourceFromExemplaire(param.data.ressources, codres, codsit, codgam);
        this.onStateCellClicked(param, resource);
      },
    };
  }

  private onStateCellClicked(param: CellClickedEvent, ressource: ExemplaireRessource) {
    if (param.event.target instanceof HTMLInputElement) {
      const input: HTMLInputElement = param.event.target;
      const updateDTO = this.getExemplaireDTO(param, ressource);
      const oldSiteInCaseOfException: boolean = updateDTO.exeact;
      updateDTO.exeact = input.checked;
      input.checked && (updateDTO.nbrexe = 1);
      this.apiDistributionService.updateExemplaire(updateDTO).subscribe(
        () => {
          param.node.data.exeact = updateDTO.exeact;
          this.noteService.show({
            title:
              "L'état de l'exemplaire [" +
              param.data.codenv +
              '-' +
              param.data.codorg +
              '-' +
              param.data.codapp +
              '-' +
              param.data.codcom +
              '-' +
              param.data.codfic +
              '-' +
              ressource?.codgam +
              '-' +
              ressource?.codres +
              '] a été mis à jour avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
        },
        error => {
          param.node.data.exeact = oldSiteInCaseOfException;
          param.api.redrawRows({ rowNodes: [param.node] });
          this.noteService.show({
            title: error.graphQLErrors[0].message,
            classname: 'note-erreur',
            category: ToastCategoryEnum.ERROR,
          });
        }
      );
    }
  }

  private getDestinataireCol(codsit: string, codres: string, codgam: string, destinataireData$: BehaviorSubject<DestinataireData[]>): ColDef {
    return {
      headerName: `${codgam}/${codsit}/${codres}`,
      field: `destinataire_${codgam}_${codres}_${codsit}`,
      flex: 1,
      minWidth: 135,
      sortable: false,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'multiSelectFloatingFilter',
      suppressMovable: true,
      cellRenderer: SelectTableEditorComponent,
      cellStyle: { 'border-right': '1px solid darkgrey' },
      cellClass: (params: CellClassParams) => {
        const resource = this.getResourceFromExemplaire(params.data.ressources, codres, codsit, codgam);
        return resource?.hasProfil && (resource?.codorg === params.data.codorg || resource?.codorg === this.genericOrg) ? 'row-consultation' : '';
      },
      cellRendererParams: (params: any) => {
        const resource: ExemplaireRessource = this.getResourceFromExemplaire(params.data.ressources, codres, codsit, codgam);
        return {
          isAllTimeClickable: this.canEditDestParamEditionRessource,
          filterByFields: ['codorg'],
          formKey: 'coddes',
          values: [],
          validators: [],
          selectData: destinataireData$,
          resource: resource,
          hasBlankOption: true,
          updateValue: (value: string, params: any) => {
            this.updateDestinataire(value, params, resource);
          },
        };
      },
      valueGetter: (params: ValueGetterParams<ExemplaireByResource>) => {
        const resource = this.getResourceFromExemplaire(params.data.ressources, codres, codsit, codgam);
        return resource?.coddes;
      },
    };
  }

  updateDestinataire(value: string, params: any, ressource: ExemplaireRessource) {
    const updateDTO = this.getExemplaireDTO(params, ressource);
    const oldSiteInCaseOfException: string = updateDTO.coddes;
    if (value !== updateDTO.coddes) {
      updateDTO.coddes = value || null;
      this.apiDistributionService.updateExemplaire(updateDTO).subscribe(
        () => {
          ressource.coddes = updateDTO.coddes;
          params.api.refreshCells({ rowNodes: [params.node], force: true });
          this.noteService.show({
            title:
              "Le destinataire de l'exemplaire [" +
              params.data.codenv +
              '-' +
              params.data.codorg +
              '-' +
              params.data.codapp +
              '-' +
              params.data.codcom +
              '-' +
              params.data.codfic +
              '-' +
              ressource?.codgam +
              '-' +
              ressource?.codres +
              '] a été mis à jour avec succès',
            classname: 'note-confirmation',
            category: ToastCategoryEnum.SUCCESS,
          });
        },
        error => {
          params.node.data.coddes = oldSiteInCaseOfException;
          params.api.redrawRows({ rowNodes: [params.node] });
          this.noteService.show({
            title: error.graphQLErrors[0].message,
            classname: 'note-erreur',
            category: ToastCategoryEnum.ERROR,
          });
        }
      );
    }
  }

  public getAllColumns(
    resources: string[],
    exemplaires: ExemplaireByResource[],
    destinataireData$: BehaviorSubject<DestinataireData[]>,
    genericOrg: string
  ): ColDef[] {
    return [...this.getBaseColumns(), ...this.getRessourcesCols(resources, exemplaires, destinataireData$, genericOrg)];
  }

  getExemplaireDTO(param: any, ressource: ExemplaireRessource) {
    const destinataire = ressource?.coddes;
    const etat = ressource?.etat;
    return new Exemplaire(
      param.data.codenv,
      param.data.codorg,
      param.data.codapp,
      param.data.codcom,
      param.data.codfic,
      ressource?.codgam,
      param.data.numexe,
      ressource?.codsit,
      ressource?.codres,
      destinataire,
      1,
      etat
    );
  }

  private getResourceFromExemplaire(resources: ExemplaireRessource[], codres: string, codsit: string, codgam: string): ExemplaireRessource {
    return resources.find(res => res.codres === codres && res.codsit === codsit && res.codgam === codgam);
  }

  getOverlayNoRowsTemplate(): string {
    return '<span class="no-rows">' + this.NO_ROWS_TEXT + '</span>';
  }
}
