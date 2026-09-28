import { Component, HostListener, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent, IRowNode, ModelUpdatedEvent, RowNode } from 'ag-grid-community';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  DefaultColConfiguration,
  InternalRowNode,
  StartEditingTable,
  TableAsynchronousError,
  UserColConfiguration,
} from '../../models/tableau.models';
import { ColumnsConfigurationService } from '../../services/columns-configuration.service';
import { TableauErrorsService } from '../../services/tableau-errors.service';
import { TableauModifiableService } from '../../services/tableau-modifiable.service';
import { TableauService } from '../../services/tableau.service';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { AddType } from '@app/models/enums/add-type';
import { TABLEAU_COL_ID_RESERVE } from '@app/fullstack-components/utils/Constants';

@Component({
  selector: 'app-tableau',
  templateUrl: './tableau.component.html',
  standalone: false,
})
export class TableauComponent implements OnInit, OnDestroy {
  @HostListener('mouseenter', ['$event'])
  handleClickToRemoveAriaHiddenInAgGridCheckboxes(): void {
    document.querySelectorAll('.ag-cell-wrapper, .ag-header-select-all').forEach(element => (element.ariaHidden = 'false'));
  }

  @ViewChild('agGrid') agGrid: AgGridAngular;

  /**
   * Object GridOptions d'ag grid contenant la configuration du tableau
   */
  @Input() gridOptions: GridOptions;
  /**
   * Object contenant les différentes colonnes ag grid à afficher
   */
  @Input() columnDefs: (ColDef | ColGroupDef)[];
  /**
   * Template affiché si aucune données en entrée ou après un filtrage
   */
  @Input() overlayNoRowsTemplate: string;
  /**
   * Template affiché si la tableau est désactivé ou en attente de chargement
   */
  @Input() overlayLoadingTemplate: string;
  /**
   * Les données correspondantes aux colonnes
   */
  @Input() rowData: any;
  /**
   * Affichage de la pagination
   * Champ optionnel, peut être laissé à vide pour ne pas afficher de pagination
   */
  @Input() pagination: boolean;
  /**
   * Affichage de la ligne total
   * Format :
   *  - labelId : id de la colonne sur laquelle sera afficher le mot "TOTAL"
   *  - valuesId : tableaux des id de colonne pour lesquels il faut afficher un total
   * Champ optionnel, peut être laissé à vide pour ne pas afficher la ligne total
   */
  @Input() total: { labelId: string; valuesId: string[] };
  /**
   * Pour un tableau éditable, ajoute les nouvelles lignes à la fin plutôt qu'au début
   * Champ optionnel, peut être laissé à vide pour ajouter les lignes au début
   */
  @Input() pushNewRows = false;
  /**
   * Pour un tableau éditable, permet d'envoyer de façon asynchrone des erreurs à afficher lors de l'édition
   * La valeur "key" doit correspondre à la valeur renseignée dans "cellEditorParams" des ColDefs
   */
  @Input() asynchronousErrors$: Observable<Map<number, TableAsynchronousError[]>>;
  /**
   * Permet d'afficher le bouton pour ajouter une ligne
   * Champ optionnel, ne sera pas afficher par défaut
   */
  @Input() enableAddButton: AddType = null;
  /**
   * Permet d'afficher le bouton pour éditer tout le tableau
   * Champ optionnel, ne sera pas afficher par défaut
   */
  @Input() enableFullEdit = false;
  /**
   * Permet d'afficher les boutons pour exporter les données en PDF ou excel
   * Champ optionnel, ne sera pas afficher par défaut
   */
  @Input() enableExportButtons = false;
  /**
   * Permet de caché le bouton pour exporter les données en excel
   * Champ optionnel, sera afficher par défaut
   */
  @Input() disableExcelExportButton = false;
  /**
   * Permet de caché le bouton pour exporter les données en pdf
   * Champ optionnel, sera afficher par défaut
   */
  @Input() disablePdfExportButton = false;
  /**
   * Permet de définir le nombre de lignes affichées par défaut en cas de pagination
   * Champ optionnel, 20 par défaut
   */
  @Input() defaultNbreLignes: string = '500';
  /**
   * Permet d'afficher un bouton afin de configurer l'affiche des colonnes
   * Champ optionnel, false par défaut
   */
  @Input() displayColumnsConfiguration: boolean = false;
  /**
   * Configuration des colonnes pour l'utilisateur connecté
   * Champ optionnel, pas de configuration spécifique par défaut
   */
  @Input() userColConfiguration: UserColConfiguration;
  /**
   * Permission d'ajoutd'éléments au tableau selon les authorisatoipn
   * par défaut, toujour pas de permission
   */
  @Input() canAddPerm: number;
  /**
   * Permission de la modification d'éléments au tableau selon les authorisatoipn
   * par défaut, toujour pas de permission
   */
  @Input() canEditPerm: number;
  /**
   * Permission d'ajoutd'éléments au tableau selon les authorisatoipn
   * par défaut, toujour pas de permission
   */
  @Input() canRemovePerm: number;
  /**
   * Retourne l'API d'ag-grid lorsqu'elle est prête
   */
  @Output() gridReady: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
  /**
   * Notifie le parent qu'une demande de sauvegarde est envoyée pour la ligne en édition
   * Permet de vérifier les valeurs et mettre à jour asynchronousErrors$ si besoin
   */
  @Output() saveEdition: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Notifie le parent qu'une demande d'annulation de modification est envoyée
   */
  @Output() cancelEdition: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Notifie le parent qu'une demande de sauvegarde est envoyée pour la ligne en édition
   * Permet de vérifier les valeurs et mettre à jour asynchronousErrors$ si besoin
   */
  @Output() deleteRows: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Notifie le parent que la configuration des colonnes du tableau a été changée
   * afin de la sauvegarder pour une persistance
   */
  @Output() configurationUpdated: EventEmitter<UserColConfiguration> = new EventEmitter<UserColConfiguration>();
  /**
   * Notifie le parent qu'une demande de modification en masse est envoyée
   */
  @Output() updateRows: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Notifie le parent qu'une demande de l'ajout en masse est envoyée
   */
  @Output() addGroup: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Notifie le parent qu'une demande de modification est envoyée
   */
  @Output() completeRow: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Notifie le parent qu'on doit ouvrir le popup de recherche
   */
  @Output() openSearch: EventEmitter<any> = new EventEmitter<any>();

