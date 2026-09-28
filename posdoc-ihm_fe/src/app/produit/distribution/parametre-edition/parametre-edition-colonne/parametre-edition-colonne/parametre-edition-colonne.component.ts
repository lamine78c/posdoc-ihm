import { Component, inject, OnInit } from '@angular/core';
import { CellValueChangedEvent, ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { TableauParametreEditionColonneService } from '../service/tableau-parametre-edition-colonne.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ApiAdelaideDistributionService } from '@app/services/api-adelaide-distribution.service';
import { SearchExemplaireByResourceQuery } from '@app/models/payload/search-exemplaire-by-resource';
import { ExemplaireByResource, ExemplaireByResourceInterface, ExemplaireRessource } from '@app/models/exemplaire-by-resource';
import { ApolloQueryResult } from 'apollo-client';
import { filter, map, startWith, switchMap, take, tap } from 'rxjs/operators';
import { ParametreEditionColonneSearchFilter } from '../../model/parametre-edition-search-filter';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { AsyncApiParametresEdition } from '@app/models/asyncApiParametresEdition';
import { DestinataireData } from '../../model/destinataire-data';
import { FetchResult } from 'apollo-link';
import { DeleteExemplaires } from '@app/models/deleteExemplaire';
import { AgGridUtil } from '@app/shared/utils/AgGridUtil';
import { SearchByEnvOrgsAppComFicQuery } from '@app/models/payload/search-by-env-orgs-app-com-fic';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupConfirmationComponent } from '@app/admin/popup/popup-confirmation/popup-confirmation.component';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { PermissionService } from '@app/services/permission/permission.service';
import { AllOrgRegionInterface } from '@app/models/exploitation-editique/massification/all-organisme-interface';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { DEFAULT_SEPARATOR } from '@app/shared/utils/Constants';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';

