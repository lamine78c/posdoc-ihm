import { EventEmitter, Injectable } from '@angular/core';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, GridApi, GridOptions, RowNode } from 'ag-grid-community';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { StartEditingTable } from '../models/tableau.models';

@Injectable({
  providedIn: 'root',
})
export class TableauModifiableService {
  // Position du cursor au cours d'une édition
  cursorPosition: number = null;

  private isSomeChangeNotSubmited$ = new BehaviorSubject<boolean>(false);

  constructor(
    private modalService: NgbModal,
    private filterSharedDataService: FilterSharedDataService,
    private changeNotSubmitedConfirmationService: PopupConfirmationService
  ) {}

  // Observable permettant de gérer le status de l'édition
  private startEditingSubject$: BehaviorSubject<StartEditingTable> = new BehaviorSubject(null);

  setIsSomeChangeNotSubmited(state: boolean): void {
    this.isSomeChangeNotSubmited$.next(state);
  }

  getIsSomeChangeNotSubmited(): boolean {
    return this.isSomeChangeNotSubmited$.getValue();
  }

  /**
   * Met à jour l'observable
   */
  startEditing(uniqueKey: string, rowId?: number): void {
    this.startEditingSubject$.next({ id: uniqueKey, rowId });
  }

  /**
   * Retourne l'observable sans sa valeur initiale (null)
   */
  onStartEditing(uniqueKey: string): Observable<StartEditingTable> {
    return this.startEditingSubject$.pipe(filter((value: StartEditingTable) => value?.id === uniqueKey));
  }

  /**
   * Active l'édition sur les cellules depuis cellRendererParams
   */
  turnEditionOn(gridOptions: GridOptions, gridApi: GridApi, gridColumnApi: GridApi, rowId: number, newRowAdded: boolean): void {
    // losqu'on clique sur modifier, on ouvre gille détail.
    gridApi.forEachNode(e => {
      (e as any).__objectId == rowId ? e.setExpanded(true) : e.setExpanded(false);
    });

    // on passe isEditing a true pour la grille details
    if (gridOptions.detailCellRendererParams) {
      gridOptions.detailCellRendererParams.isEditing = true;
      gridOptions.detailCellRendererParams.rowIdEdit = rowId;
      gridOptions.detailCellRendererParams.newRowAdded = newRowAdded;
    }

    // on passe isEditing a true pour la grille master
    gridColumnApi.getAllDisplayedColumns().forEach(column => {
      const columnDefinition: ColDef = column.getColDef();
      if (columnDefinition.cellRendererParams) {
        columnDefinition.cellRendererParams.isEditing = true;
        columnDefinition.cellRendererParams.rowIdEdit = rowId;
        columnDefinition.cellRendererParams.newRowAdded = newRowAdded;
      }
    });

    gridApi.redrawRows();
  }

  /**
   * Désactive l'édition sur les cellules depuis cellRendererParams
   */
  turnEditionOff(gridOptions: GridOptions, gridApi: GridApi, gridColumnApi: GridApi): void {
    if (gridOptions.detailCellRendererParams) {
      gridOptions.detailCellRendererParams.isEditing = false;
      gridOptions.detailCellRendererParams.rowIdEdit = -1;
    }

    gridColumnApi.getAllDisplayedColumns().forEach(column => {
      const columnDefinition: ColDef = column.getColDef();
      if (columnDefinition.cellRendererParams) {
        columnDefinition.cellRendererParams.isEditing = false;
        columnDefinition.cellRendererParams.rowIdEdit = -1;
      }
    });

    gridApi.redrawRows();
  }