  // Afficher le bouton recherche avancée
  @Input() searchButton: boolean = false;

  // Afficher le bouton completer
  @Input() completeButton: boolean = false;

  //Afficher le bouton add group
  @Input() addGroupButton: boolean = false;
  // Afficher le bouton valider
  @Input() validerButton: boolean = false;
  @Input() disableValiderBtn: boolean = false;

  //Afficher le bouton edit group
  @Input() editGroupButton: boolean = false;

  //Afficher le bouton ajouter
  @Input() modalAddButton: boolean = false;

  //Afficher le bouton comparer
  @Input() compareButton: boolean = false;

  // ajouter le popup d'ajout unitaire
  @Output() addEvent: EventEmitter<any> = new EventEmitter<any>();

  // afficher le popup de comparaison
  @Output() compareEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() validerEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() exportAsExcel = new EventEmitter<any>();
  @Output() exportAsPDF = new EventEmitter<any>();

  /**
   * Permet de masquer le bouton 'Ajouter en masse' si aucun ligne dans la grid n'est sélectionné
   */
  @Input() disableAjouterEnMasseIfNoRowSelected: boolean = false;

  // Controle enable/disable le bouton ajouter
  @Input() disableAddBtn: boolean = false;

  permissionPosition: number = 999;

  context: any;

  tremplate = '<span>test</span>';

  toastCategoryEnum: typeof ToastCategoryEnum = ToastCategoryEnum;

  gridApi: GridApi;
  gridColumnApi: GridApi;
  subscriptions: Subscription[] = [];

  // Permet de savoir si une row avait été ajouté lorsque l'utilisateur cancel
  private newRowAdded = false;
  // Clef unique ag-grid
  private uniqueAgKey: string;
  // ID HTML unique
  uniqueUiID: string = 'id-' + new Date().getTime();

  // Sauvegarde des données avant l'édition
  dataBeforeEdition: any[] = [];

  // Gestion de l'édition
  isEditing: boolean;
  // Gestion du status du bouton "Supprimer en masse"
  enableDeleteButton = false;

  // Gestion du bouton Compléter
  enableCompleteButton = false;

  // Gestion du bouton Ajouter en masse pour les parametres d'edition
  enableAddGroupButtonParam = false;

  // Gestion de l'affichage des boutons
  displayDeleteSelectedButton = false;
  disableSaveForAsyncErrors = false;

  // Popup de confirmation lors de la suppression d'une ligne
  deleteModal: any;

  // messages a afficher dans la Popup
  messages: any[];

  // Label de l'id
  idsLabel: string[];

