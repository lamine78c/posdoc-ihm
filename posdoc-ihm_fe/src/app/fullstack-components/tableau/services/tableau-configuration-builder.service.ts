import { Injectable } from '@angular/core';
import { DetailsParamDistrComponent } from '@app/admin/fabrication/parametre-distribution/details-param-distr/details-param-distr.component';
import { DetailsComponent } from '@app/admin/fabrication/ressource/details/details.component';
import {
  ColDef,
  ColumnResizedEvent,
  FilterModifiedEvent,
  GridApi,
  GridOptions,
  GridSizeChangedEvent,
  RowClassParams,
  RowGroupOpenedEvent,
  SuppressKeyboardEventParams,
} from 'ag-grid-community';
import { ActionRendererDeleteComponent } from '../ag-grid-components/action-renderer-delete/action-renderer-delete.component';
import { ActionRendererEditComponent } from '../ag-grid-components/action-renderer-edit/action-renderer-edit.component';
import { ColumnHeaderComponent } from '../ag-grid-components/column-header/column-header.component';
import { DateFilterComponent } from '../ag-grid-components/date-filter/date-filter.component';
import { DateRendererComponent } from '../ag-grid-components/date-renderer/date-renderer.component';
import { InputEditorComponent } from '../ag-grid-components/input-editor/input-editor.component';
import { InputFilterComponent } from '../ag-grid-components/input-filter/input-filter.component';
import { InterrupteurRadioComponent } from '../ag-grid-components/interrupteur-radio/interrupteur-radio.component';
import { ListFloatingFilterComponent } from '../ag-grid-components/list-floating-filter/list-floating-filter.component';
import { TextTooltipRendererComponent } from '../ag-grid-components/text-tooltip-renderer/text-tooltip-renderer.component';
import { ActionRendererClearFilterComponent } from '../ag-grid-components/action-renderer-clear-filter/action-renderer-clear-filter.component';
import { ComboboxComponent } from '@app/fullstack-components/tableau/ag-grid-components/combobox/combobox.component';
import { MultiSelectHierarchiseeFloatingFilterComponent } from '../ag-grid-components/multi-select-hierarchisee-floating-filter/multi-select-hierarchisee-floating-filter.component';
import { MultiSelectFloatingFilterComponent } from '../ag-grid-components/multi-select-floating-filter/multi-select-floating-filter.component';
import { ActionRendererEditPopupComponent } from '../ag-grid-components/action-renderer-edit-popup/action-renderer-edit-popup.component';
import { ActionRendererUploadFileComponent } from '@app/fullstack-components/tableau/ag-grid-components/action-renderer-upload-file/action-renderer-upload-file.component';
import { environment } from '../../../../environments/environment';
import { ActionRendererResetComponent } from '../ag-grid-components/action-renderer-reset/action-renderer-reset.component';
import { CheckboxComponent } from '@app/shared/components/checkbox/checkbox.component';
import { ActionRendererAddExemplaireComponent } from '../ag-grid-components/action-renderer-add-exemplaire/action-renderer-add-exemplaire/action-renderer-add-exemplaire.component';

@Injectable({
  providedIn: 'root',
})
export class TableauConfigurationBuilderService {
  lastUnpinnedFromLeft = true;

  /**
   * Normalise une chaîne pour le tri en supprimant les accents,
   * en convertissant en minuscules et en supprimant les espaces superflus
   */
  private normalizeStringForSort(str: string): string {
    if (!str) return '';
    return str
      .normalize('NFD') // Décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprime les marques d'accent
      .toLowerCase()
      .trim();
  }

  /**
   * Comparateur personnalisé pour un tri alphabétique robuste
   * Gère les accents, la casse, les caractères spéciaux et les nombres
   */
  private customStringComparator = (valueA: any, valueB: any): number => {
    // Si l'une des valeurs est nulle ou undefined
    if (valueA == null && valueB == null) {
      return 0;
    }
    if (valueA == null) {
      return -1;
    }
    if (valueB == null) {
      return 1;
    }

    // Si c'est du texte, normaliser et comparer
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      const normalizedA = this.normalizeStringForSort(valueA);
      const normalizedB = this.normalizeStringForSort(valueB);

      return normalizedA.localeCompare(normalizedB, 'fr', {
        numeric: true, // Pour gérer les nombres dans les chaînes (ex: "Item 2" vs "Item 10")
        sensitivity: 'base' // Ignore la casse et les accents
      });
    }