  /**
   * Supprime une ou plusieurs lignes
   */
  deleteRow(
    gridApi: GridApi,
    rowIdOrRowIdList: string | string[],
    deleteRows?: EventEmitter<any>,
    modal?: any,
    messages?: string[],
    idsLabel?: string[],
    idsLabelSeparator: string = ''
  ): void {
    const isSomeChangeNotSubmited = this.getIsSomeChangeNotSubmited();
    // Récupère les lignes à supprimer
    const rowsToDelete = [];
    const rowsIdsToDelete = [];
    // Dans le cas où l'on veut supprimer plusieurs lignes
    if (Array.isArray(rowIdOrRowIdList)) {
      rowIdOrRowIdList.forEach(id => {
        if (gridApi.getRowNode(id)) {
          rowsToDelete.push(gridApi.getRowNode(id).data);
          rowsIdsToDelete.push(gridApi.getRowNode(id).id);
        }
      });
    } else {
      // Dans le cas où l'on veut supprimer qu'une ligne 249
      rowsToDelete.push(gridApi.getRowNode(rowIdOrRowIdList).data);
      rowsIdsToDelete.push(gridApi.getRowNode(rowIdOrRowIdList).id);
    }

    if (modal) {
      if (isSomeChangeNotSubmited) {
        this.changeNotSubmitedConfirmationService.askConfirmation().subscribe(confirmed => {
          if (confirmed) {
            this.deleteRowsModal(modal, rowsIdsToDelete, messages, idsLabel, idsLabelSeparator, rowsToDelete, deleteRows);
          }
        });
      } else {
        this.deleteRowsModal(modal, rowsIdsToDelete, messages, idsLabel, idsLabelSeparator, rowsToDelete, deleteRows);
      }
    } else {
      // Supprime la ligne
      gridApi.applyTransaction({ remove: rowsToDelete });
      // Informe que les données ont été modifiée
      // gridApi.dispatchEvent({type: 'tableDataUpdated'});
      gridApi.dispatchEvent({ type: 'rowDataUpdated' });

      // Redraw les lignes afin de prendre en compte la ligne supprimée
      gridApi.redrawRows();
    }
  }

  private deleteRowsModal(
    modal: any,
    rowsIdsToDelete: any[],
    messages: string[],
    idsLabel: string[],
    idsLabelSeparator: string,
    rowsToDelete: any[],
    deleteRows: EventEmitter<any>
  ) {
    const modalRef = this.modalService.open(modal);
    modalRef.componentInstance.rowDataArray = rowsIdsToDelete;
    modalRef.componentInstance.messages = messages;
    modalRef.componentInstance.idsLabel = idsLabel;
    modalRef.componentInstance.idsLabelSeparator = idsLabelSeparator;
    modalRef.componentInstance.rowsToDelete = rowsToDelete.filter(row => !row.isNotAuthorisedToBeDeleted);
    modalRef.componentInstance.rowsNotAuthorisedToBeDeleted = rowsToDelete.filter(row => row.isNotAuthorisedToBeDeleted ?? false);
    modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
      if (numButton === NUM_FIRST_BTN_MODAL) {
        deleteRows.emit(rowsToDelete.filter(row => !row.isNotAuthorisedToBeDeleted));
      }
    });
  }

  /**
   * Ajoute une ligne au début du tableau
   */
  addRow(gridApi: GridApi, pushNewRows: boolean): number {
    // service to disable sort btn
    this.filterSharedDataService.updateData(true);

    if (pushNewRows) {
      gridApi.paginationGoToLastPage();
    } else {
      gridApi.paginationGoToFirstPage();
    }

    // Récupère le model de la ligne
    const columnDefs = gridApi.getColumnDefs();
    const row: any = {};
    const index = pushNewRows ? gridApi.getDisplayedRowCount() : 0;

    // Crée une nouvelle ligne à partir du model en l'initialisant à null
    columnDefs.forEach((columnDef: ColDef) => {
      // elle ne peut pas afficher malgré un filtre actif
      row[columnDef.field] = null;
    });
    row.newRow = true;

    // Ajoute la ligne et met à jour les données
    const rowNodeTransaction = gridApi.applyTransaction({ add: [row], addIndex: index });

    // Redraw les lignes afin d'avoir la ligne ajoutée
    gridApi.redrawRows();

    // Retourne l'id de la nouvelle ligne
    return (rowNodeTransaction.add[0] as any).__objectId;
  }

  /**
   * Supprime la ligne ajoutée en cas d'annulation
   */
  deleteRowIfNecessary(gridApi: GridApi, cancel: boolean, newRowAdded: boolean): void {
    if (cancel && newRowAdded) {
      let nodeToDelete: RowNode | null = null;
      // retrouve la ligne à supprimer avec la clé newRow
      gridApi.forEachNode((node: RowNode) => {
        if (node.data?.newRow) {
          nodeToDelete = node;
        }
      });

      if (nodeToDelete) {
        this.deleteRow(gridApi, nodeToDelete.id);
      }
    }
  }
}