  // Separator du label des ids
  idsLabelSeparator: string = '';

  // Configuration par défaut des colonnes
  defaultColConfiguration: DefaultColConfiguration;

  onFormEditionStartedFn;

  gridColumnState;
  gridFilterModel;

  constructor(
    private tableauService: TableauService,
    private tableauModifiableService: TableauModifiableService,
    private tableauErrorsService: TableauErrorsService,
    private notesService: NotesService,
    private columnsConfigurationService: ColumnsConfigurationService,
    private filterSharedDataService: FilterSharedDataService
  ) {}

  ngOnInit(): void {
    // Ajoute des écoutes d'évènements à la configuration
    this.setGridOptionOverload();

    // Gère l'affichage des boutons autour du tableau
    this.checkButtonsToDisplay();
  }

  /**
   * Lorsqu'ag-grid est prêt :
   * - Récupère les paramètres
   * - Affiche la ligne total si besoin
   * - Subscribe au prêt des erreurs asynchrone si l'observable est passé en input
   * - Charge la configuration utilisateur des colonnes
   */
  onGridReady(params: GridReadyEvent) {
    this.gridReady.emit(params);

    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.uniqueAgKey = this.gridApi.getGridId();

    // envoi le delete row event au cellules
    this.context = {
      deleteRowEvent: this.deleteRows,
      updateRowEvent: this.updateRows,
    };

    if (this.gridOptions.context) {
      this.context.componentParent = this.gridOptions.context?.componentParent;
    }

    // Affiche la ligne TOTAL si besoin
    if (this.total) {
      this.displayTotalPinnedRow();
    }

    // Gestion des erreurs asynchrones
    this.handleAsynchronousErrors();

    // Dans le cas d'un tableau double entête, la hauteur est de 32
    if (!!this.columnDefs && this.columnDefs.some((e: ColGroupDef) => !!e.children)) {
      this.gridApi.setGridOption('headerHeight', 32);
    } else {
      // Sinon la hauteur de 40 pour une ligne
      this.gridApi.setGridOption('headerHeight', 40);
    }

    // Écoute l'observable pour savoir si une ligne demande à passer en édition
    this.subscriptions.push(
      this.tableauModifiableService.onStartEditing(this.uniqueAgKey).subscribe((startEditingTable: StartEditingTable) => {
        this.startEditing(startEditingTable.rowId);
      })
    );

    // Sauvegarde la configuration par défaut et charge la configuration utilisateur des colonnes
    this.handleColConfiguration();

    this.gridApi.addEventListener('filterChanged', () => {
      if (this.gridApi?.getSelectedNodes()?.length > 1) {
        this.gridApi.deselectAll();
      }
    });

    this.gridApi.addEventListener('selectionChanged', () => {
      // Aucune action nécessaire ici car le bouton "Supprimer en masse"
      // est géré par [disabled]="!isEnableButton()" dans le template
      // et sa visibilité est déterminée par displayDeleteSelectedButton
    });
  }

  /**
   * Surcharge l'objet gridOption :
   * - Écoute les changements sur les filtres pour afficher l'overlay no rows si besoin
   * - Écoute les changements sur le modal si il y a une ligne total afin de la mettre à jour
   */
  setGridOptionOverload(): void {
    // Mise à jour après un filtrage
    this.gridOptions.onFilterModified = () => {
      // Après un filtre ne retournant pas de résultat, l'overlay noRows n'est pas trigger
      // On le trigger donc manuellement ici si besoin
      if (this.gridApi?.getDisplayedRowCount() === 0) {
        this.gridApi?.showNoRowsOverlay();
      } else {
        this.gridApi?.hideOverlay();
      }

      // Redraw les lignes afin d'être sur que les actions handlers soient bien à jour
      this.gridApi?.redrawRows();
    };

    // Met à jour la ligne total quand le model change (sort, filter, new row, row removed)
    if (this.total) {
      this.gridOptions.onModelUpdated = () => {
        if (this.gridApi) {
          this.displayTotalPinnedRow();
        }
      };
    }
  }

  /**********************/
  /**    AFFICHAGE     **/
  /**********************/