    // Pour les nombres
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return valueA - valueB;
    }

    // Pour les dates
    if (valueA instanceof Date && valueB instanceof Date) {
      return valueA.getTime() - valueB.getTime();
    }

    // Pour les autres types, convertir en string et comparer
    const strA = String(valueA);
    const strB = String(valueB);
    const normalizedA = this.normalizeStringForSort(strA);
    const normalizedB = this.normalizeStringForSort(strB);

    return normalizedA.localeCompare(normalizedB, 'fr', {
      numeric: true,
      sensitivity: 'base'
    });
  };

  // configuration des colonnes par défaut
  defaultColDef: ColDef = {
    // permet d'afficher l'icône de tri par défaut sur les colonnes
    unSortIcon: true,
    // permet de supprimer le menu de configuration des colonnes
    // suppressMenu: true,
    // TODO aG Grid a déprécié suppressMenu au profit de menuTabs, notamment v29 à v33+
    // permet de supprimer le bouton de filtrage
    floatingFilterComponentParams: { suppressFilterButton: true },
    // Active le tri par défaut
    sortable: true,
    // Authorise le resize par défaut
    resizable: true,
    // Supprime les filtres par défaut
    filter: false,
    // Supprime l'icon de filtres
    suppressFloatingFilterButton: true,
    // Authorise le drag and drop sur les colonnes
    suppressMovable: false,
    // Ordre de tri personnalisé
    sortingOrder: ['asc', 'desc', null],
    // Comparateur personnalisé pour toutes les colonnes
    comparator: this.customStringComparator,
    suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
      // Supprime l'utilisation des flèches dans le tableau pendant l'édition
      const keysToSuppress = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
      const isEditing = params.colDef.cellRendererParams?.isEditing;
      if (isEditing && keysToSuppress.indexOf(params.event.key) >= 0) {
        return true;
      }

      // Autorise le ctrl + a en édition en supprimant le comportement prévu par ag grid
      if (isEditing && params.event.key === 'a' && params.event.ctrlKey) {
        return true;
      }

      // Autorise les opérations de presse-papiers (Ctrl+V, Ctrl+C, Ctrl+X) en édition
      // en supprimant le comportement ag-grid et laissant l'événement natif fonctionner
      if (isEditing && (params.event.ctrlKey || params.event.metaKey)) {
        const clipboardKeys = ['v', 'c', 'x', 'V', 'C', 'X'];
        if (clipboardKeys.indexOf(params.event.key) >= 0) {
          return true;
        }
      }

      return false;
    },
  };

  // Composants "maison" pour le tableau
  frameworkComponents = {
    dateRenderer: DateRendererComponent,
    agColumnHeader: ColumnHeaderComponent,
    actionRendererEdit: ActionRendererEditComponent,
    actionRendererEditPopup: ActionRendererEditPopupComponent,
    actionRendererDelete: ActionRendererDeleteComponent,
    actionRendererReset: ActionRendererResetComponent,
    actionRendererClearFilter: ActionRendererClearFilterComponent,
    actionRendererUploadFile: ActionRendererUploadFileComponent,
    actionRendererAddExemplaire: ActionRendererAddExemplaireComponent,
    agDateInput: DateFilterComponent,
    listFloatingFilter: ListFloatingFilterComponent,
    multiSelectFloatingFilter: MultiSelectFloatingFilterComponent,
    multiSelectHierarchiseeFloatingFilter: MultiSelectHierarchiseeFloatingFilterComponent,
    inputFilter: InputFilterComponent,
    textTooltipRenderer: TextTooltipRendererComponent,
    inputEditorComponent: InputEditorComponent,
    comboboxComponent: ComboboxComponent,
    detailsComponent: DetailsComponent,
    detailsParamDistrComponent: DetailsParamDistrComponent,
    interrupteurRadioComponent: InterrupteurRadioComponent,
    checkboxComponent: CheckboxComponent,
  };

  // eslint-disable-next-line max-lines-per-function
  createGridConfiguration(permission: boolean = false, tableFrameworkComponents?: any): GridOptions {
    return {
      rowSelection: permission ? { mode: 'multiRow', selectAll: 'filtered', groupSelects: 'filteredDescendants' } : 'single',
      selectionColumnDef: permission ? this.getSelectionColDef() : undefined,
      // Option pour redimentionner automatiquement la hauteur du tableau
      // domLayout: 'autoHeight',
      defaultColDef: this.defaultColDef,
      pagination: true,
      theme: 'legacy',
      paginationPageSize: environment.paginationPageSize,
      paginationAutoPageSize: false,
      suppressPaginationPanel: true,
      suppressScrollOnNewData: true,
      cellSelection: false,
      alwaysShowHorizontalScroll: false,
      // Configuration pour un tri insensible à la casse et aux accents sur toutes les colonnes texte
      accentedSort: true,
      // RÉTROCOMPATIBILITÉ renommer frameworkComponents en components
      components: tableFrameworkComponents ? tableFrameworkComponents : this.frameworkComponents,
      onFirstDataRendered: this.onFirstDataRendered,
      rowHeight: 32,
      floatingFiltersHeight: 32,
      // Supprime le menu clic droit
      suppressContextMenu: true,
      // Active les tableaux imbriqués
      masterDetail: false,
      // Hauteur automatique pour les tableaux imbriqués
      detailRowAutoHeight: true,
      singleClickEdit: false,
      suppressClickEdit: true,
      // Affichage du tooltip direct
      tooltipShowDelay: 0,
      // N'arrête pas l'édition quand on clique hors du tableau
      // stopEditingWhenGridLosesFocus: false, // use stopEditingWhenCellsLoseFocus instead.
      stopEditingWhenCellsLoseFocus: false,
      // Supprime le warning : ag-grid: invalid colDef property 'enableCollapsing'
      // enableCollapsing étant utilisé par un composant custom

      // TODO deprecated without replacement. Previously used for adding user properties in gridOptions and columnDefs. Now, use the context property in both for storing arbitrary metadata.
      // suppressPropertyNamesCheck: true,

      onFilterModified: (event: FilterModifiedEvent) => {
        // Après un filtre ne retournant pas de résultat, l'overlay noRows n'est pas trigger
        // On le trigger donc manuellement ici si besoin
        if (event.api.getDisplayedRowCount() === 0) {
          event.api.showNoRowsOverlay();
        } else {
          event.api.hideOverlay();
        }
      },
      getRowStyle: params => {
        if (params.node.rowPinned) {
          return { 'font-weight': 'bold' };
        }
      },
      rowClassRules: {
        // Pour les rows dynamiquements créées pendant une édition (au scroll par exemple)
        'pointer-events-none': (params: RowClassParams) => {
          if (params.api.getEditingCells().length > 0 && params.api.getEditingCells()[0].rowIndex !== params.rowIndex) {
            return true;
          }

          return false;
        },
      },
      onRowGroupOpened: (event: RowGroupOpenedEvent) => {
        // Désactivation de l'option d'actualisation de l'en-tête car elle affecte les filtres à choix multiples
        // Met à jour le header lorsque des rows sont ouvertes/fermées
        // event.api.refreshHeader();
      },
      onGridSizeChanged: (event: GridSizeChangedEvent) => {
        // Évite l'apparition d'une scrollbar dans le tableau lorsque la taille de la fenêtre change
        event.api.sizeColumnsToFit();
        event.api.dispatchEvent({ type: 'gridOrColumnResized' });
      },
      onColumnResized: (event: ColumnResizedEvent) => {
        event.api.dispatchEvent({ type: 'gridOrColumnResized' });
      },
      processUnpinnedColumns: this.processUnpinnedColumns.bind(this),
    };
  }

  // Permet de redimensionner les colonnes pour que le tableau occupe toute la place disponible
  onFirstDataRendered(params): void {
    params.api.sizeColumnsToFit();
  }

  private getSelectionColDef(): ColDef {
    return {
      headerName: 'clearFilter',
      maxWidth: 35,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'actionRendererClearFilter',
    };
  }

  /**
   * Mettre à jour les gridOptions ET forcer AG-Grid à les utiliser
   * @param gridApi
   */
  getNoDataMessage(gridApi: GridApi) {
    gridApi.setGridOption('overlayNoRowsTemplate', '<b>Aucune donnée disponible pour cette recherche</b>');
    gridApi.showNoRowsOverlay();
  }

  /**
   * This method Allow pinned columns to unpin due to limited space from right to left instead of left to right
   * @param params
   * @private
   */
  private processUnpinnedColumns(params): any[] {
    const pinnedLeft = params.api.getDisplayedLeftColumns();
    const pinnedRight = params.api.getDisplayedRightColumns();
    let unpinningColumns;

    if (pinnedLeft.length > 0 && pinnedRight.length > 0) {
      // Alterner
      if (!this.lastUnpinnedFromLeft) {
        unpinningColumns = [pinnedLeft[pinnedLeft.length - 1]];
      } else {
        unpinningColumns = [pinnedRight[0]];
      }
    } else if (pinnedLeft.length === 0) {
      unpinningColumns = [pinnedRight[0]];
    } else if (pinnedRight.length === 0) {
      unpinningColumns = [pinnedLeft[pinnedLeft.length - 1]];
    }

    this.lastUnpinnedFromLeft = !this.lastUnpinnedFromLeft;
    return unpinningColumns;
  }

  /**
   * Adapte la largeur minimale d'une colonne en fonction de la taille de la fenêtre
   * @param column
   */
  adaptMinWidth(column: ColDef): ColDef {
    if (window.innerWidth <= 1024) {
      return {
        ...column,
        minWidth: Math.min(column.minWidth || 100, 35),
      };
    }
    return column;
  }
}
