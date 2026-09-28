import { EventEmitter, Injectable } from '@angular/core';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, GridApi } from 'ag-grid-community';
import { take } from 'rxjs/operators';
import { ColonnesConfigPopupComponent } from '../components/colonnes-config-popup/colonnes-config-popup.component';
import { DefaultColConfiguration, UserColConfiguration } from '../models/tableau.models';

@Injectable({
  providedIn: 'root',
})
export class ColumnsConfigurationService {
  constructor(private modalService: NgbModal) {}

  /**
   * Retourne la configuration des colonnes du tableaux
   */
  getColConfiguration(gridApi: GridApi): DefaultColConfiguration {
    let columnsHidden: ColDef[] = [];
    let columnsDisplayed: ColDef[] = [];
    let lockedLeft: number = 0;

    // Récupère les colonnes en fonction de leur état
    gridApi.getColumnDefs().forEach((col: ColDef) => {
      // Ne récupère pas les colonnes avec une position fixe
      if (!col.lockPosition) {
        if (col.hide) {
          columnsHidden.push(col);
        } else {
          columnsDisplayed.push(col);
        }
      } else if (col.lockPosition === 'left') {
        // Compte les colonnes fixées à gauche afin de repositionner correctement les colonnes lors d'un déplacement
        lockedLeft++;

        // Colonne rowGroup non affichée
        if (col.rowGroup) {
          lockedLeft++;
        }
      }
    });

    return { columnsHidden: columnsHidden, columnsDisplayed: columnsDisplayed, lockedLeft: lockedLeft };
  }

  /**
   * Ouvre une modale de configuration des colonnes
   */
  configureColumns(
    gridApi: GridApi,
    gridColumnApi: GridApi,
    defaultColConfiguration: DefaultColConfiguration,
    configurationUpdated: EventEmitter<UserColConfiguration>
  ): void {
    // Récupère la configuration actuelle
    const getColConfiguration = this.getColConfiguration(gridApi);

    // Ouvre la modale et passe les valeurs en paramètres
    const modalRef: NgbModalRef = this.modalService.open(ColonnesConfigPopupComponent);
    modalRef.componentInstance.columnsHidden = getColConfiguration.columnsHidden;
    modalRef.componentInstance.columnsDisplayed = getColConfiguration.columnsDisplayed;
    // Configuration par défaut pour le bouton réinitialisé
    modalRef.componentInstance.defaultColConfiguration = defaultColConfiguration;

    // Écoute la réponse de la modale
    modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
      if (numButton === NUM_FIRST_BTN_MODAL) {
        const columnsToHide: ColDef[] = modalRef.componentInstance.columnsHidden;
        const columnsToDisplay: ColDef[] = modalRef.componentInstance.columnsDisplayed;

        // Affiche/masque et déplace les colonnes en fonction du résultat
        gridColumnApi.setColumnsVisible(
          columnsToDisplay.map(col => col.colId || col.field),
          true
        );
        gridColumnApi.moveColumns(
          columnsToDisplay.map(col => col.colId || col.field),
          getColConfiguration.lockedLeft
        );
        gridColumnApi.setColumnsVisible(
          columnsToHide.map(col => col.colId || col.field),
          false
        );

        // Permet de redimensionner les colonnes pour que le tableau occupe toute la place disponible
        gridApi.sizeColumnsToFit();

        const userColumnsToHide: { colId: string }[] = columnsToHide.map(col => {
          return { colId: col.colId || col.field };
        });
        const userColumnsToDisplay: { colId: string }[] = columnsToDisplay.map(col => {
          return { colId: col.colId || col.field };
        });

        configurationUpdated.emit({ columnsToHide: userColumnsToHide, columnsToDisplay: userColumnsToDisplay });
      }
    });
  }

  /**
   * Charge la configuration des colonnes de l'utilisateur
   * @param gridApi
   * @param gridColumnApi
   * @param userColConfiguration
   */
  loadUserColConfiguration(gridApi: GridApi, gridColumnApi: GridApi, userColConfiguration: UserColConfiguration): void {
    const lockedLeft = this.getLockedLeft(gridApi);

    // Affiche/masque et déplace les colonnes en fonction du résultat
    gridColumnApi.setColumnsVisible(
      userColConfiguration.columnsToDisplay.map(col => col.colId),
      true
    );
    gridColumnApi.moveColumns(
      userColConfiguration.columnsToDisplay.map(col => col.colId),
      lockedLeft
    );
    gridColumnApi.setColumnsVisible(
      userColConfiguration.columnsToHide.map(col => col.colId),
      false
    );

    // Permet de redimensionner les colonnes pour que le tableau occupe toute la place disponible
    gridApi.sizeColumnsToFit();
  }

  /**
   * Retourne ne nombre de colonnes fixées à gauche
   * Utilisé pour le déplacement des colonnes
   * @param gridApi
   * @returns
   */
  private getLockedLeft(gridApi: GridApi): number {
    let lockedLeft: number = 0;

    // Récupère les colonnes en fonction de leur état
    gridApi.getColumnDefs().forEach((col: ColDef) => {
      // Compte les colonnes fixées à gauche afin de repositionner correctement les colonnes lors d'un déplacement
      if (col.lockPosition === 'left') {
        lockedLeft++;

        // Colonne rowGroup non affichée en plus
        if (col.rowGroup) {
          lockedLeft++;
        }
      }
    });

    return lockedLeft;
  }
}