  /**
   * Gère l'affichage des boutons autour du tableau
   */
  checkButtonsToDisplay(): void {
    // Vérifier d'abord si columnDefs existe
    if (!this.columnDefs) return;

    // Afficher par défaut le bouton de suppression en masse si la sélection multiple est activée
    const rowSelection = this.gridOptions.rowSelection;
    const hasMultipleSelection =
      (typeof rowSelection === 'string' && rowSelection === 'multiple') || (typeof rowSelection === 'object' && rowSelection?.mode === 'multiRow');

    // Afficher le bouton par défaut si la sélection multiple est activée
    if (hasMultipleSelection) {
      this.displayDeleteSelectedButton = true;
    }

    // Parcours les colonnes pour voir s'il faut afficher des boutons
    this.columnDefs.forEach((columnDef: ColDef) => {
      // Configure la popup de suppression
      if (columnDef.cellRendererParams?.deleteModal) {
        this.deleteModal = columnDef.cellRendererParams.deleteModal;
        this.messages = columnDef.cellRendererParams.messages;
        this.idsLabel = columnDef.cellRendererParams.idsLabel;
        this.idsLabelSeparator = columnDef.cellRendererParams.idsLabelSeparator || '';
      }
    });
  }

  isEnableButton(): boolean {
    const selectedRows = this.gridApi?.getSelectedRows() ?? [];
    return selectedRows.length > 1;
  }

  isEnableCompleteButton(): boolean {
    return this.gridApi?.getSelectedNodes()?.length == 1;
  }

  /**
   * Met à jour la ligne TOTAL après un filtrage
   */
  displayTotalPinnedRow() {
    if (this.gridApi.getDisplayedRowCount() === 0) {
      this.gridApi.setGridOption('pinnedBottomRowData', []);
    } else {
      const pinnedBottomData = this.tableauService.generatePinnedBottomRow(this.gridApi, this.gridColumnApi, this.total.labelId, this.total.valuesId);
      this.gridApi.setGridOption('pinnedBottomRowData', [pinnedBottomData]);
    }
  }

  /**
   * Sauvegarde la configuration par défaut des colonnes si la configuration est possible
   * Charge la configuration utilisateur des colonnes si elle existe
   */
  handleColConfiguration() {
    if (this.displayColumnsConfiguration) {
      this.defaultColConfiguration = this.columnsConfigurationService.getColConfiguration(this.gridApi);
    }

    if (this.userColConfiguration) {
      this.columnsConfigurationService.loadUserColConfiguration(this.gridApi, this.gridColumnApi, this.userColConfiguration);
    }
  }

  /**********************/
  /**     EDITION      **/
  /**********************/

  /**
   * Commence l'édition d'une ligne
   */
  startEditing(rowId?: number) {
    // Sauvegarde les données avant édition
    this.gridApi.forEachNode((row: InternalRowNode) => {
      this.dataBeforeEdition.push({ ...row.data });
      // Ajoute une map à la ligne pour les erreurs de formulaire des cellules
      row.formErrors = new Map();
    });

    // Duplique la ligne sélectionnée en cas d'ajout
    if (this.newRowAdded && this.gridApi.getSelectedRows().length == 1) {
      this.copyValues(this.gridApi.getDisplayedRowAtIndex(0), this.gridApi.getSelectedRows()[0]);
    }

    this.isEditing = true;

    // Active le mode édition des cellules
    this.tableauModifiableService.turnEditionOn(this.gridOptions, this.gridApi, this.gridColumnApi, rowId, this.newRowAdded);
  }

  // Duplication
  copyValues(targetRowNode: IRowNode, sourceObject: any): void {
    let targetObject = targetRowNode.data;
    Object.keys(sourceObject).forEach(key => {
      // ne copier pas les éléments reservés au tableau
      if (!Object.values(TABLEAU_COL_ID_RESERVE).some(e => e === key)) {
        // Parcours les colonnes pour voir des actions particulières
        this.gridApi.getColumnDefs().forEach((columnDef: ColDef) => {
          if (key === columnDef.colId) {
            // Acitve le Callback onCellValueChanged si changeDetectionOnDuplication est vrai
            if (columnDef.cellRendererParams?.changeDetectionOnDuplication) {
              targetRowNode.setDataValue(key, sourceObject[key]);
            }
          }
        });
        // copy value
        targetObject[key] = sourceObject[key];
      }
    });
  }

