import { EventEmitter, Injectable } from '@angular/core';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { GridApi } from 'ag-grid-community';
import { InternalRowNode, TableAsynchronousError } from '../models/tableau.models';

@Injectable({
  providedIn: 'root',
})
export class TableauErrorsService {
  constructor(private notesService: NotesService) {}

  /**
   * Vérifie si le formulaire des lignes en erreur
   * En cas d'erreurs (formulaire ou asynchrones), la sauvegarde n'est pas possible
   * Sinon sauvegarde ou annule l'édition
   */
  checkErrors(cancel: boolean, gridApi: GridApi, handleAsyncErrors: boolean, saveEdition: EventEmitter<any>): boolean {
    let stopEdition = false;
    this.notesService.removeAllStatic();

    if (!cancel) {
      // Vérifie s'il y a des erreurs dans les lignes
      const hasError = this.checkRowsValidities(gridApi, handleAsyncErrors, saveEdition);
      if (!hasError && !handleAsyncErrors) {
        stopEdition = true;
      } else {
        // Force l'affichage des erreurs (notamment dans le cas d'un ajout de ligne)
        gridApi.dispatchEvent({ type: 'rowDataUpdated' });
      }
    } else {
      // Sinon on peut arrêter l'édition
      stopEdition = true;
    }

    return stopEdition;
  }

  /**
   * Vérifie s'il y a des erreurs dans les lignes
   * Vérifie dans un premier temps les erreurs formulaire (formErrors)
   * Si il y en a pas et que le composant parent souhaite vérifier les erreurs asynchrone (présence de handleAsyncErrors)
   * alors envoie au composant parent les lignes modifiées pour vérification
   */
  checkRowsValidities(gridApi: GridApi, handleAsyncErrors: boolean, saveEdition: EventEmitter<any>): any {
    const toSend: Map<number, any> = new Map();
    let pagesWithErrors: number[] = [];

    // Parcours toues les lignes
    gridApi.forEachNode((row: InternalRowNode) => {
      // Vérifie s'il y a des erreurs de formulaire
      row.formErrors?.forEach((error: boolean) => {
        if (error) {
          pagesWithErrors = this.getPagesWithErrors(row, gridApi, pagesWithErrors);
        }
      });

      // Récupère les données ayant étaient modifiées
      if (row.updated) {
        const rowData = { ...row.data };
        this.removeProperty(rowData, 'isNotAuthorisedToBeDeleted');
        toSend.set(row.__objectId, rowData);
      }
    });

    // Si il y a des erreurs
    if (pagesWithErrors.length > 0) {
      this.navigateToPageIfNecessary(gridApi, pagesWithErrors);
    } else if (handleAsyncErrors) {
      // Affiche un message d'erreur lorsque la modification ou la duplication d'une ligne est soumise sans aucune modification dans les entrées
      !!!toSend.size &&
        this.notesService.showStatic({
          title: "Aucune modification n'est détectée",
          classname: 'note-erreur',
          hideClose: false,
          category: ToastCategoryEnum.ERROR,
        });

      // Cache les messages d'erreur en trop s'il y en a plus d'un
      const notesList: NodeListOf<HTMLElement> = document.querySelectorAll('app-note-statique');
      if (notesList.length > 1) {
        notesList.forEach((note, index) => {
          if (index > 0) {
            note.remove();
          }
        })
      }

      // Envoie au composent parent les données modifiées pour analyse
      saveEdition.emit(toSend);
    }

    return pagesWithErrors.length > 0;
  }

  // Function to remove a property from an object
  removeProperty(obj, prop): void {
    if (obj.hasOwnProperty(prop)) {
      delete obj[prop];
    }
  }

  /**
   * Ajoute les erreurs asynchrones aux différentes lignes, elles seront ensuite affichées par les cellules
   * Affiche une note d'erreur
   */
  displayAsynchronousErrors(gridApi: GridApi, errors: Map<number, TableAsynchronousError[]>, displayNote: boolean = true): void {
    const pagesWithErrors: number[] = [];

    this.navigateToPageIfNecessary(gridApi, pagesWithErrors, true);

    // Affiche une note d'erreur
    if (displayNote) {
      this.notesService.showStatic({
        title: ([...errors][0][1][0].isError ? 'Erreur serveur: ' : '') + [...errors][0][1][0].message,
        classname: [...errors][0][1][0].isError ? 'note-erreur' : 'note-avertissement',
        hideClose: false,
        category: ToastCategoryEnum.ERROR,
      });

      // Cache les messages d'erreur en trop s'il y en a plus d'un
      const notesList: NodeListOf<HTMLElement> = document.querySelectorAll('app-note-statique');
      if (notesList.length > 1) {
        notesList.forEach((note, index) => {
          if (index > 0) {
            note.remove();
          }
        });
      }
    }
  }

  /**
   * Retourne une liste de page contenant des erreurs
   */
  getPagesWithErrors(row: InternalRowNode, gridApi: GridApi, pagesWithErrors: number[]): number[] {
    const pageSize = gridApi.paginationGetPageSize();

    // Si la rowIndex est null, alors cela veut dire qu'elle est masquée par un filtre
    if (row.rowIndex === null) {
      gridApi.setFilterModel(null);
    }

    const rowPage = Math.ceil((row.rowIndex + 1) / pageSize);

    pagesWithErrors.push(rowPage);

    return pagesWithErrors;
  }

  /**
   * Navigue vers une page contenant des erreurs si il n'y en a pas sur la page actuelle
   */
  navigateToPageIfNecessary(gridApi: GridApi, pagesWithErrors: number[], refresh = false): void {
    const currentPage = gridApi.paginationGetCurrentPage() + 1;

    if (pagesWithErrors.indexOf(currentPage) === -1) {
      const pageToGo = pagesWithErrors.find((page: number) => page !== currentPage);
      gridApi.paginationGoToPage(pageToGo - 1);
    } else if (refresh) {
      gridApi.redrawRows();
    }
  }

  /**
   * Vérifie si des lignes sont en erreurs asynchrones
   */
  checkIfHasAsyncErrors(gridApi: GridApi): boolean {
    let hasError = false;

    gridApi.forEachNode((row: InternalRowNode) => {
      if (row.asyncErrors?.size > 0) {
        hasError = true;
      }
    });

    return hasError;
  }
}