@Component({
  selector: 'app-parametre-edition-colonne',
  templateUrl: './parametre-edition-colonne.component.html',
  styleUrls: ['./parametre-edition-colonne.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ParametreEditionColonneComponent implements OnInit {
  subscriptions: Subscription[] = [];

  nombreExemplaires: number;

  checkboxStates: { [key: string]: boolean } = {};
  rowData: ExemplaireByResource[] = [];
  organismes: AllOrgRegionInterface[] = [];
  overlayNoRowsTemplate: string;
  gridApi: GridApi;
  gridColumnApi: GridApi;
  columnDefs: ColDef[];
  gridOptions: GridOptions;
  rowData$: Observable<ExemplaireByResource[]>;
  requestParams$: BehaviorSubject<ParametreEditionColonneSearchFilter> = new BehaviorSubject<ParametreEditionColonneSearchFilter>(null);
  destinatairesData$: BehaviorSubject<DestinataireData[]> = new BehaviorSubject<DestinataireData[]>([]);

  canAddPermPosition = AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.ajouter;
  canRemovePermPosition = AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.supprimer;
  canEditPermPosition = AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.modifier;

  hasProfil: boolean;
  genericOrg: string;

  private readonly permissionsService = inject(PermissionService);
  private readonly apiParametresService = inject(ApiAdelaideParametreService);
  private readonly noteService: NotesService = inject(NotesService);
  private readonly modalService: NgbModal = inject(NgbModal);
  private readonly apiDistributionService: ApiAdelaideDistributionService = inject(ApiAdelaideDistributionService);
  private readonly tableauConfigurationBuilderService: TableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauParametreEditionColonneService: TableauParametreEditionColonneService = inject(TableauParametreEditionColonneService);

  constructor() {
    // do nothing
  }

  canRemoveParamEditionRessource: boolean = this.permissionsService.hasPermission(
    AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.supprimer
  );

  ngOnInit(): void {
    this.initGridOptions();
    this.initRowData();
    this.initGenericOrg();
  }

  private initGridOptions() {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
    this.gridOptions.context = {
      componentParent: this,
    };
    this.gridOptions.suppressClickEdit = false;
    this.gridOptions.onCellValueChanged = (event: CellValueChangedEvent) => {
      if (event.column.getColId() === 'message') {
        const query = this.getUpdateMessageQuery(event);
        this.subscriptions.push(this.apiDistributionService.updateMessageFichierByExemplaires(query, event.data.message).subscribe());
      }
    };
    this.overlayNoRowsTemplate = this.tableauParametreEditionColonneService.getOverlayNoRowsTemplate();
  }

  getUpdateMessageQuery(event: CellValueChangedEvent): SearchByEnvOrgsAppComFicQuery {
    return {
      codenv: event.data.codenv,
      codorgs: [event.data.codorg],
      codapp: event.data.codapp,
      codcom: event.data.codcom,
      codfic: event.data.codfic,
    };
  }

  initRowData() {
    this.rowData$ = this.requestParams$.pipe(
      filter(params => !!params),
      switchMap(params => this.apiDistributionService.getExemplairesByRessource(this.getExemplaireByResourceQuery(params))),
      map((result: ApolloQueryResult<ExemplaireByResourceInterface>) => {
        this.rowData = result.data.getExemplairesByRessource.map(exemplaire => ({
          ...exemplaire,
          ressources: exemplaire.ressources.map(ressource => ({
            ...ressource,
            hasProfil: !this.permissionsService.hasProfileAdmin() && ressource.hasProfil,
          })),
        }));
        this.organismes = result.data.allOrganismes;
        this.rowData.forEach(row => {
          row.codreg = this.getCodeRegionByCodeOrg(row.codorg);
        });
        if (!this.rowData.length) {
          this.tableauConfigurationBuilderService.getNoDataMessage(this.gridApi);
        }
        return this.rowData;
      }),
      tap((data: ExemplaireByResource[]) => {
        const resources = this.requestParams$.getValue().ressources;
        this.columnDefs = this.tableauParametreEditionColonneService.getAllColumns(resources, data, this.destinatairesData$, this.genericOrg);
      }),
      startWith([])
    );
  }

  private initGenericOrg() {
    this.apiParametresService.getCodeOrgOGUR().subscribe((result: any) => {
      this.genericOrg = result.data.getCodeOrgOGUR;
    });
  }

  getCodeRegionByCodeOrg(codeOrg: string) {
    return this.organismes.filter(o => o.code == codeOrg)[0]?.codeRegion;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.gridApi.setGridOption('loading', false);
    this.getDestinataireData();
  }

  isDeleteButtonActive(): boolean {
    const properties = Object.keys(this.checkboxStates);
    return properties.length > 0 && properties.some(key => this.checkboxStates[key]);
  }

  deleteSelectedExemplaires() {
    const modalRef = this.modalService.open(PopupConfirmationComponent);
    const modalTitle = Object.keys(this.checkboxStates).length > 1 ? "Suppression d'exemplaires" : "Suppression d'un exemplaire";
    modalRef.componentInstance.messages = [
      modalTitle,
      "Vous êtes sur le point de supprimer l'exemplaire",
      'Vous êtes sur le point de supprimer les exemplaires',
    ];
    modalRef.componentInstance.rowDataArray = this.getDeleteModalDataArray();
    this.subscriptions.push(
      modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
        if (numButton === NUM_FIRST_BTN_MODAL) {
          const toDeleteDTO = this.getDeleteExemplairesDTO();
          this.subscriptions.push(
            this.apiDistributionService.deleteExemplaires(toDeleteDTO).subscribe((result: FetchResult<DeleteExemplaires>) => {
              if (result.data.deleteExemplaires.ok) {
                this.requestParams$.next(this.requestParams$.getValue());
                this.checkboxStates = {};
                this.noteService.show({
                  title: `Les exemplaires ont été supprimés avec succès`,
                  classname: 'note-confirmation',
                  category: ToastCategoryEnum.SUCCESS,
                });
              }
            })
          );
        }
      })
    );
  }

  private getDeleteModalDataArray(): string[] {
    return Object.keys(this.checkboxStates)
      .filter(key => this.checkboxStates[key])
      .map(property => {
        const nodeId = property.split(DEFAULT_SEPARATOR)[0];
        const fichier = this.rowData[nodeId];
        const codsit = property.split(DEFAULT_SEPARATOR)[1];
        const codres = property.split(DEFAULT_SEPARATOR)[2];
        const codgam = property.split(DEFAULT_SEPARATOR)[3];
        return `${fichier.codenv} - ${fichier.codorg} - ${fichier.codapp} - ${fichier.codcom} - ${fichier.codfic} - ${codgam}/${codsit}/${codres}`;
      });
  }

  private getDeleteExemplairesDTO() {
    return Object.keys(this.checkboxStates)
      .filter(property => this.checkboxStates[property])
      .map(property => {
        const nodeId = property.split(DEFAULT_SEPARATOR)[0];
        const codsit = property.split(DEFAULT_SEPARATOR)[1];
        const codres = property.split(DEFAULT_SEPARATOR)[2];
        const codgam = property.split(DEFAULT_SEPARATOR)[3];
        const row = this.gridApi.getRowNode(nodeId);
        return {
          codenv: row.data.codenv,
          codorg: row.data.codorg,
          codapp: row.data.codapp,
          codcom: row.data.codcom,
          codfic: row.data.codfic,
          codgam: codgam,
          numexe: null,
          codres: codres,
          codsit: codsit,
        };
      });
  }

  getDestinataireData(): void {
    this.subscriptions.push(
      this.apiDistributionService.getAsyncAPIsForParametreEdition().subscribe((result: ApolloQueryResult<AsyncApiParametresEdition>) => {
        this.destinatairesData$.next(
          result.data.allDestinataires
            .map(destin => ({
              value: destin.code,
              text: destin.code,
              codorg: destin.codeOrg,
              libelle: destin.libelle,
            }))
            .sort((a, b) => a.text.localeCompare(b.text))
        );
      })
    );
  }

  private getExemplaireByResourceQuery(params: ParametreEditionColonneSearchFilter): SearchExemplaireByResourceQuery {
    return {
      codenv: params.environnement,
      codorgs: params.organisme,
      codapp: params.application,
      codcom: params.commande,
      codfics: params.fichier,
      ressources: params.ressources,
      isRessourcesAbsentes: params.ressourcesAbsentes,
      message: params.message ?? null,
    };
  }

  listExemplairesByResource(event: ParametreEditionColonneSearchFilter): void {
    AgGridUtil.resetFilterAndColumnSort(this.gridApi);
    this.requestParams$.next(event);
  }

  getCheckboxKey(rowId: any, colId: string): string {
    return `${rowId}_${colId}`;
  }

  toggleColumnCheckboxes(colId: string, checked: boolean): void {
    this.gridApi.forEachNode(node => {
      const key = `${node.id}${DEFAULT_SEPARATOR}${colId}`;
      const resource: ExemplaireRessource = node.data.ressources?.find(r => {
        const resourceId = `${r.codsit}${DEFAULT_SEPARATOR}${r.codres}${DEFAULT_SEPARATOR}${r.codgam}`;
        return resourceId === colId;
      });
      const nodeCodorg: string = node.data.codorg;
      const hasProfil: boolean = resource?.hasProfil || (resource?.codorg !== this.genericOrg && resource?.codorg !== nodeCodorg);

      if (resource?.exemplaireExists && !hasProfil && this.canRemoveParamEditionRessource) {
        this.checkboxStates[key] = checked;
        this.gridApi.refreshCells({
          rowNodes: [node],
          force: true,
          columns: [colId],
          suppressFlash: true,
        });
      }
    });
  }
}