  /**
   * Gère l'affichage des erreurs si il y en a
   */
  saveOrCancelEdition(cancel = false): void {
    if (cancel) {
      // En cas d’annulation de l’ajout, restore les tris et les filtres
      this.newRowAdded && this.restoreSortAndFilters();
      // service to remove disable filters
      this.filterSharedDataService.updateData(false);
      this.closeAllExpandedRows();
      this.cancelEdition.emit();
    }

    // Active l'affichage des erreurs uniquement quand on envoie une sauvegarde
    if (!cancel) {
      this.gridApi?.forEachNode((row: InternalRowNode) => {
        (row as any).forceShowFormErrors = true;
      });
    }

    // Vérifie si il y a des erreurs
    const stopEdition = this.tableauErrorsService.checkErrors(cancel, this.gridApi, !!this.asynchronousErrors$, this.saveEdition);

    // Nettoyage du flag quel que soit le résultat
    if (!cancel) {
      this.gridApi?.forEachNode((row: InternalRowNode) => {
        delete (row as any).forceShowFormErrors;
      });
    }

    if (stopEdition) {
      this.stopEditing(cancel);
    }
  }

  closeAllExpandedRows(): void {
    this.gridApi.forEachNodeAfterFilterAndSort(rowNode => {
      if (rowNode.expanded) {
        // Close the expanded row
        this.gridApi.getRowNode(rowNode.id).setExpanded(false);
      }
    });
  }

  /**
   * Modification en masse
   */
  updateRowsSelected() {
    const selectedNodes = this.gridApi.getSelectedNodes();
    const indexListToUpdate: number[] = [];

    selectedNodes.forEach((node: RowNode) => {
      indexListToUpdate.push(node.rowIndex);
    });
    this.updateRows.emit(selectedNodes);
  }

  /**
   * Ajout en masse
   */
  openPopup(mode: string) {
    const selectedNodes = this.gridApi.getSelectedNodes();
    const indexListToUpdate: number[] = [];

    selectedNodes.forEach((node: RowNode) => {
      indexListToUpdate.push(node.rowIndex);
    });
    if (mode == 'add') {
      this.addGroup.emit({ selectedNodes: selectedNodes, mode: mode });
    } else if (mode == 'edit') {
      this.updateRows.emit({ selectedNodes: selectedNodes, mode: mode });
    } else if (mode == 'complete') {
      this.completeRow.emit({ selectedNodes: selectedNodes, mode: mode });
    } else if (mode == 'compare') {
      this.compareEvent.emit({ selectedNodes: selectedNodes, mode: mode });
    } else if (mode == 'valider') {
      this.validerEvent.emit({ selectedNodes: selectedNodes, mode: mode });
    }
  }

  // open popup to search
  openSearchModal(isOpen: boolean) {
    this.openSearch.emit(isOpen);
  }
  /**
   * Arrête l'édition d'une ligne
   */
  stopEditing(cancel: boolean): void {
    this.isEditing = false;
    this.disableSaveForAsyncErrors = false;

    // Supprime la ligne ajoutée en cas d'annulation
    this.tableauModifiableService.deleteRowIfNecessary(this.gridApi, cancel, this.newRowAdded);

    this.gridApi.forEachNode((row: InternalRowNode, index: number) => {
      // Restitue les données en cas d'annulation
      if (cancel && !this.newRowAdded) {
        row.setData(this.dataBeforeEdition[index]);
      }

      // Met à 0 les erreurs et mise à jour
      row.asyncErrors = null;
      row.formErrors = null;
      row.updated = null;
    });

    // Met à jour la ligne total après édition
    if (this.total) {
      this.displayTotalPinnedRow();
    }
    // Désactive le mode édition des cellules
    this.tableauModifiableService.turnEditionOff(this.gridOptions, this.gridApi, this.gridColumnApi);

    this.newRowAdded = false;
    this.dataBeforeEdition = [];

    // Informe que les données ont été modifiée
    // this.gridApi.dispatchEvent({type: 'tableDataUpdated'});
    this.gridApi.dispatchEvent({ type: 'rowDataUpdated' });

    // service to remove disable filters
    this.filterSharedDataService.updateData(false);
    this.closeAllExpandedRows();
  }

  /**
   * Ajoute une ligne
   */
  addRow(): void {
    // initialiser observable selectData avect un tableau vide si l'attribut initWithNoData est vrai
    this.gridApi.getColumnDefs().forEach((columnDef: ColDef) => {
      columnDef.cellRendererParams?.selectData && columnDef.cellRendererParams?.initWithNoData && columnDef.cellRendererParams?.selectData.next([]);
    });

    if (this.enableAddButton == AddType.MODAL) {
      this.addEvent.emit(true);
    } else if (this.enableAddButton == AddType.INLINE_ROW) {
      // Sauvegarder les tris ET les filtres
      this.saveSortAndFilters();
      // Réinitialiser les tris ET les filtres AVANT l'ajout de la ligne
      this.resetSortAndFilters();
      // isEditing va passer à true via l'appel de startEditing depuis l'observable dans la fonction tableauModifiableService.addRow
      this.newRowAdded = true;
      const cellId = this.tableauModifiableService.addRow(this.gridApi, this.pushNewRows);
      this.startEditing(cellId);
    }
  }

  private saveSortAndFilters() {
    if (this.gridApi) {
      this.gridColumnState = this.gridApi.getColumnState();
      this.gridFilterModel = this.gridApi.getFilterModel();
    }
  }

  private restoreSortAndFilters() {
    if (this.gridApi) {
      if (this.gridColumnState) {
        // restore les tris
        this.gridApi.applyColumnState({
          state: this.gridColumnState,
          applyOrder: true,
        });
      }

      if (this.gridFilterModel) {
        // restore les filtres
        this.gridApi.setFilterModel(this.gridFilterModel);
      }
    }
  }

  private resetSortAndFilters(): void {
    if (this.gridApi) {
      // Réinitialise les tris
      this.gridApi.applyColumnState({
        state: [],
        defaultState: { sort: null },
      });

      // Réinitialise tous les filtres
      this.gridApi.setFilterModel(null);

      this.gridApi.refreshHeader();

      // Alternative : force le rafraîchissement de toutes les cellules
      this.gridApi.refreshCells({ force: true });
    }
  }

  /**
   * Supprime toutes les lignes sélectionnées
   */
  deleteAllSelected(): void {
    const rowIdOrRowIdList: string[] = this.gridApi.getSelectedNodes().map((node: RowNode) => node.id);
    this.tableauModifiableService.deleteRow(
      this.gridApi,
      rowIdOrRowIdList,
      this.deleteRows,
      this.deleteModal,
      this.messages,
      this.idsLabel,
      this.idsLabelSeparator
    );
  }

  /****************************/
  /**   ERREURS ASYNCHRONES  **/
  /****************************/

  /**
   * Gestion des erreurs asynchrones
   */
  handleAsynchronousErrors(): void {
    // Gestion des erreurs asynchrones
    this.subscriptions.push(
      this.asynchronousErrors$?.pipe(filter(value => value !== null)).subscribe((errors: Map<number, TableAsynchronousError[]>) => {
        if (errors.size > 0) {
          // Si il y a des erreurs retournées, alors on les affiche
          this.tableauErrorsService.displayAsynchronousErrors(this.gridApi, errors);
          this.disableSaveForAsyncErrors = true;
        } else {
          // Sinon, on peut arrêter l'édition
          this.stopEditing(false);
        }
      })
    );

    this.onFormEditionStartedFn = this.onFormEditionStarted.bind(this);
    this.gridApi.addEventListener('cellEditingStarted', this.onFormEditionStartedFn);
  }

  /**
   * Après une édition, vérifie le status du formulaire pour changer le status du bouton
   * Cela ne concerne uniquement les erreurs asynchrones
   */
  onFormEditionStarted(): void {
    if (this.disableSaveForAsyncErrors) {
      this.disableSaveForAsyncErrors = this.tableauErrorsService.checkIfHasAsyncErrors(this.gridApi);
    }
  }

  /**
   * Envoi un évenement au composant parent pour export excel
   */
  exportAsExcelStart() {
    this.exportAsExcel.emit({ type: 'exportAsExcel' });
  }

  /**
   * Envoi un évenement au composant parent pour export PDF
   */
  exportAsPDFStart() {
    this.exportAsPDF.emit({ type: 'exportAsPDF' });
  }

  /**
   * Ouvre une modale de configuration des colonnes
   */
  configureColumns(): void {
    this.columnsConfigurationService.configureColumns(this.gridApi, this.gridColumnApi, this.defaultColConfiguration, this.configurationUpdated);
  }

  /**
   * informe que les donnée sont mis a jours ou filtré
   * @param event
   */
  modelUpdated(event: ModelUpdatedEvent<any>) {
    let rowData = [];
    this.gridApi.forEachNodeAfterFilter(node => rowData.push(node.data));

    let rowData2 = [];
    event.api.forEachNodeAfterFilter(node => rowData2.push(node.data));

    // let t = event.api.getModel()
    // TODO deprecated, use grid API methods listed in Accessing Data.
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription?.unsubscribe());
    if (this.gridApi) {
      this.gridApi.removeEventListener('cellEditingStarted', this.onFormEditionStartedFn);
    }
    this.notesService.removeAllStatic();
    this.filterSharedDataService.updateData(false);
  }
}
